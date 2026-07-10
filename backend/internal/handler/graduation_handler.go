package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/middleware"
)

type GraduationHandler struct {
	DB *pgxpool.Pool
}

type GraduationTopicListResponse struct {
	Items []domain.GraduationProjectTopic `json:"items"`
	Total int                             `json:"total"`
}

type CreateGraduationTopicRequest struct {
	Name                 string  `json:"name"`
	PositionID           string  `json:"positionId"`
	PositionName         string  `json:"positionName"`
	College              string  `json:"college"`
	Source               string  `json:"source"`
	Capacity             int     `json:"capacity"`
	AdvisorName          string  `json:"advisorName"`
	EnterpriseMentorName *string `json:"enterpriseMentorName"`
	StartDate            string  `json:"startDate"`
	EndDate              string  `json:"endDate"`
	Description          *string `json:"description"`
}

type GraduationArchiveListResponse struct {
	Items []domain.GraduationProjectArchive `json:"items"`
	Total int                               `json:"total"`
}

type CreateGraduationArchiveRequest struct {
	TopicID              string  `json:"topicId"`
	TopicName            string  `json:"topicName"`
	StudentName          string  `json:"studentName"`
	StudentID            string  `json:"studentId"`
	AdvisorName          string  `json:"advisorName"`
	EnterpriseMentorName *string `json:"enterpriseMentorName"`
	PositionName         string  `json:"positionName"`
	Phase                string  `json:"phase"`
}

type GraduationEvaluationListResponse struct {
	Items []domain.GraduationProjectEvaluation `json:"items"`
	Total int                                  `json:"total"`
}

type CreateGraduationEvaluationRequest struct {
	TopicID            string   `json:"topicId"`
	TopicName          string   `json:"topicName"`
	StudentName        string   `json:"studentName"`
	StudentID          string   `json:"studentId"`
	AdvisorScore       float64  `json:"advisorScore"`
	EnterpriseScore    *float64 `json:"enterpriseScore"`
	DefenseScore       *float64 `json:"defenseScore"`
	ComprehensiveGrade string   `json:"comprehensiveGrade"`
	IsExcellent        bool     `json:"isExcellent"`
	EvaluationTime     string   `json:"evaluationTime"`
}

type GraduationQueryListResponse struct {
	Items []domain.GraduationQueryResult `json:"items"`
	Total int                            `json:"total"`
}

func (h *GraduationHandler) ListTopics(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

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

	countQuery := "SELECT COUNT(*) FROM graduation_project_topics WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, name, position_id, position_name, college, source, status, capacity, applied_count,
			advisor_name, enterprise_mentor_name, start_date, end_date, description, created_at
		FROM graduation_project_topics
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list graduation topics")
		return
	}
	defer rows.Close()

	items, err := h.scanTopicRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan graduation topics")
		return
	}

	respondJSON(w, http.StatusOK, GraduationTopicListResponse{Items: items, Total: total})
}

func (h *GraduationHandler) GetTopic(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	topic, err := h.fetchTopic(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "graduation topic not found")
		return
	}
	respondJSON(w, http.StatusOK, topic)
}

