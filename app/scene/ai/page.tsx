"use client"

import {
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FolderKanban,
  GitBranch,
  LayoutList,
  ListFilter,
  Plus,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  Undo2,
  Upload,
  X,
  ArrowDownFromLine,
  ArrowUpFromLine,
  MessageSquare,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { ScenarioList } from "@/components/scene/scenarios/scenario-list"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  professions,
  scenarios as initialScenarios,
  batches as initialBatches,
  approvalWorkflows,
} from "@/lib/scene-mock-data"
import type { Scenario } from "@/lib/scene-mock-data"

const CURRENT_USER_ID = "user-1"

type TabType = "my" | "collab" | "public"
type ViewMode = "list" | "group"

export default function SceneHallPage() {
  const router = useRouter()

  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios)
  const [localBatches, setLocalBatches] = useState(initialBatches)

  const [activeTab, setActiveTab] = useState<TabType>("my")
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedBatches, setExpandedBatches] = useState<string[]>(localBatches.map((b) => b.id))

  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createPositionId, setCreatePositionId] = useState<string>("")
  const [createBatchId, setCreateBatchId] = useState<string>("")
  const [createPositionTab, setCreatePositionTab] = useState<TabType>("my")
  const [createPositionSearch, setCreatePositionSearch] = useState("")
  const [isCreatePositionPopoverOpen, setIsCreatePositionPopoverOpen] = useState(false)

  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false)
  const [isInnerBatchCreateOpen, setIsInnerBatchCreateOpen] = useState(false)
  const [newBatchName, setNewBatchName] = useState("")
  const [newBatchWorkflow, setNewBatchWorkflow] = useState("")

  const [isApprovalWorkflowDialogOpen, setIsApprovalWorkflowDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importConflictRule, setImportConflictRule] = useState<"overwrite" | "new" | "skip">("overwrite")
  const [isResourceImportDialogOpen, setIsResourceImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isBatchMoveDialogOpen, setIsBatchMoveDialogOpen] = useState(false)

  const [isRejectReasonDialogOpen, setIsRejectReasonDialogOpen] = useState(false)
  const [rejectReasonScenario, setRejectReasonScenario] = useState<Scenario | null>(null)

  // Approval dialog for scenarios without batch
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [approvalScenario, setApprovalScenario] = useState<Scenario | null>(null)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("")

  // Clone rename dialog
  const [isCloneRenameDialogOpen, setIsCloneRenameDialogOpen] = useState(false)
  const [cloneRenameValue, setCloneRenameValue] = useState("")
  const [cloneTargetScenario, setCloneTargetScenario] = useState<Scenario | null>(null)

  const toggleBatch = (batchId: string) => {
    setExpandedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    )
  }

  const tabFilteredScenarios = useMemo(() => {
    switch (activeTab) {
      case "my":
        return scenarios.filter((s) => s.creatorId === CURRENT_USER_ID)
      case "collab":
        return scenarios.filter((s) => s.coBuilders.some((c) => c.id === CURRENT_USER_ID))
      case "public":
      default:
        return scenarios.filter((s) => s.status === "published")
    }
  }, [scenarios, activeTab])

  const filteredScenarios = useMemo(() => {
    let result = tabFilteredScenarios
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((s) => {
        const matchName = s.name.toLowerCase().includes(q)
        const matchTask = s.tasks.some((t) => t.name.toLowerCase().includes(q))
        return matchName || matchTask
      })
    }
    if (selectedPositionId) {
      result = result.filter((s) => s.positionId === selectedPositionId)
    }
    if (selectedBatchId) {
      result = result.filter((s) => s.batchId === selectedBatchId)
    }
    if (selectedStatus) {
      result = result.filter((s) => s.status === selectedStatus)
    }
    return result
  }, [tabFilteredScenarios, searchQuery, selectedPositionId, selectedBatchId, selectedStatus])

  const stats = useMemo(() => {
    const total = filteredScenarios.length
    const draft = filteredScenarios.filter((s) => s.status === "draft").length
    const pending = filteredScenarios.filter((s) => s.status === "pending").length
    const rejected = filteredScenarios.filter((s) => s.status === "rejected").length
    const published = filteredScenarios.filter((s) => s.status === "published").length
    return { total, draft, pending, rejected, published }
  }, [filteredScenarios])

  const scenariosByBatch = useMemo(() => {
    if (viewMode !== "group") return null
    const groups: Record<string, Scenario[]> = {}
    filteredScenarios.forEach((s) => {
      if (!s.batchId) return
      if (!groups[s.batchId]) groups[s.batchId] = []
      groups[s.batchId].push(s)
    })
    return groups
  }, [filteredScenarios, viewMode])

  const uncategorizedScenarios = useMemo(
    () => filteredScenarios.filter((s) => !s.batchId && s.status === "draft"),
    [filteredScenarios]
  )

  const openBatches = localBatches

  const allPositions = useMemo(() => {
    return professions.flatMap((prof) =>
      prof.positions.map((pos) => ({ ...pos, professionName: prof.name, professionId: prof.id }))
    )
  }, [])

  const filteredPositions = useMemo(() => {
    let result = allPositions
    if (createPositionSearch.trim()) {
      const q = createPositionSearch.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.professionName.toLowerCase().includes(q)
      )
    }
    return result
  }, [allPositions, createPositionSearch])

  const selectedPositionForCreate = allPositions.find((p) => p.id === createPositionId)

  const getPositionProfession = (positionId: string) => {
    for (const prof of professions) {
      const pos = prof.positions.find((p) => p.id === positionId)
      if (pos) return prof
    }
    return null
  }

  const handleSelectPositionForCreate = (posId: string) => {
    setCreatePositionId(posId)
    setIsCreatePositionPopoverOpen(false)
  }

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true)
  }

  const handleProceedToEditor = () => {
    const params = new URLSearchParams()
    if (createPositionId) params.set("positionId", createPositionId)
    if (createBatchId) params.set("batchId", createBatchId)
    router.push(`/ai-assisted/scenarios/scenario-new-${Date.now()}/new?${params.toString()}`)
  }

  const handleSelectId = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((sid) => sid !== id)))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredScenarios.map((s) => s.id))
    } else {
      setSelectedIds([])
    }
  }

  const selectedScenarios = scenarios.filter((s) => selectedIds.includes(s.id))

  const handleBatchSubmitApproval = () => {
    setScenarios((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id) && (s.status === "draft" || s.status === "rejected")
          ? { ...s, status: "pending" as const }
          : s
      )
    )
    setSelectedIds([])
  }

  const handleBatchWithdrawApproval = () => {
    setScenarios((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id) && s.status === "pending"
          ? { ...s, status: "draft" as const }
          : s
      )
    )
    setSelectedIds([])
  }

  const handleBatchUnpublish = () => {
    setScenarios((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id) && s.status === "published"
          ? { ...s, status: "draft" as const, publishTime: undefined }
          : s
      )
    )
    setSelectedIds([])
  }

  const handleBatchPublish = () => {
    setScenarios((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id) && s.status === "approved"
          ? { ...s, status: "published" as const, publishTime: new Date().toISOString().replace("T", " ").slice(0, 19) }
          : s
      )
    )
    setSelectedIds([])
  }

  const handleBatchDelete = () => {
    setScenarios((prev) => prev.filter((s) => !selectedIds.includes(s.id)))
    setSelectedIds([])
  }

  const handleBatchClone = () => {
    const toClone = scenarios.filter((s) => selectedIds.includes(s.id))
    const newScenarios = toClone.map((scenario) => ({
      ...scenario,
      id: `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: `SC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      name: `${scenario.name} (克隆)`,
      status: "draft" as const,
      version: "v1.0",
      tasks: scenario.tasks.map((t) => ({
        ...t,
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: `T-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
      })),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }))
    setScenarios((prev) => [...prev, ...newScenarios])
    setSelectedIds([])
  }

  const handleBatchExport = () => {
    setIsExportDialogOpen(true)
    setSelectedIds([])
  }

  const handleBatchMove = () => {
    setIsBatchMoveDialogOpen(true)
  }

  const handleClone = (scenario: Scenario) => {
    setCloneTargetScenario(scenario)
    setCloneRenameValue(`${scenario.name} (克隆)`)
    setIsCloneRenameDialogOpen(true)
  }

  const handleConfirmClone = () => {
    if (!cloneTargetScenario) return
    const newScenario: Scenario = {
      ...cloneTargetScenario,
      id: `scenario-${Date.now()}`,
      code: `SC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      name: cloneRenameValue,
      status: "draft",
      version: "v1.0",
      tasks: cloneTargetScenario.tasks.map((t) => ({
        ...t,
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: `T-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
      })),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setScenarios((prev) => [...prev, newScenario])
    setIsCloneRenameDialogOpen(false)
    setCloneTargetScenario(null)
    setCloneRenameValue("")
  }

  const handleDelete = (scenario: Scenario) => {
    setScenarios((prev) => prev.filter((s) => s.id !== scenario.id))
  }

  const handleSubmitApproval = (scenario: Scenario) => {
    if (scenario.batchId) {
      setScenarios((prev) =>
        prev.map((s) => (s.id === scenario.id ? { ...s, status: "pending" as const } : s))
      )
    } else {
      setApprovalScenario(scenario)
      setSelectedWorkflowId("")
      setIsApprovalDialogOpen(true)
    }
  }

  const handleConfirmApproval = () => {
    if (!approvalScenario || !selectedWorkflowId) return
    setScenarios((prev) =>
      prev.map((s) => (s.id === approvalScenario.id ? { ...s, status: "pending" as const } : s))
    )
    setIsApprovalDialogOpen(false)
    setApprovalScenario(null)
    setSelectedWorkflowId("")
  }

  const handleWithdrawApproval = (scenario: Scenario) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === scenario.id ? { ...s, status: "draft" as const } : s))
    )
  }

  const handleViewRejectReason = (scenario: Scenario) => {
    setRejectReasonScenario(scenario)
    setIsRejectReasonDialogOpen(true)
  }

  const handleAddBatch = () => {
    if (!newBatchName || !newBatchWorkflow) return
    const newBatch = {
      id: `batch-${Date.now()}`,
      name: newBatchName,
      code: Array.from({ length: 6 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join(""),
      departmentId: "",
      departmentName: "",
      workflowId: newBatchWorkflow,
      workflowName: approvalWorkflows.find((w) => w.id === newBatchWorkflow)?.name || "",
      status: "open" as const,
      scenarioCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setLocalBatches((prev) => [...prev, newBatch])
    setNewBatchName("")
    setNewBatchWorkflow("")
    setIsInnerBatchCreateOpen(false)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedPositionId(null)
    setSelectedBatchId(null)
    setSelectedStatus(null)
  }

  const hasSelected = selectedIds.length > 0

  const canBatchSubmit = selectedScenarios.some((s) => s.status === "draft" || s.status === "rejected")
  const canBatchWithdraw = selectedScenarios.some((s) => s.status === "pending")
  const canBatchUnpublish = selectedScenarios.some((s) => s.status === "published")
  const canBatchPublish = selectedScenarios.some((s) => s.status === "approved")
  const canBatchDelete = selectedScenarios.some((s) => s.status === "draft" || s.status === "rejected")

  const getRejectReason = (scenario: Scenario) => {
    // 模拟驳回原因，实际项目中应从审批记录中获取
    if (scenario.id === "scenario-3") {
      return "场景任务链不完整，缺少数据清洗环节，请补充后再提交。"
    }
    return "审批未通过，请根据审批意见修改后重新提交。"
  }

  return (
    <div className="space-y-6">
      {/* ===== Part 1: Top Title Card ===== */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <PrdAnnotation data={getAnnotation("scene-management-title")}>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">场景管理</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  维护场景信息、任务信息等场景资源管理功能
                </p>
              </div>
            </PrdAnnotation>

            <div className="flex flex-wrap items-center gap-2">
              <PrdAnnotation data={getAnnotation("config-approval-workflow")}>
                <Button variant="outline" size="sm" onClick={() => setIsApprovalWorkflowDialogOpen(true)}>
                  <GitBranch className="mr-2 h-4 w-4" />
                  配置审批流程
                </Button>
              </PrdAnnotation>

              <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                <PrdAnnotation data={getAnnotation("config-batch-group")}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FolderKanban className="mr-2 h-4 w-4" />
                      配置批次分组
                    </Button>
                  </DialogTrigger>
                </PrdAnnotation>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <PrdAnnotation data={getAnnotation("dialog-batch-management")}>
                      <div>
                        <DialogTitle>批次分组管理</DialogTitle>
                        <DialogDescription>管理场景建设批次分组，关联审批流程</DialogDescription>
                      </div>
                    </PrdAnnotation>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    <div className="flex justify-end">
                      <Dialog open={isInnerBatchCreateOpen} onOpenChange={setIsInnerBatchCreateOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          新增批次
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <PrdAnnotation data={getAnnotation("dialog-batch-create")}>
                            <div>
                              <DialogTitle>新增批次</DialogTitle>
                              <DialogDescription>创建新的场景建设批次分组，并关联审批流程。</DialogDescription>
                            </div>
                          </PrdAnnotation>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="batchName">分组名称</Label>
                            <Input
                              id="batchName"
                              value={newBatchName}
                              onChange={(e) => setNewBatchName(e.target.value)}
                              placeholder="例如：2026春季电商实训场景开发"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="batchCode">批次编号</Label>
                            <Input
                              id="batchCode"
                              value={`BG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`}
                              disabled
                              className="bg-gray-50 text-gray-500"
                            />
                            <p className="text-xs text-gray-500">批次编号自动生成，不可修改</p>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="workflow">关联审批流 <span className="text-red-500">*</span></Label>
                            <Select value={newBatchWorkflow} onValueChange={setNewBatchWorkflow}>
                              <SelectTrigger id="workflow">
                                <SelectValue placeholder="选择审批流程" />
                              </SelectTrigger>
                              <SelectContent>
                                {approvalWorkflows.map((wf) => (
                                  <SelectItem key={wf.id} value={wf.id}>
                                    <span className="inline-flex items-center">
                                      <span>{wf.name}</span>
                                      <span className="text-xs text-gray-400 ml-2">({wf.steps.length}步)</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsInnerBatchCreateOpen(false)}>取消</Button>
                          <Button onClick={handleAddBatch} disabled={!newBatchName || !newBatchWorkflow}>
                            创建批次
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    </div>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>分组名称</TableHead>
                            <TableHead>批次编号</TableHead>
                            <TableHead>审批流程</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {localBatches.map((batch) => (
                            <TableRow key={batch.id}>
                              <TableCell className="font-medium text-sm">{batch.name}</TableCell>
                              <TableCell className="text-sm text-gray-500">{batch.code}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {batch.workflowName || "-"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBatchDialogOpen(false)}>关闭</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <PrdAnnotation data={getAnnotation("import-resource-package")}>
                <Button variant="outline" size="sm" onClick={() => setIsResourceImportDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  导入资源包
                </Button>
              </PrdAnnotation>

              <PrdAnnotation data={getAnnotation("import-scenario")}>
                <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  导入场景
                </Button>
              </PrdAnnotation>

              <PrdAnnotation data={getAnnotation("create-scenario")}>
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => router.push(`/ai-assisted/scenarios/scenario-new-${Date.now()}/new`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  新建场景
                </Button>
              </PrdAnnotation>
            </div>
          </div>

          {/* Stats dashboard - hidden in public tab */}
          {activeTab !== "public" && (
            <div className="grid grid-cols-5 gap-3 mt-3">
              <PrdAnnotation data={getAnnotation("stat-total")}>
                <Card className="border-slate-200 shadow-sm w-full">
                  <CardContent className="px-3 py-[3px] flex items-center justify-between">
                    <div className="leading-none">
                      <p className="text-xs text-slate-500 leading-none">场景总数</p>
                      <p className="text-xl font-bold text-slate-900 leading-none mt-[3px]">{stats.total}</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center">
                      <SlidersHorizontal className="h-3 w-3 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </PrdAnnotation>
              <PrdAnnotation data={getAnnotation("stat-draft")}>
                <Card className="border-slate-200 shadow-sm w-full">
                  <CardContent className="px-3 py-[3px] flex items-center justify-between">
                    <div className="leading-none">
                      <p className="text-xs text-slate-500 leading-none">未提交</p>
                      <p className="text-xl font-bold text-slate-900 leading-none mt-[3px]">{stats.draft}</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-gray-50 flex items-center justify-center">
                      <RotateCcw className="h-3 w-3 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              </PrdAnnotation>
              <PrdAnnotation data={getAnnotation("stat-pending")}>
                <Card className="border-slate-200 shadow-sm w-full">
                  <CardContent className="px-3 py-[3px] flex items-center justify-between">
                    <div className="leading-none">
                      <p className="text-xs text-slate-500 leading-none">审批中</p>
                      <p className="text-xl font-bold text-slate-900 leading-none mt-[3px]">{stats.pending}</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-yellow-50 flex items-center justify-center">
                      <GitBranch className="h-3 w-3 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </PrdAnnotation>
              <PrdAnnotation data={getAnnotation("stat-rejected")}>
                <Card className="border-slate-200 shadow-sm w-full">
                  <CardContent className="px-3 py-[3px] flex items-center justify-between">
                    <div className="leading-none">
                      <p className="text-xs text-slate-500 leading-none">已驳回</p>
                      <p className="text-xl font-bold text-slate-900 leading-none mt-[3px]">{stats.rejected}</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-red-50 flex items-center justify-center">
                      <X className="h-3 w-3 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </PrdAnnotation>
              <PrdAnnotation data={getAnnotation("stat-published")}>
                <Card className="border-slate-200 shadow-sm w-full">
                  <CardContent className="px-3 py-[3px] flex items-center justify-between">
                    <div className="leading-none">
                      <p className="text-xs text-slate-500 leading-none">已发布</p>
                      <p className="text-xl font-bold text-slate-900 leading-none mt-[3px]">{stats.published}</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-green-50 flex items-center justify-center">
                      <ArrowUpFromLine className="h-3 w-3 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </PrdAnnotation>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Part 2: View Switch Area ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as TabType); setSelectedIds([]); setSelectedPositionId(null); setSelectedBatchId(null) }}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <PrdAnnotation data={getAnnotation("tab-my")} className="flex-1">
              <TabsTrigger value="my" className="w-full">我的场景</TabsTrigger>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("tab-collab")} className="flex-1">
              <TabsTrigger value="collab" className="w-full">共建场景</TabsTrigger>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("tab-public")} className="flex-1">
              <TabsTrigger value="public" className="w-full">公共场景</TabsTrigger>
            </PrdAnnotation>
          </TabsList>
        </Tabs>

        <div className="flex items-center border rounded-md overflow-hidden">
          <PrdAnnotation data={getAnnotation("view-list")}>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors",
                viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              资源列表
            </button>
          </PrdAnnotation>
          <PrdAnnotation data={getAnnotation("view-group")}>
            <button
              onClick={() => setViewMode("group")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors",
                viewMode === "group" ? "bg-primary text-primary-foreground" : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <ListFilter className="h-3.5 w-3.5" />
              批次分组
            </button>
          </PrdAnnotation>
        </div>
      </div>

      {/* ===== Part 3: Data List Area ===== */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5">
          {/* Search + Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <PrdAnnotation data={getAnnotation("search-box")} className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 w-full">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索场景名称 / 任务名称"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 text-sm flex-1"
                />
              </div>
            </PrdAnnotation>
            <div className="flex items-center gap-2">
              <PrdAnnotation data={getAnnotation("filter-position")}>
                <Select value={selectedPositionId || "__all__"} onValueChange={(v) => setSelectedPositionId(v === "__all__" ? null : v)}>
                  <SelectTrigger className="h-9 text-sm w-44">
                    <SelectValue placeholder="按岗位筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">全部岗位</SelectItem>
                    {professions.map((prof) => (
                      <div key={prof.id}>
                        <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">{prof.name}</div>
                        {prof.positions.map((pos) => (
                          <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </PrdAnnotation>
              <PrdAnnotation data={getAnnotation("filter-batch")}>
                <Select value={selectedBatchId || "__all__"} onValueChange={(v) => setSelectedBatchId(v === "__all__" ? null : v)}>
                  <SelectTrigger className="h-9 text-sm w-44">
                    <SelectValue placeholder="按批次分组筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">全部批次</SelectItem>
                    {localBatches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        <span className="flex items-center gap-2">
                          {batch.name}
                          <span className="text-xs text-gray-400">({batch.code})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PrdAnnotation>
              <PrdAnnotation data={getAnnotation("filter-status")}>
                <Select value={selectedStatus || "__all__"} onValueChange={(v) => setSelectedStatus(v === "__all__" ? null : v)}>
                  <SelectTrigger className="h-9 text-sm w-36">
                    <SelectValue placeholder="按状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">全部状态</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="pending">审批中</SelectItem>
                    <SelectItem value="approved">已通过</SelectItem>
                    <SelectItem value="rejected">已驳回</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                  </SelectContent>
                </Select>
              </PrdAnnotation>
            </div>
            <PrdAnnotation data={getAnnotation("filter-reset")}>
              <Button variant="outline" size="sm" className="h-9" onClick={handleResetFilters}>
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                重置
              </Button>
            </PrdAnnotation>
          </div>

          {/* Quick actions - linked with checkboxes */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <PrdAnnotation data={getAnnotation("batch-selection-hint")}>
              <span className={cn("text-xs mr-1", hasSelected ? "text-slate-700 font-medium" : "text-slate-400")}>
                {hasSelected ? `已选择 ${selectedIds.length} 项：` : "请选择场景："}
              </span>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("batch-submit")}>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchSubmit} onClick={handleBatchSubmitApproval}>
                <Send className="mr-1 h-3 w-3" />
                提交审批
              </Button>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("batch-withdraw")}>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchWithdraw} onClick={handleBatchWithdrawApproval}>
                <Undo2 className="mr-1 h-3 w-3" />
                撤回审批
              </Button>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("batch-publish")}>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchPublish} onClick={handleBatchPublish}>
                <ArrowUpFromLine className="mr-1 h-3 w-3" />
                发布
              </Button>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("batch-unpublish")}>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchUnpublish} onClick={handleBatchUnpublish}>
                <ArrowDownFromLine className="mr-1 h-3 w-3" />
                取消发布
              </Button>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("batch-delete")}>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchDelete} onClick={handleBatchDelete}>
                <Trash2 className="mr-1 h-3 w-3" />
                删除
              </Button>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("batch-clone")}>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected} onClick={handleBatchClone}>
                <Copy className="mr-1 h-3 w-3" />
                克隆
              </Button>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("batch-move")}>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected} onClick={handleBatchMove}>
                <FolderKanban className="mr-1 h-3 w-3" />
                调整批次分组
              </Button>
            </PrdAnnotation>
            <PrdAnnotation data={getAnnotation("batch-export")}>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected} onClick={handleBatchExport}>
                <Download className="mr-1 h-3 w-3" />
                导出
              </Button>
            </PrdAnnotation>
          </div>
        </CardContent>

        {/* Scenario list - merged into the same Card */}
        {filteredScenarios.length > 0 && viewMode !== "group" && (
          <CardContent className="pt-0">
            <ScenarioList
              scenarios={filteredScenarios}
              selectedIds={selectedIds}
              onSelectId={handleSelectId}
              onSelectAll={handleSelectAll}
              onClone={handleClone}
              onDelete={handleDelete}
              onSubmitApproval={handleSubmitApproval}
              onWithdrawApproval={handleWithdrawApproval}
              onViewRejectReason={handleViewRejectReason}
              className="border-0 rounded-none"
              basePath="/ai-assisted/scenarios"
            />
          </CardContent>
        )}
      </Card>

      {/* Scenario list - group view remains outside the card */}
      {filteredScenarios.length > 0 && viewMode === "group" && scenariosByBatch && (
        <div className="space-y-4">
          {Object.entries(scenariosByBatch).map(([batchId, batchScenarios]) => {
            const batch = localBatches.find((b) => b.id === batchId)
            if (!batch) return null
            const isExpanded = expandedBatches.includes(batchId)

            return (
              <Collapsible key={batchId} open={isExpanded} onOpenChange={() => toggleBatch(batchId)}>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <CollapsibleTrigger asChild>
                    <div className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="font-medium text-gray-800">{batch.name}</span>
                        <span className="text-xs text-gray-400">({batch.code})</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {batchScenarios.length} 个场景
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0">
                      <ScenarioList
                        scenarios={batchScenarios}
                        selectedIds={selectedIds}
                        onSelectId={handleSelectId}
                        onSelectAll={handleSelectAll}
                        onClone={handleClone}
                        onDelete={handleDelete}
                        onSubmitApproval={handleSubmitApproval}
                        onWithdrawApproval={handleWithdrawApproval}
                        onViewRejectReason={handleViewRejectReason}
                        basePath="/ai-assisted/scenarios"
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
          {uncategorizedScenarios.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">未分类</span>
                  <Badge variant="secondary" className="text-xs">
                    {uncategorizedScenarios.length} 个场景
                  </Badge>
                </div>
              </div>
              <div className="p-4 pt-0">
                <ScenarioList
                  scenarios={uncategorizedScenarios}
                  selectedIds={selectedIds}
                  onSelectId={handleSelectId}
                  onSelectAll={handleSelectAll}
                  onClone={handleClone}
                  onDelete={handleDelete}
                  onSubmitApproval={handleSubmitApproval}
                  onWithdrawApproval={handleWithdrawApproval}
                  onViewRejectReason={handleViewRejectReason}
                  basePath="/ai-assisted/scenarios"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {filteredScenarios.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-700">暂无场景</h3>
          <p className="mb-4 text-sm text-slate-500">当前筛选条件下没有实践场景</p>
          <Button size="sm" onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            新建场景
          </Button>
        </div>
      )}

      {/* Approval workflow selection dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-approval-select")}>
              <div>
                <DialogTitle>选择审批流程</DialogTitle>
                <DialogDescription>
                  当前场景未关联批次，请手动选择一个审批流程。
                </DialogDescription>
              </div>
            </PrdAnnotation>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="workflowSelect">审批流程</Label>
              <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                <SelectTrigger id="workflowSelect">
                  <SelectValue placeholder="请选择审批流程" />
                </SelectTrigger>
                <SelectContent>
                  {approvalWorkflows.map((wf) => (
                    <SelectItem key={wf.id} value={wf.id}>
                      <div className="flex items-center gap-2">
                        <span>{wf.name}</span>
                        <span className="text-xs text-gray-400">({wf.steps.length}步)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {approvalScenario && (
              <div className="p-3 bg-slate-50 rounded-lg text-sm">
                <p className="text-slate-500">提交场景</p>
                <p className="font-medium text-slate-900 mt-1">{approvalScenario.name}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>取消</Button>
            <Button onClick={handleConfirmApproval} disabled={!selectedWorkflowId}>提交审批</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-import")}>
              <div>
                <DialogTitle>导入场景</DialogTitle>
                <DialogDescription>上传 Excel 或 JSON 文件批量导入场景数据</DialogDescription>
              </div>
            </PrdAnnotation>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <Upload className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-600 font-medium">点击或拖拽文件到此处上传</p>
              <p className="text-xs text-slate-400 mt-1">支持 .xlsx, .json 格式，单个文件不超过 10MB</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">资源编码冲突处理规则</Label>
              <RadioGroup
                value={importConflictRule}
                onValueChange={(v) => setImportConflictRule(v as "overwrite" | "new" | "skip")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overwrite" id="import-overwrite" />
                  <Label htmlFor="import-overwrite" className="text-sm font-normal cursor-pointer">覆盖</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="import-new" />
                  <Label htmlFor="import-new" className="text-sm font-normal cursor-pointer">新建</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skip" id="import-skip" />
                  <Label htmlFor="import-skip" className="text-sm font-normal cursor-pointer">跳过</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsImportDialogOpen(false)}>开始导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-export")}>
              <div>
                <DialogTitle>批量导出场景</DialogTitle>
                <DialogDescription>已选择 {selectedIds.length} 个场景，请选择导出格式</DialogDescription>
              </div>
            </PrdAnnotation>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
              <div className="h-10 w-10 rounded bg-green-50 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">XLSX</span>
              </div>
              <div>
                <p className="text-sm font-medium">导出为 Excel</p>
                <p className="text-xs text-slate-400">包含场景基础信息和任务配置</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
              <div className="h-10 w-10 rounded bg-blue-50 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">JSON</span>
              </div>
              <div>
                <p className="text-sm font-medium">导出为 JSON</p>
                <p className="text-xs text-slate-400">完整的场景数据结构，适用于备份和迁移</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsExportDialogOpen(false)}>确认导出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resource Import Dialog */}
      <Dialog open={isResourceImportDialogOpen} onOpenChange={setIsResourceImportDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>资源包导入</DialogTitle>
            <DialogDescription>导入包含场景、任务和资源的完整资源包</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center">
              <Upload className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-600 font-medium">点击或拖拽资源包到此处上传</p>
              <p className="text-xs text-slate-400 mt-1">支持 .zip, .rar 格式</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResourceImportDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsResourceImportDialogOpen(false)}>开始导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Move Dialog */}
      <Dialog open={isBatchMoveDialogOpen} onOpenChange={setIsBatchMoveDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-batch-move")}>
              <div>
                <DialogTitle>调整批次分组</DialogTitle>
                <DialogDescription>将已选择的 {selectedIds.length} 个场景移动到其他批次分组</DialogDescription>
              </div>
            </PrdAnnotation>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="targetBatch">目标批次分组</Label>
              <Select>
                <SelectTrigger id="targetBatch">
                  <SelectValue placeholder="请选择目标批次分组" />
                </SelectTrigger>
                <SelectContent>
                  {localBatches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      <span className="flex items-center gap-2">
                        {batch.name}
                        <span className="text-xs text-gray-400">({batch.code})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchMoveDialogOpen(false)}>取消</Button>
            <Button onClick={() => { setIsBatchMoveDialogOpen(false); setSelectedIds([]) }}>确认移动</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Workflow Config Dialog */}
      <Dialog open={isApprovalWorkflowDialogOpen} onOpenChange={setIsApprovalWorkflowDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-approval-workflow-config")}>
              <div>
                <DialogTitle>配置审批流程</DialogTitle>
                <DialogDescription>管理场景审批流程模板</DialogDescription>
              </div>
            </PrdAnnotation>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setIsApprovalWorkflowDialogOpen(false)}>
                <Plus className="mr-2 h-4 w-4" />
                新增审批流程
              </Button>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>流程名称</TableHead>
                    <TableHead>流程描述</TableHead>
                    <TableHead>审批步骤</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvalWorkflows.map((wf) => (
                    <TableRow key={wf.id}>
                      <TableCell className="font-medium text-sm">{wf.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{wf.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {wf.steps.map((step) => (
                            <Badge key={step.id} variant="outline" className="text-xs">
                              {step.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{wf.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalWorkflowDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Rename Dialog */}
      <Dialog open={isCloneRenameDialogOpen} onOpenChange={setIsCloneRenameDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-clone-rename")}>
              <div>
                <DialogTitle>克隆场景</DialogTitle>
                <DialogDescription>
                  请为克隆后的场景命名
                </DialogDescription>
              </div>
            </PrdAnnotation>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="cloneName">场景名称</Label>
              <Input
                id="cloneName"
                value={cloneRenameValue}
                onChange={(e) => setCloneRenameValue(e.target.value)}
                placeholder="输入新场景名称"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloneRenameDialogOpen(false)}>取消</Button>
            <Button onClick={handleConfirmClone}>确认克隆</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectReasonDialogOpen} onOpenChange={setIsRejectReasonDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-reject-reason")}>
              <div>
                <DialogTitle>驳回原因</DialogTitle>
                <DialogDescription>
                  场景「{rejectReasonScenario?.name}」的审批驳回原因
                </DialogDescription>
              </div>
            </PrdAnnotation>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-sm text-red-700">
                  {rejectReasonScenario ? getRejectReason(rejectReasonScenario) : ""}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectReasonDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
