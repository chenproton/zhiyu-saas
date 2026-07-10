// 教师工作台 Mock 数据
// 参考 zhiyu-lesson 教学空间的数据结构

export interface TeacherInfo {
  id: string
  name: string
  avatar: string
  department: string
  title: string
  teacherNo: string
  courses: number
  students: number
}

export interface TeacherAnnouncement {
  id: string
  title: string
  date: string
  type: "重要" | "通知" | "公告" | "教务"
  isNew: boolean
}

export interface TeacherTodoItem {
  id: string
  title: string
  type: "grade" | "approve" | "homework" | "review"
  count: number
  urgent: boolean
  color: string
  deadline?: string
}

export interface TeacherCalendarEvent {
  id: string
  title: string
  time: string
  date: number
  color: string
  type: "course" | "meeting" | "exam" | "training"
}

export interface TeacherCourse {
  id: string
  name: string
  code: string
  type: string
  className: string
  term: string
  students: number
  hours: number
  progress: number
  cover: string
  status: "进行中" | "未开始" | "已结课"
  nextTask?: string
  nextDeadline?: string
}

export interface ClassSessionData {
  id: string
  courseId: string
  venue: string
  week: number
  weekday: string
  period: string
  status: "pending" | "associated"
}

export interface GradeSubmitItem {
  id: string
  courseName: string
  className: string
  students: number
  status: "已提交" | "待提交" | "录入中"
  deadline?: string
}

// ==================== 教师基本信息 ====================

export const mockTeacherInfo: TeacherInfo = {
  id: "tch_001",
  name: "张正国",
  avatar: "张",
  department: "计算机学院",
  title: "教授",
  teacherNo: "T202001",
  courses: 5,
  students: 186,
}

// ==================== 通知公告 ====================

export const mockTeacherAnnouncements: TeacherAnnouncement[] = [
  { id: "a1", title: "关于2026年春季学期期中教学检查的通知", date: "2026-04-12", type: "重要", isNew: true },
  { id: "a2", title: "教务处：第12周期末考试排考通知", date: "2026-04-10", type: "教务", isNew: true },
  { id: "a3", title: "教师信息化教学能力培训报名通知", date: "2026-04-09", type: "通知", isNew: true },
  { id: "a4", title: "2026年教学改革项目申报公告", date: "2026-04-05", type: "公告", isNew: false },
  { id: "a5", title: "关于开展课程思政示范课评选的通知", date: "2026-04-01", type: "教务", isNew: false },
]

// ==================== 待办事项 ====================

export const mockTeacherTodos: TeacherTodoItem[] = [
  { id: "t1", title: "待提交期末成绩", type: "grade", count: 2, urgent: true, color: "#ef4444", deadline: "2026-04-20" },
  { id: "t2", title: "待批改作业", type: "homework", count: 38, urgent: false, color: "#3b82f6" },
  { id: "t3", title: "待审批学生请假", type: "approve", count: 6, urgent: true, color: "#f59e0b", deadline: "2026-04-15" },
  { id: "t4", title: "待审核课程资源", type: "review", count: 3, urgent: false, color: "#10b981", deadline: "2026-04-18" },
]

// ==================== 教学日历事件 ====================

export const mockTeacherCalendarEvents: TeacherCalendarEvent[] = [
  { id: "e1", title: "网络基础", time: "08:00", date: 14, color: "bg-blue-500", type: "course" },
  { id: "e2", title: "教研组会议", time: "10:00", date: 14, color: "bg-amber-500", type: "meeting" },
  { id: "e3", title: "Linux系统管理", time: "14:00", date: 15, color: "bg-emerald-500", type: "course" },
  { id: "e4", title: "路由交换技术", time: "08:00", date: 16, color: "bg-blue-500", type: "course" },
  { id: "e5", title: "期中教学检查", time: "14:00", date: 17, color: "bg-purple-500", type: "exam" },
  { id: "e6", title: "教师培训", time: "09:00", date: 18, color: "bg-amber-500", type: "training" },
]

// ==================== 我的课程 ====================

export const mockTeacherCourses: TeacherCourse[] = [
  {
    id: "c1",
    name: "网络基础",
    code: "NET101",
    type: "专业基础课",
    className: "计网2401班",
    term: "2026年春季学期",
    students: 42,
    hours: 64,
    progress: 78,
    cover: "网",
    status: "进行中",
    nextTask: "准备第5章实验课",
    nextDeadline: "2026-04-16",
  },
  {
    id: "c2",
    name: "路由交换技术",
    code: "NET201",
    type: "专业核心课",
    className: "计网2401班",
    term: "2026年春季学期",
    students: 42,
    hours: 80,
    progress: 55,
    cover: "路",
    status: "进行中",
    nextTask: "批改VLAN实验报告",
    nextDeadline: "2026-04-18",
  },
  {
    id: "c3",
    name: "Linux系统管理",
    code: "LIN101",
    type: "专业基础课",
    className: "计网2402班",
    term: "2026年春季学期",
    students: 38,
    hours: 48,
    progress: 68,
    cover: "L",
    status: "进行中",
    nextTask: "Shell脚本作业批改",
    nextDeadline: "2026-04-15",
  },
  {
    id: "c4",
    name: "网络安全技术",
    code: "SEC301",
    type: "专业核心课",
    className: "计网2301班",
    term: "2026年春季学期",
    students: 35,
    hours: 72,
    progress: 40,
    cover: "安",
    status: "进行中",
    nextTask: "防火墙配置实验",
    nextDeadline: "2026-04-17",
  },
  {
    id: "c5",
    name: "云计算技术",
    code: "CLD301",
    type: "专业核心课",
    className: "计网2301班",
    term: "2026年春季学期",
    students: 35,
    hours: 64,
    progress: 0,
    cover: "云",
    status: "未开始",
  },
  {
    id: "c6",
    name: "职业素养与沟通",
    code: "GEN101",
    type: "公共基础课",
    className: "计网2401班",
    term: "2025年秋季学期",
    students: 42,
    hours: 32,
    progress: 100,
    cover: "职",
    status: "已结课",
  },
]

