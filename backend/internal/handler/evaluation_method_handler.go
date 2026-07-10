package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/middleware"
)

type EvaluationMethodHandler struct {
	DB *pgxpool.Pool
}

type EvaluationMethodCategoryListResponse struct {
	Items []domain.EvaluationMethodCategory `json:"items"`
	Total int                               `json:"total"`
}

type EvaluationMethodListResponse struct {
	Items []domain.EvaluationMethod `json:"items"`
	Total int                       `json:"total"`
}

type ToggleMethodRequest struct {
	Enabled bool `json:"enabled"`
}

func (h *EvaluationMethodHandler) ListCategories(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	rows, err := h.DB.Query(r.Context(), `
		SELECT id, name, order_num, created_at FROM evaluation_method_categories ORDER BY order_num, created_at
	`)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list categories")
		return
	}
	defer rows.Close()

	items := make([]domain.EvaluationMethodCategory, 0)
	for rows.Next() {
		var c domain.EvaluationMethodCategory
		if err := rows.Scan(&c.ID, &c.Name, &c.Order, &c.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "failed to scan categories")
			return
		}
		items = append(items, c)
	}
	respondJSON(w, http.StatusOK, EvaluationMethodCategoryListResponse{Items: items, Total: len(items)})
}

func (h *EvaluationMethodHandler) ListMethods(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	categoryID := r.URL.Query().Get("categoryId")
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
	if categoryID != "" {
		where = append(where, "category_id = $"+itoa(argIdx))
		args = append(args, categoryID)
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM evaluation_methods WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, category_id, name, enabled, related_task_ids, description, doc_link, sub_category_name, created_at, updated_at
		FROM evaluation_methods
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list methods")
		return
	}
	defer rows.Close()

	items, err := h.scanMethodRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan methods")
		return
	}

	respondJSON(w, http.StatusOK, EvaluationMethodListResponse{Items: items, Total: total})
}

func (h *EvaluationMethodHandler) Toggle(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	var req ToggleMethodRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE evaluation_methods SET enabled = $1, updated_at = NOW() WHERE id = $2
	`, req.Enabled, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to toggle method")
		return
	}

	method, _ := h.fetchMethod(r.Context(), id)
	respondJSON(w, http.StatusOK, method)
}

func (h *EvaluationMethodHandler) fetchMethod(ctx context.Context, id string) (domain.EvaluationMethod, error) {
	var m domain.EvaluationMethod
	var description, docLink, subCategoryName *string
	err := h.DB.QueryRow(ctx, `
		SELECT id, category_id, name, enabled, related_task_ids, description, doc_link, sub_category_name, created_at, updated_at
		FROM evaluation_methods WHERE id = $1
	`, id).Scan(
		&m.ID, &m.CategoryID, &m.Name, &m.Enabled, &m.RelatedTaskIDs, &description, &docLink, &subCategoryName, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		return m, err
	}
	m.Description = description
	m.DocLink = docLink
	m.SubCategoryName = subCategoryName
	return m, nil
}

func (h *EvaluationMethodHandler) scanMethodRows(rows pgx.Rows) ([]domain.EvaluationMethod, error) {
	items := make([]domain.EvaluationMethod, 0)
	for rows.Next() {
		var m domain.EvaluationMethod
		var description, docLink, subCategoryName *string
		if err := rows.Scan(
			&m.ID, &m.CategoryID, &m.Name, &m.Enabled, &m.RelatedTaskIDs, &description, &docLink, &subCategoryName, &m.CreatedAt, &m.UpdatedAt,
		); err != nil {
			return nil, err
		}
		m.Description = description
		m.DocLink = docLink
		m.SubCategoryName = subCategoryName
		items = append(items, m)
	}
	return items, nil
}
