"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { authApi, getToken, removeToken, type MeResponse } from "@/lib/api"
import type { IdentityType, Organization, Major, Role } from "@/lib/types/backend"
import { checkMenuPermission, mergeRoleMenus } from "@/lib/menu-permissions"

export type UserRole = "school" | "enterprise" | "operator"

interface AuthContextType {
  user?: MeResponse["user"]
  institution?: MeResponse["institution"]
  role?: UserRole
  institutionId?: string

  tenantId?: string
  identityTypeId?: string
  identityType?: IdentityType
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
    // edu 应用（管理后台）所有页面都面向 portal 用户（学校/教师/学生），
    // 因此统一使用 portal token，避免 /portal 登录后跳转到 /job、/scene 等模块时因 token 不一致被踢回登录页。
    const token = getToken("portal")
    if (!token) {
      setState({ loading: false })
      return
    }

    try {
      const data = await authApi.portalMe()
      setState({
        me: data,
        loading: false,
        error: undefined,
      })
    } catch (err) {
      removeToken("portal")
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
    removeToken("portal")
    setState({ me: undefined, loading: false })
    if (typeof window !== "undefined") {
      window.location.href = "/portal/login"
    }
  }, [])


  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))
    await fetchMe()
  }, [fetchMe])

  const user = state.me?.user
  const role = user?.role as UserRole | undefined
  const roles = state.me?.roles
  const identityTypeCode = state.me?.identityType?.code

  // Merge permissions from all roles into a single object.
  const permissions = useMemo(() => {
    const merged = roles?.reduce<Record<string, any>>((acc, r) => {
      if (r.permissions && typeof r.permissions === "object") {
        Object.assign(acc, r.permissions)
      }
      return acc
    }, {}) ?? {}
    const menus = mergeRoleMenus(roles)
    if (menus) merged.menus = menus
    else delete merged.menus
    return merged
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
    return checkMenuPermission(permissions?.menus, path)
  }, [permissions])

  return (
    <AuthContext.Provider
      value={{
        user,
        institution: state.me?.institution,
        role,
        institutionId: user?.institutionId,
        tenantId: user?.tenantId,
        identityTypeId: user?.identityTypeId,
        identityType: state.me?.identityType,
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
