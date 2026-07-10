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

type CourseHandler struct {
	DB *pgxpool.Pool
}

type CourseListResponse struct {
	Items []domain.Course `json:"items"`
	Total int             `json:"total"`
}

type CreateCourseRequest struct {
	Code          string   `json:"code"`
	Name          string   `json:"name"`
	Type          string   `json:"type"`
	Category      string   `json:"category"`
	Major         *string  `json:"major"`
	TeacherID     *string  `json:"teacherId"`
	Industry      *string  `json:"industry"`
	Version       *string  `json:"version"`
	OnlineHours   *float64 `json:"onlineHours"`
	OfflineHours  *float64 `json:"offlineHours"`
	OnlineWeight  *float64 `json:"onlineWeight"`
	OfflineWeight *float64 `json:"offlineWeight"`
	Semester      *string  `json:"semester"`
	ClassName     *string  `json:"className"`
	CoverColor    *string  `json:"coverColor"`
	CoverImage    *string  `json:"coverImage"`
	CourseTag     *string  `json:"courseTag"`
	CoCreatorIds  domain.JSONSlice `json:"coCreatorIds"`
	BatchGroup    *string  `json:"batchGroup"`
}

type UpdateCourseRequest struct {
	Code          string   `json:"code"`
	Name          string   `json:"name"`
	Type          string   `json:"type"`
	Category      string   `json:"category"`
	Major         *string  `json:"major"`
	TeacherID     *string  `json:"teacherId"`
	Industry      *string  `json:"industry"`
	Version       *string  `json:"version"`
	OnlineHours   *float64 `json:"onlineHours"`
	OfflineHours  *float64 `json:"offlineHours"`
	OnlineWeight  *float64 `json:"onlineWeight"`
	OfflineWeight *float64 `json:"offlineWeight"`
	Semester      *string  `json:"semester"`
	ClassName     *string  `json:"className"`
	CoverColor    *string  `json:"coverColor"`
	CoverImage    *string  `json:"coverImage"`
	CourseTag     *string  `json:"courseTag"`
	CoCreatorIds  domain.JSONSlice `json:"coCreatorIds"`
	BatchGroup    *string  `json:"batchGroup"`
}

type ReviewCourseRequest struct {
	Status  string  `json:"status"`
	Comment *string `json:"comment"`
}

func (h *CourseHandler) List(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	courseType := r.URL.Query().Get("type")
	category := r.URL.Query().Get("category")
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

	if courseType != "" {
		where = append(where, "type = $"+itoa(argIdx))
		args = append(args, courseType)
		argIdx++
	}
	if category != "" {
		where = append(where, "category = $"+itoa(argIdx))
		args = append(args, category)
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

	countQuery := "SELECT COUNT(*) FROM courses WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, code, name, type, category, major, teacher_id, industry, version,
			online_hours, offline_hours, online_weight, offline_weight, semester, class_name,
			status, cover_color, cover_image, course_tag, creator_id, co_creator_ids, batch_group,
			node_count, resource_count, view_count, study_count, created_at, updated_at
		FROM courses
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list courses")
		return
	}
	defer rows.Close()

	items, err := h.scanCourseRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan courses")
		return
	}

	respondJSON(w, http.StatusOK, CourseListResponse{Items: items, Total: total})
}

func (h *CourseHandler) Get(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	course, err := h.fetchCourse(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "course not found")
		return
	}
	respondJSON(w, http.StatusOK, course)
}