// ==================== 开课计划-课程节次 ====================

export interface ClassPlanItem {
  id: string
  name: string
  course: string
  term: string
  students: number
  teacher: string
  status: "pending" | "active"
}

export const semesters = [
  "2025年第一学期",
  "2025年第二学期",
  "2026年第一学期",
]

export const mockClassPlans: ClassPlanItem[] = [
  { id: "cls-1", name: "计网2401班", course: "网络基础", term: "2026年第一学期", students: 42, teacher: "张正国", status: "active" },
  { id: "cls-2", name: "计网2402班", course: "Linux系统管理", term: "2026年第一学期", students: 38, teacher: "张正国", status: "active" },
  { id: "cls-3", name: "计网2401班", course: "路由交换技术", term: "2026年第一学期", students: 42, teacher: "张正国", status: "active" },
  { id: "cls-4", name: "计网2301班", course: "网络安全技术", term: "2026年第一学期", students: 35, teacher: "张正国", status: "active" },
  { id: "cls-5", name: "计网2301班", course: "云计算技术", term: "2026年第一学期", students: 35, teacher: "张正国", status: "pending" },
  { id: "cls-6", name: "计网2401班", course: "职业素养与沟通", term: "2025年第二学期", students: 42, teacher: "张正国", status: "active" },
]

