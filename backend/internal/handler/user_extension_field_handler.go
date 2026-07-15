package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"sort"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/middleware"
)

type UserExtensionFieldHandler struct {
	DB *pgxpool.Pool
}

type UserExtensionFieldListResponse struct {
	Items []domain.UserExtensionField `json:"items"`
}

type UpdateUserExtensionFieldRequest struct {
	FieldName                 string   `json:"fieldName"`
	IsEnabled                 bool     `json:"isEnabled"`
	IsRequired                bool     `json:"isRequired"`
	ApplicableIdentityCodes   []string `json:"applicableIdentityCodes"`
}

func (h *UserExtensionFieldHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := r.URL.Query().Get("tenantId")
	if tenantID == "" {
		respondError(w, http.StatusBadRequest, "tenantId is required")
		return
	}

	if err := h.ensureDefaultSlots(r.Context(), tenantID); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to ensure default extension fields")
		return
	}

	rows, err := h.DB.Query(r.Context(), `
		SELECT id, tenant_id, field_key, field_name, field_type, is_enabled, is_required,
			applicable_identity_type_ids, slot_number, created_at
		FROM user_extension_fields
		WHERE tenant_id = $1
		ORDER BY slot_number ASC
	`, tenantID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list extension fields")
		return
	}
	defer rows.Close()

	items, err := h.scanUserExtensionFieldRows(r.Context(), rows, tenantID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan extension fields")
		return
	}

	respondJSON(w, http.StatusOK, UserExtensionFieldListResponse{Items: items})
}

func (h *UserExtensionFieldHandler) Update(w http.ResponseWriter, r *http.Request) {
	if !h.canManageUsers(r) {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")

	var existing domain.UserExtensionField
	var applicableIDs []string
	err := h.DB.QueryRow(r.Context(), `
		SELECT id, tenant_id, field_key, field_name, field_type, is_enabled, is_required,
			applicable_identity_type_ids, slot_number, created_at
		FROM user_extension_fields WHERE id = $1
	`, id).Scan(
		&existing.ID, &existing.TenantID, &existing.FieldKey, &existing.FieldName, &existing.FieldType,
		&existing.IsEnabled, &existing.IsRequired, &applicableIDs, &existing.SlotNumber, &existing.CreatedAt,
	)
	if err != nil {
		respondError(w, http.StatusNotFound, "extension field not found")
		return
	}
	existing.ApplicableIdentityTypeIDs = applicableIDs

	var req UpdateUserExtensionFieldRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.FieldName == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	resolvedIDs, err := h.resolveIdentityCodes(r.Context(), existing.TenantID, req.ApplicableIdentityCodes)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to resolve identity codes")
		return
	}

	_, err = h.DB.Exec(r.Context(), `
		UPDATE user_extension_fields SET field_name = $1, is_enabled = $2, is_required = $3,
			applicable_identity_type_ids = $4
		WHERE id = $5
	`, req.FieldName, req.IsEnabled, req.IsRequired, resolvedIDs, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update extension field")
		return
	}

	updated, _ := h.fetchUserExtensionField(r.Context(), id)
	respondJSON(w, http.StatusOK, updated)
}

func (h *UserExtensionFieldHandler) ensureDefaultSlots(ctx context.Context, tenantID string) error {
	rows, err := h.DB.Query(ctx, `
		SELECT slot_number FROM user_extension_fields WHERE tenant_id = $1
	`, tenantID)
	if err != nil {
		return err
	}
	defer rows.Close()

	existing := make(map[int]bool)
	for rows.Next() {
		var slot int
		if err := rows.Scan(&slot); err != nil {
			return err
		}
		existing[slot] = true
	}

	for slot := 1; slot <= 20; slot++ {
		if existing[slot] {
			continue
		}
		fieldKey := "field_" + itoa(slot)
		fieldName := "扩展字段" + itoa(slot)
		_, err := h.DB.Exec(ctx, `
			INSERT INTO user_extension_fields (id, tenant_id, field_key, field_name, field_type, is_enabled, is_required, applicable_identity_type_ids, slot_number)
			VALUES ($1, $2, $3, $4, 'text', FALSE, FALSE, '{}', $5)
			ON CONFLICT (tenant_id, field_key) DO NOTHING
		`, uuid.NewString(), tenantID, fieldKey, fieldName, slot)
		if err != nil {
			return err
		}
	}
	return nil
}

