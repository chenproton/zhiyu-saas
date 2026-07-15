"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { authApi, removeToken, getToken, type MeResponse } from "@/lib/api"
import type { IdentityType, Organization, Major, Role } from "@/lib/types/backend"

export type PortalUserRole = "school" | "enterprise" | "operator"

interface PortalAuthContextType {
  user?: MeResponse["user"]
  institution?: MeResponse["institution"]
  role?: PortalUserRole
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
}

const PortalAuthContext = createContext<PortalAuthContextType>({
  loading: true,
  refresh: async () => {},
  logout: () => {},
  hasPermission: () => false,
})

export function usePortalAuth() {
  return useContext(PortalAuthContext)
}

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<{
    me?: MeResponse
    loading: boolean
    error?: string
  }>({ loading: true })

  const fetchMe = useCallback(async () => {
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
    setState({ loading: false })
    router.push("/portal/login")
  }, [router])

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))
    await fetchMe()
  }, [fetchMe])

  const user = state.me?.user
  const role = user?.role as PortalUserRole | undefined
  const roles = state.me?.roles
  const identityTypeCode = state.me?.identityType?.code

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

  return (
    <PortalAuthContext.Provider
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
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  )
}
