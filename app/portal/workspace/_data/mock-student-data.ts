// 学生工作台 Mock 数据
// 所有数据均为演示用途，不与真实后端对接

export interface StudentInfo {
  id: string
  name: string
  avatar: string
  major: string
  grade: string
  className: string
  studentNo: string
  credits: number
  totalCredits: number
  gpa: string
}

export interface Announcement {
  id: string
  title: string
  date: string
  type: "重要" | "通知" | "公告"
  isNew: boolean
}

export interface TodoItem {
  id: string
  title: string
  type: "course" | "scene" | "exam" | "report"
  count: number
  urgent: boolean
  color: string
  deadline?: string
}

export interface CalendarEvent {
  id: string
  title: string
  time: string
  date: number
  color: string
  type: "course" | "scene" | "exam"
}

export interface Course {
  id: string
  name: string
  code: string
  type: "公共基础课" | "专业基础课" | "专业核心课" | "素质拓展课"
  teacher: string
  credit: number
  hours: number
  progress: number
  cover: string
  status: "进行中" | "未开始" | "已完成"
  nextTask?: string
  nextDeadline?: string
}

export interface SceneTask {
  id: string
  sceneName: string
  taskName: string
  position: string
  abilityTags: string[]
  status: "未开始" | "进行中" | "待提交" | "已批改" | "已完成"
  deadline: string
  score?: number
  totalScore: number
  difficulty: "简单" | "中等" | "困难"
}

export interface Position {
  id: string
  name: string
  industry: string
  company: string
  salary: string
  location: string
  abilityCount: number
  matchScore: number
  tags: string[]
  description: string
  isFavorite: boolean
}

export interface Exam {
  id: string
  name: string
  type: "随堂测" | "单元测试" | "在线测评" | "岗位能力认定"
  status: "待考" | "进行中" | "已完成"
  startTime: string
  endTime: string
  duration: number
  score?: number
  totalScore: number
}

export interface AbilityDimension {
  name: string
  score: number
  fullScore: number
}

export interface AbilityGap {
  ability: string
  current: number
  required: number
  gap: number
}

export interface ArchiveItem {
  id: string
  title: string
  type: "award" | "certificate" | "project" | "practice" | "competition"
  date: string
  level: string
  description: string
  issuer?: string
}

export interface Topic {
  id: string
  title: string
  author: string
  avatar: string
  replies: number
  views: number
  lastReply: string
  tag: string
  isHot: boolean
}

export const mockStudentInfo: StudentInfo = {
  id: "stu_001",
  name: "李明",
  avatar: "李",
  major: "计算机网络技术",
  grade: "2024级",
  className: "计网2401班",
  studentNo: "2024010101",
  credits: 86,
  totalCredits: 120,
  gpa: "3.72",
}

export const mockAnnouncements: Announcement[] = [
  { id: "a1", title: "期中考试安排通知", date: "2026-04-10", type: "重要", isNew: true },
  { id: "a2", title: "网络工程师岗位能力认定报名启动", date: "2026-04-09", type: "通知", isNew: true },
  { id: "a3", title: "本周新增3个企业实践场景", date: "2026-04-08", type: "公告", isNew: true },
  { id: "a4", title: "奖学金评选通知", date: "2026-04-05", type: "重要", isNew: false },
  { id: "a5", title: "图书馆延长开放时间通知", date: "2026-04-03", type: "通知", isNew: false },
]

export const mockTodos: TodoItem[] = [
  { id: "t1", title: "待完成作业", type: "course", count: 5, urgent: true, color: "#ef4444", deadline: "2026-04-15" },
  { id: "t2", title: "待学习课程", type: "course", count: 3, urgent: false, color: "#3b82f6" },
  { id: "t3", title: "待考测评", type: "exam", count: 2, urgent: true, color: "#f59e0b", deadline: "2026-04-16" },
  { id: "t4", title: "待提交场景报告", type: "scene", count: 1, urgent: false, color: "#10b981", deadline: "2026-04-18" },
]

export const mockCalendarEvents: CalendarEvent[] = [
  { id: "e1", title: "网络基础", time: "08:00", date: 14, color: "bg-blue-500", type: "course" },
  { id: "e2", title: "Linux系统管理", time: "10:00", date: 14, color: "bg-amber-500", type: "course" },
  { id: "e3", title: "网络故障排查场景", time: "14:00", date: 15, color: "bg-emerald-500", type: "scene" },
  { id: "e4", title: "路由交换技术", time: "08:00", date: 16, color: "bg-blue-500", type: "course" },
  { id: "e5", title: "岗位能力认定考试", time: "14:00", date: 17, color: "bg-purple-500", type: "exam" },
  { id: "e6", title: "网络安全实训", time: "09:00", date: 18, color: "bg-emerald-500", type: "scene" },
]

