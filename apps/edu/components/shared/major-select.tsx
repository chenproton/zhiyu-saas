"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { majorApi } from "@/lib/api"
import type { Major } from "@/lib/types/backend"

interface MajorSelectProps {
  tenantId?: string
  orgNodeId?: string
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function MajorSelect({
  tenantId,
  orgNodeId,
  value,
  onChange,
  placeholder = "选择专业",
  disabled,
  className,
}: MajorSelectProps) {
  const [majors, setMajors] = useState<Major[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const loadMajors = useCallback(async () => {
    if (!tenantId) {
      setMajors([])
      return
    }
    setLoading(true)
    setError(undefined)
    try {
      const params: { tenantId: string; orgNodeId?: string; limit: number } = {
        tenantId,
        limit: 1000,
      }
      if (orgNodeId) params.orgNodeId = orgNodeId
      const res = await majorApi.list(params)
      setMajors(res.items.filter((m) => m.enabled))
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载专业失败")
    } finally {
      setLoading(false)
    }
  }, [tenantId, orgNodeId])

  useEffect(() => {
    loadMajors()
  }, [loadMajors])

  const handleChange = (val: string) => {
    onChange(val || undefined)
  }

  const isDisabled = disabled || loading || !tenantId

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>
  }

  return (
    <Select value={value || ""} onValueChange={handleChange} disabled={isDisabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {majors.map((major) => (
          <SelectItem key={major.id} value={major.id}>
            {major.name}
            {major.code ? <span className="ml-2 text-xs text-muted-foreground">({major.code})</span> : null}
          </SelectItem>
        ))}
        {majors.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {!orgNodeId ? "暂无专业" : "该院系下暂无专业"}
          </div>
        )}
      </SelectContent>
    </Select>
  )
}
