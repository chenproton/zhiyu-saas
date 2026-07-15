import type {
  Tenant,
  Organization,
  OrgType,
  IdentityType,
  Role,
  UserExtensionField,
  UserRelation,
  Graduate,
  StaffTitle,
  LoginLog,
  OperationLog,
  Major,
  Industry,
  ResourceCode,
  SubscriptionPackage,
  AppModule,
  PlatformLink,
  Workflow,
  ApprovalRecord,
} from "./types/backend"
import type {
  CareerPosition,
  PositionCertificate,
  PositionResponsibility,
  AbilityPoint,
  PositionAbilityBinding,
  AbilityDomain,
  JobBatch,
  PositionRecommendation,
  BannerConfig,
  LearnRoad,
} from "./types/job"
import type {
  Scenario,
  ScenarioTask,
  TaskDeliverable,
  TaskEvaluationConfig,
  TaskEvalPoint,
  TaskReviewStep,
  TaskResource,
  TaskResourceBinding,
  TaskKnowledgeBinding,
  TaskAbilityBinding,
  ScenarioWeightConfig,
  ScenarioGradeMapping,
  SceneArchive,
  SceneBatch,
} from "./types/scene"
import type {
  Course,
  KnowledgePoint,
  SystemCourseNode,
  NodeQuiz,
  NodeQuizQuestion,
  NodeHomework,
  HybridNodeModule,
  NodeResource,
  CourseKnowledgeBinding,
  LessonBatch,
  LessonBehaviorRecord,
  LessonBehaviorAggregate,
} from "./types/lesson"
import type {
  QuestionBank,
  Question,
  Exam,
  ExamQuestion,
  ExamUsage,
  ExamResult,
  EvaluationMethodCategory,
  EvaluationMethod,
  SceneEvaluationResult,
  JobAbilityResult,
  CertificationRule,
  CertificationAbilityItem,
  CertificationAbilityPoint,
  CertificationRelatedTask,
  StudentAbilityPortrait,
  StudentAbilityArchive,
  GraduationProjectTopic,
  GraduationProjectArchive,
  GraduationProjectEvaluation,
  GraduationQueryResult,
  MicroCertTemplate,
  CertIssuanceRecord,
  CreditConversionRule,
  AppealRecord,
  EvaluationBatch,
} from "./types/evaluation"
import type { WorkspaceDashboard } from "./types/portal"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1"

export interface ApiError {
  error: string
}

export interface UploadResponse {
  url: string
  name: string
  size: number
  mimeType: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface User {
  id: string
  tenantId?: string
  institutionId?: string
  identityTypeId?: string
  orgNodeId?: string
  majorId?: string
  role: "school" | "enterprise" | "operator"
  loginName?: string
  username: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  studentNo?: string
  workId?: string
  idCard?: string
  titleIds?: string[]
  oauth?: Record<string, any>
  status: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface MeResponse {
  user: User
  institution?: Institution
  tenant?: import("./types/backend").Tenant
  identityType?: import("./types/backend").IdentityType
  orgNode?: import("./types/backend").Organization
  major?: import("./types/backend").Major
  roles?: import("./types/backend").Role[]
}

export type InstitutionStatus = "pending" | "approved" | "disabled"

export interface Institution {
  id: string
  type: "school" | "enterprise"
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
  balance: number
  totalSpent: number
  totalIncome: number
  createdAt: string
  updatedAt: string
}

export interface ResourceTag {
  id?: string
  resourceId?: string
  tagType: "major" | "industry" | "level" | "difficulty"
  tagValue: string
}

export interface Resource {
  id: string
  institutionId: string
  name: string
  intro: string
  category: string
  coverImage?: string
  attachment?: string
  attachmentName?: string
  price: number
  version: string
  status: "draft" | "reviewing" | "rejected" | "pending_publish" | "published" | "offlined"
  rejectReason?: string
  salesCount: number
  viewCount: number
  tags?: ResourceTag[]
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
  status: "pending" | "paid" | "cancelled" | "refunded"
  paidAt?: string
  createdAt: string
}

export interface OrderDetail {
  order: Order
  buyer: Institution
  seller: Institution
  resource: Resource
  authorization?: Authorization
}

export interface Authorization {
  id: string
  orderId: string
  buyerId: string
  resourceId: string
  authCode: string
  status: number
  createdAt: string
  resourceName?: string
  sellerName?: string
}

export interface Banner {
  id: string
  title: string
  image: string
  link: string
  sort: number
  enabled: boolean
}

export interface Withdrawal {
  id: string
  institutionId: string
  amount: number
  accountType: string
  accountInfo: string
  status: "pending" | "approved" | "paid" | "rejected"
  handledAt?: string
  createdAt: string
}

export interface DashboardStats {
  totalInstitutions: number
  schoolCount: number
  enterpriseCount: number
  pendingInstitutions: number
  totalResources: number
  publishedResources: number
  reviewingResources: number
  totalGMV: number
  monthlyGMV: number
  totalOrders: number
  pendingWithdrawals: number
}

export interface PlatformConfig {
  platformFeeRate: number
  minWithdrawalAmount: number
}

export interface ListResponse<T> {
  items: T[]
  total: number
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("zhiyu-token")
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })
  const data = await res.json().catch(() => ({ error: "请求失败" }))

