package handler

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zhiyu-saas/backend/internal/domain"
)

type JobBatchHandler struct {
	*BatchHandler
}

func NewJobBatchHandler(db *pgxpool.Pool) *JobBatchHandler {
	return &JobBatchHandler{
		BatchHandler: NewBatchHandler(db, BatchTableConfig{
			TableName:     "batches",
			SelectColumns: "id, name, code, org_node_id, major, workflow_id, status, position_count, published_count, pending_count, created_at, updated_at",
			EntityName:    "batch",
			StatusOpen:    string(domain.BatchStatusOpen),
			StatusClosed:  string(domain.BatchStatusClosed),
			SearchColumns: []string{"name"},
			ScanRow:       scanJobBatchRow,
			ScanRows:      scanJobBatchRows,
		}),
	}
}

func scanJobBatchRow(ctx context.Context, db *pgxpool.Pool, id string) (any, error) {
	var b domain.JobBatch
	var code, orgNodeID, major, workflowID *string

	err := db.QueryRow(ctx, `
		SELECT id, name, code, org_node_id, major, workflow_id, status,
			position_count, published_count, pending_count, created_at, updated_at
		FROM batches WHERE id = $1
	`, id).Scan(
		&b.ID, &b.Name, &code, &orgNodeID, &major, &workflowID, &b.Status,
		&b.PositionCount, &b.PublishedCount, &b.PendingCount, &b.CreatedAt, &b.UpdatedAt,
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

func scanJobBatchRows(rows pgx.Rows) (any, error) {
	items := make([]domain.JobBatch, 0)
	for rows.Next() {
		var b domain.JobBatch
		var code, orgNodeID, major, workflowID *string
		if err := rows.Scan(
			&b.ID, &b.Name, &code, &orgNodeID, &major, &workflowID, &b.Status,
			&b.PositionCount, &b.PublishedCount, &b.PendingCount, &b.CreatedAt, &b.UpdatedAt,
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
