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

type AppealHandler struct {
	DB *pgxpool.Pool
}

type AppealListResponse struct {
	Items []domain.AppealRecord `json:"items"`
	Total int                   `json:"total"`
}

type CreateAppealRequest struct {
	StudentID   string `json:"studentId"`
	StudentName string `json:"studentName"`
	Type        string `json:"type"`
	Reason      string `json:"reason"`
}

type ProcessAppealRequest struct {
	Status string  `json:"status"`
	Remark *string `json:"remark"`
}

func (h *AppealHandler) List(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	appealType := r.URL.Query().Get("type")
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

	if appealType != "" {
		where = append(where, "type = $"+itoa(argIdx))
		args = append(args, appealType)
		argIdx++
	}
	if status != "" {
		where = append(where, "status = $"+itoa(argIdx))
		args = append(args, status)
		argIdx++
	}
	if search != "" {
		where = append(where, "student_name ILIKE $"+itoa(argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM appeal_records WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, student_id, student_name, type, reason, status, created_at, updated_at
		FROM appeal_records
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list appeals")
		return
	}
	defer rows.Close()

	items, err := h.scanAppealRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan appeals")
		return
	}

	respondJSON(w, http.StatusOK, AppealListResponse{Items: items, Total: total})
}

func (h *AppealHandler) Get(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	appeal, err := h.fetchAppeal(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "appeal not found")
		return
	}
	respondJSON(w, http.StatusOK, appeal)
}

func (h *AppealHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateAppealRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.StudentID == "" || req.Type == "" || req.Reason == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := "ap-" + uuid.NewString()
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO appeal_records (id, student_id, student_name, type, reason, status)
		VALUES ($1, $2, $3, $4, $5, 'pending')
	`, id, req.StudentID, req.StudentName, req.Type, req.Reason)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create appeal")
		return
	}

	appeal, _ := h.fetchAppeal(r.Context(), id)
	respondJSON(w, http.StatusCreated, appeal)
}

func (h *AppealHandler) Process(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	var req ProcessAppealRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Status == "" {
		respondError(w, http.StatusBadRequest, "missing status")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE appeal_records SET status = $1, updated_at = NOW() WHERE id = $2
	`, req.Status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to process appeal")
		return
	}

	appeal, _ := h.fetchAppeal(r.Context(), id)
	respondJSON(w, http.StatusOK, appeal)
}

func (h *AppealHandler) fetchAppeal(ctx context.Context, id string) (domain.AppealRecord, error) {
	var a domain.AppealRecord
	err := h.DB.QueryRow(ctx, `
		SELECT id, student_id, student_name, type, reason, status, created_at, updated_at
		FROM appeal_records WHERE id = $1
	`, id).Scan(&a.ID, &a.StudentID, &a.StudentName, &a.Type, &a.Reason, &a.Status, &a.CreatedAt, &a.UpdatedAt)
	return a, err
}

func (h *AppealHandler) scanAppealRows(rows pgx.Rows) ([]domain.AppealRecord, error) {
	items := make([]domain.AppealRecord, 0)
	for rows.Next() {
		var a domain.AppealRecord
		if err := rows.Scan(&a.ID, &a.StudentID, &a.StudentName, &a.Type, &a.Reason, &a.Status, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, a)
	}
	return items, nil
}
