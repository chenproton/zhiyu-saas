"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { CourseList } from "./course-list"
import type { Course, CourseStatus, CourseType } from "@/lib/types/lesson-source"
import { COURSE_STATUS_LABELS } from "@/lib/types/lesson-source"

const CURRENT_USER_ID = "user-1"

type TabType = "my" | "collab" | "public"
type ViewMode = "list" | "group"

interface MockBatch {
  id: string
  name: string
  department: string
  major: string
}

interface CourseAdminPageProps {
  title: string
  subtitle: string
  courseType: CourseType
  courses: Course[]
  addHref: string
}

export function CourseAdminPage({ title, subtitle, courseType, courses, addHref }: CourseAdminPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("my")
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Mock batches derived from courses
  const batches: MockBatch[] = useMemo(() => {
    const map = new Map<string, MockBatch>()
    courses.forEach((c) => {
      if (!c.batchGroup || map.has(c.batchGroup)) return
      map.set(c.batchGroup, {
        id: c.batchGroup,
        name: c.batchGroup,
        department: "教学系",
        major: c.major,
      })
    })
    return Array.from(map.values())
  }, [courses])

  const [expandedBatches, setExpandedBatches] = useState<string[]>(batches.map((b) => b.id))

  // Dialogs
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isBatchMoveDialogOpen, setIsBatchMoveDialogOpen] = useState(false)
  const [moveTargetBatchId, setMoveTargetBatchId] = useState("")

  const [isCloneRenameDialogOpen, setIsCloneRenameDialogOpen] = useState(false)
  const [cloneRenameValue, setCloneRenameValue] = useState("")
  const [cloneTargetCourse, setCloneTargetCourse] = useState<Course | null>(null)

  const [courseData, setCourseData] = useState<Course[]>(courses)

  const toggleBatch = (batchId: string) => {
    setExpandedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    )
  }

  const tabFilteredCourses = useMemo(() => {
    switch (activeTab) {
      case "my":
        return courseData.filter((c) => c.creator === "杭州知与未来科技有限公司" || !c.creator)
      case "collab":
        return courseData.filter((c) => c.coCreator && c.coCreator !== "-")
      case "public":
      default:
        return courseData.filter((c) => c.status === "published")
    }
  }, [courseData, activeTab])

  const filteredCourses = useMemo(() => {
    let result = tabFilteredCourses
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      )
    }
    if (selectedBatchId) {
      result = result.filter((c) => c.batchGroup === selectedBatchId)
    }
    if (selectedStatus) {
      result = result.filter((c) => c.status === selectedStatus)
    }
    return result
  }, [tabFilteredCourses, searchQuery, selectedBatchId, selectedStatus])

  const stats = useMemo(() => {
    const total = filteredCourses.length
    const draft = filteredCourses.filter((c) => c.status === "draft").length
    const pending = filteredCourses.filter((c) => c.status === "pending").length
    const rejected = filteredCourses.filter((c) => c.status === "rejected").length
    const published = filteredCourses.filter((c) => c.status === "published").length
    return { total, draft, pending, rejected, published }
  }, [filteredCourses])

  const coursesByBatch = useMemo(() => {
    if (viewMode !== "group") return null
    const groups: Record<string, Course[]> = {}
    filteredCourses.forEach((c) => {
      if (!c.batchGroup) return
      if (!groups[c.batchGroup]) groups[c.batchGroup] = []
      groups[c.batchGroup].push(c)
    })
    return groups
  }, [filteredCourses, viewMode])

  const uncategorizedCourses = useMemo(
    () => filteredCourses.filter((c) => !c.batchGroup && c.status === "draft"),
    [filteredCourses]
  )

  const handleSelectId = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((sid) => sid !== id)))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCourses.map((c) => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const selectedCourses = courseData.filter((c) => selectedIds.includes(c.id))
  const hasSelected = selectedIds.length > 0

  const canBatchSubmit = selectedCourses.some((c) => c.status === "draft" || c.status === "rejected")
  const canBatchWithdraw = selectedCourses.some((c) => c.status === "pending")
  const canBatchUnpublish = selectedCourses.some((c) => c.status === "published")
  const canBatchDelete = selectedCourses.some((c) => c.status === "draft" || c.status === "rejected")

  const updateCourseStatus = (id: string, status: CourseStatus) => {
    setCourseData((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  const handleBatchSubmitApproval = () => {
    selectedIds.forEach((id) => {
      const course = courseData.find((c) => c.id === id)
      if (course && (course.status === "draft" || course.status === "rejected")) {
        updateCourseStatus(id, "pending")
      }
    })
    setSelectedIds([])
  }

  const handleBatchWithdrawApproval = () => {
    alert("撤回审批功能暂未实现")
    setSelectedIds([])
  }

  const handleBatchUnpublish = () => {
    selectedIds.forEach((id) => {
      const course = courseData.find((c) => c.id === id)
      if (course && course.status === "published") {
        updateCourseStatus(id, "draft")
      }
    })
    setSelectedIds([])
  }

  const handleBatchPublish = () => {
    selectedIds.forEach((id) => {
      updateCourseStatus(id, "published")
    })
    setSelectedIds([])
  }

  const handleBatchDelete = () => {
    setCourseData((prev) => prev.filter((c) => !selectedIds.includes(c.id)))
    setSelectedIds([])
  }

  const handleBatchClone = () => {
    const toClone = courseData.filter((c) => selectedIds.includes(c.id))
    const newCourses: Course[] = toClone.map((course) => ({
      ...course,
      id: `${course.id}-clone-${Date.now()}`,
      name: `${course.name} (克隆)`,
      status: "draft" as CourseStatus,
    }))
    setCourseData((prev) => [...prev, ...newCourses])
    setSelectedIds([])
  }

  const handleBatchExport = () => {
    setIsExportDialogOpen(true)
  }

  const handleBatchMove = () => {
    setIsBatchMoveDialogOpen(true)
  }

  const handleConfirmMove = () => {
    if (!moveTargetBatchId) return
    setCourseData((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, batchGroup: moveTargetBatchId } : c))
    )
    setSelectedIds([])
    setIsBatchMoveDialogOpen(false)
    setMoveTargetBatchId("")
  }

  const handleClone = (course: Course) => {
    setCloneTargetCourse(course)
    setCloneRenameValue(`${course.name} (克隆)`)
    setIsCloneRenameDialogOpen(true)
  }

  const handleConfirmClone = () => {
    if (!cloneTargetCourse) return
    setCourseData((prev) => [
      ...prev,
      {
        ...cloneTargetCourse,
        id: `${cloneTargetCourse.id}-clone-${Date.now()}`,
        name: cloneRenameValue,
        status: "draft",
      },
    ])
    setIsCloneRenameDialogOpen(false)
    setCloneTargetCourse(null)
    setCloneRenameValue("")
  }

  const handleDelete = (course: Course) => {
    if (confirm(`确定要删除课程「${course.name}」吗？`)) {
      setCourseData((prev) => prev.filter((c) => c.id !== course.id))
    }
  }

  const handleSubmitApproval = (course: Course) => {
    if (!course.batchGroup) {
      alert("该课程未关联批次，无法提交审批")
      return
    }
    updateCourseStatus(course.id, "pending")
  }

  const handleWithdrawApproval = () => {
    alert("撤回审批功能暂未实现")
  }

  const handleInviteCoBuild = (course: Course) => {
    alert(`已发送共建邀请至「${course.name}」的协作人员`)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedBatchId(null)
    setSelectedStatus(null)
  }

  const typeLabel = courseType === "system" ? "体系课" : courseType === "granular" ? "颗粒课" : "混合课"

  return (
    <div className="space-y-6">
      {/* ===== Part 1: Top Title Card ===== */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <GitBranch className="mr-2 h-4 w-4" />
                配置审批流程
              </Button>

              <Button variant="outline" size="sm" onClick={() => setIsBatchDialogOpen(true)}>
                <FolderKanban className="mr-2 h-4 w-4" />
                配置批次分组
              </Button>

              <Button variant="outline" size="sm" disabled>
                <Upload className="mr-2 h-4 w-4" />
                导入资源包
              </Button>

              <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                导入{typeLabel}
              </Button>

              <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                <Link href={addHref}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增{typeLabel}
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats dashboard - hidden in public tab */}
          {activeTab !== "public" && (
            <div className="grid grid-cols-5 gap-3 mt-3">
              <Card className="border-slate-200 shadow-sm w-full">
                <CardContent className="px-3 py-[3px] flex items-center justify-between">
                  <div className="leading-none">
                    <p className="text-xs text-slate-500 leading-none">{typeLabel}总数</p>
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
            <TabsTrigger value="my" className="w-full">我的{typeLabel}</TabsTrigger>
            <TabsTrigger value="collab" className="w-full">共建{typeLabel}</TabsTrigger>
            <TabsTrigger value="public" className="w-full">公共{typeLabel}</TabsTrigger>
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
                  placeholder={`搜索${typeLabel}名称 / 编码`}
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
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus || "__all__"} onValueChange={(v) => setSelectedStatus(v === "__all__" ? null : v as CourseStatus)}>
                <SelectTrigger className="h-9 text-sm w-36">
                  <SelectValue placeholder="按状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="pending">审批中</SelectItem>
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
              {hasSelected ? `已选择 ${selectedIds.length} 项：` : "请选择课程："}
            </span>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchSubmit} onClick={handleBatchSubmitApproval}>
              <Send className="mr-1 h-3 w-3" />
              提交审批
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected || !canBatchWithdraw} onClick={handleBatchWithdrawApproval}>
              <Undo2 className="mr-1 h-3 w-3" />
              撤回审批
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={!hasSelected} onClick={handleBatchPublish}>
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

        {/* Course list - merged into the same Card */}
        {filteredCourses.length > 0 && viewMode !== "group" && (
          <CardContent className="pt-0">
            <CourseList
              courses={filteredCourses}
              courseType={courseType}
              selectedIds={selectedIds}
              onSelectId={handleSelectId}
              onSelectAll={handleSelectAll}
              onClone={handleClone}
              onDelete={handleDelete}
              onSubmitApproval={handleSubmitApproval}
              onWithdrawApproval={handleWithdrawApproval}
              onInviteCoBuild={handleInviteCoBuild}
              className="border-0 rounded-none"
            />
          </CardContent>
        )}
      </Card>

      {/* Course list - group view remains outside the card */}
      {filteredCourses.length > 0 && viewMode === "group" && coursesByBatch && (
        <div className="space-y-4">
          {Object.entries(coursesByBatch).map(([batchId, batchCourses]) => {
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
                        {batchCourses.length} 个{typeLabel}
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0">
                      <CourseList
                        courses={batchCourses}
                        courseType={courseType}
                        selectedIds={selectedIds}
                        onSelectId={handleSelectId}
                        onSelectAll={handleSelectAll}
                        onClone={handleClone}
                        onDelete={handleDelete}
                        onSubmitApproval={handleSubmitApproval}
                        onWithdrawApproval={handleWithdrawApproval}
                        onInviteCoBuild={handleInviteCoBuild}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
          {uncategorizedCourses.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">未分类</span>
                  <Badge variant="secondary" className="text-xs">
                    {uncategorizedCourses.length} 个{typeLabel}
                  </Badge>
                </div>
              </div>
              <div className="p-4 pt-0">
                <CourseList
                  courses={uncategorizedCourses}
                  courseType={courseType}
                  selectedIds={selectedIds}
                  onSelectId={handleSelectId}
                  onSelectAll={handleSelectAll}
                  onClone={handleClone}
                  onDelete={handleDelete}
                  onSubmitApproval={handleSubmitApproval}
                  onWithdrawApproval={handleWithdrawApproval}
                  onInviteCoBuild={handleInviteCoBuild}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-700">暂无{typeLabel}</h3>
          <p className="mb-4 text-sm text-slate-500">当前筛选条件下没有课程数据</p>
          <Button size="sm" asChild>
            <Link href={addHref}>
              <Plus className="mr-2 h-4 w-4" />
              新增{typeLabel}
            </Link>
          </Button>
        </div>
      )}

      {/* Batch Dialog */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div>
              <DialogTitle>批次分组管理</DialogTitle>
              <DialogDescription>管理课程建设批次分组</DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-3 gap-4 px-4 py-2 bg-slate-50 text-xs font-medium text-slate-500 border-b">
                <div>分组名称</div>
                <div>批次编号</div>
                <div>适用专业</div>
              </div>
              {batches.map((batch) => (
                <div key={batch.id} className="grid grid-cols-3 gap-4 px-4 py-2 text-sm border-b last:border-0">
                  <div className="font-medium">{batch.name}</div>
                  <div className="text-gray-500">{batch.id.slice(0, 12)}</div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {batch.major}
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

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入{typeLabel}</DialogTitle>
            <DialogDescription>上传 Excel 或 CSV 文件批量导入课程数据</DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                拖拽文件到此处，或点击选择文件
              </p>
              <Button variant="outline" size="sm">选择文件</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>取消</Button>
            <Button onClick={() => { alert(`导入${typeLabel}演示：文件已上传，正在解析...`); setIsImportDialogOpen(false) }}>开始导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>导出{typeLabel}</DialogTitle>
            <DialogDescription>将选中的课程数据导出为文件</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-500">已选择 {selectedIds.length} 个{typeLabel}</p>
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
            <Button onClick={() => { alert(`已导出 ${selectedIds.length} 个${typeLabel}数据`); setIsExportDialogOpen(false); setSelectedIds([]) }}>确认导出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Move Dialog */}
      <Dialog open={isBatchMoveDialogOpen} onOpenChange={setIsBatchMoveDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>调整批次分组</DialogTitle>
            <DialogDescription>将选中的 {selectedIds.length} 个{typeLabel}移动到指定批次</DialogDescription>
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

      {/* Clone Rename Dialog */}
      <Dialog open={isCloneRenameDialogOpen} onOpenChange={setIsCloneRenameDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>克隆{typeLabel}</DialogTitle>
            <DialogDescription>为克隆的课程命名</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={cloneRenameValue}
              onChange={(e) => setCloneRenameValue(e.target.value)}
              placeholder="输入新课程名称"
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
