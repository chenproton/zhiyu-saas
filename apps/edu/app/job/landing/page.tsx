"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Briefcase, Award, MapPin, Search, Target,
  Star, TrendingUp, Layers, Users, BarChart3,
} from "lucide-react"
import { useData } from "@/components/providers/data-provider"
import { positionApi, learnRoadApi } from "@/lib/api"
import type { CareerPosition, LearnRoad } from "@/lib/types"

function SectionHeader({ title, subtitle, moreHref }: { title: string; subtitle?: string; moreHref?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", color: "#1e293b", position: "relative", paddingLeft: 12 }}>
          <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 4, height: 20, background: "linear-gradient(180deg, #7c3aed, #8b5cf6)", borderRadius: 2 }} />
          {title}
        </h2>
        {subtitle && <span style={{ color: "#94a3b8", fontSize: 13 }}>{subtitle}</span>}
      </div>
      {moreHref && (
        <Link href={moreHref} style={{ color: "#7c3aed", fontSize: 13, textDecoration: "none" }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline" }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none" }}>
          查看全部 ›
        </Link>
      )}
    </div>
  )
}

const statusColors: Record<string, { color: string; label: string }> = {
  published: { color: "#16a34a", label: "已发布" },
  draft: { color: "#64748b", label: "草稿" },
  pending: { color: "#2563eb", label: "审核中" },
  approved: { color: "#8b5cf6", label: "已通过" },
  archived: { color: "#94a3b8", label: "已归档" },
}

const coverGradients = [
  "linear-gradient(135deg, #7c3aed, #a78bfa)",
  "linear-gradient(135deg, #db2777, #f472b6)",
  "linear-gradient(135deg, #0891b2, #22d3ee)",
  "linear-gradient(135deg, #ea580c, #fb923c)",
  "linear-gradient(135deg, #4f46e5, #818cf8)",
  "linear-gradient(135deg, #be185d, #f472b6)",
]

