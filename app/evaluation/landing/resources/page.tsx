"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  BookOpen,
  FileText,
  Search,
  Clock,
  Users,
  ClipboardList,
  Star,
  ArrowLeft,
  BarChart3,
  Database,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useData } from "@/components/providers/data-provider"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

// categories removed per request

const bankCovers = [
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #30cfd0, #330867)",
  "linear-gradient(135deg, #a8c0ff, #3f2b96)",
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #30cfd0, #330867)",
]

const examCovers = [
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #30cfd0, #330867)",
  "linear-gradient(135deg, #a8c0ff, #3f2b96)",
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
]

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<"题库" | "试卷">("题库")
  const [search, setSearch] = useState("")
  const { questionBanks: realBanks, exams: realExams } = useData()

  // 用真实题库数据，但需要补充 category/hot/author 等展示字段
  const enrichedBanks = useMemo(() => {
    const fallbackMap: Record<string, { category: string; hot: boolean; author: string }> = {
      "bank-1": { category: "计算机", hot: true, author: "张老师" },
      "bank-2": { category: "经管", hot: false, author: "李老师" },
      "bank-3": { category: "电子信息", hot: false, author: "工学院" },
      "bank-4": { category: "机械制造", hot: false, author: "王老师" },
      "bank-5": { category: "建筑工程", hot: false, author: "赵老师" },
      "bank-6": { category: "医药卫生", hot: true, author: "医学院" },
      "bank-7": { category: "计算机", hot: true, author: "陈老师" },
      "bank-8": { category: "经管", hot: false, author: "刘老师" },
    }
    return realBanks.map((b) => {
      const fb = fallbackMap[b.id] || { category: "其他", hot: false, author: b.creatorId || "系统" }
      return { ...b, category: fb.category, hot: fb.hot, author: fb.author }
    })
  }, [realBanks])

  const filteredBanks = useMemo(
    () =>
      enrichedBanks
        .filter((b) => b.id !== "draft-pool")
        .filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [search, enrichedBanks]
  )

  const filteredExams = useMemo(
    () => realExams.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
    [search, realExams]
  )

  const stats = [
    { label: "题库总数", value: realBanks.length, icon: Database, color: "#2563eb" },
    { label: "试卷总数", value: realExams.length, icon: FileText, color: "#f59e0b" },
    { label: "题目总数", value: realBanks.reduce((sum, b) => sum + b.questionCount, 0), icon: BarChart3, color: "#10b981" },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <PrdAnnotation data={getAnnotation("lrl-page")}>
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
          <PrdAnnotation data={getAnnotation("lrl-hero")}>
            <h1 className="text-2xl font-bold">测评资源</h1>
            <p className="mt-1 text-sm text-white/80">丰富的题库与试卷资源，覆盖多学科多场景</p>
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

        {/* Tabs */}
        <div style={{ display: "flex", gap: 30, borderBottom: "1px solid #e2e8f0", marginBottom: 20 }}>
          {(["题库", "试卷"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "10px 0", fontSize: 15, cursor: "pointer", position: "relative",
              color: activeTab === tab ? "#2563eb" : "#64748b",
              fontWeight: activeTab === tab ? "bold" : "normal",
              border: "none", background: "none",
            }}>
              {tab}中心
              {activeTab === tab && (
                <span style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "#2563eb" }} />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={activeTab === "题库" ? "搜索题库..." : "搜索试卷..."}
              className="h-9 rounded-full border-0 bg-white pl-9 text-sm shadow-sm"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === "题库" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filteredBanks.map((bank, i) => (
              <Link key={bank.id} href={`/evaluation/landing/resources/banks/${bank.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  background: "#fff", borderRadius: 10, overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.25s", cursor: "pointer",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.08)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{
                    height: 100, background: bankCovers[i % bankCovers.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 20, fontWeight: "bold",
                  }}>{bank.name.slice(0, 6)}</div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 15, marginBottom: 10, color: "#1e293b", fontWeight: 600 }}>{bank.name}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: "#64748b" }}>
                      <span>题目数量：<strong style={{ color: "#2563eb" }}>{bank.questionCount}</strong></span>
                      <span>题型：选择/编程</span>
                      <span>创建人：{bank.creatorId || "系统"}</span>
                      <span>共建：{bank.collaboratorIds?.length || 0}人</span>
                      <span>创建：{new Date(bank.createdAt).toLocaleDateString("zh-CN")}</span>
                      <span>更新：{new Date(bank.updatedAt).toLocaleDateString("zh-CN")}</span>
                      <span>版本：{bank.version}</span>
                      <span>编码：{bank.id.slice(0, 6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {filteredBanks.length === 0 && (
              <div style={{ gridColumn: "span 3", textAlign: "center", padding: 40, color: "#94a3b8", background: "#fff", borderRadius: 10 }}>暂无匹配资源</div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filteredExams.map((exam, i) => (
              <Link key={exam.id} href={`/evaluation/landing/resources/exams/${exam.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  background: "#fff", borderRadius: 10, overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.25s", cursor: "pointer",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.08)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{
                    height: 100, background: examCovers[i % examCovers.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 20, fontWeight: "bold",
                  }}>{exam.name.slice(0, 6)}</div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 15, marginBottom: 10, color: "#1e293b", fontWeight: 600 }}>{exam.name}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: "#64748b" }}>
                      <span>时长：<strong style={{ color: "#f59e0b" }}>{exam.duration}分钟</strong></span>
                      <span>题数：{exam.questions.length}题</span>
                      <span>总分：{exam.questions.reduce((s, q) => s + q.score, 0)}分</span>
                      <span>版本：{exam.version}</span>
                      <span>创建：{new Date(exam.createdAt).toLocaleDateString("zh-CN")}</span>
                      <span>更新：{new Date(exam.updatedAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {filteredExams.length === 0 && (
              <div style={{ gridColumn: "span 3", textAlign: "center", padding: 40, color: "#94a3b8", background: "#fff", borderRadius: 10 }}>暂无试卷</div>
            )}
          </div>
        )}
      </div>
      </PrdAnnotation>
    </div>
  )
}
