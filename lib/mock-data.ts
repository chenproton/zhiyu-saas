// Mock data for the hybrid architecture tenant management system

export interface PackageQuota {
  aiModel: string
  dailyTokenLimit: number
  maxStudentAccounts: number
  maxTeacherAccounts: number
}

export interface Package {
  id: string
  name: string
  code: string
  features: string[]
  quotas: PackageQuota
  price: number
  status: "active" | "inactive"
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  orgCode: string // 全局唯一机构码，系统自动生成，不可修改
  contactName: string
  contactPhone: string
  username: string
  packageId: string
  packageName: string
  domain: string
  address: string
  enterpriseCode: string // 统一社会信用代码
  description: string
  remark: string
  createdAt: string
  createdBy: "admin" | "application" // 来源：管理员手工创建 或 申请审核通过
  applicationId?: string // 如果是申请通过的，关联申请单号
  operatorName?: string // 如果是申请通过的，申请人姓名
}

export interface TenantApplication {
  id: string
  applicationNo: string // 申请单号
  orgName: string // 机构名称
  creditCode: string // 统一社会信用代码
  contactName: string
  contactPhone: string
  packageId: string
  packageName: string
  orgType: "trial" | "formal" // 试用/正式
  description: string
  attachments: string[] // 附件路径
  applicantId: string // 申请人ID
  applicantName: string // 申请人姓名
  applicationTime: string
  status: "pending" | "approved" | "rejected"
  reviewerId?: string
  reviewerName?: string
  reviewTime?: string
  rejectReason?: string
  createdTenantId?: string // 审核通过后创建的租户ID
  createdOrgCode?: string // 审核通过后生成的机构码
}

export interface ResourceTypeCode {
  id: string
  objectName: string // 系统对象名称
  code: string // 资源类型编码 (1字母+1数字)
  description: string
  updatedBy: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  tenantId: string
  tenantName: string
  packageId: string
  packageName: string
  orderType: "new" | "renewal" | "expansion" | "upgrade"
  amount: number
  paymentStatus: "pending" | "completed" | "cancelled"
  duration: string
  createdAt: string
}

export interface License {
  id: string
  serialNumber: string
  tenantId: string
  tenantName: string
  tenantOrgCode: string // 租户机构码
  orderId: string
  orderNumber: string
  machineCode: string
  startDate: string
  endDate: string
  status: "active" | "expiring" | "expired" | "revoked"
  daysUntilExpiry: number
}

// Feature configuration - hierarchical structure
export interface FeatureModule {
  id: string
  name: string
  children: { id: string; name: string }[]
}

