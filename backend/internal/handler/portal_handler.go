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

	role := claims.IdentityTypeCode
	if role == "" {
		role = string(claims.Role)
	}
	if role == "" {
		role = "student"
	}

	isTeacher := role == "teacher" || role == "school_admin" || role == "school"

	dash := domain.WorkspaceDashboard{
		Role:           role,
		Announcements:  h.listAnnouncements(r.Context(), role),
		Todos:          h.listTodos(r.Context(), claims.UserID, claims.TenantID, role),
		Schedule:       h.listSchedule(r.Context(), claims.UserID, claims.TenantID, role),
		Courses:        []domain.WorkspaceCourse{},
		SceneTasks:     []domain.WorkspaceSceneTask{},
		Exams:          []domain.WorkspaceExam{},
		LearningPath:   []domain.WorkspaceLearningPath{},
		TeacherCourses: []domain.WorkspaceTeacherCourse{},
		ClassPlans:     []domain.WorkspaceClassPlan{},
		ClassSessions:  []domain.WorkspaceClassSession{},
	}

	dash.Stats = h.stats(r.Context(), claims.UserID, claims.TenantID, isTeacher)

	if isTeacher {
		dash.TeacherCourses = h.listTeacherCourses(r.Context(), claims.UserID, claims.TenantID)
		dash.ClassPlans = []domain.WorkspaceClassPlan{}
		dash.ClassSessions = []domain.WorkspaceClassSession{}
	} else {
		dash.Courses = h.listStudentCourses(r.Context(), claims.UserID, claims.TenantID)
		dash.SceneTasks = h.listStudentSceneTasks(r.Context(), claims.UserID, claims.TenantID)
		dash.Exams = h.listStudentExams(r.Context(), claims.UserID, claims.TenantID)
		dash.LearningPath = []domain.WorkspaceLearningPath{}
	}

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

