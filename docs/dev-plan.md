# 五项目合并开发方案

> 目标：将 `zhiyu-backend`、`zhiyu-evaluation`、`zhiyu-job`、`zhiyu-lesson`、`zhiyu-scene` 五个项目整合到 `zhiyu-saas`，使用统一前端、统一后端、统一数据库。
>
> 参考文档：
> - `docs/transformation-plan.md` — 改造方法论
> - `docs/数据表结构及关联文档（AI阅读版）.md` — 数据库建表唯一参考
> - `docs/项目页面清单.md` — 各项目在用页面路由

> **说明**：本文档将各 Phase 按独立文件拆分为子方案，便于 AI 逐步执行。主干文档（本文件）负责总体架构和 Phase 概览，每个 Phase 的详细执行步骤见对应的 `dev-plan-phase*.md`。执行时先通读本文档了解全局，然后按 Phase 顺序逐个打开子方案执行。

---

## 架构总览

```
zhiyu-saas/
├── app/
│   ├── (marketplace)/     ← 现有资源商城（保持不变）
│   ├── (dashboard)/       ← 现有仪表盘（保持不变）
│   ├── admin/             ← 现有运营管理（保持不变）
│   ├── login/             ← 统一登录（需增强）
│   ├── portal/            ← 从 zhiyu-backend 复制
│   ├── job/               ← 从 zhiyu-job 复制（路径加 /job 前缀）
│   ├── scene/             ← 从 zhiyu-scene 复制（路径加 /scene 前缀）
│   ├── lesson/            ← 从 zhiyu-lesson 复制（路径加 /lesson 前缀）
│   └── evaluation/        ← 从 zhiyu-evaluation 复制（路径加 /evaluation 前缀）
├── backend/
│   ├── internal/
│   │   ├── handler/       ← 新增 45+ 个 handler 文件
│   │   ├── domain/        ← 新增所有 domain 模型
│   │   └── router/        ← 新增所有路由
│   └── migrations/        ← 新增 6+ 迁移文件
├── components/            ← 去重合并后约 80+ 组件文件
├── lib/
│   ├── api.ts             ← 扩展 15+ 组 API 方法
│   └── types/             ← 新增各模块类型定义
└── 依赖新增: @xyflow/react, quill, react-quill, d3, @types/d3, xlsx
```

---

## 关键架构决策

| 决策项 | 方案 |
|--------|------|
| **路由命名** | 按模块加前缀：`/portal/*`、`/job/*`、`/scene/*`、`/lesson/*`、`/evaluation/*` |
| **用户体系** | 按 schema 文档一次性重建 users 表，支持 `identity_type_id`、`org_node_id`、`major_id` |
| **前端合并** | 逐个模块复制业务页面，`components/ui/` 去重，共享层只保留一份 |
| **状态管理** | 废弃各模块的 AuthProvider/DataProvider，统一使用增强后的 AuthProvider + 页面级 API 调用 |

---

## Phase 1：数据库 & 用户体系重构

### 1.1 新迁移文件 `002_unified_schema.up.sql`

#### 基础架构（8 张表）

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `tenants` | 租户 | id, name, code(unique), logo_url, domain, enterprise_code, admin_ids[], status |
| `organizations` | 组织架构树 | id, tenant_id, name, type_id(FK→org_types), parent_id, sort_order, member_count |
| `org_types` | 组织类型 | id, tenant_id, name, category(internal/business/external) |
| `identity_types` | 身份类型 | id, tenant_id, code, name, is_system, user_count |
| `user_extension_fields` | 用户扩展字段 | id, tenant_id, field_key(unique), field_type, applicable_identity_type_ids[], slot_number(1-20) |
| `user_relations` | 用户关系 | id, initiator_id, target_id, relation_type(上下级/业务协同/管理关系/etc) |
| `graduates` | 毕业生 | id, user_id, name, student_no, enroll_year, graduate_year, major_name |
| `staff_titles` | 教职工职称 | id, tenant_id, code, name, user_count, status |

#### 用户权限（4 张表）

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `roles` | 角色 | id, tenant_id, code, name, permissions JSONB, user_count, status |
| `user_roles` | 用户-角色 | id, user_id, role_id, UNIQUE(user_id, role_id) |
| `login_logs` | 登录日志 | id, tenant_id, user_id, ip, location, device, status, created_at |
| `operation_logs` | 操作日志 | id, tenant_id, user_id, module, action, target_type, target_id, detail, status |

#### 平台配置（6 张表）

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `majors` | 专业 | id, tenant_id, org_node_id, code, name, alias, enabled |
| `industries` | 行业（两级） | id, tenant_id, code, name, parent_id(self-ref), sort_order |
| `resource_codes` | 资源编码 | id, tenant_id, code, name, description, type(public/custom) |
| `subscription_packages` | 订阅套餐 | id, tenant_id, name, valid_until, modules JSONB, status |
| `app_modules` | 应用模块 | id, platform, title, description, href, sort_order |
| `platform_links` | 平台链接 | id, platform(unique), url, enabled |

**Phase 1 小计：18 张新表**

### 1.2 改造现有 `users` 表

```sql
ALTER TABLE users
  ADD COLUMN tenant_id UUID REFERENCES tenants(id),
  ADD COLUMN identity_type_id UUID REFERENCES identity_types(id),
  ADD COLUMN org_node_id UUID REFERENCES organizations(id),
  ADD COLUMN major_id UUID REFERENCES majors(id),
  ADD COLUMN student_no VARCHAR(64),
  ADD COLUMN work_id VARCHAR(64),
  ADD COLUMN id_card VARCHAR(32),
  ADD COLUMN title_ids UUID[],
  ADD COLUMN login_name VARCHAR(64) UNIQUE,
  ADD COLUMN phone VARCHAR(32),
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN oauth JSONB;
```

保留现有 `role user_role` 枚举列作为过渡兼容，后续可移除。

### 1.3 改造现有 `institutions` 表

添加 `tenant_id UUID REFERENCES tenants(id)`，作为过渡兼容。