export const featureModules: FeatureModule[] = [
  {
    id: "teacher",
    name: "教师",
    children: [
      { id: "teacher-scene-center", name: "场景应用中心" },
      { id: "teacher-hot-jobs", name: "热门岗位" },
      { id: "teacher-knowledge-graph", name: "知识图谱" },
      { id: "teacher-job-center", name: "行岗中心" },
      { id: "teacher-file-info", name: "教师获取文件信息" },
      { id: "teacher-training-review", name: "训练审核" },
      { id: "teacher-teaching-overview", name: "教学概况" },
      { id: "teacher-digital-transform", name: "数字化转型提升" },
    ],
  },
  {
    id: "student",
    name: "学生",
    children: [
      { id: "student-personal-info", name: "获取学生个人信息" },
      { id: "student-scene-list", name: "查询我的场景列表" },
      { id: "student-job-center", name: "岗位中心" },
      { id: "student-general-jobs", name: "岗位中心-通用岗位库" },
      { id: "student-digital-ability", name: "学生点亮的数智化能力" },
      { id: "student-task-pass-rate", name: "场景任务通过率" },
      { id: "student-related-scenes", name: "查询学生关联的场景" },
      { id: "student-ability-portrait", name: "能力画像-学生个人信息" },
    ],
  },
  {
    id: "system-mgmt",
    name: "系统管理",
    children: [
      { id: "sys-user-mgmt", name: "用户管理" },
      { id: "sys-role-mgmt", name: "角色管理" },
      { id: "sys-menu-mgmt", name: "菜单管理" },
      { id: "sys-dept-mgmt", name: "部门管理" },
      { id: "sys-post-mgmt", name: "岗位管理" },
      { id: "sys-dict-mgmt", name: "字典管理" },
      { id: "sys-tree-dict", name: "树形字典" },
      { id: "sys-param-config", name: "参数设置" },
    ],
  },
  {
    id: "platform-panel",
    name: "平台面板",
    children: [
      { id: "platform-teacher-workbench", name: "教师工作台" },
    ],
  },
  {
    id: "system-monitor",
    name: "系统监控",
    children: [
      { id: "monitor-online-users", name: "在线用户" },
      { id: "monitor-cache", name: "缓存监控" },
      { id: "monitor-admin", name: "Admin监控" },
      { id: "monitor-task-schedule", name: "任务调度" },
    ],
  },
  {
    id: "system-tools",
    name: "系统工具",
    children: [
      { id: "tools-send-msg", name: "发送消息" },
      { id: "tools-receive-msg", name: "接受消息" },
      { id: "tools-code-gen", name: "代码生成" },
    ],
  },
  {
    id: "test-menu",
    name: "测试菜单",
    children: [
      { id: "test-single-table", name: "测试单表" },
      { id: "test-tree-table", name: "测试树表" },
    ],
  },
  {
    id: "edu-admin",
    name: "教务管理",
    children: [
      { id: "edu-faculty-info", name: "院系信息" },
      { id: "edu-major-info", name: "专业信息" },
      { id: "edu-class-info", name: "班级信息" },
      { id: "edu-staff-info", name: "员工信息" },
      { id: "edu-student-info", name: "学生信息" },
      { id: "edu-code-rules", name: "编码规则" },
      { id: "edu-guide-config", name: "指南配置" },
      { id: "edu-teaching-plan", name: "教学计划" },
    ],
  },
  {
    id: "teaching-resource",
    name: "教学资源建设",
    children: [
      { id: "resource-course-mgmt", name: "课程资源管理" },
      { id: "resource-course-config", name: "课程设置1" },
      { id: "resource-learning-path", name: "学习路径搭建" },
      { id: "resource-course-res", name: "课程资源" },
      { id: "resource-course-mgmt2", name: "课程管理" },
      { id: "resource-knowledge-graph", name: "知识图谱" },
      { id: "resource-knowledge-points", name: "知识点" },
      { id: "resource-teaching-scene", name: "教学场景" },
    ],
  },
  {
    id: "teaching-mgmt",
    name: "教学管理",
    children: [
      { id: "teach-graph-mgmt", name: "图谱管理" },
      { id: "teach-class-data", name: "随堂数据" },
      { id: "teach-my-class", name: "我的班级" },
      { id: "teach-learning-path", name: "学习路径" },
      { id: "teach-task-eval", name: "任务评价" },
      { id: "teach-study-analysis", name: "学情分析" },
      { id: "teach-tags", name: "教学标签" },
    ],
  },
  {
    id: "job-enterprise",
    name: "岗位与企业服务",
    children: [
      { id: "job-partners", name: "合作企业" },
      { id: "job-industry-category", name: "行业类目" },
      { id: "job-standards", name: "岗位标准" },
      { id: "job-ability-model", name: "能力模型" },
      { id: "job-enterprise-jobs", name: "企业岗位" },
      { id: "job-abilities", name: "岗位能力" },
      { id: "job-intentions", name: "就业意向" },
      { id: "job-order-class", name: "订单班培养" },
    ],
  },
]

// AI Models available for packages
export const aiModels = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "claude-3-opus", name: "Claude 3 Opus" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
  { id: "deepseek-v3", name: "DeepSeek V3" },
  { id: "qwen-max", name: "通义千问 Max" },
  { id: "glm-4", name: "智谱 GLM-4" },
  { id: "ernie-4", name: "文心一言 4.0" },
]

// 生成机构码: ORG-XXXXXX (6位随机字母数字)
export function generateOrgCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "ORG-"
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 生成资源类型编码: 1字母+1数字
export function generateResourceTypeCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  return letters.charAt(Math.floor(Math.random() * letters.length)) + 
         numbers.charAt(Math.floor(Math.random() * numbers.length))
}

