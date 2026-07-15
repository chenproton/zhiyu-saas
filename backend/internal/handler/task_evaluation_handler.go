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

type TaskEvaluationHandler struct {
	DB *pgxpool.Pool
}

type TaskEvaluationConfigListResponse struct {
	Items []domain.TaskEvaluationConfig `json:"items"`
	Total int                           `json:"total"`
}

type TaskEvalPointListResponse struct {
	Items []domain.TaskEvalPoint `json:"items"`
	Total int                    `json:"total"`
}

type TaskReviewStepListResponse struct {
	Items []domain.TaskReviewStep `json:"items"`
	Total int                     `json:"total"`
}

type UpsertTaskEvaluationConfigRequest struct {
	ID            string           `json:"id"`
	TaskID        string           `json:"taskId"`
	MethodKey     string           `json:"methodKey"`
	Weight        float64          `json:"weight"`
	EvalObjects   domain.JSONMap   `json:"evalObjects"`
	EvalSubjects  domain.JSONSlice `json:"evalSubjects"`
	EvalResources domain.JSONMap   `json:"evalResources"`
}

type UpsertTaskEvalPointRequest struct {
	ID                string         `json:"id"`
	ConfigID          string         `json:"configId"`
	Name              string         `json:"name"`
	Description       *string        `json:"description"`
	Weight            float64        `json:"weight"`
	MaxScore          float64        `json:"maxScore"`
	ScoringMethod     string         `json:"scoringMethod"`
	GradeMapping      domain.JSONMap `json:"gradeMapping"`
	SubType           *string        `json:"subType"`
	KnowledgePointIDs []string       `json:"knowledgePointIds"`
	AbilityPointIDs   []string       `json:"abilityPointIds"`
	SortOrder         int            `json:"sortOrder"`
}

type UpsertTaskReviewStepRequest struct {
	ID          string  `json:"id"`
	ConfigID    string  `json:"configId"`
	Label       string  `json:"label"`
	Description *string `json:"description"`
	Enabled     bool    `json:"enabled"`
	SubjectType *string `json:"subjectType"`
	Weight      float64 `json:"weight"`
	SortOrder   int     `json:"sortOrder"`
}

func (h *TaskEvaluationHandler) ListConfigs(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	taskID := r.URL.Query().Get("taskId")
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
		where = append(where, "tenant_id = $"+itoa(argIdx))
		args = append(args, effectiveTenantID)
		argIdx++
	}

	if taskID != "" {
		where = append(where, "task_id = $"+itoa(argIdx))
		args = append(args, taskID)
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM task_evaluation_configs WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, task_id, method_key, weight, eval_objects, eval_subjects, eval_resources
		FROM task_evaluation_configs
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY id DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list configs")
		return
	}
	defer rows.Close()

	items, err := h.scanConfigRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan configs")
		return
	}

	respondJSON(w, http.StatusOK, TaskEvaluationConfigListResponse{Items: items, Total: total})
}

func (h *TaskEvaluationHandler) UpsertConfig(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req UpsertTaskEvaluationConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.TaskID == "" || req.MethodKey == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	if req.EvalSubjects == nil {
		req.EvalSubjects = domain.JSONSlice{}
	}

	var id string
	if req.ID != "" {
		_, err := h.DB.Exec(r.Context(), `
			UPDATE task_evaluation_configs SET method_key = $1, weight = $2, eval_objects = $3,
				eval_subjects = $4, eval_resources = $5 WHERE id = $6
		`, req.MethodKey, req.Weight, req.EvalObjects, req.EvalSubjects, req.EvalResources, req.ID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to update config")
			return
		}
		id = req.ID
	} else {
		err := h.DB.QueryRow(r.Context(), `
			INSERT INTO task_evaluation_configs (task_id, method_key, weight, eval_objects, eval_subjects, eval_resources)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (task_id, method_key) DO UPDATE SET
				weight = EXCLUDED.weight,
				eval_objects = EXCLUDED.eval_objects,
				eval_subjects = EXCLUDED.eval_subjects,
				eval_resources = EXCLUDED.eval_resources
			RETURNING id
		`, req.TaskID, req.MethodKey, req.Weight, req.EvalObjects, req.EvalSubjects, req.EvalResources).Scan(&id)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to upsert config")
			return
		}
	}

	config, _ := h.fetchConfig(r.Context(), id)
	respondJSON(w, http.StatusOK, config)
}

