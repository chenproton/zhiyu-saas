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