export const packages: Package[] = [
  {
    id: "pkg-001",
    name: "基础版",
    code: "BASIC-2024",
    features: ["sys-user-mgmt", "sys-role-mgmt", "sys-menu-mgmt", "edu-student-info", "edu-class-info", "student-personal-info", "student-scene-list"],
    quotas: { aiModel: "gpt-4o-mini", dailyTokenLimit: 10000, maxStudentAccounts: 100, maxTeacherAccounts: 10 },
    price: 9800,
    status: "active",
    updatedAt: "2024-03-15",
  },
  {
    id: "pkg-002",
    name: "高级版",
    code: "PRO-2024",
    features: ["sys-user-mgmt", "sys-role-mgmt", "sys-menu-mgmt", "sys-dept-mgmt", "sys-post-mgmt", "edu-student-info", "edu-class-info", "edu-faculty-info", "edu-major-info", "student-personal-info", "student-scene-list", "student-job-center", "teacher-scene-center", "teacher-teaching-overview", "teach-my-class", "teach-learning-path"],
    quotas: { aiModel: "gpt-4o", dailyTokenLimit: 50000, maxStudentAccounts: 500, maxTeacherAccounts: 50 },
    price: 29800,
    status: "active",
    updatedAt: "2024-03-10",
  },
  {
    id: "pkg-003",
    name: "全能旗舰版",
    code: "ENTERPRISE-2024",
    features: ["sys-user-mgmt", "sys-role-mgmt", "sys-menu-mgmt", "sys-dept-mgmt", "sys-post-mgmt", "sys-dict-mgmt", "sys-tree-dict", "sys-param-config", "platform-teacher-workbench", "monitor-online-users", "monitor-cache", "edu-faculty-info", "edu-major-info", "edu-class-info", "edu-staff-info", "edu-student-info", "edu-code-rules", "edu-guide-config", "edu-teaching-plan", "resource-course-mgmt", "resource-learning-path", "resource-knowledge-graph", "resource-teaching-scene", "teach-graph-mgmt", "teach-class-data", "teach-my-class", "teach-learning-path", "teach-task-eval", "teach-study-analysis", "teach-tags", "teacher-scene-center", "teacher-hot-jobs", "teacher-knowledge-graph", "teacher-job-center", "teacher-training-review", "teacher-teaching-overview", "teacher-digital-transform", "student-personal-info", "student-scene-list", "student-job-center", "student-general-jobs", "student-digital-ability", "student-task-pass-rate", "student-related-scenes", "student-ability-portrait", "job-partners", "job-industry-category", "job-standards", "job-ability-model", "job-enterprise-jobs"],
    quotas: { aiModel: "claude-3-opus", dailyTokenLimit: 200000, maxStudentAccounts: 2000, maxTeacherAccounts: 200 },
    price: 98000,
    status: "active",
    updatedAt: "2024-03-01",
  },
  {
    id: "pkg-004",
    name: "试用版",
    code: "TRIAL-2024",
    features: ["sys-user-mgmt", "sys-role-mgmt", "edu-student-info", "student-personal-info"],
    quotas: { aiModel: "gpt-4o-mini", dailyTokenLimit: 1000, maxStudentAccounts: 20, maxTeacherAccounts: 5 },
    price: 0,
    status: "active",
    updatedAt: "2024-02-20",
  },
  {
    id: "pkg-005",
    name: "定制版",
    code: "CUSTOM-2024",
    features: [],
    quotas: { aiModel: "claude-3-opus", dailyTokenLimit: 999999, maxStudentAccounts: 9999, maxTeacherAccounts: 999 },
    price: 298000,
    status: "inactive",
    updatedAt: "2024-01-15",
  },
]

