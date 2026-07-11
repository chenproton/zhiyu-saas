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

type EvaluationBatchHandler struct {
	DB *pgxpool.Pool
}

type EvaluationBatchListResponse struct {
	Items []domain.EvaluationBatch `json:"items"`
	Total int                      `json:"total"`
}

type CreateEvaluationBatchRequest struct {
	Name       string  `json:"name"`
	Code       *string `json:"code"`
	OrgNodeID  *string `json:"orgNodeId"`
	Major      *string `json:"major"`
	WorkflowID *string `json:"workflowId"`
}

type UpdateEvaluationBatchRequest struct {
	Name       string  `json:"name"`
	Code       *string `json:"code"`
	OrgNodeID  *string `json:"orgNodeId"`
	Major      *string `json:"major"`
	WorkflowID *string `json:"workflowId"`
}

type UpdateEvaluationBatchStatusRequest struct {
	Status string `json:"status"`
}

func (h *EvaluationBatchHandler) List(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

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
		where = append(where, "name ILIKE $"+itoa(argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM evaluation_batches WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, name, code, org_node_id, major, workflow_id, status, created_at, updated_at
		FROM evaluation_batches
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list evaluation batches")
		return
	}
	defer rows.Close()

	items, err := h.scanBatchRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan evaluation batches")
		return
	}

	respondJSON(w, http.StatusOK, EvaluationBatchListResponse{Items: items, Total: total})
}

func (h *EvaluationBatchHandler) Get(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	batch, err := h.fetchBatch(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "evaluation batch not found")
		return
	}
	respondJSON(w, http.StatusOK, batch)
}

func (h *EvaluationBatchHandler) Create(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateEvaluationBatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := uuid.NewString()
	status := "open"

	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO evaluation_batches (id, name, code, org_node_id, major, workflow_id, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, id, req.Name, req.Code, req.OrgNodeID, req.Major, req.WorkflowID, status)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create evaluation batch")
		return
	}

	batch, _ := h.fetchBatch(r.Context(), id)
	respondJSON(w, http.StatusCreated, batch)
}

func (h *EvaluationBatchHandler) Update(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchBatch(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "evaluation batch not found")
		return
	}

	var req UpdateEvaluationBatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE evaluation_batches SET
			name = $1, code = $2, org_node_id = $3, major = $4, workflow_id = $5, updated_at = NOW()
		WHERE id = $6
	`, req.Name, req.Code, req.OrgNodeID, req.Major, req.WorkflowID, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update evaluation batch")
		return
	}

	batch, _ := h.fetchBatch(r.Context(), id)
	respondJSON(w, http.StatusOK, batch)
}

func (h *EvaluationBatchHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchBatch(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "evaluation batch not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM evaluation_batches WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete evaluation batch")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *EvaluationBatchHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchBatch(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "evaluation batch not found")
		return
	}

	var req UpdateEvaluationBatchStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Status != "open" && req.Status != "closed" {
		respondError(w, http.StatusBadRequest, "invalid status")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE evaluation_batches SET status = $1, updated_at = NOW() WHERE id = $2
	`, req.Status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update evaluation batch status")
		return
	}

	batch, _ := h.fetchBatch(r.Context(), id)
	respondJSON(w, http.StatusOK, batch)
}

func (h *EvaluationBatchHandler) fetchBatch(ctx context.Context, id string) (domain.EvaluationBatch, error) {
	var b domain.EvaluationBatch
	var code, orgNodeID, major, workflowID *string

	err := h.DB.QueryRow(ctx, `
		SELECT id, name, code, org_node_id, major, workflow_id, status, created_at, updated_at
		FROM evaluation_batches WHERE id = $1
	`, id).Scan(
		&b.ID, &b.Name, &code, &orgNodeID, &major, &workflowID, &b.Status, &b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		return b, err
	}
	b.Code = code
	b.OrgNodeID = orgNodeID
	b.Major = major
	b.WorkflowID = workflowID
	return b, nil
}

func (h *EvaluationBatchHandler) scanBatchRows(rows pgx.Rows) ([]domain.EvaluationBatch, error) {
	items := make([]domain.EvaluationBatch, 0)
	for rows.Next() {
		var b domain.EvaluationBatch
		var code, orgNodeID, major, workflowID *string
		if err := rows.Scan(
			&b.ID, &b.Name, &code, &orgNodeID, &major, &workflowID, &b.Status, &b.CreatedAt, &b.UpdatedAt,
		); err != nil {
			return nil, err
		}
		b.Code = code
		b.OrgNodeID = orgNodeID
		b.Major = major
		b.WorkflowID = workflowID
		items = append(items, b)
	}
	return items, nil
}
