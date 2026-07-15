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

type QuestionBankHandler struct {
	DB *pgxpool.Pool
}

type QuestionBankListResponse struct {
	Items []domain.QuestionBank `json:"items"`
	Total int                   `json:"total"`
}

type CreateQuestionBankRequest struct {
	Name                string   `json:"name"`
	Description         string   `json:"description"`
	CoverURL            *string  `json:"coverUrl"`
	CollaboratorIDs     []string `json:"collaboratorIds"`
	CollaboratorDeptIDs []string `json:"collaboratorDeptIds"`
	BatchID             *string  `json:"batchId"`
}

type ReviewQuestionBankRequest struct {
	Status  string  `json:"status"`
	Comment *string `json:"comment"`
}

func (h *QuestionBankHandler) List(w http.ResponseWriter, r *http.Request) {
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
		where = append(where, "(name ILIKE $"+itoa(argIdx)+" OR description ILIKE $"+itoa(argIdx)+")")
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM question_banks WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, name, description, cover_url, status, question_count, creator_id,
			collaborator_ids, collaborator_dept_ids, batch_id, version, owner_type, is_draft_pool, created_at, updated_at
		FROM question_banks
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list question banks")
		return
	}
	defer rows.Close()

	items, err := h.scanQuestionBankRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan question banks")
		return
	}

	respondJSON(w, http.StatusOK, QuestionBankListResponse{Items: items, Total: total})
}

func (h *QuestionBankHandler) Get(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	bank, err := h.fetchQuestionBank(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "question bank not found")
		return
	}
	respondJSON(w, http.StatusOK, bank)
}