### 1.4 工作流 & 审批（共享模块）

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `workflows` | 工作流模板 | id, tenant_id, name, scene, description, steps JSONB, usage_count, status |
| `approval_records` | 审批记录 | id, tenant_id, target_type, target_id, workflow_id, current_step_idx, status, submitter_id, history JSONB |

### 1.5 更新 JWT Claims & Auth Handler

- JWT claims 增加：`tenant_id`、`identity_type_id`、`org_node_id`
- `AuthHandler.Me` 返回更丰富的用户信息（含关联的身份类型、组织节点、专业、角色权限）
- `AuthHandler.Login` 支持 `login_name` 登录（兼容 `username`）
- 更新 `middleware/auth.go` 的 `Claims` 结构体和 `CurrentUser` 辅助函数

### 1.6 更新 Seed 数据

新增种子数据覆盖所有身份类型：
- 平台管理员（关联 tenant）
- 学校管理员、教师、学生
- 企业人事、企业导师

---

## Phase 2：前端基础设施准备

### 2.1 新增 npm 依赖

```bash
pnpm add @xyflow/react quill react-quill d3 xlsx
pnpm add -D @types/d3
```

### 2.2 类型体系

创建 `lib/types/` 目录：

| 文件 | 内容 |
|------|------|
| `lib/types/backend.ts` | Tenant, Organization, OrgType, IdentityType, Role, UserExtensionField, UserRelation, Graduate, StaffTitle, Major, Industry, ResourceCode, SubscriptionPackage, AppModule, PlatformLink, LoginLog, OperationLog, Workflow, ApprovalRecord |
| `lib/types/job.ts` | CareerPosition, PositionCertificate, PositionResponsibility, AbilityPoint, PositionAbilityBinding, AbilityDomain, Batch(Job), PositionRecommendation, BannerConfig, LearnRoad |
| `lib/types/scene.ts` | Scenario, ScenarioTask, TaskDeliverable, TaskResource, TaskResourceBinding, TaskKnowledgeBinding, TaskAbilityBinding, TaskEvaluationConfig, TaskEvalPoint, TaskReviewStep, ScenarioWeightConfig, ScenarioGradeMapping, SceneArchive |
| `lib/types/lesson.ts` | Course, KnowledgePoint, SystemCourseNode, NodeQuiz, NodeQuizQuestion, NodeHomework, HybridNodeModule, NodeResource, CourseKnowledgeBinding |
| `lib/types/evaluation.ts` | QuestionBank, Question, Exam, ExamQuestion, ExamUsage, EvaluationMethodCategory, EvaluationMethod, SceneEvaluationResult, JobAbilityResult, CertificationRule, CertificationAbilityItem, CertificationAbilityPoint, CertificationRelatedTask, StudentAbilityPortrait, StudentAbilityArchive, GraduationProjectTopic, GraduationProjectArchive, GraduationProjectEvaluation, GraduationQueryResult, MicroCertTemplate, CertIssuanceRecord, CreditConversionRule, AppealRecord |
| `lib/types/index.ts` | Barrel export |

### 2.3 扩展 `components/ui/`

对比 zhiyu-saas 现有的 57 个 shadcn 组件与五个项目的组件清单，补全：

- `aspect-ratio.tsx`
- `breadcrumb.tsx`
- `command.tsx`
- `drawer.tsx`
- `hover-card.tsx`
- `input-otp.tsx`
- `menubar.tsx`
- `navigation-menu.tsx`
- `pagination.tsx`
- `resizable.tsx`
- `toggle-group.tsx`

### 2.4 扩展 `lib/api.ts`

> **API 前缀约定**：现有 Marketplace API 使用 `/api/v1`（`/api/v1/auth`、`/api/v1/resources` 等）。新增模块 API 使用二级路径区分：`/api/v1/job/*`、`/api/v1/scene/*`、`/api/v1/lesson/*`、`/api/v1/evaluation/*`。Portal 管理类 API 保持一级：`/api/v1/tenants`、`/api/v1/organizations`。

在现有 API 对象基础上，新增以下客户端：

```typescript
// === Phase 1: 基础管理 ===
export const tenantApi = { ... }           // 租户 CRUD
export const orgApi = { ... }              // 组织 CRUD
export const identityTypeApi = { ... }     // 身份类型 CRUD
export const roleApi = { ... }             // 角色权限 CRUD
export const userManagementApi = { ... }   // 用户管理（CRUD for admin）
export const majorApi = { ... }            // 专业管理
export const industryApi = { ... }         // 行业管理
export const logApi = { ... }              // 日志查询
export const workflowApi = { ... }         // 审批流程 CRUD
export const approvalApi = { ... }         // 审批记录

// === Phase 3.2: 岗位管理 ===
export const positionApi = { ... }         // 岗位 CRUD
export const abilityApi = { ... }          // 能力点 CRUD
export const batchApi = { ... }            // 批次 CRUD
export const recommendApi = { ... }        // 推荐管理

// === Phase 3.3: 场景管理 ===
export const scenarioApi = { ... }         // 场景 CRUD
export const taskApi = { ... }             // 任务 CRUD

// === Phase 3.4: 课程管理 ===
export const courseApi = { ... }           // 课程 CRUD
export const knowledgeApi = { ... }        // 知识点 CRUD

// === Phase 3.5: 测评管理 ===
export const questionBankApi = { ... }     // 题库 CRUD
export const questionApi = { ... }         // 题目 CRUD
export const examApi = { ... }             // 试卷 CRUD
export const examUsageApi = { ... }        // 考试场次
export const certApi = { ... }             // 认证管理
export const graduationApi = { ... }       // 毕业设计
export const portraitApi = { ... }         // 学生画像
export const microCertApi = { ... }        // 微证书
```

### 2.5 增强 AuthProvider

扩展 `components/auth-provider.tsx`：

```typescript
interface AuthContextType {
  // 现有字段
  user?: MeResponse["user"]
  institution?: MeResponse["institution"]
  role?: UserRole
  institutionId?: string

  // 新增字段
  tenantId?: string
  identityTypeId?: string
  identityType?: IdentityType
  orgNodeId?: string
  orgNode?: Organization
  permissions?: Record<string, any>  // { module: { pages: { buttons: [] } } }
  roles?: string[]

  // 现有方法
  loading: boolean
  error?: string
  refresh: () => Promise<void>
  logout: () => void

  // 新增方法
  hasPermission: (module: string, page?: string, action?: string) => boolean
}
```

