package handler

import (
	"context"
	"encoding/json"
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

type UserManagementHandler struct {
	DB *pgxpool.Pool
}

type UserListResponse struct {
	Items []domain.User `json:"items"`
	Total int           `json:"total"`
}

type CreateUserRequest struct {
	TenantID       string   `json:"tenantId"`
	InstitutionID  *string  `json:"institutionId"`
	IdentityTypeID *string  `json:"identityTypeId"`
	OrgNodeID      *string  `json:"orgNodeId"`
	MajorID        *string  `json:"majorId"`
	Username       string   `json:"username"`
	Password       string   `json:"password"`
	Name           string   `json:"name"`
	Email          string   `json:"email"`
	Phone          *string  `json:"phone"`
	AvatarURL      *string  `json:"avatarUrl"`
	StudentNo      *string  `json:"studentNo"`
	WorkID         *string  `json:"workId"`
	IDCard         *string  `json:"idCard"`
	TitleIDs       []string `json:"titleIds"`
	Role           *string  `json:"role"`
}

type UpdateUserRequest struct {
	InstitutionID  *string  `json:"institutionId"`
	IdentityTypeID *string  `json:"identityTypeId"`
	OrgNodeID      *string  `json:"orgNodeId"`
	MajorID        *string  `json:"majorId"`
	Username       string   `json:"username"`
	Name           string   `json:"name"`
	Email          string   `json:"email"`
	Phone          *string  `json:"phone"`
	AvatarURL      *string  `json:"avatarUrl"`
	StudentNo      *string  `json:"studentNo"`
	WorkID         *string  `json:"workId"`
	IDCard         *string  `json:"idCard"`
	TitleIDs       []string `json:"titleIds"`
	Role           *string  `json:"role"`
}

type UpdateUserStatusRequest struct {
	Status string `json:"status"`
}

type BatchCreateUserRequest struct {
	Users []CreateUserRequest `json:"users"`
}

func (h *UserManagementHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := r.URL.Query().Get("tenantId")
	institutionID := r.URL.Query().Get("institutionId")
	identityTypeID := r.URL.Query().Get("identityTypeId")
	orgNodeID := r.URL.Query().Get("orgNodeId")
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

	if tenantID != "" {
		where = append(where, "tenant_id = $"+itoa(argIdx))
		args = append(args, tenantID)
		argIdx++
	}
	if institutionID != "" {
		where = append(where, "institution_id = $"+itoa(argIdx))
		args = append(args, institutionID)
		argIdx++
	}
	if identityTypeID != "" {
		where = append(where, "identity_type_id = $"+itoa(argIdx))
		args = append(args, identityTypeID)
		argIdx++
	}
	if orgNodeID != "" {
		where = append(where, "org_node_id = $"+itoa(argIdx))
		args = append(args, orgNodeID)
		argIdx++
	}
	if status != "" {
		where = append(where, "status = $"+itoa(argIdx))
		args = append(args, status)
		argIdx++
	}
	if search != "" {
		where = append(where, "(username ILIKE $"+itoa(argIdx)+" OR name ILIKE $"+itoa(argIdx)+" OR email ILIKE $"+itoa(argIdx)+")")
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM users WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, tenant_id, institution_id, identity_type_id, org_node_id, major_id,
			role, login_name, username, password_hash, name, email, phone, avatar_url,
			student_no, work_id, id_card, title_ids, oauth, status, last_login_at, created_at, updated_at
		FROM users
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list users")
		return
	}
	defer rows.Close()

	items, err := h.scanUserRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan users")
		return
	}

	respondJSON(w, http.StatusOK, UserListResponse{Items: items, Total: total})
}

func (h *UserManagementHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	user, err := h.fetchUser(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}
	user.PasswordHash = ""
	respondJSON(w, http.StatusOK, user)
}

