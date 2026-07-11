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

type ScenarioHandler struct {
	DB *pgxpool.Pool
}

type ScenarioListResponse struct {
	Items []domain.Scenario `json:"items"`
	Total int               `json:"total"`
}

type CreateScenarioRequest struct {
	Name             string   `json:"name"`
	Code             string   `json:"code"`
	CoverImage       *string  `json:"coverImage"`
	CareerPositionID *string  `json:"careerPositionId"`
	IndustryID       *string  `json:"industryId"`
	IndustryName     *string  `json:"industryName"`
	ProfessionID     *string  `json:"professionId"`
	ProfessionName   *string  `json:"professionName"`
	BatchID          *string  `json:"batchId"`
	Difficulty       int      `json:"difficulty"`
	Version          string   `json:"version"`
	Background       *string  `json:"background"`
	DeliveryGoal     *string  `json:"deliveryGoal"`
	CoBuilderIDs     []string `json:"coBuilderIds"`
}

type ReviewScenarioRequest struct {
	Status  string  `json:"status"`
	Comment *string `json:"comment"`
}

func (h *ScenarioHandler) List(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	status := r.URL.Query().Get("status")
	batchID := r.URL.Query().Get("batchId")
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
	if batchID != "" {
		where = append(where, "batch_id = $"+itoa(argIdx))
		args = append(args, batchID)
		argIdx++
	}
	if search != "" {
		where = append(where, "(name ILIKE $"+itoa(argIdx)+" OR code ILIKE $"+itoa(argIdx)+")")
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM scenarios WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, name, code, cover_image, career_position_id, industry_id, industry_name,
			profession_id, profession_name, batch_id, difficulty, version, status, background,
			delivery_goal, creator_id, co_builder_ids, created_at, updated_at, publish_time, view_count
		FROM scenarios
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list scenarios")
		return
	}
	defer rows.Close()

	items, err := h.scanScenarioRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan scenarios")
		return
	}

	respondJSON(w, http.StatusOK, ScenarioListResponse{Items: items, Total: total})
}

func (h *ScenarioHandler) Get(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	scenario, err := h.fetchScenario(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "scenario not found")
		return
	}
	respondJSON(w, http.StatusOK, scenario)
}

func (h *ScenarioHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req CreateScenarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" || req.Code == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}
	if req.Version == "" {
		req.Version = "v1.0"
	}

	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO scenarios (name, code, cover_image, career_position_id, industry_id, industry_name,
			profession_id, profession_name, batch_id, difficulty, version, status, background,
			delivery_goal, creator_id, co_builder_ids)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'draft', $12, $13, $14, $15)
	`, req.Name, req.Code, req.CoverImage, req.CareerPositionID, req.IndustryID, req.IndustryName,
		req.ProfessionID, req.ProfessionName, req.BatchID, req.Difficulty, req.Version, req.Background,
		req.DeliveryGoal, claims.UserID, coalesceStringSlice(req.CoBuilderIDs))
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create scenario")
		return
	}

	scenario, _ := h.fetchScenarioByCode(r.Context(), req.Code)
	respondJSON(w, http.StatusCreated, scenario)
}

func (h *ScenarioHandler) Update(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchScenario(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "scenario not found")
		return
	}

	var req CreateScenarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE scenarios SET name = $1, code = $2, cover_image = $3, career_position_id = $4,
			industry_id = $5, industry_name = $6, profession_id = $7, profession_name = $8,
			batch_id = $9, difficulty = $10, version = $11, background = $12, delivery_goal = $13,
			co_builder_ids = $14, updated_at = NOW()
		WHERE id = $15
	`, req.Name, req.Code, req.CoverImage, req.CareerPositionID, req.IndustryID, req.IndustryName,
		req.ProfessionID, req.ProfessionName, req.BatchID, req.Difficulty, req.Version, req.Background,
		req.DeliveryGoal, coalesceStringSlice(req.CoBuilderIDs), id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update scenario")
		return
	}

	scenario, _ := h.fetchScenario(r.Context(), id)
	respondJSON(w, http.StatusOK, scenario)
}

func (h *ScenarioHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchScenario(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "scenario not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM scenarios WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete scenario")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *ScenarioHandler) Submit(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	h.transitionStatus(w, r, domain.ScenarioStatusPending)
}

func (h *ScenarioHandler) Withdraw(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	h.transitionStatus(w, r, domain.ScenarioStatusDraft)
}

