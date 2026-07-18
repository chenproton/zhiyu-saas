package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/middleware"
	"golang.org/x/crypto/bcrypt"
)

type TenantHandler struct {
	DB *pgxpool.Pool
}

type TenantListResponse struct {
	Items []domain.Tenant `json:"items"`
	Total int             `json:"total"`
}

type CreateTenantRequest struct {
	Name           string  `json:"name"`
	Code           string  `json:"code"`
	LogoURL        *string `json:"logoUrl"`
	Domain         *string `json:"domain"`
	EnterpriseCode *string `json:"enterpriseCode"`
	Contact        *string `json:"contact"`
	Phone          *string `json:"phone"`
	Address        *string `json:"address"`
	Description    *string `json:"description"`
}

type UpdateTenantRequest struct {
	Name           string  `json:"name"`
	LogoURL        *string `json:"logoUrl"`
	Domain         *string `json:"domain"`
	EnterpriseCode *string `json:"enterpriseCode"`
	Contact        *string `json:"contact"`
	Phone          *string `json:"phone"`
	Address        *string `json:"address"`
	Description    *string `json:"description"`
}

type UpdateTenantStatusRequest struct {
	Status domain.TenantStatus `json:"status"`
}

type CreateTenantResponse struct {
	Tenant    domain.Tenant   `json:"tenant"`
	AdminUser *adminUserInfo  `json:"adminUser,omitempty"`
}

type adminUserInfo struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	LoginName string `json:"loginName"`
	Password  string `json:"password"`
}

func (h *TenantHandler) List(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	search := r.URL.Query().Get("search")
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 50
	offset := 0
	if v, err := parseInt(limitStr, 50); err == nil && v > 0 {
		limit = v
	}
	if v, err := parseInt(offsetStr, 0); err == nil && v >= 0 {
		offset = v
	}

	where := []string{"1=1"}
	args := []interface{}{}
	argIdx := 1
	tenantClaims := middleware.CurrentUser(r)
	effectiveTenantID, ok := tenantFilter(tenantClaims)
	if !ok {
		respondError(w, http.StatusForbidden, "missing tenant")
		return
	}
	if effectiveTenantID != "" {
		where = append(where, "id = $"+itoa(argIdx))
		args = append(args, effectiveTenantID)
		argIdx++
	}

	if status != "" {
		where = append(where, "status = $"+itoa(argIdx))
		args = append(args, status)
		argIdx++
	}
	if search != "" {
		where = append(where, "(name ILIKE $"+itoa(argIdx)+" OR code ILIKE $"+itoa(argIdx)+")")
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM tenants WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, name, code, logo_url, domain, enterprise_code, contact, phone, address, description, admin_ids, status, created_at, updated_at
		FROM tenants
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list tenants")
		return
	}
	defer rows.Close()

	items, err := h.scanTenantRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan tenants")
		return
	}

	respondJSON(w, http.StatusOK, TenantListResponse{Items: items, Total: total})
}

func (h *TenantHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	tenant, err := h.fetchTenant(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "tenant not found")
		return
	}
	respondJSON(w, http.StatusOK, tenant)
}

