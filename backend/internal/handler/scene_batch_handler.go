package handler

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zhiyu-saas/backend/internal/domain"
)

type SceneBatchHandler struct {
	*BatchHandler
}

func NewSceneBatchHandler(db *pgxpool.Pool) *SceneBatchHandler {
	return &SceneBatchHandler{
		BatchHandler: NewBatchHandler(db, BatchTableConfig{
			TableName:     "scene_batches",
			SelectColumns: "id, name, code, org_node_id, major, workflow_id, status, scenario_count, created_at, updated_at",
			EntityName:    "scene batch",
			StatusOpen:    string(domain.SceneBatchStatusOpen),
			StatusClosed:  string(domain.SceneBatchStatusClosed),
			SearchColumns: []string{"name"},
			ScanRow:       scanSceneBatchRow,
			ScanRows:      scanSceneBatchRows,
		}),
	}
}

func scanSceneBatchRow(ctx context.Context, db *pgxpool.Pool, id string) (any, error) {
	var b domain.SceneBatch
	var code, orgNodeID, major, workflowID *string

	err := db.QueryRow(ctx, `
		SELECT id, name, code, org_node_id, major, workflow_id, status,
			scenario_count, created_at, updated_at
		FROM scene_batches WHERE id = $1
	`, id).Scan(
		&b.ID, &b.Name, &code, &orgNodeID, &major, &workflowID, &b.Status,
		&b.ScenarioCount, &b.CreatedAt, &b.UpdatedAt,
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

func scanSceneBatchRows(rows pgx.Rows) (any, error) {
	items := make([]domain.SceneBatch, 0)
	for rows.Next() {
		var b domain.SceneBatch
		var code, orgNodeID, major, workflowID *string
		if err := rows.Scan(
			&b.ID, &b.Name, &code, &orgNodeID, &major, &workflowID, &b.Status,
			&b.ScenarioCount, &b.CreatedAt, &b.UpdatedAt,
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
