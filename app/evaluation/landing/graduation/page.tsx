"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  GraduationCap,
  Search,
  Users,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useData } from "@/components/providers/data-provider"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

const myProgress = [
  { stage: "选题申请", status: "completed", date: "2024-05-10" },
  { stage: "导师审核", status: "completed", date: "2024-05-12" },
  { stage: "开题报告", status: "inprogress", date: "进行中" },
  { stage: "中期检查", status: "pending", date: "待开始" },
  { stage: "论文答辩", status: "pending", date: "待开始" },
]

export default function GraduationPage() {
  const [activeDir, setActiveDir] = useState("全部")
  const [search, setSearch] = useState("")
  const { graduationProjectTopics } = useData()

  const directions = useMemo(() => {
    const dirs = new Set(graduationProjectTopics.map((t) => t.positionName))
    return ["全部", ...Array.from(dirs)]
  }, [graduationProjectTopics])

  const filtered = useMemo(
    () =>
      graduationProjectTopics.filter(
        (t) =>
          (activeDir === "全部" || t.positionName === activeDir) &&
          t.name.toLowerCase().includes(search.toLowerCase())
      ),
    [graduationProjectTopics, activeDir, search]
  )

  const statusLabel = (s: string) => {
    switch (s) {
      case "published":
        return "开放中"
      case "locked":
        return "名额已满"
      case "draft":
        return "草稿"
      case "pending":
        return "审批中"
      default:
        return s
    }
  }

  const statusStyle = (s: string) => {
    switch (s) {
      case "published":
        return { bg: "#eff6ff", color: "#2563eb" }
      case "locked":
        return { bg: "#fef2f2", color: "#ef4444" }
      case "draft":
        return { bg: "#f3f4f6", color: "#6b7280" }
      case "pending":
        return { bg: "#fffbeb", color: "#f59e0b" }
      default:
        return { bg: "#f3f4f6", color: "#6b7280" }
    }
  }

  const stats = [
    { label: "全部选题", value: graduationProjectTopics.length, icon: BookOpen, color: "#2563eb" },
    { label: "开放中", value: graduationProjectTopics.filter((t) => t.status === "published").length, icon: BarChart3, color: "#10b981" },
    { label: "我的进度", value: `${myProgress.filter((p) => p.status === "completed").length}/${myProgress.length}`, icon: CheckCircle2, color: "#f59e0b" },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <PrdAnnotation data={getAnnotation("lgl-page")}>
      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 py-10 text-white"
        style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb, #3b82f6)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center gap-3">
            <Link href="/evaluation/landing">
              <Button variant="ghost" size="sm" className="gap-1 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Button>
            </Link>
          </div>
          <PrdAnnotation data={getAnnotation("lgl-hero")}>
            <h1 className="text-2xl font-bold">毕业设计</h1>
            <p className="mt-1 text-sm text-white/80">选题申请、进度跟踪、导师沟通一站式管理</p>
          </PrdAnnotation>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl bg-white p-4"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: s.color + "15", color: s.color }}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* My Progress */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full" style={{ background: "#2563eb" }} />
            <h2 className="text-base font-semibold text-gray-900">我的毕设进度</h2>
          </div>
          <div
            className="rounded-xl bg-white p-5"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <div className="flex flex-wrap items-center gap-2">
              {myProgress.map((item, idx) => (
                <div key={item.stage} className="flex items-center gap-2">
                  <div
                    className="flex h-8 items-center rounded-full px-3 text-xs font-medium"
                    style={
                      item.status === "completed"
                        ? { background: "#ecfdf5", color: "#10b981" }
                        : item.status === "inprogress"
                        ? { background: "#eff6ff", color: "#2563eb" }
                        : { background: "#f3f4f6", color: "#9ca3af" }
                    }
                  >
                    {item.status === "completed" ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : item.status === "inprogress" ? (
                      <Clock3 className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertCircle className="mr-1 h-3 w-3" />
                    )}
                    {item.stage}
                  </div>
                  {idx < myProgress.length - 1 && (
                    <div className="hidden h-px w-4 bg-gray-200 sm:block" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                当前题目：基于深度学习的图像识别系统
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                导师：王教授
              </span>
              <Badge
                variant="outline"
                className="rounded-full text-[10px] font-normal"
                style={{ borderColor: "#2563eb", color: "#2563eb" }}
              >
                人工智能方向
              </Badge>
            </div>
          </div>
        </section>

        {/* Topic Search */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full" style={{ background: "#2563eb" }} />
              <h2 className="text-base font-semibold text-gray-900">选题广场</h2>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索选题..."
                className="h-9 rounded-full border-0 bg-white pl-9 text-sm shadow-sm"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
            {directions.map((dir) => (
              <button
                key={dir}
                onClick={() => setActiveDir(dir)}
                className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={
                  activeDir === dir
                    ? { background: "#2563eb", color: "#fff" }
                    : { background: "#fff", color: "#666", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                }
              >
                {dir}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((topic) => {
              const stl = statusStyle(topic.status)
              const spotsLeft = topic.capacity - topic.appliedCount
              return (
                <Link key={topic.id} href={`/evaluation/landing/graduation/${topic.id}`} className="block">
                  <div
                    className="cursor-pointer rounded-xl bg-white p-4 transition-all duration-300"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget
                      el.style.transform = "translateY(-4px)"
                      el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget
                      el.style.transform = "translateY(0)"
                      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"
                    }}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ background: "#ecfdf5", color: "#10b981" }}
                      >
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                        style={{ background: stl.bg, color: stl.color }}
                      >
                        {statusLabel(topic.status)}
                      </span>
                    </div>
                    <h4 className="mb-2 text-sm font-semibold leading-snug text-gray-900">
                      {topic.name}
                    </h4>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        导师：{topic.advisorName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        方向：{topic.positionName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {topic.college}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
                      <span
                        className={`text-xs font-medium ${
                          spotsLeft <= 1 ? "text-red-500" : "text-gray-500"
                        }`}
                      >
                        余 {spotsLeft}/{topic.capacity} 名
                      </span>
                      <Button
                        size="sm"
                        className="h-7 rounded-lg text-xs"
                        style={{ background: "#2563eb" }}
                      >
                        申请选题
                      </Button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div
              className="rounded-xl bg-white py-12 text-center text-sm text-gray-400"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              暂无匹配选题
            </div>
          )}
        </section>
      </div>
      </PrdAnnotation>
    </div>
  )
}