func (h *ScenarioHandler) Review(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	var req ReviewScenarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var status domain.ScenarioStatus
	switch req.Status {
	case "approved":
		status = domain.ScenarioStatusApproved
	case "rejected":
		status = domain.ScenarioStatusRejected
	default:
		respondError(w, http.StatusBadRequest, "invalid review status")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE scenarios SET status = $1, updated_at = NOW() WHERE id = $2
	`, status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to review scenario")
		return
	}

	scenario, _ := h.fetchScenario(r.Context(), id)
	respondJSON(w, http.StatusOK, scenario)
}

func (h *ScenarioHandler) Publish(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	h.transitionStatus(w, r, domain.ScenarioStatusPublished)
}

func (h *ScenarioHandler) Archive(w http.ResponseWriter, r *http.Request) {
	if middleware.CurrentUser(r) == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	h.transitionStatus(w, r, domain.ScenarioStatusArchived)
}

func (h *ScenarioHandler) Invite(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	id := chi.URLParam(r, "id")
	var req InviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.UserID == "" {
		respondError(w, http.StatusBadRequest, "userId is required")
		return
	}
	_, err := h.DB.Exec(r.Context(), `
		UPDATE scenarios SET co_builder_ids = array_append(co_builder_ids, $1), updated_at = NOW()
		WHERE id = $2 AND NOT (co_builder_ids @> ARRAY[$1]::uuid[])
	`, req.UserID, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to invite co-builder")
		return
	}
	scenario, _ := h.fetchScenario(r.Context(), id)
	if scenario == nil {
		respondError(w, http.StatusNotFound, "scenario not found")
		return
	}
	respondJSON(w, http.StatusOK, scenario)
}

func (h *ScenarioHandler) transitionStatus(w http.ResponseWriter, r *http.Request, status domain.ScenarioStatus) {
	id := chi.URLParam(r, "id")
	_, err := h.DB.Exec(r.Context(), `
		UPDATE scenarios SET status = $1, updated_at = NOW() WHERE id = $2
	`, status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update status")
		return
	}

	scenario, err := h.fetchScenario(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "scenario not found")
		return
	}
	respondJSON(w, http.StatusOK, scenario)
}

func (h *ScenarioHandler) fetchScenario(ctx context.Context, id string) (*domain.Scenario, error) {
	var s domain.Scenario
	err := h.DB.QueryRow(ctx, `
		SELECT id, name, code, cover_image, career_position_id, industry_id, industry_name,
			profession_id, profession_name, batch_id, difficulty, version, status, background,
			delivery_goal, creator_id, co_builder_ids, created_at, updated_at, publish_time, view_count
		FROM scenarios WHERE id = $1
	`, id).Scan(
		&s.ID, &s.Name, &s.Code, &s.CoverImage, &s.CareerPositionID, &s.IndustryID, &s.IndustryName,
		&s.ProfessionID, &s.ProfessionName, &s.BatchID, &s.Difficulty, &s.Version, &s.Status, &s.Background,
		&s.DeliveryGoal, &s.CreatorID, &s.CoBuilderIDs, &s.CreatedAt, &s.UpdatedAt, &s.PublishTime, &s.ViewCount,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (h *ScenarioHandler) fetchScenarioByCode(ctx context.Context, code string) (*domain.Scenario, error) {
	var s domain.Scenario
	err := h.DB.QueryRow(ctx, `
		SELECT id, name, code, cover_image, career_position_id, industry_id, industry_name,
			profession_id, profession_name, batch_id, difficulty, version, status, background,
			delivery_goal, creator_id, co_builder_ids, created_at, updated_at, publish_time, view_count
		FROM scenarios WHERE code = $1
	`, code).Scan(
		&s.ID, &s.Name, &s.Code, &s.CoverImage, &s.CareerPositionID, &s.IndustryID, &s.IndustryName,
		&s.ProfessionID, &s.ProfessionName, &s.BatchID, &s.Difficulty, &s.Version, &s.Status, &s.Background,
		&s.DeliveryGoal, &s.CreatorID, &s.CoBuilderIDs, &s.CreatedAt, &s.UpdatedAt, &s.PublishTime, &s.ViewCount,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (h *ScenarioHandler) scanScenarioRows(rows pgx.Rows) ([]domain.Scenario, error) {
	items := make([]domain.Scenario, 0)
	for rows.Next() {
		var s domain.Scenario
		if err := rows.Scan(
			&s.ID, &s.Name, &s.Code, &s.CoverImage, &s.CareerPositionID, &s.IndustryID, &s.IndustryName,
			&s.ProfessionID, &s.ProfessionName, &s.BatchID, &s.Difficulty, &s.Version, &s.Status, &s.Background,
			&s.DeliveryGoal, &s.CreatorID, &s.CoBuilderIDs, &s.CreatedAt, &s.UpdatedAt, &s.PublishTime, &s.ViewCount,
		); err != nil {
			return nil, err
		}
		items = append(items, s)
	}
	return items, nil
}
