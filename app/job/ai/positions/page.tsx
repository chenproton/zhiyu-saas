"use client"

import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FolderKanban,
  GitBranch,
  LayoutList,
  ListFilter,
  Loader2,
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
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useMemo, useEffect, useRef, useCallback } from "react"
import { PositionList } from "@/components/job/positions/position-list"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/stores/data-context"
import type { Position } from "@/lib/types/job-source"

const CURRENT_USER_ID = "user-1"

type TabType = "my" | "collab" | "public"
type ViewMode = "list" | "group"

function PositionsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { positions, batches, workflows, addPosition, deletePosition, updatePosition, submitForApproval, withdrawPosition, invitePosition, importPositions, exportPositions } = useData()

  const [activeTab, setActiveTab] = useState<TabType>("my")
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedBatches, setExpandedBatches] = useState<string[]>(batches.map((b) => b.id))

  // Dialogs

  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false)
  const [isInnerBatchCreateOpen, setIsInnerBatchCreateOpen] = useState(false)
  const [newBatchName, setNewBatchName] = useState("")
  const [newBatchWorkflow, setNewBatchWorkflow] = useState("")

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isBatchMoveDialogOpen, setIsBatchMoveDialogOpen] = useState(false)
  const [moveTargetBatchId, setMoveTargetBatchId] = useState("")

  // 导入岗位相关状态
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isCloneRenameDialogOpen, setIsCloneRenameDialogOpen] = useState(false)
  const [cloneRenameValue, setCloneRenameValue] = useState("")
  const [cloneTargetPosition, setCloneTargetPosition] = useState<Position | null>(null)

  // 批量生成成功提示弹窗
  const [showGeneratedDialog, setShowGeneratedDialog] = useState(false)

  useEffect(() => {
    if (searchParams.get('batchGenerated') === '1') {
      setShowGeneratedDialog(true)
    }
  }, [searchParams])

  const toggleBatch = (batchId: string) => {
    setExpandedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    )
  }

  const tabFilteredPositions = useMemo(() => {
    switch (activeTab) {
      case "my":
        return positions.filter((p) => p.createdBy === CURRENT_USER_ID)
      case "collab":
        return positions.filter((p) => p.collaborators.includes(CURRENT_USER_ID))
      case "public":
      default:
        return positions.filter((p) => p.status === "published")
    }
  }, [positions, activeTab])

  const filteredPositions = useMemo(() => {
    let result = tabFilteredPositions
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.shortName.toLowerCase().includes(q)
      )
    }
    if (selectedBatchId) {
      result = result.filter((p) => p.batchId === selectedBatchId)
    }
    if (selectedStatus) {
      result = result.filter((p) => p.status === selectedStatus)
    }
    return result
  }, [tabFilteredPositions, searchQuery, selectedBatchId, selectedStatus])

  const stats = useMemo(() => {
    const total = filteredPositions.length
    const draft = filteredPositions.filter((p) => p.status === "draft").length
    const pending = filteredPositions.filter((p) => p.status === "pending").length
    const rejected = filteredPositions.filter((p) => p.status === "rejected").length
    const published = filteredPositions.filter((p) => p.status === "published").length
    return { total, draft, pending, rejected, published }
  }, [filteredPositions])

  const positionsByBatch = useMemo(() => {
    if (viewMode !== "group") return null
    const groups: Record<string, Position[]> = {}
    filteredPositions.forEach((p) => {
      if (!p.batchId) return
      if (!groups[p.batchId]) groups[p.batchId] = []
      groups[p.batchId].push(p)
    })
    return groups
  }, [filteredPositions, viewMode])

  const uncategorizedPositions = useMemo(
    () => filteredPositions.filter((p) => !p.batchId && p.status === "draft"),
    [filteredPositions]
  )

  const openBatches = batches.filter((b) => b.status === "open")

  const handleSelectId = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((sid) => sid !== id)))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredPositions.map((p) => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const selectedPositions = positions.filter((p) => selectedIds.includes(p.id))

  const hasSelected = selectedIds.length > 0

  const canBatchSubmit = selectedPositions.some((p) => p.status === "draft" || p.status === "rejected")
  const canBatchWithdraw = selectedPositions.some((p) => p.status === "pending")
  const canBatchUnpublish = selectedPositions.some((p) => p.status === "published")
  const canBatchPublish = selectedPositions.some((p) => p.status === "approved")
  const canBatchDelete = selectedPositions.some((p) => p.status === "draft" || p.status === "rejected")

  const handleBatchSubmitApproval = () => {
    selectedIds.forEach((id) => {
      const position = positions.find((p) => p.id === id)
      if (position && (position.status === "draft" || position.status === "rejected")) {
        const batch = batches.find((b) => b.id === position.batchId)
        if (batch) {
          submitForApproval(id, batch.workflowId, "user-2", "李建设")
        }
      }
    })
    setSelectedIds([])
  }

  const handleBatchWithdrawApproval = async () => {
    for (const id of selectedIds) {
      const position = positions.find((p) => p.id === id)
      if (position && position.status === "pending") {
        await withdrawPosition(id)
      }
    }
    setSelectedIds([])
  }

  const handleBatchUnpublish = () => {
    selectedIds.forEach((id) => {
      const position = positions.find((p) => p.id === id)
      if (position && position.status === "published") {
        updatePosition(id, { status: "draft" })
      }
    })
    setSelectedIds([])
  }

  const handleBatchPublish = () => {
    selectedIds.forEach((id) => {
      const position = positions.find((p) => p.id === id)
      if (position && position.status === "approved") {
        updatePosition(id, { status: "published" })
      }
    })
    setSelectedIds([])
  }

  const handleBatchDelete = () => {
    selectedIds.forEach((id) => deletePosition(id))
    setSelectedIds([])
  }

  const handleBatchClone = () => {
    const toClone = positions.filter((p) => selectedIds.includes(p.id))
    toClone.forEach((position) => {
      addPosition({
        batchId: position.batchId,
        version: position.version,
        status: "draft",
        name: `${position.name} (克隆)`,
        shortName: position.shortName,
        industry: position.industry,
        majors: position.majors,
        positionType: position.positionType,
        salaryRange: position.salaryRange,
        certificates: [],
        description: position.description,
        responsibilities: position.responsibilities,
        requirements: position.requirements,
        careerPath: position.careerPath,
        abilityModel: { nodes: [], edges: [] },
        abilityBindings: position.abilityBindings,
        abilityDomains: position.abilityDomains,
        competencyConfig: position.competencyConfig,
        createdBy: CURRENT_USER_ID,
        collaborators: [CURRENT_USER_ID],
        favoriteCount: 0,
      })
    })
    setSelectedIds([])
  }

  const handleBatchExport = async () => {
    await exportPositions()
    setIsExportDialogOpen(false)
    setSelectedIds([])
  }

  const handleBatchMove = () => {
    setIsBatchMoveDialogOpen(true)
  }

  const handleConfirmMove = () => {
    if (!moveTargetBatchId) return
    selectedIds.forEach((id) => {
      updatePosition(id, { batchId: moveTargetBatchId })
    })
    setSelectedIds([])
    setIsBatchMoveDialogOpen(false)
    setMoveTargetBatchId("")
  }

  const handleClone = (position: Position) => {
    setCloneTargetPosition(position)
    setCloneRenameValue(`${position.name} (克隆)`)
    setIsCloneRenameDialogOpen(true)
  }

  const handleConfirmClone = () => {
    if (!cloneTargetPosition) return
    addPosition({
      batchId: cloneTargetPosition.batchId,
      version: "V1.0",
      status: "draft",
      name: cloneRenameValue,
      shortName: cloneTargetPosition.shortName,
      industry: cloneTargetPosition.industry,
      majors: cloneTargetPosition.majors,
      positionType: cloneTargetPosition.positionType,
      salaryRange: cloneTargetPosition.salaryRange,
      certificates: [],
      description: cloneTargetPosition.description,
      responsibilities: cloneTargetPosition.responsibilities,
      requirements: cloneTargetPosition.requirements,
      careerPath: cloneTargetPosition.careerPath,
      abilityModel: { nodes: [], edges: [] },
      abilityBindings: cloneTargetPosition.abilityBindings,
      abilityDomains: cloneTargetPosition.abilityDomains,
      competencyConfig: cloneTargetPosition.competencyConfig,
      createdBy: CURRENT_USER_ID,
      collaborators: [CURRENT_USER_ID],
      favoriteCount: 0,
    })
    setIsCloneRenameDialogOpen(false)
    setCloneTargetPosition(null)
    setCloneRenameValue("")
  }

  const handleDelete = (position: Position) => {
    if (confirm(`确定要删除岗位「${position.name}」吗？`)) {
      deletePosition(position.id)
    }
  }

  const handleSubmitApproval = (position: Position) => {
    const batch = batches.find((b) => b.id === position.batchId)
    if (!batch) {
      alert("该岗位未关联批次，无法提交审批")
      return
    }
    submitForApproval(position.id, batch.workflowId, "user-2", "李建设")
  }

  const handleWithdrawApproval = async (position: Position) => {
    await withdrawPosition(position.id)
  }

  const handleAddBatch = () => {
    if (!newBatchName || !newBatchWorkflow) return
    alert("批次创建请前往「批次分组管理」页面")
    setNewBatchName("")
    setNewBatchWorkflow("")
    setIsInnerBatchCreateOpen(false)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedBatchId(null)
    setSelectedStatus(null)
  }

  const handleCloseGeneratedDialog = () => {
    setShowGeneratedDialog(false)
    router.replace('/job/ai/positions')
  }

  const handleCreate = () => {
    router.push('/job/ai/positions/new')
  }

  // 导入岗位：等级映射
  const parseCompetencyLevel = (levelStr: string): string => {
    if (!levelStr) return 'understand'
    if (levelStr.includes('L1') || levelStr.includes('了解')) return 'understand'
    if (levelStr.includes('L2') || levelStr.includes('熟练')) return 'comprehend'
    if (levelStr.includes('L3') || levelStr.includes('掌握')) return 'master'
    if (levelStr.includes('L4') || levelStr.includes('精通')) return 'proficient'
    if (levelStr.includes('L5') || levelStr.includes('专家')) return 'expert'
    return 'understand'
  }

  // 导入岗位：将上传的 JSON 对象转换为 Position 结构
  const convertImportToPosition = useCallback((raw: any): Omit<Position, 'id' | 'createdAt' | 'updatedAt'> => {
    const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const responsibilities = (raw.responsibilities || []).map((r: any, idx: number) => ({
      id: makeId(`resp-${idx}`),
      name: r.name || '',
      description: '',
    }))

    const requirements = (raw.requirements || []).map((r: any) => r.name || '').filter(Boolean)

    const certificates = (raw.certificates || []).map((c: any, idx: number) => ({
      id: makeId(`cert-${idx}`),
      name: c.name || '',
      description: c.description || '',
    }))

    const competencyConfig = (raw.competencyConfig || []).map((c: any, idx: number) => ({
      id: makeId(`comp-${idx}`),
      abilityId: '',
      abilityName: c.abilityName || '',
      level: parseCompetencyLevel(c.level || '') as any,
      ruleDescription: c.ruleDescription || '',
      weight: 0,
    }))

    const abilityBindings = (raw.abilityBindings || []).map((b: any, idx: number) => ({
      id: makeId(`bind-${idx}`),
      responsibilityId: '',
      source: 'custom' as const,
      name: b.name || '',
      category: '',
      level: 'understand' as any,
      rubricDescription: '',
      attributes: b.attributes || [],
      domain: b.domain || '',
    }))

    const abilityDomains = (raw.abilityDomains || []).map((d: any, idx: number) => ({
      id: makeId(`domain-${idx}`),
      name: d.name || '',
      description: '',
      bindingIds: [],
    }))

    return {
      batchId: '',
      version: 'v1',
      status: 'draft',
      name: raw.name || '',
      shortName: raw.shortName || '',
      industry: raw.industry || '',
      majors: raw.majors || [],
      positionType: raw.positionType || 'enterprise',
      salaryRange: raw.salaryRange || [0, 0],
      coverImage: raw.coverImage || '',
      description: raw.description || '',
      responsibilities,
      requirements,
      careerPath: typeof raw.careerPath === 'string' ? raw.careerPath : '',
      certificates,
      abilityModel: { nodes: [], edges: [] },
      abilityBindings,
      abilityDomains,
      competencyConfig,
      createdBy: CURRENT_USER_ID,
      collaborators: [],
      favoriteCount: 0,
    }
  }, [])

  // 导入岗位：处理文件选择
  const handleImportFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.name.endsWith('.csv')) {
      setImportError('请上传 CSV 格式的文件')
      setImportFile(null)
      return
    }
    setImportError(null)
    setImportFile(file)
  }, [])

  // 导入岗位：处理拖拽
  const handleImportDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleImportFileSelect(e.dataTransfer.files)
  }, [handleImportFileSelect])

  // 导入岗位：执行导入
  const handleImport = useCallback(async () => {
    if (!importFile) return
    setIsImporting(true)
    setImportError(null)
    try {
      const result = await importPositions(importFile)
      alert(`导入完成：成功 ${result.created} 条，失败 ${result.failed} 条`)
      setIsImportDialogOpen(false)
      setImportFile(null)
    } catch (err: any) {
      setImportError('导入失败：' + (err?.message || '未知错误'))
    } finally {
      setIsImporting(false)
    }
  }, [importFile, importPositions])

  return (
    <div className="space-y-6">
      {/* ===== Part 1: Top Title Card ===== */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">岗位资源管理(AI辅助 V2)</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                维护岗位信息、能力模型等岗位资源管理功能 — AI 辅助手动建设模式
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <GitBranch className="mr-2 h-4 w-4" />
                配置审批流程
              </Button>

              <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderKanban className="mr-2 h-4 w-4" />
                    配置批次分组
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <div>
                      <DialogTitle>批次分组管理</DialogTitle>
                      <DialogDescription>管理岗位建设批次分组，关联审批流程</DialogDescription>
                    </div>
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
                            <div>
                              <DialogTitle>新增批次</DialogTitle>
                              <DialogDescription>创建新的岗位建设批次分组，并关联审批流程。</DialogDescription>
                            </div>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="batchName">分组名称</Label>
                              <Input
                                id="batchName"
                                value={newBatchName}
                                onChange={(e) => setNewBatchName(e.target.value)}
                                placeholder="例如：2026春季电商实训岗位开发"
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
                                  {workflows.map((wf) => (
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
                      <div className="grid grid-cols-3 gap-4 px-4 py-2 bg-slate-50 text-xs font-medium text-slate-500 border-b">
                        <div>分组名称</div>
                        <div>批次编号</div>
                        <div>审批流程</div>
                      </div>
                      {batches.map((batch) => (
                        <div key={batch.id} className="grid grid-cols-3 gap-4 px-4 py-2 text-sm border-b last:border-0">
                          <div className="font-medium">{batch.name}</div>
                          <div className="text-gray-500">{batch.id.slice(0, 12)}</div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {workflows.find((w) => w.id === batch.workflowId)?.name || "-"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBatchDialogOpen(false)}>关闭</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" disabled>
                <Upload className="mr-2 h-4 w-4" />
                导入资源包
              </Button>

              <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                导入岗位
              </Button>

              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                新建岗位
              </Button>
            </div>
          </div>

          {/* Stats dashboard - hidden in public tab */}
          {activeTab !== "public" && (
            <div className="grid grid-cols-5 gap-3 mt-3">
              <Card className="border-slate-200 shadow-sm w-full">
                <CardContent className="px-3 py-[3px] flex items-center justify-between">
                  <div className="leading-none">
                    <p className="text-xs text-slate-500 leading-none">岗位总数</p>
                    <p className="text-xl font-bold text-slate-900 leading-none mt-[3px]">{stats.total}</p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <SlidersHorizontal className="h-3 w-3 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Part 2: View Switch Area ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as TabType); setSelectedIds([]); setSelectedBatchId(null) }}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="my" className="w-full">我的岗位</TabsTrigger>
            <TabsTrigger value="collab" className="w-full">共建岗位</TabsTrigger>
            <TabsTrigger value="public" className="w-full">公共岗位</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center border rounded-md overflow-hidden">
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
        </div>
      </div>

      {/* ===== Part 3: Data List Area ===== */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5">
          {/* Search + Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 w-full">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索岗位名称 / 简称"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 text-sm flex-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedBatchId || "__all__"} onValueChange={(v) => setSelectedBatchId(v === "__all__" ? null : v)}>
                <SelectTrigger className="h-9 text-sm w-44">
                  <SelectValue placeholder="按批次筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">全部批次</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      <span className="flex items-center gap-2">
                        {batch.name}
                        <span className="text-xs text-gray-400">({batch.id.slice(0, 8)})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            </div>
            <Button variant="outline" size="sm" className="h-9" onClick={handleResetFilters}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              重置
            </Button>
          </div>

          {/* Quick actions - linked with checkboxes */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className={cn("text-xs mr-1", hasSelected ? "text-slate-700 font-medium" : "text-slate-400")}>
              {hasSelected ? `已选择 ${selectedIds.length} 项：` : "请选择岗位："}
            </span>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchSubmit} onClick={handleBatchSubmitApproval}>
              <Send className="mr-1 h-3 w-3" />
              提交审批
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchWithdraw} onClick={handleBatchWithdrawApproval}>
              <Undo2 className="mr-1 h-3 w-3" />
              撤回审批
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchPublish} onClick={handleBatchPublish}>
              <ArrowUpFromLine className="mr-1 h-3 w-3" />
              发布
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchUnpublish} onClick={handleBatchUnpublish}>
              <ArrowDownFromLine className="mr-1 h-3 w-3" />
              取消发布
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchDelete} onClick={handleBatchDelete}>
              <Trash2 className="mr-1 h-3 w-3" />
              删除
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected} onClick={handleBatchClone}>
              <Copy className="mr-1 h-3 w-3" />
              克隆
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected} onClick={handleBatchMove}>
              <FolderKanban className="mr-1 h-3 w-3" />
              调整批次分组
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected} onClick={handleBatchExport}>
              <Download className="mr-1 h-3 w-3" />
              导出
            </Button>
          </div>
        </CardContent>

        {/* Position list - merged into the same Card */}
        {filteredPositions.length > 0 && viewMode !== "group" && (
          <CardContent className="pt-0">
            <PositionList
              positions={filteredPositions}
              selectedIds={selectedIds}
              onSelectId={handleSelectId}
              onSelectAll={handleSelectAll}
              onClone={handleClone}
              onDelete={handleDelete}
              onSubmitApproval={handleSubmitApproval}
              onWithdrawApproval={handleWithdrawApproval}
              className="border-0 rounded-none"
              basePath="/job/ai/positions"
            />
          </CardContent>
        )}
      </Card>

      {/* Position list - group view remains outside the card */}
      {filteredPositions.length > 0 && viewMode === "group" && positionsByBatch && (
        <div className="space-y-4">
          {Object.entries(positionsByBatch).map(([batchId, batchPositions]) => {
            const batch = batches.find((b) => b.id === batchId)
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
                        <span className="text-xs text-gray-400">({batch.department} - {batch.major})</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {batchPositions.length} 个岗位
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0">
                      <PositionList
                        positions={batchPositions}
                        selectedIds={selectedIds}
                        onSelectId={handleSelectId}
                        onSelectAll={handleSelectAll}
                        onClone={handleClone}
                        onDelete={handleDelete}
                        onSubmitApproval={handleSubmitApproval}
                        onWithdrawApproval={handleWithdrawApproval}
                        basePath="/job/ai/positions"
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
          {uncategorizedPositions.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">未分类</span>
                  <Badge variant="secondary" className="text-xs">
                    {uncategorizedPositions.length} 个岗位
                  </Badge>
                </div>
              </div>
              <div className="p-4 pt-0">
                <PositionList
                  positions={uncategorizedPositions}
                  selectedIds={selectedIds}
                  onSelectId={handleSelectId}
                  onSelectAll={handleSelectAll}
                  onClone={handleClone}
                  onDelete={handleDelete}
                  onSubmitApproval={handleSubmitApproval}
                  onWithdrawApproval={handleWithdrawApproval}
                  basePath="/job/ai/positions"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {filteredPositions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-700">暂无岗位</h3>
          <p className="mb-4 text-sm text-slate-500">当前筛选条件下没有岗位数据</p>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建岗位
          </Button>
        </div>
      )}

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={(open) => {
        setIsImportDialogOpen(open)
        if (!open) {
          setImportFile(null)
          setImportError(null)
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>导入岗位</DialogTitle>
            <DialogDescription>上传 CSV 文件批量导入岗位数据（需包含 name 列）</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {!importFile ? (
              <div
                onDrop={handleImportDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleImportFileSelect(e.target.files)}
                />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  拖拽文件到此处，或点击选择文件
                </p>
                <p className="text-xs text-muted-foreground">仅支持 .csv 格式</p>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{importFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(importFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setImportFile(null); setImportError(null) }}
                    disabled={isImporting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {importError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {importError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
              disabled={isImporting}
            >
              取消
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importFile || isImporting}
            >
              {isImporting ? '导入中...' : '开始导入'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>导出岗位</DialogTitle>
            <DialogDescription>将选中的岗位数据导出为文件</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-500">已选择 {selectedIds.length} 个岗位</p>
            <div className="grid gap-2">
              <Label>导出格式</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">Excel (.xlsx)</Button>
                <Button variant="outline" size="sm" className="flex-1">CSV (.csv)</Button>
                <Button variant="outline" size="sm" className="flex-1">JSON (.json)</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>取消</Button>
            <Button onClick={handleBatchExport}>确认导出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Move Dialog */}
      <Dialog open={isBatchMoveDialogOpen} onOpenChange={setIsBatchMoveDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>调整批次分组</DialogTitle>
            <DialogDescription>将选中的 {selectedIds.length} 个岗位移动到指定批次</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={moveTargetBatchId} onValueChange={setMoveTargetBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="选择目标批次" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchMoveDialogOpen(false)}>取消</Button>
            <Button onClick={handleConfirmMove} disabled={!moveTargetBatchId}>确认移动</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Generated Success Dialog */}
      <Dialog open={showGeneratedDialog} onOpenChange={setShowGeneratedDialog}>
        <DialogContent className="sm:max-w-[460px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-800">
              <Check className="h-5 w-5 text-green-500" />
              岗位批量生成成功
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              AI 已根据您的配置成功生成岗位草稿，您可以前往列表查看并继续编辑完善岗位详情。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseGeneratedDialog} className="bg-gray-900 hover:bg-gray-800 text-white">
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Rename Dialog */}
      <Dialog open={isCloneRenameDialogOpen} onOpenChange={setIsCloneRenameDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>克隆岗位</DialogTitle>
            <DialogDescription>为克隆的岗位命名</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={cloneRenameValue}
              onChange={(e) => setCloneRenameValue(e.target.value)}
              placeholder="输入新岗位名称"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloneRenameDialogOpen(false)}>取消</Button>
            <Button onClick={handleConfirmClone} disabled={!cloneRenameValue.trim()}>确认克隆</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


export default function PositionsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <PositionsPageContent />
    </Suspense>
  )
}
