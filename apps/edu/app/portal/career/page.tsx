"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Briefcase, Loader2, Search } from "lucide-react"
import { PageHeaderCard } from "@/components/shared/page-header-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { buildQuery, portalRequest, type ListResponse } from "@/lib/api"
import type { CareerPosition } from "@/lib/types/job"

const POSITION_TYPE_LABELS: Record<string, string> = {
  enterprise: "企业岗位",
  teaching: "教学岗位",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  pending: "审批中",
  approved: "已通过",
  rejected: "已驳回",
  published: "已发布",
  archived: "已归档",
}

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] || status
  return (
    <Badge variant={status === "published" ? "default" : "secondary"}>
      {label}
    </Badge>
  )
}

export default function CareerPortalPage() {
  const [items, setItems] = useState<CareerPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("__all__")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await portalRequest<ListResponse<CareerPosition>>(
        `/job/positions${buildQuery({ status: "published", limit: 1000 })}`
      )
      setItems(res.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const types = useMemo(
    () => Array.from(new Set(items.map((i) => i.positionType))),
    [items]
  )

  const filtered = useMemo(() => {
    let result = items
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.shortName && i.shortName.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q))
      )
    }
    if (typeFilter !== "__all__") {
      result = result.filter((i) => i.positionType === typeFilter)
    }
    return result
  }, [items, query, typeFilter])

  return (
    <div className="min-h-screen bg-[#eef1f8]">
      <div className="max-w-[1312px] mx-auto px-10 py-8 space-y-6">
        <PageHeaderCard
          title="产业岗位学习平台"
          description="浏览真实岗位能力图谱，规划职业路径"
        />

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row gap-4 p-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="搜索岗位名称 / 简称 / 描述"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="岗位类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部类型</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {POSITION_TYPE_LABELS[t] || t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-slate-700">暂无岗位</h3>
            <p className="text-sm text-slate-500">当前筛选条件下没有岗位数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <Link key={item.id} href="#" className="group block">
                <Card className="overflow-hidden border-slate-200 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md h-full flex flex-col">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
                      <Briefcase className="w-12 h-12 text-white/80" />
                    </div>
                  )}
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">
                      {item.description || "暂无简介"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Badge variant="outline">
                        {POSITION_TYPE_LABELS[item.positionType] || item.positionType}
                      </Badge>
                      {item.salaryMin != null && item.salaryMax != null && (
                        <span>薪资：{item.salaryMin}-{item.salaryMax}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
