# 部署与运维审计

## 核心决策

- 后端保持单一 Go 服务，监听 `8080`，为两个前端提供统一 `/api/v1` API。
- PM2 管理三个进程：
  - `zhiyu-backend`：Go 服务，端口 `8080`。
  - `zhiyu-marketplace`：商城前端 standalone，端口 `3010`。
  - `zhiyu-edu`：教育管理前端 standalone，端口 `3020`。
- `deploy.sh` 部署流程：
  1. 创建回滚快照（后端二进制 + 两个前端 standalone 产物）；快照按数量保留（`ROLLBACK_KEEP`，默认 10 个），创建新快照后自动删除最旧的超额快照。
  2. 代码检查：`go build` + 两个前端 `tsc --noEmit`。
  3. 构建后端、商城前端、教育管理前端。
  4. 组装每个前端的 standalone 产物（复制 `.next/server`、`.next/static`、`public`）。
  5. 优雅停止旧服务，原子切换后端二进制。
  6. 执行数据库迁移。
  7. PM2 启动三个进程。
  8. 健康检查：后端 `/health`、商城 `/login`、教育管理 `/portal/login`。
  9. 失败时回滚：停止当前进程，恢复后端二进制与两个 standalone 产物，重新启动。

## 检查点

| 检查点 | 结论 | 说明 |
|---|---|---|
| Go 编译 | PASS | `go build -o bin/server ./cmd/server/main.go` 通过 |
| Go 测试 | PASS | `go test ./...` 通过 |
| 部署脚本执行 | PASS | `./deploy.sh --skip-backup` 成功启动三个服务 |
| 后端健康检查 | PASS | `http://127.0.0.1:8080/health` 返回 `{"status":"ok"}` |
| 商城健康检查 | PASS | `http://127.0.0.1:3010/login` 返回 200 |
| 教育管理健康检查 | PASS | `http://127.0.0.1:3020/portal/login` 返回 200 |
| 回滚逻辑 | PASS | `restore_rollback` 会先 `pm2 stop/delete all` 再恢复产物 |

## 环境变量

- `DATABASE_URL`：PostgreSQL 连接串。
- `JWT_SECRET`：JWT 签名密钥。
- `PORT` / `BACKEND_PORT`：后端端口（默认 8080）。
- `MARKETPLACE_PORT`：商城前端端口（默认 3010）。
- `EDU_PORT`：教育管理前端端口（默认 3020）。

## 风险与约束

- 两个前端共用同一数据库 schema，若未来需要完全独立部署，需引入 API Gateway 或拆分服务。
- 回滚仅恢复代码产物，若本次部署已应用新的数据库 migration，schema 可能需要手动 down migration。
