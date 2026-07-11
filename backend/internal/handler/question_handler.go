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

type QuestionHandler struct {
	DB *pgxpool.Pool
}

type QuestionListResponse struct {
	Items []domain.Question `json:"items"`
	Total int               `json:"total"`
}

type CreateQuestionRequest struct {
	BankID          string              `json:"bankId"`
	Type            domain.QuestionType `json:"type"`
	Content         string              `json:"content"`
	Options         []string            `json:"options"`
	Answer          domain.JSONSlice    `json:"answer"`
	Analysis        *string             `json:"analysis"`
	Score           float64             `json:"score"`
	Difficulty      *string             `json:"difficulty"`
	KnowledgePoints []string            `json:"knowledgePoints"`
	Source          *string             `json:"source"`
}

type BatchCreateQuestionsRequest struct {
	BankID string                  `json:"bankId"`
	Items  []CreateQuestionRequest `json:"items"`
}

func (h *QuestionHandler) List(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	bankID := r.URL.Query().Get("bankId")
	qType := r.URL.Query().Get("type")
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

	if bankID != "" {
		where = append(where, "bank_id = $"+itoa(argIdx))
		args = append(args, bankID)
		argIdx++
	}
	if qType != "" {
		where = append(where, "type = $"+itoa(argIdx))
		args = append(args, qType)
		argIdx++
	}
	if status != "" {
		where = append(where, "status = $"+itoa(argIdx))
		args = append(args, status)
		argIdx++
	}
	if search != "" {
		where = append(where, "content ILIKE $"+itoa(argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}

	countQuery := "SELECT COUNT(*) FROM questions WHERE " + strings.Join(where, " AND ")
	var total int
	_ = h.DB.QueryRow(r.Context(), countQuery, args...).Scan(&total)

	query := `
		SELECT id, bank_id, type, content, options, answer, analysis, score, difficulty, knowledge_points, creator_id, source, status, created_at
		FROM questions
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_at DESC
		LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(r.Context(), query, args...)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list questions")
		return
	}
	defer rows.Close()

	items, err := h.scanQuestionRows(rows)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to scan questions")
		return
	}

	respondJSON(w, http.StatusOK, QuestionListResponse{Items: items, Total: total})
}

func (h *QuestionHandler) Get(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	q, err := h.fetchQuestion(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "question not found")
		return
	}
	respondJSON(w, http.StatusOK, q)
}

func (h *QuestionHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req CreateQuestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.BankID == "" || req.Content == "" || req.Type == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	id := uuid.NewString()
	if req.Answer == nil {
		req.Answer = domain.JSONSlice{}
	}
	answerJSON, _ := json.Marshal(req.Answer)
	_, err := h.DB.Exec(r.Context(), `
		INSERT INTO questions (id, bank_id, type, content, options, answer, analysis, score, difficulty, knowledge_points, creator_id, source, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'draft')
	`, id, req.BankID, req.Type, req.Content, coalesceStringSlice(req.Options), string(answerJSON), req.Analysis, req.Score, req.Difficulty, coalesceStringSlice(req.KnowledgePoints), claims.UserID, req.Source)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create question")
		return
	}

	q, _ := h.fetchQuestion(r.Context(), id)
	respondJSON(w, http.StatusCreated, q)
}

func (h *QuestionHandler) Update(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchQuestion(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "question not found")
		return
	}

	var req CreateQuestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Content == "" || req.Type == "" {
		respondError(w, http.StatusBadRequest, "missing required fields")
		return
	}

	if req.Answer == nil {
		req.Answer = domain.JSONSlice{}
	}
	answerJSON, _ := json.Marshal(req.Answer)

	_, err := h.DB.Exec(r.Context(), `
		UPDATE questions SET type = $1, content = $2, options = $3, answer = $4, analysis = $5,
			score = $6, difficulty = $7, knowledge_points = $8, source = $9
		WHERE id = $10
	`, req.Type, req.Content, coalesceStringSlice(req.Options), string(answerJSON), req.Analysis, req.Score, req.Difficulty, coalesceStringSlice(req.KnowledgePoints), req.Source, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update question")
		return
	}

	q, _ := h.fetchQuestion(r.Context(), id)
	respondJSON(w, http.StatusOK, q)
}

func (h *QuestionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	id := chi.URLParam(r, "id")
	if _, err := h.fetchQuestion(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "question not found")
		return
	}

	_, err := h.DB.Exec(r.Context(), `DELETE FROM questions WHERE id = $1`, id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to delete question")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"id": id})
}

func (h *QuestionHandler) BatchCreate(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	var req BatchCreateQuestionsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.BankID == "" {
		respondError(w, http.StatusBadRequest, "missing bank id")
		return
	}

	tx, err := h.DB.Begin(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to begin transaction")
		return
	}
	defer tx.Rollback(r.Context())

	count := 0
	for _, item := range req.Items {
		if item.Content == "" || item.Type == "" {
			continue
		}
		if item.Answer == nil {
			item.Answer = domain.JSONSlice{}
		}
		answerJSON, _ := json.Marshal(item.Answer)
		id := uuid.NewString()
		_, err := tx.Exec(r.Context(), `
			INSERT INTO questions (id, bank_id, type, content, options, answer, analysis, score, difficulty, knowledge_points, creator_id, source, status)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'draft')
		`, id, req.BankID, item.Type, item.Content, coalesceStringSlice(item.Options), string(answerJSON), item.Analysis, item.Score, item.Difficulty, coalesceStringSlice(item.KnowledgePoints), claims.UserID, item.Source)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "failed to batch create questions")
			return
		}
		count++
	}

	if err := tx.Commit(r.Context()); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to commit")
		return
	}

	respondJSON(w, http.StatusOK, map[string]int{"count": count})
}

func (h *QuestionHandler) fetchQuestion(ctx context.Context, id string) (domain.Question, error) {
	var q domain.Question
	var analysis, difficulty, creatorID, source, answerStr *string
	err := h.DB.QueryRow(ctx, `
		SELECT id, bank_id, type, content, options, answer, analysis, score, difficulty, knowledge_points, creator_id, source, status, created_at
		FROM questions WHERE id = $1
	`, id).Scan(
		&q.ID, &q.BankID, &q.Type, &q.Content, &q.Options, &answerStr, &analysis, &q.Score, &difficulty, &q.KnowledgePoints, &creatorID, &source, &q.Status, &q.CreatedAt,
	)
	if err != nil {
		return q, err
	}
	q.Analysis = analysis
	q.Difficulty = difficulty
	q.CreatorID = creatorID
	q.Source = source
	if answerStr != nil {
		_ = json.Unmarshal([]byte(*answerStr), &q.Answer)
	}
	if q.Answer == nil {
		q.Answer = domain.JSONSlice{}
	}
	return q, nil
}

func (h *QuestionHandler) scanQuestionRows(rows pgx.Rows) ([]domain.Question, error) {
	items := make([]domain.Question, 0)
	for rows.Next() {
		var q domain.Question
		var analysis, difficulty, creatorID, source, answerStr *string
		if err := rows.Scan(
			&q.ID, &q.BankID, &q.Type, &q.Content, &q.Options, &answerStr, &analysis, &q.Score, &difficulty, &q.KnowledgePoints, &creatorID, &source, &q.Status, &q.CreatedAt,
		); err != nil {
			return nil, err
		}
		q.Analysis = analysis
		q.Difficulty = difficulty
		q.CreatorID = creatorID
		q.Source = source
		if answerStr != nil {
			_ = json.Unmarshal([]byte(*answerStr), &q.Answer)
		}
		if q.Answer == nil {
			q.Answer = domain.JSONSlice{}
		}
		items = append(items, q)
	}
	return items, nil
}
