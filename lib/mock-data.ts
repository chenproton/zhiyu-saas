// Mock data for the teaching resource sharing marketplace

// ==================== Enums & Constants ====================

export const RESOURCE_CATEGORIES = [
  { id: "post", name: "岗位包", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: "scene", name: "场景包", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { id: "course", name: "课程包", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "assessment", name: "测评包", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "material", name: "素材包", color: "bg-rose-100 text-rose-700 border-rose-200" },
] as const

export const MAJOR_TAGS = [
  "信息安全",
  "计算机网络",
  "软件技术",
  "大数据技术",
  "人工智能",
  "物联网",
  "云计算",
  "数字媒体",
  "电子商务",
  "智能制造",
]

export const INDUSTRY_TAGS = [
  "网络安全",
  "软件开发",
  "云计算服务",
  "数据分析",
  "智能硬件",
  "互联网运营",
  "金融科技",
  "教育培训",
]

export const EDUCATION_LEVELS = ["中职", "高职", "本科"] as const

export const DIFFICULTY_LEVELS = ["初级", "中级", "高级"] as const

export type ResourceCategoryId = (typeof RESOURCE_CATEGORIES)[number]["id"]
export type EducationLevel = (typeof EDUCATION_LEVELS)[number]
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number]

export type InstitutionType = "school" | "enterprise"
export type InstitutionStatus = "pending" | "approved" | "disabled"
export type ResourceStatus = "draft" | "reviewing" | "rejected" | "pending_publish" | "published" | "offlined"
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded"
export type WithdrawalStatus = "pending" | "approved" | "paid" | "rejected"

// ==================== Types ====================

export interface Institution {
  id: string
  type: InstitutionType
  name: string
  creditCode: string
  logo?: string
  intro: string
  contactName: string
  contactPhone: string
  contactEmail: string
  qualificationFile?: string
  expertiseTags: string[]
  status: InstitutionStatus
  orgCode: string
  balance: number // 可提现余额（对企业/创作者）
  totalSpent: number // 累计消费（对学校）
  totalIncome: number // 累计收益
  createdAt: string
  updatedAt: string
}

export interface ResourceTag {
  id: string
  resourceId: string
  tagType: "major" | "industry" | "level" | "difficulty"
  tagValue: string
}

export interface Resource {
  id: string
  institutionId: string
  name: string
  intro: string
  category: ResourceCategoryId
  coverImage?: string
  attachment?: string
  attachmentName?: string
  price: number
  version: string
  status: ResourceStatus
  rejectReason?: string
  salesCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNo: string
  buyerId: string
  sellerId: string
  resourceId: string
  price: number
  platformFee: number
  sellerIncome: number
  status: OrderStatus
  paidAt?: string
  createdAt: string
}

export interface Authorization {
  id: string
  orderId: string
  buyerId: string
  resourceId: string
  authCode: string
  status: 1 | 2 // 1=有效
  createdAt: string
}

export interface Withdrawal {
  id: string
  institutionId: string
  amount: number
  accountType: "bank" | "alipay"
  accountInfo: string
  status: WithdrawalStatus
  handledAt?: string
  createdAt: string
}

export interface Banner {
  id: string
  title: string
  image: string
  link?: string
  sort: number
  enabled: boolean
}

export interface PlatformConfig {
  platformFeeRate: number // 0.15 = 15%
  minWithdrawalAmount: number
}

// ==================== Helper Functions ====================

