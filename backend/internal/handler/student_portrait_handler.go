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

type StudentPortraitHandler struct {
	DB *pgxpool.Pool
}

type StudentPortraitListResponse struct {
	Items []domain.StudentAbilityPortrait `json:"items"`
	Total int                             `json:"total"`
}

type GeneratePortraitRequest struct {
	UserID           string `json:"userId"`
	CareerPositionID string `json:"careerPositionId"`
}

type StudentArchiveListResponse struct {
	Items []domain.StudentAbilityArchive `json:"items"`
	Total int                            `json:"total"`
}

type CreateStudentArchiveRequest struct {
	StudentName  string `json:"studentName"`
	StudentID    string `json:"studentId"`
	ClassName    string `json:"className"`
	MaterialType string `json:"materialType"`
	MaterialName string `json:"materialName"`
	IssuingOrg   string `json:"issuingOrg"`
	ObtainDate   string `json:"obtainDate"`
	Direction    string `json:"direction"`
}

func (h *StudentPortraitHandler) List(w http.ResponseWriter, r *http.Request) {
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

	countQuery := "SELECT COUNT(*) FROM student_ability_portraits WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, student_name, student_id, class_name, major_name, position_name, overall_grade, domain_scores,
			class_rank, class_total, major_rank, major_total, recommend_positions, updated_at, gender, grade_year, avatar_url,
			courses, scenes, completed_courses, completed_scenes, total_credits, archive_count, course_records,
			graduation_qualified, attendance_rate, diploma_badge, year_rank, year_total, dual_badge
		FROM student_ability_portraits
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY updated_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list student portraits")
		return
	}
	defer rows.Close()

	items, err := h.scanPortraitRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan student portraits")
		return
	}

	respondJSON(w, http.StatusOK, StudentPortraitListResponse{Items: items, Total: total})
}

func (h *StudentPortraitHandler) Get(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	portrait, err := h.fetchPortrait(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "student portrait not found")
		return
	}
	respondJSON(w, http.StatusOK, portrait)
}

func (h *StudentPortraitHandler) Generate(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req GeneratePortraitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.UserID == "" {
		respondError(w, http.StatusBadRequest, "missing user id")
		return
	}

	id := "sap-" + uuid.NewString()
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO student_ability_portraits (id, student_name, student_id, class_name, major_name, position_name, overall_grade,
			domain_scores, class_rank, class_total, major_rank, major_total, recommend_positions, updated_at, gender, grade_year,
			avatar_url, courses, scenes, completed_courses, completed_scenes, total_credits, archive_count, course_records,
			graduation_qualified, attendance_rate, diploma_badge, year_rank, year_total, dual_badge)
		VALUES ($1, '', $2, '', '', '', 'D', '[]', 0, 0, 0, 0, '[]', NOW(), '', '', NULL, '[]', '[]', 0, 0, 0, 0, '[]', false, 0, '', 0, 0, '')
	`, id, req.UserID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate portrait")
		return
	}

	portrait, _ := h.fetchPortrait(r.Context(), id)
	respondJSON(w, http.StatusCreated, portrait)
}

func (h *StudentPortraitHandler) ListArchives(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	studentID := r.URL.Query().Get("studentId")
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
	if studentID != "" {
		where = append(where, "student_id = $"+itoa(argIdx))
		args = append(args, studentID)
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM student_ability_archives WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, student_name, student_id, class_name, material_type, material_name, issuing_org, obtain_date,
			audit_status, audit_remark, converted_credit, direction, is_visible, level, created_at
		FROM student_ability_archives
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list student archives")
		return
	}
	defer rows.Close()

	items := make([]domain.StudentAbilityArchive, 0)
	for rows.Next() {
		var a domain.StudentAbilityArchive
		var remark, level *string
		if err := rows.Scan(&a.ID, &a.StudentName, &a.StudentID, &a.ClassName, &a.MaterialType, &a.MaterialName, &a.IssuingOrg, &a.ObtainDate,
			&a.AuditStatus, &remark, &a.ConvertedCredit, &a.Direction, &a.IsVisible, &level, &a.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "failed to scan student archives")
			return
		}
		a.AuditRemark = remark
		a.Level = level
		items = append(items, a)
	}
	respondJSON(w, http.StatusOK, StudentArchiveListResponse{Items: items, Total: total})
}

func (h *StudentPortraitHandler) CreateArchive(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateStudentArchiveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.StudentID == "" || req.MaterialName == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := "saa-" + uuid.NewString()
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO student_ability_archives (id, student_name, student_id, class_name, material_type, material_name, issuing_org, obtain_date,
			audit_status, converted_credit, direction, is_visible)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 0, $9, true)
	`, id, req.StudentName, req.StudentID, req.ClassName, req.MaterialType, req.MaterialName, req.IssuingOrg, req.ObtainDate, req.Direction)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create student archive")
		return
	}

	archive, _ := h.fetchArchive(r.Context(), id)
	respondJSON(w, http.StatusCreated, archive)
}