export const mockCourses: Course[] = [
  {
    id: "c1",
    name: "网络基础",
    code: "NET101",
    type: "专业基础课",
    teacher: "王教授",
    credit: 4,
    hours: 64,
    progress: 78,
    cover: "蓝",
    status: "进行中",
    nextTask: "第5章 子网划分作业",
    nextDeadline: "2026-04-15",
  },
  {
    id: "c2",
    name: "路由交换技术",
    code: "NET201",
    type: "专业核心课",
    teacher: "李老师",
    credit: 5,
    hours: 80,
    progress: 45,
    cover: "绿",
    status: "进行中",
    nextTask: "实验三 VLAN配置",
    nextDeadline: "2026-04-17",
  },
  {
    id: "c3",
    name: "Linux系统管理",
    code: "LIN101",
    type: "专业基础课",
    teacher: "张老师",
    credit: 3,
    hours: 48,
    progress: 62,
    cover: "橙",
    status: "进行中",
    nextTask: "Shell脚本练习",
    nextDeadline: "2026-04-16",
  },
  {
    id: "c4",
    name: "职业素养与沟通",
    code: "GEN101",
    type: "公共基础课",
    teacher: "陈老师",
    credit: 2,
    hours: 32,
    progress: 90,
    cover: "紫",
    status: "进行中",
    nextTask: "期末小组汇报",
    nextDeadline: "2026-04-20",
  },
  {
    id: "c5",
    name: "云计算技术",
    code: "CLD301",
    type: "专业核心课",
    teacher: "赵老师",
    credit: 4,
    hours: 64,
    progress: 0,
    cover: "青",
    status: "未开始",
  },
]

export const mockSceneTasks: SceneTask[] = [
  {
    id: "s1",
    sceneName: "企业网络故障排查",
    taskName: "诊断并修复办公网断网问题",
    position: "网络运维工程师",
    abilityTags: ["网络故障诊断", "交换机配置", "沟通能力"],
    status: "进行中",
    deadline: "2026-04-18",
    totalScore: 100,
    difficulty: "中等",
  },
  {
    id: "s2",
    sceneName: "数据中心服务器部署",
    taskName: "完成服务器上架与基础配置",
    position: "系统运维工程师",
    abilityTags: ["Linux操作", "服务器硬件", "文档撰写"],
    status: "待提交",
    deadline: "2026-04-16",
    totalScore: 100,
    difficulty: "困难",
  },
  {
    id: "s3",
    sceneName: "校园网安全防护",
    taskName: "配置防火墙规则抵御攻击",
    position: "网络安全工程师",
    abilityTags: ["防火墙配置", "安全策略", "风险分析"],
    status: "已完成",
    deadline: "2026-04-10",
    score: 88,
    totalScore: 100,
    difficulty: "困难",
  },
  {
    id: "s4",
    sceneName: "客户网络需求沟通",
    taskName: "整理客户需求并输出方案",
    position: "售前网络工程师",
    abilityTags: ["需求分析", "方案撰写", "沟通表达"],
    status: "未开始",
    deadline: "2026-04-22",
    totalScore: 100,
    difficulty: "简单",
  },
]

export const mockPositions: Position[] = [
  {
    id: "p1",
    name: "网络运维工程师",
    industry: "信息技术",
    company: "华为技术有限公司",
    salary: "8-12K",
    location: "深圳",
    abilityCount: 12,
    matchScore: 82,
    tags: ["五险一金", "带薪年假", "技术成长"],
    description: "负责企业网络日常运维、故障排查、性能优化等工作。",
    isFavorite: true,
  },
  {
    id: "p2",
    name: "系统运维工程师",
    industry: "互联网",
    company: "腾讯云",
    salary: "10-15K",
    location: "广州",
    abilityCount: 15,
    matchScore: 76,
    tags: ["弹性工作", "股票期权", "大厂背景"],
    description: "负责服务器集群运维、自动化部署、监控告警等工作。",
    isFavorite: false,
  },
  {
    id: "p3",
    name: "网络安全工程师",
    industry: "信息安全",
    company: "奇安信",
    salary: "9-14K",
    location: "北京",
    abilityCount: 14,
    matchScore: 68,
    tags: ["专业培训", "项目奖金", "晋升通道"],
    description: "负责安全设备配置、漏洞扫描、安全事件响应等工作。",
    isFavorite: false,
  },
  {
    id: "p4",
    name: "售前网络工程师",
    industry: "ICT",
    company: "新华三",
    salary: "8-13K",
    location: "杭州",
    abilityCount: 10,
    matchScore: 71,
    tags: ["客户对接", "方案设计", "出差补贴"],
    description: "负责客户需求沟通、网络方案设计与产品宣讲等工作。",
    isFavorite: true,
  },
]

