"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Layers,
  CheckCircle2,
  Briefcase,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useData } from "@/components/providers/data-provider"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

export default function EvaluationMethodsListPage() {
  const { evaluationCategories, evaluationMethods } = useData()

  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"platform" | "industry">("platform")
  const [activeSub, setActiveSub] = useState("全部")

  const enabledMethods = evaluationMethods.filter((m) => m.enabled)

  const platformCount = enabledMethods.filter((m) => {
    const cat = evaluationCategories.find((c) => c.id === m.categoryId)
    return cat?.name === "平台通用"
  }).length

  const industryCount = enabledMethods.filter((m) => {
    const cat = evaluationCategories.find((c) => c.id === m.categoryId)
    return cat?.name === "行业专属"
  }).length

  const stats = [
    { label: "测评方式", value: enabledMethods.length, icon: Layers, color: "#2563eb" },
    { label: "平台通用", value: platformCount, icon: CheckCircle2, color: "#10b981" },
    { label: "行业专属", value: industryCount, icon: Briefcase, color: "#f59e0b" },
    { label: "已启用", value: enabledMethods.length, icon: Shield, color: "#8b5cf6" },
  ]

  const availableSubCategories = useMemo(() => {
    const subs = new Set<string>()
    enabledMethods.forEach((m) => {
      if (activeTab === "platform") {
        const cat = evaluationCategories.find((c) => c.id === m.categoryId)
        if (cat?.name === "平台通用") subs.add(m.subCategoryName || '-')
      } else if (activeTab === "industry") {
        const cat = evaluationCategories.find((c) => c.id === m.categoryId)
        if (cat?.name === "行业专属") subs.add(m.subCategoryName || '-')
      }
    })
    return ["全部", ...Array.from(subs)]
  }, [activeTab, enabledMethods, evaluationCategories])

  const displayList = useMemo(() => {
    let list = [...enabledMethods]
    if (activeTab === "platform") {
      list = list.filter((m) => {
        const cat = evaluationCategories.find((c) => c.id === m.categoryId)
        return cat?.name === "平台通用"
      })
    } else if (activeTab === "industry") {
      list = list.filter((m) => {
        const cat = evaluationCategories.find((c) => c.id === m.categoryId)
        return cat?.name === "行业专属"
      })
    }
    if (activeSub !== "全部") {
      list = list.filter((m) => (m.subCategoryName || '-') === activeSub)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((m) => m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q))
    }
    return list
  }, [activeTab, activeSub, search, enabledMethods, evaluationCategories])

  const covers = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #30cfd0, #330867)",
    "linear-gradient(135deg, #a8edea, #fed6e3)",
  ]

  const icons = ["📝", "💻", "🎤", "📁", "🔧", "🛡️"]

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <PrdAnnotation data={getAnnotation("lem-page")}>
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
          <PrdAnnotation data={getAnnotation("lem-hero")}>
            <h1 className="text-2xl font-bold">测评方式库</h1>
            <p className="mt-1 text-sm text-white/80">覆盖知识测评、过程评价、成果评价及行业专属测评方式</p>
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
              { key: "platform" as const, label: "平台通用" },
              { key: "industry" as const, label: "行业专属" },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setActiveSub("全部") }}
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
              placeholder="搜索测评方式..."
              className="h-9 rounded-full border-0 bg-white pl-9 text-sm shadow-sm"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 二级分类筛选 */}
        <div
          className="mb-6 rounded-xl bg-white p-4"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400">二级分类：</span>
            {availableSubCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className="rounded-md px-3 py-1 text-xs font-medium transition-colors"
                style={
                  activeSub === sub
                    ? { background: "#eff6ff", color: "#2563eb" }
                    : { background: "#f8fafc", color: "#64748b" }
                }
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {displayList.map((method, i) => (
            <div
              key={method.id}
              style={{
                background: "#fff",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all 0.25s",
                cursor: "pointer",
              }}
              onClick={() => method.docLink && window.open(method.docLink, "_blank")}
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
                  height: 110,
                  background: covers[i % covers.length],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                }}
              >
                {icons[i % icons.length]}
              </div>
              <div style={{ padding: 16 }}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                    }}
                  >
                    {method.subCategoryName || "通用"}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 14,
                    marginBottom: 8,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  {method.name}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    lineHeight: 1.6,
                    marginBottom: 12,
                    height: 36,
                    overflow: "hidden",
                  }}
                >
                  {method.description || "暂无说明"}
                </p>
                <span
                  style={{
                    fontSize: 13,
                    color: "#2563eb",
                    fontWeight: 500,
                  }}
                >
                  查看使用说明 ›
                </span>
              </div>
            </div>
          ))}
        </div>

        {displayList.length === 0 && (
          <div
            className="rounded-xl bg-white py-12 text-center text-sm text-gray-400"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            暂无匹配测评方式
          </div>
        )}
      </div>
      </PrdAnnotation>
    </div>
  )
}
