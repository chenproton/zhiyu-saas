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
SERVER_DIR="$PROJECT_ROOT/.next/server"
PUBLIC_DIR="$PROJECT_ROOT/public"
BACKEND_DIR="$PROJECT_ROOT/backend"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
BACKEND_BIN="$BACKEND_DIR/bin/server"
BACKEND_BIN_NEW="$BACKEND_DIR/bin/server.new"
ROLLBACK_DIR="$PROJECT_ROOT/.rollback"
DEPLOY_TMP_DIR="$PROJECT_ROOT/.deploy"

# ==================== 加载环境变量 ====================
if [[ -f "$PROJECT_ROOT/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$PROJECT_ROOT/.env"
  set +a
fi

# ==================== 清理函数 ====================
cleanup() {
  rm -rf "$DEPLOY_TMP_DIR"
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

# ==================== 辅助函数 ====================

# 获取当前 Git commit
get_git_commit() {
  git -C "$PROJECT_ROOT" rev-parse --short HEAD 2>/dev/null || echo "unknown"
}

# 获取已应用的 migration 版本列表
get_applied_migrations() {
  psql "$DATABASE_URL" -t -A -c "SELECT version FROM schema_migrations ORDER BY version;" 2>/dev/null || true
}

# 创建部署快照
save_snapshot() {
  local snapshot_dir="$1"
  mkdir -p "$snapshot_dir"
  cat > "$snapshot_dir/snapshot.json" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "git_commit": "$(get_git_commit)",
  "mode": "$2",
  "applied_migrations_before": [
$(get_applied_migrations | sed 's/^/    "/; s/$/",/' | sed '$ s/,$//')
  ]
}
EOF
}

# 等待服务端口释放
wait_for_port_release() {
  local port="$1"
  local timeout="${2:-10}"
  local elapsed=0
  while [[ $elapsed -lt $timeout ]]; do
    if ! lsof -ti:"$port" > /dev/null 2>&1; then
      return 0
    fi
    sleep 1
    ((elapsed++)) || true
  done
  return 1
}

# 健康检查（带重试）
health_check() {
  local url="$1"
  local max_attempts="${2:-12}"
  local interval="${3:-2}"
  local attempt=0
  while [[ $attempt -lt $max_attempts ]]; do
    if curl -sf -o /dev/null "$url" > /dev/null 2>&1; then
      return 0
    fi
    sleep "$interval"
    ((attempt++)) || true
  done
  return 1
}

# 从快照回滚二进制/产物
restore_rollback() {
  local snapshot_dir="$1"
  echo ""
  echo "==> 部署失败，开始回滚..."

  if [[ -f "$snapshot_dir/server" ]]; then
    echo "  恢复后端二进制..."
    cp "$snapshot_dir/server" "$BACKEND_BIN"
  fi

  if [[ -d "$snapshot_dir/standalone" ]]; then
    echo "  恢复前端 standalone 产物..."
    rm -rf "$STANDALONE_DIR"
    cp -a "$snapshot_dir/standalone" "$STANDALONE_DIR"
  fi

  echo "  重启旧版本服务..."
  pm2 start "$PROJECT_ROOT/ecosystem.config.js" --env production || true
  sleep 3

  local rollback_ok=true
  if [[ "$FRONTEND_ONLY" != "true" ]]; then
    if health_check "http://127.0.0.1:$BACKEND_PORT/health"; then
      echo "  后端回滚后健康检查通过"
    else
      echo "  错误：后端回滚后健康检查失败" >&2
      rollback_ok=false
    fi
  fi

  if [[ "$BACKEND_ONLY" != "true" ]]; then
    if health_check "http://127.0.0.1:$FRONTEND_PORT/login"; then
      echo "  前端回滚后健康检查通过"
    else
      echo "  错误：前端回滚后健康检查失败" >&2
      rollback_ok=false
    fi
  fi

  if [[ "$rollback_ok" == "true" ]]; then
    echo "  ✨ 回滚完成，服务已恢复到部署前状态"
  else
    echo "  ⚠️ 回滚后服务仍未恢复，请手动检查 PM2 日志" >&2
  fi

  echo ""
  echo "⚠️  注意：如果本次部署应用了新的数据库 migration，代码已回滚但 schema 可能仍处在新版本。" >&2
  echo "    请检查 $snapshot_dir/snapshot.json 中的 applied_migrations_before，必要时手动执行对应 down migration。" >&2

  # 清理临时产物
  rm -f "$BACKEND_BIN_NEW" "$BACKEND_DIR/bin/server.prev"
  rm -rf "$STANDALONE_DIR.new" "$STANDALONE_DIR.prev"
}

# ==================== 创建回滚快照 ====================
echo "==> 创建部署回滚快照..."
SNAPSHOT_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SNAPSHOT_DIR="$ROLLBACK_DIR/$SNAPSHOT_TIMESTAMP"
mkdir -p "$SNAPSHOT_DIR"

DEPLOY_MODE="full"
[[ "$BACKEND_ONLY" == "true" ]] && DEPLOY_MODE="backend-only"
[[ "$FRONTEND_ONLY" == "true" ]] && DEPLOY_MODE="frontend-only"

save_snapshot "$SNAPSHOT_DIR" "$DEPLOY_MODE"

# 备份当前运行产物
if [[ "$FRONTEND_ONLY" != "true" && -f "$BACKEND_BIN" ]]; then
  cp "$BACKEND_BIN" "$SNAPSHOT_DIR/server"
fi
if [[ "$BACKEND_ONLY" != "true" && -d "$STANDALONE_DIR" ]]; then
  cp -a "$STANDALONE_DIR" "$SNAPSHOT_DIR/standalone"
fi

# 维护 .rollback/latest 软链接
rm -f "$ROLLBACK_DIR/latest"
ln -s "$SNAPSHOT_DIR" "$ROLLBACK_DIR/latest"

echo "  快照已保存: $SNAPSHOT_DIR"

# 清理可能残留的临时产物，避免交换时冲突
rm -f "$BACKEND_BIN_NEW" "$BACKEND_DIR/bin/server.prev"
rm -rf "$STANDALONE_DIR.new" "$STANDALONE_DIR.prev"

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

# ==================== 构建后端 ====================
if [[ "$FRONTEND_ONLY" != "true" ]]; then
  echo "==> 构建 Go 后端..."
  mkdir -p "$BACKEND_DIR/bin"
  go build -C "$BACKEND_DIR" -o "$BACKEND_BIN_NEW" ./cmd/server/main.go || {
    echo "错误：Go 后端构建失败" >&2
    exit 1
  }
  echo "  后端二进制: $BACKEND_BIN_NEW"
fi

# ==================== 构建前端 ====================
if [[ "$BACKEND_ONLY" != "true" ]]; then
  echo "==> 清理旧构建..."
  rm -rf "$STANDALONE_DIR" "$STATIC_DIR" "$SERVER_DIR"

  echo "==> 构建前端（使用 webpack 以绕过 Turbopack standalone 问题）..."
  NODE_ENV=production pnpm exec next build --webpack || {
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

  # 将产物暂存到 .new，便于原子交换
  mv "$STANDALONE_DIR" "$STANDALONE_DIR.new"
  echo "  前端产物: $STANDALONE_DIR.new"
fi

# ==================== 数据库备份 ====================
if [[ "$SKIP_BACKUP" != "true" && "$FRONTEND_ONLY" != "true" ]]; then
  echo "==> 备份数据库..."
  mkdir -p "$BACKUP_DIR"
  chmod 700 "$BACKUP_DIR"

  BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  BACKUP_FILE="$BACKUP_DIR/zhiyu-saas-backup-${BACKUP_TIMESTAMP}.dump"

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

# ==================== 停止旧服务（优雅停机） ====================
echo "==> 停止旧服务..."

if [[ "$FRONTEND_ONLY" != "true" ]]; then
  pm2 stop "zhiyu-backend" &>/dev/null || true
  pm2 delete "zhiyu-backend" &>/dev/null || true
  if ! wait_for_port_release "$BACKEND_PORT" 10; then
    echo "  警告：后端端口 $BACKEND_PORT 仍未释放，尝试强制清理..." >&2
    backend_pid=$(lsof -t -i:"$BACKEND_PORT" 2>/dev/null || true)
    [[ -n "$backend_pid" ]] && kill -9 "$backend_pid" 2>/dev/null || true
  fi
fi

if [[ "$BACKEND_ONLY" != "true" ]]; then
  pm2 stop "$SITE_NAME" &>/dev/null || true
  pm2 delete "$SITE_NAME" &>/dev/null || true
  if ! wait_for_port_release "$FRONTEND_PORT" 10; then
    echo "  警告：前端端口 $FRONTEND_PORT 仍未释放，尝试强制清理..." >&2
    frontend_pid=$(lsof -t -i:"$FRONTEND_PORT" 2>/dev/null || true)
    [[ -n "$frontend_pid" ]] && kill -9 "$frontend_pid" 2>/dev/null || true
  fi
fi

sleep 1

# ==================== 原子交换产物 ====================
echo "==> 切换到新版本..."

if [[ "$FRONTEND_ONLY" != "true" && -f "$BACKEND_BIN_NEW" ]]; then
  [[ -f "$BACKEND_BIN" ]] && mv "$BACKEND_BIN" "$BACKEND_DIR/bin/server.prev"
  mv "$BACKEND_BIN_NEW" "$BACKEND_BIN"
  chmod +x "$BACKEND_BIN"
  echo "  后端已切换"
fi

if [[ "$BACKEND_ONLY" != "true" && -d "$STANDALONE_DIR.new" ]]; then
  [[ -d "$STANDALONE_DIR" ]] && rm -rf "$STANDALONE_DIR.prev"
  [[ -d "$STANDALONE_DIR" ]] && mv "$STANDALONE_DIR" "$STANDALONE_DIR.prev"
  mv "$STANDALONE_DIR.new" "$STANDALONE_DIR"
  echo "  前端已切换"
fi

# ==================== 数据库迁移 ====================
if [[ "$FRONTEND_ONLY" != "true" ]]; then
  echo "==> 执行数据库迁移..."
  (cd "$BACKEND_DIR" && go run ./cmd/migrate/main.go up) || {
    echo "错误：数据库迁移失败" >&2
    restore_rollback "$SNAPSHOT_DIR"
    exit 1
  }
fi

# ==================== PM2 启动 ====================
echo ""
echo "==> 本地 PM2 启动服务..."

pm2 start "$PROJECT_ROOT/ecosystem.config.js" --env production || {
  echo "错误：PM2 启动失败" >&2
  restore_rollback "$SNAPSHOT_DIR"
  exit 1
}

pm2 save > /dev/null

# ==================== 健康检查 ====================
echo ""
echo "==> 等待服务就绪并执行健康检查..."

HEALTH_OK=true

if [[ "$FRONTEND_ONLY" != "true" ]]; then
  if health_check "http://127.0.0.1:$BACKEND_PORT/health" 15 2; then
    echo "  后端健康检查通过: http://127.0.0.1:$BACKEND_PORT/health"
  else
    echo "  错误：后端健康检查失败" >&2
    HEALTH_OK=false
  fi
fi

if [[ "$BACKEND_ONLY" != "true" ]]; then
  if health_check "http://127.0.0.1:$FRONTEND_PORT/login" 15 2; then
    echo "  前端健康检查通过: http://127.0.0.1:$FRONTEND_PORT/login"
  else
    echo "  错误：前端健康检查失败" >&2
    HEALTH_OK=false
  fi
fi

if [[ "$HEALTH_OK" != "true" ]]; then
  restore_rollback "$SNAPSHOT_DIR"
  exit 1
fi

# ==================== 清理旧产物与旧快照 ====================
[[ -f "$BACKEND_DIR/bin/server.prev" ]] && rm -f "$BACKEND_DIR/bin/server.prev"
[[ -d "$STANDALONE_DIR.prev" ]] && rm -rf "$STANDALONE_DIR.prev"

# 保留最近 14 天的回滚快照
find "$ROLLBACK_DIR" -maxdepth 1 -type d -name '2*' -mtime +14 -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "✨ 本地发布完成！"
echo "   前端访问: http://localhost:$FRONTEND_PORT"
echo "   后端 API: http://localhost:$BACKEND_PORT"
echo "   回滚快照: $SNAPSHOT_DIR"
echo ""