export const mockExams: Exam[] = [
  {
    id: "ex1",
    name: "网络基础单元测试",
    type: "单元测试",
    status: "待考",
    startTime: "2026-04-16 10:00",
    endTime: "2026-04-16 11:30",
    duration: 90,
    totalScore: 100,
  },
  {
    id: "ex2",
    name: "Linux系统管理随堂测",
    type: "随堂测",
    status: "进行中",
    startTime: "2026-04-14 14:00",
    endTime: "2026-04-14 15:00",
    duration: 60,
    totalScore: 100,
  },
  {
    id: "ex3",
    name: "网络运维工程师岗位能力认定",
    type: "岗位能力认定",
    status: "待考",
    startTime: "2026-04-17 14:00",
    endTime: "2026-04-17 16:00",
    duration: 120,
    totalScore: 100,
  },
  {
    id: "ex4",
    name: "路由交换技术期中测评",
    type: "在线测评",
    status: "已完成",
    startTime: "2026-04-10 09:00",
    endTime: "2026-04-10 11:00",
    duration: 120,
    score: 85,
    totalScore: 100,
  },
]

export const mockAbilityDimensions: AbilityDimension[] = [
  { name: "专业知识", score: 82, fullScore: 100 },
  { name: "专业技能", score: 76, fullScore: 100 },
  { name: "通用能力", score: 88, fullScore: 100 },
  { name: "职业素养", score: 90, fullScore: 100 },
  { name: "行业认知", score: 70, fullScore: 100 },
]

export const mockAbilityGaps: AbilityGap[] = [
  { ability: "网络故障诊断", current: 78, required: 85, gap: 7 },
  { ability: "Linux Shell脚本", current: 65, required: 80, gap: 15 },
  { ability: "防火墙策略配置", current: 72, required: 80, gap: 8 },
  { ability: "客户沟通表达", current: 85, required: 80, gap: 0 },
  { ability: "网络方案设计", current: 60, required: 75, gap: 15 },
]

export const mockWeeklyActivity = [
  { day: "周一", value: 45 },
  { day: "周二", value: 62 },
  { day: "周三", value: 38 },
  { day: "周四", value: 75 },
  { day: "周五", value: 58 },
  { day: "周六", value: 30 },
  { day: "周日", value: 20 },
]

export const mockMonthlyTrend = [
  { month: "1月", completed: 12, score: 78 },
  { month: "2月", completed: 18, score: 82 },
  { month: "3月", completed: 25, score: 80 },
  { month: "4月", completed: 16, score: 85 },
]

export const mockArchiveItems: ArchiveItem[] = [
  {
    id: "ar1",
    title: "2025年校级网络技能大赛一等奖",
    type: "award",
    date: "2025-11-15",
    level: "校级",
    description: "在网络拓扑设计与故障排查赛项中获得一等奖",
    issuer: "学校教务处",
  },
  {
    id: "ar2",
    title: "华为HCIA-Datacom认证",
    type: "certificate",
    date: "2025-12-20",
    level: "行业认证",
    description: "通过华为数据通信工程师认证",
    issuer: "华为技术有限公司",
  },
  {
    id: "ar3",
    title: "校园网络优化项目",
    type: "project",
    date: "2025-09-10",
    level: "课程项目",
    description: "参与校园宿舍区网络优化方案设计与实施",
    issuer: "网络基础课程组",
  },
  {
    id: "ar4",
    title: "企业网络运维暑期实践",
    type: "practice",
    date: "2025-07-25",
    level: "企业实践",
    description: "在某科技公司完成为期一个月的网络运维实习",
    issuer: "XX科技有限公司",
  },
  {
    id: "ar5",
    title: "全国职业院校技能大赛省赛二等奖",
    type: "competition",
    date: "2026-03-20",
    level: "省级",
    description: "参加计算机网络应用赛项获得二等奖",
    issuer: "省教育厅",
  },
]

