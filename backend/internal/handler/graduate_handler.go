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

type GraduateHandler struct {
	DB *pgxpool.Pool
}

type GraduateListResponse struct {
	Items []domain.Graduate `json:"items"`
	Total int               `json:"total"`
}

type CreateGraduateRequest struct {
	TenantID     string  `json:"tenantId"`
	UserID       *string `json:"userId"`
	Name         string  `json:"name"`
	StudentNo    *string `json:"studentNo"`
	IDCard       *string `json:"idCard"`
	EnrollYear   *int    `json:"enrollYear"`
	GraduateYear *int    `json:"graduateYear"`
	MajorName    *string `json:"majorName"`
	ClassName    *string `json:"className"`
}

type UpdateGraduateRequest struct {
	UserID       *string `json:"userId"`
	Name         string  `json:"name"`
	StudentNo    *string `json:"studentNo"`
	IDCard       *string `json:"idCard"`
	EnrollYear   *int    `json:"enrollYear"`
	GraduateYear *int    `json:"graduateYear"`
	MajorName    *string `json:"majorName"`
	ClassName    *string `json:"className"`
}

func (h *GraduateHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := r.URL.Query().Get("tenantId")
	search := r.URL.Query().Get("search")
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	if tenantID == "" {
		respondError(w, http.StatusBadRequest, "tenantId is required")
		return
	}

	limit := 50
	offset := 0
	if v, err := parseInt(limitStr, 50); err == nil && v > 0 {
		limit = v
	}
	if v, err := parseInt(offsetStr, 0); err == nil && v >= 0 {
		offset = v
	}

	where := []string{"tenant_id = $1"}
	args := []interface{}{tenantID}
	argIdx := 2

	if search != "" {
		where = append(where, "(name ILIKE $"+itoa(argIdx)+" OR student_no ILIKE $"+itoa(argIdx)+")")
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM graduates WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, tenant_id, user_id, name, student_no, id_card, enroll_year, graduate_year, major_name, class_name, created_at
		FROM graduates
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list graduates")
		return
	}
	defer rows.Close()

	items, err := h.scanGraduateRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan graduates")
		return
	}

	respondJSON(w, http.StatusOK, GraduateListResponse{Items: items, Total: total})
}

func (h *GraduateHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	graduate, err := h.fetchGraduate(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "graduate not found")
		return
	}
	respondJSON(w, http.StatusOK, graduate)
}

func (h *GraduateHandler) Create(w http.ResponseWriter, r *http.Request) {
	if !h.canManageUsers(r) {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateGraduateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.TenantID == "" || req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := uuid.NewString()
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO graduates (id, tenant_id, user_id, name, student_no, id_card, enroll_year, graduate_year, major_name, class_name)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, id, req.TenantID, req.UserID, req.Name, req.StudentNo, req.IDCard, req.EnrollYear, req.GraduateYear, req.MajorName, req.ClassName)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create graduate")
		return
	}

	graduate, _ := h.fetchGraduate(r.Context(), id)
	respondJSON(w, http.StatusCreated, graduate)
}

func (h *GraduateHandler) Update(w http.ResponseWriter, r *http.Request) {
	if !h.canManageUsers(r) {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchGraduate(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "graduate not found")
		return
	}

	var req UpdateGraduateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE graduates SET user_id = $1, name = $2, student_no = $3, id_card = $4,
			enroll_year = $5, graduate_year = $6, major_name = $7, class_name = $8
		WHERE id = $9
	`, req.UserID, req.Name, req.StudentNo, req.IDCard, req.EnrollYear, req.GraduateYear, req.MajorName, req.ClassName, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update graduate")
		return
	}

	graduate, _ := h.fetchGraduate(r.Context(), id)
	respondJSON(w, http.StatusOK, graduate)
}

func (h *GraduateHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if !h.canManageUsers(r) {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchGraduate(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "graduate not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM graduates WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete graduate")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *GraduateHandler) canManageUsers(r *http.Request) bool {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		return false
	}
	if claims.Role == domain.UserRoleOperator {
		return true
	}
	return claims.Platform == domain.UserPlatformPortal && h.currentIdentityCode(r) == "school_admin"
}

func (h *GraduateHandler) currentIdentityCode(r *http.Request) string {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.IdentityTypeID == nil {
		return ""
	}
	var code string
	_ = h.DB.QueryRow(r.Context(), `SELECT code FROM identity_types WHERE id = $1`, *claims.IdentityTypeID).Scan(&code)
	return code
}

func (h *GraduateHandler) fetchGraduate(ctx context.Context, id string) (domain.Graduate, error) {
	var g domain.Graduate
	var userID, studentNo, idCard, majorName, className *string
	var enrollYear, graduateYear *int

	err := h.DB.QueryRow(ctx, `
		SELECT id, tenant_id, user_id, name, student_no, id_card, enroll_year, graduate_year, major_name, class_name, created_at
		FROM graduates WHERE id = $1
	`, id).Scan(
		&g.ID, &g.TenantID, &userID, &g.Name, &studentNo, &idCard, &enrollYear, &graduateYear, &majorName, &className, &g.CreatedAt,
	)
	if err != nil {
		return g, err
	}
	g.UserID = userID
	g.StudentNo = studentNo
	g.IDCard = idCard
	g.EnrollYear = enrollYear
	g.GraduateYear = graduateYear
	g.MajorName = majorName
	g.ClassName = className
	return g, nil
}

func (h *GraduateHandler) scanGraduateRows(rows pgx.Rows) ([]domain.Graduate, error) {
	items := make([]domain.Graduate, 0)
	for rows.Next() {
		var g domain.Graduate
		var userID, studentNo, idCard, majorName, className *string
		var enrollYear, graduateYear *int
		if err := rows.Scan(
			&g.ID, &g.TenantID, &userID, &g.Name, &studentNo, &idCard, &enrollYear, &graduateYear, &majorName, &className, &g.CreatedAt,
		); err != nil {
			return nil, err
		}
		g.UserID = userID
		g.StudentNo = studentNo
		g.IDCard = idCard
		g.EnrollYear = enrollYear
		g.GraduateYear = graduateYear
		g.MajorName = majorName
		g.ClassName = className
		items = append(items, g)
	}
	return items, nil
}
