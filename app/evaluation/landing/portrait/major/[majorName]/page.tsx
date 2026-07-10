"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useMemo } from "react"
import {
  ArrowLeft,
  UserCircle,
  Award,
  BarChart3,
  BookOpen,
  TrendingUp,
  Medal,
  Users,
  Star,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/components/providers/data-provider"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"
import { StudentPortraitModal } from "@/components/shared/student-portrait-modal"

const gradeMap: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 }
const gradeColors: Record<string, string> = {
  A: "#16a34a", B: "#3b82f6", C: "#f59e0b", D: "#f97316", E: "#dc2626",
}

export default function MajorPortraitPage() {
  const params = useParams()
  const majorName = decodeURIComponent(params.majorName as string)
  const { studentAbilityPortraits } = useData()
  const [classFilter, setClassFilter] = useState("全部")
  const [portraitModalOpen, setPortraitModalOpen] = useState(false)

  const students = useMemo(
    () => studentAbilityPortraits.filter((p) => p.majorName === majorName),
    [studentAbilityPortraits, majorName]
  )

  const classOptions = useMemo(
    () => ["全部", ...Array.from(new Set(students.map((p) => p.className)))],
    [students]
  )

  const filteredStudents = useMemo(
    () =>
      (classFilter === "全部" ? students : students.filter((p) => p.className === classFilter))
        .slice()
        .sort((a, b) => {
          const ga = gradeMap[a.overallGrade] || 0
          const gb = gradeMap[b.overallGrade] || 0
          if (gb !== ga) return gb - ga
          return b.totalCredits - a.totalCredits
        }),
    [students, classFilter]
  )

  const avgScore =
    filteredStudents.length > 0
      ? filteredStudents.reduce((sum, _, i) => sum + (98.5 - i * 1.6), 0) / filteredStudents.length
      : 0

  const stats = [
    { label: "学生总数", value: filteredStudents.length, icon: Users, color: "#2563eb" },
    { label: "平均综合分", value: avgScore.toFixed(1), icon: BarChart3, color: "#f59e0b" },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <PrdAnnotation data={getAnnotation("lpm-page")}>
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
          <PrdAnnotation data={getAnnotation("lpm-hero")}>
            <h1 className="text-2xl font-bold">{majorName} 学生排行榜</h1>
            <p className="mt-1 text-sm text-white/80">专业内学生能力画像排名，综合评级与学分统计</p>
          </PrdAnnotation>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
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

        {/* Ranking list */}
        <div
          className="rounded-xl bg-white p-5"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Medal className="h-5 w-5" style={{ color: "#f59e0b" }} />
            <h2 className="text-base font-semibold text-gray-900">专业排名</h2>
          </div>

          {/* 班级筛选 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>班级筛选：</span>
            {classOptions.map((c) => (
              <button
                key={c}
                onClick={() => setClassFilter(c)}
                style={{
                  padding: "4px 12px", borderRadius: 12, fontSize: 13, cursor: "pointer",
                  color: classFilter === c ? "#fff" : "#64748b",
                  background: classFilter === c ? "#2563eb" : "#f8fafc",
                  transition: "all 0.2s", fontWeight: 500, border: "none",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {filteredStudents.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400">
              <UserCircle className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>暂无该班级学生数据</p>
            </div>
          ) : (
            <div>
              {/* 表头 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 1fr 1fr 100px 120px",
                  alignItems: "center",
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#94a3b8",
                  fontWeight: 500,
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div>排名</div>
                <div>姓名</div>
                <div>专业</div>
                <div>班级</div>
                <div style={{ textAlign: "right" }}>综合分</div>
                <div style={{ textAlign: "center" }}>操作</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {filteredStudents.map((p, i) => {
                  const isTop = i < 3
                  const rankBg = isTop
                    ? i === 0
                      ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                      : i === 1
                        ? "linear-gradient(135deg, #cbd5e1, #94a3b8)"
                        : "linear-gradient(135deg, #fdba74, #f97316)"
                    : "transparent"
                  const rankColor = isTop ? "#fff" : "#64748b"
                  const score = 98.5 - i * 1.6
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 1fr 1fr 1fr 100px 120px",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: i % 2 === 0 ? "#fff" : "#fafbfc",
                        borderRadius: 6,
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                      onClick={() => setPortraitModalOpen(true)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#eff6ff"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc"
                      }}
                    >
                      <div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: rankBg,
                            color: rankColor,
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          {i + 1}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                        {p.studentName}
                      </div>
                      <div style={{ fontSize: 13, color: "#475569" }}>{p.majorName}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{p.className}</div>
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#2563eb",
                        }}
                      >
                        {score.toFixed(1)}
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPortraitModalOpen(true)
                          }}
                        >
                          查看学生画像
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 学生画像弹窗 */}
      <StudentPortraitModal
        open={portraitModalOpen}
        onOpenChange={setPortraitModalOpen}
      />
      </PrdAnnotation>
    </div>
  )
}
