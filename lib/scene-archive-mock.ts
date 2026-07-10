export interface SceneArchiveTreeNode {
  id: string
  label: string
  level: "college" | "major" | "grade"
  children?: SceneArchiveTreeNode[]
}

export interface SceneArchiveEntry {
  id: string
  name: string
  code: string
  version: string
  positionName: string
  batchName: string
  creatorName: string
  publishTime: string
  taskCount: number
  status: "draft" | "pending" | "approved" | "rejected" | "published"
  college: string
  major: string
  grade: string
  semester: string
  studentCount: number
  archivedAt: string
}

export const sceneArchiveTree: SceneArchiveTreeNode[] = [
  {
    id: "s-college-1",
    label: "信息工程学院",
    level: "college",
    children: [
      {
        id: "s-major-1-1",
        label: "信息技术",
        level: "major",
        children: [
          { id: "s-grade-1-1-1", label: "2026级", level: "grade" },
          { id: "s-grade-1-1-2", label: "2025级", level: "grade" },
        ],
      },
    ],
  },
  {
    id: "s-college-2",
    label: "商学院",
    level: "college",
    children: [
      {
        id: "s-major-2-1",
        label: "电子商务",
        level: "major",
        children: [
          { id: "s-grade-2-1-1", label: "2026级", level: "grade" },
          { id: "s-grade-2-1-2", label: "2025级", level: "grade" },
        ],
      },
      {
        id: "s-major-2-2",
        label: "市场营销",
        level: "major",
        children: [
          { id: "s-grade-2-2-1", label: "2026级", level: "grade" },
        ],
      },
    ],
  },
  {
    id: "s-college-3",
    label: "财经学院",
    level: "college",
    children: [
      {
        id: "s-major-3-1",
        label: "财务管理",
        level: "major",
        children: [
          { id: "s-grade-3-1-1", label: "2026级", level: "grade" },
        ],
      },
    ],
  },
]

