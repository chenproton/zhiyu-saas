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
)

type IdentityTypeHandler struct {
	DB *pgxpool.Pool
}

type IdentityTypeListResponse struct {
	Items []domain.IdentityType `json:"items"`
	Total int                   `json:"total"`
}

type CreateIdentityTypeRequest struct {
	TenantID    string  `json:"tenantId"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type UpdateIdentityTypeRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

func (h *IdentityTypeHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := r.URL.Query().Get("tenantId")
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
	if search != "" {
		where = append(where, "(name ILIKE $"+itoa(argIdx)+" OR code ILIKE $"+itoa(argIdx)+")")
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM identity_types WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, tenant_id, code, name, description, user_count, is_system, created_at
		FROM identity_types
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list identity types")
		return
	}
	defer rows.Close()

	items, err := h.scanIdentityTypeRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan identity types")
		return
	}

	respondJSON(w, http.StatusOK, IdentityTypeListResponse{Items: items, Total: total})
}

func (h *IdentityTypeHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	identityType, err := h.fetchIdentityType(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "identity type not found")
		return
	}
	respondJSON(w, http.StatusOK, identityType)
}

func (h *IdentityTypeHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.Role != domain.UserRoleOperator {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateIdentityTypeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.TenantID == "" || req.Code == "" || req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := uuid.NewString()

	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO identity_types (id, tenant_id, code, name, description, user_count, is_system)
		VALUES ($1, $2, $3, $4, $5, 0, FALSE)
	`, id, req.TenantID, req.Code, req.Name, req.Description)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create identity type")
		return
	}

	identityType, _ := h.fetchIdentityType(r.Context(), id)
	respondJSON(w, http.StatusCreated, identityType)
}

func (h *IdentityTypeHandler) Update(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.Role != domain.UserRoleOperator {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	existing, err := h.fetchIdentityType(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "identity type not found")
		return
	}

	if existing.IsSystem {
		respondError(w, http.StatusForbidden, "cannot modify system identity type")
		return
	}

	var req UpdateIdentityTypeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	_, err = h.DB.Exec(r.Context(), `
		UPDATE identity_types SET name = $1, description = $2
		WHERE id = $3
	`, req.Name, req.Description, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update identity type")
		return
	}

	identityType, _ := h.fetchIdentityType(r.Context(), id)
	respondJSON(w, http.StatusOK, identityType)
}

func (h *IdentityTypeHandler) Delete(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.Role != domain.UserRoleOperator {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	existing, err := h.fetchIdentityType(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "identity type not found")
		return
	}

	if existing.IsSystem {
		respondError(w, http.StatusForbidden, "cannot delete system identity type")
		return
	}

	_, err = h.DB.Exec(r.Context(), `DELETE FROM identity_types WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete identity type")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *IdentityTypeHandler) fetchIdentityType(ctx context.Context, id string) (domain.IdentityType, error) {
	var it domain.IdentityType
	var description *string

	err := h.DB.QueryRow(ctx, `
		SELECT id, tenant_id, code, name, description, user_count, is_system, created_at
		FROM identity_types WHERE id = $1
	`, id).Scan(
		&it.ID, &it.TenantID, &it.Code, &it.Name, &description, &it.UserCount, &it.IsSystem, &it.CreatedAt,
	)
	if err != nil {
		return it, err
	}
	it.Description = description
	return it, nil
}

func (h *IdentityTypeHandler) scanIdentityTypeRows(rows pgx.Rows) ([]domain.IdentityType, error) {
	items := make([]domain.IdentityType, 0)
	for rows.Next() {
		var it domain.IdentityType
		var description *string
		if err := rows.Scan(
			&it.ID, &it.TenantID, &it.Code, &it.Name, &description, &it.UserCount, &it.IsSystem, &it.CreatedAt,
		); err != nil {
			return nil, err
		}
		it.Description = description
		items = append(items, it)
	}
	return items, nil
}
