"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  Info,
} from "lucide-react"
import { licenses, tenants, orders, resourceTypeCodes } from "@/lib/mock-data"

// 模拟当前运营人员负责的客户
const myTenantIds = ["t001", "t003", "t005"]

// 过滤出运营人员负责客户的 License
const myLicenses = licenses.filter((license) =>
  myTenantIds.includes(license.tenantId)
)

function MyLicensesContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLicense, setSelectedLicense] = useState<
    (typeof licenses)[0] | null
  >(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const getStatusBadge = (status: string, endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const daysUntilExpiry = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (status === "expired" || daysUntilExpiry < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          已过期
        </Badge>
      )
    }
    if (daysUntilExpiry <= 30) {
      return (
        <Badge className="gap-1 bg-warning text-warning-foreground">
          <AlertTriangle className="h-3 w-3" />
          即将过期
        </Badge>
      )
    }
    return (
      <Badge className="gap-1 bg-success text-success-foreground">
        <CheckCircle className="h-3 w-3" />
        有效
      </Badge>
    )
  }

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId)
    return tenant?.name || tenantId
  }

  const getTenant = (tenantId: string) => {
    return tenants.find((t) => t.id === tenantId)
  }

  const getOrder = (orderId: string) => {
    return orders.find((o) => o.id === orderId)
  }

  const filteredLicenses = myLicenses.filter((license) => {
    const tenant = getTenant(license.tenantId)
    const matchesSearch =
      license.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant?.orgCode || "").toLowerCase().includes(searchTerm.toLowerCase())

    const now = new Date()
    const end = new Date(license.endDate)
    const daysUntilExpiry = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    let matchesStatus = true
    if (statusFilter === "active") {
      matchesStatus = license.status === "active" && daysUntilExpiry > 30
    } else if (statusFilter === "expiring") {
      matchesStatus =
        license.status === "active" &&
        daysUntilExpiry <= 30 &&
        daysUntilExpiry > 0
    } else if (statusFilter === "expired") {
      matchesStatus = license.status === "expired" || daysUntilExpiry < 0
    }

    return matchesSearch && matchesStatus
  })

  const handleViewDetail = (license: (typeof licenses)[0]) => {
    setSelectedLicense(license)
    setShowDetailDialog(true)
  }

  const handleDownload = (license: (typeof licenses)[0]) => {
    const tenant = getTenant(license.tenantId)
    const order = getOrder(license.orderId)

    if (!tenant || !order) return

    const resourceCodesSection = resourceTypeCodes
      .map((rc) => `  ${rc.objectName.padEnd(8, " ")}: ${rc.code}`)
      .join("\n")

    const licenseContent = `
================================================================================
                        LICENSE AUTHORIZATION FILE
================================================================================

Serial Number:    ${license.serialNumber}
Tenant:           ${tenant.name}
Org Code:         ${tenant.orgCode}
Order:            ${order.orderNumber}
Package:          ${order.packageName}
Machine Code:     ${license.machineCode}

Valid From:       ${license.startDate}
Valid Until:      ${license.endDate}

Status:           ${license.status === "active" ? "ACTIVE" : "EXPIRED"}

================================================================================
                        ORGANIZATION CODE (机构码)
================================================================================
${tenant.orgCode}

================================================================================
                    RESOURCE TYPE CODES (资源类型编码字典)
================================================================================
${resourceCodesSection}

================================================================================
                          DIGITAL SIGNATURE
================================================================================
SIG:${btoa(
      JSON.stringify({
        sn: license.serialNumber,
        mc: license.machineCode,
        exp: license.endDate,
        tenant: tenant.id,
        orgCode: tenant.orgCode,
        resourceCodes: resourceTypeCodes.map((rc) => ({
          obj: rc.objectName,
          code: rc.code,
        })),
      })
    )}
================================================================================

This license file is encrypted and bound to the specified machine code.
It contains the organization code and resource type codes dictionary.
Any attempt to modify this file will invalidate the license.

Generated: ${new Date().toISOString()}
================================================================================
    `.trim()

    const blob = new Blob([licenseContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `license-${tenant.orgCode}-${license.serialNumber}.lic`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Statistics
  const stats = {
    total: myLicenses.length,
    active: myLicenses.filter((l) => {
      const end = new Date(l.endDate)
      const now = new Date()
      return l.status === "active" && end > now
    }).length,
    expiring: myLicenses.filter((l) => {
      const end = new Date(l.endDate)
      const now = new Date()
      const days = Math.ceil(
        (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return l.status === "active" && days <= 30 && days > 0
    }).length,
    expired: myLicenses.filter((l) => {
      const end = new Date(l.endDate)
      const now = new Date()
      return l.status === "expired" || end < now
    }).length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            我的 License 管理
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            查看和下载您负责客户的 License 授权文件（只读）
          </p>
        </div>

        {/* Info Alert */}
        <div className="flex items-start gap-3 rounded-lg border border-info/30 bg-info/10 p-4">
          <Info className="mt-0.5 h-5 w-5 text-info" />
          <div>
            <p className="text-sm font-medium text-info">只读模式</p>
            <p className="mt-1 text-sm text-muted-foreground">
              此页面仅供运营人员查看和下载已生成的 License。如需签发新
              License，请联系管理员在「授权与 License 管理」中操作。
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                License 总数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                有效
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                即将过期
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {stats.expiring}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已过期
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.expired}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索序列号、客户名称或机构码..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">有效</SelectItem>
                  <SelectItem value="expiring">即将过期</SelectItem>
                  <SelectItem value="expired">已过期</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    序列号
                  </TableHead>
                  <TableHead className="text-muted-foreground">客户</TableHead>
                  <TableHead className="text-muted-foreground">
                    机构码
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    机器码
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    有效期
                  </TableHead>
                  <TableHead className="text-muted-foreground">状态</TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLicenses.map((license) => {
                    const tenant = getTenant(license.tenantId)
                    return (
                      <TableRow
                        key={license.id}
                        className="border-border hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-sm text-foreground">
                          {license.serialNumber}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {getTenantName(license.tenantId)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-sm text-accent">
                              {tenant?.orgCode || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {license.machineCode.substring(0, 16)}...
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {license.startDate} ~ {license.endDate}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(license.status, license.endDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewDetail(license)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownload(license)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-accent" />
                License 详情
              </DialogTitle>
              <DialogDescription>
                查看 License 的详细信息
              </DialogDescription>
            </DialogHeader>
            {selectedLicense && (
              <div className="space-y-4">
                <div className="rounded-lg bg-secondary p-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">序列号</span>
                      <span className="font-mono font-medium text-foreground">
                        {selectedLicense.serialNumber}
                      </span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">客户名称</span>
                      <span className="font-medium text-foreground">
                        {getTenantName(selectedLicense.tenantId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">机构码</span>
                      <span className="font-mono font-medium text-accent">
                        {getTenant(selectedLicense.tenantId)?.orgCode || "-"}
                      </span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">机器码</span>
                      <span className="break-all font-mono text-xs text-muted-foreground">
                        {selectedLicense.machineCode}
                      </span>
                    </div>
                    <Separator className="bg-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">生效日期</span>
                      <span className="text-foreground">
                        {selectedLicense.startDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">到期日期</span>
                      <span className="text-foreground">
                        {selectedLicense.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">状态</span>
                      {getStatusBadge(
                        selectedLicense.status,
                        selectedLicense.endDate
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailDialog(false)}
                  >
                    关闭
                  </Button>
                  <Button onClick={() => handleDownload(selectedLicense)}>
                    <Download className="mr-2 h-4 w-4" />
                    下载 License
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function MyLicensesPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex h-[60vh] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        </DashboardLayout>
      }
    >
      <MyLicensesContent />
    </Suspense>
  )
}
