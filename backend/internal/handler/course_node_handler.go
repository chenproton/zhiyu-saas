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

type CourseNodeHandler struct {
	DB *pgxpool.Pool
}

type CourseNodeListResponse struct {
	Items []domain.SystemCourseNode `json:"items"`
	Total int                       `json:"total"`
}

type CreateCourseNodeRequest struct {
	CourseID          string           `json:"courseId"`
	ParentID          *string          `json:"parentId"`
	Name              string           `json:"name"`
	SortOrder         int              `json:"sortOrder"`
	RefType           string           `json:"refType"`
	SourceID          *string          `json:"sourceId"`
	SourceName        *string          `json:"sourceName"`
	TeachingGoals     *string          `json:"teachingGoals"`
	Duration          *float64         `json:"duration"`
	KnowledgePointIds domain.JSONSlice `json:"knowledgePointIds"`
	ResourceIds       domain.JSONSlice `json:"resourceIds"`
	Status            string           `json:"status"`
}

type UpdateCourseNodeRequest struct {
	Name              string           `json:"name"`
	SortOrder         int              `json:"sortOrder"`
	RefType           string           `json:"refType"`
	SourceID          *string          `json:"sourceId"`
	SourceName        *string          `json:"sourceName"`
	TeachingGoals     *string          `json:"teachingGoals"`
	Duration          *float64         `json:"duration"`
	KnowledgePointIds domain.JSONSlice `json:"knowledgePointIds"`
	ResourceIds       domain.JSONSlice `json:"resourceIds"`
	Status            string           `json:"status"`
}

type ReorderCourseNodesRequest struct {
	CourseID string   `json:"courseId"`
	NodeIDs  []string `json:"nodeIds"`
}

func (h *CourseNodeHandler) List(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	courseID := r.URL.Query().Get("courseId")
	parentID := r.URL.Query().Get("parentId")

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

	if courseID != "" {
		where = append(where, "course_id = $"+itoa(argIdx))
		args = append(args, courseID)
		argIdx++
	}
	if parentID != "" {
		where = append(where, "parent_id = $"+itoa(argIdx))
		args = append(args, parentID)
		argIdx++
	} else if r.URL.Query().Get("rootOnly") == "true" {
		where = append(where, "parent_id IS NULL")
	}

	countQuery := "SELECT COUNT(*) FROM system_course_nodes WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT n.id, n.course_id, n.parent_id, n.name, n.sort_order, n.ref_type, n.source_id, n.source_name,
			n.teaching_goals, n.duration,
			(SELECT COALESCE(array_agg(kp.knowledge_point_id), '{}') FROM node_knowledge_point_bindings kp WHERE kp.node_id = n.id) AS knowledge_point_ids,
			(SELECT COALESCE(array_agg(rb.resource_id), '{}') FROM node_resource_bindings rb WHERE rb.node_id = n.id) AS resource_ids,
			n.status, n.created_at, n.updated_at
		FROM system_course_nodes n
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY n.sort_order ASC, n.created_at ASC
	`

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list course nodes")
		return
	}
	defer rows.Close()

	items, err := h.scanCourseNodeRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan course nodes")
		return
	}

	respondJSON(w, http.StatusOK, CourseNodeListResponse{Items: items, Total: total})
}

func (h *CourseNodeHandler) Get(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	node, err := h.fetchCourseNode(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "course node not found")
		return
	}
	respondJSON(w, http.StatusOK, node)
}

func (h *CourseNodeHandler) Create(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateCourseNodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.CourseID == "" || req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := uuid.NewString()
	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to begin transaction")
		return
	}
	defer tx.Rollback(r.Context())

	_, err = tx.Exec(r.Context(), `
		INSERT INTO system_course_nodes (id, course_id, parent_id, name, sort_order, ref_type, source_id, source_name,
			teaching_goals, duration, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, id, req.CourseID, req.ParentID, req.Name, req.SortOrder, req.RefType, req.SourceID, req.SourceName,
		req.TeachingGoals, req.Duration, req.Status)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create course node")
		return
	}

	for _, v := range req.KnowledgePointIds {
		kpID, ok := v.(string)
		if !ok || kpID == "" {
			continue
		}
		_, err = tx.Exec(r.Context(), `INSERT INTO node_knowledge_point_bindings (node_id, knowledge_point_id) VALUES ($1, $2)`, id, kpID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to insert knowledge point binding")
			return
		}
	}
	for _, v := range req.ResourceIds {
		resID, ok := v.(string)
		if !ok || resID == "" {
			continue
		}
		_, err = tx.Exec(r.Context(), `INSERT INTO node_resource_bindings (node_id, resource_id) VALUES ($1, $2)`, id, resID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to insert resource binding")
			return
		}
	}

	if err := tx.Commit(r.Context()); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to commit")
		return
	}

	node, _ := h.fetchCourseNode(r.Context(), id)
	respondJSON(w, http.StatusCreated, node)
}

