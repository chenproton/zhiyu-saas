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
} from "./types/lesson"
import type {
  QuestionBank,
  Question,
  Exam,
  ExamQuestion,
  ExamUsage,
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1"

export interface ApiError {
  error: string
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("zhiyu-token")
      window.location.href = "/login"
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
  list: (params?: { search?: string; status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Tenant>>(`/tenants${buildQuery(params || {})}`),
  get: (id: string) => request<Tenant>(`/tenants/${id}`),
  create: (req: Omit<Tenant, "id" | "createdAt" | "updatedAt">) =>
    request<Tenant>("/tenants", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Tenant, "id" | "createdAt" | "updatedAt">>) =>
    request<Tenant>(`/tenants/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  updateStatus: (id: string, status: string) =>
    request<Tenant>(`/tenants/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
}

export const orgApi = {
  list: (params?: { tenantId?: string; parentId?: string; typeId?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Organization>>(`/organizations${buildQuery(params || {})}`),
  tree: (params?: { tenantId?: string; typeId?: string }) =>
    request<Organization[]>(`/organizations/tree${buildQuery(params || {})}`),
  get: (id: string) => request<Organization>(`/organizations/${id}`),
  create: (req: Omit<Organization, "id" | "createdAt" | "updatedAt">) =>
    request<Organization>("/organizations", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Organization, "id" | "createdAt" | "updatedAt">>) =>
    request<Organization>(`/organizations/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/organizations/${id}`, { method: "DELETE" }),
}

export const orgTypeApi = {
  list: (params?: { tenantId?: string; category?: string; limit?: number; offset?: number }) =>
    request<ListResponse<OrgType>>(`/org-types${buildQuery(params || {})}`),
  get: (id: string) => request<OrgType>(`/org-types/${id}`),
  create: (req: Omit<OrgType, "id" | "createdAt">) =>
    request<OrgType>("/org-types", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<OrgType, "id" | "createdAt">>) =>
    request<OrgType>(`/org-types/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/org-types/${id}`, { method: "DELETE" }),
}

export const identityTypeApi = {
  list: (params?: { tenantId?: string; limit?: number; offset?: number }) =>
    request<ListResponse<IdentityType>>(`/identity-types${buildQuery(params || {})}`),
  get: (id: string) => request<IdentityType>(`/identity-types/${id}`),
  create: (req: Omit<IdentityType, "id" | "userCount" | "createdAt">) =>
    request<IdentityType>("/identity-types", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<IdentityType, "id" | "userCount" | "createdAt">>) =>
    request<IdentityType>(`/identity-types/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/identity-types/${id}`, { method: "DELETE" }),
}

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
  list: (params?: { tenantId?: string; status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Role>>(`/roles${buildQuery(params || {})}`),
  get: (id: string) => request<Role>(`/roles/${id}`),
  create: (req: Omit<Role, "id" | "userCount" | "createdAt">) =>
    request<Role>("/roles", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Role, "id" | "userCount" | "createdAt">>) =>
    request<Role>(`/roles/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/roles/${id}`, { method: "DELETE" }),
  assign: (id: string, userIds: string[]) =>
    request<Role>(`/roles/${id}/assign`, { method: "POST", body: JSON.stringify({ userIds }) }),
}

export const majorApi = {
  list: (params?: { tenantId?: string; orgNodeId?: string; enabled?: boolean; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Major>>(`/majors${buildQuery(params || {})}`),
  get: (id: string) => request<Major>(`/majors/${id}`),
  create: (req: Omit<Major, "id" | "createdAt" | "updatedAt">) =>
    request<Major>("/majors", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Major, "id" | "createdAt" | "updatedAt">>) =>
    request<Major>(`/majors/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/majors/${id}`, { method: "DELETE" }),
}

export const industryApi = {
  list: (params?: { tenantId?: string; parentId?: string; enabled?: boolean; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Industry>>(`/industries${buildQuery(params || {})}`),
  get: (id: string) => request<Industry>(`/industries/${id}`),
  create: (req: Omit<Industry, "id" | "createdAt" | "updatedAt">) =>
    request<Industry>("/industries", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Industry, "id" | "createdAt" | "updatedAt">>) =>
    request<Industry>(`/industries/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/industries/${id}`, { method: "DELETE" }),
}

export const resourceCodeApi = {
  list: (params?: { tenantId?: string; type?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<ResourceCode>>(`/resource-codes${buildQuery(params || {})}`),
  get: (id: string) => request<ResourceCode>(`/resource-codes/${id}`),
  create: (req: Omit<ResourceCode, "id" | "createdAt">) =>
    request<ResourceCode>("/resource-codes", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<ResourceCode, "id" | "createdAt">>) =>
    request<ResourceCode>(`/resource-codes/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/resource-codes/${id}`, { method: "DELETE" }),
}

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

export const workflowApi = {
  list: (params?: { tenantId?: string; scene?: string; status?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Workflow>>(`/workflows${buildQuery(params || {})}`),
  get: (id: string) => request<Workflow>(`/workflows/${id}`),
  create: (req: Omit<Workflow, "id" | "usageCount" | "createdAt">) =>
    request<Workflow>("/workflows", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Workflow, "id" | "usageCount" | "createdAt">>) =>
    request<Workflow>(`/workflows/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/workflows/${id}`, { method: "DELETE" }),
}

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

export const positionApi = {
  list: (params?: { batchId?: string; status?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<CareerPosition>>(`/job/positions${buildQuery(params || {})}`),
  get: (id: string) => request<CareerPosition>(`/job/positions/${id}`),
  create: (req: Omit<CareerPosition, "id" | "createdAt" | "updatedAt">) =>
    request<CareerPosition>("/job/positions", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<CareerPosition, "id" | "createdAt" | "updatedAt">>) =>
    request<CareerPosition>(`/job/positions/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/job/positions/${id}`, { method: "DELETE" }),
  submit: (id: string) => request<CareerPosition>(`/job/positions/${id}/submit`, { method: "POST" }),
  review: (id: string, req: { status: string; comment?: string }) =>
    request<CareerPosition>(`/job/positions/${id}/review`, { method: "POST", body: JSON.stringify(req) }),
  publish: (id: string) => request<CareerPosition>(`/job/positions/${id}/publish`, { method: "POST" }),
  archive: (id: string) => request<CareerPosition>(`/job/positions/${id}/archive`, { method: "POST" }),
}

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
  list: (params?: { orgNodeId?: string; major?: string; status?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<JobBatch>>(`/job/batches${buildQuery(params || {})}`),
  get: (id: string) => request<JobBatch>(`/job/batches/${id}`),
  create: (req: Omit<JobBatch, "id" | "positionCount" | "publishedCount" | "pendingCount" | "createdAt" | "updatedAt">) =>
    request<JobBatch>("/job/batches", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<JobBatch, "id" | "createdAt" | "updatedAt">>) =>
    request<JobBatch>(`/job/batches/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/job/batches/${id}`, { method: "DELETE" }),
  updateStatus: (id: string, status: string) =>
    request<JobBatch>(`/job/batches/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
}

export const recommendApi = {
  list: (params?: { major?: string; isVisible?: boolean; limit?: number; offset?: number }) =>
    request<ListResponse<PositionRecommendation>>(`/job/recommendations${buildQuery(params || {})}`),
  create: (req: Omit<PositionRecommendation, "id" | "createdAt" | "updatedAt">) =>
    request<PositionRecommendation>("/job/recommendations", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<PositionRecommendation, "id" | "createdAt" | "updatedAt">>) =>
    request<PositionRecommendation>(`/job/recommendations/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/job/recommendations/${id}`, { method: "DELETE" }),
}

export const learnRoadApi = {
  list: (params?: { search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<LearnRoad>>(`/job/learn-roads${buildQuery(params || {})}`),
  get: (id: string) => request<LearnRoad>(`/job/learn-roads/${id}`),
  create: (req: Omit<LearnRoad, "id" | "createdAt" | "updatedAt">) =>
    request<LearnRoad>("/job/learn-roads", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<LearnRoad, "id" | "createdAt" | "updatedAt">>) =>
    request<LearnRoad>(`/job/learn-roads/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/job/learn-roads/${id}`, { method: "DELETE" }),
}

export const jobBannerApi = {
  list: () => request<ListResponse<BannerConfig>>("/job/banners"),
  create: (req: Omit<BannerConfig, "id" | "createdAt" | "updatedAt">) =>
    request<BannerConfig>("/job/banners", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<BannerConfig, "id" | "createdAt" | "updatedAt">>) =>
    request<BannerConfig>(`/job/banners/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/job/banners/${id}`, { method: "DELETE" }),
}

// ==================== Phase 3.3: Scene APIs ====================

export const scenarioApi = {
  list: (params?: { batchId?: string; status?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Scenario>>(`/scene/scenarios${buildQuery(params || {})}`),
  get: (id: string) => request<Scenario>(`/scene/scenarios/${id}`),
  create: (req: Omit<Scenario, "id" | "viewCount" | "createdAt" | "updatedAt">) =>
    request<Scenario>("/scene/scenarios", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Scenario, "id" | "createdAt" | "updatedAt">>) =>
    request<Scenario>(`/scene/scenarios/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/scene/scenarios/${id}`, { method: "DELETE" }),
  submit: (id: string) => request<Scenario>(`/scene/scenarios/${id}/submit`, { method: "POST" }),
  review: (id: string, req: { status: string; comment?: string }) =>
    request<Scenario>(`/scene/scenarios/${id}/review`, { method: "POST", body: JSON.stringify(req) }),
  publish: (id: string) => request<Scenario>(`/scene/scenarios/${id}/publish`, { method: "POST" }),
  archive: (id: string) => request<Scenario>(`/scene/scenarios/${id}/archive`, { method: "POST" }),
}

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

export const sceneBatchApi = {
  list: (params?: { orgNodeId?: string; major?: string; status?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<SceneBatch>>(`/scene/batches${buildQuery(params || {})}`),
  get: (id: string) => request<SceneBatch>(`/scene/batches/${id}`),
  create: (req: Omit<SceneBatch, "id" | "createdAt" | "updatedAt">) =>
    request<SceneBatch>("/scene/batches", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<SceneBatch, "id" | "createdAt" | "updatedAt">>) =>
    request<SceneBatch>(`/scene/batches/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/scene/batches/${id}`, { method: "DELETE" }),
}

// ==================== Phase 3.4: Lesson APIs ====================

export const courseApi = {
  list: (params?: { type?: string; category?: string; status?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Course>>(`/lesson/courses${buildQuery(params || {})}`),
  get: (id: string) => request<Course>(`/lesson/courses/${id}`),
  create: (req: Omit<Course, "id" | "nodeCount" | "resourceCount" | "viewCount" | "studyCount" | "createdAt" | "updatedAt">) =>
    request<Course>("/lesson/courses", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Course, "id" | "createdAt" | "updatedAt">>) =>
    request<Course>(`/lesson/courses/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/lesson/courses/${id}`, { method: "DELETE" }),
  submit: (id: string) => request<Course>(`/lesson/courses/${id}/submit`, { method: "POST" }),
  review: (id: string, req: { status: string; comment?: string }) =>
    request<Course>(`/lesson/courses/${id}/review`, { method: "POST", body: JSON.stringify(req) }),
  publish: (id: string) => request<Course>(`/lesson/courses/${id}/publish`, { method: "POST" }),
  archive: (id: string) => request<Course>(`/lesson/courses/${id}/archive`, { method: "POST" }),
}

export const knowledgeApi = {
  list: (params?: { search?: string; linked?: boolean; creatorId?: string; limit?: number; offset?: number }) =>
    request<ListResponse<KnowledgePoint>>(`/lesson/knowledge-points${buildQuery(params || {})}`),
  get: (id: string) => request<KnowledgePoint>(`/lesson/knowledge-points/${id}`),
  create: (req: Omit<KnowledgePoint, "id" | "createdAt" | "updatedAt">) =>
    request<KnowledgePoint>("/lesson/knowledge-points", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<KnowledgePoint, "id" | "createdAt" | "updatedAt">>) =>
    request<KnowledgePoint>(`/lesson/knowledge-points/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/lesson/knowledge-points/${id}`, { method: "DELETE" }),
}

export const courseNodeApi = {
  list: (params?: { courseId?: string; parentId?: string }) =>
    request<ListResponse<SystemCourseNode>>(`/lesson/nodes${buildQuery(params || {})}`),
  get: (id: string) => request<SystemCourseNode>(`/lesson/nodes/${id}`),
  create: (req: Omit<SystemCourseNode, "id" | "createdAt" | "updatedAt">) =>
    request<SystemCourseNode>("/lesson/nodes", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<SystemCourseNode, "id" | "createdAt" | "updatedAt">>) =>
    request<SystemCourseNode>(`/lesson/nodes/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/lesson/nodes/${id}`, { method: "DELETE" }),
  reorder: (courseId: string, nodeIds: string[]) =>
    request<{ ok: boolean }>("/lesson/nodes/reorder", { method: "POST", body: JSON.stringify({ courseId, nodeIds }) }),
}

export const lessonBatchApi = {
  list: (params?: { orgNodeId?: string; major?: string; status?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<LessonBatch>>(`/lesson/batches${buildQuery(params || {})}`),
  get: (id: string) => request<LessonBatch>(`/lesson/batches/${id}`),
  create: (req: Omit<LessonBatch, "id" | "createdAt" | "updatedAt">) =>
    request<LessonBatch>("/lesson/batches", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<LessonBatch, "id" | "createdAt" | "updatedAt">>) =>
    request<LessonBatch>(`/lesson/batches/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/lesson/batches/${id}`, { method: "DELETE" }),
}

// ==================== Phase 3.5: Evaluation APIs ====================

export const questionBankApi = {
  list: (params?: { status?: string; ownerType?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<QuestionBank>>(`/evaluation/question-banks${buildQuery(params || {})}`),
  get: (id: string) => request<QuestionBank>(`/evaluation/question-banks/${id}`),
  create: (req: Omit<QuestionBank, "id" | "questionCount" | "createdAt" | "updatedAt">) =>
    request<QuestionBank>("/evaluation/question-banks", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<QuestionBank, "id" | "questionCount" | "createdAt" | "updatedAt">>) =>
    request<QuestionBank>(`/evaluation/question-banks/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/evaluation/question-banks/${id}`, { method: "DELETE" }),
  submit: (id: string) => request<QuestionBank>(`/evaluation/question-banks/${id}/submit`, { method: "POST" }),
  review: (id: string, req: { status: string; comment?: string }) =>
    request<QuestionBank>(`/evaluation/question-banks/${id}/review`, { method: "POST", body: JSON.stringify(req) }),
  publish: (id: string) => request<QuestionBank>(`/evaluation/question-banks/${id}/publish`, { method: "POST" }),
  archive: (id: string) => request<QuestionBank>(`/evaluation/question-banks/${id}/archive`, { method: "POST" }),
}

export const questionApi = {
  list: (params?: { bankId?: string; type?: string; difficulty?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Question>>(`/evaluation/questions${buildQuery(params || {})}`),
  get: (id: string) => request<Question>(`/evaluation/questions/${id}`),
  create: (req: Omit<Question, "id" | "createdAt">) =>
    request<Question>("/evaluation/questions", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Question, "id" | "createdAt">>) =>
    request<Question>(`/evaluation/questions/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/evaluation/questions/${id}`, { method: "DELETE" }),
  batchCreate: (bankId: string, items: Omit<Question, "id" | "bankId" | "createdAt">[]) =>
    request<{ count: number }>("/evaluation/questions/batch", { method: "POST", body: JSON.stringify({ bankId, items }) }),
}

export const examApi = {
  list: (params?: { status?: string; ownerType?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<Exam>>(`/evaluation/exams${buildQuery(params || {})}`),
  get: (id: string) => request<Exam>(`/evaluation/exams/${id}`),
  create: (req: Omit<Exam, "id" | "totalScore" | "createdAt" | "updatedAt">) =>
    request<Exam>("/evaluation/exams", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<Exam, "id" | "totalScore" | "createdAt" | "updatedAt">>) =>
    request<Exam>(`/evaluation/exams/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/evaluation/exams/${id}`, { method: "DELETE" }),
  submit: (id: string) => request<Exam>(`/evaluation/exams/${id}/submit`, { method: "POST" }),
  review: (id: string, req: { status: string; comment?: string }) =>
    request<Exam>(`/evaluation/exams/${id}/review`, { method: "POST", body: JSON.stringify(req) }),
  publish: (id: string) => request<Exam>(`/evaluation/exams/${id}/publish`, { method: "POST" }),
  archive: (id: string) => request<Exam>(`/evaluation/exams/${id}/archive`, { method: "POST" }),
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

export const evaluationBatchApi = {
  list: (params?: { orgNodeId?: string; major?: string; status?: string; search?: string; limit?: number; offset?: number }) =>
    request<ListResponse<EvaluationBatch>>(`/evaluation/batches${buildQuery(params || {})}`),
  get: (id: string) => request<EvaluationBatch>(`/evaluation/batches/${id}`),
  create: (req: Omit<EvaluationBatch, "id" | "createdAt" | "updatedAt">) =>
    request<EvaluationBatch>("/evaluation/batches", { method: "POST", body: JSON.stringify(req) }),
  update: (id: string, req: Partial<Omit<EvaluationBatch, "id" | "createdAt" | "updatedAt">>) =>
    request<EvaluationBatch>(`/evaluation/batches/${id}`, { method: "PUT", body: JSON.stringify(req) }),
  delete: (id: string) => request<{ id: string }>(`/evaluation/batches/${id}`, { method: "DELETE" }),
}
