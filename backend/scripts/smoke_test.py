#!/usr/bin/env python3
"""
后端接口冒烟测试脚本（增强版）。

用法：
    cd /root/projects/zhiyu-saas
    python3 backend/scripts/smoke_test.py

说明：
- 使用三种真实 portal 账号登录获取 token：school_admin / teacher / student。
- 对每个路由分别用三种角色调用，记录状态码和返回数据的基本校验结果。
- 核心目标：
  1. 发现 500/502 服务端错误。
  2. 发现返回 200 但 JSON 解析失败或关键字段缺失的接口。
  3. 确认三种角色的权限边界符合预期。
"""

import csv
import json
import re
import subprocess
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ROUTER_FILE = PROJECT_ROOT / "backend/internal/router/router.go"
REPORT_FILE = PROJECT_ROOT / "backend/scripts/smoke_test_report.csv"

JWT_SECRET = "zhiyu-saas-dev-secret-change-in-production"
DEFAULT_TENANT = "11111111-1111-1111-1111-111111111111"
BASE_URL = "http://127.0.0.1:8080"

# 真实 portal 测试账号
PORTAL_USERS = {
    "school_admin": {"username": "school", "password": "school123"},
    "teacher": {"username": "teacher", "password": "teacher123"},
    "student": {"username": "student", "password": "student123"},
}

# SaaS 角色使用伪造 token（仅用于补充测试需要 platform_admin / enterprise 的接口）
SAAS_USERS = {
    "platform_admin": {
        "userId": "71111111-1111-1111-1111-111111111111",
        "role": "operator",
        "platform": "saas",
        "identityTypeCode": "platform_admin",
    },
    "enterprise_hr": {
        "userId": "71111111-1111-1111-1111-111111111113",
        "role": "enterprise",
        "platform": "saas",
        "identityTypeCode": "enterprise_hr",
    },
}


def install_pyjwt():
    try:
        import jwt
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyjwt", "-q"])


def make_saas_token(user_info: dict) -> str:
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


def login_portal(username: str, password: str) -> str | None:
    """调用 /api/v1/auth/portal/login 获取真实 token。"""
    url = f"{BASE_URL}/api/v1/auth/portal/login"
    body = json.dumps({"username": username, "password": password})
    cmd = [
        "curl", "-s", "-X", "POST", url,
        "-H", "Content-Type: application/json",
        "-d", body,
    ]
    try:
        out = subprocess.check_output(cmd, timeout=15).decode().strip()
        data = json.loads(out)
        return data.get("token")
    except Exception:
        return None


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

        if stripped == "})" or stripped.startswith("})):"):
            if stack:
                stack.pop()
            continue

        m = re.search(r'r\.(Get|Post|Put|Delete)\("([^"]+)"', stripped)
        if m:
            method, path = m.group(1), m.group(2)
            full = "".join(stack) + path
            routes.append((method.upper(), full))

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


def call(method: str, path: str, token: str | None = None, body: str = "{}") -> tuple[int | str, str]:
    """返回 (status_code, response_body)。"""
    url = f"{BASE_URL}{path}"
    cmd = ["curl", "-s", "-X", method, url]
    if token:
        cmd += ["-H", f"Authorization: Bearer {token}"]
    if method in ("POST", "PUT"):
        cmd += ["-H", "Content-Type: application/json", "-d", body]
    try:
        out = subprocess.check_output(cmd, timeout=15).decode().strip()
        # curl 的 -w 需要单独处理，这里用 -s 输出完整响应
        return 200, out
    except subprocess.TimeoutExpired:
        return "TIMEOUT", ""
    except Exception as e:
        return f"ERR: {e}", ""


def call_with_status(method: str, path: str, token: str | None = None, body: str = "{}") -> tuple[int | str, str]:
    """通过 -w %{http_code} 获取状态码，同时捕获响应体。"""
    url = f"{BASE_URL}{path}"
    cmd = [
        "curl", "-s", "-o", "-", "-w", "\n__HTTP_CODE__:%{http_code}",
        "-X", method, url,
    ]
    if token:
        cmd += ["-H", f"Authorization: Bearer {token}"]
    if method in ("POST", "PUT"):
        cmd += ["-H", "Content-Type: application/json", "-d", body]
    try:
        out = subprocess.check_output(cmd, timeout=15).decode().strip()
        parts = out.split("\n__HTTP_CODE__:")
        body = parts[0] if parts else ""
        status_str = parts[-1].strip() if len(parts) > 1 else "0"
        return int(status_str), body
    except subprocess.TimeoutExpired:
        return "TIMEOUT", ""
    except Exception as e:
        return f"ERR: {e}", ""


def classify(status: int | str) -> str:
    if isinstance(status, str):
        return "ERROR"
    if status >= 500:
        return "SERVER_ERROR"
    if status == 200:
        return "OK"
    if status == 201:
        return "CREATED"
    if status in (400, 404, 405):
        return "EXPECTED"
    if status in (401, 403):
        return "AUTH"
    return "OTHER"