func (h *QuestionBankHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateQuestionBankRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := uuid.NewString()
	creatorID := claims.UserID
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO question_banks (id, name, description, cover_url, status, question_count, creator_id,
			collaborator_ids, collaborator_dept_ids, batch_id, version, owner_type, is_draft_pool)
		VALUES ($1, $2, $3, $4, 'draft', 0, $5, $6, $7, $8, 'v1.0', 'mine', false)
	`, id, req.Name, req.Description, req.CoverURL, creatorID, coalesceStringSlice(req.CollaboratorIDs), coalesceStringSlice(req.CollaboratorDeptIDs), req.BatchID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create question bank")
		return
	}

	bank, _ := h.fetchQuestionBank(r.Context(), id)
	respondJSON(w, http.StatusCreated, bank)
}

func (h *QuestionBankHandler) Update(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	existing, err := h.fetchQuestionBank(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "question bank not found")
		return
	}

	var req CreateQuestionBankRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	collaboratorIDs := req.CollaboratorIDs
	if collaboratorIDs == nil {
		collaboratorIDs = existing.CollaboratorIDs
	}
	collaboratorDeptIDs := req.CollaboratorDeptIDs
	if collaboratorDeptIDs == nil {
		collaboratorDeptIDs = existing.CollaboratorDeptIDs
	}

	_, err = h.DB.Exec(r.Context(), `
		UPDATE question_banks SET name = $1, description = $2, cover_url = $3,
			collaborator_ids = $4, collaborator_dept_ids = $5, batch_id = $6, updated_at = NOW()
		WHERE id = $7
	`, req.Name, req.Description, req.CoverURL, collaboratorIDs, collaboratorDeptIDs, req.BatchID, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update question bank")
		return
	}

	bank, _ := h.fetchQuestionBank(r.Context(), id)
	respondJSON(w, http.StatusOK, bank)
}

func (h *QuestionBankHandler) Delete(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchQuestionBank(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "question bank not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM question_banks WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete question bank")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *QuestionBankHandler) Submit(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}
	h.transitionStatus(w, r, domain.QuestionBankStatusPending)
}

func (h *QuestionBankHandler) Review(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	var req ReviewQuestionBankRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var status domain.QuestionBankStatus
	switch req.Status {
	case "approved":
		status = domain.QuestionBankStatusApproved
	case "rejected":
		status = domain.QuestionBankStatusRejected
	default:
		respondError(w, http.StatusBadRequest, "invalid review status")
		return
	}

	_, err := h.DB.Exec(r.Context(), `
		UPDATE question_banks SET status = $1, updated_at = NOW() WHERE id = $2
	`, status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to review question bank")
		return
	}

	bank, _ := h.fetchQuestionBank(r.Context(), id)
	respondJSON(w, http.StatusOK, bank)
}

func (h *QuestionBankHandler) Publish(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}
	h.transitionStatus(w, r, domain.QuestionBankStatusPublished)
}

func (h *QuestionBankHandler) Archive(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}
	h.transitionStatus(w, r, domain.QuestionBankStatusArchived)
}

func (h *QuestionBankHandler) Withdraw(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}
	h.transitionStatus(w, r, domain.QuestionBankStatusDraft)
}

func (h *QuestionBankHandler) Invite(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}
	id := chi.URLParam(r, "id")
	var req InviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.UserID == "" {
		respondError(w, http.StatusBadRequest, "userId is required")
		return
	}
	_, err := h.DB.Exec(r.Context(), `
		UPDATE question_banks SET collaborator_ids = array_append(collaborator_ids, $1), updated_at = NOW()
		WHERE id = $2 AND NOT (collaborator_ids @> ARRAY[$1]::uuid[])
	`, req.UserID, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to invite collaborator")
		return
	}
	bank, _ := h.fetchQuestionBank(r.Context(), id)
	respondJSON(w, http.StatusOK, bank)
}

func (h *QuestionBankHandler) transitionStatus(w http.ResponseWriter, r *http.Request, status domain.QuestionBankStatus) {
	id := chi.URLParam(r, "id")
	_, err := h.DB.Exec(r.Context(), `
		UPDATE question_banks SET status = $1, updated_at = NOW() WHERE id = $2
	`, status, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update status")
		return
	}

	bank, err := h.fetchQuestionBank(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "question bank not found")
		return
	}
	respondJSON(w, http.StatusOK, bank)
}

func (h *QuestionBankHandler) fetchQuestionBank(ctx context.Context, id string) (domain.QuestionBank, error) {
	var b domain.QuestionBank
	var coverURL, creatorID, batchID *string
	err := h.DB.QueryRow(ctx, `
		SELECT id, name, description, cover_url, status, question_count, creator_id,
			collaborator_ids, collaborator_dept_ids, batch_id, version, owner_type, is_draft_pool, created_at, updated_at
		FROM question_banks WHERE id = $1
	`, id).Scan(
		&b.ID, &b.Name, &b.Description, &coverURL, &b.Status, &b.QuestionCount, &creatorID,
		&b.CollaboratorIDs, &b.CollaboratorDeptIDs, &batchID, &b.Version, &b.OwnerType, &b.IsDraftPool, &b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		return b, err
	}
	b.CoverURL = coverURL
	b.CreatorID = creatorID
	b.BatchID = batchID
	return b, nil
}

func (h *QuestionBankHandler) scanQuestionBankRows(rows pgx.Rows) ([]domain.QuestionBank, error) {
	items := make([]domain.QuestionBank, 0)
	for rows.Next() {
		var b domain.QuestionBank
		var coverURL, creatorID, batchID *string
		if err := rows.Scan(
			&b.ID, &b.Name, &b.Description, &coverURL, &b.Status, &b.QuestionCount, &creatorID,
			&b.CollaboratorIDs, &b.CollaboratorDeptIDs, &batchID, &b.Version, &b.OwnerType, &b.IsDraftPool, &b.CreatedAt, &b.UpdatedAt,
		); err != nil {
			return nil, err
		}
		b.CoverURL = coverURL
		b.CreatorID = creatorID
		b.BatchID = batchID
		items = append(items, b)
	}
	return items, nil
}