export const mockClassSessions: ClassSessionData[] = [
  // cls-1: 网络基础 (计网2401班) - 20节
  { id: "s-1-1", courseId: "cls-1", venue: "教学楼 A-301", week: 1, weekday: "周一", period: "上午 1", status: "associated" },
  { id: "s-1-2", courseId: "cls-1", venue: "教学楼 A-301", week: 1, weekday: "周三", period: "上午 2", status: "associated" },
  { id: "s-1-3", courseId: "cls-1", venue: "实验楼 B-205", week: 2, weekday: "周一", period: "上午 1", status: "associated" },
  { id: "s-1-4", courseId: "cls-1", venue: "实验楼 B-205", week: 2, weekday: "周三", period: "上午 2", status: "associated" },
  { id: "s-1-5", courseId: "cls-1", venue: "教学楼 A-301", week: 3, weekday: "周一", period: "上午 1", status: "associated" },
  { id: "s-1-6", courseId: "cls-1", venue: "教学楼 A-301", week: 3, weekday: "周三", period: "上午 2", status: "associated" },
  { id: "s-1-7", courseId: "cls-1", venue: "实验楼 B-205", week: 4, weekday: "周一", period: "上午 1", status: "associated" },
  { id: "s-1-8", courseId: "cls-1", venue: "实验楼 B-205", week: 4, weekday: "周三", period: "上午 2", status: "associated" },
  { id: "s-1-9", courseId: "cls-1", venue: "教学楼 A-301", week: 5, weekday: "周一", period: "上午 1", status: "associated" },
  { id: "s-1-10", courseId: "cls-1", venue: "教学楼 A-301", week: 5, weekday: "周三", period: "上午 2", status: "pending" },
  { id: "s-1-11", courseId: "cls-1", venue: "实验楼 B-205", week: 6, weekday: "周一", period: "上午 1", status: "pending" },
  { id: "s-1-12", courseId: "cls-1", venue: "实验楼 B-205", week: 6, weekday: "周三", period: "上午 2", status: "pending" },
  { id: "s-1-13", courseId: "cls-1", venue: "教学楼 A-301", week: 7, weekday: "周一", period: "上午 1", status: "pending" },
  { id: "s-1-14", courseId: "cls-1", venue: "教学楼 A-301", week: 7, weekday: "周三", period: "上午 2", status: "pending" },
  { id: "s-1-15", courseId: "cls-1", venue: "实验楼 B-205", week: 8, weekday: "周一", period: "上午 1", status: "pending" },
  { id: "s-1-16", courseId: "cls-1", venue: "实验楼 B-205", week: 8, weekday: "周三", period: "上午 2", status: "pending" },
  { id: "s-1-17", courseId: "cls-1", venue: "教学楼 A-301", week: 9, weekday: "周一", period: "上午 1", status: "pending" },
  { id: "s-1-18", courseId: "cls-1", venue: "教学楼 A-301", week: 9, weekday: "周三", period: "上午 2", status: "pending" },
  { id: "s-1-19", courseId: "cls-1", venue: "实验楼 B-205", week: 10, weekday: "周一", period: "上午 1", status: "pending" },
  { id: "s-1-20", courseId: "cls-1", venue: "实验楼 B-205", week: 10, weekday: "周三", period: "上午 2", status: "pending" },
  // cls-2: Linux系统管理 (计网2402班) - 18节
  { id: "s-2-1", courseId: "cls-2", venue: "实验楼 B-205", week: 1, weekday: "周二", period: "上午 1", status: "associated" },
  { id: "s-2-2", courseId: "cls-2", venue: "实验楼 B-205", week: 1, weekday: "周四", period: "上午 1", status: "associated" },
  { id: "s-2-3", courseId: "cls-2", venue: "实验楼 B-205", week: 2, weekday: "周二", period: "上午 1", status: "associated" },
  { id: "s-2-4", courseId: "cls-2", venue: "实验楼 B-205", week: 2, weekday: "周四", period: "上午 1", status: "associated" },
  { id: "s-2-5", courseId: "cls-2", venue: "实验楼 B-205", week: 3, weekday: "周二", period: "上午 1", status: "associated" },
  { id: "s-2-6", courseId: "cls-2", venue: "实验楼 B-205", week: 3, weekday: "周四", period: "上午 1", status: "associated" },
  { id: "s-2-7", courseId: "cls-2", venue: "实验楼 B-205", week: 4, weekday: "周二", period: "上午 1", status: "associated" },
  { id: "s-2-8", courseId: "cls-2", venue: "实验楼 B-205", week: 4, weekday: "周四", period: "上午 1", status: "associated" },
  { id: "s-2-9", courseId: "cls-2", venue: "实验楼 B-205", week: 5, weekday: "周二", period: "上午 1", status: "associated" },
  { id: "s-2-10", courseId: "cls-2", venue: "实验楼 B-205", week: 5, weekday: "周四", period: "上午 1", status: "pending" },
  { id: "s-2-11", courseId: "cls-2", venue: "实验楼 B-205", week: 6, weekday: "周二", period: "上午 1", status: "pending" },
  { id: "s-2-12", courseId: "cls-2", venue: "实验楼 B-205", week: 6, weekday: "周四", period: "上午 1", status: "pending" },
  { id: "s-2-13", courseId: "cls-2", venue: "实验楼 B-205", week: 7, weekday: "周二", period: "上午 1", status: "pending" },
  { id: "s-2-14", courseId: "cls-2", venue: "实验楼 B-205", week: 7, weekday: "周四", period: "上午 1", status: "pending" },
  { id: "s-2-15", courseId: "cls-2", venue: "实验楼 B-205", week: 8, weekday: "周二", period: "上午 1", status: "pending" },
  { id: "s-2-16", courseId: "cls-2", venue: "实验楼 B-205", week: 8, weekday: "周四", period: "上午 1", status: "pending" },
  { id: "s-2-17", courseId: "cls-2", venue: "实验楼 B-205", week: 9, weekday: "周二", period: "上午 1", status: "pending" },
  { id: "s-2-18", courseId: "cls-2", venue: "实验楼 B-205", week: 9, weekday: "周四", period: "上午 1", status: "pending" },
  // cls-3: 路由交换技术 (计网2401班) - 20节
  { id: "s-3-1", courseId: "cls-3", venue: "实训中心 C-102", week: 1, weekday: "周一", period: "下午 1", status: "associated" },
  { id: "s-3-2", courseId: "cls-3", venue: "实训中心 C-102", week: 1, weekday: "周三", period: "下午 1", status: "associated" },
  { id: "s-3-3", courseId: "cls-3", venue: "实训中心 C-102", week: 2, weekday: "周一", period: "下午 1", status: "associated" },
  { id: "s-3-4", courseId: "cls-3", venue: "实训中心 C-102", week: 2, weekday: "周三", period: "下午 1", status: "associated" },
  { id: "s-3-5", courseId: "cls-3", venue: "实训中心 C-102", week: 3, weekday: "周一", period: "下午 1", status: "associated" },
  { id: "s-3-6", courseId: "cls-3", venue: "实训中心 C-102", week: 3, weekday: "周三", period: "下午 1", status: "associated" },
  { id: "s-3-7", courseId: "cls-3", venue: "实训中心 C-102", week: 4, weekday: "周一", period: "下午 1", status: "associated" },
  { id: "s-3-8", courseId: "cls-3", venue: "实训中心 C-102", week: 4, weekday: "周三", period: "下午 1", status: "associated" },
  { id: "s-3-9", courseId: "cls-3", venue: "实训中心 C-102", week: 5, weekday: "周一", period: "下午 1", status: "associated" },
  { id: "s-3-10", courseId: "cls-3", venue: "实训中心 C-102", week: 5, weekday: "周三", period: "下午 1", status: "pending" },
  { id: "s-3-11", courseId: "cls-3", venue: "实训中心 C-102", week: 6, weekday: "周一", period: "下午 1", status: "pending" },
  { id: "s-3-12", courseId: "cls-3", venue: "实训中心 C-102", week: 6, weekday: "周三", period: "下午 1", status: "pending" },
  { id: "s-3-13", courseId: "cls-3", venue: "实训中心 C-102", week: 7, weekday: "周一", period: "下午 1", status: "pending" },
  { id: "s-3-14", courseId: "cls-3", venue: "实训中心 C-102", week: 7, weekday: "周三", period: "下午 1", status: "pending" },
  { id: "s-3-15", courseId: "cls-3", venue: "实训中心 C-102", week: 8, weekday: "周一", period: "下午 1", status: "pending" },
  { id: "s-3-16", courseId: "cls-3", venue: "实训中心 C-102", week: 8, weekday: "周三", period: "下午 1", status: "pending" },
  { id: "s-3-17", courseId: "cls-3", venue: "实训中心 C-102", week: 9, weekday: "周一", period: "下午 1", status: "pending" },
  { id: "s-3-18", courseId: "cls-3", venue: "实训中心 C-102", week: 9, weekday: "周三", period: "下午 1", status: "pending" },
  { id: "s-3-19", courseId: "cls-3", venue: "实训中心 C-102", week: 10, weekday: "周一", period: "下午 1", status: "pending" },
  { id: "s-3-20", courseId: "cls-3", venue: "实训中心 C-102", week: 10, weekday: "周三", period: "下午 1", status: "pending" },
  // cls-4: 网络安全技术 (计网2301班) - 18节
  { id: "s-4-1", courseId: "cls-4", venue: "教学楼 A-401", week: 1, weekday: "周二", period: "下午 1", status: "associated" },
  { id: "s-4-2", courseId: "cls-4", venue: "实验楼 C-301", week: 1, weekday: "周四", period: "下午 2", status: "associated" },
  { id: "s-4-3", courseId: "cls-4", venue: "教学楼 A-401", week: 2, weekday: "周二", period: "下午 1", status: "associated" },
  { id: "s-4-4", courseId: "cls-4", venue: "实验楼 C-301", week: 2, weekday: "周四", period: "下午 2", status: "associated" },
  { id: "s-4-5", courseId: "cls-4", venue: "教学楼 A-401", week: 3, weekday: "周二", period: "下午 1", status: "associated" },
  { id: "s-4-6", courseId: "cls-4", venue: "实验楼 C-301", week: 3, weekday: "周四", period: "下午 2", status: "associated" },
  { id: "s-4-7", courseId: "cls-4", venue: "教学楼 A-401", week: 4, weekday: "周二", period: "下午 1", status: "associated" },
  { id: "s-4-8", courseId: "cls-4", venue: "实验楼 C-301", week: 4, weekday: "周四", period: "下午 2", status: "associated" },
  { id: "s-4-9", courseId: "cls-4", venue: "教学楼 A-401", week: 5, weekday: "周二", period: "下午 1", status: "associated" },
  { id: "s-4-10", courseId: "cls-4", venue: "实验楼 C-301", week: 5, weekday: "周四", period: "下午 2", status: "pending" },
  { id: "s-4-11", courseId: "cls-4", venue: "教学楼 A-401", week: 6, weekday: "周二", period: "下午 1", status: "pending" },
  { id: "s-4-12", courseId: "cls-4", venue: "实验楼 C-301", week: 6, weekday: "周四", period: "下午 2", status: "pending" },
  { id: "s-4-13", courseId: "cls-4", venue: "教学楼 A-401", week: 7, weekday: "周二", period: "下午 1", status: "pending" },
  { id: "s-4-14", courseId: "cls-4", venue: "实验楼 C-301", week: 7, weekday: "周四", period: "下午 2", status: "pending" },
  { id: "s-4-15", courseId: "cls-4", venue: "教学楼 A-401", week: 8, weekday: "周二", period: "下午 1", status: "pending" },
  { id: "s-4-16", courseId: "cls-4", venue: "实验楼 C-301", week: 8, weekday: "周四", period: "下午 2", status: "pending" },
  { id: "s-4-17", courseId: "cls-4", venue: "教学楼 A-401", week: 9, weekday: "周二", period: "下午 1", status: "pending" },
  { id: "s-4-18", courseId: "cls-4", venue: "实验楼 C-301", week: 9, weekday: "周四", period: "下午 2", status: "pending" },
  // cls-5: 云计算技术 (计网2301班) - 6节 (未开始)
  { id: "s-5-1", courseId: "cls-5", venue: "云计算实验室 F-301", week: 11, weekday: "周一", period: "上午 1", status: "pending" },
  { id: "s-5-2", courseId: "cls-5", venue: "云计算实验室 F-301", week: 11, weekday: "周三", period: "上午 2", status: "pending" },
  { id: "s-5-3", courseId: "cls-5", venue: "云计算实验室 F-301", week: 12, weekday: "周一", period: "上午 1", status: "pending" },
  { id: "s-5-4", courseId: "cls-5", venue: "云计算实验室 F-301", week: 12, weekday: "周三", period: "上午 2", status: "pending" },
  { id: "s-5-5", courseId: "cls-5", venue: "云计算实验室 F-301", week: 13, weekday: "周一", period: "上午 1", status: "pending" },
  { id: "s-5-6", courseId: "cls-5", venue: "云计算实验室 F-301", week: 13, weekday: "周三", period: "上午 2", status: "pending" },
  // cls-6: 职业素养与沟通 - 4节 (2025年第二学期)
  { id: "s-6-1", courseId: "cls-6", venue: "教学楼 A-201", week: 3, weekday: "周五", period: "上午 1", status: "associated" },
  { id: "s-6-2", courseId: "cls-6", venue: "教学楼 A-201", week: 6, weekday: "周五", period: "上午 1", status: "associated" },
  { id: "s-6-3", courseId: "cls-6", venue: "教学楼 A-201", week: 9, weekday: "周五", period: "上午 1", status: "pending" },
  { id: "s-6-4", courseId: "cls-6", venue: "教学楼 A-201", week: 12, weekday: "周五", period: "上午 1", status: "pending" },
]