func (h *StudentPortraitHandler) fetchPortrait(ctx context.Context, id string) (domain.StudentAbilityPortrait, error) {
	var p domain.StudentAbilityPortrait
	var avatar *string
	err := h.DB.QueryRow(ctx, `
		SELECT id, student_name, student_id, class_name, major_name, position_name, overall_grade, domain_scores,
			class_rank, class_total, major_rank, major_total, recommend_positions, updated_at, gender, grade_year, avatar_url,
			courses, scenes, completed_courses, completed_scenes, total_credits, archive_count, course_records,
			graduation_qualified, attendance_rate, diploma_badge, year_rank, year_total, dual_badge
		FROM student_ability_portraits WHERE id = $1
	`, id).Scan(
		&p.ID, &p.StudentName, &p.StudentID, &p.ClassName, &p.MajorName, &p.PositionName, &p.OverallGrade, &p.DomainScores,
		&p.ClassRank, &p.ClassTotal, &p.MajorRank, &p.MajorTotal, &p.RecommendPositions, &p.UpdatedAt, &p.Gender, &p.GradeYear, &avatar,
		&p.Courses, &p.Scenes, &p.CompletedCourses, &p.CompletedScenes, &p.TotalCredits, &p.ArchiveCount, &p.CourseRecords,
		&p.GraduationQualified, &p.AttendanceRate, &p.DiplomaBadge, &p.YearRank, &p.YearTotal, &p.DualBadge,
	)
	if err != nil {
		return p, err
	}
	p.AvatarURL = avatar
	return p, nil
}

func (h *StudentPortraitHandler) scanPortraitRows(rows pgx.Rows) ([]domain.StudentAbilityPortrait, error) {
	items := make([]domain.StudentAbilityPortrait, 0)
	for rows.Next() {
		var p domain.StudentAbilityPortrait
		var avatar *string
		if err := rows.Scan(
			&p.ID, &p.StudentName, &p.StudentID, &p.ClassName, &p.MajorName, &p.PositionName, &p.OverallGrade, &p.DomainScores,
			&p.ClassRank, &p.ClassTotal, &p.MajorRank, &p.MajorTotal, &p.RecommendPositions, &p.UpdatedAt, &p.Gender, &p.GradeYear, &avatar,
			&p.Courses, &p.Scenes, &p.CompletedCourses, &p.CompletedScenes, &p.TotalCredits, &p.ArchiveCount, &p.CourseRecords,
			&p.GraduationQualified, &p.AttendanceRate, &p.DiplomaBadge, &p.YearRank, &p.YearTotal, &p.DualBadge,
		); err != nil {
			return nil, err
		}
		p.AvatarURL = avatar
		items = append(items, p)
	}
	return items, nil
}

func (h *StudentPortraitHandler) fetchArchive(ctx context.Context, id string) (domain.StudentAbilityArchive, error) {
	var a domain.StudentAbilityArchive
	var remark, level *string
	err := h.DB.QueryRow(ctx, `
		SELECT id, student_name, student_id, class_name, material_type, material_name, issuing_org, obtain_date,
			audit_status, audit_remark, converted_credit, direction, is_visible, level, created_at
		FROM student_ability_archives WHERE id = $1
	`, id).Scan(
		&a.ID, &a.StudentName, &a.StudentID, &a.ClassName, &a.MaterialType, &a.MaterialName, &a.IssuingOrg, &a.ObtainDate,
		&a.AuditStatus, &remark, &a.ConvertedCredit, &a.Direction, &a.IsVisible, &level, &a.CreatedAt,
	)
	if err != nil {
		return a, err
	}
	a.AuditRemark = remark
	a.Level = level
	return a, nil
}
