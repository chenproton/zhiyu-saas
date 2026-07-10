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

type EvaluationResultHandler struct {
	DB *pgxpool.Pool
}

type EvaluationResultListResponse struct {
	Items []domain.SceneEvaluationResult `json:"items"`
	Total int                            `json:"total"`
}

type GradeResultRequest struct {
	Score   float64 `json:"score"`
	Comment *string `json:"comment"`
}

type BatchGradeItem struct {
	ID    string  `json:"id"`
	Score float64 `json:"score"`
}

type BatchGradeRequest struct {
	Items []BatchGradeItem `json:"items"`
}

func (h *EvaluationResultHandler) List(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	methodID := r.URL.Query().Get("methodId")
	taskID := r.URL.Query().Get("taskId")
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

	if methodID != "" {
		where = append(where, "method_id = $"+itoa(argIdx))
		args = append(args, methodID)
		argIdx++
	}
	if taskID != "" {
		where = append(where, "task_id = $"+itoa(argIdx))
		args = append(args, taskID)
		argIdx++
	}
	if status != "" {
		where = append(where, "evaluation_status = $"+itoa(argIdx))
		args = append(args, status)
		argIdx++
	}
	if search != "" {
		where = append(where, "evaluatee_name ILIKE $"+itoa(argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM scene_evaluation_results WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, method_id, evaluation_time, task_id, task_name, scene_name, evaluatee_type, evaluatee_id, evaluatee_name,
			evaluator_ids, evaluator_names, evaluator_type, evaluation_status, score, max_score, comment, created_at, updated_at
		FROM scene_evaluation_results
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list evaluation results")
		return
	}
	defer rows.Close()

	items, err := h.scanResultRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan evaluation results")
		return
	}

	respondJSON(w, http.StatusOK, EvaluationResultListResponse{Items: items, Total: total})
}

func (h *EvaluationResultHandler) Get(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	res, err := h.fetchResult(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "evaluation result not found")
		return
	}
	respondJSON(w, http.StatusOK, res)
}

func (h *EvaluationResultHandler) Grade(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	var req GradeResultRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE scene_evaluation_results SET score = $1, comment = $2, evaluation_status = 'evaluated', updated_at = NOW()
		WHERE id = $3
	`, req.Score, req.Comment, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to grade result")
		return
	}

	res, _ := h.fetchResult(r.Context(), id)
	respondJSON(w, http.StatusOK, res)
}

func (h *EvaluationResultHandler) BatchGrade(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req BatchGradeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to begin transaction")
		return
	}
	defer tx.Rollback(r.Context())

	count := 0
	for _, item := range req.Items {
		_, err := tx.Exec(r.Context(), `
			UPDATE scene_evaluation_results SET score = $1, evaluation_status = 'evaluated', updated_at = NOW() WHERE id = $2
		`, item.Score, item.ID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to batch grade")
			return
		}
		count++
	}

	if err := tx.Commit(r.Context()); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to commit")
		return
	}

	respondJSON(w, http.StatusOK, map[string]int{"count": count})
}

func (h *EvaluationResultHandler) fetchResult(ctx context.Context, id string) (domain.SceneEvaluationResult, error) {
	var res domain.SceneEvaluationResult
	var comment *string
	err := h.DB.QueryRow(ctx, `
		SELECT id, method_id, evaluation_time, task_id, task_name, scene_name, evaluatee_type, evaluatee_id, evaluatee_name,
			evaluator_ids, evaluator_names, evaluator_type, evaluation_status, score, max_score, comment, created_at, updated_at
		FROM scene_evaluation_results WHERE id = $1
	`, id).Scan(
		&res.ID, &res.MethodID, &res.EvaluationTime, &res.TaskID, &res.TaskName, &res.SceneName, &res.EvaluateeType, &res.EvaluateeID, &res.EvaluateeName,
		&res.EvaluatorIDs, &res.EvaluatorNames, &res.EvaluatorType, &res.EvaluationStatus, &res.Score, &res.MaxScore, &comment, &res.CreatedAt, &res.UpdatedAt,
	)
	if err != nil {
		return res, err
	}
	res.Comment = comment
	return res, nil
}

func (h *EvaluationResultHandler) scanResultRows(rows pgx.Rows) ([]domain.SceneEvaluationResult, error) {
	items := make([]domain.SceneEvaluationResult, 0)
	for rows.Next() {
		var res domain.SceneEvaluationResult
		var comment *string
		if err := rows.Scan(
			&res.ID, &res.MethodID, &res.EvaluationTime, &res.TaskID, &res.TaskName, &res.SceneName, &res.EvaluateeType, &res.EvaluateeID, &res.EvaluateeName,
			&res.EvaluatorIDs, &res.EvaluatorNames, &res.EvaluatorType, &res.EvaluationStatus, &res.Score, &res.MaxScore, &comment, &res.CreatedAt, &res.UpdatedAt,
		); err != nil {
			return nil, err
		}
		res.Comment = comment
		items = append(items, res)
	}
	return items, nil
}