// ==================== 教师课程表 ====================

export type TeacherScheduleEventType = "course" | "scene" | "meeting" | "training" | "exam" | "todo"

export interface TeacherScheduleEvent {
  id: string
  title: string
  type: TeacherScheduleEventType
  dayOfWeek: number
  period: string
  location?: string
  description?: string
  tag?: string
  className?: string
}

export const teacherPeriods = [
  "上午 1",
  "上午 2",
  "上午 3",
  "上午 4",
  "下午 1",
  "下午 2",
  "下午 3",
  "下午 4",
] as const

export const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

// ==================== 备课关联数据 ====================

export interface PrepSubItem {
  id: string
  name: string
}

export interface PrepAssociationRecord {
  planId: string
  subItems: { id: string; name: string }[]
}

export const hybridCourseSessions: Record<string, PrepSubItem[]> = {
  "cls-1": [
    { id: "hs-1-1", name: "第1周 · 子网划分基础" },
    { id: "hs-1-2", name: "第2周 · IP地址与子网掩码" },
    { id: "hs-1-3", name: "第3周 · VLAN划分入门" },
    { id: "hs-1-4", name: "第4周 · 路由协议基础" },
  ],
  "cls-3": [
    { id: "hs-3-1", name: "第1周 · VLAN基础配置" },
    { id: "hs-3-2", name: "第2周 · VLAN间路由实验" },
    { id: "hs-3-3", name: "第3周 · STP协议配置" },
  ],
  "cls-6": [
    { id: "hs-6-1", name: "第1周 · 职业素养概述" },
    { id: "hs-6-2", name: "第3周 · 沟通技巧训练" },
  ],
}

