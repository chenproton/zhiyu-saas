"use client"

import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useMemo } from "react"
import {
  ArrowLeft, Award, CheckCircle2, TrendingUp,
  Clock, Star, Layers, Flag, ArrowUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/components/providers/data-provider"

/* ─── 届别类型 ─── */
type GradeYear = "2024" | "2025" | "2026"

interface CompItem {
  name: string
  target: number
  current: number
  desc: string
}

interface CompGroup {
  duty: string
  items: CompItem[]
}

interface LeaderboardStudent {
  id: string
  studentName: string
  className: string
  major: string
  achievementRate: number
  grade: string
}

interface GradeData {
  totalPoints: number
  avgRate: number
  lastUpdated: string
  compData: CompGroup[]
  leaderboard: LeaderboardStudent[]
}

const LEVELS = ["了解", "理解", "掌握", "熟练", "精通"]

const MAJOR_OPTIONS = ["全部", "软件工程", "电子自动化", "计算机科学", "网络工程", "数字媒体"]

/* ─── 各届数据 ─── */
const GRADE_DATA_MAP: Record<GradeYear, GradeData> = {
  "2024": {
    totalPoints: 12,
    avgRate: 78,
    lastUpdated: "2024-06-15",
    compData: [
      {
        duty: "页面开发与还原",
        items: [
          { name: "HTML5语义化标签应用", target: 3, current: 3, desc: "正确运用语义化标签，应用ARIA属性提升无障碍访问性。" },
          { name: "CSS3布局与样式设计", target: 4, current: 5, desc: "精通Flex/Grid，能独立实现复杂响应式页面，动画流畅。" },
        ],
      },
      {
        duty: "交互功能实现",
        items: [
          { name: "DOM操作与事件处理", target: 3, current: 4, desc: "掌握节点操作，理解事件机制，应用事件委托。" },
          { name: "异步编程处理", target: 4, current: 2, desc: "熟练使用Promise与async/await处理复杂异步流程。" },
        ],
      },
      {
        duty: "前端框架应用",
        items: [
          { name: "Vue/React组件化开发", target: 5, current: 5, desc: "精通组合式API/Hooks，设计高复用组件体系，跨组件通信。" },
          { name: "应用状态管理", target: 3, current: 3, desc: "熟练使用Pinia/Redux，跨页面状态共享与持久化。" },
        ],
      },
      {
        duty: "接口对接与数据处理",
        items: [
          { name: "接口对接与联调", target: 4, current: 3, desc: "封装Axios，统一拦截处理请求响应，独立完成联调。" },
        ],
      },
      {
        duty: "性能优化与调试",
        items: [
          { name: "页面性能优化实施", target: 3, current: 1, desc: "分析Web Vitals，实施代码分割、懒加载等策略。" },
        ],
      },
      {
        duty: "代码质量保障",
        items: [
          { name: "代码评审与规范", target: 3, current: 3, desc: "遵循ESLint规范，主导并参与团队Code Review。" },
        ],
      },
    ],
    leaderboard: [
      { id: "r1", studentName: "张小明", className: "2024级前端1班", major: "软件工程", achievementRate: 92, grade: "A+" },
      { id: "r2", studentName: "李华", className: "2024级前端2班", major: "计算机科学", achievementRate: 88, grade: "A" },
      { id: "r3", studentName: "王芳", className: "2024级前端1班", major: "软件工程", achievementRate: 85, grade: "A" },
      { id: "r4", studentName: "赵强", className: "2024级后端1班", major: "网络工程", achievementRate: 80, grade: "B+" },
      { id: "r5", studentName: "孙丽", className: "2024级前端2班", major: "数字媒体", achievementRate: 76, grade: "B+" },
      { id: "r6", studentName: "周杰", className: "2024级前端1班", major: "软件工程", achievementRate: 72, grade: "B" },
      { id: "r7", studentName: "吴敏", className: "2024级后端2班", major: "计算机科学", achievementRate: 68, grade: "B" },
      { id: "r8", studentName: "郑伟", className: "2024级前端1班", major: "电子自动化", achievementRate: 65, grade: "C+" },
    ],
  },
  "2025": {
    totalPoints: 15,
    avgRate: 82,
    lastUpdated: "2025-01-20",
    compData: [
      {
        duty: "基础页面构建",
        items: [
          { name: "HTML5/CSS3 核心基础", target: 4, current: 4, desc: "熟练使用语义化标签，掌握 CSS 选择器优先级与盒模型。" },
          { name: "响应式与移动端适配", target: 3, current: 3, desc: "掌握媒体查询、rem/vw 适配方案，实现多端一致体验。" },
        ],
      },
      {
        duty: "JavaScript 核心",
        items: [
          { name: "ES6+ 语法与特性", target: 4, current: 5, desc: "熟练使用解构、箭头函数、模块化、Promise 等现代语法。" },
          { name: "闭包与作用域链", target: 3, current: 3, desc: "理解词法作用域、闭包原理，能在实际场景中正确应用。" },
        ],
      },
      {
        duty: "框架工程化",
        items: [
          { name: "Vue3 组合式 API", target: 5, current: 4, desc: "掌握 setup、ref、reactive、computed 等核心 API。" },
          { name: "React Hooks 深入", target: 4, current: 4, desc: "熟练使用 useState、useEffect、useMemo、自定义 Hooks。" },
          { name: "前端工程化工具", target: 3, current: 2, desc: "掌握 Vite、Webpack 配置，能优化构建性能。" },
        ],
      },
      {
        duty: "数据交互",
        items: [
          { name: "RESTful API 设计与对接", target: 4, current: 4, desc: "理解 REST 规范，能设计合理接口并完成前后端联调。" },
        ],
      },
      {
        duty: "质量与性能",
        items: [
          { name: "单元测试与自动化", target: 3, current: 2, desc: "使用 Jest/Vitest 编写单元测试，保证代码可靠性。" },
        ],
      },
    ],
    leaderboard: [
      { id: "r9", studentName: "陈晨", className: "2025级前端1班", major: "软件工程", achievementRate: 95, grade: "A+" },
      { id: "r10", studentName: "刘洋", className: "2025级前端2班", major: "计算机科学", achievementRate: 91, grade: "A+" },
      { id: "r11", studentName: "黄婷", className: "2025级前端1班", major: "软件工程", achievementRate: 87, grade: "A" },
      { id: "r12", studentName: "林峰", className: "2025级全栈班", major: "网络工程", achievementRate: 84, grade: "A" },
      { id: "r13", studentName: "何静", className: "2025级前端2班", major: "数字媒体", achievementRate: 81, grade: "B+" },
      { id: "r14", studentName: "谢磊", className: "2025级前端1班", major: "电子自动化", achievementRate: 77, grade: "B+" },
      { id: "r15", studentName: "罗娜", className: "2025级后端1班", major: "计算机科学", achievementRate: 73, grade: "B" },
      { id: "r16", studentName: "高飞", className: "2025级前端2班", major: "软件工程", achievementRate: 70, grade: "B" },
    ],
  },
  "2026": {
    totalPoints: 18,
    avgRate: 68,
    lastUpdated: "2025-11-10",
    compData: [
      {
        duty: "全栈基础",
        items: [
          { name: "TypeScript 类型系统", target: 4, current: 2, desc: "掌握接口、泛型、类型推断，能编写类型安全的代码。" },
          { name: "Node.js 服务端基础", target: 3, current: 1, desc: "了解 Express/Koa，能编写简单接口与中间件。" },
        ],
      },
      {
        duty: "现代前端技术",
        items: [
          { name: "Next.js / Nuxt.js 应用", target: 5, current: 3, desc: "掌握 SSR/SSG、路由、API Routes 等全栈框架能力。" },
          { name: "微前端架构", target: 3, current: 1, desc: "了解 qiankun / Module Federation，能进行微前端拆分。" },
        ],
      },
      {
        duty: "工程与交付",
        items: [
          { name: "CI/CD 与自动化部署", target: 4, current: 2, desc: "熟悉 GitHub Actions、Docker 基础镜像构建。" },
          { name: "性能监控与埋点", target: 3, current: 1, desc: "掌握 Lighthouse、Web Vitals、错误监控接入。" },
        ],
      },
      {
        duty: "软技能",
        items: [
          { name: "技术文档与表达", target: 3, current: 2, desc: "能编写清晰的技术方案、接口文档与项目 README。" },
        ],
      },
    ],
    leaderboard: [
      { id: "r17", studentName: "杨帆", className: "2026级前端1班", major: "软件工程", achievementRate: 86, grade: "A" },
      { id: "r18", studentName: "徐倩", className: "2026级前端1班", major: "计算机科学", achievementRate: 82, grade: "A" },
      { id: "r19", studentName: "马超", className: "2026级全栈班", major: "网络工程", achievementRate: 75, grade: "B+" },
      { id: "r20", studentName: "朱婷", className: "2026级前端2班", major: "数字媒体", achievementRate: 71, grade: "B" },
      { id: "r21", studentName: "胡军", className: "2026级前端1班", major: "电子自动化", achievementRate: 66, grade: "B" },
      { id: "r22", studentName: "郭燕", className: "2026级后端1班", major: "软件工程", achievementRate: 62, grade: "C+" },
      { id: "r23", studentName: "萧然", className: "2026级前端2班", major: "计算机科学", achievementRate: 58, grade: "C+" },
      { id: "r24", studentName: "曾诚", className: "2026级前端1班", major: "网络工程", achievementRate: 55, grade: "C" },
    ],
  },
}

export default function CertificationDetailPage() {
  const params = useParams()
  const certId = params.id as string
  const { positionsList } = useData()

  const cert = positionsList.find((p) => p.id === certId)

  const [activeGrade, setActiveGrade] = useState<GradeYear>("2024")
  const [activeCompDuty, setActiveCompDuty] = useState(0)
  const [majorFilter, setMajorFilter] = useState("全部")

  const gradeData = GRADE_DATA_MAP[activeGrade]

  const filteredResults = useMemo(() => {
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

  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: "#f5f6f7", color: "#8f959e", label: "草稿" },
    not_submitted: { bg: "#fef3c7", color: "#d97706", label: "未提交" },
    reviewing: { bg: "#dbeafe", color: "#3b82f6", label: "审核中" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "已驳回" },
    ready: { bg: "#e0e7ff", color: "#4f46e5", label: "待发布" },
    published: { bg: "#dcfce7", color: "#16a34a", label: "已发布" },
    none: { bg: "#f5f6f7", color: "#8f959e", label: "无规则" },
  }
  const st = statusMap[cert.ruleStatus] || statusMap.draft

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
          {/* status tag removed */}
        </div>

        {/* 届别 Tab */}
        <PrdAnnotation data={getAnnotation("lc-grade-switch")}>
        <div style={{ padding: "16px 32px 0", display: "flex", gap: 12, borderBottom: "1px solid #f0f0f0" }}>
          {(["2024", "2025", "2026"] as GradeYear[]).map((g) => (
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
      </div>

      {/* 能力认定要求 */}
      <PrdAnnotation data={getAnnotation("lc-competency")}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Award style={{ width: 18, height: 18, color: "#f59e0b" }} /> 能力认定要求
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>当前：{activeGrade} 届</span>
        </h3>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {MAJOR_OPTIONS.map((m) => (
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
    </div>
    </PrdAnnotation>
  )
}
