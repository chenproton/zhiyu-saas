#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$BACKEND_DIR/.." && pwd)"

mkdir -p "$BACKEND_DIR/bin"

cd "$BACKEND_DIR"

go build -o "$BACKEND_DIR/bin/server" ./cmd/server/main.go

echo "Backend built: $BACKEND_DIR/bin/server"
