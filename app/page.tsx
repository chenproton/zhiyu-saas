"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  Key,
  FileText,
  Package,
} from "lucide-react"
import Link from "next/link"
import { dashboardStats, licenses, orders, tenants } from "@/lib/mock-data"

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: { value: string; positive: boolean }
}) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <TrendingUp
              className={`h-3 w-3 ${
                trend.positive ? "text-success" : "text-destructive"
              }`}
            />
            <span
              className={
                trend.positive ? "text-success" : "text-destructive"
              }
            >
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getLicenseStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-success/20 text-success hover:bg-success/30">正常</Badge>
    case "expiring":
      return <Badge className="bg-warning/20 text-warning hover:bg-warning/30">即将过期</Badge>
    case "expired":
      return <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">已过期</Badge>
    case "revoked":
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted">已吊销</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-success/20 text-success hover:bg-success/30">已完成</Badge>
    case "pending":
      return <Badge className="bg-warning/20 text-warning hover:bg-warning/30">待支付</Badge>
    case "cancelled":
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted">已作废</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function DashboardPage() {
  const expiringLicenses = licenses.filter(
    (l) => l.status === "expiring" || l.status === "expired"
  )
  const recentOrders = orders.slice(0, 5)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">控制台</h1>
          <p className="text-sm text-muted-foreground">
            欢迎回来，这里是您的业务总览
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="活跃租户"
            value={dashboardStats.activeTenants}
            description={`共 ${dashboardStats.totalTenants} 家租户`}
            icon={Building2}
            trend={{ value: "+12.5%", positive: true }}
          />
          <StatCard
            title="本月收入"
            value={`¥${dashboardStats.monthlyRevenue.toLocaleString()}`}
            description="较上月增长"
            icon={TrendingUp}
            trend={{ value: "+8.2%", positive: true }}
          />
          <StatCard
            title="即将过期授权"
            value={dashboardStats.expiringLicenses}
            description="需要跟进续费"
            icon={AlertTriangle}
          />
          <StatCard
            title="待处理订单"
            value={dashboardStats.pendingOrders}
            description="等待确认支付"
            icon={Clock}
          />
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Link href="/packages/new">
            <Card className="cursor-pointer bg-card transition-colors hover:bg-secondary">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">新建套餐</p>
                  <p className="text-xs text-muted-foreground">配置产品功能</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tenants/new">
            <Card className="cursor-pointer bg-card transition-colors hover:bg-secondary">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                  <Building2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">新建租户</p>
                  <p className="text-xs text-muted-foreground">创建客户档案</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/orders/new">
            <Card className="cursor-pointer bg-card transition-colors hover:bg-secondary">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">录入订单</p>
                  <p className="text-xs text-muted-foreground">记录交易信息</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/licenses/issue">
            <Card className="cursor-pointer bg-card transition-colors hover:bg-secondary">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                  <Key className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">签发授权</p>
                  <p className="text-xs text-muted-foreground">生成License</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Content grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Expiring licenses alert */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-card-foreground">授权到期预警</CardTitle>
                <CardDescription>
                  以下授权即将或已经过期，请及时跟进
                </CardDescription>
              </div>
              <Link href="/licenses?filter=expiring">
                <Button variant="ghost" size="sm" className="gap-1">
                  查看全部
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">租户名称</TableHead>
                    <TableHead className="text-muted-foreground">到期日期</TableHead>
                    <TableHead className="text-muted-foreground">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringLicenses.map((license) => (
                    <TableRow key={license.id} className="border-border">
                      <TableCell className="font-medium text-card-foreground">
                        {license.tenantName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {license.endDate}
                      </TableCell>
                      <TableCell>{getLicenseStatusBadge(license.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent orders */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-card-foreground">最近订单</CardTitle>
                <CardDescription>最新的商业交易记录</CardDescription>
              </div>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  查看全部
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">订单号</TableHead>
                    <TableHead className="text-muted-foreground">租户</TableHead>
                    <TableHead className="text-muted-foreground">金额</TableHead>
                    <TableHead className="text-muted-foreground">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-border">
                      <TableCell className="font-mono text-xs text-card-foreground">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-muted-foreground">
                        {order.tenantName}
                      </TableCell>
                      <TableCell className="text-card-foreground">
                        ¥{order.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Tenant overview */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-card-foreground">租户概览</CardTitle>
              <CardDescription>当前所有租户的状态分布</CardDescription>
            </div>
            <Link href="/tenants">
              <Button variant="ghost" size="sm" className="gap-1">
                管理租户
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-4 rounded-lg bg-secondary p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                  <Building2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {tenants.filter((t) => t.status === "active").length}
                  </p>
                  <p className="text-xs text-muted-foreground">正式客户</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg bg-secondary p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/20">
                  <Building2 className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {tenants.filter((t) => t.status === "trial").length}
                  </p>
                  <p className="text-xs text-muted-foreground">试用客户</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg bg-secondary p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
                  <Building2 className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {tenants.filter((t) => t.status === "suspended").length}
                  </p>
                  <p className="text-xs text-muted-foreground">已停用</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg bg-secondary p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {tenants.filter((t) => t.status === "churned").length}
                  </p>
                  <p className="text-xs text-muted-foreground">已流失</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