---

## Phase 3：逐模块复制 & 后端对接

### 3.1 zhiyu-backend → `app/portal/`（25 页）

**前端工作：**
1. 复制 `zhiyu-backend/app/portal/` → `zhiyu-saas/app/portal/`
2. 复制 `zhiyu-backend/components/portal/`（top-nav.tsx, footer.tsx, yi-know-assistant.tsx）
3. 复制 `zhiyu-backend/components/admin/header.tsx`
4. 内部路径已是 `/portal/...`，无需大规模调整
5. 各页面 mock 数据替换为 API 调用

**后端新增 Handler（12 个）：**

| Handler 文件 | 主要方法 | API 路由 |
|-------------|---------|---------|
| `internal/handler/tenant_handler.go` | List, Get, Create, Update, Status | `/api/v1/tenants` |
| `internal/handler/org_handler.go` | List, Get, Create, Update, Delete, Tree | `/api/v1/organizations` |
| `internal/handler/org_type_handler.go` | List, Get, Create, Update, Delete | `/api/v1/org-types` |
| `internal/handler/identity_type_handler.go` | List, Get, Create, Update, Delete | `/api/v1/identity-types` |
| `internal/handler/user_management_handler.go` | List, Get, Create, Update, Delete, Status, Batch | `/api/v1/users` |
| `internal/handler/role_handler.go` | List, Get, Create, Update, Delete, Assign | `/api/v1/roles` |
| `internal/handler/major_handler.go` | List, Get, Create, Update, Delete | `/api/v1/majors` |
| `internal/handler/industry_handler.go` | List, Get, Create, Update, Delete | `/api/v1/industries` |
| `internal/handler/resource_code_handler.go` | List, Get, Create, Update, Delete | `/api/v1/resource-codes` |
| `internal/handler/log_handler.go` | LoginLogs, OperationLogs (List only) | `/api/v1/logs/login`, `/api/v1/logs/operation` |
| `internal/handler/subscription_handler.go` | Get, Update | `/api/v1/subscriptions` |
| `internal/handler/platform_link_handler.go` | List, Get, Create, Update, Delete | `/api/v1/platform-links` |

**数据库表：已在 Phase 1 的 `002_unified_schema.up.sql` 中覆盖。**

---

### 3.2 zhiyu-job → `app/job/`（13 页）

**前端页面映射：**

| 原路由 | 新路由 |
|--------|--------|
| `/positions` | `/job/positions` |
| `/positions/[id]/edit` | `/job/positions/[id]/edit` |
| `/batches` | `/job/batches` |
| `/workflows` | `/job/workflows` |
| `/approvals` | `/job/approvals` |
| `/banner-management` | `/job/banners` |
| `/learn-roads` | `/job/learn-roads` |
| `/post-recommend` | `/job/recommend` |
| `/ai-assisted_2/positions` | `/job/ai/positions` |
| `/ai-assisted_2/positions/new` | `/job/ai/positions/new` |
| `/ai-assisted_2/positions/[id]/edit` | `/job/ai/positions/[id]/edit` |
| `/student.html` | `/job/student.html`（public/） |
| `/student-ai-first.html` | `/job/student-ai-first.html`（public/） |
| `/learning-route` (route.ts) | `/job/learning-route/route.ts` |

**复制文件清单：**
- `app/(admin)/positions/` → `app/job/positions/`
- `app/(admin)/batches/` → `app/job/batches/`
- `app/(admin)/workflows/` → `app/job/workflows/`
- `app/(admin)/approvals/` → `app/job/approvals/`
- `app/(admin)/banner-management/` → `app/job/banners/`
- `app/(admin)/learn-roads/` → `app/job/learn-roads/`
- `app/(admin)/post-recommend/` → `app/job/recommend/`
- `app/(admin)/ai-assisted_2/` → `app/job/ai/`
- `public/student.html`
- `public/student-ai-first.html`
- `components/position-builder/` → `components/job/position-builder/`
- `components/ability-graph/` → `components/job/ability-graph/`
- `components/positions/` → `components/job/positions/`
- `components/ai/` → `components/job/ai/`

**路由前缀批量替换：**
- 所有 `href="/positions"` → `href="/job/positions"`
- 所有 `href="/batches"` → `href="/job/batches"`
- 以此类推

**新增 `app/job/layout.tsx`：**
```tsx
// 引用统一的 DashboardLayout 或独立的 admin layout
// 角色检查：允许 admin / builder / reviewer / teacher 访问
```

**后端新增 Handler（7 个）：**

| Handler 文件 | 主要方法 | API 路由 |
|-------------|---------|---------|
| `internal/handler/position_handler.go` | List, Get, Create, Update, Delete, Submit, Review, Publish, Archive | `/api/v1/job/positions` |
| `internal/handler/ability_handler.go` | List, Get, Create, Update, Delete | `/api/v1/job/abilities` |
| `internal/handler/position_ability_handler.go` | ListBindings, CreateBinding, UpdateBinding, DeleteBinding | `/api/v1/job/position-abilities` |
| `internal/handler/ability_domain_handler.go` | List, Create, Update, Delete | `/api/v1/job/ability-domains` |
| `internal/handler/job_batch_handler.go` | List, Get, Create, Update, Delete, Status | `/api/v1/job/batches` |
| `internal/handler/recommend_handler.go` | List, Create, Update, Delete | `/api/v1/job/recommendations` |
| `internal/handler/learn_road_handler.go` | List, Get, Create, Update, Delete | `/api/v1/job/learn-roads` |

**新增迁移 `003_job_schema.up.sql`（10 张表）：**
- `career_positions` — 职业岗位
- `position_certificates` — 岗位证书
- `position_responsibilities` — 岗位职责
- `ability_points` — 能力点（共享）
- `position_ability_bindings` — 岗位-能力绑定
- `ability_domains` — 能力域分组
- `batches` — 批次（job 专用）
- `position_recommendations` — 岗位推荐
- `banner_configs` — Banner 配置
- `learn_roads` — 学习路径