export const mockTopics: Topic[] = [
  {
    id: "tp1",
    title: "子网划分总是算错，求大神指点",
    author: "张同学",
    avatar: "张",
    replies: 12,
    views: 156,
    lastReply: "10分钟前",
    tag: "网络基础",
    isHot: true,
  },
  {
    id: "tp2",
    title: "VLAN间路由配置经验分享",
    author: "王同学",
    avatar: "王",
    replies: 8,
    views: 98,
    lastReply: "30分钟前",
    tag: "路由交换",
    isHot: false,
  },
  {
    id: "tp3",
    title: "网络运维工程师面试会问哪些问题？",
    author: "刘同学",
    avatar: "刘",
    replies: 23,
    views: 342,
    lastReply: "1小时前",
    tag: "岗位咨询",
    isHot: true,
  },
  {
    id: "tp4",
    title: "Linux常用命令速查表整理",
    author: "陈同学",
    avatar: "陈",
    replies: 15,
    views: 210,
    lastReply: "2小时前",
    tag: "Linux",
    isHot: false,
  },
]

export const mockCertifications = [
  { id: "cert1", name: "网络运维工程师 · B级", date: "2026-04-10", status: "已获得" },
  { id: "cert2", name: "Linux系统管理员 · A级", date: "-", status: "认定中" },
  { id: "cert3", name: "网络安全工程师 · C级", date: "-", status: "待认定" },
]

export const mockLearningPath = [
  { id: "l1", title: "补齐网络故障诊断能力", resources: "企业网络故障排查场景 + 路由交换技术第4章", duration: "3天" },
  { id: "l2", title: "提升Linux Shell脚本能力", resources: "Linux系统管理实验5-8", duration: "5天" },
  { id: "l3", title: "强化网络方案设计能力", resources: "售前网络工程师场景", duration: "4天" },
]


// ==================== 学生课程表数据（参考 zhiyu-registrar 数据结构）====================

export const allPeriods = [
  "早自习 1",
  "上午 1",
  "上午 2",
  "上午 3",
  "上午 4",
  "下午 1",
  "下午 2",
  "下午 3",
  "下午 4",
  "晚自习 1",
] as const

export type ScheduleEventType = "course" | "scene" | "exam" | "todo"

export interface ScheduleEvent {
  id: string
  title: string
  type: ScheduleEventType
  dayOfWeek: number // 1 = 周一，7 = 周日
  period: string
  teacher?: string
  location?: string
  description?: string
  tag?: string
  status?: string
}

