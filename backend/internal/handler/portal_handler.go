package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/middleware"
)

type PortalHandler struct {
	DB *pgxpool.Pool
}

func (h *PortalHandler) WorkspaceDashboard(w http.ResponseWriter, r *http.Request) {
	claims := middleware.CurrentUser(r)
	if claims == nil {
		respondError(w, http.StatusForbidden, "permission denied")
		return
	}

	role := string(claims.Role)
	if role == "" {
		role = "student"
	}

	dash := domain.WorkspaceDashboard{
		Role:          role,
		Announcements: h.listAnnouncements(r.Context(), role),
		Todos:         h.listTodos(r.Context(), claims.UserID, role),
		Schedule:      h.listSchedule(r.Context(), claims.UserID, role),
	}

	dash.Stats = h.stats(r.Context(), claims.UserID, role)

	respondJSON(w, http.StatusOK, dash)
}

func (h *PortalHandler) listAnnouncements(ctx context.Context, role string) []domain.WorkspaceAnnouncement {
	rows, err := h.DB.Query(ctx, `
		SELECT id, title, type, is_new, created_at
		FROM announcements
		WHERE array_length(target_roles, 1) IS NULL OR target_roles @> ARRAY[$1::varchar]
		ORDER BY created_at DESC
		LIMIT 10
	`, role)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var items []domain.WorkspaceAnnouncement
	for rows.Next() {
		var a domain.WorkspaceAnnouncement
		var t time.Time
		if err := rows.Scan(&a.ID, &a.Title, &a.Type, &a.IsNew, &t); err != nil {
			continue
		}
		a.Date = t.Format("2006-01-02")
		a.CreatedAt = t
		items = append(items, a)
	}
	return items
}

func (h *PortalHandler) listTodos(ctx context.Context, userID, role string) []domain.WorkspaceTodo {
	var todos []domain.WorkspaceTodo
	now := time.Now()
	if role == "teacher" || role == "school" {
		var pendingApprovals int
		_ = h.DB.QueryRow(ctx, `
			SELECT COUNT(*) FROM approval_records WHERE status = 'pending'
		`).Scan(&pendingApprovals)
		if pendingApprovals > 0 {
			todos = append(todos, domain.WorkspaceTodo{
				ID:    "pending-approvals",
				Title: "待审批事项",
				Type:  "approve",
				Count: pendingApprovals,
				Urgent: true,
			})
		}
		var draftCourses int
		_ = h.DB.QueryRow(ctx, `
			SELECT COUNT(*) FROM courses WHERE status = 'draft' AND (teacher_id = $1 OR creator_id = $1)
		`, userID).Scan(&draftCourses)
		if draftCourses > 0 {
			todos = append(todos, domain.WorkspaceTodo{
				ID:     "draft-courses",
				Title:  "待提交课程",
				Type:   "review",
				Count:  draftCourses,
				Urgent: false,
			})
		}
	} else {
		var upcomingExams int
		_ = h.DB.QueryRow(ctx, `
			SELECT COUNT(*) FROM exam_usages WHERE status = 'published' AND (start_time IS NULL OR start_time >= $1)
		`, now).Scan(&upcomingExams)
		if upcomingExams > 0 {
			todos = append(todos, domain.WorkspaceTodo{
				ID:     "upcoming-exams",
				Title:  "待参加考试",
				Type:   "exam",
				Count:  upcomingExams,
				Urgent: false,
			})
		}
	}
	return todos
}

func (h *PortalHandler) listSchedule(ctx context.Context, userID, role string) []domain.WorkspaceScheduleEvent {
	var events []domain.WorkspaceScheduleEvent
	if role == "teacher" || role == "school" {
		rows, err := h.DB.Query(ctx, `
			SELECT id, name, COALESCE(class_name, '')
			FROM courses
			WHERE status = 'published' AND (teacher_id = $1 OR creator_id = $1)
			ORDER BY updated_at DESC
			LIMIT 20
		`, userID)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id, name, className string
				if err := rows.Scan(&id, &name, &className); err != nil {
					continue
				}
				events = append(events, domain.WorkspaceScheduleEvent{
					ID:        id,
					Title:     name,
					Type:      "course",
					DayOfWeek: 1,
					Period:    "上午 1",
					Location:  className,
					Status:    "进行中",
				})
			}
		}
	}
	rows, err := h.DB.Query(ctx, `
		SELECT id, name, start_time, status
		FROM exam_usages
		WHERE status IN ('published', 'in_progress')
		ORDER BY start_time ASC NULLS LAST
		LIMIT 20
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var id, name, status string
			var start *time.Time
			if err := rows.Scan(&id, &name, &start, &status); err != nil {
				continue
			}
			dayOfWeek := 1
			if start != nil {
				dayOfWeek = int(start.Weekday())
				if dayOfWeek == 0 {
					dayOfWeek = 7
				}
			}
			events = append(events, domain.WorkspaceScheduleEvent{
				ID:        id,
				Title:     name,
				Type:      "exam",
				DayOfWeek: dayOfWeek,
				Period:    "上午 1",
				Status:    status,
			})
		}
	}
	return events
}

func (h *PortalHandler) stats(ctx context.Context, userID, role string) *domain.WorkspaceStats {
	if role == "teacher" || role == "school" {
		var courseCount, studentCount int
		_ = h.DB.QueryRow(ctx, `
			SELECT COUNT(*) FROM courses WHERE status = 'published' AND (teacher_id = $1 OR creator_id = $1)
		`, userID).Scan(&courseCount)
		_ = h.DB.QueryRow(ctx, `
			SELECT COUNT(DISTINCT student_user_id) FROM lesson_behavior_records
			WHERE course_id IN (
				SELECT id FROM courses WHERE teacher_id = $1 OR creator_id = $1
			)
		`, userID).Scan(&studentCount)
		return &domain.WorkspaceStats{Label1: "授课课程", Value1: courseCount, Label2: "学生人数", Value2: studentCount}
	}
	var courseCount, examCount int
	_ = h.DB.QueryRow(ctx, `SELECT COUNT(*) FROM courses WHERE status = 'published'`).Scan(&courseCount)
	_ = h.DB.QueryRow(ctx, `SELECT COUNT(*) FROM exam_usages WHERE status = 'published'`).Scan(&examCount)
	return &domain.WorkspaceStats{Label1: "可选课程", Value1: courseCount, Label2: "待考测评", Value2: examCount}
}
