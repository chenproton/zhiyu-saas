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

type CertificationHandler struct {
	DB *pgxpool.Pool
}

type CertificationRuleListResponse struct {
	Items []domain.CertificationRule `json:"items"`
	Total int                        `json:"total"`
}

type CreateCertificationRuleRequest struct {
	PositionID   string `json:"positionId"`
	PositionName string `json:"positionName"`
	RuleSource   string `json:"ruleSource"`
}

type CertificationItemListResponse struct {
	Items []domain.CertificationAbilityItem `json:"items"`
	Total int                               `json:"total"`
}

type CreateCertificationItemRequest struct {
	Name      string `json:"name"`
	SortOrder int    `json:"sortOrder"`
}

type CertificationPointListResponse struct {
	Items []domain.CertificationAbilityPoint `json:"items"`
	Total int                                `json:"total"`
}

type CreateCertificationPointRequest struct {
	AbilityPointID     string           `json:"abilityPointId"`
	MappingType        string           `json:"mappingType"`
	CustomLevelMapping domain.JSONSlice `json:"customLevelMapping"`
	RequiredLevel      string           `json:"requiredLevel"`
	Weight             float64          `json:"weight"`
}

func (h *CertificationHandler) ListRules(w http.ResponseWriter, r *http.Request) {
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
		where = append(where, "position_name ILIKE $"+itoa(argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM certification_rules WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, position_id, position_name, status, rule_source, created_at, updated_at
		FROM certification_rules
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list certification rules")
		return
	}
	defer rows.Close()

	items, err := h.scanRuleRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan certification rules")
		return
	}

	respondJSON(w, http.StatusOK, CertificationRuleListResponse{Items: items, Total: total})
}

func (h *CertificationHandler) GetRule(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	rule, err := h.fetchRule(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "certification rule not found")
		return
	}
	respondJSON(w, http.StatusOK, rule)
}

func (h *CertificationHandler) CreateRule(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateCertificationRuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.PositionName == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := "cert-" + uuid.NewString()
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO certification_rules (id, position_id, position_name, status, rule_source)
		VALUES ($1, $2, $3, 'draft', $4)
	`, id, req.PositionID, req.PositionName, req.RuleSource)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create certification rule")
		return
	}

	rule, _ := h.fetchRule(r.Context(), id)
	respondJSON(w, http.StatusCreated, rule)
}

func (h *CertificationHandler) UpdateRule(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchRule(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "certification rule not found")
		return
	}

	var req CreateCertificationRuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.PositionName == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE certification_rules SET position_id = $1, position_name = $2, rule_source = $3, updated_at = NOW()
		WHERE id = $4
	`, req.PositionID, req.PositionName, req.RuleSource, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update certification rule")
		return
	}

	rule, _ := h.fetchRule(r.Context(), id)
	respondJSON(w, http.StatusOK, rule)
}

func (h *CertificationHandler) DeleteRule(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchRule(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "certification rule not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM certification_rules WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete certification rule")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *CertificationHandler) ConfigItems(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	ruleID := chi.URLParam(r, "ruleId")
	if _, err := h.fetchRule(r.Context(), ruleID); err != nil {
		respondError(w, http.StatusNotFound, "certification rule not found")
		return
	}

	if r.Method == http.MethodPost {
		var req CreateCertificationItemRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, http.StatusBadRequest, "invalid request body")
			return
		}
		if req.Name == "" {
			respondError(w, http.StatusBadRequest, "missing required fields")
			return
		}

		id := "ci-" + uuid.NewString()
		_, err := h.DB.Exec(r.Context(), `
			INSERT INTO certification_ability_items (id, rule_id, name, sort_order)
			VALUES ($1, $2, $3, $4)
		`, id, ruleID, req.Name, req.SortOrder)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to create certification item")
			return
		}

		item, _ := h.fetchItem(r.Context(), id)
		respondJSON(w, http.StatusCreated, item)
		return
	}

	rows, err := h.DB.Query(r.Context(), `
		SELECT id, rule_id, name, sort_order, created_at
		FROM certification_ability_items WHERE rule_id = $1 ORDER BY sort_order, created_at
	`, ruleID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list certification items")
		return
	}
	defer rows.Close()

	items := make([]domain.CertificationAbilityItem, 0)
	for rows.Next() {
		var item domain.CertificationAbilityItem
		if err := rows.Scan(&item.ID, &item.RuleID, &item.Name, &item.SortOrder, &item.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "failed to scan certification items")
			return
		}
		items = append(items, item)
	}
	respondJSON(w, http.StatusOK, CertificationItemListResponse{Items: items, Total: len(items)})
}

