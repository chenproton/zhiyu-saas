"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Copy,
  Check,
  Lock,
  Building2,
} from "lucide-react"
import {
  tenantApplications,
  tenants,
  packages,
  type TenantApplication,
} from "@/lib/mock-data"

function getStatusBadge(status: TenantApplication["status"]) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-warning/20 text-warning hover:bg-warning/30">
          <Clock className="mr-1 h-3 w-3" />
          审核中
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

// 模拟当前运营人员ID
const CURRENT_OPERATOR_ID = "op-001"

export default function OperationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("applications")
  const [newAppOpen, setNewAppOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<TenantApplication | null>(null)
  const [copiedOrgCode, setCopiedOrgCode] = useState<string | null>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    orgName: "",
    creditCode: "",
    contactName: "",
    contactPhone: "",
    packageId: "",
    orgType: "formal" as "trial" | "formal",
    description: "",
  })

  // 只显示当前运营人员的申请
  const myApplications = tenantApplications.filter(
    (app) => app.applicantId === CURRENT_OPERATOR_ID
  )

  // 我的租户（已通过的申请）
  const myTenants = tenants.filter((t) =>
    myApplications.some(
      (app) => app.status === "approved" && app.createdTenantId === t.id
    )
  )

  const filteredApplications = myApplications.filter((app) => {
    const matchesSearch =
      app.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (app: TenantApplication) => {
    setSelectedApp(app)
    setDetailsOpen(true)
  }

  const handleCopyOrgCode = (orgCode: string) => {
    navigator.clipboard.writeText(orgCode)
    setCopiedOrgCode(orgCode)
    setTimeout(() => setCopiedOrgCode(null), 2000)
  }

  const handleSubmit = () => {
    // 模拟提交
    alert("申请已提交，等待管理员审核")
    setNewAppOpen(false)
    setFormData({
      orgName: "",
      creditCode: "",
      contactName: "",
      contactPhone: "",
      packageId: "",
      orgType: "formal",
      description: "",
    })
  }

  const pendingCount = myApplications.filter((a) => a.status === "pending").length
  const approvedCount = myApplications.filter((a) => a.status === "approved").length
  const rejectedCount = myApplications.filter((a) => a.status === "rejected").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">运营工作台</h1>
            <p className="text-sm text-muted-foreground">
              提交客户开通申请，追踪交付进度
            </p>
          </div>
          <Button className="gap-2" onClick={() => setNewAppOpen(true)}>
            <Plus className="h-4 w-4" />
            提交租户申请
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                我的申请
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {myApplications.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                审核中
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="applications">我的申请</TabsTrigger>
            <TabsTrigger value="tenants">我的租户</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-4">
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
                        <SelectItem value="pending">审核中</SelectItem>
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
                      <TableHead className="text-muted-foreground">套餐规格</TableHead>
                      <TableHead className="text-muted-foreground">申请时间</TableHead>
                      <TableHead className="text-muted-foreground">状态</TableHead>
                      <TableHead className="text-muted-foreground">机构码</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id} className="border-border">
                        <TableCell className="font-mono text-sm text-card-foreground">
                          {app.applicationNo}
                        </TableCell>
                        <TableCell className="text-card-foreground">{app.orgName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{app.packageName}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {app.applicationTime}
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.status === "approved" && app.createdOrgCode ? (
                            <div className="flex items-center gap-1">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono text-sm font-semibold text-accent">
                                {app.createdOrgCode}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0"
                                onClick={() => handleCopyOrgCode(app.createdOrgCode!)}
                              >
                                {copiedOrgCode === app.createdOrgCode ? (
                                  <Check className="h-3 w-3 text-success" />
                                ) : (
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
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
          </TabsContent>

          <TabsContent value="tenants" className="mt-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base text-card-foreground">我的租户</CardTitle>
              </CardHeader>
              <CardContent>
                {myTenants.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    暂无已通过审核的租户
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">企业名称</TableHead>
                        <TableHead className="text-muted-foreground">机构码</TableHead>
                        <TableHead className="text-muted-foreground">联系人</TableHead>
                        <TableHead className="text-muted-foreground">套餐</TableHead>
                        <TableHead className="text-muted-foreground">域名</TableHead>
                        <TableHead className="text-muted-foreground">创建时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myTenants.map((tenant) => (
                        <TableRow key={tenant.id} className="border-border">
                          <TableCell className="font-medium text-card-foreground">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/20">
                                <Building2 className="h-4 w-4 text-accent" />
                              </div>
                              {tenant.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Lock className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono text-sm font-semibold text-accent">
                                {tenant.orgCode}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0"
                                onClick={() => handleCopyOrgCode(tenant.orgCode)}
                              >
                                {copiedOrgCode === tenant.orgCode ? (
                                  <Check className="h-3 w-3 text-success" />
                                ) : (
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-card-foreground">
                            {tenant.contactName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{tenant.packageName}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {tenant.domain}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {tenant.createdAt}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Application Sheet */}
        <Sheet open={newAppOpen} onOpenChange={setNewAppOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>提交租户申请</SheetTitle>
              <SheetDescription>
                填写客户资料，提交后等待管理员审核
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">客户/机构名称 *</Label>
                  <Input
                    id="orgName"
                    placeholder="请输入企业全称"
                    className="bg-input"
                    value={formData.orgName}
                    onChange={(e) =>
                      setFormData({ ...formData, orgName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditCode">统一社会信用代码 *</Label>
                  <Input
                    id="creditCode"
                    placeholder="18位统一社会信用代码"
                    className="bg-input font-mono"
                    value={formData.creditCode}
                    onChange={(e) =>
                      setFormData({ ...formData, creditCode: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">联系人姓名 *</Label>
                    <Input
                      id="contactName"
                      placeholder="联系人"
                      className="bg-input"
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({ ...formData, contactName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">联系电话 *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="手机号"
                      className="bg-input"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, contactPhone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageId">预计套餐规格 *</Label>
                    <Select
                      value={formData.packageId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, packageId: value })
                      }
                    >
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="选择套餐" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages
                          .filter((p) => p.status === "active")
                          .map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              {pkg.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgType">机构类型 *</Label>
                    <Select
                      value={formData.orgType}
                      onValueChange={(value: "trial" | "formal") =>
                        setFormData({ ...formData, orgType: value })
                      }
                    >
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">试用</SelectItem>
                        <SelectItem value="formal">正式</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">申请说明</Label>
                  <Textarea
                    id="description"
                    placeholder="请简要描述客户需求、合作背景等"
                    className="bg-input min-h-24"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>附件（营业执照扫描件等）</Label>
                  <div className="rounded-lg border border-dashed border-border bg-input p-6 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      点击或拖拽文件到此处上传
                    </p>
                    <p className="text-xs text-muted-foreground">
                      支持 PDF、JPG、PNG 格式，单个文件不超过 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button variant="outline" onClick={() => setNewAppOpen(false)}>
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.orgName ||
                  !formData.creditCode ||
                  !formData.contactName ||
                  !formData.contactPhone ||
                  !formData.packageId
                }
              >
                提交申请
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Details Sheet */}
        <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>申请详情</SheetTitle>
              <SheetDescription>申请单号: {selectedApp?.applicationNo}</SheetDescription>
            </SheetHeader>
            {selectedApp && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">审核状态</span>
                  {getStatusBadge(selectedApp.status)}
                </div>

                {selectedApp.status === "approved" && selectedApp.createdOrgCode && (
                  <div className="rounded-lg bg-success/10 p-4">
                    <p className="mb-2 text-sm font-medium text-success">审核已通过</p>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">机构码:</span>
                      <span className="font-mono text-lg font-bold text-accent">
                        {selectedApp.createdOrgCode}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyOrgCode(selectedApp.createdOrgCode!)}
                      >
                        {copiedOrgCode === selectedApp.createdOrgCode ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      审核人: {selectedApp.reviewerName} | 审核时间:{" "}
                      {selectedApp.reviewTime}
                    </p>
                  </div>
                )}

                {selectedApp.status === "rejected" && (
                  <div className="rounded-lg bg-destructive/10 p-4">
                    <p className="mb-1 text-sm font-medium text-destructive">申请被驳回</p>
                    <p className="text-sm text-muted-foreground">
                      驳回原因: {selectedApp.rejectReason}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      审核人: {selectedApp.reviewerName} | 审核时间:{" "}
                      {selectedApp.reviewTime}
                    </p>
                  </div>
                )}

                <div className="space-y-4 rounded-lg bg-secondary p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">机构名称</p>
                      <p className="text-sm text-card-foreground">{selectedApp.orgName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">统一社会信用代码</p>
                      <p className="font-mono text-sm text-card-foreground">
                        {selectedApp.creditCode}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">联系人</p>
                      <p className="text-sm text-card-foreground">{selectedApp.contactName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">联系电话</p>
                      <p className="text-sm text-card-foreground">{selectedApp.contactPhone}</p>
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
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground">附件</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.attachments.map((att, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1">
                            <FileText className="h-3 w-3" />
                            {att}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">申请时间</p>
                      <p className="text-sm text-card-foreground">
                        {selectedApp.applicationTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  )
}
