# 演示前端项目改造为后端 + 数据库系统方案

> 适用对象：当前以纯前端演示为主的项目（如 zhiyu-job 等 8 个项目），希望改造成具备真实后端服务 + PostgreSQL 数据库的可用系统。
>
> 参考示例：zhiyu-saas 的改造过程。
>
> 目标：让 AI 能够理解并复用该过程，批量改造其他项目。

---

## 一、目标架构

### 技术栈（统一）

| 层级 | 技术 |
|------|------|
| 前端 | 保持现有技术栈（Next.js + React + TypeScript + Tailwind） |
| 后端 | Go 1.22+ + chi/v5 + pgx/v5 |
| 数据库 | PostgreSQL 15+ |
| 部署 | 本机 PostgreSQL + PM2 跑前后端 + 演示站只部署前端 |
| 迁移 | 自定义 Go migrate 脚本（或 golang-migrate） |

### 改造原则

1. **最小侵入**：尽量不动前端 UI 结构和样式，只把数据来源从 mock 换成 API。
2. **统一登录**：所有项目共用同一套用户/登录/鉴权模型。
3. **先跑起来**：初期只实现账号密码登录，暂不做真实文件上传、微信支付等复杂功能。
4. **一个项目一个仓库**：后端代码放在 `backend/` 目录下，与前端同仓库。
5. **保留前端常量**：固定不变的字典枚举（品类、状态、标签池）可先保留在前端，减少初期数据库表数量。

---

## 二、两类数据的处理原则

改造前必须分清：**动态业务数据** 和 **静态字典/枚举数据**。

### 1. 动态业务数据 → 必须存数据库

每个项目、每个用户看到的内容不同，必须持久化：

- 用户账号、登录凭证
- 机构/租户信息
- 业务主体（岗位、资源、课程、批次等）
- 订单、审批、申请记录
- 收藏、授权、提现等用户行为数据

### 2. 静态字典/枚举数据 → MVP 阶段可先放前端

变动频率极低、业务定义好的字典，可以先保留在前端常量中：

- 资源品类：`course`、`post`、`scene`、`assessment`、`material`
- 岗位状态：`draft`、`pending`、`approved`、`rejected`、`published`
- 用户角色：`admin`、`builder`、`reviewer`、`student`
- 难度等级、专业标签池等

#### 为什么可以先放前端？

1. **变动频率极低**：通常是业务定好后几个月不变。
2. **减少数据库表和 API**：MVP 阶段没必要为每个下拉框都建表。
3. **改造速度快**：先把核心流程跑起来。
4. **后续迁移成本低**：等需要后台配置时，再改成数据库表 + 管理接口即可。

#### 什么时候必须移到数据库？

- 需要后台管理员动态配置
- 不同租户/项目看到不同选项
- 需要多语言翻译
- 经常新增/修改

> 以 zhiyu-saas 为例：`lib/mock-data.ts` 里保留了 `RESOURCE_CATEGORIES`、`MAJOR_TAGS`、`EDUCATION_LEVELS` 等常量，但资源记录、订单、用户全部改为 API 从数据库读取。

---

## 三、改造前评估（以 zhiyu-job 为例）

在动手改造前，先扫描项目结构：

### 1. 现有 Auth 状态

- 是否已有 `AuthProvider` / `useAuth`？
- 是否已有 `DataProvider` / `useData`？
- 登录是真实表单还是仅角色切换按钮？
- 是否默认自动登录某个角色？（如 zhiyu-job 默认以 admin 登录）

**处理方式**：不要完全删除现有 Context，而是把其中的 mock 数据读取替换为真实 API 调用。例如：

- `login(role)` → `authApi.login({ username, password })`
- `user = mockUsers.find(...)` → `user = authApi.me()`
- 删除默认自动登录逻辑

### 2. 现有路由结构

- 是否使用 Next.js Route Groups，如 `(admin)` / `(student)`？
- 每个 route group 是否有自己的 `layout.tsx`？

**处理方式**：

- 如果 route group 已有 layout，可把 `DashboardLayout` / 鉴权逻辑放在 group layout 里，而不是每个 page 重复引入。
- 这样不同角色进入不同 route group，结构更清晰。

### 3. 现有 mock 数据组织

- 数据是集中在 `lib/mock-data.ts` 还是分散在 `lib/mock-data/*.ts`？
- 是否已有 `lib/types.ts` 定义类型？