export function generateOrgCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "ORG-"
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function generateOrderNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const random = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${date}-${random}`
}

export function generateAuthCode(): string {
  const segments = 4
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "AUTH-"
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < 4; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (i < segments - 1) code += "-"
  }
  return code
}

export function getCategoryName(categoryId: string): string {
  return RESOURCE_CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId
}

export function getCategoryColor(categoryId: string): string {
  return RESOURCE_CATEGORIES.find((c) => c.id === categoryId)?.color || "bg-secondary"
}

export function getInstitutionById(id: string): Institution | undefined {
  return institutions.find((i) => i.id === id)
}

export function getResourceById(id: string): Resource | undefined {
  return resources.find((r) => r.id === id)
}

export function getResourceTags(resourceId: string): ResourceTag[] {
  return resourceTags.filter((t) => t.resourceId === resourceId)
}

export function isResourcePurchased(buyerId: string, resourceId: string): boolean {
  return authorizations.some((a) => a.buyerId === buyerId && a.resourceId === resourceId)
}

export function getResourceOrders(resourceId: string): Order[] {
  return orders.filter((o) => o.resourceId === resourceId && o.status === "paid")
}

// ==================== Mock Data: Institutions ====================

export const institutions: Institution[] = [
  {
    id: "inst-001",
    type: "enterprise",
    name: "网络安全科技股份有限公司",
    creditCode: "91110108MA01ABCD1X",
    logo: "/placeholder-logo.png",
    intro: "专注于网络安全人才培养与教学资源开发的高新技术企业。",
    contactName: "张明",
    contactPhone: "138****1234",
    contactEmail: "zhangming@cybersec.com",
    qualificationFile: "营业执照.pdf",
    expertiseTags: ["信息安全", "网络安全"],
    status: "approved",
    orgCode: "ORG-ENT001",
    balance: 12850.0,
    totalSpent: 0,
    totalIncome: 23500.0,
    createdAt: "2024-01-10",
    updatedAt: "2024-03-15",
  },
  {
    id: "inst-002",
    type: "school",
    name: "北京信息职业技术学院",
    creditCode: "12110000400999999X",
    logo: "/placeholder-logo.png",
    intro: "北京市示范性高等职业院校，重点建设信息技术类专业群。",
    contactName: "李华",
    contactPhone: "139****5678",
    contactEmail: "lihua@bitc.edu.cn",
    qualificationFile: "办学许可证.pdf",
    expertiseTags: ["计算机网络", "软件技术"],
    status: "approved",
    orgCode: "ORG-SCH001",
    balance: 0,
    totalSpent: 15800.0,
    totalIncome: 0,
    createdAt: "2024-02-15",
    updatedAt: "2024-03-20",
  },
  {
    id: "inst-003",
    type: "enterprise",
    name: "云智教育科技（深圳）有限公司",
    creditCode: "91440300MA5E6789CD",
    logo: "/placeholder-logo.png",
    intro: "聚焦云计算与大数据领域的职业教育内容服务商。",
    contactName: "王芳",
    contactPhone: "137****9012",
    contactEmail: "wangfang@yunzhi.com",
    qualificationFile: "营业执照.pdf",
    expertiseTags: ["云计算", "大数据技术"],
    status: "approved",
    orgCode: "ORG-ENT002",
    balance: 5200.0,
    totalSpent: 0,
    totalIncome: 9800.0,
    createdAt: "2024-03-05",
    updatedAt: "2024-03-18",
  },
  {
    id: "inst-004",
    type: "school",
    name: "上海电子信息职业技术学院",
    creditCode: "12110000400998888X",
    logo: "/placeholder-logo.png",
    intro: "上海市特色高职院校，电子信息类专业优势明显。",
    contactName: "陈伟",
    contactPhone: "136****3456",
    contactEmail: "chenwei@shie.edu.cn",
    qualificationFile: "办学许可证.pdf",
    expertiseTags: ["物联网", "人工智能"],
    status: "approved",
    orgCode: "ORG-SCH002",
    balance: 0,
    totalSpent: 7600.0,
    totalIncome: 0,
    createdAt: "2024-01-22",
    updatedAt: "2024-03-10",
  },
  {
    id: "inst-005",
    type: "school",
    name: "杭州职业技术学院",
    creditCode: "12330000470088888X",
    logo: "/placeholder-logo.png",
    intro: "浙江省示范性高职院校，数字媒体专业为省级特色专业。",
    contactName: "刘洋",
    contactPhone: "135****7890",
    contactEmail: "liuyang@hzvtc.edu.cn",
    qualificationFile: "办学许可证.pdf",
    expertiseTags: ["数字媒体", "电子商务"],
    status: "pending",
    orgCode: "ORG-SCH003",
    balance: 0,
    totalSpent: 0,
    totalIncome: 0,
    createdAt: "2024-04-01",
    updatedAt: "2024-04-01",
  },
  {
    id: "inst-006",
    type: "enterprise",
    name: "智能制造解决方案有限公司",
    creditCode: "91330106MA2B3456EF",
    logo: "/placeholder-logo.png",
    intro: "面向职业院校提供智能制造实训资源与课程服务。",
    contactName: "赵静",
    contactPhone: "158****2345",
    contactEmail: "zhaojing@imfg.com",
    qualificationFile: "营业执照.pdf",
    expertiseTags: ["智能制造", "物联网"],
    status: "approved",
    orgCode: "ORG-ENT003",
    balance: 3200.0,
    totalSpent: 0,
    totalIncome: 5600.0,
    createdAt: "2024-02-28",
    updatedAt: "2024-03-22",
  },
]

// ==================== Mock Data: Resources ====================

export const resources: Resource[] = [
  {
    id: "res-001",
    institutionId: "inst-001",
    name: "网络安全运维岗位能力包",
    intro:
      "本资源包面向高职信息安全专业，包含网络安全运维岗位能力模型、胜任标准、典型工作任务及评价量规。配套课件、实训指导书及考核题库，支持院校开展岗位导向教学。",
    category: "post",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80&auto=format&fit=crop",
    attachment: "#",
    attachmentName: "网络安全运维岗位能力包_v1.0.zip",
    price: 5800.0,
    version: "v1.0",
    status: "published",
    salesCount: 12,
    viewCount: 356,
    createdAt: "2024-02-10",
    updatedAt: "2024-03-15",
  },
  {
    id: "res-002",
    institutionId: "inst-003",
    name: "云计算平台搭建与运维课程包",
    intro:
      "涵盖 OpenStack、Docker、Kubernetes 等主流云平台的搭建与运维内容。包含完整课程大纲、PPT课件、实验手册、视频微课及期末试卷，适合高职云计算专业核心课程使用。",
    category: "course",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop",
    attachment: "#",
    attachmentName: "云计算课程包_v1.0.zip",
    price: 4200.0,
    version: "v1.0",
    status: "published",
    salesCount: 8,
    viewCount: 218,
    createdAt: "2024-02-18",
    updatedAt: "2024-03-12",
  },
  {
    id: "res-003",
    institutionId: "inst-001",
    name: "渗透测试实战场景包",
    intro:
      "基于真实企业网络安全事件改编的渗透测试实战场景，包含任务链、漏洞利用说明、防御方案及评价标准。适用于信息安全专业高年级学生综合实训。",
    category: "scene",
    coverImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80&auto=format&fit=crop",
    attachment: "#",
    attachmentName: "渗透测试场景包_v1.0.zip",
    price: 3600.0,
    version: "v1.0",
    status: "published",
    salesCount: 5,
    viewCount: 189,
    createdAt: "2024-03-01",
    updatedAt: "2024-03-18",
  },
  {
    id: "res-004",
    institutionId: "inst-006",
    name: "工业互联网安全测评包",
    intro:
      "针对工业互联网安全领域的测评资源包，包含风险评估量规、测试用例库、安全检查表及报告模板。可用于课程考核、技能竞赛训练等场景。",
    category: "assessment",
    coverImage: "https://images.unsplash.com/photo-1581092919535-7146ff1a590b?w=800&q=80&auto=format&fit=crop",
    attachment: "#",
    attachmentName: "工控安全测评包_v1.0.zip",
    price: 2800.0,
    version: "v1.0",
    status: "published",
    salesCount: 3,
    viewCount: 96,
    createdAt: "2024-03-05",
    updatedAt: "2024-03-20",
  },
  {
    id: "res-005",
    institutionId: "inst-003",
    name: "Python 数据分析素材包",
    intro:
      "包含数据分析典型案例数据集、Jupyter Notebook 源码、可视化模板及教学视频。适用于大数据技术专业课程辅助教学。",
    category: "material",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop",
    attachment: "#",
    attachmentName: "Python数据分析素材包_v1.0.zip",
    price: 1500.0,
    version: "v1.0",
    status: "published",
    salesCount: 15,
    viewCount: 412,
    createdAt: "2024-03-08",
    updatedAt: "2024-03-22",
  },
  {
    id: "res-006",
    institutionId: "inst-001",
    name: "Web 应用安全开发课程包",
    intro:
      "覆盖 OWASP Top 10、安全编码规范、代码审计方法等内容。包含课程课件、案例源码、实验环境配置指南及考核试卷。",
    category: "course",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80&auto=format&fit=crop",
    attachment: "#",
    attachmentName: "Web安全开发课程包_v1.0.zip",
    price: 4800.0,
    version: "v1.0",
    status: "reviewing",
    salesCount: 0,
    viewCount: 0,
    createdAt: "2024-03-25",
    updatedAt: "2024-03-25",
  },
  {
    id: "res-007",
    institutionId: "inst-006",
    name: "智能制造数字孪生场景包",
    intro:
      "基于数字孪生技术的智能制造实训场景，包含产线建模、虚拟调试、数据分析等任务模块及评价标准。",
    category: "scene",
    coverImage: "https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800&q=80&auto=format&fit=crop",
    attachment: "#",
    attachmentName: "数字孪生场景包_v1.0.zip",
    price: 6500.0,
    version: "v1.0",
    status: "pending_publish",
    salesCount: 0,
    viewCount: 0,
    createdAt: "2024-03-20",
    updatedAt: "2024-03-28",
  },
  {
    id: "res-008",
    institutionId: "inst-003",
    name: "人工智能基础岗位包",
    intro:
      "面向人工智能应用开发岗位的能力模型与教学资源，包含机器学习基础、深度学习入门、模型部署等内容。",
    category: "post",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80&auto=format&fit=crop",
    attachment: "#",
    attachmentName: "AI基础岗位包_v1.0.zip",
    price: 5200.0,
    version: "v1.0",
    status: "draft",
    salesCount: 0,
    viewCount: 0,
    createdAt: "2024-03-28",
    updatedAt: "2024-03-28",
  },
]

// ==================== Mock Data: Resource Tags ====================

export const resourceTags: ResourceTag[] = [
  { id: "rt-001", resourceId: "res-001", tagType: "major", tagValue: "信息安全" },
  { id: "rt-002", resourceId: "res-001", tagType: "industry", tagValue: "网络安全" },
  { id: "rt-003", resourceId: "res-001", tagType: "level", tagValue: "高职" },
  { id: "rt-004", resourceId: "res-001", tagType: "difficulty", tagValue: "中级" },

  { id: "rt-005", resourceId: "res-002", tagType: "major", tagValue: "云计算" },
  { id: "rt-006", resourceId: "res-002", tagType: "industry", tagValue: "云计算服务" },
  { id: "rt-007", resourceId: "res-002", tagType: "level", tagValue: "高职" },
  { id: "rt-008", resourceId: "res-002", tagType: "difficulty", tagValue: "中级" },

  { id: "rt-009", resourceId: "res-003", tagType: "major", tagValue: "信息安全" },
  { id: "rt-010", resourceId: "res-003", tagType: "industry", tagValue: "网络安全" },
  { id: "rt-011", resourceId: "res-003", tagType: "level", tagValue: "高职" },
  { id: "rt-012", resourceId: "res-003", tagType: "difficulty", tagValue: "高级" },

  { id: "rt-013", resourceId: "res-004", tagType: "major", tagValue: "智能制造" },
  { id: "rt-014", resourceId: "res-004", tagType: "industry", tagValue: "智能硬件" },
  { id: "rt-015", resourceId: "res-004", tagType: "level", tagValue: "高职" },
  { id: "rt-016", resourceId: "res-004", tagType: "difficulty", tagValue: "高级" },

  { id: "rt-017", resourceId: "res-005", tagType: "major", tagValue: "大数据技术" },
  { id: "rt-018", resourceId: "res-005", tagType: "industry", tagValue: "数据分析" },
  { id: "rt-019", resourceId: "res-005", tagType: "level", tagValue: "高职" },
  { id: "rt-020", resourceId: "res-005", tagType: "difficulty", tagValue: "初级" },

  { id: "rt-021", resourceId: "res-006", tagType: "major", tagValue: "信息安全" },
  { id: "rt-022", resourceId: "res-006", tagType: "industry", tagValue: "软件开发" },
  { id: "rt-023", resourceId: "res-006", tagType: "level", tagValue: "高职" },
  { id: "rt-024", resourceId: "res-006", tagType: "difficulty", tagValue: "中级" },

  { id: "rt-025", resourceId: "res-007", tagType: "major", tagValue: "智能制造" },
  { id: "rt-026", resourceId: "res-007", tagType: "industry", tagValue: "智能制造" },
  { id: "rt-027", resourceId: "res-007", tagType: "level", tagValue: "高职" },
  { id: "rt-028", resourceId: "res-007", tagType: "difficulty", tagValue: "高级" },

  { id: "rt-029", resourceId: "res-008", tagType: "major", tagValue: "人工智能" },
  { id: "rt-030", resourceId: "res-008", tagType: "industry", tagValue: "数据分析" },
  { id: "rt-031", resourceId: "res-008", tagType: "level", tagValue: "高职" },
  { id: "rt-032", resourceId: "res-008", tagType: "difficulty", tagValue: "初级" },
]

// ==================== Mock Data: Orders ====================

export const orders: Order[] = [
  {
    id: "order-001",
    orderNo: "ORD-20240315-1001",
    buyerId: "inst-002",
    sellerId: "inst-001",
    resourceId: "res-001",
    price: 5800.0,
    platformFee: 870.0,
    sellerIncome: 4930.0,
    status: "paid",
    paidAt: "2024-03-15 10:30:00",
    createdAt: "2024-03-15 10:28:00",
  },
  {
    id: "order-002",
    orderNo: "ORD-20240318-1002",
    buyerId: "inst-004",
    sellerId: "inst-001",
    resourceId: "res-001",
    price: 5800.0,
    platformFee: 870.0,
    sellerIncome: 4930.0,
    status: "paid",
    paidAt: "2024-03-18 14:20:00",
    createdAt: "2024-03-18 14:18:00",
  },
  {
    id: "order-003",
    orderNo: "ORD-20240320-1003",
    buyerId: "inst-002",
    sellerId: "inst-003",
    resourceId: "res-002",
    price: 4200.0,
    platformFee: 630.0,
    sellerIncome: 3570.0,
    status: "paid",
    paidAt: "2024-03-20 09:15:00",
    createdAt: "2024-03-20 09:12:00",
  },
  {
    id: "order-004",
    orderNo: "ORD-20240322-1004",
    buyerId: "inst-004",
    sellerId: "inst-003",
    resourceId: "res-005",
    price: 1500.0,
    platformFee: 225.0,
    sellerIncome: 1275.0,
    status: "paid",
    paidAt: "2024-03-22 16:45:00",
    createdAt: "2024-03-22 16:42:00",
  },
  {
    id: "order-005",
    orderNo: "ORD-20240325-1005",
    buyerId: "inst-002",
    sellerId: "inst-001",
    resourceId: "res-003",
    price: 3600.0,
    platformFee: 540.0,
    sellerIncome: 3060.0,
    status: "paid",
    paidAt: "2024-03-25 11:00:00",
    createdAt: "2024-03-25 10:58:00",
  },
  {
    id: "order-006",
    orderNo: "ORD-20240328-1006",
    buyerId: "inst-004",
    sellerId: "inst-006",
    resourceId: "res-004",
    price: 2800.0,
    platformFee: 420.0,
    sellerIncome: 2380.0,
    status: "paid",
    paidAt: "2024-03-28 13:30:00",
    createdAt: "2024-03-28 13:28:00",
  },
]

// ==================== Mock Data: Authorizations ====================

export const authorizations: Authorization[] = [
  {
    id: "auth-001",
    orderId: "order-001",
    buyerId: "inst-002",
    resourceId: "res-001",
    authCode: "AUTH-A3B7-C9D2-E4F1",
    status: 1,
    createdAt: "2024-03-15 10:30:00",
  },
  {
    id: "auth-002",
    orderId: "order-002",
    buyerId: "inst-004",
    resourceId: "res-001",
    authCode: "AUTH-B5C1-D7E3-F9A2",
    status: 1,
    createdAt: "2024-03-18 14:20:00",
  },
  {
    id: "auth-003",
    orderId: "order-003",
    buyerId: "inst-002",
    resourceId: "res-002",
    authCode: "AUTH-C2D8-E1F4-A6B3",
    status: 1,
    createdAt: "2024-03-20 09:15:00",
  },
  {
    id: "auth-004",
    orderId: "order-004",
    buyerId: "inst-004",
    resourceId: "res-005",
    authCode: "AUTH-D9E2-F5A1-B7C4",
    status: 1,
    createdAt: "2024-03-22 16:45:00",
  },
  {
    id: "auth-005",
    orderId: "order-005",
    buyerId: "inst-002",
    resourceId: "res-003",
    authCode: "AUTH-E4F9-A2B6-C8D1",
    status: 1,
    createdAt: "2024-03-25 11:00:00",
  },
  {
    id: "auth-006",
    orderId: "order-006",
    buyerId: "inst-004",
    resourceId: "res-004",
    authCode: "AUTH-F1A5-B9C3-D7E2",
    status: 1,
    createdAt: "2024-03-28 13:30:00",
  },
]

// ==================== Mock Data: Withdrawals ====================

export const withdrawals: Withdrawal[] = [
  {
    id: "wd-001",
    institutionId: "inst-001",
    amount: 5000.0,
    accountType: "bank",
    accountInfo: "中国工商银行 6222************8888",
    status: "paid",
    handledAt: "2024-03-10 15:00:00",
    createdAt: "2024-03-05 09:00:00",
  },
  {
    id: "wd-002",
    institutionId: "inst-003",
    amount: 3000.0,
    accountType: "alipay",
    accountInfo: "wangfang@yunzhi.com",
    status: "approved",
    handledAt: "2024-03-20 10:00:00",
    createdAt: "2024-03-18 14:00:00",
  },
  {
    id: "wd-003",
    institutionId: "inst-006",
    amount: 2000.0,
    accountType: "bank",
    accountInfo: "招商银行 6225************6666",
    status: "pending",
    createdAt: "2024-03-28 11:00:00",
  },
]

// ==================== Mock Data: Banners ====================

export const banners: Banner[] = [
  {
    id: "bn-001",
    title: "春季教学资源采购节",
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&q=80&auto=format&fit=crop",
    link: "/",
    sort: 1,
    enabled: true,
  },
  {
    id: "bn-002",
    title: "网络安全精品资源推荐",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80&auto=format&fit=crop",
    link: "/",
    sort: 2,
    enabled: true,
  },
  {
    id: "bn-003",
    title: "新入驻企业资源上线",
    image: "https://images.unsplash.com/photo-1507146815454-9faa99d579aa?w=1200&q=80&auto=format&fit=crop",
    link: "/",
    sort: 3,
    enabled: true,
  },
]

// ==================== Mock Data: Platform Config ====================

export const platformConfig: PlatformConfig = {
  platformFeeRate: 0.15,
  minWithdrawalAmount: 100,
}

// ==================== Dashboard Stats ====================

export const dashboardStats = {
  totalInstitutions: institutions.length,
  schoolCount: institutions.filter((i) => i.type === "school" && i.status === "approved").length,
  enterpriseCount: institutions.filter((i) => i.type === "enterprise" && i.status === "approved").length,
  pendingInstitutions: institutions.filter((i) => i.status === "pending").length,
  totalResources: resources.length,
  publishedResources: resources.filter((r) => r.status === "published").length,
  reviewingResources: resources.filter((r) => r.status === "reviewing").length,
  totalGMV: orders.filter((o) => o.status === "paid").reduce((sum, o) => sum + o.price, 0),
  monthlyGMV: 20900.0,
  totalOrders: orders.filter((o) => o.status === "paid").length,
  pendingWithdrawals: withdrawals.filter((w) => w.status === "pending").length,
}

// ==================== Role Management Helpers ====================

export type UserRole = "school" | "enterprise" | "operator"

export const ROLE_LABELS: Record<UserRole, string> = {
  school: "学校管理员",
  enterprise: "企业",
  operator: "平台运营方",
}

export const ROLE_INSTITUTION: Record<Exclude<UserRole, "operator">, string> = {
  school: "inst-002",
  enterprise: "inst-001",
}
