"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Award,
  Search,
  Users,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Star,
  BookOpen,
  Building2,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useData } from "@/components/providers/data-provider"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

/* 模拟我的认证岗位 */
const myCertIds = ["pos-1", "pos-2"]

/* 模拟我的感兴趣岗位 */
const interestedCertIds = ["pos-3", "pos-4", "pos-8"]

/* 模拟行业与专业映射 */
const industryMap: Record<string, string> = {
  "pos-1": "信息技术",
  "pos-2": "信息技术",
  "pos-3": "互联网",
  "pos-4": "设计创意",
  "pos-5": "信息技术",
  "pos-6": "信息技术",
  "pos-7": "数据分析",
  "pos-8": "综合管理",
  "pos-9": "综合管理",
  "pos-10": "信息技术",
}

export default function CertificationsPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"my" | "interested" | "all">("my")
  const { positionsList } = useData()

  const myPositions = positionsList.filter((p) => myCertIds.includes(p.id))
  const interestedPositions = positionsList.filter((p) => interestedCertIds.includes(p.id))

  const displayList = useMemo(() => {
    const base = activeTab === "my" ? myPositions : activeTab === "interested" ? interestedPositions : positionsList
    if (!search.trim()) return base
    return base.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.professionalDirection.toLowerCase().includes(search.toLowerCase()))
  }, [activeTab, myPositions, interestedPositions, positionsList, search])

  /* 统计数据 */
  const industries = Array.from(new Set(positionsList.map((p) => industryMap[p.id] || "信息技术")))
  const majors = Array.from(new Set(positionsList.map((p) => p.professionalDirection)))
  const avgPass = Math.round(positionsList.reduce((s, p) => s + (p.relatedAbilityCount * 7), 0) / (positionsList.length || 1))

  const stats = [
    { label: "认证岗位", value: positionsList.length, icon: Award, color: "#2563eb" },
    { label: "面向行业", value: industries.length, icon: Building2, color: "#10b981" },
    { label: "适用专业", value: majors.length, icon: GraduationCap, color: "#f59e0b" },
    { label: "平均通过率", value: `${avgPass}%`, icon: TrendingUp, color: "#8b5cf6" },
  ]

  const covers = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #30cfd0, #330867)",
  ]

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <PrdAnnotation data={getAnnotation("lcl-page")}>
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
          <PrdAnnotation data={getAnnotation("lcl-hero")}>
            <h1 className="text-2xl font-bold">能力认定</h1>
            <p className="mt-1 text-sm text-white/80">岗位技能认证，量化职业能力，助力求职发展</p>
          </PrdAnnotation>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats */}
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

        {/* Tabs + Search */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {([
              { key: "my" as const, label: "我的认证岗位" },
              { key: "interested" as const, label: "我的感兴趣岗位" },
              { key: "all" as const, label: "全部岗位" },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                style={
                  activeTab === t.key
                    ? { background: "#2563eb", color: "#fff" }
                    : { background: "#fff", color: "#666", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索岗位或专业..."
              className="h-9 rounded-full border-0 bg-white pl-9 text-sm shadow-sm"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Position Cards — 与首页岗位能力认证卡片样式一致 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {displayList.map((pos, i) => (
            <Link key={pos.id} href={`/evaluation/landing/certifications/${pos.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  transition: "all 0.25s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)"
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.08)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none"
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"
                }}
              >
                <div
                  style={{
                    height: 100,
                    background: covers[i % covers.length],
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: "bold",
                  }}
                >
                  {pos.name}
                </div>
                <div style={{ padding: 14 }}>
                  <h3 style={{ fontSize: 14, marginBottom: 8, color: "#1e293b", fontWeight: 600 }}>
                    {pos.name}认证
                  </h3>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.8 }}>
                    创建人：{pos.updatedBy} &nbsp; 更新：{pos.lastUpdated}
                    <br />
                    适用专业：{pos.professionalDirection}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: "1px dashed #f1f5f9",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: "#2563eb" }}>
                        {pos.relatedAbilityCount}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>能力点</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {displayList.length === 0 && (
          <div
            className="rounded-xl bg-white py-12 text-center text-sm text-gray-400"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            暂无匹配岗位
          </div>
        )}
      </div>
      </PrdAnnotation>
    </div>
  )
}
