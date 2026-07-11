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

type CourseBatchHandler struct {
	DB *pgxpool.Pool
}

type LessonBatchListResponse struct {
	Items []domain.LessonBatch `json:"items"`
	Total int                  `json:"total"`
}

type CreateLessonBatchRequest struct {
	Name       string  `json:"name"`
	Code       *string `json:"code"`
	OrgNodeID  *string `json:"orgNodeId"`
	Major      *string `json:"major"`
	WorkflowID *string `json:"workflowId"`
	Status     string  `json:"status"`
}

type UpdateLessonBatchRequest struct {
	Name       string  `json:"name"`
	Code       *string `json:"code"`
	OrgNodeID  *string `json:"orgNodeId"`
	Major      *string `json:"major"`
	WorkflowID *string `json:"workflowId"`
	Status     string  `json:"status"`
}

type UpdateLessonBatchStatusRequest struct {
	Status string `json:"status"`
}

func (h *CourseBatchHandler) List(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	orgNodeID := r.URL.Query().Get("orgNodeId")
	major := r.URL.Query().Get("major")
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
	if major != "" {
		where = append(where, "major = $"+itoa(argIdx))
		args = append(args, major)
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

	countQuery := "SELECT COUNT(*) FROM lesson_batches WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, name, code, org_node_id, major, workflow_id, status, course_count, created_at, updated_at
		FROM lesson_batches
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list batches")
		return
	}
	defer rows.Close()

	items, err := h.scanLessonBatchRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan batches")
		return
	}

	respondJSON(w, http.StatusOK, LessonBatchListResponse{Items: items, Total: total})
}

func (h *CourseBatchHandler) Get(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	batch, err := h.fetchLessonBatch(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "batch not found")
		return
	}
	respondJSON(w, http.StatusOK, batch)
}

func (h *CourseBatchHandler) Create(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateLessonBatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}
	status := domain.LessonBatchStatus(req.Status)
	if status == "" {
		status = domain.LessonBatchStatusOpen
	}

	id := uuid.NewString()
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO lesson_batches (id, name, code, org_node_id, major, workflow_id, status, course_count)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
	`, id, req.Name, req.Code, req.OrgNodeID, req.Major, req.WorkflowID, status)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create batch")
		return
	}

	batch, _ := h.fetchLessonBatch(r.Context(), id)
	respondJSON(w, http.StatusCreated, batch)
}

func (h *CourseBatchHandler) Update(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchLessonBatch(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "batch not found")
		return
	}

	var req UpdateLessonBatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	status := domain.LessonBatchStatus(req.Status)
	if status == "" {
		status = domain.LessonBatchStatusOpen
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE lesson_batches SET name = $1, code = $2, org_node_id = $3, major = $4, workflow_id = $5,
			status = $6, updated_at = NOW()
		WHERE id = $7
	`, req.Name, req.Code, req.OrgNodeID, req.Major, req.WorkflowID, status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update batch")
		return
	}

	batch, _ := h.fetchLessonBatch(r.Context(), id)
	respondJSON(w, http.StatusOK, batch)
}

func (h *CourseBatchHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchLessonBatch(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "batch not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM lesson_batches WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete batch")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *CourseBatchHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchLessonBatch(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "batch not found")
		return
	}

	var req UpdateLessonBatchStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	status := domain.LessonBatchStatus(req.Status)
	if status != domain.LessonBatchStatusOpen && status != domain.LessonBatchStatusClosed {
		respondError(w, http.StatusBadRequest, "invalid status")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE lesson_batches SET status = $1, updated_at = NOW() WHERE id = $2
	`, status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update batch status")
		return
	}

	batch, _ := h.fetchLessonBatch(r.Context(), id)
	respondJSON(w, http.StatusOK, batch)
}

func (h *CourseBatchHandler) fetchLessonBatch(ctx context.Context, id string) (*domain.LessonBatch, error) {
	var b domain.LessonBatch
	err := h.DB.QueryRow(ctx, `
		SELECT id, name, code, org_node_id, major, workflow_id, status, course_count, created_at, updated_at
		FROM lesson_batches WHERE id = $1
	`, id).Scan(
		&b.ID, &b.Name, &b.Code, &b.OrgNodeID, &b.Major, &b.WorkflowID, &b.Status,
		&b.CourseCount, &b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (h *CourseBatchHandler) scanLessonBatchRows(rows pgx.Rows) ([]domain.LessonBatch, error) {
	items := make([]domain.LessonBatch, 0)
	for rows.Next() {
		var b domain.LessonBatch
		if err := rows.Scan(
			&b.ID, &b.Name, &b.Code, &b.OrgNodeID, &b.Major, &b.WorkflowID, &b.Status,
			&b.CourseCount, &b.CreatedAt, &b.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, b)
	}
	return items, nil
}
