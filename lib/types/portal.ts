export interface WorkspaceAnnouncement {
  id: string
  title: string
  type: string
  isNew: boolean
  date: string
}

export interface WorkspaceTodo {
  id: string
  title: string
  type: string
  count: number
  urgent: boolean
  deadline?: string
}

export interface WorkspaceScheduleEvent {
  id: string
  title: string
  type: "course" | "scene" | "exam" | "todo"
  dayOfWeek: number
  period: string
  teacher?: string
  location?: string
  status?: string
  className?: string
  tag?: string
  description?: string
}

export interface WorkspaceStats {
  label1: string
  value1: number
  label2: string
  value2: number
}

export interface WorkspaceDashboard {
  role: string
  announcements: WorkspaceAnnouncement[]
  todos: WorkspaceTodo[]
  schedule: WorkspaceScheduleEvent[]
  stats?: WorkspaceStats
}
