"use client"

import { useState, useCallback, useEffect } from "react"
import { approvalApi } from "@/lib/api"
import type { ApprovalRecord } from "@/lib/types/backend"
import { useToast } from "@/hooks/use-toast"

interface UseApprovalsOptions {
  targetType: string
  limit?: number
}

interface UseApprovalsReturn {
  records: ApprovalRecord[]
  loading: boolean
  approve: (id: string, comment?: string) => Promise<void>
  reject: (id: string, comment?: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useApprovals({ targetType, limit = 1000 }: UseApprovalsOptions): UseApprovalsReturn {
  const { toast } = useToast()
  const [records, setRecords] = useState<ApprovalRecord[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await approvalApi.list({ targetType, limit })
      setRecords(res.items)
    } catch (err: any) {
      toast({ variant: "destructive", title: "加载失败", description: err.message || "无法获取审批数据" })
    } finally {
      setLoading(false)
    }
  }, [targetType, limit, toast])

  useEffect(() => {
    refresh()
  }, [refresh])

  const approve = useCallback(async (id: string, comment?: string) => {
    await approvalApi.review(id, { status: "approved", comment: comment || "审批通过。" })
    toast({ title: "审批通过" })
    await refresh()
  }, [refresh, toast])

  const reject = useCallback(async (id: string, comment?: string) => {
    await approvalApi.review(id, { status: "rejected", comment: comment || "驳回" })
    toast({ title: "已驳回" })
    await refresh()
  }, [refresh, toast])

  return { records, loading, approve, reject, refresh }
}
