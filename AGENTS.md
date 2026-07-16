# 知育 SaaS 架构收敛契约

> 本文档规定 Agent 与协作者在处理本项目时的审查流程、交付要求、部署运维规范与 AI 协作约定。各模块的具体检查点见 `docs/audits/*.md`。
> 本契约继承原有两条底线：所有修改后必须通过 `deploy.sh` 完成部署验证；每次问题处理/优化后必须执行 git 提交并推送。

## 一、审查流程

1. **检查点独立判定**。每个检查点以 PASS/FAIL 给出结论，不允许多个检查点合并判定。
2. **以业务流程描述为准**。检查点须说清触发条件、输入、关键分支、期望结果。FAIL 时用业务行为描述问题，可附文件路径作为参考；「位置」列只定位到文件，不写行号、函数名、变量名。
3. **新增问题即新增检查点**。审查过程中发现的新问题：若是遗漏 → 在对应审计文档中新增检查点；若是理解偏差 → 纠正判定结果并记录原因。
4. **通过标准**。审计文档中实际列出的检查点全部 PASS，且实现符合该文档中声明的核心决策。
5. **审查记录隔离**。审查结果写入 `docs/audits/AUDIT_RECORDS.md`，不在审计文档正文中内联记录。
6. **日志关键字同步**。新增带 `alert:` 前缀的 `slog.ErrorContext` 日志时，必须在对应模块审计文档中记录该关键字；普通 error log 不强制记录。
7. **代码变更触发回归**。已收敛模块的代码发生变更时自动回归「待审查」状态。可豁免的变更仅限于：注释增删/修正、代码格式化、import 分组排序、字符串字面量拼写修正、日志文案调整。任何改变控制流、阈值、锁策略、API 行为或数据语义的变更均不免除。

## 二、收敛判定标准

模块满足以下条件视为已收敛：

1. 该模块审计清单中所有检查点 PASS。
2. 实现符合审计文档中声明的核心决策。
3. commit/PR 描述说明以下三点：
   - 保证什么（正常路径的行为承诺）；
   - 容忍什么异常（可接受的失败模式与降级行为）；
   - 用户是否需要重新登录/重启/刷新页面才能恢复。

## 三、交付要求

1. **部署验证**。所有修改后，必须通过 `deploy.sh` 完成部署验证，确保脚本一次性将所有代码变动更新到运行环境，禁止手动登录远程服务器改代码。根据变更范围选择参数：
   - 仅前端变更：`./deploy.sh --frontend-only`
   - 仅后端变更：`./deploy.sh --backend-only`
   - 前后端均变更：`./deploy.sh`
   - 跳过数据库备份（仅用于开发环境重复验证）：`./deploy.sh --skip-backup`
   - 跳过代码检查（不推荐，仅紧急回滚）：`./deploy.sh --skip-checks`

2. **提交前检查**。代码提交/部署前必须通过以下检查：
   - 后端：`go vet ./...`、`go test ./...`、`go build ./cmd/server/main.go`
   - 前端：`pnpm exec tsc --noEmit`、`pnpm lint`、`pnpm test`
   - 数据库迁移文件：每个 `.up.sql` 必须配对 `.down.sql`（可选补丁除外），且不得破坏已有数据

3. **文档变更独立提交**。修改 `AGENTS.md` 或任何 `docs/audits/*.md` 必须独立 commit，禁止在代码 fix 中顺手修改。核心决策写在对应模块审计文档里，变更核心决策必须同步更新对应审计文档。

4. **版本控制**。每次完成一次问题处理/优化后，必须执行 git 提交并推送，保持代码仓库与线上环境一致。单次 commit 只包含与当次任务直接相关的变更。

## 四、审计文档目录

### 后端

| 模块 | 审计文档 | 说明 |
|------|---------|------|
| 认证与会话 | `docs/audits/backend/auth.md` | JWT、登录、权限中间件 |
| 用户与机构管理 | `docs/audits/backend/user-org.md` | 用户、角色、租户、机构 |
| 职位管理 | `docs/audits/backend/job.md` | 职位 CRUD、筛选、高级查询 |
| 场景管理 | `docs/audits/backend/scene.md` | 场景、批次、AI 评分 |
| 课程管理 | `docs/audits/backend/lesson.md` | 课程、课件、学习路径 |
| 评测管理 | `docs/audits/backend/evaluation.md` | 评测、试卷、评分 |
| 资源与订单 | `docs/audits/backend/resource-order.md` | 资源、购买、订单、钱包 |
| 数据访问层 | `docs/audits/backend/data-layer.md` | repository、pgx、事务 |
| HTTP 层与路由 | `docs/audits/backend/http-layer.md` | handler、router、中间件 |
| 部署与运维 | `docs/audits/backend/deploy.md` | migrations、PM2、健康检查 |

### 前端

