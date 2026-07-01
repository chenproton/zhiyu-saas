"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Spinner } from "@/components/ui/spinner"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  RefreshCw,
  XCircle,
  Key,
  AlertTriangle,
  Clock,
  CheckCircle,
  Ban,
} from "lucide-react"
import Link from "next/link"
import { licenses, type License } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getLicenseStatusBadge(status: string) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-success/20 text-success hover:bg-success/30">
          <CheckCircle className="mr-1 h-3 w-3" />
          正常
        </Badge>
      )
    case "expiring":
      return (
        <Badge className="bg-warning/20 text-warning hover:bg-warning/30">
          <Clock className="mr-1 h-3 w-3" />
          即将过期
        </Badge>
      )
    case "expired":
      return (
        <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">
          <AlertTriangle className="mr-1 h-3 w-3" />
          已过期
        </Badge>
      )
    case "revoked":
      return (
        <Badge className="bg-muted text-muted-foreground hover:bg-muted">
          <Ban className="mr-1 h-3 w-3" />
          已吊销
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getRowClassName(status: string) {
  switch (status) {
    case "expiring":
      return "bg-warning/5 hover:bg-warning/10"
    case "expired":
      return "bg-destructive/5 hover:bg-destructive/10"
    default:
      return ""
  }
}

function LicensesContent() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get("filter") || "all"

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.machineCode.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (statusFilter === "expiring") {
      matchesStatus = license.status === "expiring" || license.status === "expired"
    } else if (statusFilter !== "all") {
      matchesStatus = license.status === statusFilter
    }

    return matchesSearch && matchesStatus
  })

  const expiringCount = licenses.filter(
    (l) => l.status === "expiring" || l.status === "expired"
  ).length

  const handleViewDetails = (license: License) => {
    setSelectedLicense(license)
    setDetailsOpen(true)
  }

  const handleRevoke = (license: License) => {
    setSelectedLicense(license)
    setRevokeOpen(true)
  }

  const downloadLicense = (license: License) => {
    const licenseContent = `
================================================================================
                        LICENSE AUTHORIZATION FILE
================================================================================

Serial Number:    ${license.serialNumber}
Tenant:           ${license.tenantName}
Order:            ${license.orderNumber}
Machine Code:     ${license.machineCode}

Valid From:       ${license.startDate}
Valid Until:      ${license.endDate}

Status:           ${license.status.toUpperCase()}

================================================================================
                          DIGITAL SIGNATURE
================================================================================
SIG:${btoa(JSON.stringify({ sn: license.serialNumber, mc: license.machineCode, exp: license.endDate }))}
================================================================================

This license file is encrypted and bound to the specified machine code.
Any attempt to modify this file will invalidate the license.

Generated: ${new Date().toISOString()}
================================================================================
    `.trim()

    const blob = new Blob([licenseContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `license-${license.serialNumber}.lic`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">授权与 License 管理</h1>
            <p className="text-sm text-muted-foreground">
              管理离线授权文件的签发、续签与吊销
            </p>
          </div>
          <Link href="/licenses/issue">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              签发授权
            </Button>
          </Link>
        </div>

        {/* Alert for expiring licenses */}
        {expiringCount > 0 && (
          <Alert className="border-warning/50 bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">授权到期预警</AlertTitle>
            <AlertDescription className="text-warning/80">
              当前有 {expiringCount} 个授权即将或已经过期，请及时跟进客户续费。
              <Button
                variant="link"
                className="h-auto p-0 pl-1 text-warning underline"
                onClick={() => setStatusFilter("expiring")}
              >
                点击查看
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总授权数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{licenses.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                正常授权
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {licenses.filter((l) => l.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-warning/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-warning">
                即将过期
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {licenses.filter((l) => l.status === "expiring").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">
                已过期/吊销
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {licenses.filter((l) => l.status === "expired" || l.status === "revoked").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base text-card-foreground">授权列表</CardTitle>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-input">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">正常</SelectItem>
                    <SelectItem value="expiring">即将过期</SelectItem>
                    <SelectItem value="expired">已过期</SelectItem>
                    <SelectItem value="revoked">已吊销</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索序列号、租户或机器码..."
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
                  <TableHead className="text-muted-foreground">序列号</TableHead>
                  <TableHead className="text-muted-foreground">归属租户</TableHead>
                  <TableHead className="text-muted-foreground">绑定机器码</TableHead>
                  <TableHead className="text-muted-foreground">生效日期</TableHead>
                  <TableHead className="text-muted-foreground">失效日期</TableHead>
                  <TableHead className="text-muted-foreground">剩余天数</TableHead>
                  <TableHead className="text-muted-foreground">状态</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow
                    key={license.id}
                    className={cn("border-border", getRowClassName(license.status))}
                  >
                    <TableCell className="font-mono text-xs text-card-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-accent/20">
                          <Key className="h-3.5 w-3.5 text-accent" />
                        </div>
                        {license.serialNumber}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-card-foreground">
                      {license.tenantName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {license.machineCode}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{license.startDate}</TableCell>
                    <TableCell className="text-muted-foreground">{license.endDate}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-medium",
                          license.daysUntilExpiry < 0
                            ? "text-destructive"
                            : license.daysUntilExpiry <= 30
                              ? "text-warning"
                              : "text-muted-foreground"
                        )}
                      >
                        {license.daysUntilExpiry < 0
                          ? `已过期 ${Math.abs(license.daysUntilExpiry)} 天`
                          : `${license.daysUntilExpiry} 天`}
                      </span>
                    </TableCell>
                    <TableCell>{getLicenseStatusBadge(license.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(license)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadLicense(license)}>
                            <Download className="mr-2 h-4 w-4" />
                            下载授权文件
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {(license.status === "active" || license.status === "expiring") && (
                            <DropdownMenuItem className="text-info">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              续签授权
                            </DropdownMenuItem>
                          )}
                          {license.status !== "revoked" && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRevoke(license)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              吊销授权
                            </DropdownMenuItem>
                          )}
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
              <DialogTitle>授权详情</DialogTitle>
              <DialogDescription>
                License 序列号: {selectedLicense?.serialNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedLicense && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">归属租户</p>
                    <p className="text-sm text-card-foreground">{selectedLicense.tenantName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">关联订单</p>
                    <p className="font-mono text-sm text-card-foreground">
                      {selectedLicense.orderNumber}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">绑定机器码</p>
                    <p className="font-mono text-sm text-card-foreground">
                      {selectedLicense.machineCode}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">当前状态</p>
                    {getLicenseStatusBadge(selectedLicense.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">生效日期</p>
                    <p className="text-sm text-card-foreground">{selectedLicense.startDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">失效日期</p>
                    <p className="text-sm text-card-foreground">{selectedLicense.endDate}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">剩余有效期</span>
                    <span
                      className={cn(
                        "text-xl font-bold",
                        selectedLicense.daysUntilExpiry < 0
                          ? "text-destructive"
                          : selectedLicense.daysUntilExpiry <= 30
                            ? "text-warning"
                            : "text-success"
                      )}
                    >
                      {selectedLicense.daysUntilExpiry < 0
                        ? `已过期 ${Math.abs(selectedLicense.daysUntilExpiry)} 天`
                        : `${selectedLicense.daysUntilExpiry} 天`}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => downloadLicense(selectedLicense)}
                  >
                    <Download className="h-4 w-4" />
                    下载授权文件
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Revoke Dialog */}
        <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">吊销授权确认</DialogTitle>
              <DialogDescription>
                您确定要吊销此授权吗？此操作不可逆。
              </DialogDescription>
            </DialogHeader>
            {selectedLicense && (
              <div className="space-y-4 py-4">
                <div className="rounded-lg bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">
                    即将吊销 <strong>{selectedLicense.tenantName}</strong> 的授权
                  </p>
                  <p className="mt-1 font-mono text-xs text-destructive/80">
                    序列号: {selectedLicense.serialNumber}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  吊销后，客户的私有化环境将无法继续使用该授权。请确保已与客户沟通并确认此操作。
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRevokeOpen(false)}>
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  alert("授权已吊销（模拟）")
                  setRevokeOpen(false)
                }}
              >
                确认吊销
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function LicensesPage() {
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
      <LicensesContent />
    </Suspense>
  )
}