**处理方式**：

- `types.ts` 通常可以直接复用，作为前端类型和后端 domain 类型的参考。
- 把 mock 数据中的**动态记录**迁移到 seed 脚本，**静态常量**保留在前端。

### 4. 现有 DataProvider 中的 CRUD

如果项目已有 `DataProvider` 集中管理所有 mock CRUD（如 zhiyu-job 的 `addPosition`、`updateBatch` 等）：

- 不要一次性全部替换，先保留 DataProvider 作为 UI 状态管理层。
- 在 DataProvider 内部，把 `setState` 操作替换为 API 调用，成功后再更新本地状态。
- 等所有模块都接完 API 后，再逐步移除 DataProvider，改为各页面自己调用 API。

---

## 四、改造阶段

### Phase 1：搭建后端骨架

在现有项目根目录新建 `backend/`：

```
backend/
├── cmd/
│   ├── server/main.go      # HTTP 服务入口
│   └── migrate/main.go     # 数据库迁移命令
├── internal/
│   ├── config/             # 配置读取（DATABASE_URL, JWT_SECRET, PORT）
│   ├── db/                 # pgx 连接池封装
│   ├── domain/             # 实体结构体
│   ├── handler/            # HTTP 处理器
│   ├── middleware/         # JWT、CORS、日志、恢复、超时
│   └── router/             # chi 路由注册
├── migrations/
│   └── 001_initial_schema.up.sql
├── go.mod
└── go.sum
```

关键步骤：

1. `go mod init github.com/zhiyu-xxx/backend`
2. 引入 `github.com/go-chi/chi/v5`、`github.com/jackc/pgx/v5`、`github.com/golang-jwt/jwt/v5`、`golang.org/x/crypto/bcrypt`
3. 实现 `config.Load()` 读取 `.env`
4. 实现 `db.New(databaseURL)` 返回 `*pgxpool.Pool`
5. 实现通用中间件：RequestID、RealIP、Logger、Recoverer、Timeout(30s)、CORS
6. 实现 `respondJSON` / `respondError` 辅助函数

### Phase 2：统一用户登录体系

所有项目改造时，优先把登录体系做成一致的。

#### 数据库表

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID,
    role VARCHAR(20) NOT NULL,      -- 根据项目定义：operator / school / enterprise / admin / builder / reviewer / student
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 后端接口

- `POST /api/v1/auth/login`：账号密码登录，返回 JWT
- `GET /api/v1/auth/me`：返回当前用户 + 关联机构信息
- `DELETE /api/v1/auth/logout`：前端清除 token 即可，后端可选黑名单

#### 前端对接

1. 在 `lib/api.ts` 增加 `authApi.login` / `authApi.me`
2. 改造现有 `AuthProvider`：
   - 移除 `mockUsers.find(...)`
   - 改为调用 `authApi.me()`
   - 提供 `refresh()` 方法供登录后刷新
3. 登录页：
   - 如果已有真实表单，把 `login(role)` 改为 `authApi.login({ username, password })`
   - 如果没有登录页（只有角色切换），新增 `/login` 页面
4. 删除默认自动登录逻辑

### Phase 3：数据库迁移与种子数据

#### 迁移脚本

每个项目创建 `backend/migrations/001_initial_schema.up.sql`，包含：

- 用户表
- 项目业务表（根据项目需求）
- 平台配置表（如 `platform_configs`）
- 必要索引

迁移命令：

```bash
cd backend && go run ./cmd/migrate/main.go up
```

#### 种子数据

创建 `backend/cmd/seed/main.go`，初始化：

- 测试账号（覆盖项目所有角色）
- 演示业务数据
- 平台配置

使用 `INSERT ... ON CONFLICT DO UPDATE`，可重复执行。

### Phase 4：按业务模块实现 API

#### 通用模式

每个业务模块按以下模式实现：

1. **Domain**：定义结构体
2. **Handler**：实现 List / Get / Create / Update / Delete / 状态变更
3. **Router**：注册路由，注意 chi 参数使用 `{id}` 而非 `:id`
4. **Frontend**：在 `lib/api.ts` 增加方法，页面 `useEffect` 调用

#### 列表接口注意事项

- 返回 `{"items": [], "total": 0}`，空结果用 `make([]T, 0)` 避免 `null`
- 支持分页：`limit` / `offset`
- 支持过滤：`status`、`type`、`search`
- 非运营角色只能看到与自己机构相关的数据