func (h *GraduationHandler) CreateTopic(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateGraduationTopicRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" || req.PositionID == "" || req.College == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	startDate, _ := time.Parse(time.RFC3339, req.StartDate)
	endDate, _ := time.Parse(time.RFC3339, req.EndDate)

	id := "gpt-" + uuid.NewString()
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO graduation_project_topics (id, name, position_id, position_name, college, source, status, capacity, applied_count,
			advisor_name, enterprise_mentor_name, start_date, end_date, description)
		VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, 0, $8, $9, $10, $11, $12)
	`, id, req.Name, req.PositionID, req.PositionName, req.College, req.Source, req.Capacity, req.AdvisorName, req.EnterpriseMentorName, startDate, endDate, req.Description)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create graduation topic")
		return
	}

	topic, _ := h.fetchTopic(r.Context(), id)
	respondJSON(w, http.StatusCreated, topic)
}

func (h *GraduationHandler) UpdateTopic(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchTopic(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "graduation topic not found")
		return
	}

	var req CreateGraduationTopicRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	startDate, _ := time.Parse(time.RFC3339, req.StartDate)
	endDate, _ := time.Parse(time.RFC3339, req.EndDate)

	_, err := h.DB.Exec(r.Context(), `
		UPDATE graduation_project_topics SET name = $1, position_id = $2, position_name = $3, college = $4, source = $5,
			capacity = $6, advisor_name = $7, enterprise_mentor_name = $8, start_date = $9, end_date = $10, description = $11
		WHERE id = $12
	`, req.Name, req.PositionID, req.PositionName, req.College, req.Source, req.Capacity, req.AdvisorName, req.EnterpriseMentorName, startDate, endDate, req.Description, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update graduation topic")
		return
	}

	topic, _ := h.fetchTopic(r.Context(), id)
	respondJSON(w, http.StatusOK, topic)
}

func (h *GraduationHandler) DeleteTopic(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchTopic(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "graduation topic not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM graduation_project_topics WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete graduation topic")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *GraduationHandler) ApplyTopic(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	_, err := h.DB.Exec(r.Context(), `
		UPDATE graduation_project_topics SET applied_count = applied_count + 1 WHERE id = $1
	`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to apply topic")
		return
	}

	topic, _ := h.fetchTopic(r.Context(), id)
	respondJSON(w, http.StatusOK, topic)
}

func (h *GraduationHandler) ArchivesCRUD(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	if r.Method == http.MethodPost {
		var req CreateGraduationArchiveRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, http.StatusBadRequest, "invalid request body")
			return
		}
		if req.TopicID == "" || req.StudentID == "" {
			respondError(w, http.StatusBadRequest, "missing required fields")
			return
		}

		id := "gpa-" + uuid.NewString()
		_, err := h.DB.Exec(r.Context(), `
			INSERT INTO graduation_project_archives (id, topic_id, topic_name, student_name, student_id, advisor_name,
				enterprise_mentor_name, position_name, phase, doc_status, doc_count, last_updated, has_rectification)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'making', 0, NOW(), false)
		`, id, req.TopicID, req.TopicName, req.StudentName, req.StudentID, req.AdvisorName, req.EnterpriseMentorName, req.PositionName, req.Phase)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to create graduation archive")
			return
		}

		archive, _ := h.fetchArchive(r.Context(), id)
		respondJSON(w, http.StatusCreated, archive)
		return
	}

	topicID := r.URL.Query().Get("topicId")
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
	if topicID != "" {
		where = append(where, "topic_id = $"+itoa(argIdx))
		args = append(args, topicID)
		argIdx++
	}
	if search != "" {
		where = append(where, "student_name ILIKE $"+itoa(argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM graduation_project_archives WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, topic_id, topic_name, student_name, student_id, advisor_name, enterprise_mentor_name, position_name,
			phase, doc_status, doc_count, last_updated, has_rectification, created_at
		FROM graduation_project_archives
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list graduation archives")
		return
	}
	defer rows.Close()

	items := make([]domain.GraduationProjectArchive, 0)
	for rows.Next() {
		var a domain.GraduationProjectArchive
		var mentor *string
		if err := rows.Scan(&a.ID, &a.TopicID, &a.TopicName, &a.StudentName, &a.StudentID, &a.AdvisorName, &mentor, &a.PositionName,
			&a.Phase, &a.DocStatus, &a.DocCount, &a.LastUpdated, &a.HasRectification, &a.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "failed to scan graduation archives")
			return
		}
		a.EnterpriseMentorName = mentor
		items = append(items, a)
	}
	respondJSON(w, http.StatusOK, GraduationArchiveListResponse{Items: items, Total: total})
}

func (h *GraduationHandler) EvaluationsCRUD(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	if r.Method == http.MethodPost {
		var req CreateGraduationEvaluationRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, http.StatusBadRequest, "invalid request body")
			return
		}
		if req.TopicID == "" || req.StudentID == "" {
			respondError(w, http.StatusBadRequest, "missing required fields")
			return
		}

		evalTime, _ := time.Parse(time.RFC3339, req.EvaluationTime)
		id := "gpe-" + uuid.NewString()
		_, err := h.DB.Exec(r.Context(), `
			INSERT INTO graduation_project_evaluations (id, topic_id, topic_name, student_name, student_id, advisor_score,
				enterprise_score, defense_score, comprehensive_grade, is_excellent, evaluation_time, status)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
		`, id, req.TopicID, req.TopicName, req.StudentName, req.StudentID, req.AdvisorScore, req.EnterpriseScore, req.DefenseScore, req.ComprehensiveGrade, req.IsExcellent, evalTime)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to create graduation evaluation")
			return
		}

		eval, _ := h.fetchEvaluation(r.Context(), id)
		respondJSON(w, http.StatusCreated, eval)
		return
	}

	topicID := r.URL.Query().Get("topicId")
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
	if topicID != "" {
		where = append(where, "topic_id = $"+itoa(argIdx))
		args = append(args, topicID)
		argIdx++
	}
	if status != "" {
		where = append(where, "status = $"+itoa(argIdx))
		args = append(args, status)
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM graduation_project_evaluations WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, topic_id, topic_name, student_name, student_id, advisor_score, enterprise_score, defense_score,
			comprehensive_grade, is_excellent, evaluation_time, status, created_at
		FROM graduation_project_evaluations
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list graduation evaluations")
		return
	}
	defer rows.Close()

	items := make([]domain.GraduationProjectEvaluation, 0)
	for rows.Next() {
		var e domain.GraduationProjectEvaluation
		var enterpriseScore, defenseScore *float64
		if err := rows.Scan(&e.ID, &e.TopicID, &e.TopicName, &e.StudentName, &e.StudentID, &e.AdvisorScore, &enterpriseScore, &defenseScore,
			&e.ComprehensiveGrade, &e.IsExcellent, &e.EvaluationTime, &e.Status, &e.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "failed to scan graduation evaluations")
			return
		}
		e.EnterpriseScore = enterpriseScore
		e.DefenseScore = defenseScore
		items = append(items, e)
	}
	respondJSON(w, http.StatusOK, GraduationEvaluationListResponse{Items: items, Total: total})
}

func (h *GraduationHandler) QueryResults(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

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
	if search != "" {
		where = append(where, "student_name ILIKE $"+itoa(argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM graduation_query_results WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, student_name, student_id, class_name, major_name, credit_completed, credit_required,
			scene_passed, scene_required, project_grade, graduation_status, ability_cert_status, rectification_count
		FROM graduation_query_results
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY student_name
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list graduation query results")
		return
	}
	defer rows.Close()

	items := make([]domain.GraduationQueryResult, 0)
	for rows.Next() {
		var q domain.GraduationQueryResult
		var projectGrade *string
		if err := rows.Scan(&q.ID, &q.StudentName, &q.StudentID, &q.ClassName, &q.MajorName, &q.CreditCompleted, &q.CreditRequired,
			&q.ScenePassed, &q.SceneRequired, &projectGrade, &q.GraduationStatus, &q.AbilityCertStatus, &q.RectificationCount); err != nil {
			respondError(w, http.StatusInternalServerError, "failed to scan graduation query results")
			return
		}
		q.ProjectGrade = projectGrade
		items = append(items, q)
	}
	respondJSON(w, http.StatusOK, GraduationQueryListResponse{Items: items, Total: total})
}

func (h *GraduationHandler) fetchTopic(ctx context.Context, id string) (domain.GraduationProjectTopic, error) {
	var t domain.GraduationProjectTopic
	var mentor, description *string
	err := h.DB.QueryRow(ctx, `
		SELECT id, name, position_id, position_name, college, source, status, capacity, applied_count,
			advisor_name, enterprise_mentor_name, start_date, end_date, description, created_at
		FROM graduation_project_topics WHERE id = $1
	`, id).Scan(
		&t.ID, &t.Name, &t.PositionID, &t.PositionName, &t.College, &t.Source, &t.Status, &t.Capacity, &t.AppliedCount,
		&t.AdvisorName, &mentor, &t.StartDate, &t.EndDate, &description, &t.CreatedAt,
	)
	if err != nil {
		return t, err
	}
	t.EnterpriseMentorName = mentor
	t.Description = description
	return t, nil
}

func (h *GraduationHandler) scanTopicRows(rows pgx.Rows) ([]domain.GraduationProjectTopic, error) {
	items := make([]domain.GraduationProjectTopic, 0)
	for rows.Next() {
		var t domain.GraduationProjectTopic
		var mentor, description *string
		if err := rows.Scan(
			&t.ID, &t.Name, &t.PositionID, &t.PositionName, &t.College, &t.Source, &t.Status, &t.Capacity, &t.AppliedCount,
			&t.AdvisorName, &mentor, &t.StartDate, &t.EndDate, &description, &t.CreatedAt,
		); err != nil {
			return nil, err
		}
		t.EnterpriseMentorName = mentor
		t.Description = description
		items = append(items, t)
	}
	return items, nil
}

func (h *GraduationHandler) fetchArchive(ctx context.Context, id string) (domain.GraduationProjectArchive, error) {
	var a domain.GraduationProjectArchive
	var mentor *string
	err := h.DB.QueryRow(ctx, `
		SELECT id, topic_id, topic_name, student_name, student_id, advisor_name, enterprise_mentor_name, position_name,
			phase, doc_status, doc_count, last_updated, has_rectification, created_at
		FROM graduation_project_archives WHERE id = $1
	`, id).Scan(
		&a.ID, &a.TopicID, &a.TopicName, &a.StudentName, &a.StudentID, &a.AdvisorName, &mentor, &a.PositionName,
		&a.Phase, &a.DocStatus, &a.DocCount, &a.LastUpdated, &a.HasRectification, &a.CreatedAt,
	)
	if err != nil {
		return a, err
	}
	a.EnterpriseMentorName = mentor
	return a, nil
}

func (h *GraduationHandler) fetchEvaluation(ctx context.Context, id string) (domain.GraduationProjectEvaluation, error) {
	var e domain.GraduationProjectEvaluation
	var enterpriseScore, defenseScore *float64
	err := h.DB.QueryRow(ctx, `
		SELECT id, topic_id, topic_name, student_name, student_id, advisor_score, enterprise_score, defense_score,
			comprehensive_grade, is_excellent, evaluation_time, status, created_at
		FROM graduation_project_evaluations WHERE id = $1
	`, id).Scan(
		&e.ID, &e.TopicID, &e.TopicName, &e.StudentName, &e.StudentID, &e.AdvisorScore, &enterpriseScore, &defenseScore,
		&e.ComprehensiveGrade, &e.IsExcellent, &e.EvaluationTime, &e.Status, &e.CreatedAt,
	)
	if err != nil {
		return e, err
	}
	e.EnterpriseScore = enterpriseScore
	e.DefenseScore = defenseScore
	return e, nil
}
