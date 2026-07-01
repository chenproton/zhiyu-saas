"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Download,
  Power,
  Building2,
  Lock,
  Copy,
  Check,
  User,
  ClipboardCheck,
} from "lucide-react"
import Link from "next/link"
import { tenants, packages, resourceTypeCodes, type Tenant } from "@/lib/mock-data"

function getPackageBadge(packageName: string) {
  if (packageName.includes("试用")) {
    return <Badge className="bg-info/20 text-info hover:bg-info/30">{packageName}</Badge>
  }
  if (packageName.includes("旗舰")) {
    return <Badge className="bg-accent/20 text-accent hover:bg-accent/30">{packageName}</Badge>
  }
  return <Badge variant="secondary">{packageName}</Badge>
}

function getSourceBadge(tenant: Tenant) {
  if (tenant.createdBy === "admin") {
    return (
      <Badge variant="outline" className="text-xs">
        <User className="mr-1 h-3 w-3" />
        管理员创建
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-accent/10 text-accent text-xs">
      <ClipboardCheck className="mr-1 h-3 w-3" />
      {tenant.operatorName} 申请
    </Badge>
  )
}

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [packageFilter, setPackageFilter] = useState<string>("all")
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [copiedOrgCode, setCopiedOrgCode] = useState<string | null>(null)

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.enterpriseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.orgCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.contactName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPackage = packageFilter === "all" || tenant.packageId === packageFilter
    return matchesSearch && matchesPackage
  })

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setDetailsOpen(true)
  }

  const handleExport = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setExportOpen(true)
    setExportProgress(0)
    setIsExporting(false)
  }

  const handleCopyOrgCode = (orgCode: string) => {
    navigator.clipboard.writeText(orgCode)
    setCopiedOrgCode(orgCode)
    setTimeout(() => setCopiedOrgCode(null), 2000)
  }

  const startExport = () => {
    setIsExporting(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTimeout(() => {
          // 导出内容包含：租户信息 + 机构码 + 资源类型编码字典
          const exportData = {
            tenant: {
              id: selectedTenant?.id,
              name: selectedTenant?.name,
              orgCode: selectedTenant?.orgCode,
              packageName: selectedTenant?.packageName,
            },
            resourceTypeCodes: resourceTypeCodes.map(r => ({
              objectName: r.objectName,
              code: r.code,
            })),
            exportTime: new Date().toISOString(),
            signature: "ENCRYPTED_SIGNATURE_" + Math.random().toString(36).substring(7),
          }
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `tenant-init-${selectedTenant?.orgCode}.cfg`
          a.click()
          URL.revokeObjectURL(url)
        }, 500)
      }
      setExportProgress(Math.min(progress, 100))
    }, 300)
  }

  const trialCount = tenants.filter(t => t.packageName.includes("试用")).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">租户管理</h1>
            <p className="text-sm text-muted-foreground">
              管理私有化客户的生命周期与基础档案
            </p>
          </div>
          <Link href="/tenants/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新建租户
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总租户数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{tenants.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                正式客户
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {tenants.length - trialCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                试用客户
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">
                {trialCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                转化率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {Math.round(((tenants.length - trialCount) / tenants.length) * 100)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base text-card-foreground">租户列表</CardTitle>
              <div className="flex gap-2">
                <Select value={packageFilter} onValueChange={setPackageFilter}>
                  <SelectTrigger className="w-36 bg-input">
                    <SelectValue placeholder="套餐筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部套餐</SelectItem>
                    {packages.filter(p => p.status === "active").map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索企业名称、机构码..."
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
                  <TableHead className="text-muted-foreground">企业名称 / 机构码</TableHead>
                  <TableHead className="text-muted-foreground">联系人</TableHead>
                  <TableHead className="text-muted-foreground">租户套餐</TableHead>
                  <TableHead className="text-muted-foreground">绑定域名</TableHead>
                  <TableHead className="text-muted-foreground">来源</TableHead>
                  <TableHead className="text-muted-foreground">创建时间</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} className="border-border">
                    <TableCell className="font-medium text-card-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/20">
                          <Building2 className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <div>{tenant.name}</div>
                          <div className="flex items-center gap-1 text-xs">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-accent">{tenant.orgCode}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => handleCopyOrgCode(tenant.orgCode)}
                            >
                              {copiedOrgCode === tenant.orgCode ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      <div>{tenant.contactName}</div>
                      <div className="text-xs text-muted-foreground">{tenant.contactPhone}</div>
                    </TableCell>
                    <TableCell>{getPackageBadge(tenant.packageName)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {tenant.domain}
                    </TableCell>
                    <TableCell>{getSourceBadge(tenant)}</TableCell>
                    <TableCell className="text-muted-foreground">{tenant.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(tenant)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/tenants/${tenant.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              编辑信息
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleExport(tenant)}
                            className="text-accent"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            导出初始化包
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Power className="mr-2 h-4 w-4" />
                            停用
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedTenant?.name}</DialogTitle>
              <DialogDescription>租户详细信息</DialogDescription>
            </DialogHeader>
            {selectedTenant && (
              <div className="space-y-4">
                {/* 溯源标签 */}
                <div className="rounded-lg bg-secondary p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">创建来源</span>
                    {getSourceBadge(selectedTenant)}
                  </div>
                  {selectedTenant.applicationId && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      申请单号: {selectedTenant.applicationId}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 机构码 - 只读 + 锁图标 */}
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-muted-foreground">机构码（不可修改）</p>
                    <div className="flex items-center gap-2 rounded-md bg-muted p-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-lg font-semibold text-accent">
                        {selectedTenant.orgCode}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-6 w-6"
                        onClick={() => handleCopyOrgCode(selectedTenant.orgCode)}
                      >
                        {copiedOrgCode === selectedTenant.orgCode ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">企业代码</p>
                    <p className="font-mono text-sm text-card-foreground">
                      {selectedTenant.enterpriseCode}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">租户套餐</p>
                    {getPackageBadge(selectedTenant.packageName)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">联系人</p>
                    <p className="text-sm text-card-foreground">{selectedTenant.contactName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">联系电话</p>
                    <p className="text-sm text-card-foreground">{selectedTenant.contactPhone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">用户名</p>
                    <p className="font-mono text-sm text-card-foreground">
                      {selectedTenant.username}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">绑定域名</p>
                    <p className="font-mono text-sm text-card-foreground">{selectedTenant.domain}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-muted-foreground">企业地址</p>
                    <p className="text-sm text-card-foreground">{selectedTenant.address}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-muted-foreground">企业简介</p>
                    <p className="text-sm text-card-foreground">{selectedTenant.description || "-"}</p>
                  </div>
                  {selectedTenant.remark && (
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground">备注</p>
                      <p className="text-sm text-card-foreground">{selectedTenant.remark}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">创建时间</p>
                    <p className="text-sm text-card-foreground">{selectedTenant.createdAt}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailsOpen(false)
                      handleExport(selectedTenant)
                    }}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    导出初始化包
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>导出初始化包</DialogTitle>
              <DialogDescription>
                为 {selectedTenant?.name} 生成私有化部署初始化配置文件
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!isExporting ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="mb-2 text-sm font-medium text-card-foreground">导出包将包含：</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        租户初始化配置数据
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        机构码: <span className="font-mono text-accent">{selectedTenant?.orgCode}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        资源类型编码字典（{resourceTypeCodes.length} 项）
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">打包进度</span>
                    <span className="text-card-foreground">{Math.round(exportProgress)}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                  {exportProgress === 100 && (
                    <p className="text-sm text-success">打包完成，文件已开始下载</p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportOpen(false)}>
                {exportProgress === 100 ? "关闭" : "取消"}
              </Button>
              {!isExporting && (
                <Button onClick={startExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  开始打包
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