func (h *UserManagementHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.Role != domain.UserRoleOperator {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.TenantID == "" || req.Username == "" || req.Password == "" || req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	user, err := h.createSingleUser(r.Context(), req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create user")
		return
	}
	user.PasswordHash = ""
	respondJSON(w, http.StatusCreated, user)
}

func (h *UserManagementHandler) Update(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.Role != domain.UserRoleOperator {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchUser(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	var req UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Username == "" || req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	role := h.resolveRole(r.Context(), req.IdentityTypeID, req.Role)

	_, err := h.DB.Exec(r.Context(), `
		UPDATE users SET institution_id = $1, identity_type_id = $2, org_node_id = $3, major_id = $4,
			role = $5, username = $6, name = $7, email = $8, phone = $9, avatar_url = $10,
			student_no = $11, work_id = $12, id_card = $13, title_ids = $14, updated_at = NOW()
		WHERE id = $15
	`, req.InstitutionID, req.IdentityTypeID, req.OrgNodeID, req.MajorID,
		role, req.Username, req.Name, req.Email, req.Phone, req.AvatarURL,
		req.StudentNo, req.WorkID, req.IDCard, coalesceStringSlice(req.TitleIDs), id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update user")
		return
	}

	user, _ := h.fetchUser(r.Context(), id)
	user.PasswordHash = ""
	respondJSON(w, http.StatusOK, user)
}

func (h *UserManagementHandler) Delete(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.Role != domain.UserRoleOperator {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchUser(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM users WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete user")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *UserManagementHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.Role != domain.UserRoleOperator {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchUser(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	var req UpdateUserStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Status != "active" && req.Status != "inactive" && req.Status != "disabled" {
		respondError(w, http.StatusBadRequest, "invalid status")
		return
	}

	_, err := h.DB.Exec(r.Context(), `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2`, req.Status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update status")
		return
	}

	user, _ := h.fetchUser(r.Context(), id)
	user.PasswordHash = ""
	respondJSON(w, http.StatusOK, user)
}

func (h *UserManagementHandler) BatchCreate(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.Role != domain.UserRoleOperator {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req BatchCreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.Users) == 0 {
		respondError(w, http.StatusBadRequest, "empty user list")
		return
	}

	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to begin transaction")
		return
	}
	defer tx.Rollback(r.Context())

	created := make([]domain.User, 0, len(req.Users))
	for _, u := range req.Users {
		if u.TenantID == "" || u.Username == "" || u.Password == "" || u.Name == "" {
			continue
		}
		user, err := h.createSingleUserInTx(r.Context(), tx, u)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to create users")
			return
		}
		user.PasswordHash = ""
		created = append(created, user)
	}

	if err := tx.Commit(r.Context()); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to commit")
		return
	}

	respondJSON(w, http.StatusCreated, UserListResponse{Items: created, Total: len(created)})
}

func (h *UserManagementHandler) createSingleUser(ctx context.Context, req CreateUserRequest) (domain.User, error) {
	tx, err := h.DB.Begin(ctx)
	if err != nil {
		return domain.User{}, err
	}
	defer tx.Rollback(ctx)

	user, err := h.createSingleUserInTx(ctx, tx, req)
	if err != nil {
		return user, err
	}

	if err := tx.Commit(ctx); err != nil {
		return user, err
	}
	return user, nil
}

func (h *UserManagementHandler) createSingleUserInTx(ctx context.Context, tx pgx.Tx, req CreateUserRequest) (domain.User, error) {
	id := uuid.NewString()

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return domain.User{}, err
	}

	role := h.resolveRole(ctx, req.IdentityTypeID, req.Role)

	_, err = tx.Exec(ctx, `
		INSERT INTO users (id, tenant_id, institution_id, identity_type_id, org_node_id, major_id,
			role, username, password_hash, name, email, phone, avatar_url,
			student_no, work_id, id_card, title_ids, oauth, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'active')
	`, id, req.TenantID, req.InstitutionID, req.IdentityTypeID, req.OrgNodeID, req.MajorID,
		role, req.Username, string(hash), req.Name, req.Email, req.Phone, req.AvatarURL,
		req.StudentNo, req.WorkID, req.IDCard, coalesceStringSlice(req.TitleIDs), domain.JSONMap{})
	if err != nil {
		return domain.User{}, err
	}

	return h.fetchUserInTx(ctx, tx, id)
}

func (h *UserManagementHandler) resolveRole(ctx context.Context, identityTypeID *string, roleOverride *string) domain.UserRole {
	if roleOverride != nil {
		switch *roleOverride {
		case string(domain.UserRoleSchool), string(domain.UserRoleEnterprise), string(domain.UserRoleOperator):
			return domain.UserRole(*roleOverride)
		}
	}

	if identityTypeID != nil && *identityTypeID != "" {
		var code string
		_ = h.DB.QueryRow(ctx, `SELECT code FROM identity_types WHERE id = $1`, *identityTypeID).Scan(&code)
		switch code {
		case "student", "teacher":
			return domain.UserRoleSchool
		case "enterprise_admin", "enterprise_staff":
			return domain.UserRoleEnterprise
		}
	}

	return domain.UserRoleOperator
}