export const scenarioTasks: Record<string, PrepSubItem[]> = {
  "cls-2": [
    { id: "st-2-1", name: "任务1 · Shell脚本基础" },
    { id: "st-2-2", name: "任务2 · 用户与权限管理" },
    { id: "st-2-3", name: "任务3 · 进程管理与监控" },
    { id: "st-2-4", name: "任务4 · 网络配置实战" },
  ],
  "cls-4": [
    { id: "st-4-1", name: "任务1 · 防火墙基础规则" },
    { id: "st-4-2", name: "任务2 · IDS入侵检测" },
    { id: "st-4-3", name: "任务3 · VPN隧道搭建" },
  ],
  "cls-5": [
    { id: "st-5-1", name: "任务1 · 云平台基础操作" },
    { id: "st-5-2", name: "任务2 · 虚拟化部署" },
  ],
}

export const mockTeacherSchedule: TeacherScheduleEvent[] = [
  // 周一
  { id: "se1", title: "网络基础", type: "course", dayOfWeek: 1, period: "上午 1", location: "教学楼 A-301", description: "第5章 子网划分", tag: "计网2401班", className: "计网2401班" },
  { id: "se2", title: "网络基础", type: "course", dayOfWeek: 1, period: "上午 2", location: "教学楼 A-301", description: "第5章 子网划分实验", tag: "计网2401班", className: "计网2401班" },
  { id: "se3", title: "路由交换技术", type: "course", dayOfWeek: 1, period: "下午 1", location: "实训中心 C-102", description: "VLAN配置实验", tag: "计网2401班", className: "计网2401班" },
  { id: "se4", title: "教研组会议", type: "meeting", dayOfWeek: 1, period: "下午 3", location: "会议室 302", description: "期中教学检查布置", tag: "全体教师" },

  // 周二
  { id: "se5", title: "Linux系统管理", type: "scene", dayOfWeek: 2, period: "上午 1", location: "实验楼 B-205", description: "Shell脚本编程", tag: "计网2402班", className: "计网2402班" },
  { id: "se6", title: "Linux系统管理", type: "scene", dayOfWeek: 2, period: "上午 2", location: "实验楼 B-205", description: "Shell脚本编程", tag: "计网2402班", className: "计网2402班" },
  { id: "se7", title: "网络安全技术", type: "scene", dayOfWeek: 2, period: "上午 1", location: "教学楼 A-401", description: "防火墙基本原理", tag: "计网2301班", className: "计网2301班" },
  { id: "se8", title: "期中教学检查", type: "exam", dayOfWeek: 2, period: "下午 2", location: "教务处", description: "提交教学文档", tag: "教务" },

  // 周三
  { id: "se9", title: "网络基础", type: "course", dayOfWeek: 3, period: "上午 1", location: "教学楼 A-301", description: "第5章复习与答疑", tag: "计网2401班", className: "计网2401班" },
  { id: "se10", title: "路由交换技术", type: "course", dayOfWeek: 3, period: "下午 1", location: "实训中心 C-102", description: "VLAN间路由", tag: "计网2401班", className: "计网2401班" },
  { id: "se11", title: "路由交换技术", type: "course", dayOfWeek: 3, period: "下午 2", location: "实训中心 C-102", description: "VLAN间路由实验", tag: "计网2401班", className: "计网2401班" },

  // 周四
  { id: "se12", title: "Linux系统管理", type: "scene", dayOfWeek: 4, period: "上午 1", location: "实验楼 B-205", description: "用户与权限管理", tag: "计网2402班", className: "计网2402班" },
  { id: "se13", title: "网络安全技术", type: "scene", dayOfWeek: 4, period: "上午 1", location: "教学楼 A-401", description: "入侵检测系统", tag: "计网2301班", className: "计网2301班" },
  { id: "se14", title: "网络安全技术", type: "scene", dayOfWeek: 4, period: "上午 2", location: "实验楼 C-301", description: "IDS配置实验", tag: "计网2301班", className: "计网2301班" },
  { id: "se15", title: "教师信息化培训", type: "training", dayOfWeek: 4, period: "下午 1", location: "报告厅", description: "AI辅助教学设计", tag: "培训" },

  // 周五
  { id: "se16", title: "批改作业", type: "todo", dayOfWeek: 5, period: "上午 1", description: "网络基础实验报告 × 42", tag: "待办" },
  { id: "se17", title: "批改作业", type: "todo", dayOfWeek: 5, period: "上午 2", description: "Linux Shell脚本作业 × 38", tag: "待办" },
  { id: "se18", title: "教学研讨", type: "meeting", dayOfWeek: 5, period: "下午 1", location: "会议室 301", description: "课程改革方案讨论", tag: "研讨" },
]

