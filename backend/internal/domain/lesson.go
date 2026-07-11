package domain

import "time"

type CourseStatus string

const (
	CourseStatusDraft     CourseStatus = "draft"
	CourseStatusPending   CourseStatus = "pending"
	CourseStatusRejected  CourseStatus = "rejected"
	CourseStatusPublished CourseStatus = "published"
	CourseStatusArchived  CourseStatus = "archived"
)

type LessonBatchStatus string

const (
	LessonBatchStatusOpen   LessonBatchStatus = "open"
	LessonBatchStatusClosed LessonBatchStatus = "closed"
)

type Course struct {
	ID            string         `json:"id"`
	Code          string         `json:"code"`
	Name          string         `json:"name"`
	Type          string         `json:"type"`
	Category      string         `json:"category"`
	Major         *string        `json:"major,omitempty"`
	TeacherID     *string        `json:"teacherId,omitempty"`
	Industry      *string        `json:"industry,omitempty"`
	Version       *string        `json:"version,omitempty"`
	OnlineHours   *float64       `json:"onlineHours,omitempty"`
	OfflineHours  *float64       `json:"offlineHours,omitempty"`
	OnlineWeight  *float64       `json:"onlineWeight,omitempty"`
	OfflineWeight *float64       `json:"offlineWeight,omitempty"`
	Semester      *string        `json:"semester,omitempty"`
	ClassName     *string        `json:"className,omitempty"`
	Status        CourseStatus   `json:"status"`
	CoverColor    *string        `json:"coverColor,omitempty"`
	CoverImage    *string        `json:"coverImage,omitempty"`
	CourseTag     *string        `json:"courseTag,omitempty"`
	CreatorID     string         `json:"creatorId"`
	CoCreatorIds  JSONSlice      `json:"coCreatorIds,omitempty"`
	BatchGroup    *string        `json:"batchGroup,omitempty"`
	NodeCount     int            `json:"nodeCount"`
	ResourceCount int            `json:"resourceCount"`
	ViewCount     int            `json:"viewCount"`
	StudyCount    int            `json:"studyCount"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
}

type KnowledgePoint struct {
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	Code              *string   `json:"code,omitempty"`
	Description       *string   `json:"description,omitempty"`
	Linked            bool      `json:"linked"`
	GranularLessonIds JSONSlice `json:"granularLessonIds,omitempty"`
	CreatorID         *string   `json:"creatorId,omitempty"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

type SystemCourseNode struct {
	ID               string    `json:"id"`
	CourseID         string    `json:"courseId"`
	ParentID         *string   `json:"parentId,omitempty"`
	Name             string    `json:"name"`
	SortOrder        int       `json:"sortOrder"`
	RefType          string    `json:"refType"`
	SourceID         *string   `json:"sourceId,omitempty"`
	SourceName       *string   `json:"sourceName,omitempty"`
	TeachingGoals    *string   `json:"teachingGoals,omitempty"`
	Duration         *float64  `json:"duration,omitempty"`
	KnowledgePointIds JSONSlice `json:"knowledgePointIds,omitempty"`
	ResourceIds      JSONSlice `json:"resourceIds,omitempty"`
	Status           string    `json:"status"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type NodeQuiz struct {
	ID        string  `json:"id"`
	NodeID    string  `json:"nodeId"`
	Title     string  `json:"title"`
	Type      string  `json:"type"`
	TimeLimit *int    `json:"timeLimit,omitempty"`
}

type NodeQuizQuestion struct {
	ID        string  `json:"id"`
	QuizID    string  `json:"quizId"`
	Type      string  `json:"type"`
	Question  string  `json:"question"`
	Options   JSONMap `json:"options,omitempty"`
	Answer    *string `json:"answer,omitempty"`
	Score     float64 `json:"score"`
	SortOrder int     `json:"sortOrder"`
}

type NodeHomework struct {
	ID             string    `json:"id"`
	NodeID         string    `json:"nodeId"`
	Title          string    `json:"title"`
	Requirement    *string   `json:"requirement,omitempty"`
	NeedAttachment bool      `json:"needAttachment"`
	Deadline       *time.Time `json:"deadline,omitempty"`
}

type HybridNodeModule struct {
	ID        string  `json:"id"`
	NodeID    string  `json:"nodeId"`
	ModuleKey string  `json:"moduleKey"`
	Mode      string  `json:"mode"`
	Data      JSONMap `json:"data"`
}

type LessonBatch struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Code        *string           `json:"code,omitempty"`
	OrgNodeID   *string           `json:"orgNodeId,omitempty"`
	Major       *string           `json:"major,omitempty"`
	WorkflowID  *string           `json:"workflowId,omitempty"`
	Status      LessonBatchStatus `json:"status"`
	CourseCount *int              `json:"courseCount,omitempty"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
}

type LessonBehaviorRecord struct {
	ID               string     `json:"id"`
	CourseID         string     `json:"courseId"`
	StudentUserID    string     `json:"studentUserId"`
	StudentName      string     `json:"studentName"`
	RecordDate       string     `json:"recordDate"`
	Attendance       string     `json:"attendance"`
	QuizScore        *float64   `json:"quizScore,omitempty"`
	InteractionCount int        `json:"interactionCount"`
	PraiseCount      int        `json:"praiseCount"`
	RushCorrectCount int        `json:"rushCorrectCount"`
	RushAvgTimeSec   *int       `json:"rushAvgTimeSec,omitempty"`
	CreatedAt        time.Time  `json:"createdAt"`
	UpdatedAt        time.Time  `json:"updatedAt"`
}