def validate_json_response(method: str, route: str, status: int, body: str) -> str:
    """对返回 200/201 的响应做基本数据校验，返回描述字符串。"""
    if status not in (200, 201):
        return "-"

    # 导出接口通常返回文件流（CSV/Excel），不强制校验 JSON
    if "/export/" in route:
        return f"export stream ({len(body)} bytes)"

    if not body:
        return "empty body"

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return "invalid json"

    # 列表接口通用校验
    if isinstance(data, dict) and "items" in data and "total" in data:
        items = data.get("items")
        total = data.get("total")
        if not isinstance(items, list):
            return "items not list"
        if not isinstance(total, int):
            return "total not int"
        return f"list ok (total={total})"

    # 单资源接口通用校验
    if isinstance(data, dict) and "id" in data:
        return f"object ok (id={data['id']})"

    # dashboard / me 等
    if isinstance(data, dict):
        keys = list(data.keys())[:3]
        return f"json ok (keys={keys})"

    return "json ok"


def main():
    install_pyjwt()

    # 1. 真实登录三种 portal 角色
    print("正在登录三种 portal 测试账号...")
    tokens: dict[str, str | None] = {}
    for role, cred in PORTAL_USERS.items():
        token = login_portal(cred["username"], cred["password"])
        tokens[role] = token
        if token:
            print(f"  [{role}] 登录成功")
        else:
            print(f"  [{role}] 登录失败 ⚠️")

    # SaaS 伪造 token
    for role, info in SAAS_USERS.items():
        tokens[role] = make_saas_token(info)

    routes = extract_routes()
    print(f"\n共提取到 {len(routes)} 条路由，开始扫描...")

    results = []
    error_count = 0

    for method, route in routes:
        path = fill_placeholders(route)

        # 对每种 portal 角色分别调用
        role_results = {}
        for role in ["school_admin", "teacher", "student"]:
            token = tokens.get(role)
            if not token:
                role_results[role] = ("NO_TOKEN", "未获取到 token", "ERROR")
                continue

            status, body = call_with_status(method, path, token)
            validation = validate_json_response(method, route, status, body)
            cat = classify(status)
            role_results[role] = (status, validation, cat)

            if cat in ("SERVER_ERROR", "ERROR"):
                error_count += 1

        # 补充：若三种 portal 角色均为 AUTH/ERROR，尝试 platform_admin
        portal_statuses = [role_results[r][2] for r in ["school_admin", "teacher", "student"]]
        need_saas = all(s in ("AUTH", "ERROR", "NO_TOKEN") for s in portal_statuses)

        saas_role_used = None
        saas_status = "-"
        saas_validation = "-"
        saas_cat = "-"
        if need_saas:
            for saas_role in ["platform_admin", "enterprise_hr"]:
                token = tokens.get(saas_role)
                if not token:
                    continue
                status, body = call_with_status(method, path, token)
                validation = validate_json_response(method, route, status, body)
                cat = classify(status)
                if cat not in ("AUTH", "ERROR", "NO_TOKEN"):
                    saas_role_used = saas_role
                    saas_status = status
                    saas_validation = validation
                    saas_cat = cat
                    break

        results.append({
            "method": method,
            "route": route,
            "test_path": path,
            "school_admin_status": role_results["school_admin"][0],
            "school_admin_data": role_results["school_admin"][1],
            "teacher_status": role_results["teacher"][0],
            "teacher_data": role_results["teacher"][1],
            "student_status": role_results["student"][0],
            "student_data": role_results["student"][1],
            "saas_role": saas_role_used or "-",
            "saas_status": saas_status,
            "saas_data": saas_validation,
        })

    # 写入 CSV
    with open(REPORT_FILE, "w", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=[
                "method", "route", "test_path",
                "school_admin_status", "school_admin_data",
                "teacher_status", "teacher_data",
                "student_status", "student_data",
                "saas_role", "saas_status", "saas_data",
            ],
        )
        w.writeheader()
        w.writerows(results)

    # 汇总
    print("\n=== 扫描汇总 ===")
    print(f"  总路由数: {len(routes)}")
    print(f"  服务端错误数 (500/502/ERR/TIMEOUT): {error_count}")

    # 登录结果汇总
    print("\n=== 登录结果 ===")
    for role, token in tokens.items():
        if role in PORTAL_USERS:
            status = "成功" if token else "失败"
            print(f"  [{role}] {status}")

    # 按角色统计可访问接口数
    print("\n=== 各角色可正常访问接口数 (200/201) ===")
    for role in ["school_admin", "teacher", "student"]:
        ok_count = sum(1 for r in results if str(r[f"{role}_status"]) in ("200", "201"))
        print(f"  [{role}] {ok_count}/{len(routes)}")

    if error_count:
        print("\n发现服务端错误的接口：")
        for r in results:
            for role in ["school_admin", "teacher", "student"]:
                cat = classify(r[f"{role}_status"])
                if cat in ("SERVER_ERROR", "ERROR"):
                    print(f"  [{role}] {r['method']} {r['route']} -> {r[f'{role}_status']} ({r[f'{role}_data']})")
    else:
        print("\n未发现 500/502/ERR/TIMEOUT 接口。")

    print(f"\n详细报告已保存: {REPORT_FILE}")
    return 1 if error_count else 0


if __name__ == "__main__":
    sys.exit(main())