func (h *UserManagementHandler) fetchUser(ctx context.Context, id string) (domain.User, error) {
	var user domain.User
	var tenantID, institutionID, identityTypeID, orgNodeID, majorID, loginName, phone, avatarURL, studentNo, workID, idCard *string
	var titleIDs []string
	var oauth domain.JSONMap

	err := h.DB.QueryRow(ctx, `
		SELECT id, tenant_id, institution_id, identity_type_id, org_node_id, major_id,
			role, login_name, username, password_hash, name, email, phone, avatar_url,
			student_no, work_id, id_card, title_ids, oauth, status, last_login_at, created_at, updated_at
		FROM users WHERE id = $1
	`, id).Scan(
		&user.ID, &tenantID, &institutionID, &identityTypeID, &orgNodeID, &majorID,
		&user.Role, &loginName, &user.Username, &user.PasswordHash, &user.Name, &user.Email,
		&phone, &avatarURL, &studentNo, &workID, &idCard, &titleIDs, &oauth, &user.Status,
		&user.LastLoginAt, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return user, err
	}
	user.TenantID = tenantID
	user.InstitutionID = institutionID
	user.IdentityTypeID = identityTypeID
	user.OrgNodeID = orgNodeID
	user.MajorID = majorID
	user.LoginName = loginName
	user.Phone = phone
	user.AvatarURL = avatarURL
	user.StudentNo = studentNo
	user.WorkID = workID
	user.IDCard = idCard
	user.TitleIDs = titleIDs
	user.Oauth = oauth
	return user, nil
}

func (h *UserManagementHandler) fetchUserInTx(ctx context.Context, tx pgx.Tx, id string) (domain.User, error) {
	var user domain.User
	var tenantID, institutionID, identityTypeID, orgNodeID, majorID, loginName, phone, avatarURL, studentNo, workID, idCard *string
	var titleIDs []string
	var oauth domain.JSONMap

	err := tx.QueryRow(ctx, `
		SELECT id, tenant_id, institution_id, identity_type_id, org_node_id, major_id,
			role, login_name, username, password_hash, name, email, phone, avatar_url,
			student_no, work_id, id_card, title_ids, oauth, status, last_login_at, created_at, updated_at
		FROM users WHERE id = $1
	`, id).Scan(
		&user.ID, &tenantID, &institutionID, &identityTypeID, &orgNodeID, &majorID,
		&user.Role, &loginName, &user.Username, &user.PasswordHash, &user.Name, &user.Email,
		&phone, &avatarURL, &studentNo, &workID, &idCard, &titleIDs, &oauth, &user.Status,
		&user.LastLoginAt, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return user, err
	}
	user.TenantID = tenantID
	user.InstitutionID = institutionID
	user.IdentityTypeID = identityTypeID
	user.OrgNodeID = orgNodeID
	user.MajorID = majorID
	user.LoginName = loginName
	user.Phone = phone
	user.AvatarURL = avatarURL
	user.StudentNo = studentNo
	user.WorkID = workID
	user.IDCard = idCard
	user.TitleIDs = titleIDs
	user.Oauth = oauth
	return user, nil
}

func (h *UserManagementHandler) scanUserRows(rows pgx.Rows) ([]domain.User, error) {
	items := make([]domain.User, 0)
	for rows.Next() {
		var user domain.User
		var tenantID, institutionID, identityTypeID, orgNodeID, majorID, loginName, phone, avatarURL, studentNo, workID, idCard *string
		var titleIDs []string
		var oauth domain.JSONMap
		if err := rows.Scan(
			&user.ID, &tenantID, &institutionID, &identityTypeID, &orgNodeID, &majorID,
			&user.Role, &loginName, &user.Username, &user.PasswordHash, &user.Name, &user.Email,
			&phone, &avatarURL, &studentNo, &workID, &idCard, &titleIDs, &oauth, &user.Status,
			&user.LastLoginAt, &user.CreatedAt, &user.UpdatedAt,
		); err != nil {
			return nil, err
		}
		user.TenantID = tenantID
		user.InstitutionID = institutionID
		user.IdentityTypeID = identityTypeID
		user.OrgNodeID = orgNodeID
		user.MajorID = majorID
		user.LoginName = loginName
		user.Phone = phone
		user.AvatarURL = avatarURL
		user.StudentNo = studentNo
		user.WorkID = workID
		user.IDCard = idCard
		user.TitleIDs = titleIDs
		user.Oauth = oauth
		items = append(items, user)
	}
	return items, nil
}
