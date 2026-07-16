"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePortalAuth } from "@/contexts/portal-auth-context"
import { portalIdentityTypeApi, portalUserManagementApi, type User } from "@/lib/api"
import type { IdentityType } from "@/lib/types/backend"

export interface UsePortalUsersOptions {
  /** identity_type.code to filter by, e.g. "teacher" or "student" */
  identityTypeCode?: "teacher" | "student"
  /** server-side search across username/name/email */
  search?: string
  /** server-side status filter */
  status?: string
}

export interface UsePortalUsersResult {
  users: User[]
  identityTypes: IdentityType[]
  identityTypeMap: Map<string, IdentityType>
  loading: boolean
  error?: string
  refetch: () => void
}

export function usePortalUsers(options: UsePortalUsersOptions = {}): UsePortalUsersResult {
  const { tenantId } = usePortalAuth()
  const [users, setUsers] = useState<User[]>([])
  const [identityTypes, setIdentityTypes] = useState<IdentityType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [refetchKey, setRefetchKey] = useState(0)

  const refetch = useCallback(() => setRefetchKey((k) => k + 1), [])

  const identityTypeMap = useMemo(() => {
    const map = new Map<string, IdentityType>()
    identityTypes.forEach((it) => map.set(it.id, it))
    return map
  }, [identityTypes])

  useEffect(() => {
    if (!tenantId) return

    let cancelled = false
    setLoading(true)
    setError(undefined)

    async function fetchData() {
      try {
        const idTypesRes = await portalIdentityTypeApi.list(
          tenantId ? { tenantId, limit: 1000 } : { limit: 1000 }
        )
        if (cancelled) return
        setIdentityTypes(idTypesRes.items)

        const identityTypeId = options.identityTypeCode
          ? idTypesRes.items.find((it) => it.code === options.identityTypeCode)?.id
          : undefined

        const usersRes = await portalUserManagementApi.list({
          tenantId,
          ...(identityTypeId ? { identityTypeId } : {}),
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
  }, [tenantId, options.identityTypeCode, options.search, options.status, refetchKey])

  return { users, identityTypes, identityTypeMap, loading, error, refetch }
}
