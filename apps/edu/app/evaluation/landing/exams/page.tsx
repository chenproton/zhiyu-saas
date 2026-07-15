"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  FileText,
  PlayCircle,
  Search,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useData } from "@/components/providers/data-provider"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

const myExams = [
  { id: "exam-1", name: "前端基础测试", status: "进行中", type: "随堂测", time: "2024-03-15 14:00", duration: 60, questionCount: 20, description: "考察 JavaScript、React 基础知识", college: "信息技术学院", major: "电子计算机", targetAudience: "2024级前端1班、2024级前端2班" },
  { id: "exam-2", name: "TypeScript 能力测试", status: "未开始", type: "教学考试", time: "2024-03-20 10:00", duration: 90, questionCount: 30, description: "TypeScript 类型系统与高级特性测验", college: "信息技术学院", major: "软件工程", targetAudience: "2024级软件工程1班、2024级软件工程2班" },
]

const allExams = [
  { id: "exam-1", name: "前端基础测试", status: "进行中", type: "随堂测", time: "2024-03-15 14:00", duration: 60, questionCount: 20, description: "考察 JavaScript、React 基础知识", college: "信息技术学院", major: "电子计算机", targetAudience: "2024级前端1班、2024级前端2班" },
  { id: "exam-2", name: "TypeScript 能力测试", status: "未开始", type: "教学考试", time: "2024-03-20 10:00", duration: 90, questionCount: 30, description: "TypeScript 类型系统与高级特性测验", college: "信息技术学院", major: "软件工程", targetAudience: "2024级软件工程1班、2024级软件工程2班" },
  { id: "exam-3", name: "React 进阶考核", status: "已结束", type: "期末考", time: "2024-03-10 09:00", duration: 120, questionCount: 40, description: "React Hooks 与性能优化专项考核", college: "信息技术学院", major: "电子计算机", targetAudience: "2023级计算机班" },
  { id: "exam-4", name: "Node.js 后端测试", status: "进行中", type: "随堂测", time: "2024-02-28 14:00", duration: 60, questionCount: 25, description: "Node.js 基础与 Express 框架测试", college: "土木工程学院", major: "土木工程", targetAudience: "2024级网络工程班" },
  { id: "exam-5", name: "Vue.js 进阶考核", status: "未开始", type: "期末考", time: "2024-04-05 10:00", duration: 120, questionCount: 35, description: "Vue3 组合式 API 与响应式原理", college: "信息技术学院", major: "软件工程", targetAudience: "2024级软件工程班" },
  { id: "exam-6", name: "全栈开发综合测试", status: "已结束", type: "综合考", time: "2024-03-25 09:00", duration: 150, questionCount: 50, description: "前后端技术栈综合知识考核", college: "信息技术学院", major: "网络工程", targetAudience: "2023级全栈开发班、2024级全栈开发班" },
]

const collegeOptions = ["全部", "信息技术学院", "土木工程学院", "机械工程学院", "经济管理学院"]
const majorOptions = ["全部", "电子计算机", "软件工程", "网络工程", "土木工程", "机械设计", "工商管理"]

const statusMeta: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  进行中: { color: "#2563eb", bg: "#eff6ff", icon: PlayCircle },
  未开始: { color: "#f59e0b", bg: "#fffbeb", icon: Clock },
  已结束: { color: "#10b981", bg: "#ecfdf5", icon: CheckCircle2 },
}