export const sceneArchiveEntries: SceneArchiveEntry[] = [
  {
    id: "s-archive-1",
    name: "企业级前端项目开发实战",
    code: "SC-2026-0001",
    version: "v2.1",
    positionName: "前端开发工程师",
    batchName: "2026春季前端开发场景建设",
    creatorName: "张老师",
    publishTime: "2024-03-15 10:30:00",
    taskCount: 4,
    status: "published",
    college: "信息工程学院",
    major: "信息技术",
    grade: "2026级",
    semester: "2026-2027-1",
    studentCount: 48,
    archivedAt: "2026-09-15",
  },
  {
    id: "s-archive-2",
    name: "电商平台运营全流程",
    code: "SC-2026-0002",
    version: "v1.8",
    positionName: "电商运营专员",
    batchName: "2026春季电商实训场景开发",
    creatorName: "李老师",
    publishTime: "2024-05-20 14:00:00",
    taskCount: 5,
    status: "published",
    college: "商学院",
    major: "电子商务",
    grade: "2026级",
    semester: "2026-2027-1",
    studentCount: 42,
    archivedAt: "2026-09-16",
  },
  {
    id: "s-archive-3",
    name: "数据可视化分析实战",
    code: "SC-2026-0003",
    version: "v2.0",
    positionName: "数据分析师",
    batchName: "2026春季前端开发场景建设",
    creatorName: "王老师",
    publishTime: "2024-06-10 09:00:00",
    taskCount: 3,
    status: "published",
    college: "信息工程学院",
    major: "信息技术",
    grade: "2026级",
    semester: "2026-2027-1",
    studentCount: 36,
    archivedAt: "2026-09-15",
  },
  {
    id: "s-archive-4",
    name: "网络营销方案策划",
    code: "SC-2026-0004",
    version: "v1.5",
    positionName: "网络营销师",
    batchName: "2026春季电商实训场景开发",
    creatorName: "赵老师",
    publishTime: "2024-07-01 11:00:00",
    taskCount: 4,
    status: "published",
    college: "商学院",
    major: "电子商务",
    grade: "2026级",
    semester: "2026-2027-1",
    studentCount: 40,
    archivedAt: "2026-09-16",
  },
  {
    id: "s-archive-5",
    name: "后端API服务开发实战",
    code: "SC-2026-0005",
    version: "v2.2",
    positionName: "后端开发工程师",
    batchName: "2026春季前端开发场景建设",
    creatorName: "刘老师",
    publishTime: "2024-08-15 16:00:00",
    taskCount: 5,
    status: "published",
    college: "信息工程学院",
    major: "信息技术",
    grade: "2026级",
    semester: "2026-2027-1",
    studentCount: 38,
    archivedAt: "2026-09-15",
  },
  {
    id: "s-archive-6",
    name: "财务报表分析场景",
    code: "SC-2026-0006",
    version: "v1.3",
    positionName: "财务分析师",
    batchName: "2026春季财务实训场景",
    creatorName: "陈老师",
    publishTime: "2024-09-01 10:00:00",
    taskCount: 4,
    status: "published",
    college: "财经学院",
    major: "财务管理",
    grade: "2026级",
    semester: "2026-2027-1",
    studentCount: 32,
    archivedAt: "2026-09-17",
  },
  {
    id: "s-archive-7",
    name: "市场调研与品牌策划",
    code: "SC-2026-0007",
    version: "v1.6",
    positionName: "品牌经理",
    batchName: "2026春季营销实训场景",
    creatorName: "孙老师",
    publishTime: "2024-09-10 14:30:00",
    taskCount: 3,
    status: "published",
    college: "商学院",
    major: "市场营销",
    grade: "2026级",
    semester: "2026-2027-1",
    studentCount: 28,
    archivedAt: "2026-09-18",
  },
  {
    id: "s-archive-8",
    name: "全栈项目开发综合实训",
    code: "SC-2026-0008",
    version: "v2.0",
    positionName: "全栈开发工程师",
    batchName: "2026春季前端开发场景建设",
    creatorName: "周老师",
    publishTime: "2024-10-05 08:00:00",
    taskCount: 6,
    status: "published",
    college: "信息工程学院",
    major: "信息技术",
    grade: "2026级",
    semester: "2026-2027-1",
    studentCount: 35,
    archivedAt: "2026-09-15",
  },
  {
    id: "s-archive-9",
    name: "电商平台运营全流程",
    code: "SC-2025-0002",
    version: "v1.5",
    positionName: "电商运营专员",
    batchName: "2025春季电商实训场景",
    creatorName: "李老师",
    publishTime: "2023-12-20 10:00:00",
    taskCount: 4,
    status: "published",
    college: "商学院",
    major: "电子商务",
    grade: "2025级",
    semester: "2025-2026-1",
    studentCount: 45,
    archivedAt: "2025-09-12",
  },
  {
    id: "s-archive-10",
    name: "企业级前端项目开发实战",
    code: "SC-2025-0001",
    version: "v1.8",
    positionName: "前端开发工程师",
    batchName: "2025春季前端开发场景建设",
    creatorName: "张老师",
    publishTime: "2023-09-15 09:00:00",
    taskCount: 4,
    status: "published",
    college: "信息工程学院",
    major: "信息技术",
    grade: "2025级",
    semester: "2025-2026-1",
    studentCount: 50,
    archivedAt: "2025-09-10",
  },
]

export function filterSceneArchiveEntries(
  college: string | null,
  major: string | null,
  grade: string | null,
  search: string,
) {
  return sceneArchiveEntries.filter((entry) => {
    if (college && entry.college !== college) return false
    if (major && entry.major !== major) return false
    if (grade && entry.grade !== grade) return false
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      return (
        entry.name.toLowerCase().includes(kw) ||
        entry.code.toLowerCase().includes(kw) ||
        entry.positionName.toLowerCase().includes(kw)
      )
    }
    return true
  })
}
