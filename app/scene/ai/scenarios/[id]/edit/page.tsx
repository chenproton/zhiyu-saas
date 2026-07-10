"use client"

import { ArrowRight, Check, ChevronDown, ChevronRight, Eye, ImagePlus, List, ListOrdered, Save, Search, Star, X, UserPlus, Sparkles, Wand2, RefreshCw } from "lucide-react"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"
import { useParams, useRouter } from "next/navigation"
import { useState, useMemo, useRef, useEffect } from "react"
import { AiGenerateButton } from "@/components/ai/ai-generate-button"
import { AiConfidenceBadge } from "@/components/ai/ai-confidence-badge"
import { mockScenarioBackgroundGeneration } from "@/lib/ai-mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { professions, batches, industries, scenarios, allTeachers } from "@/lib/scene-mock-data"

// Organize teachers by department
const departments = Array.from(new Set(allTeachers.map(t => t.department)))

const departmentTree = departments.map(dept => ({
  name: dept,
  users: allTeachers.filter(t => t.department === dept),
}))

// Position tab filter type
type PositionTab = "my" | "collab" | "public"

function IndustryProfessionSelector({
  options,
  selectedIds,
  onChange,
  placeholder,
}: {
  options: { id: string; name: string }[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleOption = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id])
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-auto min-h-[36px] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selectedIds.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedIds.map(id => {
              const opt = options.find(o => o.id === id)
              if (!opt) return null
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                >
                  {opt.name}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      toggleOption(id)
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
          <div className="p-2 max-h-[240px] overflow-y-auto">
            {options.map(opt => (
              <div
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-50",
                  selectedIds.includes(opt.id) && "bg-primary/5 text-primary"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                  selectedIds.includes(opt.id) ? "bg-primary border-primary" : "border-gray-300"
                )}>
                  {selectedIds.includes(opt.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span>{opt.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ScenarioEditPage() {
  const params = useParams()
  const router = useRouter()
  const scenarioId = params.id as string
  
  // Find existing scenario
  const existingScenario = scenarios.find(s => s.id === scenarioId)

  // Form state
  const [scenarioName, setScenarioName] = useState(existingScenario?.name || "")
  const [scenarioCode, setScenarioCode] = useState(existingScenario?.code || `SC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`)
  const [positionId, setPositionId] = useState(existingScenario?.positionId || "")
  const [batchId, setBatchId] = useState(existingScenario?.batchId || "")
  const [industryIds, setIndustryIds] = useState<string[]>(existingScenario?.industryId ? [existingScenario.industryId] : [])
  const [professionIds, setProfessionIds] = useState<string[]>(existingScenario?.professionId ? [existingScenario.professionId] : [])
  const [difficulty, setDifficulty] = useState<number>(existingScenario?.difficulty || 3)
  const [background, setBackground] = useState(existingScenario?.background || "")
  const [creatorName] = useState(existingScenario?.creatorName || "当前用户")
  const [coBuilderIds, setCoBuilderIds] = useState<string[]>(existingScenario?.coBuilders.map(c => c.id) || [])
  const [version] = useState(existingScenario?.version || "v1.0")
  const [coverImage, setCoverImage] = useState(existingScenario?.coverImage || "")
  
  // Position selector state
  const [positionTab, setPositionTab] = useState<PositionTab>("my")
  const [positionSearch, setPositionSearch] = useState("")
  const [isPositionPopoverOpen, setIsPositionPopoverOpen] = useState(false)
  
  // Co-builder transfer state
  const [expandedDepts, setExpandedDepts] = useState<string[]>(departments)
  const [coBuilderSearch, setCoBuilderSearch] = useState("")
  
  // Preview dialog
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)

  // AI generate dialog
  const [aiGenerateLoading, setAiGenerateLoading] = useState(false)
  const [aiGeneratedContent, setAiGeneratedContent] = useState<{ content: string; confidence: "high" | "medium" | "low"; reasoning: string | undefined }>({ content: "", confidence: "medium", reasoning: "" })

  // AI knowledge & ability recommendation
  const [knowledgePointIds, setKnowledgePointIds] = useState<string[]>([])
  const [isCoBuilderDialogOpen, setIsCoBuilderDialogOpen] = useState(false)

  // AI assisted creation dialog
  const [isAiCreateDialogOpen, setIsAiCreateDialogOpen] = useState(false)
  const [aiTargetPosition, setAiTargetPosition] = useState("")
  const [aiSceneDescription, setAiSceneDescription] = useState("")
  const [aiProgress, setAiProgress] = useState(0)
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [aiGeneratedPreview, setAiGeneratedPreview] = useState<{
    name: string
    code: string
    positionId: string
    industryIds: string[]
    professionIds: string[]
    difficulty: number
    background: string
    coverImage: string
  } | null>(null)
  const [isAiGeneratedPreviewOpen, setIsAiGeneratedPreviewOpen] = useState(false)
  const [aiRegenerateCount, setAiRegenerateCount] = useState(0)

  // Position filtering
  const allPositions = useMemo(() => {
    return professions.flatMap(prof => 
      prof.positions.map(pos => ({ ...pos, professionName: prof.name, professionId: prof.id }))
    )
  }, [])

  const filteredPositions = useMemo(() => {
    let result = allPositions
    if (positionSearch.trim()) {
      const q = positionSearch.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.professionName.toLowerCase().includes(q))
    }
    // In real app, each tab would filter differently. Here we simulate the structure.
    return result
  }, [allPositions, positionSearch, positionTab])

  const selectedPosition = allPositions.find(p => p.id === positionId)

  const filteredTeachers = useMemo(() => {
    if (!coBuilderSearch) return allTeachers
    return allTeachers.filter(t => 
      t.name.toLowerCase().includes(coBuilderSearch.toLowerCase()) ||
      t.department.toLowerCase().includes(coBuilderSearch.toLowerCase())
    )
  }, [coBuilderSearch])

  const selectedCoBuilders = allTeachers.filter(t => coBuilderIds.includes(t.id))

  const batch = batchId 
    ? batches.find(b => b.id === batchId)
    : null

  const handleProceed = () => {
    router.push(`/ai-assisted/scenarios/${scenarioId}/edit/tasks`)
  }

  const handleSaveDraft = () => {
    console.log("Saving draft...")
    // Save logic here
  }

  const handleStartAiGenerate = (regenCount?: number) => {
    if (!aiTargetPosition) return
    setIsAiGenerating(true)
    setAiProgress(0)

    const interval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.floor(Math.random() * 15) + 5
      })
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      setAiProgress(100)

      const dataSetIndex = (regenCount ?? aiRegenerateCount) % 2

      const suffixesSetA = ["智慧电商平台", "企业级管理系统", "社交应用平台", "在线教育平台", "智能物流系统", "医疗健康平台", "金融科技应用", "智慧城市项目"]
      const suffixesSetB = ["供应链协同平台", "智能客服系统", "社区团购平台", "远程办公系统", "数字孪生系统", "跨境电商系统", "自动驾驶仿真", "物联网监控平台"]
      const suffixes = dataSetIndex === 0 ? suffixesSetA : suffixesSetB
      const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)]
      const newName = `${aiTargetPosition}实战场景 — ${randomSuffix}`
      const newCode = `SC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`

      const shuffledIndustries = [...industries].sort(() => 0.5 - Math.random())
      const selectedIndustryIds = shuffledIndustries.slice(0, Math.floor(Math.random() * 2) + 1).map(i => i.id)

      const shuffledProfessions = [...professions].sort(() => 0.5 - Math.random())
      const selectedProfessionIds = shuffledProfessions.slice(0, Math.floor(Math.random() * 2) + 1).map(p => p.id)

      const newDifficulty = Math.floor(Math.random() * 5) + 1

      const mockIntroSetA = `本场景围绕${aiTargetPosition}核心能力培养，通过真实企业级项目实战，帮助学员掌握从需求分析、架构设计到开发落地的完整流程。场景以${randomSuffix}为项目载体，涵盖前后端协同开发、数据库设计、接口联调、性能优化等关键环节，培养学员的工程化思维和团队协作能力。学员将在模拟真实工作环境中，经历完整的项目生命周期，积累可复用的工程实践经验。`
      const mockIntroSetB = `本场景聚焦${aiTargetPosition}岗位实战技能提升，以${randomSuffix}真实业务场景为切入点，构建从需求梳理、技术方案设计、编码实现到测试部署的完整项目闭环。学员将深入理解业务架构与系统设计的映射关系，掌握高并发处理、数据一致性保障、安全防护等进阶技术，同时锻炼跨职能沟通与敏捷迭代能力，为进入真实工作环境做好充分准备。`
      const mockIntro = dataSetIndex === 0 ? mockIntroSetA : mockIntroSetB

      const covers = ["/placeholder.jpg", "/placeholder-logo.png", "/placeholder-user.jpg"]
      const newCover = covers[Math.floor(Math.random() * covers.length)]

      const matchedPosition = allPositions.find(p => p.name === aiTargetPosition)

      setAiGeneratedPreview({
        name: newName,
        code: newCode,
        positionId: matchedPosition?.id || "",
        industryIds: selectedIndustryIds,
        professionIds: selectedProfessionIds,
        difficulty: newDifficulty,
        background: mockIntro,
        coverImage: newCover,
      })

      setIsAiGenerating(false)
      setAiProgress(0)
      setAiSceneDescription("")
      setAiTargetPosition("")
      setIsAiCreateDialogOpen(false)
      setIsAiGeneratedPreviewOpen(true)
    }, 1500)
  }

  const handlePreview = () => {
    setIsPreviewDialogOpen(true)
  }

  const handleAiGenerateBackground = () => {
    setAiGenerateLoading(true)
    // Simulate AI generation delay
    setTimeout(() => {
      const result = mockScenarioBackgroundGeneration({
        position: selectedPosition?.name,
        industry: industryIds.length > 0 ? industries.find(i => i.id === industryIds[0])?.name : undefined,
        difficulty: String(difficulty),
        skillDirection: professionIds.length > 0 ? professions.find(p => p.id === professionIds[0])?.name : undefined,
      })
      setAiGeneratedContent({
        content: result.content,
        confidence: result.confidence,
        reasoning: result.reasoning,
      })
      setAiGenerateLoading(false)
    }, 1200)
  }

  const handleRegenerate = () => {
    setAiGenerateLoading(true)
    setTimeout(() => {
      const result = mockScenarioBackgroundGeneration({
        position: selectedPosition?.name,
        industry: industryIds.length > 0 ? industries.find(i => i.id === industryIds[0])?.name : undefined,
        difficulty: String(difficulty),
        skillDirection: professionIds.length > 0 ? professions.find(p => p.id === professionIds[0])?.name : undefined,
      })
      setAiGeneratedContent({
        content: result.content + "\n\n【重新生成版本】已根据您的反馈优化了描述结构，增加了学习目标与行业对接的具体说明。",
        confidence: result.confidence,
        reasoning: "基于上一轮反馈优化生成",
      })
      setAiGenerateLoading(false)
    }, 1200)
  }

  const toggleCoBuilder = (userId: string) => {
    setCoBuilderIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleDept = (dept: string) => {
    setExpandedDepts(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    )
  }

  const handleSelectPosition = (posId: string) => {
    setPositionId(posId)
    // Auto select profession based on position
    const pos = allPositions.find(p => p.id === posId)
    if (pos) {
      setProfessionIds(prev => prev.includes(pos.professionId) ? prev : [...prev, pos.professionId])
    }
    setIsPositionPopoverOpen(false)
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/scene/ai")}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">步骤 1</Badge>
              <span className="text-sm font-medium text-gray-800">基础信息编辑</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              保存草稿
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              预览
            </Button>
            <Button 
              onClick={handleProceed}
              disabled={!scenarioName}
            >
              下一步
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full mx-auto px-6 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {existingScenario ? "编辑实践场景" : "新建实践场景"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">填写场景基础信息，完成后进入任务链配置</p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAiCreateDialogOpen(true)}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 gap-1 shrink-0"
          >
            <Wand2 className="h-4 w-4" />
            AI 辅助编辑
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left column: Main form */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-5">
                {/* Position and Batch selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <PrdAnnotation data={getAnnotation("editor-field-position")} className="block">
                      <Label htmlFor="position">目标岗位</Label>
                    </PrdAnnotation>
                    {/* Custom position selector with tabs and search */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsPositionPopoverOpen(!isPositionPopoverOpen)}
                        className={cn(
                          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                          positionId && "pr-8"
                        )}
                      >
                        <span className={selectedPosition ? "text-foreground" : "text-muted-foreground"}>
                          {selectedPosition ? `${selectedPosition.name} (${selectedPosition.professionName})` : "请选择岗位"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      {positionId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPositionId("")
                          }}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      
                      {isPositionPopoverOpen && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                          <div className="p-2">
                            <Tabs value={positionTab} onValueChange={(v) => setPositionTab(v as PositionTab)}>
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="my">我的</TabsTrigger>
                                <TabsTrigger value="collab">共建</TabsTrigger>
                                <TabsTrigger value="public">公共库</TabsTrigger>
                              </TabsList>
                            </Tabs>
                            <div className="mt-2 relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                              <Input
                                placeholder="搜索岗位名称..."
                                value={positionSearch}
                                onChange={(e) => setPositionSearch(e.target.value)}
                                className="h-8 pl-7 text-sm"
                              />
                            </div>
                            <div className="mt-2 max-h-[200px] overflow-y-auto">
                              {professions.map((prof) => {
                                const profPositions = filteredPositions.filter(p => p.professionId === prof.id)
                                if (profPositions.length === 0) return null
                                return (
                                  <div key={prof.id}>
                                    <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                                      {prof.name}
                                    </div>
                                    {profPositions.map((pos) => (
                                      <div
                                        key={pos.id}
                                        onClick={() => handleSelectPosition(pos.id)}
                                        className={cn(
                                          "px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between",
                                          positionId === pos.id && "bg-primary/5 text-primary"
                                        )}
                                      >
                                        <span>{pos.name}</span>
                                        {positionId === pos.id && (
                                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <PrdAnnotation data={getAnnotation("editor-field-batch")} className="block">
                      <Label htmlFor="batch">所属批次</Label>
                    </PrdAnnotation>
                    <div className="relative">
                      <Select value={batchId} onValueChange={setBatchId}>
                        <SelectTrigger id="batch" className={batchId ? "pr-8" : ""}>
                          <SelectValue placeholder="请选择批次" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {batchId && (
                        <button
                          type="button"
                          onClick={() => setBatchId("")}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scenario name */}
                <div className="grid gap-2">
                  <PrdAnnotation data={getAnnotation("editor-field-name")} className="block">
                    <Label htmlFor="name">场景名称 <span className="text-red-500">*</span></Label>
                  </PrdAnnotation>
                  <Input
                    id="name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="请输入场景名称"
                  />
                </div>

                {/* Scenario code (auto-generated) */}
                <div className="grid gap-2">
                  <PrdAnnotation data={getAnnotation("editor-field-code")} className="block">
                    <Label htmlFor="code">场景编码</Label>
                  </PrdAnnotation>
                  <Input
                    id="code"
                    value={scenarioCode}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-400">系统自动生成，不可修改</p>
                </div>

                {/* Industry and profession - multi-select with tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>面向行业</Label>
                    <IndustryProfessionSelector
                      options={industries.map(i => ({ id: i.id, name: i.name }))}
                      selectedIds={industryIds}
                      onChange={setIndustryIds}
                      placeholder="选择行业"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>适用专业</Label>
                    <IndustryProfessionSelector
                      options={professions.map(p => ({ id: p.id, name: p.name }))}
                      selectedIds={professionIds}
                      onChange={setProfessionIds}
                      placeholder="选择专业"
                    />
                  </div>
                </div>

                {/* Difficulty */}
                <div className="grid gap-2">
                  <Label>难度等级</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            "h-6 w-6 transition-colors",
                            level <= difficulty
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200 hover:fill-amber-200 hover:text-amber-200"
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {difficulty === 1 && "入门"}
                      {difficulty === 2 && "基础"}
                      {difficulty === 3 && "中级"}
                      {difficulty === 4 && "高级"}
                      {difficulty === 5 && "专家"}
                    </span>
                  </div>
                </div>

                {/* Background */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <PrdAnnotation data={getAnnotation("editor-field-intro")} className="block">
                      <Label htmlFor="background">场景介绍</Label>
                    </PrdAnnotation>
                    <AiGenerateButton
                      onClick={handleAiGenerateBackground}
                      loading={aiGenerateLoading}
                      label="重新生成文案"
                      size="sm"
                    />
                  </div>
                  <div className="border rounded-lg">
                    <div className="bg-gray-50 border-b px-3 py-2 flex gap-1 items-center">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-bold">B</Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs italic">I</Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs underline">U</Button>
                      <div className="w-px bg-gray-200 mx-1 h-5" />
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <List className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <ListOrdered className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Textarea
                      id="background"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      placeholder="描述该场景的背景、意义和学习目标..."
                      className="border-0 min-h-[200px] focus-visible:ring-0 rounded-t-none"
                    />
                  </div>
                  {/* Inline AI suggestion card */}
                  {aiGeneratedContent.content && (
                    <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50/30 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">AI 生成建议</span>
                          <AiConfidenceBadge confidence={aiGeneratedContent.confidence} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setAiGeneratedContent({ content: "", confidence: "medium", reasoning: "" })}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {aiGeneratedContent.reasoning && (
                        <p className="text-xs text-gray-500 mb-2">生成依据：{aiGeneratedContent.reasoning}</p>
                      )}
                      <div className="max-h-[160px] overflow-y-auto rounded-md bg-white border border-purple-100 p-3 text-sm text-gray-700 whitespace-pre-line mb-3">
                        {aiGeneratedContent.content}
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <AiGenerateButton
                          onClick={handleRegenerate}
                          loading={aiGenerateLoading}
                          label="重新生成"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            setBackground(aiGeneratedContent.content)
                            setAiGeneratedContent({ content: "", confidence: "medium", reasoning: "" })
                          }}
                          variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          采纳
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Cover and co-builders */}
          <div className="space-y-6">
            {/* Cover image */}
            <Card>
              <CardContent className="pt-6">
                <PrdAnnotation data={getAnnotation("editor-sidebar-cover")} className="block">
                  <Label className="mb-3 block">场景封面</Label>
                </PrdAnnotation>
                <div 
                  className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                >
                  {coverImage ? (
                    <img src={coverImage} alt="场景封面" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">点击上传封面图片</p>
                      <p className="text-xs text-gray-400 mt-1">建议尺寸 320x200</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Creator and co-builders */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <PrdAnnotation data={getAnnotation("editor-sidebar-creator")} className="block">
                    <Label className="text-gray-500 text-xs">创建人</Label>
                  </PrdAnnotation>
                  <p className="font-medium text-gray-800 mt-1">{creatorName}</p>
                </div>

                <div>
                  <PrdAnnotation data={getAnnotation("editor-sidebar-cobuilders")} className="block">
                    <Label className="mb-2 block">共建人/共建部门</Label>
                  </PrdAnnotation>
                  
                  {/* Selected co-builders compact view */}
                  <div 
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsCoBuilderDialogOpen(true)}
                  >
                    {selectedCoBuilders.length === 0 ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <UserPlus className="h-4 w-4" />
                        <span className="text-sm">点击选择共建人</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedCoBuilders.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            <span>{user.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleCoBuilder(user.id)
                              }}
                              className="hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <PrdAnnotation data={getAnnotation("editor-sidebar-version")} className="block">
                    <Label className="text-gray-500 text-xs">当前版本号</Label>
                  </PrdAnnotation>
                  <p className="font-medium text-gray-800 mt-1">{version}</p>
                </div>
              </CardContent>
            </Card>

            {/* Co-builder Dialog */}
            <Dialog open={isCoBuilderDialogOpen} onOpenChange={setIsCoBuilderDialogOpen}>
              <DialogContent className="sm:max-w-[640px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <PrdAnnotation data={getAnnotation("dialog-cobuilder-select")}>
                    <div>
                      <DialogTitle>选择共建人/共建部门</DialogTitle>
                      <DialogDescription>
                        从组织架构中选择共建人，选中的用户将参与该场景的建设
                      </DialogDescription>
                    </div>
                  </PrdAnnotation>
                </DialogHeader>
                <div className="flex-1 overflow-hidden py-4">
                  {/* Shuttle Box */}
                  <div className="border rounded-lg overflow-hidden h-full">
                    {/* Search */}
                    <div className="p-3 border-b bg-gray-50">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="搜索用户或部门..."
                          value={coBuilderSearch}
                          onChange={(e) => setCoBuilderSearch(e.target.value)}
                          className="h-9 pl-8 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 divide-x" style={{ minHeight: 400, maxHeight: 500 }}>
                      {/* Left: Organization tree + users */}
                      <div className="flex flex-col">
                        <div className="px-3 py-2.5 bg-gray-50 border-b text-sm font-medium text-gray-500">
                          组织架构
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                          {departmentTree.map((dept) => {
                            const isExpanded = expandedDepts.includes(dept.name)
                            const deptUsers = filteredTeachers.filter(t => t.department === dept.name)
                            if (deptUsers.length === 0) return null
                            
                            return (
                              <div key={dept.name}>
                                <button
                                  onClick={() => toggleDept(dept.name)}
                                  className="flex items-center gap-1 w-full px-1 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  )}
                                  {dept.name}
                                  <span className="ml-auto text-xs text-gray-400">{deptUsers.length}</span>
                                </button>
                                {isExpanded && (
                                  <div className="ml-4 space-y-0.5">
                                    {deptUsers.map((user) => (
                                      <div
                                        key={user.id}
                                        onClick={() => toggleCoBuilder(user.id)}
                                        className={cn(
                                          "flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-50",
                                          coBuilderIds.includes(user.id) && "bg-primary/5 text-primary"
                                        )}
                                      >
                                        <div className={cn(
                                          "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                                          coBuilderIds.includes(user.id) ? "bg-primary border-primary" : "border-gray-300"
                                        )}>
                                          {coBuilderIds.includes(user.id) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                          )}
                                        </div>
                                        <span className="truncate">{user.name}</span>
                                        <span className="text-xs text-gray-400 ml-auto">{user.role === 'admin' ? '管理员' : user.role === 'reviewer' ? '审批人' : '建设者'}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Right: Selected co-builders */}
                      <div className="flex flex-col">
                        <div className="px-3 py-2.5 bg-gray-50 border-b text-sm font-medium text-gray-500 flex items-center justify-between">
                          <span>已选共建人</span>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{selectedCoBuilders.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                          {selectedCoBuilders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <UserPlus className="h-8 w-8 mb-2" />
                              <span className="text-sm">从左侧面板选择共建人</span>
                            </div>
                          )}
                          {selectedCoBuilders.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-2 px-2 py-2 rounded text-sm bg-primary/5 text-primary"
                            >
                              <span className="flex-1 truncate">{user.name}</span>
                              <span className="text-xs text-gray-400">{user.department}</span>
                              <button
                                onClick={() => toggleCoBuilder(user.id)}
                                className="ml-1 hover:bg-primary/10 rounded-full p-0.5"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCoBuilderDialogOpen(false)}>
                    完成
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* AI Assisted Creation Dialog */}
      <Dialog open={isAiCreateDialogOpen} onOpenChange={setIsAiCreateDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>AI 辅助场景创建</DialogTitle>
            <DialogDescription>选择目标岗位并描述您想要的场景，AI 将为您生成基础信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="ai-position">目标岗位</Label>
              <Select value={aiTargetPosition} onValueChange={setAiTargetPosition}>
                <SelectTrigger id="ai-position">
                  <SelectValue placeholder="请选择目标岗位" />
                </SelectTrigger>
                <SelectContent>
                  {["前端开发工程师", "后端开发工程师", "全栈开发工程师", "产品经理", "UI设计师", "数据分析师", "运维工程师", "测试工程师"].map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ai-description">场景描述</Label>
              <Textarea
                id="ai-description"
                value={aiSceneDescription}
                onChange={(e) => setAiSceneDescription(e.target.value)}
                placeholder="请用一句话描述您想要的场景，例如：一个电商平台的完整开发实战场景"
                rows={3}
              />
            </div>
            {isAiGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>AI 生成中...</span>
                  <span>{aiProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-200"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiCreateDialogOpen(false)} disabled={isAiGenerating}>
              取消
            </Button>
            <Button
              onClick={() => handleStartAiGenerate()}
              disabled={!aiTargetPosition || isAiGenerating}
              variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 gap-1"
            >
              {isAiGenerating ? (
                <>生成中...</>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  开始AI生成
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generated Preview Dialog */}
      <Dialog open={isAiGeneratedPreviewOpen} onOpenChange={setIsAiGeneratedPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI 生成结果预览
            </DialogTitle>
            <DialogDescription>
              AI 已生成以下场景基础信息，确认后将填充到当前表单，取消则保留原内容。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {aiGeneratedPreview && (
              <>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={aiGeneratedPreview.coverImage} alt="场景封面" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">场景名称</p>
                    <p className="font-medium text-sm">{aiGeneratedPreview.name}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">场景编码</p>
                    <p className="font-medium text-sm">{aiGeneratedPreview.code}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">目标岗位</p>
                    <p className="font-medium text-sm">{allPositions.find(p => p.id === aiGeneratedPreview.positionId)?.name || aiTargetPosition || "未选择"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">面向行业</p>
                    <p className="font-medium text-sm">
                      {aiGeneratedPreview.industryIds.map(id => industries.find(i => i.id === id)?.name).filter(Boolean).join("、") || "未选择"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">适用专业</p>
                    <p className="font-medium text-sm">
                      {aiGeneratedPreview.professionIds.map(id => professions.find(p => p.id === id)?.name).filter(Boolean).join("、") || "未选择"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500 mb-1">难度等级</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-4 w-4", i < aiGeneratedPreview.difficulty ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">场景介绍</p>
                  <p className="text-sm whitespace-pre-line">{aiGeneratedPreview.background}</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAiGeneratedPreviewOpen(false)}>
              取消
            </Button>
            <Button
              variant="outline"
              className="gap-1"
              onClick={() => {
                const next = aiRegenerateCount + 1
                setAiRegenerateCount(next)
                handleStartAiGenerate(next)
              }}
            >
              <RefreshCw className="h-4 w-4" />
              重新生成
            </Button>
            <Button
              variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 gap-1"
              onClick={() => {
                if (!aiGeneratedPreview) return
                setScenarioName(aiGeneratedPreview.name)
                setScenarioCode(aiGeneratedPreview.code)
                if (aiGeneratedPreview.positionId) {
                  setPositionId(aiGeneratedPreview.positionId)
                }
                setIndustryIds(aiGeneratedPreview.industryIds)
                setProfessionIds(aiGeneratedPreview.professionIds)
                setDifficulty(aiGeneratedPreview.difficulty)
                setBackground(aiGeneratedPreview.background)
                setCoverImage(aiGeneratedPreview.coverImage)
                setIsAiGeneratedPreviewOpen(false)
                setAiGeneratedPreview(null)
                setAiRegenerateCount(0)
              }}
            >
              <Check className="h-4 w-4" />
              确认应用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>场景基础信息预览</DialogTitle>
            <DialogDescription>预览当前填写的基础信息</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Cover preview */}
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {coverImage ? (
                <img src={coverImage} alt="场景封面" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="h-12 w-12 text-gray-300" />
              )}
            </div>
            
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">场景名称</p>
                <p className="font-medium text-sm">{scenarioName || "未填写"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">场景编码</p>
                <p className="font-medium text-sm">{scenarioCode}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">所属岗位</p>
                <p className="font-medium text-sm">{selectedPosition?.name || "未选择"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">所属批次</p>
                <p className="font-medium text-sm">{batch?.name || "未选择"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">面向行业</p>
                <p className="font-medium text-sm">{industryIds.length > 0 ? industryIds.map(id => industries.find(i => i.id === id)?.name).filter(Boolean).join("、") : "未选择"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">适用专业</p>
                <p className="font-medium text-sm">{professionIds.length > 0 ? professionIds.map(id => professions.find(p => p.id === id)?.name).filter(Boolean).join("、") : "未选择"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">难度等级</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-4 w-4", i < difficulty ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">场景介绍</p>
              <p className="text-sm">{background || "暂无介绍"}</p>
            </div>
            
            {/* Creator and co-builders */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">创建人</p>
              <p className="font-medium text-sm">{creatorName}</p>
              {selectedCoBuilders.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">共建人</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCoBuilders.map(t => (
                      <Badge key={t.id} variant="secondary" className="text-xs">{t.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