export default function JobLandingPage() {
  const { positionsList, jobAbilityResults } = useData()
  const [positions, setPositions] = useState<CareerPosition[]>([])
  const [learnRoads, setLearnRoads] = useState<LearnRoad[]>([])

  useEffect(() => {
    Promise.all([
      positionApi.list({ limit: 100 }),
      learnRoadApi.list({ limit: 100 }),
    ]).then(([posRes, roadRes]) => {
      setPositions(posRes.items || [])
      setLearnRoads(roadRes.items || [])
    }).catch(() => {})
  }, [])

  const publishedPositions = positions.filter((p) => p.status === "published").slice(0, 6)
  const displayLearnRoads = learnRoads.slice(0, 4)
  const positionTypeMap: Record<string, string> = { enterprise: "企业", teaching: "教学" }

  const stats = [
    { num: positions.length, label: "岗位数量", icon: <Briefcase className="h-5 w-5" /> },
    { num: publishedPositions.length, label: "已发布", icon: <Award className="h-5 w-5" /> },
    { num: jobAbilityResults.length, label: "能力评估记录", icon: <BarChart3 className="h-5 w-5" /> },
    { num: learnRoads.length, label: "学习路径", icon: <TrendingUp className="h-5 w-5" /> },
  ]

  return (
    <div>
      {/* ═══ Hero Banner ═══ */}
      <div style={{
        background: "linear-gradient(135deg, #3b0764 0%, #6b21a8 40%, #7c3aed 100%)",
        color: "#fff", padding: "60px 20px 50px", textAlign: "center", position: "relative", overflow: "hidden", minHeight: 360,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: 40, fontWeight: "bold", marginBottom: 12, letterSpacing: 1 }}>岗位能力培养平台</h1>
          <p style={{ fontSize: 15, opacity: 0.85, marginBottom: 28 }}>对接企业岗位标准，梳理能力模型，规划学习路径，实现精准人才培养</p>
          <div style={{
            background: "#fff", borderRadius: 50, padding: "5px 5px 5px 24px",
            display: "flex", alignItems: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}>
            <Search style={{ width: 18, height: 18, color: "#94a3b8", marginRight: 10 }} />
            <input type="text" placeholder="搜索岗位、能力项、学习路径"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14, padding: "12px 0", color: "#333", background: "transparent" }} />
            <button style={{
              background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", color: "#fff", border: "none",
              padding: "11px 32px", borderRadius: 50, cursor: "pointer", fontSize: 14, fontWeight: 500,
            }}>搜索</button>
          </div>
        </div>
      </div>

      {/* ═══ 主内容 ═══ */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 20px 0" }}>

        {/* ── 数据看板 ── */}
        <section style={{ marginBottom: 50 }}>
          <div style={{
            background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: 24,
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20,
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center", borderRight: i < stats.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, color: "#7c3aed" }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: "bold", color: "#7c3aed", lineHeight: 1.2 }}>{s.num}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 岗位能力库 ── */}
        <section style={{ marginBottom: 50 }}>
          <SectionHeader title="岗位能力认证库" subtitle="已发布的企业/教学岗位标准" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {publishedPositions.map((pos, i) => {
              const st = statusColors[pos.status] || statusColors.draft
              return (
                <div key={pos.id} style={{
                  background: "#fff", borderRadius: 10, overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.25s", cursor: "pointer",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.08)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{
                    height: 120, background: coverGradients[i % coverGradients.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 16, fontWeight: "bold", position: "relative",
                  }}>
                    {pos.name.slice(0, 8)}
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: "rgba(255,255,255,0.25)", color: "#fff",
                    }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 15, marginBottom: 8, color: "#1e293b", fontWeight: 600 }}>{pos.name}</h3>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 4, fontSize: 11,
                        background: "#f3e8ff", color: "#7c3aed", fontWeight: 500,
                      }}>{positionTypeMap[pos.positionType] || pos.positionType}</span>
                      {pos.majorNames?.[0] && (
                        <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                          <MapPin className="h-3 w-3" /> {pos.majorNames[0]}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12, height: 36, overflow: "hidden" }}>
                      {pos.description || "暂无岗位描述"}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#94a3b8" }}>
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {pos.requirements?.length || 0} 项要求</span>
                      <span>版本：{pos.version}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {publishedPositions.length === 0 && (
              <div style={{ gridColumn: "span 3", textAlign: "center", padding: 40, color: "#94a3b8", background: "#fff", borderRadius: 10 }}>暂无已发布岗位</div>
            )}
          </div>
        </section>

        {/* ── 学习路径规划 ── */}
        <section style={{ marginBottom: 50 }}>
          <SectionHeader title="学习路径规划" subtitle="岗位能力提升路径" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {displayLearnRoads.map((road, i) => (
              <div key={road.id} style={{
                background: "#fff", borderRadius: 10, padding: 22,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.25s", cursor: "pointer",
                borderLeft: "4px solid #7c3aed",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.08)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>{road.name}</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 14 }}>
                  {road.description || "暂无路径说明"}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {road.steps?.slice(0, 4).map((step, si) => (
                    <span key={si} style={{
                      background: "#f3e8ff", color: "#7c3aed",
                      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    }}>{step.name}</span>
                  ))}
                  {(!road.steps || road.steps.length === 0) && (
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>暂无步骤</span>
                  )}
                </div>
                <div style={{
                  marginTop: 14, paddingTop: 12, borderTop: "1px dashed #f1f5f9",
                  textAlign: "center", fontSize: 13, color: "#7c3aed", fontWeight: 500,
                }}>
                  查看完整学习路径 ›
                </div>
              </div>
            ))}
            {displayLearnRoads.length === 0 && (
              <div style={{ gridColumn: "span 2", textAlign: "center", padding: 40, color: "#94a3b8", background: "#fff", borderRadius: 10 }}>暂无学习路径</div>
            )}
          </div>
        </section>

        {/* ── 平台优势 ── */}
        <section style={{ marginBottom: 50 }}>
          <SectionHeader title="培养特色" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { title: "企业标准对接", desc: "基于真实企业岗位需求提炼能力模型，确保培养内容与行业标准一致", icon: <Briefcase className="h-6 w-6" /> },
              { title: "能力精准画像", desc: "多维度评估学生能力项，生成个人能力画像与岗位匹配度分析", icon: <Star className="h-6 w-6" /> },
              { title: "路径可视导航", desc: "学习路径逐步解锁，任务驱动的能力进阶，让学生清晰看到成长方向", icon: <TrendingUp className="h-6 w-6" /> },
            ].map((item, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 10, padding: 28,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)", textAlign: "center",
                transition: "all 0.25s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.08)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, color: "#7c3aed" }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#141a2e', marginTop: 60, width: '100vw', position: 'relative', left: 'calc(-50vw + 50%)' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #8b5cf6, #818cf8, #22d3ee)' }} />
          <div style={{ padding: '48px 5% 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, maxWidth: 1280, margin: '0 auto' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 12 }}>场景化数智教学服务平台</h3>
                <p style={{ fontSize: 13, color: '#a8b3cf', lineHeight: 1.8, margin: 0 }}>专注职业教育数字化</p>
                <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 8 }}>版本：V3.2.1</div>
                <a href="#" style={{ color: '#22d3ee', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>访问官网 →</a>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 12 }}>教学资源</h3>
                <p style={{ fontSize: 13, color: '#a8b3cf', lineHeight: 1.8, margin: 0 }}>岗位标准、实践场景、企业导师</p>
                <a href="#" style={{ color: '#22d3ee', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>进入资源商城 →</a>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 12 }}>技术支持</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ fontSize: 13, color: '#a8b3cf', lineHeight: 1.8 }}>服务热线：400-888-8888</li>
                  <li style={{ fontSize: 13, color: '#a8b3cf', lineHeight: 1.8 }}>邮箱：support@example.com</li>
                  <li><a href="#" style={{ color: '#22d3ee', fontSize: 13, textDecoration: 'none' }}>使用手册</a></li>
                  <li><a href="#" style={{ color: '#22d3ee', fontSize: 13, textDecoration: 'none' }}>常见问题</a></li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 12 }}>校内支持</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ fontSize: 13, color: '#a8b3cf', lineHeight: 1.8 }}>授权院校：XX职业技术学院</li>
                  <li style={{ fontSize: 13, color: '#a8b3cf', lineHeight: 1.8 }}>校内管理员：张老师</li>
                  <li style={{ fontSize: 13, color: '#a8b3cf', lineHeight: 1.8 }}>管理员电话：0000-12345678</li>
                </ul>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #29324a', margin: '40px 0 24px' }} />
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#6b7a99', maxWidth: 1280, margin: '0 auto' }}>
              <div>
                <a href="#" style={{ color: '#6b7a99', textDecoration: 'none' }}>隐私政策</a>
                <span style={{ color: '#29324a' }}>&nbsp;|&nbsp;</span>
                <a href="#" style={{ color: '#6b7a99', textDecoration: 'none' }}>用户协议</a>
              </div>
              <div style={{ textAlign: 'right' }}>版权所有 © 2020-2026 杭州知与未来科技有限公司 ｜ 软件著作权登记号：2020SR0123456 ｜ 京ICP备2025105397号-1</div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