func (h *CourseNodeHandler) Update(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchCourseNode(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "course node not found")
		return
	}

	var req UpdateCourseNodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	if req.KnowledgePointIds == nil {
		req.KnowledgePointIds = domain.JSONSlice{}
	}
	if req.ResourceIds == nil {
		req.ResourceIds = domain.JSONSlice{}
	}

	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to begin transaction")
		return
	}
	defer tx.Rollback(r.Context())

	_, err = tx.Exec(r.Context(), `
		UPDATE system_course_nodes SET name = $1, sort_order = $2, ref_type = $3, source_id = $4,
			source_name = $5, teaching_goals = $6, duration = $7,
			status = $8, updated_at = NOW()
		WHERE id = $9
	`, req.Name, req.SortOrder, req.RefType, req.SourceID, req.SourceName, req.TeachingGoals,
		req.Duration, req.Status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update course node")
		return
	}

	_, err = tx.Exec(r.Context(), `DELETE FROM node_knowledge_point_bindings WHERE node_id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to clear knowledge point bindings")
		return
	}
	_, err = tx.Exec(r.Context(), `DELETE FROM node_resource_bindings WHERE node_id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to clear resource bindings")
		return
	}

	for _, v := range req.KnowledgePointIds {
		kpID, ok := v.(string)
		if !ok || kpID == "" {
			continue
		}
		_, err = tx.Exec(r.Context(), `INSERT INTO node_knowledge_point_bindings (node_id, knowledge_point_id) VALUES ($1, $2)`, id, kpID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to insert knowledge point binding")
			return
		}
	}
	for _, v := range req.ResourceIds {
		resID, ok := v.(string)
		if !ok || resID == "" {
			continue
		}
		_, err = tx.Exec(r.Context(), `INSERT INTO node_resource_bindings (node_id, resource_id) VALUES ($1, $2)`, id, resID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to insert resource binding")
			return
		}
	}

	if err := tx.Commit(r.Context()); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to commit")
		return
	}

	node, _ := h.fetchCourseNode(r.Context(), id)
	respondJSON(w, http.StatusOK, node)
}

func (h *CourseNodeHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchCourseNode(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "course node not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM system_course_nodes WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete course node")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *CourseNodeHandler) Reorder(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req ReorderCourseNodesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.CourseID == "" || len(req.NodeIDs) == 0 {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to begin transaction")
		return
	}
	defer tx.Rollback(r.Context())

	for i, nodeID := range req.NodeIDs {
		_, err := tx.Exec(r.Context(), `
			UPDATE system_course_nodes SET sort_order = $1, updated_at = NOW()
			WHERE id = $2 AND course_id = $3
		`, i, nodeID, req.CourseID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to reorder nodes")
			return
		}
	}

	if err := tx.Commit(r.Context()); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to commit")
		return
	}

	respondJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *CourseNodeHandler) fetchCourseNode(ctx context.Context, id string) (*domain.SystemCourseNode, error) {
	var n domain.SystemCourseNode
	err := h.DB.QueryRow(ctx, `
		SELECT n.id, n.course_id, n.parent_id, n.name, n.sort_order, n.ref_type, n.source_id, n.source_name,
			n.teaching_goals, n.duration,
			(SELECT COALESCE(array_agg(kp.knowledge_point_id), '{}') FROM node_knowledge_point_bindings kp WHERE kp.node_id = n.id) AS knowledge_point_ids,
			(SELECT COALESCE(array_agg(rb.resource_id), '{}') FROM node_resource_bindings rb WHERE rb.node_id = n.id) AS resource_ids,
			n.status, n.created_at, n.updated_at
		FROM system_course_nodes n WHERE n.id = $1
	`, id).Scan(
		&n.ID, &n.CourseID, &n.ParentID, &n.Name, &n.SortOrder, &n.RefType, &n.SourceID, &n.SourceName,
		&n.TeachingGoals, &n.Duration, &n.KnowledgePointIds, &n.ResourceIds, &n.Status, &n.CreatedAt, &n.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &n, nil
}

func (h *CourseNodeHandler) scanCourseNodeRows(rows pgx.Rows) ([]domain.SystemCourseNode, error) {
	items := make([]domain.SystemCourseNode, 0)
	for rows.Next() {
		var n domain.SystemCourseNode
		if err := rows.Scan(
			&n.ID, &n.CourseID, &n.ParentID, &n.Name, &n.SortOrder, &n.RefType, &n.SourceID, &n.SourceName,
			&n.TeachingGoals, &n.Duration, &n.KnowledgePointIds, &n.ResourceIds, &n.Status, &n.CreatedAt, &n.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, n)
	}
	return items, nil
}
