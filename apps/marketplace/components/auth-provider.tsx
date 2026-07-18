"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { authApi, getToken, removeToken, type MeResponse } from "@/lib/api"
import type { Organization, Major, Role } from "@/lib/types/backend"

export type UserRole = "school" | "enterprise" | "operator"

// 身份类型体系已移除，marketplace 侧沿用 identityType 字段名，
// 值由用户绑定的主角色（roles）派生，避免大面积改动页面。
export interface IdentityLike {
  id: string
  code: string
  name: string
}

const PRIMARY_ROLE_PRIORITY = ["platform_admin", "school_admin", "enterprise_mentor", "teacher", "student"]

interface AuthContextType {
  user?: MeResponse["user"]
  institution?: MeResponse["institution"]
  role?: UserRole
  institutionId?: string

  tenantId?: string
  identityTypeId?: string
  identityType?: IdentityLike
  identityTypeCode?: string
  orgNodeId?: string
  orgNode?: Organization
  majorId?: string
  major?: Major
  permissions?: Record<string, any>
  roles?: Role[]

  loading: boolean
  error?: string
  refresh: () => Promise<void>
  logout: () => void
  hasPermission: (module: string, page?: string, action?: string) => boolean
  hasMenuPermission: (path: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
  refresh: async () => {},
  logout: () => {},
  hasPermission: () => false,
  hasMenuPermission: () => true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    me?: MeResponse
    loading: boolean
    error?: string
  }>({ loading: true })

  const fetchMe = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setState({ loading: false })
      return
    }

    try {
      const data = await authApi.me()
      setState({
        me: data,
        loading: false,
        error: undefined,
      })
    } catch (err) {
      removeToken()
      setState({
        loading: false,
        error: err instanceof Error ? err.message : "获取用户信息失败",
      })
    }
  }, [])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const logout = useCallback(() => {
    removeToken()
    setState({ me: undefined, loading: false })
    // 使用硬跳转避免组件卸载/返回 null 导致 Next.js 软导航不生效
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }, [])


  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))
    await fetchMe()
  }, [fetchMe])

  const user = state.me?.user
  const role = user?.role as UserRole | undefined
  const roles = state.me?.roles
  const primaryRole = useMemo(() => {
    if (!roles || roles.length === 0) return undefined
    for (const code of PRIMARY_ROLE_PRIORITY) {
      const found = roles.find((r) => r.code === code)
      if (found) return found
    }
    return roles[0]
  }, [roles])
  const identityType: IdentityLike | undefined = primaryRole
    ? { id: primaryRole.id, code: primaryRole.code, name: primaryRole.name }
    : undefined
  const identityTypeCode = identityType?.code

  // Merge permissions from all roles into a single object.
  const permissions = useMemo(() => {
    return roles?.reduce<Record<string, any>>((acc, r) => {
      if (r.permissions && typeof r.permissions === "object") {
        Object.assign(acc, r.permissions)
      }
      return acc
    }, {}) ?? {}
  }, [roles])

  const hasPermission = useCallback((module: string, page?: string, action?: string) => {
    const perms = permissions
    if (!perms || Object.keys(perms).length === 0) return false
    if (typeof perms !== "object") return false
    if (perms.admin === true) return true

    const mod = perms[module]
    if (!mod) return false
    if (!page) return true

    const p = mod[page]
    if (!p) return false
    if (!action) return true

    if (Array.isArray(p)) return p.includes(action)
    if (typeof p === "object" && Array.isArray(p.buttons)) return p.buttons.includes(action)
    return false
  }, [permissions])

  const hasMenuPermission = useCallback((path: string) => {
    const menus = permissions?.menus
    if (!menus || typeof menus !== "object") return true
    return menus[path] === true
  }, [permissions])

  return (
    <AuthContext.Provider
      value={{
        user,
        institution: state.me?.institution,
        role,
        institutionId: user?.institutionId,
        tenantId: user?.tenantId,
        identityTypeId: identityType?.id,
        identityType,
        identityTypeCode,
        orgNodeId: user?.orgNodeId,
        orgNode: state.me?.orgNode,
        majorId: user?.majorId,
        major: state.me?.major,
        permissions,
        roles,
        loading: state.loading,
        error: state.error,
        refresh,
        logout,
        hasPermission,
        hasMenuPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
