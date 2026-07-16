"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Search, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  ArrowRight,
  MessageSquare,
  History,
  Filter,
  Loader2,
} from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import type { ApprovalRecord, Position, Workflow } from "@/lib/types/job-source"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { approvalApi, positionApi, workflowApi } from "@/lib/api"
import {
  convertApiApprovalToLocal,
  convertCareerPositionToPosition,
  convertApiWorkflowToLocal,
} from "@/lib/stores/job-converters"
import type { CareerPosition } from "@/lib/types/job"
import { useToast } from "@/hooks/use-toast"

const APPROVAL_TABS = [
  { value: "pending", label: "待我审批", icon: Clock },
  { value: "approved", label: "已通过", icon: CheckCircle2 },
  { value: "rejected", label: "已驳回", icon: XCircle },
  { value: "all", label: "全部记录", icon: FileText },
]

function mapIdentityToJobRole(code?: string): string {
  if (!code) return ""
  if (code === "platform_admin" || code === "school_admin") return "admin"
  if (code === "teacher") return "teacher"
  if (code === "student") return "student"
  if (code.startsWith("enterprise")) return "enterprise"
  return code
}

export default function ApprovalsPage() {
  const { toast } = useToast()
  const { user, identityType } = useAuth()
  const role = mapIdentityToJobRole(identityType?.code)
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("pending")
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [comment, setComment] = useState("")

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [approvalResp, positionResp, wfRes] = await Promise.all([
        approvalApi.list({ targetType: 'career_position', limit: 1000 }),
        positionApi.list({ limit: 1000 }),
        workflowApi.list({ limit: 1000 }),
      ])
      const positionMap = new Map(positionResp.items.map((p) => [p.id, p]))
      setApprovals(approvalResp.items.map((ar) => convertApiApprovalToLocal(ar, positionMap)))
      setPositions(positionResp.items.map(convertCareerPositionToPosition))
      setWorkflows(wfRes.items.map(convertApiWorkflowToLocal))
    } catch (err: any) {
      toast({ variant: 'destructive', title: '加载失败', description: err?.message || '请稍后重试' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const reviewerRoles = ["reviewer", "teacher", "enterprise"]
  const builderRoles = ["builder", "teacher", "enterprise", "student"]
  const myApprovals = approvals.filter((approval) => {
    if (role === "admin") return true
    if (reviewerRoles.includes(role)) {
      const workflow = workflows.find(w => w.id === approval.workflowId)
      const currentStep = workflow?.steps[approval.currentStepIndex]
      return currentStep?.role === "reviewer" || currentStep?.role === "admin"
    }
    if (user && builderRoles.includes(role)) {
      return approval.submittedBy === user.id
    }
    return false
  })

  const filteredApprovals = myApprovals.filter((approval) => {
    const matchesSearch =
      approval.positionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.submittedByName.toLowerCase().includes(searchQuery.toLowerCase())

    if (selectedTab === "all") return matchesSearch
    if (selectedTab === "pending") return matchesSearch && approval.status === "pending"
    if (selectedTab === "approved") return matchesSearch && approval.status === "approved"
    if (selectedTab === "rejected") return matchesSearch && approval.status === "rejected"
    return matchesSearch
  })

  const stats = {
    pending: myApprovals.filter((a) => a.status === "pending").length,
    approved: myApprovals.filter((a) => a.status === "approved").length,
    rejected: myApprovals.filter((a) => a.status === "rejected").length,
    total: myApprovals.length,
  }

  const handleOpenDetail = (approval: ApprovalRecord) => {
    setSelectedApproval(approval)
    setIsDetailOpen(true)
  }

  const handleOpenAction = (approval: ApprovalRecord, type: "approve" | "reject") => {
    setSelectedApproval(approval)
    setActionType(type)
    setComment("")
    setIsActionDialogOpen(true)
  }

  const handleSubmitAction = async () => {
    if (!selectedApproval || !actionType || !user) return
    try {
      if (actionType === "approve") {
        await approvalApi.review(selectedApproval.id, { status: "approved", comment })
      } else {
        await approvalApi.review(selectedApproval.id, { status: "rejected", comment })
      }
      await loadData()
      setIsActionDialogOpen(false)
      setSelectedApproval(null)
      setActionType(null)
      setComment("")
    } catch (err: any) {
      toast({ variant: 'destructive', title: '操作失败', description: err?.message || '请稍后重试' })
    }
  }

  const getRelatedPosition = (positionId: string) => {
    return positions.find((p) => p.id === positionId)
  }

  const getBatchName = (positionId: string) => {
    const position = positions.find((p) => p.id === positionId)
    if (!position) return "未知批次"
    return position.batchId ? "常规批次" : "未知批次"
  }

  const getCurrentStep = (approval: ApprovalRecord) => {
    const workflow = workflows.find(w => w.id === approval.workflowId)
    return workflow?.steps[approval.currentStepIndex]
  }

  const getWorkflowSteps = (approval: ApprovalRecord) => {
    const workflow = workflows.find(w => w.id === approval.workflowId)
    if (!workflow) return []
    return workflow.steps.map((step, index) => ({
      ...step,
      status: index < approval.currentStepIndex ? "completed" : index === approval.currentStepIndex ? "current" : "pending" as const,
    }))
  }

  if (loading && approvals.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">审批管理中心</h1>
        <p className="text-muted-foreground">
          {role === "builder"
            ? "查看您提交的审批进度和结果"
            : "处理待审批的岗位建设申请"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">待处理</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">已通过</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">已驳回</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总记录</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索岗位名称或提交人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                {APPROVAL_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {tab.value === "pending" && stats.pending > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                        {stats.pending}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {filteredApprovals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">暂无审批记录</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedTab === "pending"
                  ? "当前没有待处理的审批申请"
                  : "没有找到匹配的审批记录"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>岗位名称</TableHead>
                  <TableHead>提交人</TableHead>
                  <TableHead>当前步骤</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>提交时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((approval) => {
                  const currentStep = getCurrentStep(approval)
                  return (
                    <TableRow key={approval.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{approval.positionName}</div>
                            <div className="text-sm text-muted-foreground">
                              {getBatchName(approval.positionId)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {approval.submittedByName.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{approval.submittedByName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {currentStep?.name || "待分配"}
                          </Badge>
                          {currentStep && (
                            <span className="text-sm text-muted-foreground">
                              <ArrowRight className="inline h-3 w-3" />{" "}
                              {currentStep.role === "admin" ? "管理员" : "审批人"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={approval.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(approval.createdAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </TableCell>
                      <TableCell className="text-right relative">
                        <div className="flex items-center justify-end gap-1 absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm z-10 px-2 py-1 rounded-lg shadow-sm border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleOpenDetail(approval)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            查看详情
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleOpenDetail(approval)}
                          >
                            <History className="mr-1 h-3 w-3" />
                            审批历史
                          </Button>
                          {approval.status === "pending" &&
                            (role === "admin" || role === "reviewer") && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-success"
                                  onClick={() => handleOpenAction(approval, "approve")}
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  通过
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-destructive"
                                  onClick={() => handleOpenAction(approval, "reject")}
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  驳回
                                </Button>
                              </>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>审批详情</DialogTitle>
            <DialogDescription>
              查看岗位建设申请的详细信息和审批进度
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">岗位名称</p>
                  <p className="font-medium">{selectedApproval.positionName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">所属批次</p>
                  <p className="font-medium">{getBatchName(selectedApproval.positionId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">提交人</p>
                  <p className="font-medium">{selectedApproval.submittedByName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">提交时间</p>
                  <p className="font-medium">
                    {new Date(selectedApproval.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-medium">审批流程</h4>
                <div className="space-y-3">
                  {getWorkflowSteps(selectedApproval).map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-4 rounded-lg border p-3"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                          step.status === "completed"
                            ? "bg-success text-success-foreground"
                            : step.status === "current"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-muted-foreground">
                          审批角色：{step.role === "admin" ? "管理员" : step.role === "reviewer" ? "审批人" : step.role === "builder" ? "建设者" : "学生"}
                        </div>
                      </div>
                      <StatusBadge
                        status={
                          step.status === "completed"
                            ? "approved"
                            : step.status === "current"
                            ? "pending"
                            : "draft"
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {selectedApproval.history && selectedApproval.history.length > 0 && (
                <div>
                  <h4 className="mb-3 font-medium">操作记录</h4>
                  <div className="space-y-2">
                    {selectedApproval.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 rounded-lg bg-muted p-3"
                      >
                        <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{entry.reviewerName}</span>
                            <span className="text-sm text-muted-foreground">
                              {entry.status === "approved" ? "通过" : "驳回"}
                            </span>
                          </div>
                          {entry.comment && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {entry.comment}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString("zh-CN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              关闭
            </Button>
            {selectedApproval?.status === "pending" &&
              (role === "admin" || role === "reviewer") && (
                <>
                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      setIsDetailOpen(false)
                      handleOpenAction(selectedApproval, "reject")
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    驳回
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDetailOpen(false)
                      handleOpenAction(selectedApproval, "approve")
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    通过
                  </Button>
                </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "通过审批" : "驳回审批"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "确认通过该岗位建设申请"
                : "请填写驳回原因，以便提交人修改后重新提交"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">岗位名称</p>
              <p className="font-medium">{selectedApproval?.positionName}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {actionType === "approve" ? "审批意见（可选）" : "驳回原因"}
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "输入您的审批意见..."
                    : "请说明驳回的具体原因..."
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmitAction}
              variant={actionType === "approve" ? "default" : "destructive"}
              disabled={actionType === "reject" && !comment}
            >
              {actionType === "approve" ? "确认通过" : "确认驳回"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
