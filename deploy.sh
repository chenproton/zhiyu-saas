#!/bin/bash
#
# deploy.sh - 本地构建发布脚本（Next.js 前端 + Go 后端 + PostgreSQL）
#
# 用法：
#   ./deploy.sh                  # 全量部署（前端 + 后端 + 数据库备份）
#   ./deploy.sh --backend-only   # 仅部署后端
#   ./deploy.sh --frontend-only  # 仅部署前端
#   ./deploy.sh --skip-backup    # 跳过数据库备份
#   ./deploy.sh --skip-checks    # 跳过代码检查
#
set -euo pipefail

# ==================== 参数解析 ====================
BACKEND_ONLY=false
FRONTEND_ONLY=false
SKIP_BACKUP=false
SKIP_CHECKS=false
FORCE_INSTALL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend-only|-b)
      BACKEND_ONLY=true
      shift
      ;;
    --frontend-only|-f)
      FRONTEND_ONLY=true
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --skip-checks)
      SKIP_CHECKS=true
      shift
      ;;
    --force-install)
      FORCE_INSTALL=1
      shift
      ;;
    --help|-h)
      echo "用法：$0 [--backend-only|-b] [--frontend-only|-f] [--skip-backup] [--skip-checks] [--force-install]"
      exit 0
      ;;
    *)
      echo "错误：未知参数 $1" >&2
      echo "用法：$0 [--backend-only|-b] [--frontend-only|-f] [--skip-backup] [--skip-checks] [--force-install]" >&2
      exit 1
      ;;
  esac
done

if [[ "$BACKEND_ONLY" == "true" && "$FRONTEND_ONLY" == "true" ]]; then
  echo "错误：--backend-only 和 --frontend-only 不能同时使用" >&2
  exit 1
fi

# ==================== 配置区 ====================
SITE_NAME="saas"
FRONTEND_PORT=3010
BACKEND_PORT=8080

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
STANDALONE_DIR="$PROJECT_ROOT/.next/standalone"
STATIC_DIR="$PROJECT_ROOT/.next/static"
PUBLIC_DIR="$PROJECT_ROOT/public"
SERVER_DIR="$PROJECT_ROOT/.next/server"
BACKEND_DIR="$PROJECT_ROOT/backend"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
BACKEND_BIN="$BACKEND_DIR/bin/server"

# ==================== 加载环境变量 ====================
if [[ -f "$PROJECT_ROOT/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$PROJECT_ROOT/.env"
  set +a
fi

# ==================== 清理函数 ====================
cleanup() {
  rm -rf "$PROJECT_ROOT/.deploy"
}

trap 'cleanup' EXIT

# ==================== 必需变量校验 ====================
REQUIRED_VARS=(DATABASE_URL JWT_SECRET)
for v in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "错误：缺少必需环境变量 ${v}，请在 .env 中配置" >&2
    exit 1
  fi
done

# ==================== 本地依赖检查 ====================
echo "==> 检查本地部署依赖..."
LOCAL_DEPS_OK=true

for dep in pnpm node go pm2 psql; do
  if ! command -v "$dep" > /dev/null 2>&1; then
    echo "错误：本地缺少必需工具 ${dep}，请先安装" >&2
    LOCAL_DEPS_OK=false
  fi
done

if ! command -v pg_dump > /dev/null 2>&1 && [[ "$SKIP_BACKUP" != "true" ]]; then
  echo "错误：本地缺少 pg_dump，无法执行数据库备份（使用 --skip-backup 跳过）" >&2
  LOCAL_DEPS_OK=false
fi

if [[ "$LOCAL_DEPS_OK" != "true" ]]; then
  exit 1
fi

# ==================== 代码检查 ====================
if [[ "$SKIP_CHECKS" != "true" ]]; then
  echo "==> 运行代码检查..."

  if [[ "$FRONTEND_ONLY" != "true" ]]; then
    echo "  Go 编译检查..."
    (cd "$BACKEND_DIR" && go build -o /tmp/zhiyu-server-check ./cmd/server/main.go) || {
      echo "错误：Go 后端编译失败，拒绝部署" >&2
      exit 1
    }
    rm -f /tmp/zhiyu-server-check
  fi

  if [[ "$BACKEND_ONLY" != "true" ]]; then
    echo "  前端类型检查..."
    (cd "$PROJECT_ROOT" && pnpm exec tsc --noEmit) || {
      echo "错误：前端 TypeScript 类型检查未通过，拒绝部署" >&2
      exit 1
    }
  fi
else
  echo "==> 跳过代码检查（--skip-checks）"
fi

cd "$PROJECT_ROOT"

# ==================== 安装前端依赖 ====================
if [[ "$BACKEND_ONLY" != "true" ]]; then
  if [[ ! -d "node_modules" || "$FORCE_INSTALL" == "1" ]]; then
    echo "==> 安装前端依赖..."
    pnpm install --prefer-offline --no-frozen-lockfile
  else
    echo "==> node_modules 已存在，跳过依赖安装（设置 --force-install 可强制重新安装）"
  fi
fi

# ==================== 数据库备份 ====================
if [[ "$SKIP_BACKUP" != "true" && "$FRONTEND_ONLY" != "true" ]]; then
  echo "==> 备份数据库..."
  mkdir -p "$BACKUP_DIR"
  chmod 700 "$BACKUP_DIR"

  BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  BACKUP_FILE="$BACKUP_DIR/zhiyu-saas-backup-${BACKUP_TIMESTAMP}.dump"

  DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^/?]*\)\(?.*\)\?$|\1|p')

  if pg_isready -d "$DATABASE_URL" > /dev/null 2>&1; then
    pg_dump -d "$DATABASE_URL" -Fc -Z 6 > "$BACKUP_FILE.tmp" && mv "$BACKUP_FILE.tmp" "$BACKUP_FILE" && chmod 600 "$BACKUP_FILE" || {
      echo "错误：数据库备份失败" >&2
      rm -f "$BACKUP_FILE.tmp" "$BACKUP_FILE"
      exit 1
    }
    echo "  备份完成: $BACKUP_FILE"

    # 保留最近 14 天的备份
    find "$BACKUP_DIR" -maxdepth 1 -name 'zhiyu-saas-backup-*.dump' -type f -mtime +14 -delete
  else
    echo "  警告：PostgreSQL 未就绪，跳过备份"
  fi
