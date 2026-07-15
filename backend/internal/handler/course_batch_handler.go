package handler

import (
	"context"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zhiyu-saas/backend/internal/domain"
)

type CourseBatchHandler struct {
	*BatchHandler
}

func NewCourseBatchHandler(db *pgxpool.Pool) *CourseBatchHandler {
	return &CourseBatchHandler{
		BatchHandler: NewBatchHandler(db, BatchTableConfig{
			TableName:     "lesson_batches",
			SelectColumns: "id, name, code, org_node_id, major, workflow_id, status, course_count, created_at, updated_at",
			EntityName:    "batch",
			StatusOpen:    string(domain.LessonBatchStatusOpen),
			StatusClosed:  string(domain.LessonBatchStatusClosed),
			SearchColumns: []string{"name", "code"},
			ExtraListFilters: func(r *http.Request, argIdx int) (clauses []string, args []any) {
				major := r.URL.Query().Get("major")
				if major == "" {
					return nil, nil
				}
				return []string{"major = $" + itoa(argIdx)}, []any{major}
			},
			CreateExtraCols:  []string{"course_count"},
			CreateExtraVals:  []any{0},
			CreateWithStatus: true,
			UpdateWithStatus: true,
			ScanRow:          scanLessonBatchRow,
			ScanRows:         scanLessonBatchRows,
		}),
	}
}

func scanLessonBatchRow(ctx context.Context, db *pgxpool.Pool, id string) (any, error) {
	var b domain.LessonBatch
	err := db.QueryRow(ctx, `
		SELECT id, name, code, org_node_id, major, workflow_id, status, course_count, created_at, updated_at
		FROM lesson_batches WHERE id = $1
	`, id).Scan(
		&b.ID, &b.Name, &b.Code, &b.OrgNodeID, &b.Major, &b.WorkflowID, &b.Status,
		&b.CourseCount, &b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func scanLessonBatchRows(rows pgx.Rows) (any, error) {
	items := make([]domain.LessonBatch, 0)
	for rows.Next() {
		var b domain.LessonBatch
		if err := rows.Scan(
			&b.ID, &b.Name, &b.Code, &b.OrgNodeID, &b.Major, &b.WorkflowID, &b.Status,
			&b.CourseCount, &b.CreatedAt, &b.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, b)
	}
	return items, nil
}