---

### 3.3 zhiyu-scene → `app/scene/`（18 页）

**前端页面映射：**

| 原路由 | 新路由 |
|--------|--------|
| `/`（首页） | `/scene/` |
| `/scenarios/new/edit` | `/scene/scenarios/new/edit` |
| `/scenarios/[id]/edit` | `/scene/scenarios/[id]/edit` |
| `/scenarios/[id]/edit/tasks` | `/scene/scenarios/[id]/edit/tasks` |
| `/batches` | `/scene/batches` |
| `/workflows` | `/scene/workflows` |
| `/approvals` | `/scene/approvals` |
| `/scene-archive` | `/scene/archive` |
| `/ai-assisted/*` | `/scene/ai/*` |
| `/ai-first/*` | `/scene/ai-first/*` |

**复制文件清单：**
- `app/page.tsx` → `app/scene/page.tsx`（场景模板管理首页）
- `app/scenarios/` → `app/scene/scenarios/`
- `app/batches/` → `app/scene/batches/`
- `app/workflows/` → `app/scene/workflows/`
- `app/approvals/` → `app/scene/approvals/`
- `app/scene-archive/` → `app/scene/archive/`
- `app/ai-assisted/` → `app/scene/ai/`
- `app/ai-first/` → `app/scene/ai-first/`
- `components/scenarios/` → `components/scene/scenarios/`
- `components/tasks/` → `components/scene/tasks/`
- `components/assessment/` → `components/scene/assessment/`
- `components/resources/` → `components/scene/resources/`

**后端新增 Handler（7 个）：**

| Handler 文件 | 主要方法 | API 路由 |
|-------------|---------|---------|
| `internal/handler/scenario_handler.go` | List, Get, Create, Update, Delete, Submit, Review, Publish, Archive | `/api/v1/scene/scenarios` |
| `internal/handler/scenario_task_handler.go` | List, Get, Create, Update, Delete, Reorder | `/api/v1/scene/tasks` |
| `internal/handler/task_evaluation_handler.go` | ListConfigs, UpsertConfig, DeleteConfig, ListEvalPoints, UpsertEvalPoint, DeleteEvalPoint, ListReviewSteps, UpsertReviewStep | `/api/v1/scene/evaluation` |
| `internal/handler/task_resource_handler.go` | ListResources, BindResource, UnbindResource | `/api/v1/scene/task-resources` |
| `internal/handler/task_knowledge_ability_handler.go` | BindKnowledge, UnbindKnowledge, BindAbility, UnbindAbility | `/api/v1/scene/task-bindings` |
| `internal/handler/scenario_weight_handler.go` | ListWeights, UpsertWeight | `/api/v1/scene/weights` |
| `internal/handler/scenario_grade_handler.go` | ListGradeMappings, UpsertGradeMapping | `/api/v1/scene/grade-mappings` |

**新增迁移 `004_scene_schema.up.sql`（14 张表）：**
- `scenarios` — 实践场景
- `scenario_tasks` — 场景任务
- `task_deliverables` — 任务交付物
- `task_resources` — 任务资源
- `task_resource_bindings` — 任务-资源绑定
- `task_knowledge_bindings` — 任务-知识点绑定（参考 lesson.knowledge_points）
- `task_ability_bindings` — 任务-能力点绑定（参考 job.ability_points）
- `task_evaluation_configs` — 任务测评配置
- `task_eval_points` — 任务评价标准
- `task_review_steps` — 任务评审步骤
- `scenario_weight_configs` — 场景权重配置
- `scenario_grade_mappings` — 场景等级映射
- `scene_archives` — 场景归档
- `batches` — 批次（scene 专用）

---

### 3.4 zhiyu-lesson → `app/lesson/`（19 页）

**前端页面映射：**

| 原路由 | 新路由 |
|--------|--------|
| `/admin/system` | `/lesson/admin/system` |
| `/admin/system/add` | `/lesson/admin/system/add` |
| `/admin/granular` | `/lesson/admin/granular` |
| `/admin/granular/add` | `/lesson/admin/granular/add` |
| `/admin/hybrid` | `/lesson/admin/hybrid` |
| `/admin/hybrid/add` | `/lesson/admin/hybrid/add` |
| `/admin/hybrid-archive` | `/lesson/admin/archive` |
| `/admin/approvals` | `/lesson/admin/approvals` |
| `/admin/batches` | `/lesson/admin/batches` |
| `/admin/workflows` | `/lesson/admin/workflows` |
| `/teacher/claim` | `/lesson/teacher/claim` |
| `/teacher/behavior-collection` | `/lesson/teacher/behavior` |
| `/teacher/progress-tracking` | `/lesson/teacher/progress` |
| `/teacher/final-assessment` | `/lesson/teacher/assessment` |
| `/teacher/grade-submit` | `/lesson/teacher/grade-submit` |
| `/teacher/learning-portrait` | `/lesson/teacher/portrait` |

**复制文件清单：**
- `app/admin/system/` → `app/lesson/admin/system/`
- `app/admin/granular/` → `app/lesson/admin/granular/`
- `app/admin/hybrid/` → `app/lesson/admin/hybrid/`
- `app/admin/hybrid-archive/` → `app/lesson/admin/archive/`
- `app/admin/approvals/` → `app/lesson/admin/approvals/`
- `app/admin/batches/` → `app/lesson/admin/batches/`
- `app/admin/workflows/` → `app/lesson/admin/workflows/`
- `app/teacher/` → `app/lesson/teacher/`
- `components/KnowledgeGraph.tsx` → `components/lesson/`
- `components/shared/`（AssessmentCardGroup, KnowledgePointsList）→ `components/lesson/`

**后端新增 Handler（7 个）：**

