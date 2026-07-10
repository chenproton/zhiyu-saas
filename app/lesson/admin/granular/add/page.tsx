"use client"

import { useState, useRef, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Send,
  Star,
  BookOpen,
  GraduationCap,
  ImageUp,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { SystemCourseNode, NodeResource } from "@/lib/types/lesson-source"

import { KnowledgeSelector } from "../../_components/knowledge/knowledge-selector"
import { ResourceSelector, type ResourceItem } from "../../_components/resources/resource-selector"
import { RichTextEditor } from "../../_components/common/rich-text-editor"

import PublishCheckPanel from "../../system/add/_components/PublishCheckPanel"

import type {
  KnowledgePointItem,
} from "@/lib/mock-data-lesson"

/* ---------- mock data ---------- */

const MOCK_KNOWLEDGE_POOL: KnowledgePointItem[] = [
  { id: "kp-1", name: "SQL注入", code: "KP-001", description: "常见的Web安全漏洞", linked: false },
  { id: "kp-2", name: "XSS攻击", code: "KP-002", description: "跨站脚本攻击", linked: false },
  { id: "kp-3", name: "CSRF防护", code: "KP-003", description: "跨站请求伪造防护", linked: false },
  { id: "kp-4", name: "密码学", code: "KP-004", description: "加密与解密技术", linked: false },
  { id: "kp-5", name: "渗透测试", code: "KP-005", description: "安全评估方法", linked: false },
  { id: "kp-6", name: "P值与显著性", code: "KP-006", description: "统计推断基础", linked: false },
  { id: "kp-7", name: "假设检验", code: "KP-007", description: "统计假设验证方法", linked: false },
  { id: "kp-8", name: "T检验", code: "KP-008", description: "小样本均值检验", linked: false },
  { id: "kp-9", name: "组件封装", code: "KP-009", description: "前端组件化开发", linked: false },
  { id: "kp-10", name: "状态管理", code: "KP-010", description: "应用状态管理方案", linked: false },
]

const MOCK_RESOURCE_POOL: ResourceItem[] = [
  { id: "res-1", name: "假设检验课件.pptx", type: "document", url: "/resources/1.pptx", uploadedBy: "张老师", uploadedAt: "2024-01-15" },
  { id: "res-2", name: "统计实验手册.pdf", type: "document", url: "/resources/2.pdf", uploadedBy: "李老师", uploadedAt: "2024-02-20" },
  { id: "res-3", name: "假设检验教学视频", type: "video", url: "/resources/3.mp4", uploadedBy: "王老师", uploadedAt: "2024-03-10" },
  { id: "res-4", name: "统计学习资料链接", type: "link", url: "https://example.com/stats", uploadedBy: "赵老师", uploadedAt: "2024-03-15" },
  { id: "res-5", name: "实验数据集.xlsx", type: "spreadsheet", url: "/resources/5.xlsx", uploadedBy: "刘老师", uploadedAt: "2024-04-01" },
  { id: "res-6", name: "教学图片素材", type: "image", url: "/resources/6.jpg", uploadedBy: "陈老师", uploadedAt: "2024-04-10" },
  { id: "res-7", name: "课程音频讲解", type: "audio", url: "/resources/7.mp3", uploadedBy: "周老师", uploadedAt: "2024-05-01" },
]

/* ---------- main component ---------- */

function AddGranularPageInner() {
  const searchParams = useSearchParams()
  const isEdit = searchParams.get("mode") === "edit"

  /* module 1: basic info */
  const [courseName, setCourseName] = useState(isEdit ? "假设检验" : "")
  const [courseCode] = useState(isEdit ? "GRA-STAT101" : `GRA-${Date.now().toString(36).toUpperCase()}`)
  const [hours, setHours] = useState(isEdit ? "2" : "")
  const [learningGoal, setLearningGoal] = useState(isEdit ? "掌握假设检验的基本原理与方法论" : "")
  const [courseType, setCourseType] = useState<"normal" | "granular">("normal")
  const [difficulty, setDifficulty] = useState<number>(isEdit ? 3 : 0)
  const [coverImage, setCoverImage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* module 2: knowledge points */
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePointItem[]>(
    isEdit
      ? [
          { id: "kp-7", name: "假设检验", code: "KP-007", description: "统计假设验证方法", linked: true },
          { id: "kp-6", name: "P值与显著性", code: "KP-006", description: "统计推断基础", linked: true },
        ]
      : []
  )

  /* module 3: resources */
  const [resourcePool, setResourcePool] = useState<ResourceItem[]>(MOCK_RESOURCE_POOL)
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>(
    isEdit ? ["res-1", "res-2"] : []
  )

  /* ---------- construct current node for publish check ---------- */
  const currentCheckNode: SystemCourseNode | undefined = useMemo(() => {
    const kpForCheck = knowledgePoints.map((kp) => ({
      name: kp.name,
      linked: kp.linked ?? false,
    }))

    const resForCheck: NodeResource[] = selectedResourceIds
      .map((id) => {
        const r = resourcePool.find((x) => x.id === id)
        if (!r) return null
        return {
          id: r.id,
          name: r.name,
          type: r.type,
          size: 0,
          url: r.url,
        }
      })
      .filter(Boolean) as NodeResource[]

    return {
      id: "granular-current",
      courseId: "granular-1",
      parentId: null,
      name: courseName || "未命名",
      order: 1,
      type: courseType === "granular" ? "original" : "normal",
      status: "draft" as const,
      teachingGoals: learningGoal,
      duration: parseInt(hours) || 0,
      knowledgePoints: kpForCheck,
      resources: resForCheck,
      quizzes: [],
      homeworks: [],
    }
  }, [courseName, hours, learningGoal, knowledgePoints, selectedResourceIds, resourcePool, courseType])

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/lesson/admin/granular">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  返回列表
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">
                {isEdit ? "编辑颗粒课" : "新建颗粒课"}
                {courseName && <span className="text-gray-400 font-normal ml-2">- {courseName}</span>}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.success("颗粒课草稿已保存")}>
                <Save className="h-4 w-4" />
                保存草稿
              </Button>
              <Button size="sm" className="gap-1 bg-[#1890ff] hover:bg-[#40a9ff]" onClick={() => toast.success("颗粒课已提交审核")}>
                <Send className="h-4 w-4" />
                提交
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* ========== Two-column layout: center content + right publish check ========== */}
        <div className="grid grid-cols-[1fr_260px] gap-6">

          {/* Center: Content modules */}
          <main className="space-y-5 min-w-0">
            {/* Module 1: Basic Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1890ff]" />
                  基本信息配置
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">课程名称</Label>
                    <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="请输入课程名称" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">课程编码</Label>
                    <Input value={courseCode} disabled className="h-9 text-sm bg-gray-50 text-gray-500" />
                    <p className="text-[10px] text-gray-400">系统自动生成，不可修改</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">预计课时</Label>
                    <Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="请输入课时数" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">难度等级</Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setDifficulty(star)}
                          className="p-1 transition-colors"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= difficulty
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-gray-400 ml-2">
                        {difficulty > 0 ? `${difficulty} 星` : "请选择难度"}
                      </span>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs">学习目标</Label>
                    <RichTextEditor
                      value={learningGoal}
                      onChange={setLearningGoal}
                      minHeight={280}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs">封面图片</Label>
                    <div className="flex items-start gap-4">
                      {coverImage ? (
                        <div className="relative w-[200px] h-[120px] rounded-lg overflow-hidden border border-gray-200">
                          <img src={coverImage} alt="封面预览" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setCoverImage("")}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/70"
                          >✕</button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-[200px] h-[120px] rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                        >
                          <ImageUp className="w-8 h-8 text-gray-400" />
                          <span className="text-xs text-gray-400 mt-1">点击上传封面</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (ev) => setCoverImage(ev.target?.result as string)
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Module 2: Knowledge Points */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#1890ff]" />
                  关联知识点
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <KnowledgeSelector
                  selected={knowledgePoints}
                  pool={MOCK_KNOWLEDGE_POOL}
                  onChange={setKnowledgePoints}
                  onAddCustom={(name, description) => {
                    const newKp: KnowledgePointItem = {
                      id: `kp-custom-${Date.now()}`,
                      name,
                      description,
                      linked: false,
                    }
                    setKnowledgePoints((prev) => [...prev, newKp])
                  }}
                />
              </CardContent>
            </Card>

            {/* Module 3: Resources */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1890ff]" />
                  配置课程资源
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResourceSelector
                  pool={resourcePool}
                  selectedIds={selectedResourceIds}
                  onChange={setSelectedResourceIds}
                  onUpload={(r) => setResourcePool((prev) => [...prev, r])}
                />
              </CardContent>
            </Card>

            {/* Bottom spacer */}
            <div className="h-12" />
          </main>

          {/* Right: Publish Check Panel */}
          <PublishCheckPanel node={currentCheckNode} />
        </div>
      </div>
    </div>
  )
}

export default function AddGranularPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center text-gray-400">加载中...</div>}>
      <AddGranularPageInner />
    </Suspense>
  )
}