func (h *CertificationHandler) ConfigPoints(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	itemID := chi.URLParam(r, "itemId")
	if _, err := h.fetchItem(r.Context(), itemID); err != nil {
		respondError(w, http.StatusNotFound, "certification item not found")
		return
	}

	if r.Method == http.MethodPost {
		var req CreateCertificationPointRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, http.StatusBadRequest, "invalid request body")
			return
		}
		if req.AbilityPointID == "" || req.RequiredLevel == "" {
			respondError(w, http.StatusBadRequest, "missing required fields")
			return
		}

		id := "cp-" + uuid.NewString()
		_, err := h.DB.Exec(r.Context(), `
			INSERT INTO certification_ability_points (id, item_id, ability_point_id, mapping_type, custom_level_mapping, required_level, weight)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, id, itemID, req.AbilityPointID, req.MappingType, req.CustomLevelMapping, req.RequiredLevel, req.Weight)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to create certification point")
			return
		}

		point, _ := h.fetchPoint(r.Context(), id)
		respondJSON(w, http.StatusCreated, point)
		return
	}

	rows, err := h.DB.Query(r.Context(), `
		SELECT id, item_id, ability_point_id, mapping_type, custom_level_mapping, required_level, weight, created_at
		FROM certification_ability_points WHERE item_id = $1 ORDER BY created_at
	`, itemID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list certification points")
		return
	}
	defer rows.Close()

	items := make([]domain.CertificationAbilityPoint, 0)
	for rows.Next() {
		var point domain.CertificationAbilityPoint
		if err := rows.Scan(&point.ID, &point.ItemID, &point.AbilityPointID, &point.MappingType, &point.CustomLevelMapping, &point.RequiredLevel, &point.Weight, &point.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "failed to scan certification points")
			return
		}
		items = append(items, point)
	}
	respondJSON(w, http.StatusOK, CertificationPointListResponse{Items: items, Total: len(items)})
}

func (h *CertificationHandler) DeleteItem(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchItem(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "certification item not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM certification_ability_items WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete certification item")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *CertificationHandler) DeletePoint(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchPoint(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "certification point not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM certification_ability_points WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete certification point")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *CertificationHandler) fetchRule(ctx context.Context, id string) (domain.CertificationRule, error) {
	var rule domain.CertificationRule
	var positionID *string
	err := h.DB.QueryRow(ctx, `
		SELECT id, position_id, position_name, status, rule_source, created_at, updated_at
		FROM certification_rules WHERE id = $1
	`, id).Scan(&rule.ID, &positionID, &rule.PositionName, &rule.Status, &rule.RuleSource, &rule.CreatedAt, &rule.UpdatedAt)
	if err != nil {
		return rule, err
	}
	rule.PositionID = positionID
	return rule, nil
}

func (h *CertificationHandler) scanRuleRows(rows pgx.Rows) ([]domain.CertificationRule, error) {
	items := make([]domain.CertificationRule, 0)
	for rows.Next() {
		var rule domain.CertificationRule
		var positionID *string
		if err := rows.Scan(&rule.ID, &positionID, &rule.PositionName, &rule.Status, &rule.RuleSource, &rule.CreatedAt, &rule.UpdatedAt); err != nil {
			return nil, err
		}
		rule.PositionID = positionID
		items = append(items, rule)
	}
	return items, nil
}

func (h *CertificationHandler) fetchItem(ctx context.Context, id string) (domain.CertificationAbilityItem, error) {
	var item domain.CertificationAbilityItem
	err := h.DB.QueryRow(ctx, `
		SELECT id, rule_id, name, sort_order, created_at FROM certification_ability_items WHERE id = $1
	`, id).Scan(&item.ID, &item.RuleID, &item.Name, &item.SortOrder, &item.CreatedAt)
	return item, err
}

func (h *CertificationHandler) fetchPoint(ctx context.Context, id string) (domain.CertificationAbilityPoint, error) {
	var point domain.CertificationAbilityPoint
	err := h.DB.QueryRow(ctx, `
		SELECT id, item_id, ability_point_id, mapping_type, custom_level_mapping, required_level, weight, created_at
		FROM certification_ability_points WHERE id = $1
	`, id).Scan(&point.ID, &point.ItemID, &point.AbilityPointID, &point.MappingType, &point.CustomLevelMapping, &point.RequiredLevel, &point.Weight, &point.CreatedAt)
	return point, err
}