else
  echo "==> 跳过数据库备份"
fi

# ==================== 数据库迁移 ====================
if [[ "$FRONTEND_ONLY" != "true" ]]; then
  echo "==> 执行数据库迁移..."
  (cd "$BACKEND_DIR" && go run ./cmd/migrate/main.go up) || {
    echo "错误：数据库迁移失败" >&2
    exit 1
  }
fi

# ==================== 构建后端 ====================
if [[ "$FRONTEND_ONLY" != "true" ]]; then
  echo "==> 构建 Go 后端..."
  mkdir -p "$BACKEND_DIR/bin"
  go build -C "$BACKEND_DIR" -o "$BACKEND_BIN" ./cmd/server/main.go || {
    echo "错误：Go 后端构建失败" >&2
    exit 1
  }
  echo "  后端二进制: $BACKEND_BIN"
fi

# 在删除 standalone 目录前，先停止前端进程，避免旧进程持有已删除的 inode
if [[ "$BACKEND_ONLY" != "true" ]]; then
  pm2 delete "$SITE_NAME" &>/dev/null || true
fi

# ==================== 构建前端 ====================
if [[ "$BACKEND_ONLY" != "true" ]]; then
  echo "==> 清理旧构建..."
  rm -rf "$STANDALONE_DIR" "$STATIC_DIR" "$SERVER_DIR"

  echo "==> 构建前端（使用 webpack 以绕过 Turbopack standalone 问题）..."
  pnpm exec next build --webpack || {
    echo "错误：前端构建失败" >&2
    exit 1
  }

  echo "==> 组装 standalone 产物..."
  if [[ -d "$SERVER_DIR" ]]; then
    mkdir -p "$STANDALONE_DIR/.next/server"
    rsync -a --delete --exclude="*.map" "$SERVER_DIR/" "$STANDALONE_DIR/.next/server/"
  fi

  if [[ -d "$STATIC_DIR" ]]; then
    mkdir -p "$STANDALONE_DIR/.next/static"
    rsync -a --delete --exclude="*.map" "$STATIC_DIR/" "$STANDALONE_DIR/.next/static/"
  fi

  if [[ -d "$PUBLIC_DIR" ]]; then
    mkdir -p "$STANDALONE_DIR/public"
    rsync -a --delete --exclude="*.map" "$PUBLIC_DIR/" "$STANDALONE_DIR/public/"
  fi
fi

# ==================== PM2 启动 ====================
echo ""
echo "==> 本地 PM2 启动服务..."

# 清理可能存在的残留 PM2 进程和端口占用
if [[ "$FRONTEND_ONLY" != "true" ]]; then
  pm2 delete "zhiyu-backend" &>/dev/null || true
fi
if [[ "$BACKEND_ONLY" != "true" ]]; then
  pm2 delete "$SITE_NAME" &>/dev/null || true
fi

for p in "$FRONTEND_PORT" "$BACKEND_PORT"; do
  PID=$(lsof -t -i:"$p" 2>/dev/null || true)
  if [[ -n "$PID" ]]; then
    echo "  发现端口 $p 被占用，正在清理..."
    kill -9 "$PID" 2>/dev/null || true
  fi
done
sleep 1

# 使用 ecosystem.config.js 启动
pm2 start "$PROJECT_ROOT/ecosystem.config.js" --env production || {
  echo "错误：PM2 启动失败" >&2
  exit 1
}

pm2 save > /dev/null

# ==================== 健康检查 ====================
echo ""
echo "==> 等待服务就绪..."
sleep 3

HEALTH_OK=true

if [[ "$FRONTEND_ONLY" != "true" ]]; then
  if curl -sf "http://127.0.0.1:$BACKEND_PORT/health" > /dev/null 2>&1; then
    echo "  后端健康检查通过: http://127.0.0.1:$BACKEND_PORT/health"
  else
    echo "  错误：后端健康检查失败" >&2
    HEALTH_OK=false
  fi
fi

if [[ "$BACKEND_ONLY" != "true" ]]; then
  if curl -sf -o /dev/null "http://127.0.0.1:$FRONTEND_PORT/login" > /dev/null 2>&1; then
    echo "  前端健康检查通过: http://127.0.0.1:$FRONTEND_PORT/login"
  else
    echo "  错误：前端健康检查失败" >&2
    HEALTH_OK=false
  fi
fi

if [[ "$HEALTH_OK" != "true" ]]; then
  echo ""
  echo "部署完成但健康检查未通过，请查看 PM2 日志：pm2 logs" >&2
  exit 1
fi

echo ""
echo "✨ 本地发布完成！"
echo "   前端访问: http://localhost:$FRONTEND_PORT"
echo "   后端 API: http://localhost:$BACKEND_PORT"
echo ""