| 模块 | 审计文档 | 说明 |
|------|---------|------|
| 前端基础设施 | `docs/audits/frontend/infra.md` | 路由、API 封装、状态、主题 |
| 认证与登录 | `docs/audits/frontend/auth.md` | 登录页、会话、权限控制 |
| 管理后台 | `docs/audits/frontend/admin.md` | admin 模块、机构/用户管理 |
| 门户页 | `docs/audits/frontend/portal.md` | portal 首页、落地页 |
| 职位模块 | `docs/audits/frontend/job.md` | 职位列表、详情、创建/编辑 |
| 场景模块 | `docs/audits/frontend/scene.md` | 场景列表、AI 对话、评分 |
| 课程模块 | `docs/audits/frontend/lesson.md` | 课程列表、学习、课件 |
| 评测模块 | `docs/audits/frontend/evaluation.md` | 评测列表、考试、结果 |
| 资源与订单 | `docs/audits/frontend/resource-order.md` | 资源中心、已购、订单、钱包 |

### 审计记录

| 模块 | 审计文档 |
|------|---------|
| 审计记录 | `docs/audits/AUDIT_RECORDS.md` |

## 五、部署说明

1. **环境变量与密钥管理**

   部署所需的环境变量与密钥请勿提交到版本仓库。本地开发/部署时，在仓库根目录维护 `.env`（已加入 `.gitignore`），或在服务器环境变量中配置。

   必需变量：
   - `DATABASE_URL`：PostgreSQL 连接串
   - `JWT_SECRET`：JWT 签名密钥
   - `PORT`：后端服务端口（默认 8080）

2. **数据库 migration**

   每个 migration 必须提供可回滚的 `.down.sql`、不得破坏已有数据、须与代码变更在同一 PR/提交中审查。`deploy.sh` 默认先执行 migration 再构建部署；回滚时先执行 down migration 回滚 schema，再部署旧代码。

3. **回滚**

   生产部署失败或发现严重缺陷时，切换到上一个已验证的 Git commit/tag，然后执行 `./deploy.sh` 重新部署。禁止手动登录服务器改代码回滚。

4. **多服务约束**

   后端服务与前端服务不得依赖共享内存同步状态；跨进程清理、通知必须通过数据库/Redis/显式 API 等机制完成。

5. **部署模式隔离**

   `deploy.sh` 支持三种部署模式，各模式只执行自身领域所需步骤，不操作无关服务：

   - **`--frontend-only`**：跳过数据库备份额检查、`DATABASE_URL`/`JWT_SECRET` 校验、Go 编译检查、后端二进制构建与交换、数据库迁移。依赖检查只要求 `pm2` + `pnpm` + `node`。PM2 只启 `zhiyu-marketplace` 和 `zhiyu-edu`，不动后端进程。
   - **`--backend-only`**：跳过 `pnpm`/`node` 依赖检查、`node_modules` 安装、前端构建与 `assemble_standalone`。PM2 只启 `zhiyu-backend`，不动前端进程。
   - **全量部署**（不带参数）：执行完整流程。

   回滚快照中前端 standalone 产物使用 `mv` 而非 `cp -a` 保存（同文件系统，零 I/O 开销），因此每次部署前端时旧版产物会被移走而非复制；回滚时自动移回。构建失败也会自动触发回滚恢复旧版服务。

## 六、运维操作

### 6.1 查看服务状态与日志

```bash
# 查看 PM2 管理的进程
pm2 status

# 查看后端日志
pm2 logs zhiyu-backend --lines 100

# 查看前端日志
pm2 logs saas --lines 100

# 查看所有日志（最近 30 分钟）
pm2 logs --lines 500 | tail -n 200
```

### 6.2 健康检查

```bash
# 后端健康检查
curl -sf http://127.0.0.1:8080/health

# 前端登录页可访问性检查
curl -sf -o /dev/null http://127.0.0.1:3010/login
```

### 6.3 连接生产数据库

```bash
# 使用 .env 中的 DATABASE_URL
psql "$DATABASE_URL"
```

生产环境密码由环境变量控制，禁止将密码写入仓库。

### 6.4 回滚部署

参见 [五、部署说明](#五部署说明) 中的回滚条款。回滚完成后确认服务状态：

```bash
pm2 status
pm2 logs zhiyu-backend --lines 50
pm2 logs saas --lines 50
```

## 七、AI 协作者约定

1. 每次修改仅处理与当次任务直接相关的文件，不触碰无关文件。
2. 工作区存在其他 Agent 的未提交修改时，不得还原、覆盖或混入本次提交。
3. 非当次任务相关的文件变更，应忽略并保持原状。
4. 未经用户确认，不得主动执行 `./deploy.sh` 或任何部署操作。
5. 完成修改后，先本地验证（编译、类型检查、测试、lint），再提请用户确认是否需要部署。
6. **禁止无头浏览器自动视觉验证**。未经用户明确要求，不得调用 `chromium-browser`、`chrome --headless`、Puppeteer、Playwright 等工具进行页面渲染、截图或样式断言。所有布局、视觉表现、像素级样式是否正确，必须由用户人工确认，Agent 只做源码级与静态检查。