| Handler 文件 | 主要方法 | API 路由 |
|-------------|---------|---------|
| `internal/handler/course_handler.go` | List, Get, Create, Update, Delete, Submit, Review, Publish | `/api/v1/lesson/courses` |
| `internal/handler/knowledge_point_handler.go` | List, Get, Create, Update, Delete | `/api/v1/lesson/knowledge-points` |
| `internal/handler/course_node_handler.go` | List, Get, Create, Update, Delete, Reorder | `/api/v1/lesson/nodes` |
| `internal/handler/node_quiz_handler.go` | ListQuizzes, CreateQuiz, UpdateQuiz, DeleteQuiz, ListQuestions, AddQuestion, UpdateQuestion, DeleteQuestion | `/api/v1/lesson/quizzes` |
| `internal/handler/node_homework_handler.go` | List, Get, Create, Update, Delete | `/api/v1/lesson/homeworks` |
| `internal/handler/hybrid_module_handler.go` | ListModules, UpsertModule, DeleteModule | `/api/v1/lesson/hybrid-modules` |
| `internal/handler/course_batch_handler.go` | List, Get, Create, Update, Delete, Status | `/api/v1/lesson/batches` |

**新增迁移 `005_lesson_schema.up.sql`（10 张表）：**
- `courses` — 课程
- `knowledge_points` — 知识点（共享）
- `system_course_nodes` — 体系课节点（树形）
- `node_quizzes` — 节点测验
- `node_quiz_questions` — 测验题目
- `node_homeworks` — 节点作业
- `hybrid_node_modules` — 混合课模块
- `node_resources` — 节点资源
- `course_knowledge_bindings` — 课程-知识点绑定
- `batches` — 批次（lesson 专用）

---

### 3.5 zhiyu-evaluation → `app/evaluation/`（37 页）

**前端页面映射（管理后台）：**

| 原路由 | 新路由 |
|--------|--------|
| `/question-banks` | `/evaluation/question-banks` |
| `/question-banks/[id]` | `/evaluation/question-banks/[id]` |
| `/exams` | `/evaluation/exams` |
| `/exams/[id]` | `/evaluation/exams/[id]` |
| `/exam-usage` | `/evaluation/exam-usage` |
| `/exam-usage/results` | `/evaluation/exam-usage/results` |
| `/approval-center` | `/evaluation/approvals` |
| `/micro-certificates/templates` | `/evaluation/certificates/templates` |
| `/micro-certificates/issuance` | `/evaluation/certificates/issuance` |
| `/micro-certificates/history` | `/evaluation/certificates/history` |
| `/job-ability` | `/evaluation/job-ability` |
| `/job-ability/results` | `/evaluation/job-ability/results` |
| `/job-ability/config/[id]` | `/evaluation/job-ability/config/[id]` |
| `/evaluation-methods` | `/evaluation/methods` |
| `/scene-task-results` | `/evaluation/scene-results` |
| `/scene-task-results/[id]` | `/evaluation/scene-results/[id]` |
| `/graduation-project/topics` | `/evaluation/graduation/topics` |
| `/graduation-project/archives` | `/evaluation/graduation/archives` |
| `/graduation-project/evaluation` | `/evaluation/graduation/evaluation` |
| `/graduation-project/query` | `/evaluation/graduation/query` |
| `/student-portrait/portraits` | `/evaluation/portraits` |
| `/graduation-project/student/apply` | `/evaluation/graduation/student/apply` |
| `/graduation-project/student/archives` | `/evaluation/graduation/student/archives` |
| `/graduation-project/student/query` | `/evaluation/graduation/student/query` |

**前端页面映射（学生门户）：**

| 原路由 | 新路由 |
|--------|--------|
| `/landingpage` | `/evaluation/landing` |
| `/landingpage/resources` | `/evaluation/landing/resources` |
| `/landingpage/resources/banks/[id]` | `/evaluation/landing/resources/banks/[id]` |
| `/landingpage/resources/exams/[id]` | `/evaluation/landing/resources/exams/[id]` |
| `/landingpage/exams` | `/evaluation/landing/exams` |
| `/landingpage/exams/[id]` | `/evaluation/landing/exams/[id]` |
| `/landingpage/certifications` | `/evaluation/landing/certifications` |
| `/landingpage/certifications/[id]` | `/evaluation/landing/certifications/[id]` |
| `/landingpage/graduation` | `/evaluation/landing/graduation` |
| `/landingpage/graduation/[id]` | `/evaluation/landing/graduation/[id]` |
| `/landingpage/portrait/major/[majorName]` | `/evaluation/landing/portrait/[majorName]` |
| `/landingpage/evaluation-methods` | `/evaluation/landing/methods` |

**复制文件清单：**
- `app/question-banks/` → `app/evaluation/question-banks/`
- `app/exams/` → `app/evaluation/exams/`
- `app/exam-usage/` → `app/evaluation/exam-usage/`
- `app/approval-center/` → `app/evaluation/approvals/`
- `app/micro-certificates/` → `app/evaluation/certificates/`
- `app/job-ability/` → `app/evaluation/job-ability/`
- `app/evaluation-methods/` → `app/evaluation/methods/`
- `app/scene-task-results/` → `app/evaluation/scene-results/`
- `app/graduation-project/` → `app/evaluation/graduation/`
- `app/student-portrait/` → `app/evaluation/portraits/`
- `app/landingpage/` → `app/evaluation/landing/`
- `components/question-banks/` → `components/evaluation/`
- `components/exams/` → `components/evaluation/`
- `components/questions/` → `components/evaluation/`
- `components/certification/` → `components/evaluation/`
- `components/graduation-project/` → `components/evaluation/`

> **注意**：zhiyu-evaluation 项目中存在以下 Next.js API Route 文件，由于 zhiyu-saas 的 `/api/*` 全部代理到 Go 后端，这些路由需要特殊处理：
> - `app/api/prd-annotations/route.ts` → 可保留为 Next.js API Route（#6 注释系统）
> - `app/api/comments/route.ts` → 同上
> - `app/api/annotations/route.ts` → 同上
> 参见 Phase 3.6 节关于注释系统的说明。

**后端新增 Handler（11 个）：**