func (h *TenantHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if !canManagePlatform(claims) {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	h.createTenant(w, r)
}

func (h *TenantHandler) createTenant(w http.ResponseWriter, r *http.Request) {
	var req CreateTenantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" || req.Code == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	var codeExists bool
	_ = h.DB.QueryRow(r.Context(),
		`SELECT EXISTS(SELECT 1 FROM tenants WHERE code = $1)`, req.Code,
	).Scan(&codeExists)
	if codeExists {
		respondError(w, http.StatusConflict, "租户标识已存在")
		return
	}

	adminUsername := "admin-" + req.Code
	var loginNameExists bool
	_ = h.DB.QueryRow(r.Context(),
		`SELECT EXISTS(SELECT 1 FROM users WHERE login_name = $1)`, adminUsername,
	).Scan(&loginNameExists)
	if loginNameExists {
		respondError(w, http.StatusConflict, "管理员用户名 " + adminUsername + " 已存在")
		return
	}

	id := uuid.NewString()

	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO tenants (id, name, code, logo_url, domain, enterprise_code, contact, phone, address, description, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
	`, id, req.Name, req.Code, req.LogoURL, req.Domain, req.EnterpriseCode, req.Contact, req.Phone, req.Address, req.Description)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create tenant")
		return
	}

	// 为新租户自动创建默认套餐，避免后续页面报 subscription not found
	if _, err := h.DB.Exec(r.Context(), `
		INSERT INTO subscription_packages (tenant_id, name, valid_until, modules, status)
		VALUES ($1, '默认全功能套餐', NULL, $2, 'active')
	`, id, domain.JSONMap{
		"system":   true,
		"alliance": true,
		"career":   true,
		"course":   true,
		"scene":    true,
		"ability":  true,
		"affairs":  true,
		"ai":       true,
		"resource": true,
		"opc":      true,
		"decision": true,
		"research": true,
	}); err != nil {
		log.Printf("[ERROR] createTenant: failed to insert default subscription package for tenant %s (%s): %v", id, req.Code, err)
	}

	// 为新租户初始化默认组织类型
	_, _ = h.DB.Exec(r.Context(), `
		INSERT INTO org_types (tenant_id, name, category, description)
		VALUES
			($1, '学校', 'internal', '学校根节点'),
			($1, '二级学院', 'internal', '二级学院/系'),
			($1, '专业', 'internal', '专业节点'),
			($1, '班级', 'internal', '班级节点'),
			($1, '行政职能部门', 'internal', '行政职能部门')
		ON CONFLICT DO NOTHING
	`, id)

	// 为新租户创建默认角色
	defaultRoles := []struct {
		code        string
		name        string
		permissions domain.JSONMap
	}{
		{"platform_admin", "平台管理员", domain.JSONMap{"admin": true}},
		{"school_admin", "学校管理员", domain.JSONMap{"schoolAdmin": true}},
		{"teacher", "教师", domain.JSONMap{"teacher": true}},
		{"student", "学生", domain.JSONMap{"student": true}},
		{"enterprise_mentor", "企业导师", domain.JSONMap{"enterpriseMentor": true}},
	}
	for _, role := range defaultRoles {
		_, _ = h.DB.Exec(r.Context(), `
			INSERT INTO roles (id, tenant_id, code, name, description, permissions, user_count, status, created_at)
			VALUES ($1, $2, $3, $4, '', $5, 0, 'active', NOW())
		`, uuid.NewString(), id, role.code, role.name, role.permissions)
	}

	// 为新租户创建默认管理员用户，并绑定 school_admin 预设角色
	var adminUser *adminUserInfo
	{
		adminID := uuid.NewString()
		adminPassword := "admin123"

		hash, hashErr := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
		if hashErr == nil {
			_, _ = h.DB.Exec(r.Context(), `
				INSERT INTO users (id, tenant_id, institution_id, org_node_id, major_id,
					role, platform, login_name, username, password_hash, name, email, phone, avatar_url,
					student_no, work_id, id_card, title_ids, oauth, status)
				VALUES ($1, $2, NULL, NULL, NULL, 'school', 'portal', $3, $4, $5, $6, NULL, NULL, NULL, NULL, NULL, NULL, $7, '{}', 'active')
			`, adminID, id, adminUsername, adminUsername, string(hash), req.Name+"管理员", "{}")

			_, _ = h.DB.Exec(r.Context(),
				`INSERT INTO user_roles (id, user_id, role_id)
				 SELECT $1, $2, id FROM roles WHERE tenant_id = $3 AND code = 'school_admin' LIMIT 1`,
				uuid.NewString(), adminID, id)

			_, _ = h.DB.Exec(r.Context(),
				`UPDATE roles SET user_count = user_count + 1
				 WHERE tenant_id = $1 AND code = 'school_admin'`,
				id)

			_, _ = h.DB.Exec(r.Context(),
				`UPDATE tenants SET admin_ids = ARRAY[$1::UUID] WHERE id = $2`,
				adminID, id)

			adminUser = &adminUserInfo{
				ID:        adminID,
				Username:  adminUsername,
				LoginName: adminUsername,
				Password:  adminPassword,
			}
		}
	}

	tenant, _ := h.fetchTenant(r.Context(), id)
	respondJSON(w, http.StatusCreated, CreateTenantResponse{Tenant: tenant, AdminUser: adminUser})
}

func (h *TenantHandler) Update(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if !canManagePortal(claims) && !canManagePlatform(claims) {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	if !canManagePlatform(claims) {
		id := chi.URLParam(r, "id")
		if claims.TenantID == nil || *claims.TenantID != id {
			respondError(w, http.StatusForbidden, "can only update own tenant")
			return
		}
	}

	h.updateTenant(w, r)
}

func (h *TenantHandler) updateTenant(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if _, err := h.fetchTenant(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "tenant not found")
		return
	}

	var req UpdateTenantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE tenants SET name = $1, logo_url = $2, domain = $3, enterprise_code = $4, contact = $5,
			phone = $6, address = $7, description = $8, updated_at = NOW()
		WHERE id = $9
	`, req.Name, req.LogoURL, req.Domain, req.EnterpriseCode, req.Contact, req.Phone, req.Address, req.Description, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update tenant")
		return
	}

	tenant, _ := h.fetchTenant(r.Context(), id)
	respondJSON(w, http.StatusOK, tenant)
}

func (h *TenantHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if !canManagePlatform(claims) {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	h.updateTenantStatus(w, r)
}

func (h *TenantHandler) updateTenantStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if _, err := h.fetchTenant(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "tenant not found")
		return
	}

	var req UpdateTenantStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Status != domain.TenantStatusActive && req.Status != domain.TenantStatusInactive {
		respondError(w, http.StatusBadRequest, "invalid status")
		return
	}

	_, err := h.DB.Exec(r.Context(), `UPDATE tenants SET status = $1, updated_at = NOW() WHERE id = $2`, req.Status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update status")
		return
	}

	tenant, _ := h.fetchTenant(r.Context(), id)
	respondJSON(w, http.StatusOK, tenant)
}

