# 审计记录

> 本文件记录 `docs/audits/*.md` 中各模块的审查结果与状态变更。
> 按时间倒序排列，最新记录在最上方。

## 记录格式

```markdown
## YYYY-MM-DD 模块名审查

- 审计文档：`docs/audits/<path>.md`
- 审查人：Agent / 协作者名
- 结论：收敛 / 待审查 / 部分收敛
- PASS 检查点数量：N / 总检查点数量：M
- 备注：
  - 发现的问题与新增检查点
  - 需要后续跟进的事项
```

## 记录

### 2026-07-16 组织用户体系打通

- 审计文档：`docs/audits/backend/user-org.md`、`docs/audits/frontend/admin.md`
- 审查人：Agent
- 结论：待审查
- PASS 检查点数量：— / 总检查点数量：—
- 备注：
  - 数据库迁移已补齐 `batches.tenant_id`、`major_id`、外键与触发器；`users.org_node_id` 统一指向组织架构叶子节点（教师→院系/部门，学生→班级）。
  - 后端 batch handler 增加 `orgNodeId`/`majorId` 校验与租户隔离。
  - 共享类型 `JobBatch`/`SceneBatch`/`LessonBatch`/`EvaluationBatch` 增加 `tenantId`/`orgNodeId`/`majorId`。
  - 新增 `useOrgTree`、`OrgNodeSelect`、`MajorSelect`。
  - 前端教师/学生/账户页改用 `/portal/apps/system/org-user/org-structure` 真实组织架构树。
  - `/job/batches`、`/scene/batches`、`/lesson/admin/batches` 新建/编辑批次改为选择真实二级学院与专业。
  - 共建人弹窗按 `user.orgNodeId` 对应的真实组织节点分组。
  - 本地验证通过：`go vet ./...`、`go test ./...`、`go build ./cmd/server/main.go`、`pnpm exec tsc --noEmit`、`pnpm lint`（0 errors）、`pnpm test`。
  - 已变更模块需回归审查，确认数据一致性与权限隔离。

### 2026-07-15 前端基础设施审查

- 审计文档：`docs/audits/frontend/infra.md`
- 审查人：Agent
- 结论：收敛
- PASS 检查点数量：7 / 总检查点数量：7
- 备注：
  - 已将单 Next.js 应用拆分为 `apps/marketplace` 与 `apps/edu`，并建立 `@zhiyu/ui`、`@zhiyu/api-client`、`@zhiyu/shared-types` 共享包。
  - 两个应用均通过 `tsc --noEmit` 与 `next build`。
  - `./deploy.sh` 成功部署两个前端并通过健康检查。
  - 通过 `NEXT_PUBLIC_DEFAULT_PLATFORM` 确保教育管理应用的所有路由使用 portal token，商城应用使用 saas token；edu 应用未登录时统一跳转 `/portal/login`，不会跳转到商城。

### 2026-07-15 部署与运维审查

- 审计文档：`docs/audits/backend/deploy.md`
- 审查人：Agent
- 结论：收敛
- PASS 检查点数量：7 / 总检查点数量：7
- 备注：
  - `ecosystem.config.js` 已更新为管理 `zhiyu-backend`、`zhiyu-marketplace`、`zhiyu-edu` 三个进程。
  - `deploy.sh` 已支持构建并部署两个前端，回滚逻辑已恢复两个 standalone 产物与后端二进制。