export const tenants: Tenant[] = [
  {
    id: "tenant-001",
    name: "北京智慧科技有限公司",
    orgCode: "ORG-BJ2401",
    contactName: "张明",
    contactPhone: "138****1234",
    username: "admin_zhihui",
    packageId: "pkg-002",
    packageName: "高级版",
    domain: "zhihuitech.example.com",
    address: "北京市海淀区中关村大街1号",
    enterpriseCode: "91110108MA01ABCD1X",
    description: "专注于智慧教育解决方案的科技公司",
    remark: "重点客户，需要定期回访",
    createdAt: "2024-01-10",
    createdBy: "admin",
  },
  {
    id: "tenant-002",
    name: "上海数字创新集团",
    orgCode: "ORG-SH2402",
    contactName: "李华",
    contactPhone: "139****5678",
    username: "admin_digital",
    packageId: "pkg-003",
    packageName: "全能旗舰版",
    domain: "digitalinno.example.com",
    address: "上海市浦东新区张江高科技园区",
    enterpriseCode: "91310115MA1K2345AB",
    description: "大型教育集团，覆盖多个校区",
    remark: "",
    createdAt: "2024-02-15",
    createdBy: "application",
    applicationId: "APP-2024021001",
    operatorName: "运营专员王某",
  },
  {
    id: "tenant-003",
    name: "深圳前沿技术有限公司",
    orgCode: "ORG-SZ2403",
    contactName: "王芳",
    contactPhone: "137****9012",
    username: "admin_qianyan",
    packageId: "pkg-004",
    packageName: "试用版",
    domain: "qianyan.example.com",
    address: "深圳市南山区科技园",
    enterpriseCode: "91440300MA5E6789CD",
    description: "新兴职业教育培训机构",
    remark: "试用期内，关注转化",
    createdAt: "2024-03-20",
    createdBy: "admin",
  },
  {
    id: "tenant-004",
    name: "杭州云端网络科技",
    orgCode: "ORG-HZ2404",
    contactName: "陈伟",
    contactPhone: "136****3456",
    username: "admin_yunduan",
    packageId: "pkg-002",
    packageName: "高级版",
    domain: "yunduan.example.com",
    address: "杭州市滨江区网商路699号",
    enterpriseCode: "91330106MA2B3456EF",
    description: "在线教育平台提供商",
    remark: "即将到期，需要续约跟进",
    createdAt: "2023-11-05",
    createdBy: "application",
    applicationId: "APP-2023110101",
    operatorName: "运营专员李某",
  },
  {
    id: "tenant-005",
    name: "广州智联信息技术",
    orgCode: "ORG-GZ2405",
    contactName: "刘洋",
    contactPhone: "135****7890",
    username: "admin_zhilian",
    packageId: "pkg-001",
    packageName: "基础版",
    domain: "zhilian-tech.example.com",
    address: "广州市天河区天河路385号",
    enterpriseCode: "91440106MA5C7890GH",
    description: "中小型培训机构",
    remark: "已暂停服务，欠费未缴",
    createdAt: "2023-08-22",
    createdBy: "admin",
  },
  {
    id: "tenant-006",
    name: "成都天府软件园区",
    orgCode: "ORG-CD2406",
    contactName: "赵静",
    contactPhone: "158****2345",
    username: "admin_tianfu",
    packageId: "pkg-001",
    packageName: "基础版",
    domain: "tianfupark.example.com",
    address: "成都市高新区天府大道1700号",
    enterpriseCode: "91510107MA6D2345IJ",
    description: "职业技术培训中心",
    remark: "",
    createdAt: "2024-01-28",
    createdBy: "admin",
  },
  {
    id: "tenant-007",
    name: "武汉光谷科技发展",
    orgCode: "ORG-WH2407",
    contactName: "孙磊",
    contactPhone: "159****6789",
    username: "admin_guanggu",
    packageId: "pkg-002",
    packageName: "高级版",
    domain: "guanggu-dev.example.com",
    address: "武汉市东湖高新区光谷大道",
    enterpriseCode: "91420114MA4E5678KL",
    description: "高校合作项目",
    remark: "已流失客户",
    createdAt: "2022-06-15",
    createdBy: "admin",
  },
  {
    id: "tenant-008",
    name: "南京紫金山实验室",
    orgCode: "ORG-NJ2408",
    contactName: "周敏",
    contactPhone: "151****0123",
    username: "admin_zijinshan",
    packageId: "pkg-004",
    packageName: "试用版",
    domain: "zijinshan-lab.example.com",
    address: "南京市玄武区紫金山路",
    enterpriseCode: "91320105MA1F9012MN",
    description: "科研教育机构",
    remark: "试用中，有升级意向",
    createdAt: "2024-03-25",
    createdBy: "application",
    applicationId: "APP-2024032001",
    operatorName: "运营专员张某",
  },
]

