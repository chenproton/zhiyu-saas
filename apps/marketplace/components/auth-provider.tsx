"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { authApi, getToken, removeToken, type MeResponse } from "@/lib/api"
import type { IdentityType, Organization, Major, Role } from "@/lib/types/backend"

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
  const identityTypeCode = state.me?.identityType?.code

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