#### 权限控制

- `operator` / `admin`：平台运营，看所有
- 普通角色：只看自己机构的
- 匿名用户（公开页面）：只看 `published` 状态

### Phase 5：前端页面接入真实 API

#### 策略

1. 保留 `lib/mock-data.ts` 或 `lib/mock-data/*.ts` 中的**静态常量**（品类、状态、角色、标签池）
2. 删除所有从 mock 读取**动态记录**的代码
3. 每个页面添加 `useState` + `useEffect`，调用 `xxxApi.list()` / `xxxApi.get()`
4. 添加 `loading` / `error` 状态
5. 表单提交改为 `xxxApi.create()` / `xxxApi.update()`

#### 处理现有 DataProvider

如果项目已有集中式 DataProvider：

1. 保留 Provider 结构，把内部操作改为 API 调用
2. 例如 `addPosition` 改为：
   ```ts
   const addPosition = async (position) => {
     const created = await positionApi.create(position)
     setPositions(prev => [...prev, created])
     return created
   }
   ```
3. 等所有模块改造完成后，再评估是否保留 DataProvider 或改为页面级 API 调用

#### 避免全屏刷新

- 使用 Next.js `Link` 做客户端导航
- 把用户信息获取放到全局 `AuthProvider`，不要让每个页面都重新请求 `/auth/me`
- `DashboardLayout` / group layout 读取全局 Context，而不是自己发请求

### Phase 6：部署脚本

#### deploy.sh（本地全量部署）

功能：

1. 加载 `.env`
2. 检查依赖：`pnpm`, `node`, `go`, `pm2`, `psql`, `pg_dump`
3. 代码检查：Go 编译 + TypeScript 类型检查（可 `--skip-checks`）
4. 数据库备份：`pg_dump` 到 `backups/`
5. 数据库迁移：`go run ./cmd/migrate/main.go up`
6. 构建后端：`go build -o backend/bin/server ./cmd/server/main.go`
7. 构建前端：`pnpm exec next build --webpack`
8. 组装 standalone 产物
9. PM2 重启前后端
10. 健康检查

#### deploydemo.sh（演示站只部署前端）

功能：

1. 本地构建前端，API 代理指向远程后端 `DEMO_API_URL`
2. `rsync` 上传到演示服务器 `/var/www/saas`
3. 远程删除旧 `saas` 服务，确保只保留一个
4. 远程 `pm2 start ecosystem.config.js`
5. 健康检查

---

## 五、改造检查清单（Checklist）

每个项目改造时按此检查：

### 后端

- [ ] `backend/` 目录结构创建
- [ ] `go.mod` 初始化并引入 chi / pgx / jwt / bcrypt
- [ ] `.env` 配置 `DATABASE_URL` / `JWT_SECRET` / `PORT`
- [ ] 数据库连接池封装
- [ ] chi 路由 + 中间件（CORS、日志、恢复、超时、JWT）
- [ ] 迁移系统 `cmd/migrate/main.go`
- [ ] 用户表 + 登录/鉴权接口
- [ ] 种子脚本 `cmd/seed/main.go`
- [ ] 业务 API 按模块实现
- [ ] 所有列表接口返回空数组而非 null
- [ ] chi 路由参数使用 `{id}` 写法

### 前端

- [ ] 评估现有 `AuthProvider` / `DataProvider`，决定改造方式
- [ ] `lib/api.ts` 增加 authApi 和业务 API
- [ ] 改造 `AuthProvider`：移除 mock 用户，改为真实 API
- [ ] 新增/改造登录页，删除默认自动登录
- [ ] 各页面 `useEffect` 调用 API 替换 mock 数据
- [ ] 使用 `Link` 而非 `<a>` 或 `window.location.href`
- [ ] 表单提交调用 API
- [ ] 保留静态常量，删除动态 mock 数据函数

### 部署

- [ ] `deploy.sh` 能同时更新前后端 + 备份数据库
- [ ] `deploydemo.sh` 只部署前端到演示站
- [ ] 本地和演示站健康检查通过

---

## 六、zhiyu-saas 改造示例摘要

### 改造前

- 前端：Next.js 演示项目，数据全部来自 `lib/mock-data.ts`
- 后端：无
- 数据库：无

### 改造后

