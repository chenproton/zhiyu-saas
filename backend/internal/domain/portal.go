package domain

import "time"

type WorkspaceDashboard struct {
	Role          string                    `json:"role"`
	Announcements []WorkspaceAnnouncement   `json:"announcements"`
	Todos         []WorkspaceTodo           `json:"todos"`
	Schedule      []WorkspaceScheduleEvent  `json:"schedule"`
	Stats         *WorkspaceStats           `json:"stats,omitempty"`
}

type WorkspaceAnnouncement struct {
	ID     string    `json:"id"`
	Title  string    `json:"title"`
	Type   string    `json:"type"`
	IsNew  bool      `json:"isNew"`
	Date   string    `json:"date"`
	CreatedAt time.Time `json:"createdAt"`
}

type WorkspaceTodo struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Type     string `json:"type"`
	Count    int    `json:"count"`
	Urgent   bool   `json:"urgent"`
	Deadline string `json:"deadline,omitempty"`
}

type WorkspaceScheduleEvent struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Type      string `json:"type"`
	DayOfWeek int    `json:"dayOfWeek"`
	Period    string `json:"period"`
	Teacher   string `json:"teacher,omitempty"`
	Location  string `json:"location,omitempty"`
	Status    string `json:"status,omitempty"`
}

type WorkspaceStats struct {
	Label1 string `json:"label1"`
	Value1 int    `json:"value1"`
	Label2 string `json:"label2"`
	Value2 int    `json:"value2"`
}