func (h *TaskEvaluationHandler) DeleteConfig(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	_, err := h.DB.Exec(r.Context(), `DELETE FROM task_evaluation_configs WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete config")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *TaskEvaluationHandler) ListEvalPoints(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	configID := r.URL.Query().Get("configId")
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

	if configID != "" {
		where = append(where, "config_id = $"+itoa(argIdx))
		args = append(args, configID)
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM task_eval_points WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, config_id, name, description, weight, max_score, scoring_method, grade_mapping,
			sub_type, knowledge_point_ids, ability_point_ids, sort_order
		FROM task_eval_points
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY sort_order
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list eval points")
		return
	}
	defer rows.Close()

	items, err := h.scanEvalPointRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan eval points")
		return
	}

	respondJSON(w, http.StatusOK, TaskEvalPointListResponse{Items: items, Total: total})
}

func (h *TaskEvaluationHandler) UpsertEvalPoint(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req UpsertTaskEvalPointRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.ConfigID == "" || req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	var id string
	if req.ID != "" {
		_, err := h.DB.Exec(r.Context(), `
			UPDATE task_eval_points SET config_id = $1, name = $2, description = $3, weight = $4,
				max_score = $5, scoring_method = $6, grade_mapping = $7, sub_type = $8,
				knowledge_point_ids = $9, ability_point_ids = $10, sort_order = $11
			WHERE id = $12
		`, req.ConfigID, req.Name, req.Description, req.Weight, req.MaxScore, req.ScoringMethod,
			req.GradeMapping, req.SubType, coalesceStringSlice(req.KnowledgePointIDs), coalesceStringSlice(req.AbilityPointIDs), req.SortOrder, req.ID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to update eval point")
			return
		}
		id = req.ID
	} else {
		err := h.DB.QueryRow(r.Context(), `
			INSERT INTO task_eval_points (config_id, name, description, weight, max_score, scoring_method,
				grade_mapping, sub_type, knowledge_point_ids, ability_point_ids, sort_order)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING id
		`, req.ConfigID, req.Name, req.Description, req.Weight, req.MaxScore, req.ScoringMethod,
			req.GradeMapping, req.SubType, coalesceStringSlice(req.KnowledgePointIDs), coalesceStringSlice(req.AbilityPointIDs), req.SortOrder).Scan(&id)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to create eval point")
			return
		}
	}

	point, _ := h.fetchEvalPoint(r.Context(), id)
	respondJSON(w, http.StatusOK, point)
}

func (h *TaskEvaluationHandler) DeleteEvalPoint(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	_, err := h.DB.Exec(r.Context(), `DELETE FROM task_eval_points WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete eval point")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *TaskEvaluationHandler) ListReviewSteps(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	configID := r.URL.Query().Get("configId")
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

	if configID != "" {
		where = append(where, "config_id = $"+itoa(argIdx))
		args = append(args, configID)
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM task_review_steps WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, config_id, label, description, enabled, subject_type, weight, sort_order
		FROM task_review_steps
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY sort_order
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list review steps")
		return
	}
	defer rows.Close()

	items, err := h.scanReviewStepRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan review steps")
		return
	}

	respondJSON(w, http.StatusOK, TaskReviewStepListResponse{Items: items, Total: total})
}

func (h *TaskEvaluationHandler) UpsertReviewStep(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req UpsertTaskReviewStepRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.ConfigID == "" || req.Label == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	var id string
	if req.ID != "" {
		_, err := h.DB.Exec(r.Context(), `
			UPDATE task_review_steps SET config_id = $1, label = $2, description = $3, enabled = $4,
				subject_type = $5, weight = $6, sort_order = $7
			WHERE id = $8
		`, req.ConfigID, req.Label, req.Description, req.Enabled, req.SubjectType, req.Weight, req.SortOrder, req.ID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to update review step")
			return
		}
		id = req.ID
	} else {
		err := h.DB.QueryRow(r.Context(), `
			INSERT INTO task_review_steps (config_id, label, description, enabled, subject_type, weight, sort_order)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id
		`, req.ConfigID, req.Label, req.Description, req.Enabled, req.SubjectType, req.Weight, req.SortOrder).Scan(&id)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to create review step")
			return
		}
	}

	step, _ := h.fetchReviewStep(r.Context(), id)
	respondJSON(w, http.StatusOK, step)
}