| Handler 文件 | 主要方法 | API 路由 |
|-------------|---------|---------|
| `internal/handler/question_bank_handler.go` | List, Get, Create, Update, Delete | `/api/v1/evaluation/question-banks` |
| `internal/handler/question_handler.go` | List, Get, Create, Update, Delete, BatchCreate | `/api/v1/evaluation/questions` |
| `internal/handler/exam_handler.go` | List, Get, Create, Update, Delete, AddQuestion, RemoveQuestion | `/api/v1/evaluation/exams` |
| `internal/handler/exam_usage_handler.go` | List, Get, Create, Update, Delete, Start, Finish | `/api/v1/evaluation/exam-usages` |
| `internal/handler/evaluation_result_handler.go` | List, Get, Grade, BatchGrade | `/api/v1/evaluation/results` |
| `internal/handler/certification_handler.go` | ListRules, GetRule, CreateRule, UpdateRule, DeleteRule, ConfigItems, ConfigPoints | `/api/v1/evaluation/certifications` |
| `internal/handler/graduation_handler.go` | ListTopics, GetTopic, CreateTopic, UpdateTopic, DeleteTopic, ApplyTopic(学生选题), ArchivesCRUD, EvaluationsCRUD, QueryResults | `/api/v1/evaluation/graduation` |
| `internal/handler/student_portrait_handler.go` | List, Get, Generate | `/api/v1/evaluation/portraits` |
| `internal/handler/micro_cert_handler.go` | ListTemplates → IssueCerts, ListHistory | `/api/v1/evaluation/certificates` |
| `internal/handler/appeal_handler.go` | List, Get, Create, Process, Resolve | `/api/v1/evaluation/appeals` |
| `internal/handler/evaluation_method_handler.go` | ListCategories, ListMethods, Toggle | `/api/v1/evaluation/methods` |

**新增迁移 `006_evaluation_schema.up.sql`（24 张表）：**
- `question_banks` — 题库（共享）
- `questions` — 题目（共享）
- `exams` — 试卷（共享）
- `exam_questions` — 试卷题目快照
- `exam_usages` — 考试使用记录
- `evaluation_method_categories` — 测评方式分类
- `evaluation_methods` — 测评方式
- `scene_evaluation_results` — 场景测评结果
- `job_ability_results` — 岗位能力认定结果
- `certification_rules` — 认证规则
- `certification_ability_items` — 认证能力项
- `certification_ability_points` — 认证能力点
- `certification_related_tasks` — 认证关联任务
- `student_ability_portraits` — 学生能力画像
- `student_ability_archives` — 学生能力档案
- `graduation_project_topics` — 毕设选题
- `graduation_project_archives` — 毕设档案
- `graduation_project_evaluations` — 毕设评价
- `graduation_query_results` — 毕业审核结果
- `micro_cert_templates` — 微证书模板
- `cert_issuance_records` — 证书颁发记录
- `credit_conversion_rules` — 学分转换规则
- `appeal_records` — 申诉记录
- `batches` — 批次（evaluation 专用）

---

### 3.6 跨模块共享组件 & lib 文件处理

五个项目之间存在大量共享代码，需要在各模块复制完成后统一处理。

#### 3.6.1 PlatformShell 去重（4 个副本）

四个项目（job/evaluation/lesson/scene）各有 `components/platform-shell/PlatformShell.tsx`（几乎相同）。

**策略**：以 zhiyu-job 的版本为基础，合并到 `components/platform-shell/`（共享），其余删除。

#### 3.6.2 Shell Wrapper 统一

- zhiyu-evaluation 有 `app/shell-wrapper.tsx`（入口层面的包装器）
- zhiyu-job 有 `components/shared/platform-shell-wrapper.tsx`
- zhiyu-scene 有 `components/layout/platform-shell-wrapper.tsx`

**策略**：统一为一个 `components/platform-shell-wrapper.tsx`，各模块 layout 引用。

#### 3.6.3 侧边栏导航配置合并

三个项目有独立的 `lib/navigation-config.ts`：
- `zhiyu-job`：careerNavigationConfig（admin + student 导航）
- `zhiyu-evaluation`：evaluationNavigationConfig
- `zhiyu-lesson`：adminNavigationConfig, unifiedNavigationConfig

**策略**：合并到 `lib/navigation-config.ts`，按模块组织（`jobNav`, `evaluationNav`, `lessonNav`, `sceneNav`, `portalNav`）。

#### 3.6.4 各项目 lib/mock-data.ts 处理

所有源项目的 mock 数据文件**不作为前端运行时数据源使用**，但需保留作为**后端 API 实现参考**：

- `zhiyu-job/lib/mock-data/*.ts` → 参考用于 seed 脚本和 API 响应结构
- `zhiyu-evaluation/lib/mock-data.ts` → 同上
- `zhiyu-lesson/lib/mock-data.ts` → 同上
- `zhiyu-scene/lib/mock-data.ts` → 同上

这些文件放到 `lib/mock-data-reference/` 目录下（仅参考，不 import）。

#### 3.6.5 PRD 注释系统（evaluation + scene + lesson 共享）

zhiyu-evaluation 和 zhiyu-scene 都有 `lib/annotation-edit-context.tsx`。
zhiyu-evaluation 有独立的 API 路由（`/api/prd-annotations`、`/api/comments`、`/api/annotations`）。

**处理方式**：
- MVP 阶段保留前端注释标记组件，但注释数据的持久化可延后实现
- 如需立刻可用，将 evaluation 的 3 个 `/api/*` route 复制到 `app/api/` 下（`/api/annotations/*` 不与 Go 后端冲突因为 Go 后端没有这些路由）
- 统一 `annotation-edit-context.tsx` 放到 `lib/annotation-edit-context.tsx`（一份）

#### 3.6.6 各项目 Layout 文件适配

| 项目 | 原 Layout 文件 | 目的 |
|------|--------------|------|
| zhiyu-backend | `app/portal/layout.tsx`, `app/portal/apps/system/layout.tsx` | Portal 侧边栏 + 面包屑 |
| zhiyu-job | `app/(admin)/layout.tsx` | Admin layout + 角色检查 |
| zhiyu-lesson | `app/admin/layout.tsx`, `app/teacher/layout.tsx` | 管理员 + 教师端不同布局 |
| zhiyu-evaluation | `app/landingpage/layout.tsx` | 学生门户布局 |
| zhiyu-scene | `app/layout.tsx`（全局） | AnnotationEditProvider 包装 |

