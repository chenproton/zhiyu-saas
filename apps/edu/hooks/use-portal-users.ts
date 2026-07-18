"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePortalAuth } from "@/contexts/portal-auth-context"
import { portalUserManagementApi, roleApi, type User } from "@/lib/api"
import type { Role } from "@/lib/types/backend"

export interface UsePortalUsersOptions {
  /** role code to filter by, e.g. "teacher" or "student" */
  roleCode?: "teacher" | "student"
  /** server-side search across username/name/email */
  search?: string
  /** server-side status filter */
  status?: string
}

export interface UsePortalUsersResult {
  users: User[]
  roles: Role[]
  roleMap: Map<string, Role>
  loading: boolean
  error?: string
  refetch: () => void
}

export function usePortalUsers(options: UsePortalUsersOptions = {}): UsePortalUsersResult {
  const { tenantId } = usePortalAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [refetchKey, setRefetchKey] = useState(0)

  const refetch = useCallback(() => setRefetchKey((k) => k + 1), [])

  const roleMap = useMemo(() => {
    const map = new Map<string, Role>()
    roles.forEach((r) => map.set(r.id, r))
    return map
  }, [roles])

  useEffect(() => {
    if (!tenantId) return

    let cancelled = false
    setLoading(true)
    setError(undefined)

    async function fetchData() {
      try {
        const rolesRes = await roleApi.list(tenantId ? { tenantId, limit: 1000 } : { limit: 1000 })
        if (cancelled) return
        setRoles(rolesRes.items)

        const usersRes = await portalUserManagementApi.list({
          tenantId,
          ...(options.roleCode ? { roleCode: options.roleCode } : {}),
          ...(options.search ? { search: options.search } : {}),
          ...(options.status ? { status: options.status } : {}),
          limit: 1000,
        })
        if (cancelled) return
        setUsers(usersRes.items)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "加载失败")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [tenantId, options.roleCode, options.search, options.status, refetchKey])

  return { users, roles, roleMap, loading, error, refetch }
}