func (h *TaskEvaluationHandler) fetchConfig(ctx context.Context, id string) (*domain.TaskEvaluationConfig, error) {
	var c domain.TaskEvaluationConfig
	err := h.DB.QueryRow(ctx, `
		SELECT id, task_id, method_key, weight, eval_objects, eval_subjects, eval_resources
		FROM task_evaluation_configs WHERE id = $1
	`, id).Scan(&c.ID, &c.TaskID, &c.MethodKey, &c.Weight, &c.EvalObjects, &c.EvalSubjects, &c.EvalResources)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (h *TaskEvaluationHandler) fetchEvalPoint(ctx context.Context, id string) (*domain.TaskEvalPoint, error) {
	var p domain.TaskEvalPoint
	err := h.DB.QueryRow(ctx, `
		SELECT id, config_id, name, description, weight, max_score, scoring_method, grade_mapping,
			sub_type, knowledge_point_ids, ability_point_ids, sort_order
		FROM task_eval_points WHERE id = $1
	`, id).Scan(
		&p.ID, &p.ConfigID, &p.Name, &p.Description, &p.Weight, &p.MaxScore, &p.ScoringMethod,
		&p.GradeMapping, &p.SubType, &p.KnowledgePointIDs, &p.AbilityPointIDs, &p.SortOrder,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (h *TaskEvaluationHandler) fetchReviewStep(ctx context.Context, id string) (*domain.TaskReviewStep, error) {
	var s domain.TaskReviewStep
	err := h.DB.QueryRow(ctx, `
		SELECT id, config_id, label, description, enabled, subject_type, weight, sort_order
		FROM task_review_steps WHERE id = $1
	`, id).Scan(&s.ID, &s.ConfigID, &s.Label, &s.Description, &s.Enabled, &s.SubjectType, &s.Weight, &s.SortOrder)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (h *TaskEvaluationHandler) scanConfigRows(rows pgx.Rows) ([]domain.TaskEvaluationConfig, error) {
	items := make([]domain.TaskEvaluationConfig, 0)
	for rows.Next() {
		var c domain.TaskEvaluationConfig
		if err := rows.Scan(&c.ID, &c.TaskID, &c.MethodKey, &c.Weight, &c.EvalObjects, &c.EvalSubjects, &c.EvalResources); err != nil {
			return nil, err
		}
		items = append(items, c)
	}
	return items, nil
}

func (h *TaskEvaluationHandler) scanEvalPointRows(rows pgx.Rows) ([]domain.TaskEvalPoint, error) {
	items := make([]domain.TaskEvalPoint, 0)
	for rows.Next() {
		var p domain.TaskEvalPoint
		if err := rows.Scan(
			&p.ID, &p.ConfigID, &p.Name, &p.Description, &p.Weight, &p.MaxScore, &p.ScoringMethod,
			&p.GradeMapping, &p.SubType, &p.KnowledgePointIDs, &p.AbilityPointIDs, &p.SortOrder,
		); err != nil {
			return nil, err
		}
		items = append(items, p)
	}
	return items, nil
}

func (h *TaskEvaluationHandler) scanReviewStepRows(rows pgx.Rows) ([]domain.TaskReviewStep, error) {
	items := make([]domain.TaskReviewStep, 0)
	for rows.Next() {
		var s domain.TaskReviewStep
		if err := rows.Scan(&s.ID, &s.ConfigID, &s.Label, &s.Description, &s.Enabled, &s.SubjectType, &s.Weight, &s.SortOrder); err != nil {
			return nil, err
		}
		items = append(items, s)
	}
	return items, nil
}