**策略**：每个模块保留自己的 layout.tsx，但将 Provider 包装上提到 `app/layout.tsx`（如 ThemeProvider、AuthProvider 全局只包一次）。模块 layout 只负责模块级导航和角色校验。

#### 3.6.7 共享组件去重清单

以下组件在多个项目中重复出现（名称相同或功能相同），需要合并为一份：

| 组件 | 来源项目 | 目标位置 |
|------|---------|---------|
| `status-badge.tsx` | job, evaluation | `components/shared/status-badge.tsx` |
| `student-portrait-modal.tsx` | evaluation, lesson | `components/shared/student-portrait-modal.tsx` |
| `confirm-dialog.tsx` | evaluation | `components/shared/confirm-dialog.tsx` |
| `page-header-card.tsx` | evaluation | `components/shared/page-header-card.tsx` |
| `co-builder-dialog.tsx` | evaluation | `components/shared/co-builder-dialog.tsx` |
| `invite-collaborator-dialog.tsx` | evaluation | `components/shared/invite-collaborator-dialog.tsx` |
| `stats-cards.tsx` | evaluation | `components/shared/stats-cards.tsx` |
| `role-switcher.tsx` | job | `components/shared/role-switcher.tsx`（过渡期用） |
| `KnowledgePointsList.tsx` | lesson | `components/shared/knowledge-points-list.tsx` |
| `AssessmentCardGroup.tsx` | lesson | `components/shared/assessment-card-group.tsx` |
| `KnowledgeGraph.tsx` | lesson | `components/shared/knowledge-graph.tsx` |

#### 3.6.8 ThemeProvider 统一

- zhiyu-saas 已有 `components/theme-provider.tsx`（next-themes）
- zhiyu-job、zhiyu-evaluation、zhiyu-scene 也各有自己的 ThemeProvider
- zhiyu-lesson 无 ThemeProvider
- zhiyu-backend 有 ThemeProvider

**策略**：保留 zhiyu-saas 现有的一份 ThemeProvider，所有其他副本删除。在 `app/layout.tsx` 中全局包裹。

#### 3.6.9 根页面重定向策略

- zhiyu-saas 现有 `app/page.tsx` 显示资源商城首页
- zhiyu-backend 的 `app/page.tsx` 重定向到 `/portal`

**策略**：修改 zhiyu-saas 的 `app/page.tsx`，根据用户登录状态和身份类型进行智能跳转：
- 未登录 → 资源商城首页（保持现有）
- 管理员 → `/admin`（运营仪表盘）
- 教师 → `/portal/workspace`（我的服务台）
- 学生 → `/portal/workspace`（我的服务台）

或者保留商城首页不变，在顶部导航增加「我的服务台」和「应用中心」入口。

---

## Phase 4：平台入口与导航整合

### 4.1 门户首页

扩展 `app/portal/`，作为统一入口展示所有子平台链接。

### 4.2 统一侧边栏导航

更新 `components/dashboard-layout.tsx`，根据用户身份类型（identity_type）展示不同导航：

**管理员：**
- 租户管理 → `/portal/apps/system/tenant`
- 组织架构 → `/portal/apps/system/org-user/org-structure`
- 用户管理 → `/portal/apps/system/org-user/accounts`
- 运营仪表盘 → `/admin`

**教师/建课者：**
- 岗位管理 → `/job/positions`
- 场景管理 → `/scene/`
- 课程管理 → `/lesson/admin/system`
- 测评管理 → `/evaluation/question-banks`
- 资源商城 → `/`

**学生：**
- 我的场景学习 → `/scene/ai-first/approvals/grading`
- 考试中心 → `/evaluation/landing/exams`
- 毕业查询 → `/evaluation/landing/graduation`
- 我的画像 → `/evaluation/landing/portrait`

### 4.3 平台模块配置

在 `app_modules` 表中配置所有子平台的入口信息，`platform_links` 表配置各子平台的访问地址。

---

## Phase 5：部署验证 & 健壮性

### 5.1 更新部署脚本

`deploy.sh` 无需大改（已支持自动迁移），需确认：
- Go 编译能通过所有新增文件
- 前端构建能处理新增依赖（webpack 模式下兼容 `@xyflow/react`、`quill`、`d3`、`xlsx`）
- 数据库迁移顺序正确

### 5.2 补充前端健壮性

各页面添加：
- `loading` 骨架屏
- `error` 错误提示 + 重试按钮
- 空列表提示（`items: []` 而非 `null`）

### 5.3 验证清单

- [ ] 路由命名空间：确认 `/admin`（saas 运营）、`/portal/apps/system`（平台管理）、`/lesson/admin`（课程管理）无冲突
- [ ] 所有迁移文件执行成功
- [ ] Seed 数据包含所有身份类型测试账号
- [ ] 统一登录后能访问所有子平台页面
- [ ] 岗位/场景/课程/测评 CRUD 正常
- [ ] 审批工作流跑通
- [ ] 前端 API 404 检查：确认 Next.js rewrite 将所有 `/api/*` 正确代理到 Go 后端
- [ ] 部署脚本完整通过

---

## 附录 A：DataProvider → 页面级 API 迁移模式

五个源项目中有两个包含 DataProvider（zhiyu-job、zhiyu-evaluation），内部使用 localStorage 维护内存状态。迁移到真实 API 的标准模式如下：

### A.1 改造步骤（每个页面）

1. **识别页面使用的数据源**：找到页面从 DataProvider 中读取的 state，如 `const { positions } = useData()`
2. **创建对应的 API 客户端**：在 `lib/api.ts` 中新增，如 `positionApi.list()`
3. **添加页面级状态**：
   ```tsx
   const [items, setItems] = useState<Position[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   ```
4. **useEffect 加载数据**：
   ```tsx
   useEffect(() => {
     positionApi.list(params).then(res => setItems(res.items)).catch(setError).finally(() => setLoading(false))
   }, [])
   ```