export const mockScheduleEvents: ScheduleEvent[] = [
  // 周一
  { id: "se1", title: "网络基础", type: "course", dayOfWeek: 1, period: "上午 1", teacher: "王教授", location: "教学楼 A301", description: "第5章 子网划分", tag: "专业基础" },
  { id: "se2", title: "网络基础", type: "course", dayOfWeek: 1, period: "上午 2", teacher: "王教授", location: "教学楼 A301", description: "第5章 子网划分作业待交", tag: "专业基础" },
  { id: "se3", title: "Linux系统管理", type: "course", dayOfWeek: 1, period: "下午 1", teacher: "张老师", location: "实验楼 B205", description: "Shell脚本练习", tag: "专业基础" },
  { id: "se4", title: "Linux系统管理", type: "course", dayOfWeek: 1, period: "下午 2", teacher: "张老师", location: "实验楼 B205", description: "Shell脚本练习", tag: "专业基础" },

  // 周二
  { id: "se5", title: "路由交换技术", type: "course", dayOfWeek: 2, period: "上午 1", teacher: "李老师", location: "实训中心 C102", description: "VLAN配置实验", tag: "专业核心" },
  { id: "se6", title: "路由交换技术", type: "course", dayOfWeek: 2, period: "上午 2", teacher: "李老师", location: "实训中心 C102", description: "VLAN配置实验", tag: "专业核心" },
  { id: "se7", title: "Linux随堂测", type: "exam", dayOfWeek: 2, period: "下午 1", teacher: "张老师", location: "机房 D401", description: "60分钟 · 在线测评", tag: "随堂测" },
  { id: "se8", title: "职业素养与沟通", type: "course", dayOfWeek: 2, period: "下午 3", teacher: "陈老师", location: "教学楼 A201", description: "小组汇报准备", tag: "公共基础" },

  // 周三
  { id: "se9", title: "企业网络故障排查", type: "scene", dayOfWeek: 3, period: "上午 1", teacher: "企业导师 · 华为", location: "场景工坊 E01", description: "诊断并修复办公网断网问题", tag: "岗位场景" },
  { id: "se10", title: "企业网络故障排查", type: "scene", dayOfWeek: 3, period: "上午 2", teacher: "企业导师 · 华为", location: "场景工坊 E01", description: "诊断并修复办公网断网问题", tag: "岗位场景" },
  { id: "se11", title: "网络基础", type: "course", dayOfWeek: 3, period: "下午 1", teacher: "王教授", location: "教学楼 A301", description: "课后作业讲解", tag: "专业基础" },
  { id: "se12", title: "网络基础", type: "course", dayOfWeek: 3, period: "下午 2", teacher: "王教授", location: "教学楼 A301", description: "课后作业讲解", tag: "专业基础" },

  // 周四
  { id: "se13", title: "云计算技术", type: "course", dayOfWeek: 4, period: "上午 1", teacher: "赵老师", location: "云计算实验室 F301", description: "Docker基础", tag: "专业核心" },
  { id: "se14", title: "云计算技术", type: "course", dayOfWeek: 4, period: "上午 2", teacher: "赵老师", location: "云计算实验室 F301", description: "Docker基础", tag: "专业核心" },
  { id: "se15", title: "数据中心服务器部署", type: "scene", dayOfWeek: 4, period: "下午 1", teacher: "企业导师 · 腾讯", location: "场景工坊 E02", description: "服务器上架与基础配置", tag: "岗位场景" },
  { id: "se16", title: "数据中心服务器部署", type: "scene", dayOfWeek: 4, period: "下午 2", teacher: "企业导师 · 腾讯", location: "场景工坊 E02", description: "服务器上架与基础配置", tag: "岗位场景" },

  // 周五
  { id: "se17", title: "路由交换技术", type: "course", dayOfWeek: 5, period: "上午 1", teacher: "李老师", location: "实训中心 C102", description: "实验三 VLAN配置", tag: "专业核心" },
  { id: "se18", title: "网络运维能力认定", type: "exam", dayOfWeek: 5, period: "下午 1", teacher: "考评组", location: "认证中心 G101", description: "120分钟 · 岗位能力认定", tag: "能力认定" },
  { id: "se19", title: "客户网络需求沟通", type: "scene", dayOfWeek: 5, period: "下午 3", teacher: "企业导师 · 新华三", location: "场景工坊 E03", description: "整理客户需求并输出方案", tag: "岗位场景" },

  // 周六
  { id: "se20", title: "自主学习", type: "todo", dayOfWeek: 6, period: "上午 1", description: "补齐网络故障诊断能力", tag: "待办" },
  { id: "se21", title: "自主学习", type: "todo", dayOfWeek: 6, period: "上午 2", description: "Linux Shell脚本练习", tag: "待办" },

  // 周日
  { id: "se22", title: "复习周计划", type: "todo", dayOfWeek: 7, period: "上午 1", description: "整理本周学习笔记", tag: "待办" },
]

export const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

// ==================== 成绩查看 Mock 数据 ====================

export interface GradeRecord {
  courseId: string
  courseName: string
  teacher: string
  usual: number
  midterm: number
  final: number
  practice: number
  total: number
  status: "已发布" | "录入中" | "已暂存" | "待发布"
}

export interface GradeTrendItem {
  name: string
  usual: number
  midterm: number
  final: number
  total: number
}

export interface CompareItem {
  name: string
  self: number
  avg: number
}

export const mockGradeRecords: GradeRecord[] = [
  {
    courseId: "c1",
    courseName: "网络基础",
    teacher: "王教授",
    usual: 88,
    midterm: 82,
    final: 85,
    practice: 90,
    total: 0,
    status: "已发布",
  },
  {
    courseId: "c2",
    courseName: "路由交换技术",
    teacher: "李老师",
    usual: 76,
    midterm: 72,
    final: 70,
    practice: 80,
    total: 0,
    status: "录入中",
  },
  {
    courseId: "c3",
    courseName: "Linux系统管理",
    teacher: "张老师",
    usual: 92,
    midterm: 88,
    final: 90,
    practice: 85,
    total: 0,
    status: "已发布",
  },
  {
    courseId: "c4",
    courseName: "职业素养与沟通",
    teacher: "陈老师",
    usual: 95,
    midterm: 90,
    final: 92,
    practice: 88,
    total: 0,
    status: "已发布",
  },
]

mockGradeRecords.forEach((g) => {
  g.total = Math.round(g.usual * 0.2 + g.midterm * 0.2 + g.final * 0.5 + g.practice * 0.1)
})