func (h *TenantHandler) fetchTenant(ctx context.Context, id string) (domain.Tenant, error) {
	var t domain.Tenant
	var logo, domainVal, enterpriseCode, contact, phone, address, description *string

	err := h.DB.QueryRow(ctx, `
		SELECT id, name, code, logo_url, domain, enterprise_code, contact, phone, address, description, admin_ids, status, created_at, updated_at
		FROM tenants WHERE id = $1
	`, id).Scan(
		&t.ID, &t.Name, &t.Code, &logo, &domainVal, &enterpriseCode, &contact, &phone, &address, &description,
		&t.AdminIDs, &t.Status, &t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return t, err
	}
	t.LogoURL = logo
	t.Domain = domainVal
	t.EnterpriseCode = enterpriseCode
	t.Contact = contact
	t.Phone = phone
	t.Address = address
	t.Description = description
	return t, nil
}

func (h *TenantHandler) scanTenantRows(rows pgx.Rows) ([]domain.Tenant, error) {
	items := make([]domain.Tenant, 0)
	for rows.Next() {
		var t domain.Tenant
		var logo, domainVal, enterpriseCode, contact, phone, address, description *string
		if err := rows.Scan(
			&t.ID, &t.Name, &t.Code, &logo, &domainVal, &enterpriseCode, &contact, &phone, &address, &description,
			&t.AdminIDs, &t.Status, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, err
		}
		t.LogoURL = logo
		t.Domain = domainVal
		t.EnterpriseCode = enterpriseCode
		t.Contact = contact
		t.Phone = phone
		t.Address = address
		t.Description = description
		items = append(items, t)
	}
	return items, nil
}
