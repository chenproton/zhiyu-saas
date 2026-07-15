package handler

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zhiyu-saas/backend/internal/domain"
)

type EvaluationBatchHandler struct {
	*BatchHandler
}

func NewEvaluationBatchHandler(db *pgxpool.Pool) *EvaluationBatchHandler {
	return &EvaluationBatchHandler{
		BatchHandler: NewBatchHandler(db, BatchTableConfig{
			TableName:     "evaluation_batches",
			SelectColumns: "id, name, code, org_node_id, major, workflow_id, status, created_at, updated_at",
			EntityName:    "evaluation batch",
			StatusOpen:    "open",
			StatusClosed:  "closed",
			SearchColumns: []string{"name"},
			TenantScoped:  true,
			ScanRow:       scanEvaluationBatchRow,
			ScanRows:      scanEvaluationBatchRows,
		}),
	}
}

func scanEvaluationBatchRow(ctx context.Context, db *pgxpool.Pool, id string) (any, error) {
	var b domain.EvaluationBatch
	var code, orgNodeID, major, workflowID *string

	err := db.QueryRow(ctx, `
		SELECT id, name, code, org_node_id, major, workflow_id, status, created_at, updated_at
		FROM evaluation_batches WHERE id = $1
	`, id).Scan(
		&b.ID, &b.Name, &code, &orgNodeID, &major, &workflowID, &b.Status, &b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	b.Code = code
	b.OrgNodeID = orgNodeID
	b.Major = major
	b.WorkflowID = workflowID
	return b, nil
}

func scanEvaluationBatchRows(rows pgx.Rows) (any, error) {
	items := make([]domain.EvaluationBatch, 0)
	for rows.Next() {
		var b domain.EvaluationBatch
		var code, orgNodeID, major, workflowID *string
		if err := rows.Scan(
			&b.ID, &b.Name, &code, &orgNodeID, &major, &workflowID, &b.Status, &b.CreatedAt, &b.UpdatedAt,
		); err != nil {
			return nil, err
		}
		b.Code = code
		b.OrgNodeID = orgNodeID
		b.Major = major
		b.WorkflowID = workflowID
		items = append(items, b)
	}
	return items, nil
}