// 租户申请数据
export const tenantApplications: TenantApplication[] = [
  {
    id: "app-001",
    applicationNo: "APP-2024040101",
    orgName: "西安交大教育科技有限公司",
    creditCode: "91610104MA7B1234AB",
    contactName: "马强",
    contactPhone: "189****5678",
    packageId: "pkg-002",
    packageName: "高级版",
    orgType: "formal",
    description: "西安交通大学合作项目，计划部署职业教育平台",
    attachments: ["营业执照.pdf", "合作协议.pdf"],
    applicantId: "op-001",
    applicantName: "运营专员刘某",
    applicationTime: "2024-04-01 09:30:00",
    status: "pending",
  },
  {
    id: "app-002",
    applicationNo: "APP-2024040102",
    orgName: "郑州智慧职教中心",
    creditCode: "91410105MA9C2345CD",
    contactName: "赵丽",
    contactPhone: "177****4321",
    packageId: "pkg-004",
    packageName: "试用版",
    orgType: "trial",
    description: "地方职业技术学院，希望试用平台功能",
    attachments: ["营业执照.pdf"],
    applicantId: "op-002",
    applicantName: "运营专员王某",
    applicationTime: "2024-04-01 14:20:00",
    status: "pending",
  },
  {
    id: "app-003",
    applicationNo: "APP-2024032001",
    orgName: "南京紫金山实验室",
    creditCode: "91320105MA1F9012MN",
    contactName: "周敏",
    contactPhone: "151****0123",
    packageId: "pkg-004",
    packageName: "试用版",
    orgType: "trial",
    description: "科研教育机构，测试AI教学功能",
    attachments: ["营业执照.pdf", "科研资质证明.pdf"],
    applicantId: "op-001",
    applicantName: "运营专员张某",
    applicationTime: "2024-03-20 10:00:00",
    status: "approved",
    reviewerId: "admin-001",
    reviewerName: "管理员",
    reviewTime: "2024-03-20 15:30:00",
    createdTenantId: "tenant-008",
    createdOrgCode: "ORG-NJ2408",
  },
  {
    id: "app-004",
    applicationNo: "APP-2024031501",
    orgName: "长沙星城培训学校",
    creditCode: "91430104MA8D3456EF",
    contactName: "黄涛",
    contactPhone: "186****7890",
    packageId: "pkg-001",
    packageName: "基础版",
    orgType: "formal",
    description: "中小型培训学校，预算有限",
    attachments: ["营业执照.pdf"],
    applicantId: "op-002",
    applicantName: "运营专员王某",
    applicationTime: "2024-03-15 11:00:00",
    status: "rejected",
    reviewerId: "admin-001",
    reviewerName: "管理员",
    reviewTime: "2024-03-16 09:00:00",
    rejectReason: "企业资质材料不完整，请补充办学许可证",
  },
]

// 资源类型编码配置
export const resourceTypeCodes: ResourceTypeCode[] = [
  { id: "rtc-001", objectName: "岗位", code: "A1", description: "岗位类型资源标识", updatedBy: "管理员", updatedAt: "2024-03-01" },
  { id: "rtc-002", objectName: "场景", code: "B2", description: "教学场景资源标识", updatedBy: "管理员", updatedAt: "2024-03-01" },
  { id: "rtc-003", objectName: "课程", code: "C3", description: "课程类型资源标识", updatedBy: "管理员", updatedAt: "2024-03-01" },
  { id: "rtc-004", objectName: "能力", code: "D4", description: "能力模型资源标识", updatedBy: "管理员", updatedAt: "2024-03-01" },
  { id: "rtc-005", objectName: "任务", code: "E5", description: "学习任务资源标识", updatedBy: "管理员", updatedAt: "2024-03-01" },
  { id: "rtc-006", objectName: "知识点", code: "F6", description: "知识点资源标识", updatedBy: "管理员", updatedAt: "2024-03-01" },
  { id: "rtc-007", objectName: "题目", code: "G7", description: "题库题目资源标识", updatedBy: "管理员", updatedAt: "2024-03-05" },
  { id: "rtc-008", objectName: "教材", code: "H8", description: "教材资源标识", updatedBy: "管理员", updatedAt: "2024-03-05" },
]