  if (!res.ok) {
    // 仅在确实携带了 token 时才把 401 视为会话过期：
    // 未登录状态下的请求（如登录页上各数据 Provider 的预加载）返回 401
    // 不应清 token 或跳转登录页，否则会在 /login 上形成无限重载循环。
    if (res.status === 401 && typeof window !== "undefined" && token) {
      localStorage.removeItem("zhiyu-token")
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return data as T
}

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      qs.append(key, String(value))
    }
  }
  const s = qs.toString()
  return s ? `?${s}` : ""
}

import { createCrudApi, createContentApi } from "./api-factory"

// ==================== Core APIs (unchanged) ====================

export const authApi = {
  login: (req: LoginRequest) => request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(req) }),
  me: () => request<MeResponse>("/auth/me"),
}

export const institutionApi = {
  list: (params?: { status?: string; type?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Institution>>(`/institutions${buildQuery(params || {})}`),
  get: (id: string) => request<Institution>(`/institutions/${id}`),
  create: (req: Omit<Institution, "id" | "balance" | "totalSpent" | "totalIncome" | "status" | "createdAt" | "updatedAt">) =>
    request<Institution>("/institutions", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Institution, "id" | "status" | "createdAt" | "updatedAt" | "balance" | "totalSpent" | "totalIncome">>) =>
    request<Institution>(`/institutions/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  approve: (id: string) => request<Institution>(`/institutions/${id}/approve`, { method: "POST" }),
  disable: (id: string) => request<Institution>(`/institutions/${id}/disable`, { method: "POST" }),
}

export const resourceApi = {
  list: (params?: { status?: string; category?: string; institutionId?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Resource>>(`/resources${buildQuery(params || {})}`),
  get: (id: string) => request<Resource>(`/resources/${id}`),
  create: (req: Partial<Resource>) => request<Resource>("/resources", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Resource>) => request<Resource>(`/resources/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/resources/${id}`, { method: "DELETE" }),
  submit: (id: string) => request<Resource>(`/resources/${id}/submit`, { method: "POST" }),
  review: (id: string, req: { status: "pending_publish" | "rejected"; rejectReason?: string }) =>
    request<Resource>(`/resources/${id}/review`, { method: "POST", body: JSON.stringify(req) }),
  publish: (id: string) => request<Resource>(`/resources/${id}/publish`, { method: "POST" }),
  offline: (id: string) => request<Resource>(`/resources/${id}/offline`, { method: "POST" }),
  incrementView: (id: string) => request<{ id: string }>(`/resources/${id}/view`, { method: "POST" }),
}

export const orderApi = {
  list: (params?: { status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Order>>(`/orders${buildQuery(params || {})}`),
  get: (id: string) => request<OrderDetail>(`/orders/${id}`),
  create: (resourceId: string) => request<OrderDetail>("/orders", { method: "POST", body: JSON.stringify({ resourceId }) }),
  pay: (id: string) => request<OrderDetail>(`/orders/${id}/pay`, { method: "POST" }),
  listAuthorizations: () => request<ListResponse<Authorization>>("/authorizations"),
  verifyAuthorization: (code: string) => request<Authorization>(`/authorizations/${code}`),
}

export const bannerApi = {
  list: () => request<ListResponse<Banner>>("/banners"),
  create: (req: Omit<Banner, "id">) => request<Banner>("/banners", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Omit<Banner, "id">) => request<Banner>(`/banners/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/banners/${id}`, { method: "DELETE" }),
}

export const withdrawalApi = {
  list: (params?: { status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Withdrawal>>(`/withdrawals${buildQuery(params || {})}`),
  create: (req: { amount: number; accountType: string; accountInfo: string }) =>
    request<Withdrawal>("/withdrawals", { method: "POST", body: JSON.stringify(req) }),
  updateStatus: (id: string, status: string) =>
    request<Withdrawal>(`/withdrawals/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
}

export const statsApi = {
  dashboard: () => request<DashboardStats>("/stats/dashboard"),
  me: () => request<{ balance: number; totalIncome: number; totalSpent: number }>("/stats/me"),
}

export const configApi = {
  get: () => request<PlatformConfig>("/config"),
  update: (req: PlatformConfig) => request<PlatformConfig>("/config", { method: "PUT", body: JSON.stringify(req) }),
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("zhiyu-token", token)
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("zhiyu-token")
  }
}


// ==================== Phase 1: Unified backend management APIs ====================

export const tenantApi = {
  ...createCrudApi<Tenant, Omit<Tenant, "id" | "createdAt" | "updatedAt">, Partial<Omit<Tenant, "id" | "createdAt" | "updatedAt">>>("/tenants"),
  updateStatus: (id: string, status: string) =>
    request<Tenant>(`/tenants/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
}

export const orgApi = {
  ...createCrudApi<Organization, Omit<Organization, "id" | "createdAt" | "updatedAt">, Partial<Omit<Organization, "id" | "createdAt" | "updatedAt">>>("/organizations"),
  tree: (params?: { tenantId?: string; typeId?: string }) =>
    request<Organization[]>(`/organizations/tree${buildQuery(params || {})}`),
}

export const orgTypeApi = createCrudApi<OrgType, Omit<OrgType, "id" | "createdAt">, Partial<Omit<OrgType, "id" | "createdAt">>>("/org-types")

export const identityTypeApi = createCrudApi<IdentityType, Omit<IdentityType, "id" | "userCount" | "createdAt">, Partial<Omit<IdentityType, "id" | "userCount" | "createdAt">>>("/identity-types")

export interface CreateUserRequest {
  tenantId?: string
  institutionId?: string
  identityTypeId: string
  orgNodeId?: string
  majorId?: string
  role: "school" | "enterprise" | "operator"
  loginName: string
  username?: string
  password: string
  name: string
  email?: string
  phone?: string
  avatarUrl?: string
  studentNo?: string
  workId?: string
  idCard?: string
  titleIds?: string[]
  status?: string
}

export const userManagementApi = {
  list: (params?: { tenantId?: string; identityTypeId?: string; orgNodeId?: string; majorId?: string; search?: string; status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<User>>(`/users${buildQuery(params || {})}`),
  get: (id: string) => request<User>(`/users/${id}`),
  create: (req: CreateUserRequest) => request<User>("/users", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<CreateUserRequest>) => request<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/users/${id}`, { method: "DELETE" }),
  updateStatus: (id: string, status: string) =>
    request<User>(`/users/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
  batchCreate: (reqs: CreateUserRequest[]) =>
    request<{ count: number }>("/users/batch", { method: "POST", body: JSON.stringify({ items: reqs }) }),
}

export const roleApi = {
  ...createCrudApi<Role, Omit<Role, "id" | "userCount" | "createdAt">, Partial<Omit<Role, "id" | "userCount" | "createdAt">>>("/roles"),
  assign: (id: string, userIds: string[]) =>
    request<Role>(`/roles/${id}/assign`, { method: "POST", body: JSON.stringify({ userIds }) }),
}

export const majorApi = createCrudApi<Major, Omit<Major, "id" | "createdAt" | "updatedAt">, Partial<Omit<Major, "id" | "createdAt" | "updatedAt">>>("/majors")

export const industryApi = createCrudApi<Industry, Omit<Industry, "id" | "createdAt" | "updatedAt">, Partial<Omit<Industry, "id" | "createdAt" | "updatedAt">>>("/industries")

export const resourceCodeApi = createCrudApi<ResourceCode, Omit<ResourceCode, "id" | "createdAt">, Partial<Omit<ResourceCode, "id" | "createdAt">>>("/resource-codes")

export const subscriptionApi = {
  get: (tenantId: string) => request<SubscriptionPackage>(`/subscriptions?tenantId=${tenantId}`),
  update: (id: string, req: Partial<Omit<SubscriptionPackage, "id" | "createdAt" | "updatedAt">>) =>
    request<SubscriptionPackage>(`/subscriptions/${id}`, { method: "PUT", body: JSON.stringify(req) }),
}

export const logApi = {
  loginLogs: (params?: { tenantId?: string; userId?: string; status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<LoginLog>>(`/logs/login${buildQuery(params || {})}`),
  operationLogs: (params?: { tenantId?: string; userId?: string; module?: string; action?: string; limit?: number; offset?: number }) =>
    request<ListResponse<OperationLog>>(`/logs/operation${buildQuery(params || {})}`),
}

export const workflowApi = createCrudApi<Workflow, Omit<Workflow, "id" | "usageCount" | "createdAt">, Partial<Omit<Workflow, "id" | "usageCount" | "createdAt">>>("/workflows")

export const approvalApi = {
  list: (params?: { targetType?: string; targetId?: string; status?: string; submitterId?: string; limit?: number; offset?: number }) =>
    request<ListResponse<ApprovalRecord>>(`/approvals${buildQuery(params || {})}`),
  get: (id: string) => request<ApprovalRecord>(`/approvals/${id}`),
  create: (req: Omit<ApprovalRecord, "id" | "createdAt" | "updatedAt">) =>
    request<ApprovalRecord>("/approvals", { method: "POST", body: JSON.stringify(req) }),
  review: (id: string, req: { status: "approved" | "rejected"; comment?: string; stepIdx?: number }) =>
    request<ApprovalRecord>(`/approvals/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ action: req.status, remark: req.comment, nextStepIdx: req.stepIdx }),
    }),
}