- 前端：保留 Next.js UI，数据来自 `http://localhost:8080/api/v1`
- 后端：Go + chi + pgx，端口 8080
- 数据库：本机 PostgreSQL
- 部署：
  - 本地：`./deploy.sh`
  - 演示：`./deploydemo.sh`

### 关键修复点

1. **路由 404**：chi 参数从 `:id` 改为 `{id}`
2. **空列表 null**：所有 `var items []T` 改为 `make([]T, 0)`
3. **匿名访问 panic**：`resourceHandler.List` 处理 `claims == nil`
4. **全屏刷新**：把 `DashboardLayout` 里的 `/auth/me` 请求上提到全局 `AuthProvider`

---

## 七、zhiyu-job 类项目的特殊注意点

以 zhiyu-job 为例，改造时要特别注意：

### 1. 已有 AuthProvider / DataProvider

不要新建，而是改造现有文件：

- `lib/stores/auth-context.tsx`：把 mock 用户读取改为 `authApi.me()`
- `lib/stores/data-context.tsx`：把内部 `setState` 操作逐步替换为 API 调用

### 2. 默认自动登录

zhiyu-job 当前默认以 admin 自动登录。改造时必须删除这个逻辑，改为：

- 无 token 时跳转到 `/login`
- 登录成功后写入 token

### 3. Route Groups 布局

zhiyu-job 已有 `(admin)` 和 `(student)` route groups：

- 可在 `app/(admin)/layout.tsx` 中放置 admin 侧边栏 + 鉴权
- 在 `app/(student)/layout.tsx` 中放置 student 导航 + 鉴权
- 避免每个 page 重复引入布局组件

### 4. 角色差异

zhiyu-job 角色：`admin`、`builder`、`reviewer`、`student`

- admin / builder / reviewer 可共用 admin 后台
- student 走学生端
- 后端权限判断时按项目实际角色定义

### 5. 业务模块映射

zhiyu-job 的主要业务模块：

| 前端 mock | 后端对应 |
|-----------|---------|
| positions | position API |
| batches | batch API |
| workflows | workflow API |
| abilities | ability API |
| approvals | approval API |
| recommendations | recommendation API |
| users | auth / user API |

---

## 八、给 AI 的执行指令模板

当需要改造一个新项目（如 zhiyu-job）时，可以按以下指令交给 AI：

```
请把 [项目名] 从纯演示前端改造为后端 + 数据库系统。

约束：
- 前端保持现有技术栈不变
- 后端使用 Go + chi/v5 + pgx/v5 + PostgreSQL
- 后端目录放在 backend/
- 先实现统一用户登录体系
- 其他业务页面按模块逐个接入真实 API
- 不要改动 UI 结构和样式
- 文件上传暂时只用 URL 字符串
- 部署使用本机 PostgreSQL + PM2，演示站只部署前端
- 固定字典枚举可先保留在前端常量中，动态业务数据必须入数据库

参考 docs/transformation-plan.md 和 zhiyu-saas 的 backend/、lib/api.ts、components/auth-provider.tsx。

改造前请先评估：
1. 是否已有 AuthProvider / DataProvider？
2. 是否使用 route groups？
3. mock 数据如何组织？
4. 有哪些业务模块需要改造？

步骤：
1. 分析项目现有页面和数据结构
2. 设计数据库表
3. 搭建后端骨架
4. 实现登录体系（改造现有 AuthProvider 或新建）
5. 按模块实现 API
6. 前端页面接入 API
7. 编写 deploy.sh 和 deploydemo.sh
8. 本地部署并验证
```

---

## 九、注意事项

1. **不要一开始就追求完美**：先让登录 + 一个核心模块跑通，再补全其他页面。
2. **mock-data 不要全删**：保留静态常量（枚举、标签、品类名），删除动态数据函数。
3. **路由参数**：chi v5 在 App Router + standalone 场景下，`{id}` 比 `:id` 更稳定。
4. **列表空数据**：Go 的 `var s []T` JSON 序列化为 `null`，前端 `.map()` 会报错，统一用 `make([]T, 0)`。
5. **演示站**：只传前端，API 通过 Next.js rewrite 回源到主服务器后端。
6. **备份**：每次 `deploy.sh` 先用 `pg_dump` 备份，保留 14 天。
7. **已有 Context 的项目**：优先改造现有 `AuthProvider` / `DataProvider`，不要另起炉灶。