// ==================== 成绩提交 ====================

export const mockGradeSubmissions: GradeSubmitItem[] = [
  { id: "gs1", courseName: "Linux系统管理", className: "计网2402班", students: 38, status: "待提交", deadline: "2026-04-20" },
  { id: "gs2", courseName: "路由交换技术", className: "计网2401班", students: 42, status: "录入中", deadline: "2026-04-20" },
  { id: "gs3", courseName: "职业素养与沟通", className: "计网2401班", students: 42, status: "已提交" },
]

// ==================== 教学跟踪数据 ====================

export const mockSignInData = {
  total: 42,
  present: 38,
  late: 3,
  absent: 1,
  rate: 90,
}

export const mockSignInDaily = [
  { date: "周一", present: 40, late: 2, absent: 0 },
  { date: "周二", present: 38, late: 3, absent: 1 },
  { date: "周三", present: 39, late: 2, absent: 1 },
  { date: "周四", present: 37, late: 4, absent: 1 },
  { date: "周五", present: 36, late: 3, absent: 3 },
]

export const mockQuizResults = [
  { id: "iq-1", name: "随堂测验1：子网划分", avgScore: 85, passRate: 92, count: 40, maxScore: 100 },
  { id: "iq-2", name: "随堂测验2：VLAN配置", avgScore: 78, passRate: 85, count: 39, maxScore: 100 },
  { id: "iq-3", name: "随堂测验3：Shell语法", avgScore: 72, passRate: 78, count: 38, maxScore: 100 },
]

export const mockRushAnswerRanking = [
  { rank: 1, name: "李明", correctCount: 8, avgTime: "0.9s", badge: "抢答达人" },
  { rank: 2, name: "王芳", correctCount: 7, avgTime: "1.1s", badge: "积极参与" },
  { rank: 3, name: "张伟", correctCount: 6, avgTime: "1.3s", badge: "" },
  { rank: 4, name: "陈静", correctCount: 6, avgTime: "1.5s", badge: "" },
  { rank: 5, name: "孙七", correctCount: 5, avgTime: "1.0s", badge: "" },
]

export const mockClassInteraction = [
  { name: "课堂提问", active: 8, total: 10 },
  { name: "课堂测验", active: 5, total: 8 },
  { name: "小组活动", active: 4, total: 5 },
  { name: "讨论发言", active: 6, total: 8 },
  { name: "实操演示", active: 3, total: 4 },
]

export const mockAttendanceRateData = [
  { name: "第1周", rate: 95 },
  { name: "第2周", rate: 93 },
  { name: "第3周", rate: 90 },
  { name: "第4周", rate: 92 },
  { name: "第5周", rate: 88 },
  { name: "第6周", rate: 91 },
  { name: "第7周", rate: 94 },
  { name: "第8周", rate: 89 },
]

export const mockStudentDetails = [
  { name: "李明", attendance: 95, quizAvg: 88, interaction: 8, praise: 5, grade: "优秀" },
  { name: "王芳", attendance: 98, quizAvg: 91, interaction: 6, praise: 4, grade: "优秀" },
  { name: "张伟", attendance: 85, quizAvg: 72, interaction: 3, praise: 1, grade: "待提升" },
  { name: "陈静", attendance: 96, quizAvg: 85, interaction: 7, praise: 3, grade: "良好" },
  { name: "孙七", attendance: 92, quizAvg: 90, interaction: 5, praise: 4, grade: "优秀" },
  { name: "刘洋", attendance: 88, quizAvg: 78, interaction: 4, praise: 2, grade: "良好" },
  { name: "周涛", attendance: 80, quizAvg: 68, interaction: 2, praise: 0, grade: "待提升" },
  { name: "赵敏", attendance: 97, quizAvg: 93, interaction: 9, praise: 6, grade: "优秀" },
]

// ==================== 测评管理数据 ====================

export const mockHomeworkSubmissions = [
  { id: "hw1", name: "子网划分练习", deadline: "2026-04-12", submitRate: 95, avgScore: 88, total: 42 },
  { id: "hw2", name: "VLAN配置实验报告", deadline: "2026-04-14", submitRate: 85, avgScore: 82, total: 42 },
  { id: "hw3", name: "Shell脚本编程作业", deadline: "2026-04-16", submitRate: 72, avgScore: 76, total: 38 },
  { id: "hw4", name: "防火墙规则配置", deadline: "2026-04-18", submitRate: 60, avgScore: 0, total: 35 },
]

export const mockHomeworkTrend = [
  { week: "第5周", rate: 92 },
  { week: "第6周", rate: 88 },
  { week: "第7周", rate: 90 },
  { week: "第8周", rate: 85 },
  { week: "第9周", rate: 72 },
]

export const mockPeerReviewStats = {
  totalGroups: 8,
  avgPeerScore: 84,
  completionRate: 91,
  steps: [
    { name: "自评", weight: 30, avgScore: 88 },
    { name: "互评", weight: 40, avgScore: 82 },
    { name: "教师评价", weight: 30, avgScore: 85 },
  ],
}

export const mockTrainingReports = [
  { name: "综合实训报告1", submitted: 40, total: 42, rate: 95, avgScore: 85, rating: "良好" },
  { name: "综合实训报告2", submitted: 36, total: 42, rate: 86, avgScore: 80, rating: "良好" },
  { name: "综合实训报告3", submitted: 28, total: 38, rate: 74, avgScore: 0, rating: "待提交" },
]

// ==================== 期末总评数据 ====================