func (h *PortalHandler) listTodos(ctx context.Context, userID string, tenantID *string, role string) []domain.WorkspaceTodo {
	var todos []domain.WorkspaceTodo
	now := time.Now()
	if role == "teacher" || role == "school_admin" || role == "school" {
		var pendingApprovals int
		approvalQuery := `SELECT COUNT(*) FROM approval_records WHERE status = 'pending'`
		approvalArgs := []interface{}{}
		if tenantID != nil {
			approvalQuery += ` AND tenant_id = $1`
			approvalArgs = append(approvalArgs, *tenantID)
		}
		_ = h.DB.QueryRow(ctx, approvalQuery, approvalArgs...).Scan(&pendingApprovals)
		if pendingApprovals > 0 {
			todos = append(todos, domain.WorkspaceTodo{
				ID:     "pending-approvals",
				Title:  "待审批事项",
				Type:   "approve",
				Count:  pendingApprovals,
				Urgent: true,
			})
		}
		var draftCourses int
		draftQuery := `
			SELECT COUNT(*) FROM courses c
			JOIN users u ON u.id = c.creator_id
			WHERE c.status = 'draft' AND (c.teacher_id = $1::uuid OR c.creator_id = $1::uuid)`
		draftArgs := []interface{}{userID}
		if tenantID != nil {
			draftQuery += ` AND u.tenant_id = $2`
			draftArgs = append(draftArgs, *tenantID)
		}
		_ = h.DB.QueryRow(ctx, draftQuery, draftArgs...).Scan(&draftCourses)
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
		examQuery := `
			SELECT COUNT(*) FROM exam_usages eu
			JOIN users u ON u.id = eu.creator_id
			WHERE eu.status = 'published' AND (eu.start_time IS NULL OR eu.start_time >= $1)`
		examArgs := []interface{}{now}
		if tenantID != nil {
			examQuery += ` AND u.tenant_id = $2`
			examArgs = append(examArgs, *tenantID)
		}
		_ = h.DB.QueryRow(ctx, examQuery, examArgs...).Scan(&upcomingExams)
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

func (h *PortalHandler) listSchedule(ctx context.Context, userID string, tenantID *string, role string) []domain.WorkspaceScheduleEvent {
	var events []domain.WorkspaceScheduleEvent
	if role == "teacher" || role == "school_admin" || role == "school" {
		query := `
			SELECT c.id, c.name, COALESCE(c.class_name, ''), u.name
			FROM courses c
			LEFT JOIN users u ON u.id = c.teacher_id
			WHERE c.status = 'published' AND (c.teacher_id = $1::uuid OR c.creator_id = $1::uuid)`
		args := []interface{}{userID}
		if tenantID != nil {
			query += ` AND u.tenant_id = $2`
			args = append(args, *tenantID)
		}
		query += ` ORDER BY c.updated_at DESC LIMIT 20`
		rows, err := h.DB.Query(ctx, query, args...)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id, name, className, teacher string
				if err := rows.Scan(&id, &name, &className, &teacher); err != nil {
					continue
				}
				events = append(events, domain.WorkspaceScheduleEvent{
					ID:        id,
					Title:     name,
					Type:      "course",
					DayOfWeek: 1,
					Period:    "上午 1",
					Location:  className,
					Teacher:   teacher,
					Status:    "进行中",
				})
			}
		}
	}
	rows, err := h.DB.Query(ctx, `
		SELECT eu.id, eu.name, eu.start_time, eu.status
		FROM exam_usages eu
		JOIN users u ON u.id = eu.creator_id
		WHERE eu.status IN ('published', 'in_progress')
			AND ($1::uuid IS NULL OR u.tenant_id = $1::uuid)
		ORDER BY eu.start_time ASC NULLS LAST
		LIMIT 20
	`, tenantID)
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

func (h *PortalHandler) stats(ctx context.Context, userID string, tenantID *string, isTeacher bool) *domain.WorkspaceStats {
	if isTeacher {
		var courseCount, studentCount int
		courseQuery := `
			SELECT COUNT(*) FROM courses c
			JOIN users u ON u.id = c.creator_id
			WHERE c.status = 'published' AND (c.teacher_id = $1::uuid OR c.creator_id = $1::uuid)`
		courseArgs := []interface{}{userID}
		if tenantID != nil {
			courseQuery += ` AND u.tenant_id = $2`
			courseArgs = append(courseArgs, *tenantID)
		}
		_ = h.DB.QueryRow(ctx, courseQuery, courseArgs...).Scan(&courseCount)
		_ = h.DB.QueryRow(ctx, `
			SELECT COUNT(DISTINCT r.student_user_id) FROM lesson_behavior_records r
			WHERE r.course_id IN (
				SELECT c.id FROM courses c
				JOIN users u ON u.id = c.creator_id
				WHERE c.status = 'published' AND (c.teacher_id = $1::uuid OR c.creator_id = $1::uuid)
					AND ($2::uuid IS NULL OR u.tenant_id = $2::uuid)
			)
		`, userID, tenantID).Scan(&studentCount)
		return &domain.WorkspaceStats{Label1: "授课课程", Value1: courseCount, Label2: "学生人数", Value2: studentCount}
	}
	var courseCount, examCount int
	_ = h.DB.QueryRow(ctx, `
		SELECT COUNT(*) FROM courses c
		JOIN users u ON u.id = c.creator_id
		WHERE c.status = 'published' AND ($1::uuid IS NULL OR u.tenant_id = $1::uuid)
	`, tenantID).Scan(&courseCount)
	_ = h.DB.QueryRow(ctx, `
		SELECT COUNT(*) FROM exam_usages eu
		JOIN users u ON u.id = eu.creator_id
		WHERE eu.status = 'published' AND ($1::uuid IS NULL OR u.tenant_id = $1::uuid)
	`, tenantID).Scan(&examCount)
	return &domain.WorkspaceStats{Label1: "可选课程", Value1: courseCount, Label2: "待考测评", Value2: examCount}
}

func (h *PortalHandler) listStudentCourses(ctx context.Context, userID string, tenantID *string) []domain.WorkspaceCourse {
	query := `
		SELECT c.id, c.code, c.name, c.type, c.category, c.major, c.online_hours, c.offline_hours,
			c.semester, c.class_name, c.status, c.cover_color, c.cover_image, u.name
		FROM courses c
		LEFT JOIN users u ON u.id = c.teacher_id
		WHERE c.status = 'published'`
	args := []interface{}{}
	if tenantID != nil {
		query += ` AND (u.tenant_id = $1 OR c.creator_id IN (SELECT id FROM users WHERE tenant_id = $1))`
		args = append(args, *tenantID)
	}
	query += ` ORDER BY c.updated_at DESC LIMIT 50`
	rows, err := h.DB.Query(ctx, query, args...)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var items []domain.WorkspaceCourse
	for rows.Next() {
		var c domain.WorkspaceCourse
		var onlineHours, offlineHours *float64
		var category, major, semester, className, coverColor, coverImage, teacher, status string
		if err := rows.Scan(&c.ID, &c.Code, &c.Name, &c.Type, &category, &major, &onlineHours, &offlineHours,
			&semester, &className, &status, &coverColor, &coverImage, &teacher); err != nil {
			continue
		}
		c.Teacher = teacher
		c.Status = publishedStatusLabel(status)
		c.Hours = totalHours(onlineHours, offlineHours)
		c.Credit = c.Hours / 16
		c.Cover = coverText(c.Name)
		c.Progress = h.courseProgress(ctx, c.ID, userID)
		items = append(items, c)
	}
	return items
}

func (h *PortalHandler) listStudentSceneTasks(ctx context.Context, userID string, tenantID *string) []domain.WorkspaceSceneTask {
	query := `
		SELECT t.id, t.scenario_id, s.name, t.name, t.difficulty
		FROM scenario_tasks t
		JOIN scenarios s ON s.id = t.scenario_id
		JOIN users u ON u.id = s.creator_id
		WHERE s.status = 'published'`
	args := []interface{}{}
	if tenantID != nil {
		query += ` AND u.tenant_id = $1`
		args = append(args, *tenantID)
	}
	query += ` ORDER BY s.updated_at DESC LIMIT 50`
	rows, err := h.DB.Query(ctx, query, args...)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var items []domain.WorkspaceSceneTask
	for rows.Next() {
		var task domain.WorkspaceSceneTask
		var difficulty int
		if err := rows.Scan(&task.ID, &task.ScenarioID, &task.SceneName, &task.TaskName, &difficulty); err != nil {
			continue
		}
		task.Position = task.SceneName
		task.AbilityTags = []string{}
		task.Difficulty = difficultyLabel(difficulty)
		task.Deadline = ""
		task.TotalScore = 100
		task.Status = h.sceneTaskStatus(ctx, task.ID, userID)
		items = append(items, task)
	}
	return items
}

func (h *PortalHandler) listStudentExams(ctx context.Context, userID string, tenantID *string) []domain.WorkspaceExam {
	query := `
		SELECT eu.id, eu.name, eu.start_time, eu.end_time, eu.duration, eu.status, e.total_score,
			er.score
		FROM exam_usages eu
		JOIN exams e ON e.id = eu.exam_id
		JOIN users u ON u.id = eu.creator_id
		LEFT JOIN exam_results er ON er.exam_usage_id = eu.id AND er.user_id = $1::uuid
		WHERE eu.status IN ('published', 'in_progress', 'finished')`
	args := []interface{}{userID}
	if tenantID != nil {
		query += ` AND u.tenant_id = $2`
		args = append(args, *tenantID)
	}
	query += ` ORDER BY eu.start_time ASC NULLS LAST LIMIT 50`
	rows, err := h.DB.Query(ctx, query, args...)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var items []domain.WorkspaceExam
	for rows.Next() {
		var exam domain.WorkspaceExam
		var start, end *time.Time
		var score *float64
		var totalScore float64
		if err := rows.Scan(&exam.ID, &exam.Name, &start, &end, &exam.Duration, &exam.Status, &totalScore, &score); err != nil {
			continue
		}
		exam.Type = "在线测评"
		exam.TotalScore = int(totalScore)
		if score != nil {
			s := int(*score)
			exam.Score = &s
		}
		exam.Status = examStatusLabel(exam.Status)
		if start != nil {
			exam.StartTime = start.Format("2006-01-02 15:04")
		}
		if end != nil {
			exam.EndTime = end.Format("2006-01-02 15:04")
		}
		items = append(items, exam)
	}
	return items
}

func (h *PortalHandler) listTeacherCourses(ctx context.Context, userID string, tenantID *string) []domain.WorkspaceTeacherCourse {
	query := `
		SELECT c.id, c.code, c.name, c.type, c.category, c.online_hours, c.offline_hours,
			c.semester, c.class_name, c.status, c.cover_color, c.cover_image
		FROM courses c
		JOIN users u ON u.id = c.creator_id
		WHERE c.status = 'published' AND (c.teacher_id = $1::uuid OR c.creator_id = $1::uuid)`
	args := []interface{}{userID}
	if tenantID != nil {
		query += ` AND u.tenant_id = $2`
		args = append(args, *tenantID)
	}
	query += ` ORDER BY c.updated_at DESC LIMIT 50`
	rows, err := h.DB.Query(ctx, query, args...)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var items []domain.WorkspaceTeacherCourse
	for rows.Next() {
		var c domain.WorkspaceTeacherCourse
		var onlineHours, offlineHours *float64
		var category, semester, className, coverColor, coverImage, status string
		if err := rows.Scan(&c.ID, &c.Code, &c.Name, &c.Type, &category, &onlineHours, &offlineHours,
			&semester, &className, &status, &coverColor, &coverImage); err != nil {
			continue
		}
		c.ClassName = className
		c.Term = semester
		c.Status = publishedStatusLabel(status)
		c.Hours = totalHours(onlineHours, offlineHours)
		c.Cover = coverText(c.Name)
		c.Students = h.courseStudentCount(ctx, c.ID)
		c.Progress = 0
		items = append(items, c)
	}
	return items
}

func (h *PortalHandler) courseProgress(ctx context.Context, courseID, userID string) int {
	var total, present int
	_ = h.DB.QueryRow(ctx, `
		SELECT COUNT(*), COUNT(*) FILTER (WHERE attendance = 'present')
		FROM lesson_behavior_records
		WHERE course_id = $1::uuid AND student_user_id = $2::uuid
	`, courseID, userID).Scan(&total, &present)
	if total == 0 {
		return 0
	}
	return present * 100 / total
}

func (h *PortalHandler) courseStudentCount(ctx context.Context, courseID string) int {
	var count int
	_ = h.DB.QueryRow(ctx, `
		SELECT COUNT(DISTINCT student_user_id) FROM lesson_behavior_records
		WHERE course_id = $1::uuid
	`, courseID).Scan(&count)
	return count
}

func (h *PortalHandler) sceneTaskStatus(ctx context.Context, taskID, userID string) string {
	var status string
	var score *float64
	_ = h.DB.QueryRow(ctx, `
		SELECT status, total_score FROM scene_evaluation_results
		WHERE task_id = $1::uuid AND evaluatee_id = $2::uuid
		ORDER BY created_at DESC LIMIT 1
	`, taskID, userID).Scan(&status, &score)
	if status == "" {
		return "未开始"
	}
	if status == "evaluated" || score != nil {
		return "已完成"
	}
	return "进行中"
}

func totalHours(online, offline *float64) int {
	total := 0.0
	if online != nil {
		total += *online
	}
	if offline != nil {
		total += *offline
	}
	return int(total)
}

func coverText(name string) string {
	if name == "" {
		return "?"
	}
	return string([]rune(name)[0])
}

func publishedStatusLabel(status string) string {
	switch status {
	case "published":
		return "进行中"
	case "archived":
		return "已完成"
	default:
		return "未开始"
	}
}

func difficultyLabel(difficulty int) string {
	switch difficulty {
	case 1, 2:
		return "简单"
	case 3:
		return "中等"
	default:
		return "困难"
	}
}

func examStatusLabel(status string) string {
	switch status {
	case "published":
		return "待考"
	case "in_progress":
		return "进行中"
	case "finished":
		return "已完成"
	default:
		return status
	}
}