func (h *CourseHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Code == "" || req.Name == "" || req.Type == "" || req.Category == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := "course-" + uuid.NewString()
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO courses (id, code, name, type, category, major, teacher_id, industry, version,
			online_hours, offline_hours, online_weight, offline_weight, semester, class_name,
			status, cover_color, cover_image, course_tag, creator_id, co_creator_ids, batch_group,
			node_count, resource_count, view_count, study_count)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'draft', $16, $17, $18, $19, $20, $21, 0, 0, 0, 0)
	`, id, req.Code, req.Name, req.Type, req.Category, req.Major, req.TeacherID, req.Industry, req.Version,
		req.OnlineHours, req.OfflineHours, req.OnlineWeight, req.OfflineWeight, req.Semester, req.ClassName,
		req.CoverColor, req.CoverImage, req.CourseTag, claims.UserID, req.CoCreatorIds, req.BatchGroup)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create course")
		return
	}

	course, _ := h.fetchCourse(r.Context(), id)
	respondJSON(w, http.StatusCreated, course)
}

func (h *CourseHandler) Update(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchCourse(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "course not found")
		return
	}

	var req UpdateCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Code == "" || req.Name == "" || req.Type == "" || req.Category == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE courses SET code = $1, name = $2, type = $3, category = $4, major = $5, teacher_id = $6,
			industry = $7, version = $8, online_hours = $9, offline_hours = $10, online_weight = $11,
			offline_weight = $12, semester = $13, class_name = $14, cover_color = $15, cover_image = $16,
			course_tag = $17, co_creator_ids = $18, batch_group = $19, updated_at = NOW()
		WHERE id = $20
	`, req.Code, req.Name, req.Type, req.Category, req.Major, req.TeacherID, req.Industry, req.Version,
		req.OnlineHours, req.OfflineHours, req.OnlineWeight, req.OfflineWeight, req.Semester, req.ClassName,
		req.CoverColor, req.CoverImage, req.CourseTag, req.CoCreatorIds, req.BatchGroup, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update course")
		return
	}

	course, _ := h.fetchCourse(r.Context(), id)
	respondJSON(w, http.StatusOK, course)
}

func (h *CourseHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchCourse(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "course not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM courses WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete course")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *CourseHandler) Submit(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}
	h.transitionStatus(w, r, domain.CourseStatusPending, "")
}

func (h *CourseHandler) Review(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	var req ReviewCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var status domain.CourseStatus
	switch req.Status {
	case "pending":
		status = domain.CourseStatusPending
	case "rejected":
		status = domain.CourseStatusRejected
	case "published":
		status = domain.CourseStatusPublished
	default:
		status = domain.CourseStatus(req.Status)
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE courses SET status = $1, updated_at = NOW() WHERE id = $2
	`, status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to review course")
		return
	}

	course, _ := h.fetchCourse(r.Context(), id)
	respondJSON(w, http.StatusOK, course)
}

func (h *CourseHandler) Publish(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}
	h.transitionStatus(w, r, domain.CourseStatusPublished, "")
}

func (h *CourseHandler) transitionStatus(w http.ResponseWriter, r *http.Request, status domain.CourseStatus, comment string) {
	id := chi.URLParam(r, "id")
	_, err := h.DB.Exec(r.Context(), `
		UPDATE courses SET status = $1, updated_at = NOW() WHERE id = $2
	`, status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update status")
		return
	}

	course, _ := h.fetchCourse(r.Context(), id)
	if course == nil {
		respondError(w, http.StatusNotFound, "course not found")
		return
	}
	_ = comment
	respondJSON(w, http.StatusOK, course)
}

func (h *CourseHandler) fetchCourse(ctx context.Context, id string) (*domain.Course, error) {
	var c domain.Course
	err := h.DB.QueryRow(ctx, `
		SELECT id, code, name, type, category, major, teacher_id, industry, version,
			online_hours, offline_hours, online_weight, offline_weight, semester, class_name,
			status, cover_color, cover_image, course_tag, creator_id, co_creator_ids, batch_group,
			node_count, resource_count, view_count, study_count, created_at, updated_at
		FROM courses WHERE id = $1
	`, id).Scan(
		&c.ID, &c.Code, &c.Name, &c.Type, &c.Category, &c.Major, &c.TeacherID, &c.Industry, &c.Version,
		&c.OnlineHours, &c.OfflineHours, &c.OnlineWeight, &c.OfflineWeight, &c.Semester, &c.ClassName,
		&c.Status, &c.CoverColor, &c.CoverImage, &c.CourseTag, &c.CreatorID, &c.CoCreatorIds, &c.BatchGroup,
		&c.NodeCount, &c.ResourceCount, &c.ViewCount, &c.StudyCount, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (h *CourseHandler) scanCourseRows(rows pgx.Rows) ([]domain.Course, error) {
	items := make([]domain.Course, 0)
	for rows.Next() {
		var c domain.Course
		if err := rows.Scan(
			&c.ID, &c.Code, &c.Name, &c.Type, &c.Category, &c.Major, &c.TeacherID, &c.Industry, &c.Version,
			&c.OnlineHours, &c.OfflineHours, &c.OnlineWeight, &c.OfflineWeight, &c.Semester, &c.ClassName,
			&c.Status, &c.CoverColor, &c.CoverImage, &c.CourseTag, &c.CreatorID, &c.CoCreatorIds, &c.BatchGroup,
			&c.NodeCount, &c.ResourceCount, &c.ViewCount, &c.StudyCount, &c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, c)
	}
	return items, nil
}