export const orders: Order[] = [
  {
    id: "order-001",
    orderNumber: "ORD-2024031501",
    tenantId: "tenant-001",
    tenantName: "北京智慧科技有限公司",
    packageId: "pkg-002",
    packageName: "高级版",
    orderType: "new",
    amount: 29800,
    paymentStatus: "completed",
    duration: "1年",
    createdAt: "2024-03-15",
  },
  {
    id: "order-002",
    orderNumber: "ORD-2024031502",
    tenantId: "tenant-002",
    tenantName: "上海数字创新集团",
    packageId: "pkg-003",
    packageName: "全能旗舰版",
    orderType: "upgrade",
    amount: 98000,
    paymentStatus: "completed",
    duration: "3年",
    createdAt: "2024-03-15",
  },
  {
    id: "order-003",
    orderNumber: "ORD-2024031801",
    tenantId: "tenant-004",
    tenantName: "杭州云端网络科技",
    packageId: "pkg-002",
    packageName: "高级版",
    orderType: "renewal",
    amount: 29800,
    paymentStatus: "pending",
    duration: "1年",
    createdAt: "2024-03-18",
  },
  {
    id: "order-004",
    orderNumber: "ORD-2024032001",
    tenantId: "tenant-003",
    tenantName: "深圳前沿技术有限公司",
    packageId: "pkg-004",
    packageName: "试用版",
    orderType: "new",
    amount: 0,
    paymentStatus: "completed",
    duration: "30天",
    createdAt: "2024-03-20",
  },
  {
    id: "order-005",
    orderNumber: "ORD-2024032201",
    tenantId: "tenant-006",
    tenantName: "成都天府软件园区",
    packageId: "pkg-001",
    packageName: "基础版",
    orderType: "expansion",
    amount: 4900,
    paymentStatus: "completed",
    duration: "6个月",
    createdAt: "2024-03-22",
  },
  {
    id: "order-006",
    orderNumber: "ORD-2024032501",
    tenantId: "tenant-008",
    tenantName: "南京紫金山实验室",
    packageId: "pkg-004",
    packageName: "试用版",
    orderType: "new",
    amount: 0,
    paymentStatus: "completed",
    duration: "30天",
    createdAt: "2024-03-25",
  },
  {
    id: "order-007",
    orderNumber: "ORD-2024032801",
    tenantId: "tenant-001",
    tenantName: "北京智慧科技有限公司",
    packageId: "pkg-003",
    packageName: "全能旗舰版",
    orderType: "upgrade",
    amount: 68200,
    paymentStatus: "pending",
    duration: "1年",
    createdAt: "2024-03-28",
  },
]

