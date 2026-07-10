"use client"

import { useMemo, useState } from "react"
import { AiGenerateButton } from "@/components/ai/ai-generate-button"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  Layers,
  PenLine,
  Search,
  Sparkles,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { studentSubmissions, students, scenarios } from "@/lib/scene-mock-data"
import type { StudentSubmission } from "@/lib/scene-mock-data"

interface TaskStudent {
  studentId: string
  studentName: string
  studentNumber: string
  className: string
  enrollmentYear: number
  submission: StudentSubmission
}

interface TaskFormGroup {
  assessmentForm: string
  students: TaskStudent[]
  pendingCount: number
  gradedCount: number
}

interface TaskGroup {
  taskId: string
  taskName: string
  taskType: string
  forms: TaskFormGroup[]
}

interface ScenarioGroup {
  positionName: string
  scenarios: {
    scenarioId: string
    scenarioName: string
    scenarioCode: string
    taskCount: number
    pendingCount: number
    gradedCount: number
    studentCount: number
  }[]
}

export default function AiFirstGradingListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(scenarios[0]?.id || null)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  // AI batch scoring states
  const [batchGraded, setBatchGraded] = useState<Set<string>>(new Set())
  const [configOpen, setConfigOpen] = useState(false)
  const [configTaskId, setConfigTaskId] = useState<string | null>(null)
  const [configForm, setConfigForm] = useState<string | null>(null)
  const [strictness, setStrictness] = useState(70)
  const [passRate, setPassRate] = useState(80)
  const [scoreVariance, setScoreVariance] = useState(5)
  const [commentTone, setCommentTone] = useState<"encouraging" | "strict" | "neutral">("neutral")
  const [allowFullScore, setAllowFullScore] = useState(true)
  const [allowFail, setAllowFail] = useState(true)
  const [progressOpen, setProgressOpen] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [progressPhase, setProgressPhase] = useState("")
  const [progressLoading, setProgressLoading] = useState(false)
  const [batchAiResultOpen, setBatchAiResultOpen] = useState(false)
  const [batchAiPreviewData, setBatchAiPreviewData] = useState<{
    studentId: string
    studentName: string
    score: number
    maxScore: number
    comment: string
    pass: boolean
  }[] | null>(null)
  const [batchAiSelectedIds, setBatchAiSelectedIds] = useState<Set<string>>(new Set())

  const getEffectiveStatus = (sub: StudentSubmission) => {
    if (batchGraded.has(`${sub.taskId}-${sub.assessmentForm}`)) return "graded"
    return sub.status
  }

  const applyBatchAiResult = () => {
    if (configTaskId && configForm) {
      setBatchGraded(prev => new Set(prev).add(`${configTaskId}-${configForm}`))
    }
    setBatchAiResultOpen(false)
    setBatchAiPreviewData(null)
  }

  const cancelBatchAiResult = () => {
    setBatchAiResultOpen(false)
    setBatchAiPreviewData(null)
    setBatchAiSelectedIds(new Set())
  }

  const scenarioGroups = useMemo<ScenarioGroup[]>(() => {
    const map = new Map<string, ScenarioGroup>()
    for (const scenario of scenarios) {
      const subs = studentSubmissions.filter((s) => s.scenarioId === scenario.id)
      const pending = subs.filter((s) => getEffectiveStatus(s) === "pending").length
      const graded = subs.filter((s) => getEffectiveStatus(s) === "graded").length
      const studentIds = new Set(subs.map((s) => s.studentId))
      const taskIds = new Set(subs.map((s) => s.taskId))
      const item = {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        scenarioCode: scenario.code,
        taskCount: taskIds.size,
        pendingCount: pending,
        gradedCount: graded,
        studentCount: studentIds.size,
      }
      const pos = scenario.positionName || "未分类"
      if (!map.has(pos)) {
        map.set(pos, { positionName: pos, scenarios: [] })
      }
      map.get(pos)!.scenarios.push(item)
    }
    return Array.from(map.values())
  }, [batchGraded])

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return scenarioGroups
    const q = searchQuery.trim().toLowerCase()
    return scenarioGroups
      .map((g) => ({
        ...g,
        scenarios: g.scenarios.filter(
          (s) =>
            s.scenarioName.toLowerCase().includes(q) ||
            s.scenarioCode.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.scenarios.length > 0)
  }, [scenarioGroups, searchQuery])

  const selectedScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedScenarioId),
    [selectedScenarioId]
  )

  const taskGroups = useMemo<TaskGroup[]>(() => {
    if (!selectedScenarioId) return []
    const scenarioSubs = studentSubmissions.filter((s) => s.scenarioId === selectedScenarioId)
    const scenario = scenarios.find((s) => s.id === selectedScenarioId)
    const taskMap = new Map<string, TaskGroup>()
    for (const sub of scenarioSubs) {
      const existing = taskMap.get(sub.taskId)
      const student = students.find((st) => st.id === sub.studentId)
      const taskStudent: TaskStudent = {
        studentId: sub.studentId,
        studentName: student?.name || "未知学生",
        studentNumber: student?.studentNumber || "-",
        className: student?.class || "-",
        enrollmentYear: student?.enrollmentYear || 0,
        submission: sub,
      }
      if (existing) {
        const form = existing.forms.find((f) => f.assessmentForm === sub.assessmentForm)
        if (form) {
          form.students.push(taskStudent)
          form.pendingCount += getEffectiveStatus(sub) === "pending" ? 1 : 0
          form.gradedCount += getEffectiveStatus(sub) === "graded" ? 1 : 0
        } else {
          existing.forms.push({
            assessmentForm: sub.assessmentForm,
            students: [taskStudent],
            pendingCount: getEffectiveStatus(sub) === "pending" ? 1 : 0,
            gradedCount: getEffectiveStatus(sub) === "graded" ? 1 : 0,
          })
        }
      } else {
        const taskInfo = scenario?.tasks.find((t) => t.id === sub.taskId)
        taskMap.set(sub.taskId, {
          taskId: sub.taskId,
          taskName: sub.taskName,
          taskType: taskInfo?.taskType === "assessment" ? "考核" : "训练",
          forms: [{
            assessmentForm: sub.assessmentForm,
            students: [taskStudent],
            pendingCount: getEffectiveStatus(sub) === "pending" ? 1 : 0,
            gradedCount: getEffectiveStatus(sub) === "graded" ? 1 : 0,
          }],
        })
      }
    }
    return Array.from(taskMap.values())
  }, [selectedScenarioId, batchGraded])

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  // Group students by year -> class
  const groupStudents = (students: TaskStudent[]) => {
    const yearMap = new Map<number, Map<string, TaskStudent[]>>()
    for (const s of students) {
      if (!yearMap.has(s.enrollmentYear)) yearMap.set(s.enrollmentYear, new Map())
      const classMap = yearMap.get(s.enrollmentYear)!
      if (!classMap.has(s.className)) classMap.set(s.className, [])
      classMap.get(s.className)!.push(s)
    }
    const groups: { year: number; classes: { className: string; students: TaskStudent[] }[] }[] = []
    for (const [year, classMap] of yearMap) {
      const classes: { className: string; students: TaskStudent[] }[] = []
      for (const [className, classStudents] of classMap) {
        classes.push({ className, students: classStudents })
      }
      classes.sort((a, b) => a.className.localeCompare(b.className, "zh-CN"))
      groups.push({ year, classes })
    }
    groups.sort((a, b) => b.year - a.year)
    return groups
  }

  const handleStartBatch = () => {
    setConfigOpen(false)
    setProgressOpen(true)
    setProgressValue(0)
    setProgressLoading(true)

    const phases = [
      { at: 15, text: "正在加载评分标准与参数配置..." },
      { at: 35, text: `正在应用评分严格度 ${strictness}% 与通过率目标 ${passRate}%...` },
      { at: 55, text: "正在生成合理分数分布..." },
      { at: 75, text: `正在生成 ${commentTone === "encouraging" ? "鼓励型" : commentTone === "strict" ? "严格型" : "平和型"} 评语...` },
      { at: 95, text: "正在校验评分结果并批量写入..." },
    ]

    let p = 0
    let phaseIdx = 0
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 2) + 1
      if (phaseIdx < phases.length && p >= phases[phaseIdx].at) {
        setProgressPhase(phases[phaseIdx].text)
        phaseIdx++
      }
      if (p >= 100) {
        p = 100
        clearInterval(interval)
        setProgressValue(100)
        setProgressPhase("批量评分完成")
        setTimeout(() => {
          const targetSubs = studentSubmissions.filter(
            s => s.scenarioId === selectedScenarioId && s.taskId === configTaskId && s.assessmentForm === configForm
          )
          const preview = targetSubs.map(sub => {
            const stu = students.find(s => s.id === sub.studentId)
            const maxScore = sub.maxScore || 100
            const ratio = (strictness / 100) * 0.5 + 0.3 + Math.random() * 0.25
            const score = Math.max(0, Math.min(maxScore, Math.round(maxScore * ratio)))
            const pass = score >= maxScore * 0.6
            let comment = ""
            if (commentTone === "encouraging") {
              comment = pass ? "表现不错，继续保持！" : "不要气馁，继续努力，你可以做得更好！"
            } else if (commentTone === "strict") {
              comment = pass ? "达到基本要求，但仍有提升空间。" : "未达到预期目标，需要认真反思和改进。"
            } else {
              comment = pass ? "表现良好，基本达到预期目标。" : "需要加强练习，重点关注薄弱环节。"
            }
            return {
              studentId: sub.studentId,
              studentName: stu?.name || "未知学生",
              score,
              maxScore,
              comment,
              pass,
            }
          })
          setBatchAiPreviewData(preview)
          setBatchAiSelectedIds(new Set(preview.map(d => d.studentId)))
          setProgressLoading(false)
          setProgressOpen(false)
          setBatchAiResultOpen(true)
        }, 500)
      } else {
        setProgressValue(p)
      }
    }, 300)
  }

  // Task form tabs component
  function TaskFormTabs({ task }: { task: TaskGroup }) {
    const [activeForm, setActiveForm] = useState(task.forms[0]?.assessmentForm || "")
    const activeFormData = task.forms.find((f) => f.assessmentForm === activeForm)
    const yearGroups = activeFormData ? groupStudents(activeFormData.students) : []

    return (
      <div className="px-4 pb-4 border-t border-gray-100">
        <div className="flex items-center justify-between pt-3 mb-3">
          {task.forms.length > 1 && (
            <div className="flex items-center gap-2">
              {task.forms.map((form) => (
                <button
                  key={form.assessmentForm}
                  onClick={() => setActiveForm(form.assessmentForm)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    activeForm === form.assessmentForm
                      ? "bg-purple-50 text-purple-700 border border-purple-300"
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                  )}
                >
                  {form.assessmentForm}
                  <span className="text-[10px] opacity-70">({form.students.length})</span>
                </button>
              ))}
            </div>
          )}
          {activeFormData && activeFormData.students.some(s => getEffectiveStatus(s.submission) === "pending") && (
            <AiGenerateButton
              onClick={() => {
                setConfigTaskId(task.taskId)
                setConfigForm(activeForm)
                setStrictness(70)
                setPassRate(80)
                setScoreVariance(5)
                setCommentTone("neutral")
                setAllowFullScore(true)
                setAllowFail(true)
                setConfigOpen(true)
              }}
              label="批量智能评分"
              size="sm"
              className="h-7 text-xs"
            />
          )}
        </div>
        {activeFormData && activeFormData.students.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-sm">暂无学生提交记录</div>
        ) : (
          <div className="space-y-4">
            {yearGroups.map((yearGroup) => (
              <div key={yearGroup.year}>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">{yearGroup.year} 届</span>
                  <Badge variant="outline" className="text-[10px] font-normal text-gray-400">
                    {yearGroup.classes.reduce((s, c) => s + c.students.length, 0)} 人
                  </Badge>
                </div>
                <div className="space-y-3">
                  {yearGroup.classes.map((classGroup) => (
                    <div key={classGroup.className}>
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{classGroup.className}</span>
                        <span className="text-[10px] text-gray-400">({classGroup.students.length} 人)</span>
                      </div>
                      <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
                        {classGroup.students.map((item) => (
                          <div
                            key={item.studentId}
                            className="flex items-center justify-between p-2.5 hover:bg-gray-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                                {item.studentName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800 text-sm">{item.studentName}</span>
                                  <span className="text-xs text-gray-400">{item.studentNumber}</span>
                                  <Badge variant="outline" className={cn("text-[10px]", getEffectiveStatus(item.submission) === "pending" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-green-50 text-green-600 border-green-200")}>
                                    {getEffectiveStatus(item.submission) === "pending" ? "待评分" : "已评分"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {item.submission.submittedAt}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                                <Link href={`/ai-first/approvals/grading/${item.submission.id}`}>
                                  <Eye className="mr-1 h-3 w-3" />查看
                                </Link>
                              </Button>
                              {getEffectiveStatus(item.submission) === "pending" ? (
                                <Button size="sm" className="h-7 text-xs" asChild>
                                  <Link href={`/ai-first/approvals/grading/${item.submission.id}`}>
                                    <PenLine className="mr-1 h-3 w-3" />评分
                                  </Link>
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600" disabled>
                                  <CheckCircle2 className="mr-1 h-3 w-3" />已评分
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">AI 评分工作台</h1>
            <p className="text-sm text-gray-500 mt-0.5">AI 辅助批量评分与评语生成</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* Left sidebar — Scenario tree */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索场景..."
                className="pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {filteredGroups.map((group) => (
              <div key={group.positionName}>
                <div className="flex items-center gap-1.5 px-2 mb-2">
                  <Layers className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600">{group.positionName}</span>
                  <span className="text-[10px] text-gray-400">({group.scenarios.length})</span>
                </div>
                <div className="space-y-1">
                  {group.scenarios.map((scenario) => (
                    <button
                      key={scenario.scenarioId}
                      onClick={() => setSelectedScenarioId(scenario.scenarioId)}
                      className={cn(
                        "w-full text-left rounded-lg p-2.5 transition-all border",
                        selectedScenarioId === scenario.scenarioId
                          ? "bg-purple-50 border-purple-300 shadow-sm"
                          : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <BookOpen className={cn("h-4 w-4 mt-0.5 shrink-0", selectedScenarioId === scenario.scenarioId ? "text-purple-700" : "text-gray-400")} />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium truncate", selectedScenarioId === scenario.scenarioId ? "text-purple-900" : "text-gray-700")}>
                            {scenario.scenarioName}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{scenario.scenarioCode}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {scenario.pendingCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                                待评 {scenario.pendingCount}
                              </span>
                            )}
                            {scenario.gradedCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                                已评 {scenario.gradedCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right content — Task list with students */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedScenario ? (
            <div className="space-y-4">
              {/* Scenario header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{selectedScenario.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs font-normal">{selectedScenario.positionName}</Badge>
                    <Badge variant="outline" className="text-xs font-normal text-gray-500">{selectedScenario.code}</Badge>
                  </div>
                </div>
              </div>

              {/* Task list */}
              {taskGroups.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-400">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">该场景下暂无学生提交的任务</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {taskGroups.map((task) => {
                    const isExpanded = expandedTasks.has(task.taskId)
                    const totalStudents = task.forms.reduce((s, f) => s + f.students.length, 0)
                    const totalPending = task.forms.reduce((s, f) => s + f.pendingCount, 0)
                    const totalGraded = task.forms.reduce((s, f) => s + f.gradedCount, 0)

                    return (
                      <Collapsible key={task.taskId} open={isExpanded} onOpenChange={() => toggleTask(task.taskId)}>
                        <Card className="overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                                  <FileText className="h-4 w-4 text-purple-700" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-800">{task.taskName}</p>
                                    {task.forms.map((f) => (
                                      <Badge key={f.assessmentForm} variant="outline" className="text-[10px] font-normal">{f.assessmentForm}</Badge>
                                    ))}
                                    <Badge variant="secondary" className="text-[10px] font-normal">{task.taskType}</Badge>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500">{totalStudents} 位学生</span>
                                    {totalPending > 0 && (
                                      <span className="text-xs text-amber-600 font-medium">待评分 {totalPending}</span>
                                    )}
                                    {totalGraded > 0 && (
                                      <span className="text-xs text-green-600 font-medium">已评分 {totalGraded}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <TaskFormTabs task={task} />
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <BookOpen className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">请在左侧选择一个场景</p>
            </div>
          )}
        </div>
      </div>

      {/* Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI 批量评分参数配置
            </DialogTitle>
            <DialogDescription>
              调整以下参数，AI 将按您的策略对所选测评方式下的所有学生进行批量评分
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">评分严格度</Label>
                <span className="text-xs font-medium text-purple-700">{strictness}%</span>
              </div>
              <Slider value={[strictness]} onValueChange={([v]) => setStrictness(v)} min={0} max={100} step={5} />
              <p className="text-xs text-gray-400">数值越高，AI 扣分越严格</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">目标通过率</Label>
                <span className="text-xs font-medium text-purple-700">{passRate}%</span>
              </div>
              <Slider value={[passRate]} onValueChange={([v]) => setPassRate(v)} min={0} max={100} step={5} />
              <p className="text-xs text-gray-400">AI 将尽量让该比例的学生达到及格线以上</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">评语风格</Label>
              <div className="flex gap-2">
                {(["encouraging", "neutral", "strict"] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setCommentTone(tone)}
                    className={cn(
                      "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      commentTone === tone
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {tone === "encouraging" ? "鼓励型" : tone === "strict" ? "严格型" : "平和型"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">允许满分</Label>
              <Switch checked={allowFullScore} onCheckedChange={setAllowFullScore} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">允许不及格</Label>
              <Switch checked={allowFail} onCheckedChange={setAllowFail} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfigOpen(false)}>取消</Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleStartBatch}>
              确认并开始评分
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={progressOpen} onOpenChange={setProgressOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI 批量智能评分中
            </DialogTitle>
            <DialogDescription>
              正在按配置参数对所选测评方式下的所有学生进行评分
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-purple-700">
              <span>总体进度</span>
              <span>{progressValue}%</span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 min-h-[20px]">
              {progressLoading && <div className="h-4 w-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />}
              <span>{progressPhase || "正在初始化评分引擎..."}</span>
            </div>
            <div className="rounded-lg border bg-gray-50 p-3 space-y-1 text-xs text-gray-500">
              <div className="flex justify-between"><span>评分严格度</span><span className="font-medium text-gray-700">{strictness}%</span></div>
              <div className="flex justify-between"><span>目标通过率</span><span className="font-medium text-gray-700">{passRate}%</span></div>
              <div className="flex justify-between"><span>评语风格</span><span className="font-medium text-gray-700">{commentTone === "encouraging" ? "鼓励型" : commentTone === "strict" ? "严格型" : "平和型"}</span></div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => {}}
            >
              评分完成后通知我
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Batch Scoring Result Confirmation Dialog */}
      <Dialog open={batchAiResultOpen} onOpenChange={setBatchAiResultOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI 批量评分结果确认
            </DialogTitle>
            <DialogDescription>
              AI 已完成评分，请查看以下结果摘要，确认后将覆盖当前评分状态，取消则保持原状
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {batchAiPreviewData && (
              <>
                <div className="flex items-center gap-4 bg-purple-50 rounded-lg p-3">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-purple-700">{batchAiSelectedIds.size}</div>
                    <div className="text-xs text-gray-500">已选人数</div>
                  </div>
                  <div className="w-px h-10 bg-purple-200" />
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-green-600">{batchAiPreviewData.filter(d => batchAiSelectedIds.has(d.studentId) && d.pass).length}</div>
                    <div className="text-xs text-gray-500">通过</div>
                  </div>
                  <div className="w-px h-10 bg-purple-200" />
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-amber-600">{batchAiPreviewData.filter(d => batchAiSelectedIds.has(d.studentId) && !d.pass).length}</div>
                    <div className="text-xs text-gray-500">未通过</div>
                  </div>
                  <div className="w-px h-10 bg-purple-200" />
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-gray-700">
                      {batchAiSelectedIds.size > 0 ? Math.round(batchAiPreviewData.filter(d => batchAiSelectedIds.has(d.studentId)).reduce((s, d) => s + d.score, 0) / batchAiSelectedIds.size) : 0}
                    </div>
                    <div className="text-xs text-gray-500">平均分</div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={batchAiPreviewData.length > 0 && batchAiPreviewData.every(d => batchAiSelectedIds.has(d.studentId))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBatchAiSelectedIds(new Set(batchAiPreviewData.map(d => d.studentId)))
                        } else {
                          setBatchAiSelectedIds(new Set())
                        }
                      }}
                    />
                    <span>全选</span>
                  </label>
                  <span className="text-xs text-gray-500">已选 {batchAiSelectedIds.size} / {batchAiPreviewData.length} 人</span>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 border-b grid grid-cols-12 gap-2">
                    <span className="col-span-1"></span>
                    <span className="col-span-3">学生姓名</span>
                    <span className="col-span-2 text-center">得分</span>
                    <span className="col-span-2 text-center">结果</span>
                    <span className="col-span-4">评语</span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
                    {batchAiPreviewData.map((d) => (
                      <div key={d.studentId} className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center text-sm">
                        <div className="col-span-1 flex justify-center">
                          <Checkbox
                            checked={batchAiSelectedIds.has(d.studentId)}
                            onCheckedChange={(checked) => {
                              setBatchAiSelectedIds(prev => {
                                const next = new Set(prev)
                                if (checked) {
                                  next.add(d.studentId)
                                } else {
                                  next.delete(d.studentId)
                                }
                                return next
                              })
                            }}
                          />
                        </div>
                        <span className="col-span-3 font-medium text-gray-800">{d.studentName}</span>
                        <span className="col-span-2 text-center">
                          <span className={cn("font-semibold", d.pass ? "text-green-600" : "text-amber-600")}>{d.score}</span>
                          <span className="text-gray-400 text-xs"> / {d.maxScore}</span>
                        </span>
                        <span className="col-span-2 text-center">
                          {d.pass ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">通过</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">未通过</span>
                          )}
                        </span>
                        <span className="col-span-4 text-xs text-gray-500 truncate">{d.comment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={cancelBatchAiResult}>取消</Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={applyBatchAiResult}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              确认应用 ({batchAiSelectedIds.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