export const platformLinkApi = {
  list: () => request<ListResponse<PlatformLink>>("/platform-links"),
  get: (id: string) => request<PlatformLink>(`/platform-links/${id}`),
  create: (req: Omit<PlatformLink, "id">) =>
    request<PlatformLink>("/platform-links", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<PlatformLink, "id">>) =>
    request<PlatformLink>(`/platform-links/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/platform-links/${id}`, { method: "DELETE" }),
}

export const appModuleApi = {
  list: (params?: { platform?: string }) =>
    request<ListResponse<AppModule>>(`/app-modules${buildQuery(params || {})}`),
}

// ==================== Phase 3.2: Job APIs ====================

export const positionApi = createContentApi<CareerPosition, Omit<CareerPosition, "id" | "createdAt" | "updatedAt">, Partial<Omit<CareerPosition, "id" | "createdAt" | "updatedAt">>>("/job/positions")

export const abilityApi = {
  list: (params?: { category?: string; isPublic?: boolean; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<AbilityPoint>>(`/job/abilities${buildQuery(params || {})}`),
  get: (id: string) => request<AbilityPoint>(`/job/abilities/${id}`),
  create: (req: Omit<AbilityPoint, "id" | "createdAt">) =>
    request<AbilityPoint>("/job/abilities", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<AbilityPoint, "id" | "createdAt">>) =>
    request<AbilityPoint>(`/job/abilities/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/job/abilities/${id}`, { method: "DELETE" }),
  listBindings: (params?: { careerPositionId?: string; responsibilityId?: string }) =>
    request<ListResponse<PositionAbilityBinding>>(`/job/position-abilities${buildQuery(params || {})}`),
  createBinding: (req: Omit<PositionAbilityBinding, "id">) =>
    request<PositionAbilityBinding>("/job/position-abilities", { method: "POST", body: JSON.stringify(req) }),
  updateBinding: (id: string, req: Partial<Omit<PositionAbilityBinding, "id">>) =>
    request<PositionAbilityBinding>(`/job/position-abilities/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  deleteBinding: (id: string) => request<{ id: string }>(`/job/position-abilities/${id}`, { method: "DELETE" }),
  listDomains: (careerPositionId: string) =>
    request<ListResponse<AbilityDomain>>(`/job/ability-domains?careerPositionId=${careerPositionId}`),
  createDomain: (req: Omit<AbilityDomain, "id">) =>
    request<AbilityDomain>("/job/ability-domains", { method: "POST", body: JSON.stringify(req) }),
  updateDomain: (id: string, req: Partial<Omit<AbilityDomain, "id">>) =>
    request<AbilityDomain>(`/job/ability-domains/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  deleteDomain: (id: string) => request<{ id: string }>(`/job/ability-domains/${id}`, { method: "DELETE" }),
}

export const batchApi = {
  ...createCrudApi<JobBatch, Omit<JobBatch, "id" | "positionCount" | "publishedCount" | "pendingCount" | "createdAt" | "updatedAt">, Partial<Omit<JobBatch, "id" | "createdAt" | "updatedAt">>>("/job/batches"),
  updateStatus: (id: string, status: string) =>
    request<JobBatch>(`/job/batches/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
}

export const recommendApi = createCrudApi<PositionRecommendation, Omit<PositionRecommendation, "id" | "createdAt" | "updatedAt">, Partial<Omit<PositionRecommendation, "id" | "createdAt" | "updatedAt">>>("/job/recommendations")

export const learnRoadApi = createCrudApi<LearnRoad, Omit<LearnRoad, "id" | "createdAt" | "updatedAt">, Partial<Omit<LearnRoad, "id" | "createdAt" | "updatedAt">>>("/job/learn-roads")

export const jobBannerApi = createCrudApi<BannerConfig, Omit<BannerConfig, "id" | "createdAt" | "updatedAt">, Partial<Omit<BannerConfig, "id" | "createdAt" | "updatedAt">>>("/job/banners")

// ==================== Phase 3.3: Scene APIs ====================

export const scenarioApi = createContentApi<Scenario, Omit<Scenario, "id" | "viewCount" | "createdAt" | "updatedAt">, Partial<Omit<Scenario, "id" | "createdAt" | "updatedAt">>>("/scene/scenarios")

export const taskApi = {
  list: (params?: { scenarioId?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<ScenarioTask>>(`/scene/tasks${buildQuery(params || {})}`),
  get: (id: string) => request<ScenarioTask>(`/scene/tasks/${id}`),
  create: (req: Omit<ScenarioTask, "id">) =>
    request<ScenarioTask>("/scene/tasks", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<ScenarioTask, "id">>) =>
    request<ScenarioTask>(`/scene/tasks/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/scene/tasks/${id}`, { method: "DELETE" }),
  reorder: (scenarioId: string, taskIds: string[]) =>
    request<{ ok: boolean }>("/scene/tasks/reorder", { method: "POST", body: JSON.stringify({ scenarioId, taskIds }) }),
}

export const sceneBatchApi = createCrudApi<SceneBatch, Omit<SceneBatch, "id" | "createdAt" | "updatedAt">, Partial<Omit<SceneBatch, "id" | "createdAt" | "updatedAt">>>("/scene/batches")

// ==================== Phase 3.4: Lesson APIs ====================

export const courseApi = createContentApi<Course, Omit<Course, "id" | "nodeCount" | "resourceCount" | "viewCount" | "studyCount" | "createdAt" | "updatedAt">, Partial<Omit<Course, "id" | "createdAt" | "updatedAt">>>("/lesson/courses")

export const knowledgeApi = createCrudApi<KnowledgePoint, Omit<KnowledgePoint, "id" | "createdAt" | "updatedAt">, Partial<Omit<KnowledgePoint, "id" | "createdAt" | "updatedAt">>>("/lesson/knowledge-points")

export const courseNodeApi = {
  ...createCrudApi<SystemCourseNode, Omit<SystemCourseNode, "id" | "createdAt" | "updatedAt">, Partial<Omit<SystemCourseNode, "id" | "createdAt" | "updatedAt">>>("/lesson/nodes"),
  reorder: (courseId: string, nodeIds: string[]) =>
    request<{ ok: boolean }>("/lesson/nodes/reorder", { method: "POST", body: JSON.stringify({ courseId, nodeIds }) }),
}

export const lessonBatchApi = createCrudApi<LessonBatch, Omit<LessonBatch, "id" | "createdAt" | "updatedAt">, Partial<Omit<LessonBatch, "id" | "createdAt" | "updatedAt">>>("/lesson/batches")

export const lessonBehaviorApi = {
  aggregate: (params: { courseId: string; startDate?: string; endDate?: string }) =>
    request<LessonBehaviorAggregate>(`/lesson/behavior-collection/aggregate${buildQuery(params)}`),
  create: (req: Omit<LessonBehaviorRecord, "id" | "createdAt" | "updatedAt">) =>
    request<LessonBehaviorRecord>("/lesson/behavior-collection/records", { method: "POST", body: JSON.stringify(req) }),
}

export const fileApi = {
  upload: async (file: File): Promise<UploadResponse> => {
    const form = new FormData()
    form.append("file", file)
    const token = getToken()
    const headers: HeadersInit = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(`${API_BASE}/files/upload`, { method: "POST", body: form, headers })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `HTTP ${res.status}`)
    }
    return res.json()
  },
}

export const importExportApi = {
  export: (entity: string) => {
    const token = getToken()
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
    return fetch(`${API_BASE}/export/${entity}`, { headers })
  },
  import: async (entity: string, file: File): Promise<{ created: number; failed: number; entity: string }> => {
    const form = new FormData()
    form.append("file", file)
    const token = getToken()
    const headers: HeadersInit = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(`${API_BASE}/import/${entity}`, { method: "POST", body: form, headers })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `HTTP ${res.status}`)
    }
    return res.json()
  },
}

export const portalApi = {
  workspaceDashboard: () => request<WorkspaceDashboard>("/portal/workspace/dashboard"),
}

// ==================== Phase 3.5: Evaluation APIs ====================

export const questionBankApi = createContentApi<QuestionBank, Omit<QuestionBank, "id" | "questionCount" | "createdAt" | "updatedAt">, Partial<Omit<QuestionBank, "id" | "questionCount" | "createdAt" | "updatedAt">>>("/evaluation/question-banks")

export const questionApi = {
  ...createCrudApi<Question, Omit<Question, "id" | "createdAt">, Partial<Omit<Question, "id" | "createdAt">>>("/evaluation/questions"),
  batchCreate: (bankId: string, items: Omit<Question, "id" | "bankId" | "createdAt">[]) =>
    request<{ count: number }>("/evaluation/questions/batch", { method: "POST", body: JSON.stringify({ bankId, items }) }),
}

export const examApi = {
  ...createContentApi<Exam, Omit<Exam, "id" | "totalScore" | "createdAt" | "updatedAt">, Partial<Omit<Exam, "id" | "totalScore" | "createdAt" | "updatedAt">>>("/evaluation/exams"),
  addQuestion: (id: string, questionId: string, score: number) =>
    request<Exam>(`/evaluation/exams/${id}/questions`, { method: "POST", body: JSON.stringify({ questionId, score }) }),
  removeQuestion: (id: string, questionId: string) =>
    request<Exam>(`/evaluation/exams/${id}/questions/${questionId}`, { method: "DELETE" }),
}

export const examUsageApi = {
  list: (params?: { examId?: string; status?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<ExamUsage>>(`/evaluation/exam-usages${buildQuery(params || {})}`),
  get: (id: string) => request<ExamUsage>(`/evaluation/exam-usages/${id}`),
  create: (req: Omit<ExamUsage, "id" | "createdAt" | "updatedAt">) =>
    request<ExamUsage>("/evaluation/exam-usages", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<ExamUsage, "id" | "createdAt" | "updatedAt">>) =>
    request<ExamUsage>(`/evaluation/exam-usages/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/evaluation/exam-usages/${id}`, { method: "DELETE" }),
  start: (id: string) => request<ExamUsage>(`/evaluation/exam-usages/${id}/start`, { method: "POST" }),
  finish: (id: string) => request<ExamUsage>(`/evaluation/exam-usages/${id}/finish`, { method: "POST" }),
}

export const examResultApi = {
  list: (params?: { usageId?: string; limit?: number; offset?: number }) =>
    request<ListResponse<ExamResult>>(`/evaluation/exam-results${buildQuery(params || {})}`),
  submit: (req: { examUsageId: string; answers: Record<string, string | string[]> }) =>
    request<ExamResult>("/evaluation/exam-results", { method: "POST", body: JSON.stringify(req) }),
}

export const evaluationResultApi = {
  list: (params?: { taskId?: string; evaluateeId?: string; methodKey?: string; status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<SceneEvaluationResult>>(`/evaluation/results${buildQuery(params || {})}`),
  get: (id: string) => request<SceneEvaluationResult>(`/evaluation/results/${id}`),
  grade: (id: string, req: { totalScore: number; evalPointScores?: Record<string, any>; comment?: string }) =>
    request<SceneEvaluationResult>(`/evaluation/results/${id}/grade`, { method: "POST", body: JSON.stringify(req) }),
  batchGrade: (items: { id: string; totalScore: number; evalPointScores?: Record<string, any>; comment?: string }[]) =>
    request<{ count: number }>("/evaluation/results/batch-grade", { method: "POST", body: JSON.stringify({ items }) }),
}

export const certApi = {
  listRules: (params?: { careerPositionId?: string; status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<CertificationRule>>(`/evaluation/certifications${buildQuery(params || {})}`),
  getRule: (id: string) => request<CertificationRule>(`/evaluation/certifications/${id}`),
  createRule: (req: Omit<CertificationRule, "id" | "createdAt" | "updatedAt">) =>
    request<CertificationRule>("/evaluation/certifications", { method: "POST", body: JSON.stringify(req) }),
  updateRule: (id: string, req: Partial<Omit<CertificationRule, "id" | "createdAt" | "updatedAt">>) =>
    request<CertificationRule>(`/evaluation/certifications/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  deleteRule: (id: string) => request<{ id: string }>(`/evaluation/certifications/${id}`, { method: "DELETE" }),
  listItems: (ruleId: string) => request<ListResponse<CertificationAbilityItem>>(`/evaluation/certifications/${ruleId}/items`),
  upsertItem: (ruleId: string, req: Partial<CertificationAbilityItem>) =>
    request<CertificationAbilityItem>(`/evaluation/certifications/${ruleId}/items`, { method: "POST", body: JSON.stringify(req) }),
  deleteItem: (id: string) => request<{ id: string }>(`/evaluation/certifications/items/${id}`, { method: "DELETE" }),
}

export const graduationApi = {
  listTopics: (params?: { careerPositionId?: string; status?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<GraduationProjectTopic>>(`/evaluation/graduation/topics${buildQuery(params || {})}`),
  getTopic: (id: string) => request<GraduationProjectTopic>(`/evaluation/graduation/topics/${id}`),
  createTopic: (req: Omit<GraduationProjectTopic, "id" | "appliedCount" | "createdAt">) =>
    request<GraduationProjectTopic>("/evaluation/graduation/topics", { method: "POST", body: JSON.stringify(req) }),
  updateTopic: (id: string, req: Partial<Omit<GraduationProjectTopic, "id" | "appliedCount" | "createdAt">>) =>
    request<GraduationProjectTopic>(`/evaluation/graduation/topics/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  deleteTopic: (id: string) => request<{ id: string }>(`/evaluation/graduation/topics/${id}`, { method: "DELETE" }),
  applyTopic: (id: string) => request<GraduationProjectTopic>(`/evaluation/graduation/topics/${id}/apply`, { method: "POST" }),
  listArchives: (params?: { topicId?: string; userId?: string; limit?: number; offset?: number }) =>
    request<ListResponse<GraduationProjectArchive>>(`/evaluation/graduation/archives${buildQuery(params || {})}`),
  upsertArchive: (req: Partial<GraduationProjectArchive>) =>
    request<GraduationProjectArchive>("/evaluation/graduation/archives", { method: "POST", body: JSON.stringify(req) }),
  listEvaluations: (params?: { topicId?: string; userId?: string; limit?: number; offset?: number }) =>
    request<ListResponse<GraduationProjectEvaluation>>(`/evaluation/graduation/evaluations${buildQuery(params || {})}`),
  upsertEvaluation: (req: Partial<GraduationProjectEvaluation>) =>
    request<GraduationProjectEvaluation>("/evaluation/graduation/evaluations", { method: "POST", body: JSON.stringify(req) }),
  queryResults: (params?: { userId?: string; className?: string; majorName?: string; limit?: number; offset?: number }) =>
    request<ListResponse<GraduationQueryResult>>(`/evaluation/graduation/query${buildQuery(params || {})}`),
}

export const portraitApi = {
  list: (params?: { userId?: string; careerPositionId?: string; limit?: number; offset?: number }) =>
    request<ListResponse<StudentAbilityPortrait>>(`/evaluation/portraits${buildQuery(params || {})}`),
  get: (id: string) => request<StudentAbilityPortrait>(`/evaluation/portraits/${id}`),
  generate: (userId: string, careerPositionId: string) =>
    request<StudentAbilityPortrait>("/evaluation/portraits/generate", { method: "POST", body: JSON.stringify({ userId, careerPositionId }) }),
  listArchives: (params?: { userId?: string; materialType?: string; limit?: number; offset?: number }) =>
    request<ListResponse<StudentAbilityArchive>>(`/evaluation/portraits/archives${buildQuery(params || {})}`),
  upsertArchive: (req: Partial<StudentAbilityArchive>) =>
    request<StudentAbilityArchive>("/evaluation/portraits/archives", { method: "POST", body: JSON.stringify(req) }),
}

export const microCertApi = {
  listTemplates: (params?: { search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<MicroCertTemplate>>(`/evaluation/certificates/templates${buildQuery(params || {})}`),
  createTemplate: (req: Omit<MicroCertTemplate, "id" | "createdAt" | "updatedAt">) =>
    request<MicroCertTemplate>("/evaluation/certificates/templates", { method: "POST", body: JSON.stringify(req) }),
  updateTemplate: (id: string, req: Partial<Omit<MicroCertTemplate, "id" | "createdAt" | "updatedAt">>) =>
    request<MicroCertTemplate>(`/evaluation/certificates/templates/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  deleteTemplate: (id: string) => request<{ id: string }>(`/evaluation/certificates/templates/${id}`, { method: "DELETE" }),
  issue: (templateId: string, userIds: string[]) =>
    request<{ count: number }>("/evaluation/certificates/issue", { method: "POST", body: JSON.stringify({ templateId, userIds }) }),
  listHistory: (params?: { userId?: string; templateId?: string; limit?: number; offset?: number }) =>
    request<ListResponse<CertIssuanceRecord>>(`/evaluation/certificates/history${buildQuery(params || {})}`),
}

export const evaluationMethodApi = {
  listCategories: () => request<ListResponse<EvaluationMethodCategory>>("/evaluation/methods/categories"),
  listMethods: (params?: { categoryId?: string; enabled?: boolean }) =>
    request<ListResponse<EvaluationMethod>>(`/evaluation/methods${buildQuery(params || {})}`),
  toggle: (id: string, enabled: boolean) =>
    request<EvaluationMethod>(`/evaluation/methods/${id}/toggle`, { method: "POST", body: JSON.stringify({ enabled }) }),
}

export const appealApi = {
  list: (params?: { userId?: string; type?: string; status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<AppealRecord>>(`/evaluation/appeals${buildQuery(params || {})}`),
  get: (id: string) => request<AppealRecord>(`/evaluation/appeals/${id}`),
  create: (req: Omit<AppealRecord, "id" | "status" | "createdAt">) =>
    request<AppealRecord>("/evaluation/appeals", { method: "POST", body: JSON.stringify(req) }),
  process: (id: string, req: { status: string; remark?: string }) =>
    request<AppealRecord>(`/evaluation/appeals/${id}/process`, { method: "POST", body: JSON.stringify(req) }),
}

export const evaluationBatchApi = createCrudApi<EvaluationBatch, Omit<EvaluationBatch, "id" | "createdAt" | "updatedAt">, Partial<Omit<EvaluationBatch, "id" | "createdAt" | "updatedAt">>>("/evaluation/batches")
