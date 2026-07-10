"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  Layers,
  PenLine,
  Search,
  Settings,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { studentSubmissions, students, scenarios } from "@/lib/scene-mock-data"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"
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

type ActivationMode = "manual" | "scheduled"

export default function GradingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(scenarios[0]?.id || null)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [taskActivation, setTaskActivation] = useState<Record<string, { mode: ActivationMode; enabled: boolean; scheduledTime?: string }>>({})
  const [activatingTaskId, setActivatingTaskId] = useState<string | null>(null)
  const [activationForm, setActivationForm] = useState<{ mode: ActivationMode; scheduledTime: string }>({ mode: "manual", scheduledTime: "" })

  const scenarioGroups = useMemo<ScenarioGroup[]>(() => {
    const map = new Map<string, ScenarioGroup>()

    for (const scenario of scenarios) {
      const subs = studentSubmissions.filter((s) => s.scenarioId === scenario.id)
      const pending = subs.filter((s) => s.status === "pending").length
      const graded = subs.filter((s) => s.status === "graded").length
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
  }, [])

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
          form.pendingCount += sub.status === "pending" ? 1 : 0
          form.gradedCount += sub.status === "graded" ? 1 : 0
        } else {
          existing.forms.push({
            assessmentForm: sub.assessmentForm,
            students: [taskStudent],
            pendingCount: sub.status === "pending" ? 1 : 0,
            gradedCount: sub.status === "graded" ? 1 : 0,
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
            pendingCount: sub.status === "pending" ? 1 : 0,
            gradedCount: sub.status === "graded" ? 1 : 0,
          }],
        })
      }
    }

    return Array.from(taskMap.values())
  }, [selectedScenarioId])

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const isTaskActivated = () => true

  const openActivationDialog = (taskId: string) => {
    const existing = taskActivation[taskId]
    setActivationForm({
      mode: existing?.mode || "manual",
      scheduledTime: existing?.scheduledTime || "",
    })
    setActivatingTaskId(taskId)
  }

  const saveActivation = () => {
    if (!activatingTaskId) return
    setTaskActivation((prev) => ({
      ...prev,
      [activatingTaskId]: {
        mode: activationForm.mode,
        enabled: true,
        scheduledTime: activationForm.mode === "scheduled" ? activationForm.scheduledTime : undefined,
      },
    }))
    setActivatingTaskId(null)
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

  // Task form tabs component
  function TaskFormTabs({ task }: { task: TaskGroup }) {
    const [activeForm, setActiveForm] = useState(task.forms[0]?.assessmentForm || "")
    const activeFormData = task.forms.find((f) => f.assessmentForm === activeForm)
    const yearGroups = activeFormData ? groupStudents(activeFormData.students) : []

    return (
      <div className="px-4 pb-4 border-t border-gray-100">
        {task.forms.length > 1 && (
          <PrdAnnotation data={getAnnotation("grading-task-form-tabs")}>
            <div className="flex items-center gap-2 pt-3 mb-3">
              {task.forms.map((form) => (
                <button
                  key={form.assessmentForm}
                  onClick={() => setActiveForm(form.assessmentForm)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    activeForm === form.assessmentForm
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                  )}
                >
                  {form.assessmentForm}
                  <span className="text-[10px] opacity-70">({form.students.length})</span>
                </button>
              ))}
            </div>
          </PrdAnnotation>
        )}
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
                      <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                        {classGroup.students.map((item) => (
                          <div
                            key={item.studentId}
                            className="flex items-center justify-between p-2.5 hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                                {item.studentName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800 text-sm">{item.studentName}</span>
                                  <span className="text-xs text-gray-400">{item.studentNumber}</span>
                                  <Badge variant="outline" className={cn("text-[10px]", item.submission.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-green-50 text-green-600 border-green-200")}>
                                    {item.submission.status === "pending" ? "待评分" : "已评分"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {item.submission.submittedAt}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <PrdAnnotation data={getAnnotation("grading-action-view")}>
                                <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                                  <Link href={`/evaluation/scene-results/${item.submission.id}`}>
                                    <Eye className="mr-1 h-3 w-3" />查看
                                  </Link>
                                </Button>
                              </PrdAnnotation>
                              {item.submission.status === "pending" ? (
                                <PrdAnnotation data={getAnnotation("grading-action-grade")}>
                                  <Button size="sm" className="h-7 text-xs" asChild>
                                    <Link href={`/evaluation/scene-results/${item.submission.id}`}>
                                      <PenLine className="mr-1 h-3 w-3" />评分
                                    </Link>
                                  </Button>
                                </PrdAnnotation>
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
          <PrdAnnotation data={getAnnotation("grading-title")}>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">场景任务评价</h1>
              <p className="text-sm text-gray-500 mt-0.5">选择场景与任务，查看学生提交并进行评分</p>
            </div>
          </PrdAnnotation>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* Left sidebar — Scenario tree */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <PrdAnnotation data={getAnnotation("grading-sidebar-search")} className="block w-full">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索场景..."
                  className="pl-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </PrdAnnotation>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {filteredGroups.map((group) => (
              <div key={group.positionName}>
                <PrdAnnotation data={getAnnotation("grading-sidebar-position")}>
                  <div className="flex items-center gap-1.5 px-2 mb-2">
                    <Layers className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600">{group.positionName}</span>
                    <span className="text-[10px] text-gray-400">({group.scenarios.length})</span>
                  </div>
                </PrdAnnotation>
                <div className="space-y-1">
                  {group.scenarios.map((scenario) => (
                    <PrdAnnotation key={scenario.scenarioId} data={getAnnotation("grading-sidebar-scenario")}>
                      <button
                        onClick={() => setSelectedScenarioId(scenario.scenarioId)}
                        className={cn(
                          "w-full text-left rounded-lg p-2.5 transition-all border",
                          selectedScenarioId === scenario.scenarioId
                            ? "bg-primary/[0.04] border-primary/30 shadow-sm"
                            : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                        )}
                      >
                      <div className="flex items-start gap-2">
                        <BookOpen className={cn("h-4 w-4 mt-0.5 shrink-0", selectedScenarioId === scenario.scenarioId ? "text-primary" : "text-gray-400")} />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium truncate", selectedScenarioId === scenario.scenarioId ? "text-primary" : "text-gray-700")}>
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
                  </PrdAnnotation>
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
                      <PrdAnnotation key={task.taskId} data={getAnnotation("grading-task-header")} className="block w-full">
                        <Collapsible open={isExpanded} onOpenChange={() => toggleTask(task.taskId)}>
                          <Card className="overflow-hidden">
                            <CollapsibleTrigger asChild>
                              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                    <FileText className="h-4 w-4 text-primary" />
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
                              <PrdAnnotation data={getAnnotation("grading-task-expand")}>
                                <TaskFormTabs task={task} />
                              </PrdAnnotation>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      </PrdAnnotation>
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

      {/* Activation Dialog */}
      <Dialog open={!!activatingTaskId} onOpenChange={(v) => !v && setActivatingTaskId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-approve-confirm")}>
              <DialogTitle>试卷任务开启配置</DialogTitle>
            </PrdAnnotation>
            <DialogDescription>配置该试卷任务的评分开启方式</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <RadioGroup
              value={activationForm.mode}
              onValueChange={(v) => setActivationForm((prev) => ({ ...prev, mode: v as ActivationMode }))}
            >
              <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium">手动开启</div>
                  <div className="text-xs text-gray-400">配置后立即开放评分</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium">定期开启</div>
                  <div className="text-xs text-gray-400">到达指定时间后自动开放评分</div>
                </Label>
              </div>
            </RadioGroup>
            {activationForm.mode === "scheduled" && (
              <div>
                <Label className="text-xs text-gray-500">开启时间</Label>
                <Input
                  type="datetime-local"
                  value={activationForm.scheduledTime}
                  onChange={(e) => setActivationForm((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                  className="mt-1.5 text-sm"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivatingTaskId(null)}>取消</Button>
            <Button onClick={saveActivation}>确认开启</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