export const mockGradeTrend: GradeTrendItem[] = [
  { name: "第1周", usual: 78, midterm: 0, final: 0, total: 78 },
  { name: "第4周", usual: 82, midterm: 0, final: 0, total: 82 },
  { name: "第8周", usual: 85, midterm: 76, final: 0, total: 81 },
  { name: "第12周", usual: 88, midterm: 80, final: 0, total: 84 },
  { name: "第16周", usual: 90, midterm: 82, final: 85, total: 85 },
]

export const mockCompareData: CompareItem[] = [
  { name: "平时", self: 88, avg: 82 },
  { name: "期中", self: 82, avg: 78 },
  { name: "期末", self: 85, avg: 80 },
  { name: "总评", self: 85, avg: 80 },
]

// ==================== 学习档案 Mock 数据 ====================

export interface StudyTimeItem {
  label: string
  value: number
  unit: string
}

export interface ActivityItem {
  label: string
  value: string
}

export interface EvaluationItem {
  type: "system" | "teacher"
  typeLabel: string
  content: string
  color: string
  bgColor: string
  borderColor: string
}

export const mockStudyTime: StudyTimeItem[] = [
  { label: "今日", value: 2.5, unit: "小时" },
  { label: "本周", value: 12.5, unit: "小时" },
  { label: "本月", value: 48.0, unit: "小时" },
  { label: "本学期", value: 186.0, unit: "小时" },
  { label: "累计", value: 420.0, unit: "小时" },
]

export const mockActivityItems: ActivityItem[] = [
  { label: "登录次数", value: "128 次" },
  { label: "本月登录天数", value: "18 天" },
  { label: "连续学习天数", value: "5 天" },
  { label: "课堂互动参与", value: "32 次" },
]

export const mockEvaluations: EvaluationItem[] = [
  {
    type: "system",
    typeLabel: "系统自动评价",
    content: "学习积极，能够按时完成课程任务。建议加强课后复习，深化对核心知识点的理解。",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
  },
  {
    type: "teacher",
    typeLabel: "教师人工评语",
    content: "该生在本学期表现优异，作业完成质量高，课堂参与积极。希望在项目实践中继续发挥主动性。",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-100",
  },
]

// ==================== 学生能力画像详情 Mock 数据 ====================

export interface PortraitStudentInfo {
  name: string
  avatar: string
  studentNo: string
  gender: string
  college: string
  major: string
  className: string
  grade: string
  rank: number
  totalStudents: number
  violation: string
  physicalTest: string
  partyStatus: string
}

export interface HonorItem {
  icon: string
  name: string
}

export interface PortraitAcademicSummary {
  label: string
  value: number
  unit: string
}

export interface PortraitRadarData {
  position: string
  values: number[]
}

export interface PortraitScoreOverviewItem {
  label: string
  value: string
  color: "green" | "purple" | "blue" | "amber"
}

export interface AbilityRow {
  domain: string
  rowspan: number
  abilityPoint: string
  score: number
  studentLevel: string
  studentLevelLabel: string
  requiredLevel: string
  requiredLevelLabel: string
  passed: boolean
}

export interface PortraitJobTab {
  name: string
  scoreOverview: PortraitScoreOverviewItem[]
  abilities: AbilityRow[]
}

export interface RecommendedJob {
  name: string
  match: number
  matchColor?: string
  detail: string
}

export interface CourseScoreItem {
  name: string
  score: number
  level: string
  classRank: string
  attendance: string
}

export interface GraduationDesignItem {
  title: string
  status: string
  statusColor: string
}

export const mockPortraitStudentInfo: PortraitStudentInfo = {
  name: "赵江威",
  avatar: "👨‍🎓",
  studentNo: "25301",
  gender: "男",
  college: "物流学院",
  major: "智能物流",
  className: "25301班",
  grade: "2025级",
  rank: 3,
  totalStudents: 45,
  violation: "无",
  physicalTest: "合格",
  partyStatus: "预备党员",
}

export const mockPortraitHonors: HonorItem[] = [
  { icon: "🥇", name: "国家奖学金" },
  { icon: "🏅", name: "三好学生" },
  { icon: "⭐", name: "优秀干部" },
  { icon: "🎖️", name: "竞赛一等奖" },
]

export const mockPortraitAcademicSummaries: PortraitAcademicSummary[] = [
  { label: "毕业学分", value: 54, unit: "" },
  { label: "奖学金", value: 4, unit: "" },
  { label: "主修课程", value: 12, unit: "" },
  { label: "知识点", value: 234, unit: "" },
  { label: "实践场数", value: 34, unit: "" },
  { label: "实践任务", value: 89, unit: "" },
]