5. **CRUD 操作改为 API 调用 + 本地状态更新**：
   ```tsx
   const handleCreate = async (data) => {
     const created = await positionApi.create(data)
     setItems(prev => [...prev, created])
   }
   ```
6. **处理 loading/error/empty 状态**（参见附录 B）

### A.2 最终移除 DataProvider

当某模块所有页面都已接入 API 后，从 layout.tsx 中移除该模块的 DataProvider 包装。

---

## 附录 B：前端页面状态处理模板

每个接入真实 API 的页面需要处理四种状态：

| 状态 | 条件 | 展示 |
|------|------|------|
| **加载中** | `loading === true` | Skeleton 骨架屏 / Spinner |
| **加载错误** | `error !== null` | 错误提示 + 重试按钮 |
| **空列表** | `!loading && !error && items.length === 0` | 「暂无数据」占位图 + 引导操作 |
| **正常数据** | `!loading && !error && items.length > 0` | 正常渲染列表/表格 |

---

## 附录 C：现有仓库与目标项目的映射关系

| 源项目路径 | 目标路径 | 类型 |
|-----------|---------|------|
| `zhiyu-backend/app/portal/**` | `zhiyu-saas/app/portal/**` | 页面 |
| `zhiyu-backend/components/portal/**` | `zhiyu-saas/components/portal/**` | 组件 |
| `zhiyu-backend/components/admin/header.tsx` | `zhiyu-saas/components/admin/header.tsx` | 组件（追加） |
| `zhiyu-job/app/(admin)/**` | `zhiyu-saas/app/job/**` | 页面（路径前缀变更） |
| `zhiyu-job/components/position-builder/**` | `zhiyu-saas/components/job/position-builder/**` | 组件 |
| `zhiyu-job/components/ability-graph/**` | `zhiyu-saas/components/job/ability-graph/**` | 组件 |
| `zhiyu-job/components/positions/**` | `zhiyu-saas/components/job/positions/**` | 组件 |
| `zhiyu-job/components/ai/**` | `zhiyu-saas/components/job/ai/**` | 组件 |
| `zhiyu-job/public/student*.html` | `zhiyu-saas/public/job/` | 静态资源 |
| `zhiyu-scene/app/**` | `zhiyu-saas/app/scene/**` | 页面（路径前缀变更） |
| `zhiyu-scene/components/scenarios/**` | `zhiyu-saas/components/scene/scenarios/**` | 组件 |
| `zhiyu-scene/components/tasks/**` | `zhiyu-saas/components/scene/tasks/**` | 组件 |
| `zhiyu-scene/components/assessment/**` | `zhiyu-saas/components/scene/assessment/**` | 组件 |
| `zhiyu-scene/components/resources/**` | `zhiyu-saas/components/scene/resources/**` | 组件 |
| `zhiyu-scene/components/ai/**` | `zhiyu-saas/components/scene/ai/**` | 组件 |
| `zhiyu-scene/components/layout/**` | `zhiyu-saas/components/scene/layout/**` | 组件 |
| `zhiyu-lesson/app/admin/**` | `zhiyu-saas/app/lesson/admin/**` | 页面（路径前缀变更） |
| `zhiyu-lesson/app/teacher/**` | `zhiyu-saas/app/lesson/teacher/**` | 页面（路径前缀变更） |
| `zhiyu-lesson/components/KnowledgeGraph.tsx` | `zhiyu-saas/components/shared/knowledge-graph.tsx` | 组件（共享） |
| `zhiyu-lesson/components/shared/**` | `zhiyu-saas/components/shared/**` | 组件（共享） |
| `zhiyu-evaluation/app/**` | `zhiyu-saas/app/evaluation/**` | 页面（路径前缀变更） |
| `zhiyu-evaluation/components/question-banks/**` | `zhiyu-saas/components/evaluation/**` | 组件 |
| `zhiyu-evaluation/components/exams/**` | `zhiyu-saas/components/evaluation/**` | 组件 |
| `zhiyu-evaluation/components/questions/**` | `zhiyu-saas/components/evaluation/**` | 组件 |
| `zhiyu-evaluation/components/certification/**` | `zhiyu-saas/components/evaluation/**` | 组件 |
| `zhiyu-evaluation/components/graduation-project/**` | `zhiyu-saas/components/evaluation/**` | 组件 |
| `zhiyu-evaluation/app/api/**` | `zhiyu-saas/app/api/**` | API Route（注释系统） |

| 维度 | 数量 | 明细 |
|------|------|------|
| 新增数据库表 | **78** | Phase1:20 + Job:10 + Scene:14 + Lesson:10 + Evaluation:24 |
| 新增 Go handler 文件 | **46** | Phase1:12 + Job:7 + Scene:7 + Lesson:7 + Evaluation:13 |
| 新增/扩展前端 API 客户端对象 | **26** | Phase1:10 + Job:4 + Scene:2 + Lesson:2 + Evaluation:8 |
| 复制前端页面 (page.tsx) | **112** | backend:25 + job:12 + scene:18 + lesson:20 + eval:37 |
| 复制 route.ts 文件 | **4** | job:1(learning-route) + evaluation:3(api/\*) |
| 新增 npm 依赖 | **6** | @xyflow/react, quill, react-quill, d3, @types/d3, xlsx |

---

## 执行顺序

```
Phase 1 (数据库 + 用户体系)
    ↓
Phase 2 (前端基础设施: 类型 + API + 组件)
    ↓
Phase 3.1 (zhiyu-backend → portal) ─┐
Phase 3.2 (zhiyu-job → /job)        │
Phase 3.3 (zhiyu-scene → /scene)    ├─ 可并行推进
Phase 3.4 (zhiyu-lesson → /lesson)  │
Phase 3.5 (zhiyu-evaluation → /evaluation) ─┘
    ↓
Phase 3.6 (跨模块共享组件去重 & 统一)
    ↓
Phase 4 (门户整合 + 导航)
    ↓
Phase 5 (部署验证)
```

> **注意**：Phase 3 的五个子阶段可在 Phase 1 + 2 完成后并行推进。Phase 3.6（共享组件去重）需在至少两个子阶段完成后进行。Phase 4 需全部前端页面对接完成后进行。