func (h *UserExtensionFieldHandler) resolveIdentityCodes(ctx context.Context, tenantID string, codes []string) ([]string, error) {
	if len(codes) == 0 {
		return []string{}, nil
	}

	placeholders := make([]string, 0, len(codes))
	args := make([]interface{}, 0, len(codes)+1)
	args = append(args, tenantID)
	for i, code := range codes {
		placeholders = append(placeholders, "$"+itoa(i+2))
		args = append(args, code)
	}

	query := `
		SELECT id FROM identity_types
		WHERE tenant_id = $1 AND code IN (` + strings.Join(placeholders, ", ") + `)
	`
	rows, err := h.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]string, 0)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, nil
}

func (h *UserExtensionFieldHandler) mapIdentityIDsToCodes(ctx context.Context, tenantID string, ids []string) ([]string, error) {
	if len(ids) == 0 {
		return []string{}, nil
	}

	placeholders := make([]string, 0, len(ids))
	args := make([]interface{}, 0, len(ids)+1)
	args = append(args, tenantID)
	for i, id := range ids {
		placeholders = append(placeholders, "$"+itoa(i+2))
		args = append(args, id)
	}

	query := `
		SELECT id, code FROM identity_types
		WHERE tenant_id = $1 AND id IN (` + strings.Join(placeholders, ", ") + `)
	`
	rows, err := h.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	codeMap := make(map[string]string)
	for rows.Next() {
		var id, code string
		if err := rows.Scan(&id, &code); err != nil {
			return nil, err
		}
		codeMap[id] = code
	}

	codes := make([]string, 0, len(ids))
	for _, id := range ids {
		if code, ok := codeMap[id]; ok {
			codes = append(codes, code)
		}
	}
	sort.Strings(codes)
	return codes, nil
}

func (h *UserExtensionFieldHandler) canManageUsers(r *http.Request) bool {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		return false
	}
	if claims.Role == domain.UserRoleOperator {
		return true
	}
	return claims.Platform == domain.UserPlatformPortal && h.currentIdentityCode(r) == "school_admin"
}

func (h *UserExtensionFieldHandler) currentIdentityCode(r *http.Request) string {
	claims := middleware.CurrentUser(r)
	if claims == nil || claims.IdentityTypeID == nil {
		return ""
	}
	var code string
	_ = h.DB.QueryRow(r.Context(), `SELECT code FROM identity_types WHERE id = $1`, *claims.IdentityTypeID).Scan(&code)
	return code
}

func (h *UserExtensionFieldHandler) fetchUserExtensionField(ctx context.Context, id string) (domain.UserExtensionField, error) {
	var field domain.UserExtensionField
	var applicableIDs []string

	err := h.DB.QueryRow(ctx, `
		SELECT id, tenant_id, field_key, field_name, field_type, is_enabled, is_required,
			applicable_identity_type_ids, slot_number, created_at
		FROM user_extension_fields WHERE id = $1
	`, id).Scan(
		&field.ID, &field.TenantID, &field.FieldKey, &field.FieldName, &field.FieldType,
		&field.IsEnabled, &field.IsRequired, &applicableIDs, &field.SlotNumber, &field.CreatedAt,
	)
	if err != nil {
		return field, err
	}
	field.ApplicableIdentityTypeIDs = applicableIDs
	codes, _ := h.mapIdentityIDsToCodes(ctx, field.TenantID, applicableIDs)
	field.ApplicableIdentityCodes = codes
	return field, nil
}

func (h *UserExtensionFieldHandler) scanUserExtensionFieldRows(ctx context.Context, rows pgx.Rows, tenantID string) ([]domain.UserExtensionField, error) {
	items := make([]domain.UserExtensionField, 0)
	for rows.Next() {
		var field domain.UserExtensionField
		var applicableIDs []string
		if err := rows.Scan(
			&field.ID, &field.TenantID, &field.FieldKey, &field.FieldName, &field.FieldType,
			&field.IsEnabled, &field.IsRequired, &applicableIDs, &field.SlotNumber, &field.CreatedAt,
		); err != nil {
			return nil, err
		}
		field.ApplicableIdentityTypeIDs = applicableIDs
		codes, _ := h.mapIdentityIDsToCodes(ctx, tenantID, applicableIDs)
		field.ApplicableIdentityCodes = codes
		items = append(items, field)
	}
	return items, nil
}