export default function ExamListPage() {
  const [tab, setTab] = useState<"my" | "all">("my")
  const [search, setSearch] = useState("")
  const [collegeFilter, setCollegeFilter] = useState("全部")
  const [majorFilter, setMajorFilter] = useState("全部")
  const { exams } = useData()

  const baseList = tab === "my" ? myExams : allExams
  const examsList = useMemo(
    () => baseList.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.id.toLowerCase().includes(search.toLowerCase()) ||
        (e as any).college?.toLowerCase().includes(search.toLowerCase())
      const matchCollege = collegeFilter === "全部" || (e as any).college === collegeFilter
      const matchMajor = majorFilter === "全部" || (e as any).major === majorFilter
      return matchSearch && matchCollege && matchMajor
    }),
    [baseList, search, collegeFilter, majorFilter]
  )

  const stats = [
    { label: "全部考试", value: exams.length, icon: BarChart3, color: "#2563eb" },
    { label: "进行中", value: examsList.filter((e) => e.status === "进行中").length, icon: PlayCircle, color: "#2563eb" },
    { label: "未开始", value: examsList.filter((e) => e.status === "未开始").length, icon: Clock, color: "#f59e0b" },
    { label: "已结束", value: examsList.filter((e) => e.status === "已结束").length, icon: CheckCircle2, color: "#10b981" },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <PrdAnnotation data={getAnnotation("lex-page")}>
      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 py-10 text-white"
        style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb, #3b82f6)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center gap-3">
            <Link href="/evaluation/landing">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Button>
            </Link>
          </div>
          <PrdAnnotation data={getAnnotation("lex-hero")}>
            <h1 className="text-2xl font-bold">考试中心</h1>
            <p className="mt-1 text-sm text-white/80">查看和管理你的所有考试，随时开始答题</p>
          </PrdAnnotation>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats */}
        <PrdAnnotation data={getAnnotation("lex-stats")}>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        </PrdAnnotation>

        {/* Tabs + Search */}
        <PrdAnnotation data={getAnnotation("lex-tabs")}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {(["my", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                style={
                  tab === t
                    ? { background: "#2563eb", color: "#fff" }
                    : { background: "#fff", color: "#666", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                }
              >
                {t === "my" ? "我的考试" : "全部考试"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索考试名称、编码与班级名称"
                className="h-9 rounded-full border-0 bg-white pl-9 text-sm shadow-sm"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 whitespace-nowrap">二级院系</span>
              <select
                value={collegeFilter}
                onChange={(e) => setCollegeFilter(e.target.value)}
                className="h-9 rounded-full border-0 bg-white px-3 text-sm text-gray-700 shadow-sm outline-none"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {collegeOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 whitespace-nowrap">适用专业</span>
              <select
                value={majorFilter}
                onChange={(e) => setMajorFilter(e.target.value)}
                className="h-9 rounded-full border-0 bg-white px-3 text-sm text-gray-700 shadow-sm outline-none"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {majorOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        </PrdAnnotation>

        {/* Grid */}
        <PrdAnnotation data={getAnnotation("lex-list")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examsList.map((exam) => {
            const meta = statusMeta[exam.status] || statusMeta["未开始"]
            const StatusIcon = meta.icon
            return (
              <Link key={exam.id} href={`/evaluation/landing/exams/${exam.id}`} className="block">
                <div
                  className="h-full cursor-pointer rounded-xl bg-white p-5 transition-all duration-300"
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
                  <div className="mb-3 flex items-start justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: "#eff6ff", color: "#2563eb" }}
                    >
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <span
                      className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {exam.status}
                    </span>
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-gray-900">{exam.name}</h3>
                  <p className="mb-3 text-sm text-gray-500 line-clamp-2">{exam.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exam.duration} 分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {exam.questionCount} 题
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {exam.time}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    考试对象：{(exam as any).targetAudience}
                  </div>
                  {exam.status === "进行中" && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        className="w-full gap-1 rounded-lg"
                        style={{ background: "#2563eb" }}
                      >
                        <PlayCircle className="h-4 w-4" />
                        开始考试
                      </Button>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
        </PrdAnnotation>

        {examsList.length === 0 && (
          <div className="rounded-xl bg-white py-20 text-center text-sm text-gray-400" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <ClipboardList className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>暂无考试</p>
          </div>
        )}
      </div>
      </PrdAnnotation>
    </div>
  )
}
