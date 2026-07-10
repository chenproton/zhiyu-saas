"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft, GraduationCap, Users, MapPin, Clock, Calendar,
  CheckCircle2, AlertCircle, BookOpen, FileText, Award,
  ChevronRight, Building2, Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/components/providers/data-provider"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

export default function GraduationTopicDetailPage() {
  const params = useParams()
  const topicId = params.id as string
  const { graduationProjectTopics, graduationProjectArchives } = useData()

  const topic = graduationProjectTopics.find((t) => t.id === topicId)
  const archives = graduationProjectArchives.filter((a) => a.topicId === topicId)

  if (!topic) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        <Link href="/evaluation/landing/graduation">
          <Button variant="ghost" size="sm" style={{ gap: 6 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> 返回列表
          </Button>
        </Link>
        <div style={{ textAlign: "center", padding: "80px 0", color: "#8f959e" }}>
          <GraduationCap style={{ width: 48, height: 48, margin: "0 auto 12px", opacity: 0.3 }} />
          <p>选题不存在</p>
        </div>
      </div>
    )
  }

  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: "#f5f6f7", color: "#8f959e", label: "草稿" },
    pending: { bg: "#fef3c7", color: "#d97706", label: "待审核" },
    published: { bg: "#dcfce7", color: "#16a34a", label: "已发布" },
    locked: { bg: "#fee2e2", color: "#dc2626", label: "已锁定" },
  }
  const st = statusMap[topic.status] || statusMap.draft
  const remaining = topic.capacity - topic.appliedCount

  return (
    <PrdAnnotation data={getAnnotation("lg-page")}>
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/evaluation/landing/graduation">
          <Button variant="ghost" size="sm" style={{ gap: 6 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> 返回选题广场
          </Button>
        </Link>
      </div>

      {/* 头部 */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "24px 32px", background: "linear-gradient(135deg, #ec4899, #f472b6)", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <PrdAnnotation data={getAnnotation("lg-title")}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{topic.name}</h1>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("lg-position")}>
            <p style={{ fontSize: 14, opacity: 0.9 }}>{topic.positionName} · {topic.college}</p>
            </PrdAnnotation>
          </div>
          <PrdAnnotation data={getAnnotation("lg-status")}>
          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "rgba(255,255,255,0.2)" }}>
            {st.label}
          </span>
          </PrdAnnotation>
        </div>
        <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
            { icon: <Users style={{ width: 18, height: 18 }} />, label: "导师", value: topic.advisorName, aid: "lg-advisor" },
            { icon: <MapPin style={{ width: 18, height: 18 }} />, label: "方向", value: topic.positionName, aid: "lg-position" },
            { icon: <Calendar style={{ width: 18, height: 18 }} />, label: "时间范围", value: `${new Date(topic.startDate).toLocaleDateString("zh-CN")} ~ ${new Date(topic.endDate).toLocaleDateString("zh-CN")}`, aid: "lg-time-range" },
            { icon: <CheckCircle2 style={{ width: 18, height: 18 }} />, label: "剩余名额", value: `${remaining}/${topic.capacity}`, aid: "lg-capacity" },
          ].map((item, i) => (
            <PrdAnnotation key={i} data={getAnnotation(item.aid!)}>
            <div style={{ textAlign: "center", padding: "16px 0", background: "#f5f6f7", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#ec4899", marginBottom: 6 }}>
                {item.icon} <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{item.value}</div>
            </div>
            </PrdAnnotation>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* 选题详情 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <PrdAnnotation data={getAnnotation("lg-desc")}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen style={{ width: 18, height: 18, color: "#3370ff" }} /> 选题描述
            </h3>
            <p style={{ fontSize: 14, color: "#646a73", lineHeight: 1.8 }}>
              {topic.description || "暂无详细描述，请咨询导师了解更多信息。"}
            </p>
          </div>
          </PrdAnnotation>

          <PrdAnnotation data={getAnnotation("lg-source")}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText style={{ width: 18, height: 18, color: "#3370ff" }} /> 选题来源
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "#f5f6f7", borderRadius: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: topic.source === "scene" ? "#dbeafe" : "#fef3c7", color: topic.source === "scene" ? "#3b82f6" : "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{topic.source === "scene" ? "校内场景课题" : "企业合作课题"}</div>
                <div style={{ fontSize: 12, color: "#8f959e", marginTop: 4 }}>
                  {topic.source === "scene" ? "由校内导师发布的教学场景课题" : `企业导师：${topic.enterpriseMentorName || "待定"}`}
                </div>
              </div>
            </div>
          </div>
          </PrdAnnotation>

          <PrdAnnotation data={getAnnotation("lg-students")}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Users style={{ width: 18, height: 18, color: "#3370ff" }} /> 已选学生
            </h3>
            {archives.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "#8f959e" }}>暂无学生选择该课题</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {archives.slice(0, 6).map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#f5f6f7", borderRadius: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
                      {a.studentName[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{a.studentName}</div>
                      <div style={{ fontSize: 12, color: "#8f959e" }}>学号：{a.studentId}</div>
                    </div>
                    <Badge variant="outline" style={{ fontSize: 11 }}>
                      {a.phase === "proposal" ? "开题" : a.phase === "midterm" ? "中期" : a.phase === "process" ? "过程" : "答辩"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          </PrdAnnotation>
        </div>

        {/* 侧边栏 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <PrdAnnotation data={getAnnotation("lg-info")}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", padding: 24 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>选题信息</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8f959e" }}>课题名称</span>
                <span style={{ fontWeight: 500, textAlign: "right" }}>{topic.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8f959e" }}>所属学院</span>
                <span style={{ fontWeight: 500 }}>{topic.college}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8f959e" }}>导师</span>
                <span style={{ fontWeight: 500 }}>{topic.advisorName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8f959e" }}>专业方向</span>
                <span style={{ fontWeight: 500 }}>{topic.positionName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8f959e" }}>容量</span>
                <span style={{ fontWeight: 500 }}>{topic.capacity} 人</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8f959e" }}>已申请</span>
                <span style={{ fontWeight: 500, color: remaining <= 2 ? "#dc2626" : "#1f2329" }}>{topic.appliedCount} 人</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8f959e" }}>开始时间</span>
                <span style={{ fontWeight: 500 }}>{new Date(topic.startDate).toLocaleDateString("zh-CN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8f959e" }}>结束时间</span>
                <span style={{ fontWeight: 500 }}>{new Date(topic.endDate).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
          </div>
          </PrdAnnotation>

          <PrdAnnotation data={getAnnotation("lg-apply-btn")}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e6eb", padding: 24 }}>
            <Button size="lg" style={{ width: "100%", background: remaining > 0 ? "#3370ff" : "#e5e6eb", color: remaining > 0 ? "white" : "#8f959e" }} disabled={remaining <= 0}>
              {remaining > 0 ? "申请选题" : "名额已满"}
            </Button>
            {remaining > 0 && (
              <p style={{ fontSize: 12, color: "#8f959e", textAlign: "center", marginTop: 12 }}>
                剩余 {remaining} 个名额，请尽快申请
              </p>
            )}
          </div>
          </PrdAnnotation>
        </div>
      </div>
    </div>
    </PrdAnnotation>
  )
}
