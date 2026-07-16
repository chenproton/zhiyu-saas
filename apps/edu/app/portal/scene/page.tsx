"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Layers, Loader2, Search } from "lucide-react"
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
import type { Scenario } from "@/lib/types/scene"

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

function DifficultyStars({ level }: { level: number }) {
  const count = Math.max(1, Math.min(5, Math.round(level)))
  return (
    <span className="text-amber-400">
      {"★".repeat(count)}
      <span className="text-slate-200">{"★".repeat(5 - count)}</span>
    </span>
  )
}

export default function ScenePortalPage() {
  const [items, setItems] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [industryFilter, setIndustryFilter] = useState<string>("__all__")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await portalRequest<ListResponse<Scenario>>(
        `/scene/scenarios${buildQuery({ status: "published", limit: 1000 })}`
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

  const industries = useMemo(
    () =>
      Array.from(
        new Set(items.map((i) => i.industryName).filter(Boolean))
      ) as string[],
    [items]
  )

  const filtered = useMemo(() => {
    let result = items
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          (i.background && i.background.toLowerCase().includes(q))
      )
    }
    if (industryFilter !== "__all__") {
      result = result.filter((i) => i.industryName === industryFilter)
    }
    return result
  }, [items, query, industryFilter])

  return (
    <div className="min-h-screen bg-[#eef1f8]">
      <div className="max-w-[1312px] mx-auto px-10 py-8 space-y-6">
        <PageHeaderCard
          title="产业应用场景学习实践平台"
          description="还原真实工作场景，在解决实际问题中习得技能"
        />

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row gap-4 p-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="搜索场景名称 / 编码 / 背景"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="所属产业" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部产业</SelectItem>
                {industries.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
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
            <h3 className="mb-2 text-lg font-medium text-slate-700">暂无场景</h3>
            <p className="text-sm text-slate-500">当前筛选条件下没有实践场景</p>
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
                    <div className="h-40 w-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <Layers className="w-12 h-12 text-white/80" />
                    </div>
                  )}
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-slate-400 mb-2">编码：{item.code}</p>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">
                      {item.background || item.deliveryGoal || "暂无简介"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {item.industryName && (
                        <Badge variant="outline">{item.industryName}</Badge>
                      )}
                      <span className="flex items-center gap-1">
                        难度：<DifficultyStars level={item.difficulty} />
                      </span>
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
