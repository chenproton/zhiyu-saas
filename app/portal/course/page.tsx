"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BookOpen, Loader2, Search } from "lucide-react"
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
import type { Course } from "@/lib/types/lesson"

const COURSE_TYPE_LABELS: Record<string, string> = {
  system: "体系课程",
  granular: "颗粒课程",
  hybrid: "混合课程",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  pending: "审批中",
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

export default function CoursePortalPage() {
  const [items, setItems] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("__all__")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await portalRequest<ListResponse<Course>>(
        `/lesson/courses${buildQuery({ status: "published", limit: 1000 })}`
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
    () => Array.from(new Set(items.map((i) => i.type))),
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
          (i.category && i.category.toLowerCase().includes(q))
      )
    }
    if (typeFilter !== "__all__") {
      result = result.filter((i) => i.type === typeFilter)
    }
    return result
  }, [items, query, typeFilter])

  return (
    <div className="min-h-screen bg-[#eef1f8]">
      <div className="max-w-[1312px] mx-auto px-10 py-8 space-y-6">
        <PageHeaderCard
          title="数字课程服务平台"
          description="以颗粒课资源支撑体系课程，按需学习与查漏补缺"
        />

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row gap-4 p-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="搜索课程名称 / 编码 / 分类"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="课程类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部类型</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {COURSE_TYPE_LABELS[t] || t}
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
            <h3 className="mb-2 text-lg font-medium text-slate-700">暂无课程</h3>
            <p className="text-sm text-slate-500">当前筛选条件下没有课程数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <Link key={item.id} href="#" className="group block">
                <Card
                  className="overflow-hidden border-slate-200 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md h-full flex flex-col"
                >
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-40 w-full flex items-center justify-center"
                      style={{
                        background:
                          item.coverColor ||
                          "linear-gradient(135deg, #f59e0b, #f97316)",
                      }}
                    >
                      <BookOpen className="w-12 h-12 text-white/80" />
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
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">
                        {COURSE_TYPE_LABELS[item.type] || item.type}
                      </Badge>
                      {item.category && (
                        <Badge variant="secondary">{item.category}</Badge>
                      )}
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>节点：{item.nodeCount}</span>
                      <span>资源：{item.resourceCount}</span>
                      <span>学习：{item.studyCount || 0}</span>
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
