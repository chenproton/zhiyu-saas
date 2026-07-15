# 前端基础设施审计

## 核心决策

- 采用 **pnpm workspace monorepo**：仓库内包含两个独立的 Next.js 应用：
  - `@zhiyu/marketplace`：资源共享商城 + 运营后台，监听端口 `3010`。
  - `@zhiyu/edu`：教育教学管理后台（Portal、Job、Scene、Lesson、Evaluation），监听端口 `3020`。
- 共享 packages：
  - `@zhiyu/ui`：shadcn/ui 组件、Tailwind 全局样式、`cn` 工具函数。
  - `@zhiyu/api-client`：前端 API 封装、平台判断、双 token 管理。
  - `@zhiyu/shared-types`：前后端共享 TypeScript 类型。
- 两个前端共用同一后端服务（`http://127.0.0.1:8080`），通过 Next.js `rewrites` 代理 `/api/*`。
- 鉴权保持双 token：
  - 商城与运营后台使用 `saas` 平台 token，存储键 `zhiyu-token`，登录入口 `/login`。
  - 教育管理使用 `portal` 平台 token，存储键 `zhiyu-portal-token`，登录入口 `/portal/login`。
- 通过 `NEXT_PUBLIC_DEFAULT_PLATFORM` 环境变量为每个应用指定默认平台，避免按路径判断导致 `/job/*`、`/scene/*` 等非 `/portal` 路径误用 saas token。

## 目录结构

```
/root/projects/zhiyu-saas
├── apps/
│   ├── marketplace/          # 商城 + 运营后台
│   └── edu/                  # 教育管理后台
├── packages/
│   ├── ui/                   # 共享 UI 组件库
│   ├── api-client/           # 共享 API 客户端
│   └── shared-types/         # 共享类型
├── backend/                  # Go 后端（不变）
├── deploy.sh                 # 双前端部署脚本
└── ecosystem.config.js       # PM2 三进程配置
```

## 检查点

| 检查点 | 结论 | 说明 |
|---|---|---|
| pnpm-workspace.yaml 配置 | PASS | `apps/*` 与 `packages/*` 均纳入 workspace |
| 共享包类型检查 | PASS | `pnpm -r typecheck` 通过 |
| 应用类型检查 | PASS | 两个应用的 `tsc --noEmit` 通过 |
| 应用构建 | PASS | `pnpm build:marketplace` 与 `pnpm build:edu` 通过 |
| 别名映射 | PASS | `@/components/ui/*`、`@/lib/api`、`@/lib/types/*` 指向共享包 |
| 部署脚本 | PASS | `./deploy.sh` 构建并启动两个前端，健康检查通过 |
| 健康检查 | PASS | `http://127.0.0.1:3010/login` 与 `http://127.0.0.1:3020/portal/login` 可访问 |

## 风险与约束

- 两个应用仍共用同一后端与数据库，安全边界依赖 JWT 中的 `platform` 与 `identity_type_code`/角色权限。
- `@zhiyu/ui` 组件库变更需同时保证商城与教育管理应用可用。
- 静态资源按应用拆分，公共资源建议放后端 CDN 或 `@zhiyu/ui/public`。