export const mockPortraitRadarData: Record<string, number[]> = {
  "前端开发工程师": [70, 86, 85, 78, 82],
  "后端开发工程师": [75, 78, 80, 72, 76],
  "产品经理": [82, 65, 90, 80, 70],
  "UI设计师": [68, 72, 78, 85, 88],
}

export const mockPortraitJobTabs: Record<string, PortraitJobTab> = {
  "前端开发工程师": {
    name: "前端开发工程师",
    scoreOverview: [
      { label: "岗位能力达标率", value: "89%", color: "green" },
      { label: "岗位胜任度", value: "32%", color: "purple" },
      { label: "岗位能力认定得分", value: "87", color: "blue" },
      { label: "岗位能力认定毕业标准", value: "A+", color: "amber" },
    ],
    abilities: [
      { domain: "岗位与行业认知", rowspan: 4, abilityPoint: "前端技术发展趋势", score: 78, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "岗位职责与工作流程", score: 82, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "行业规范与标准", score: 68, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "用户体验设计原则", score: 75, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 4, abilityPoint: "HTML5/CSS3 核心技术", score: 88, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 0, abilityPoint: "JavaScript/TypeScript 编程", score: 79, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 0, abilityPoint: "React/Vue 框架应用", score: 86, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 0, abilityPoint: "前端性能优化", score: 64, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "软技能", rowspan: 4, abilityPoint: "团队协作与沟通", score: 85, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "掌握", requiredLevelLabel: "L4", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "技术文档撰写", score: 72, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "问题分析与解决", score: 80, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "持续学习能力", score: 90, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 3, abilityPoint: "完整项目开发经历", score: 82, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 0, abilityPoint: "需求评审与拆解", score: 76, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 0, abilityPoint: "版本控制与协作", score: 88, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "工具应用", rowspan: 3, abilityPoint: "VS Code 开发工具", score: 92, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "掌握", requiredLevelLabel: "L4", passed: true },
      { domain: "工具应用", rowspan: 0, abilityPoint: "Git 版本管理", score: 85, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "工具应用", rowspan: 0, abilityPoint: "Chrome DevTools 调试", score: 78, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
    ],
  },
  "后端开发工程师": {
    name: "后端开发工程师",
    scoreOverview: [
      { label: "岗位能力达标率", value: "78%", color: "green" },
      { label: "岗位胜任度", value: "18%", color: "purple" },
      { label: "岗位能力认定得分", value: "76", color: "blue" },
      { label: "岗位能力认定毕业标准", value: "B+", color: "amber" },
    ],
    abilities: [
      { domain: "岗位与行业认知", rowspan: 4, abilityPoint: "后端架构发展趋势", score: 72, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "分布式系统原理", score: 62, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "岗位职责认知", score: 78, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "云原生技术认知", score: 58, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "专业技能", rowspan: 4, abilityPoint: "Java/Go 语言开发", score: 85, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 0, abilityPoint: "数据库设计与优化", score: 80, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 0, abilityPoint: "微服务架构设计", score: 64, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "专业技能", rowspan: 0, abilityPoint: "API 接口开发", score: 88, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 4, abilityPoint: "系统分析与设计", score: 82, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "掌握", requiredLevelLabel: "L4", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "接口文档编写", score: 76, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "跨团队协作", score: 70, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "代码审查能力", score: 74, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 3, abilityPoint: "高并发项目经验", score: 66, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "项目经验", rowspan: 0, abilityPoint: "系统架构设计", score: 72, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 0, abilityPoint: "性能调优实践", score: 78, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "工具应用", rowspan: 3, abilityPoint: "Docker 容器化", score: 80, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "工具应用", rowspan: 0, abilityPoint: "Linux 系统运维", score: 75, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "工具应用", rowspan: 0, abilityPoint: "监控与日志工具", score: 60, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
    ],
  },
  "产品经理": {
    name: "产品经理",
    scoreOverview: [
      { label: "岗位能力达标率", value: "83%", color: "green" },
      { label: "岗位胜任度", value: "45%", color: "purple" },
      { label: "岗位能力认定得分", value: "82", color: "blue" },
      { label: "岗位能力认定毕业标准", value: "A", color: "amber" },
    ],
    abilities: [
      { domain: "岗位与行业认知", rowspan: 4, abilityPoint: "互联网产品趋势", score: 90, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "竞品分析方法", score: 82, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "产品经理职责认知", score: 88, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "商业模式理解", score: 65, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "专业技能", rowspan: 4, abilityPoint: "需求分析与挖掘", score: 92, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 0, abilityPoint: "原型设计与交互", score: 62, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "专业技能", rowspan: 0, abilityPoint: "数据分析与决策", score: 80, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 0, abilityPoint: "产品规划与路线图", score: 85, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 4, abilityPoint: "跨部门沟通协调", score: 92, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "用户访谈与调研", score: 78, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "项目推进与管理", score: 75, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "演讲与汇报能力", score: 88, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 3, abilityPoint: "0-1 产品落地经验", score: 82, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 0, abilityPoint: "产品迭代优化", score: 86, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 0, abilityPoint: "上线运营配合", score: 68, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "工具应用", rowspan: 3, abilityPoint: "Axure/Figma 原型", score: 80, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "工具应用", rowspan: 0, abilityPoint: "数据分析平台", score: 76, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "工具应用", rowspan: 0, abilityPoint: "项目管理工具", score: 85, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
    ],
  },
  "UI设计师": {
    name: "UI设计师",
    scoreOverview: [
      { label: "岗位能力达标率", value: "83%", color: "green" },
      { label: "岗位胜任度", value: "28%", color: "purple" },
      { label: "岗位能力认定得分", value: "80", color: "blue" },
      { label: "岗位能力认定毕业标准", value: "A", color: "amber" },
    ],
    abilities: [
      { domain: "岗位与行业认知", rowspan: 4, abilityPoint: "设计趋势洞察", score: 88, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "UI/UX 设计规范", score: 85, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "设计师职责认知", score: 80, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "岗位与行业认知", rowspan: 0, abilityPoint: "设计系统思维", score: 65, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "专业技能", rowspan: 4, abilityPoint: "Figma/Sketch 设计", score: 90, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 0, abilityPoint: "视觉设计规范", score: 88, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "专业技能", rowspan: 0, abilityPoint: "交互设计原理", score: 62, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "专业技能", rowspan: 0, abilityPoint: "设计交付与标注", score: 86, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 4, abilityPoint: "审美与创意表达", score: 92, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "设计提案表达", score: 78, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "用户同理心", score: 85, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "软技能", rowspan: 0, abilityPoint: "设计反馈处理", score: 72, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 3, abilityPoint: "完整设计项目", score: 84, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 0, abilityPoint: "设计评审经验", score: 76, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "项目经验", rowspan: 0, abilityPoint: "设计走查配合", score: 80, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "工具应用", rowspan: 3, abilityPoint: "Figma 高级功能", score: 88, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
      { domain: "工具应用", rowspan: 0, abilityPoint: "动效设计工具", score: 66, studentLevel: "掌握", studentLevelLabel: "L4", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: false },
      { domain: "工具应用", rowspan: 0, abilityPoint: "素材管理平台", score: 82, studentLevel: "熟练", studentLevelLabel: "L5", requiredLevel: "熟练", requiredLevelLabel: "L5", passed: true },
    ],
  },
}

export const mockPortraitRecommendedJobs: RecommendedJob[] = [
  { name: "物流工程师", match: 70, detail: "优秀 · 适合智能物流方向核心岗位" },
  { name: "供应链分析师", match: 65, matchColor: "#8b5cf6", detail: "良好 · 数据分析能力突出" },
]

export const mockPortraitRecommendedCompanies = [
  {
    name: "顺丰科技",
    match: 88,
    matchColor: "#10b981",
    positions: ["物流工程师", "供应链分析师"],
  },
  {
    name: "京东物流",
    match: 82,
    matchColor: "#f59e0b",
    positions: ["仓储管理师", "运输调度专员"],
  },
  {
    name: "菜鸟网络",
    match: 76,
    matchColor: "#3b82f6",
    positions: ["数据分析师", "物流工程师"],
  },
]

export const mockPortraitCourseScores: CourseScoreItem[] = [
  { name: "物流系统工程", score: 93, level: "优秀", classRank: "3/45", attendance: "98%" },
  { name: "供应链管理", score: 91, level: "优秀", classRank: "5/45", attendance: "98%" },
  { name: "运输与配送", score: 95, level: "优秀", classRank: "1/45", attendance: "98%" },
  { name: "仓储管理", score: 90, level: "优秀", classRank: "6/45", attendance: "98%" },
  { name: "数据分析", score: 93, level: "优秀", classRank: "2/45", attendance: "98%" },
]

export const mockPortraitGraduationDesigns: GraduationDesignItem[] = [
  { title: "基于物联网的智能仓储管理系统设计", status: "已通过", statusColor: "#dcfce7" },
  { title: "供应链风险预警模型构建与实现", status: "评审中", statusColor: "#fef3c7" },
]
