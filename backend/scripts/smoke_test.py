#!/usr/bin/env python3
"""
后端接口冒烟测试脚本。

用法：
    cd /root/projects/zhiyu-saas
    python3 backend/scripts/smoke_test.py

说明：
- 自动从 backend/internal/router/router.go 提取所有路由。
- 对 GET/POST/PUT/DELETE 依次调用，使用占位符填充 {id}/{code} 等参数。
- POST/PUT 使用空 JSON body，因此预期会返回 400（参数缺失），但绝不应返回 500。
- 本脚本的核心目标是发现会导致 500/502 的服务端错误接口。
"""

import csv
import re
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ROUTER_FILE = PROJECT_ROOT / "backend/internal/router/router.go"
REPORT_FILE = PROJECT_ROOT / "backend/scripts/smoke_test_report.csv"

JWT_SECRET = "zhiyu-saas-dev-secret-change-in-production"
DEFAULT_TENANT = "11111111-1111-1111-1111-111111111111"
BASE_URL = "http://127.0.0.1:8080"

# 测试账号（须与数据库 seed 数据一致）
TEST_USERS = {
    "portal_school_admin": {
        "userId": "71111111-1111-1111-1111-111111111116",
        "role": "school",
        "platform": "portal",
        "identityTypeCode": "school_admin",
    },
    "portal_teacher": {
        "userId": "71111111-1111-1111-1111-111111111114",
        "role": "school",
        "platform": "portal",
        "identityTypeCode": "teacher",
    },
    "portal_student": {
        "userId": "71111111-1111-1111-1111-111111111115",
        "role": "school",
        "platform": "portal",
        "identityTypeCode": "student",
    },
    "saas_operator": {
        "userId": "71111111-1111-1111-1111-111111111111",
        "role": "operator",
        "platform": "saas",
        "identityTypeCode": "platform_admin",
    },
    "saas_enterprise": {
        "userId": "71111111-1111-1111-1111-111111111113",
        "role": "enterprise",
        "platform": "saas",
        "identityTypeCode": "enterprise_hr",
    },
}


def make_token(user_info: dict) -> str:
    import time
    try:
        import jwt
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyjwt", "-q"])
        import jwt

    payload = {
        "userId": user_info["userId"],
        "role": user_info["role"],
        "platform": user_info["platform"],
        "tenantId": DEFAULT_TENANT,
        "identityTypeCode": user_info["identityTypeCode"],
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def extract_routes() -> list[tuple[str, str]]:
    lines = ROUTER_FILE.read_text().splitlines()
    stack: list[str] = []
    routes: list[tuple[str, str]] = []

    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("//"):
            continue

        m = re.search(r'r\.Route\("([^"]+)",\s*func', stripped)
        if m:
            stack.append(m.group(1))
            continue

        if re.search(r'r\.Group\(func', stripped):
            stack.append("")
            continue

        if stripped == "})" or stripped.startswith("})"):
            if stack:
                stack.pop()
            continue

        m = re.search(r'r\.(Get|Post|Put|Delete)\("([^"]+)"', stripped)
        if m:
            method, path = m.group(1), m.group(2)
            full = "".join(stack) + path
            routes.append((method.upper(), full))

    # 去重
    seen = set()
    unique = []
    for item in routes:
        if item not in seen:
            seen.add(item)
            unique.append(item)
    return unique


def fill_placeholders(path: str) -> str:
    path = re.sub(r"\{id\}", "00000000-0000-0000-0000-000000000000", path)
    path = re.sub(r"\{code\}", "TEST-CODE", path)
    path = re.sub(r"\{entity\}", "scenarios", path)
    path = re.sub(r"\{questionId\}", "00000000-0000-0000-0000-000000000000", path)
    return path


def call(method: str, path: str, token: str | None = None) -> int | str:
    url = f"{BASE_URL}{path}"
    cmd = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", method, url]
    if token:
        cmd += ["-H", f"Authorization: Bearer {token}"]
    if method in ("POST", "PUT"):
        cmd += ["-H", "Content-Type: application/json", "-d", "{}"]
    try:
        out = subprocess.check_output(cmd, timeout=15).decode().strip()
        return int(out)
    except subprocess.TimeoutExpired:
        return "TIMEOUT"
    except Exception as e:
        return f"ERR: {e}"


def classify(status: int | str) -> str:
    if isinstance(status, str):
        return "ERROR"
    if status >= 500:
        return "SERVER_ERROR"
    if status == 200:
        return "OK"
    if status in (400, 404, 405):
        return "EXPECTED"
    if status in (401, 403):
        return "AUTH"
    return "OTHER"


def main():
    tokens = {k: make_token(v) for k, v in TEST_USERS.items()}
    routes = extract_routes()

    print(f"共提取到 {len(routes)} 条路由，开始扫描...")

    results = []
    error_count = 0

    for method, route in routes:
        path = fill_placeholders(route)

        # 调用顺序：school_admin -> operator -> 无 token
        status = call(method, path, tokens["portal_school_admin"])
        token_used = "portal_school_admin"

        if classify(status) in ("AUTH", "ERROR"):
            s2 = call(method, path, tokens["saas_operator"])
            if classify(s2) not in ("AUTH", "ERROR"):
                status = s2
                token_used = "saas_operator"

        if classify(status) in ("AUTH", "ERROR"):
            s3 = call(method, path, None)
            if classify(s3) not in ("AUTH", "ERROR"):
                status = s3
                token_used = "public"

        cat = classify(status)
        if cat == "SERVER_ERROR" or cat == "ERROR":
            error_count += 1

        results.append(
            {
                "method": method,
                "route": route,
                "test_path": path,
                "status": status,
                "category": cat,
                "token_used": token_used,
            }
        )

    # 写入 CSV
    with open(REPORT_FILE, "w", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["method", "route", "test_path", "status", "category", "token_used"],
        )
        w.writeheader()
        w.writerows(results)

    # 汇总
    summary: dict[str, int] = {}
    for r in results:
        summary[r["category"]] = summary.get(r["category"], 0) + 1

    print("\n=== 扫描汇总 ===")
    for cat in ["OK", "EXPECTED", "AUTH", "OTHER", "SERVER_ERROR", "ERROR"]:
        cnt = summary.get(cat, 0)
        marker = " ⚠️" if cat in ("SERVER_ERROR", "ERROR") and cnt else ""
        print(f"  {cat:12s}: {cnt}{marker}")

    if error_count:
        print(f"\n发现 {error_count} 个服务端错误接口：")
        for r in results:
            if r["category"] in ("SERVER_ERROR", "ERROR"):
                print(f"  [{r['method']}] {r['route']} -> {r['status']} (token={r['token_used']})")
    else:
        print("\n未发现 500/服务端错误接口。")

    print(f"\n详细报告已保存: {REPORT_FILE}")
    return 1 if error_count else 0


if __name__ == "__main__":
    sys.exit(main())