export const mockSemesterSummary = {
  totalSessions: 48,
  avgAttendance: 92,
  compositeAvgScore: 83,
  totalStudents: 42,
  dataCollectionRate: 89,
  needAttention: 5,
}

export const mockAssessmentDimensions = [
  { id: "d1", name: "视频学习", category: "课中", weight: 10, avgScore: 88, status: "已汇总", sessions: 12 },
  { id: "d2", name: "签到考勤", category: "课中", weight: 10, avgScore: 92, status: "已汇总", sessions: 12 },
  { id: "d3", name: "课堂互动", category: "课中", weight: 15, avgScore: 85, status: "已汇总", sessions: 12 },
  { id: "d4", name: "随堂测验", category: "课中", weight: 15, avgScore: 78, status: "已汇总", sessions: 6 },
  { id: "d5", name: "课后作业", category: "课后", weight: 15, avgScore: 84, status: "采集中", sessions: 4 },
  { id: "d6", name: "单元测验", category: "课后", weight: 15, avgScore: 80, status: "采集中", sessions: 3 },
  { id: "d7", name: "互评互判", category: "课后", weight: 10, avgScore: 82, status: "采集中", sessions: 2 },
  { id: "d8", name: "实训报告", category: "课后", weight: 10, avgScore: 0, status: "待采集", sessions: 1 },
]

export const mockCompositeDistribution = [
  { range: "90-100", count: 8 },
  { range: "80-89", count: 16 },
  { range: "70-79", count: 10 },
  { range: "60-69", count: 5 },
  { range: "<60", count: 3 },
]

export const mockSessionSummary = [
  { week: 5, day: "周一", topic: "子网划分", attendance: 95, quizAvg: 88, homeworkRate: 92, homeworkAvg: 86 },
  { week: 6, day: "周一", topic: "VLAN基础", attendance: 93, quizAvg: 82, homeworkRate: 88, homeworkAvg: 80 },
  { week: 7, day: "周一", topic: "VLAN间路由", attendance: 90, quizAvg: 78, homeworkRate: 85, homeworkAvg: 76 },
  { week: 8, day: "周一", topic: "STP协议", attendance: 88, quizAvg: 75, homeworkRate: 80, homeworkAvg: 72 },
]

export const mockStudentRanking = [
  { rank: 1, name: "赵敏", attendance: 98, inClassQuiz: 93, homework: 95, peerReview: 90, report: 92, total: 94, grade: "A" },
  { rank: 2, name: "王芳", attendance: 98, inClassQuiz: 91, homework: 92, peerReview: 88, report: 90, total: 92, grade: "A" },
  { rank: 3, name: "李明", attendance: 96, inClassQuiz: 88, homework: 90, peerReview: 86, report: 88, total: 90, grade: "A" },
  { rank: 4, name: "陈静", attendance: 96, inClassQuiz: 85, homework: 87, peerReview: 85, report: 85, total: 86, grade: "B" },
  { rank: 5, name: "孙七", attendance: 92, inClassQuiz: 90, homework: 82, peerReview: 80, report: 84, total: 84, grade: "B" },
  { rank: 6, name: "刘洋", attendance: 88, inClassQuiz: 78, homework: 80, peerReview: 78, report: 79, total: 80, grade: "B" },
  { rank: 7, name: "张伟", attendance: 85, inClassQuiz: 72, homework: 75, peerReview: 72, report: 74, total: 75, grade: "C" },
  { rank: 8, name: "周涛", attendance: 80, inClassQuiz: 68, homework: 70, peerReview: 65, report: 68, total: 69, grade: "D" },
]

// ==================== 学生画像数据 ====================

