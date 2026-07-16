"use client"

import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import {
  ArrowLeft, Award, CheckCircle2, TrendingUp,
  Clock, Star, Layers, Flag, ArrowUp, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData } from "@/components/providers/data-provider"
import { landingApi } from "@/lib/api"
import type { CertGradeData, CompGroup, LeaderboardEntry } from "@/lib/api"

const LEVELS = ["了解", "理解", "掌握", "熟练", "精通"]

export default function CertificationDetailPage() {
  const params = useParams()
  const certId = params.id as string
  const { positionsList } = useData()

  const cert = positionsList.find((p) => p.id === certId)

  const [gradeDataMap, setGradeDataMap] = useState<Record<string, CertGradeData>>({})
  const [loading, setLoading] = useState(true)
  const gradeYears = useMemo(() => Object.keys(gradeDataMap).sort(), [gradeDataMap])

  const [activeGrade, setActiveGrade] = useState("")
  const [activeCompDuty, setActiveCompDuty] = useState(0)
  const [majorFilter, setMajorFilter] = useState("全部")

  useEffect(() => {
    if (!certId) return
    setLoading(true)
    landingApi.getCertGrades(certId)
      .then((res) => {
        setGradeDataMap(res.grades)
        const years = Object.keys(res.grades).sort()
        if (years.length > 0 && !activeGrade) {
          setActiveGrade(years[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [certId])

  const gradeData = gradeDataMap[activeGrade] as CertGradeData | undefined

  const majorOptions = useMemo(() => {
    if (!gradeData) return ["全部"]
    const majors = new Set(gradeData.leaderboard.map((r) => r.major).filter(Boolean))
    return ["全部", ...Array.from(majors)]
  }, [gradeData])

  const filteredResults = useMemo(() => {
    if (!gradeData) return []
    const sorted = gradeData.leaderboard.slice().sort((a, b) => b.achievementRate - a.achievementRate)
    if (majorFilter === "全部") return sorted
    return sorted.filter((r) => r.major === majorFilter)
  }, [gradeData, majorFilter])

  if (!cert) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        <Link href="/evaluation/landing/certifications">
          <Button variant="ghost" size="sm" style={{ gap: 6 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> 返回列表
          </Button>
        </Link>
        <div style={{ textAlign: "center", padding: "80px 0", color: "#8f959e" }}>
          <Award style={{ width: 48, height: 48, margin: "0 auto 12px", opacity: 0.3 }} />
          <p>认证项目不存在</p>
        </div>
      </div>
    )
  }

  return (
    <PrdAnnotation data={getAnnotation("lc-page")}>
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/evaluation/landing/certifications">
          <Button variant="ghost" size="sm" style={{ gap: 6 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> 返回认证列表
          </Button>
        </Link>
      </div>

      {/* 头部 */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "24px 32px", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <PrdAnnotation data={getAnnotation("lc-title")}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{cert.name}</h1>
            </PrdAnnotation>
            <p style={{ fontSize: 14, opacity: 0.9 }}>岗位代码：{cert.positionCode} · 适用专业：{cert.professionalDirection}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <Loader2 className="h-8 w-8 animate-spin" style={{ margin: "0 auto", color: "#94a3b8" }} />
          </div>
        ) : gradeYears.length > 0 ? (
          <>
            {/* 届别 Tab */}
            <PrdAnnotation data={getAnnotation("lc-grade-switch")}>
            <div style={{ padding: "16px 32px 0", display: "flex", gap: 12, borderBottom: "1px solid #f0f0f0" }}>
              {gradeYears.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setActiveGrade(g)
                    setActiveCompDuty(0)
                    setMajorFilter("全部")
                  }}
                  style={{
                    padding: "10px 20px",
                    fontSize: 14,
                    fontWeight: activeGrade === g ? 600 : 400,
                    color: activeGrade === g ? "#f59e0b" : "#64748b",
                    border: "none",
                    borderBottom: activeGrade === g ? "2px solid #f59e0b" : "2px solid transparent",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginBottom: -1,
                  }}
                >
                  {g} 届
                </button>
              ))}
            </div>
            </PrdAnnotation>

            {gradeData && (
              <>
                {/* 指标 */}
                <PrdAnnotation data={getAnnotation("lc-stats")}>
                <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                  {[
                    { icon: <Clock style={{ width: 18, height: 18 }} />, label: "能力点", value: `${gradeData.totalPoints} 个` },
                    { icon: <TrendingUp style={{ width: 18, height: 18 }} />, label: "平均达成率(实时)", value: `${gradeData.avgRate}%` },
                    { icon: <Award style={{ width: 18, height: 18 }} />, label: "认定标准最近更新", value: gradeData.lastUpdated },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: "center", padding: "16px 0", background: "#f5f6f7", borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#f59e0b", marginBottom: 6 }}>
                        {item.icon} <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                </PrdAnnotation>
              </>
            )}
          </>
        ) : (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#94a3b8" }}>
            <p>暂无届别数据</p>
          </div>
        )}
      </div>

      {gradeData && (
        <>
          {/* 能力认定要求 */}
          <PrdAnnotation data={getAnnotation("lc-competency")}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Award style={{ width: 18, height: 18, color: "#f59e0b" }} /> 能力认定要求
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>当前：{activeGrade} 届</span>
            </h3>
            {gradeData.compData.length > 0 ? (
              <div style={{ display: "flex", gap: 16, height: 520 }}>
                {/* 左侧菜单 */}
                <div style={{ width: 220, flexShrink: 0, background: "#fafafa", borderRadius: 8, padding: 8, border: "1px solid #f0f0f0", overflowY: "auto" }}>
                  {gradeData.compData.map((group, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveCompDuty(idx)}
                      style={{
                        padding: "10px 14px",
                        fontSize: 13,
                        borderRadius: 6,
                        marginBottom: 4,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        color: activeCompDuty === idx ? "#2563eb" : "#64748b",
                        background: activeCompDuty === idx ? "#eff6ff" : "transparent",
                        fontWeight: activeCompDuty === idx ? 600 : 400,
                      }}
                    >
                      {group.duty}
                    </div>
                  ))}
                </div>
                {/* 右侧内容 */}
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
                  {gradeData.compData.map((group, gIdx) => (
                    <div key={gIdx} style={{ display: activeCompDuty === gIdx ? "block" : "none" }}>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
                        <Layers style={{ width: 16, height: 16, color: "#2563eb" }} />
                        {group.duty}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                        {group.items.map((c, cIdx) => {
                          const fillPct = Math.min(100, Math.max(0, ((c.current - 1) / 4) * 100))
                          const gap = c.target - c.current
                          let statusNode
                          if (gap > 0) {
                            statusNode = <span style={{ color: "#d97706", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><ArrowUp style={{ width: 12, height: 12 }} /> 差 {gap} 级</span>
                          } else if (gap < 0) {
                            statusNode = <span style={{ color: "#13c2c2", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><TrendingUp style={{ width: 12, height: 12 }} /> 已超越</span>
                          } else {
                            statusNode = <span style={{ color: "#16a34a", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 style={{ width: 12, height: 12 }} /> 已达成</span>
                          }
                          return (
                            <div key={cIdx} style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, padding: 14, transition: "box-shadow 0.2s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.1)"; e.currentTarget.style.borderColor = "#bfdbfe" }}
                              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#f0f0f0" }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 10 }}>{c.name}</div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                                <span style={{ color: "#64748b" }}>
                                  <Flag style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle" }} /> 目标掌握度：<strong>{LEVELS[c.target - 1]}</strong>
                                </span>
                                {statusNode}
                              </div>
                              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, padding: 8, background: "#fafafa", borderRadius: 6, borderLeft: "3px solid #2563eb" }}>
                                {c.desc}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>暂无能力认定要求</div>
            )}
          </div>
          </PrdAnnotation>

          {/* 认证排行榜 */}
          <PrdAnnotation data={getAnnotation("lc-leaderboard")}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Star style={{ width: 18, height: 18, color: "#f59e0b" }} /> 岗位能力认定排行榜
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>当前：{activeGrade} 届</span>
            </h3>

            {/* 专业筛选 */}
            {majorOptions.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {majorOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMajorFilter(m)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      fontSize: 13,
                      cursor: "pointer",
                      border: "none",
                      transition: "all 0.2s",
                      fontWeight: 500,
                      background: majorFilter === m ? "#2563eb" : "#f1f5f9",
                      color: majorFilter === m ? "#fff" : "#64748b",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {filteredResults.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "#8f959e" }}>暂无认证记录</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {filteredResults.map((r, idx) => {
                  const rank = idx + 1
                  const rankBg = rank === 1 ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : rank === 2 ? "linear-gradient(135deg, #cbd5e1, #94a3b8)" : rank === 3 ? "linear-gradient(135deg, #fdba74, #f97316)" : "#e2e8f0"
                  const rankColor = rank <= 3 ? "#fff" : "#94a3b8"
                  return (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#f5f6f7", borderRadius: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", background: rankBg, color: rankColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>
                        {rank}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{r.studentName}</div>
                        <div style={{ fontSize: 12, color: "#8f959e" }}>{r.className} · {r.major}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%",
                          background: r.achievementRate >= 80 ? "#dcfce7" : r.achievementRate >= 60 ? "#fef3c7" : "#fee2e2",
                          color: r.achievementRate >= 80 ? "#16a34a" : r.achievementRate >= 60 ? "#d97706" : "#dc2626",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                        }}>
                          {r.achievementRate}%
                        </div>
                        <span style={{ fontSize: 11, color: "#8f959e" }}>达标率</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          </PrdAnnotation>
        </>
      )}
    </div>
    </PrdAnnotation>
  )
}
