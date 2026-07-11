package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

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

	taskID := r.URL.Query().Get("taskId")
	status := r.URL.Query().Get("status")
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

	if taskID != "" {
		where = append(where, "task_id = $"+itoa(argIdx))
		args = append(args, taskID)
		argIdx++
	}
	if status != "" {
		where = append(where, "status = $"+itoa(argIdx))
		args = append(args, status)
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM scene_evaluation_results WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, task_id, scene_id, method_key, evaluatee_id, evaluator_id, evaluator_type, status,
			total_score, max_score, eval_point_scores, objective_answers, subjective_content,
			drawn_questions, comment, graded_at, graded_by
		FROM scene_evaluation_results
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY id DESC
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

	if _, err := h.fetchResult(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "evaluation result not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE scene_evaluation_results SET total_score = $1, comment = $2, status = 'evaluated', graded_at = NOW()
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
			UPDATE scene_evaluation_results SET total_score = $1, status = 'evaluated', graded_at = NOW() WHERE id = $2
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
	var sceneID, comment, gradedBy *string
	var totalScore *float64
	var gradedAt *time.Time
	var evalPointScores, objectiveAnswers, subjectiveContent, drawnQuestions domain.JSONMap
	err := h.DB.QueryRow(ctx, `
		SELECT id, task_id, scene_id, method_key, evaluatee_id, evaluator_id, evaluator_type, status,
			total_score, max_score, eval_point_scores, objective_answers, subjective_content,
			drawn_questions, comment, graded_at, graded_by
		FROM scene_evaluation_results WHERE id = $1
	`, id).Scan(
		&res.ID, &res.TaskID, &sceneID, &res.MethodKey, &res.EvaluateeID, &res.EvaluatorID, &res.EvaluatorType, &res.Status,
		&totalScore, &res.MaxScore, &evalPointScores, &objectiveAnswers, &subjectiveContent,
		&drawnQuestions, &comment, &gradedAt, &gradedBy,
	)
	if err != nil {
		return res, err
	}
	res.SceneID = sceneID
	res.TotalScore = totalScore
	res.Comment = comment
	res.GradedAt = gradedAt
	res.GradedBy = gradedBy
	res.EvalPointScores = evalPointScores
	res.ObjectiveAnswers = objectiveAnswers
	res.SubjectiveContent = subjectiveContent
	res.DrawnQuestions = drawnQuestions
	return res, nil
}

func (h *EvaluationResultHandler) scanResultRows(rows pgx.Rows) ([]domain.SceneEvaluationResult, error) {
	items := make([]domain.SceneEvaluationResult, 0)
	for rows.Next() {
		var res domain.SceneEvaluationResult
		var sceneID, comment, gradedBy *string
		var totalScore *float64
		var gradedAt *time.Time
		var evalPointScores, objectiveAnswers, subjectiveContent, drawnQuestions domain.JSONMap
		if err := rows.Scan(
			&res.ID, &res.TaskID, &sceneID, &res.MethodKey, &res.EvaluateeID, &res.EvaluatorID, &res.EvaluatorType, &res.Status,
			&totalScore, &res.MaxScore, &evalPointScores, &objectiveAnswers, &subjectiveContent,
			&drawnQuestions, &comment, &gradedAt, &gradedBy,
		); err != nil {
			return nil, err
		}
		res.SceneID = sceneID
		res.TotalScore = totalScore
		res.Comment = comment
		res.GradedAt = gradedAt
		res.GradedBy = gradedBy
		res.EvalPointScores = evalPointScores
		res.ObjectiveAnswers = objectiveAnswers
		res.SubjectiveContent = subjectiveContent
		res.DrawnQuestions = drawnQuestions
		items = append(items, res)
	}
	return items, nil
}
