"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Check,
  X,
  User,
  Lock,
} from "lucide-react"
import {
  tenantApplications,
  generateOrgCode,
  type TenantApplication,
} from "@/lib/mock-data"

function getStatusBadge(status: TenantApplication["status"]) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-warning/20 text-warning hover:bg-warning/30">
          <Clock className="mr-1 h-3 w-3" />
          待审核
        </Badge>
      )
    case "approved":
      return (
        <Badge className="bg-success/20 text-success hover:bg-success/30">
          <CheckCircle className="mr-1 h-3 w-3" />
          已通过
        </Badge>
      )
    case "rejected":
      return (
        <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">
          <XCircle className="mr-1 h-3 w-3" />
          已驳回
        </Badge>
      )
  }
}

export default function ApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [selectedApp, setSelectedApp] = useState<TenantApplication | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [generatedOrgCode, setGeneratedOrgCode] = useState("")

  const filteredApplications = tenantApplications.filter((app) => {
    const matchesSearch =
      app.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = tenantApplications.filter((a) => a.status === "pending").length
  const approvedCount = tenantApplications.filter((a) => a.status === "approved").length
  const rejectedCount = tenantApplications.filter((a) => a.status === "rejected").length

  const handleViewDetails = (app: TenantApplication) => {
    setSelectedApp(app)
    setDetailsOpen(true)
  }

  const handleApproveClick = () => {
    setGeneratedOrgCode(generateOrgCode())
    setApproveConfirmOpen(true)
  }

  const handleApproveConfirm = () => {
    // 模拟审核通过
    alert(`审核已通过！\n\n已为租户 "${selectedApp?.orgName}" 生成机构码: ${generatedOrgCode}\n\n系统已自动创建租户档案并通知运营人员。`)
    setApproveConfirmOpen(false)
    setDetailsOpen(false)
    setSelectedApp(null)
  }

  const handleRejectClick = () => {
    setRejectReason("")
    setRejectOpen(true)
  }

  const handleRejectConfirm = () => {
    // 模拟驳回
    alert(`申请已驳回！\n\n驳回原因: ${rejectReason}\n\n已通知运营人员修改后重新提交。`)
    setRejectOpen(false)
    setDetailsOpen(false)
    setSelectedApp(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">租户入驻审批中心</h1>
          <p className="text-sm text-muted-foreground">
            审核运营人员提交的租户申请，通过后自动创建租户并生成机构码
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总申请数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {tenantApplications.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-warning/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-warning">
                待审核
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已通过
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已驳回
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base text-card-foreground">申请列表</CardTitle>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-input">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="pending">待审核</SelectItem>
                    <SelectItem value="approved">已通过</SelectItem>
                    <SelectItem value="rejected">已驳回</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索申请单号、机构名称..."
                    className="bg-input pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">申请单号</TableHead>
                  <TableHead className="text-muted-foreground">机构名称</TableHead>
                  <TableHead className="text-muted-foreground">申请人</TableHead>
                  <TableHead className="text-muted-foreground">套餐 / 类型</TableHead>
                  <TableHead className="text-muted-foreground">申请时间</TableHead>
                  <TableHead className="text-muted-foreground">状态</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id} className="border-border">
                    <TableCell className="font-mono text-sm text-card-foreground">
                      {app.applicationNo}
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      <div>{app.orgName}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {app.creditCode}
                      </div>
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {app.applicantName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary">{app.packageName}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            app.orgType === "trial" ? "text-info" : "text-success"
                          }
                        >
                          {app.orgType === "trial" ? "试用" : "正式"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {app.applicationTime}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewDetails(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>审核申请</DialogTitle>
              <DialogDescription>
                申请单号: {selectedApp?.applicationNo}
              </DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="grid gap-6 lg:grid-cols-5">
                {/* 左侧：申请材料 */}
                <div className="lg:col-span-3 space-y-4">
                  <h3 className="font-medium text-card-foreground">申请材料</h3>
                  <div className="space-y-4 rounded-lg bg-secondary p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">机构名称</p>
                        <p className="text-sm font-medium text-card-foreground">
                          {selectedApp.orgName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">统一社会信用代码</p>
                        <p className="font-mono text-sm text-card-foreground">
                          {selectedApp.creditCode}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">联系人</p>
                        <p className="text-sm text-card-foreground">
                          {selectedApp.contactName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">联系电话</p>
                        <p className="text-sm text-card-foreground">
                          {selectedApp.contactPhone}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">套餐规格</p>
                        <Badge variant="secondary">{selectedApp.packageName}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">机构类型</p>
                        <Badge
                          variant="outline"
                          className={
                            selectedApp.orgType === "trial"
                              ? "text-info"
                              : "text-success"
                          }
                        >
                          {selectedApp.orgType === "trial" ? "试用" : "正式"}
                        </Badge>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <p className="text-xs text-muted-foreground">申请说明</p>
                        <p className="text-sm text-card-foreground">
                          {selectedApp.description || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="mb-2 text-xs text-muted-foreground">附件材料</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-lg bg-muted p-2"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{att}</span>
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              预览
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">申请人: </span>
                          <span className="text-card-foreground">
                            {selectedApp.applicantName}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">申请时间: </span>
                          <span className="text-card-foreground">
                            {selectedApp.applicationTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右侧：审核操作区 */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-medium text-card-foreground">审核操作</h3>

                  <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <span className="text-sm text-muted-foreground">当前状态</span>
                    {getStatusBadge(selectedApp.status)}
                  </div>

                  {selectedApp.status === "pending" && (
                    <div className="space-y-3">
                      <Alert className="border-info/50 bg-info/10">
                        <AlertCircle className="h-4 w-4 text-info" />
                        <AlertDescription className="text-info">
                          审核通过后，系统将自动创建租户档案并生成唯一机构码
                        </AlertDescription>
                      </Alert>

                      <div className="flex flex-col gap-2">
                        <Button
                          className="w-full gap-2 bg-success hover:bg-success/90"
                          onClick={handleApproveClick}
                        >
                          <Check className="h-4 w-4" />
                          审核通过
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full gap-2"
                          onClick={handleRejectClick}
                        >
                          <X className="h-4 w-4" />
                          驳回申请
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedApp.status === "approved" && (
                    <div className="rounded-lg bg-success/10 p-4">
                      <p className="mb-2 text-sm font-medium text-success">已审核通过</p>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">机构码:</span>
                        <span className="font-mono text-lg font-bold text-accent">
                          {selectedApp.createdOrgCode}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        审核人: {selectedApp.reviewerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        审核时间: {selectedApp.reviewTime}
                      </p>
                    </div>
                  )}

                  {selectedApp.status === "rejected" && (
                    <div className="rounded-lg bg-destructive/10 p-4">
                      <p className="mb-1 text-sm font-medium text-destructive">已驳回</p>
                      <p className="text-sm text-muted-foreground">
                        驳回原因: {selectedApp.rejectReason}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        审核人: {selectedApp.reviewerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        审核时间: {selectedApp.reviewTime}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Confirmation Dialog */}
        <Dialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认审核通过</DialogTitle>
              <DialogDescription>
                请确认是否通过此申请，通过后系统将执行以下操作
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-secondary p-4">
                <p className="mb-3 text-sm font-medium text-card-foreground">
                  即将为 &quot;{selectedApp?.orgName}&quot; 执行：
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    在租户管理中创建租户档案
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span>
                      生成全局唯一机构码:{" "}
                      <span className="font-mono font-semibold text-accent">
                        {generatedOrgCode}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    记录操作日志并通知运营人员
                  </li>
                </ul>
              </div>

              <Alert className="border-warning/50 bg-warning/10">
                <AlertCircle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning">
                  机构码一旦生成后不可修改，请确认申请材料无误
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveConfirmOpen(false)}>
                取消
              </Button>
              <Button
                className="gap-2 bg-success hover:bg-success/90"
                onClick={handleApproveConfirm}
              >
                <Check className="h-4 w-4" />
                确认通过
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>驳回申请</DialogTitle>
              <DialogDescription>
                请填写驳回原因，运营人员将收到通知并可修改后重新提交
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">驳回原因 *</Label>
                <Textarea
                  id="rejectReason"
                  placeholder="请详细说明驳回原因，以便运营人员了解需要修改的内容"
                  className="bg-input min-h-24"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                取消
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
              >
                <X className="h-4 w-4" />
                确认驳回
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