export const mockStudentPortraits = [
  // ===== 计算机网络技术 - 2024级 =====
  {
    id: "sp1",
    name: "李明",
    studentNo: "2024010101",
    className: "计网2401班",
    grade: "2024级",
    major: "计算机网络技术",
    overallGrade: "A",
    overallScore: 90,
    abilities: [
      { name: "专业知识", score: 82 },
      { name: "专业技能", score: 76 },
      { name: "通用能力", score: 88 },
      { name: "职业素养", score: 90 },
      { name: "行业认知", score: 70 },
    ],
    attendance: 95,
  },
  {
    id: "sp2",
    name: "王芳",
    studentNo: "2024010102",
    className: "计网2401班",
    grade: "2024级",
    major: "计算机网络技术",
    overallGrade: "A",
    overallScore: 92,
    abilities: [
      { name: "专业知识", score: 88 },
      { name: "专业技能", score: 85 },
      { name: "通用能力", score: 90 },
      { name: "职业素养", score: 92 },
      { name: "行业认知", score: 75 },
    ],
    attendance: 98,
  },
  {
    id: "sp3",
    name: "张伟",
    studentNo: "2024010103",
    className: "计网2401班",
    grade: "2024级",
    major: "计算机网络技术",
    overallGrade: "B",
    overallScore: 75,
    abilities: [
      { name: "专业知识", score: 65 },
      { name: "专业技能", score: 60 },
      { name: "通用能力", score: 72 },
      { name: "职业素养", score: 75 },
      { name: "行业认知", score: 55 },
    ],
    attendance: 85,
  },
  {
    id: "sp4",
    name: "赵敏",
    studentNo: "2024010201",
    className: "计网2402班",
    grade: "2024级",
    major: "计算机网络技术",
    overallGrade: "A",
    overallScore: 94,
    abilities: [
      { name: "专业知识", score: 90 },
      { name: "专业技能", score: 88 },
      { name: "通用能力", score: 92 },
      { name: "职业素养", score: 95 },
      { name: "行业认知", score: 80 },
    ],
    attendance: 98,
  },
  {
    id: "sp5",
    name: "刘洋",
    studentNo: "2024010202",
    className: "计网2402班",
    grade: "2024级",
    major: "计算机网络技术",
    overallGrade: "B",
    overallScore: 80,
    abilities: [
      { name: "专业知识", score: 72 },
      { name: "专业技能", score: 68 },
      { name: "通用能力", score: 78 },
      { name: "职业素养", score: 80 },
      { name: "行业认知", score: 60 },
    ],
    attendance: 88,
  },
  {
    id: "sp6",
    name: "陈静",
    studentNo: "2024010203",
    className: "计网2402班",
    grade: "2024级",
    major: "计算机网络技术",
    overallGrade: "B",
    overallScore: 83,
    abilities: [
      { name: "专业知识", score: 76 },
      { name: "专业技能", score: 78 },
      { name: "通用能力", score: 82 },
      { name: "职业素养", score: 84 },
      { name: "行业认知", score: 68 },
    ],
    attendance: 90,
  },
  // ===== 计算机网络技术 - 2023级 =====
  {
    id: "sp7",
    name: "孙七",
    studentNo: "2023010101",
    className: "计网2301班",
    grade: "2023级",
    major: "计算机网络技术",
    overallGrade: "B",
    overallScore: 82,
    abilities: [
      { name: "专业知识", score: 78 },
      { name: "专业技能", score: 80 },
      { name: "通用能力", score: 76 },
      { name: "职业素养", score: 82 },
      { name: "行业认知", score: 72 },
    ],
    attendance: 92,
  },
  {
    id: "sp8",
    name: "周涛",
    studentNo: "2023010102",
    className: "计网2301班",
    grade: "2023级",
    major: "计算机网络技术",
    overallGrade: "C",
    overallScore: 68,
    abilities: [
      { name: "专业知识", score: 62 },
      { name: "专业技能", score: 58 },
      { name: "通用能力", score: 66 },
      { name: "职业素养", score: 70 },
      { name: "行业认知", score: 50 },
    ],
    attendance: 80,
  },
  // ===== 软件技术 - 2024级 =====
  {
    id: "sp9",
    name: "吴昊",
    studentNo: "2024020101",
    className: "软件2401班",
    grade: "2024级",
    major: "软件技术",
    overallGrade: "A",
    overallScore: 91,
    abilities: [
      { name: "专业知识", score: 86 },
      { name: "专业技能", score: 88 },
      { name: "通用能力", score: 84 },
      { name: "职业素养", score: 88 },
      { name: "行业认知", score: 78 },
    ],
    attendance: 96,
  },
  {
    id: "sp10",
    name: "郑瑶",
    studentNo: "2024020102",
    className: "软件2401班",
    grade: "2024级",
    major: "软件技术",
    overallGrade: "A",
    overallScore: 88,
    abilities: [
      { name: "专业知识", score: 82 },
      { name: "专业技能", score: 84 },
      { name: "通用能力", score: 86 },
      { name: "职业素养", score: 90 },
      { name: "行业认知", score: 74 },
    ],
    attendance: 94,
  },
  {
    id: "sp11",
    name: "钱程",
    studentNo: "2024020201",
    className: "软件2402班",
    grade: "2024级",
    major: "软件技术",
    overallGrade: "B",
    overallScore: 78,
    abilities: [
      { name: "专业知识", score: 72 },
      { name: "专业技能", score: 70 },
      { name: "通用能力", score: 76 },
      { name: "职业素养", score: 80 },
      { name: "行业认知", score: 62 },
    ],
    attendance: 86,
  },
  // ===== 软件技术 - 2023级 =====
  {
    id: "sp12",
    name: "林欣",
    studentNo: "2023020101",
    className: "软件2301班",
    grade: "2023级",
    major: "软件技术",
    overallGrade: "A",
    overallScore: 87,
    abilities: [
      { name: "专业知识", score: 84 },
      { name: "专业技能", score: 82 },
      { name: "通用能力", score: 80 },
      { name: "职业素养", score: 86 },
      { name: "行业认知", score: 76 },
    ],
    attendance: 93,
  },
  // ===== 大数据技术 - 2024级 =====
  {
    id: "sp13",
    name: "唐雅",
    studentNo: "2024030101",
    className: "大数据2401班",
    grade: "2024级",
    major: "大数据技术",
    overallGrade: "A",
    overallScore: 93,
    abilities: [
      { name: "专业知识", score: 90 },
      { name: "专业技能", score: 86 },
      { name: "通用能力", score: 92 },
      { name: "职业素养", score: 94 },
      { name: "行业认知", score: 82 },
    ],
    attendance: 97,
  },
  {
    id: "sp14",
    name: "许睿",
    studentNo: "2024030102",
    className: "大数据2401班",
    grade: "2024级",
    major: "大数据技术",
    overallGrade: "B",
    overallScore: 81,
    abilities: [
      { name: "专业知识", score: 76 },
      { name: "专业技能", score: 74 },
      { name: "通用能力", score: 80 },
      { name: "职业素养", score: 82 },
      { name: "行业认知", score: 66 },
    ],
    attendance: 89,
  },
]

// ==================== 教师个人中心 ====================

export const teacherSecurityItems = [
  { label: "手机绑定", status: "bound", statusText: "138****6666", action: "更换" },
  { label: "邮箱绑定", status: "bound", statusText: "zhang@example.edu.cn", action: "更换" },
  { label: "人脸识别", status: "unbound", statusText: "未录入", action: "录入" },
]
