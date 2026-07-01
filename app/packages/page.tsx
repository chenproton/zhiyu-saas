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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Search, MoreHorizontal, Copy, Eye, Pencil, Power } from "lucide-react"
import Link from "next/link"
import { packages, featureModules, type Package } from "@/lib/mock-data"

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-success/20 text-success hover:bg-success/30">已上架</Badge>
    case "inactive":
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted">已下架</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getFeatureName(featureId: string): string {
  for (const module of featureModules) {
    const found = module.children.find(c => c.id === featureId)
    if (found) return found.name
  }
  return featureId
}

export default function PackagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleViewDetails = (pkg: Package) => {
    setSelectedPackage(pkg)
    setDetailsOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">产品套餐管理</h1>
            <p className="text-sm text-muted-foreground">
              管理系统功能模块和商业套餐配置
            </p>
          </div>
          <Link href="/packages/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新建套餐
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总套餐数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{packages.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已上架
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {packages.filter((p) => p.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已下架
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {packages.filter((p) => p.status === "inactive").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-card-foreground">套餐列表</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索套餐名称或标识码..."
                  className="bg-input pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">套餐名称</TableHead>
                  <TableHead className="text-muted-foreground">标识码</TableHead>
                  <TableHead className="text-muted-foreground">功能数量</TableHead>
                  <TableHead className="text-muted-foreground">资源配额</TableHead>
                  <TableHead className="text-muted-foreground">价格</TableHead>
                  <TableHead className="text-muted-foreground">状态</TableHead>
                  <TableHead className="text-muted-foreground">更新时间</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id} className="border-border">
                    <TableCell className="font-medium text-card-foreground">
                      {pkg.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {pkg.code}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {pkg.features.length} 项
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="space-y-1">
                        <div>学生: {pkg.quotas.maxStudentAccounts}</div>
                        <div>教师: {pkg.quotas.maxTeacherAccounts}</div>
                        <div>Token: {pkg.quotas.dailyTokenLimit.toLocaleString()}/天</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      {pkg.price === 0 ? (
                        <span className="text-muted-foreground">免费</span>
                      ) : (
                        `¥${pkg.price.toLocaleString()}`
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{pkg.updatedAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(pkg)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/packages/${pkg.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              编辑套餐
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            克隆套餐
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Power className="mr-2 h-4 w-4" />
                            {pkg.status === "active" ? "下架" : "上架"}
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPackage?.name}</DialogTitle>
              <DialogDescription>
                套餐标识码: {selectedPackage?.code}
              </DialogDescription>
            </DialogHeader>
            {selectedPackage && (
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">资源配额</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-secondary p-4">
                      <p className="text-2xl font-bold text-card-foreground">
                        {selectedPackage.quotas.aiModel}
                      </p>
                      <p className="text-xs text-muted-foreground">AI 模型</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-4">
                      <p className="text-2xl font-bold text-card-foreground">
                        {selectedPackage.quotas.dailyTokenLimit.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">每日 Token 额度</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-4">
                      <p className="text-2xl font-bold text-card-foreground">
                        {selectedPackage.quotas.maxStudentAccounts}
                      </p>
                      <p className="text-xs text-muted-foreground">最大学生账号数</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-4">
                      <p className="text-2xl font-bold text-card-foreground">
                        {selectedPackage.quotas.maxTeacherAccounts}
                      </p>
                      <p className="text-xs text-muted-foreground">最大教师账号数</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">包含功能 ({selectedPackage.features.length} 项)</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.features.map((featureId, index) => (
                      <Badge key={index} variant="secondary">
                        {getFeatureName(featureId)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">套餐价格</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {selectedPackage.price === 0
                        ? "免费"
                        : `¥${selectedPackage.price.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">当前状态</p>
                    {getStatusBadge(selectedPackage.status)}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