export const licenses: License[] = [
  {
    id: "lic-001",
    serialNumber: "ABCD-1234-EFGH-5678",
    tenantId: "tenant-001",
    tenantName: "北京智慧科技有限公司",
    tenantOrgCode: "ORG-BJ2401",
    orderId: "order-001",
    orderNumber: "ORD-2024031501",
    machineCode: "8C:85:90:A1:B2:C3",
    startDate: "2024-03-15",
    endDate: "2025-03-15",
    status: "active",
    daysUntilExpiry: 350,
  },
  {
    id: "lic-002",
    serialNumber: "IJKL-5678-MNOP-9012",
    tenantId: "tenant-002",
    tenantName: "上海数字创新集团",
    tenantOrgCode: "ORG-SH2402",
    orderId: "order-002",
    orderNumber: "ORD-2024031502",
    machineCode: "00:1A:2B:3C:4D:5E",
    startDate: "2024-03-15",
    endDate: "2027-03-15",
    status: "active",
    daysUntilExpiry: 1095,
  },
  {
    id: "lic-003",
    serialNumber: "QRST-9012-UVWX-3456",
    tenantId: "tenant-004",
    tenantName: "杭州云端网络科技",
    tenantOrgCode: "ORG-HZ2404",
    orderId: "order-003",
    orderNumber: "ORD-2024031801",
    machineCode: "F0:E1:D2:C3:B4:A5",
    startDate: "2023-04-01",
    endDate: "2024-04-01",
    status: "expiring",
    daysUntilExpiry: 15,
  },
  {
    id: "lic-004",
    serialNumber: "YZAB-3456-CDEF-7890",
    tenantId: "tenant-006",
    tenantName: "成都天府软件园区",
    tenantOrgCode: "ORG-CD2406",
    orderId: "order-005",
    orderNumber: "ORD-2024032201",
    machineCode: "96:87:78:69:5A:4B",
    startDate: "2024-03-22",
    endDate: "2024-09-22",
    status: "active",
    daysUntilExpiry: 180,
  },
  {
    id: "lic-005",
    serialNumber: "GHIJ-7890-KLMN-1234",
    tenantId: "tenant-005",
    tenantName: "广州智联信息技术",
    tenantOrgCode: "ORG-GZ2405",
    orderId: "order-old-001",
    orderNumber: "ORD-2023082201",
    machineCode: "3C:2D:1E:0F:A0:B1",
    startDate: "2023-08-22",
    endDate: "2024-02-22",
    status: "expired",
    daysUntilExpiry: -35,
  },
  {
    id: "lic-006",
    serialNumber: "OPQR-1234-STUV-5678",
    tenantId: "tenant-007",
    tenantName: "武汉光谷科技发展",
    tenantOrgCode: "ORG-WH2407",
    orderId: "order-old-002",
    orderNumber: "ORD-2022061501",
    machineCode: "C2:D3:E4:F5:06:17",
    startDate: "2022-06-15",
    endDate: "2023-06-15",
    status: "revoked",
    daysUntilExpiry: -280,
  },
  {
    id: "lic-007",
    serialNumber: "WXYZ-5678-ABCD-9012",
    tenantId: "tenant-003",
    tenantName: "深圳前沿技术有限公司",
    tenantOrgCode: "ORG-SZ2403",
    orderId: "order-004",
    orderNumber: "ORD-2024032001",
    machineCode: "28:39:4A:5B:6C:7D",
    startDate: "2024-03-20",
    endDate: "2024-04-19",
    status: "expiring",
    daysUntilExpiry: 22,
  },
  {
    id: "lic-008",
    serialNumber: "EFGH-9012-IJKL-3456",
    tenantId: "tenant-008",
    tenantName: "南京紫金山实验室",
    tenantOrgCode: "ORG-NJ2408",
    orderId: "order-006",
    orderNumber: "ORD-2024032501",
    machineCode: "8E:9F:A0:B1:C2:D3",
    startDate: "2024-03-25",
    endDate: "2024-04-24",
    status: "expiring",
    daysUntilExpiry: 27,
  },
]

// Helper function to get feature name by id
export function getFeatureName(featureId: string): string {
  for (const module of featureModules) {
    const found = module.children.find(c => c.id === featureId)
    if (found) return found.name
  }
  return featureId
}

// Helper function to get package by id
export function getPackageById(packageId: string): Package | undefined {
  return packages.find(p => p.id === packageId)
}

// Helper function to get tenant by id
export function getTenantById(tenantId: string): Tenant | undefined {
  return tenants.find(t => t.id === tenantId)
}

// Dashboard statistics
export const dashboardStats = {
  totalTenants: 8,
  activeTenants: 4,
  trialTenants: 2,
  totalRevenue: 230700,
  monthlyRevenue: 98000,
  expiringLicenses: 3,
  pendingOrders: 2,
  pendingApplications: 2,
}
