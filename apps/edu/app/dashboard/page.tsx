"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { DashboardLayout, useRole } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Package,
  ShoppingBag,
  Wallet,
  FileText,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { resourceApi, orderApi, type Resource, type Order } from "@/lib/api"

export default function InstitutionDashboardPage() {
  const { role, institutionId, institution } = useRole()

  const [resources, setResources] = useState<Resource[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      if (!institutionId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [resourcesRes, ordersRes] = await Promise.all([
          resourceApi.list({ institutionId }),
          orderApi.list(),
        ])

        if (cancelled) return

        setResources(resourcesRes.items)
        const myOrders = ordersRes.items.filter(
          (o) => o.buyerId === institutionId || o.sellerId === institutionId
        )
        setOrders(myOrders)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "加载数据失败")
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [institutionId])

  const resourceMap = useMemo(() => {
    const map = new Map<string, Resource>()
    for (const r of resources) {
      map.set(r.id, r)
    }
    return map
  }, [resources])

  const pendingReview = resources.filter((r) => r.status === "reviewing").length

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-destructive">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            重试
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            欢迎回来，{institution?.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {role === "enterprise" ? "这里是您的资源创作与销售中心" : "这里是您的资源采购管理中心"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {role === "enterprise" ? "我的资源" : "已购资源"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {role === "enterprise" ? resources.length : orders.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                待处理事项
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{role === "enterprise" ? pendingReview : 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {role === "enterprise" ? "累计收益" : "累计消费"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ¥{(role === "enterprise" ? institution?.totalIncome : institution?.totalSpent)?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {role === "enterprise" ? "可提现余额" : "账户余额"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                ¥{institution?.balance.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {role === "enterprise" && (
            <Link href="/my-resources/new">
              <Card className="cursor-pointer transition-colors hover:bg-secondary">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                    <Package className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">新建资源</p>
                    <p className="text-xs text-muted-foreground">创建教学资源</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
          <Link href={role === "enterprise" ? "/my-resources" : "/purchased"}>
            <Card className="cursor-pointer transition-colors hover:bg-secondary">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-info/20">
                  {role === "enterprise" ? (
                    <Package className="h-5 w-5 text-info" />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-info" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{role === "enterprise" ? "我的资源库" : "已购资源"}</p>
                  <p className="text-xs text-muted-foreground">
                    {role === "enterprise" ? "管理已创建资源" : "查看已购买资源"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/orders">
            <Card className="cursor-pointer transition-colors hover:bg-secondary">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/20">
                  <FileText className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">订单管理</p>
                  <p className="text-xs text-muted-foreground">查看交易记录</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/wallet">
            <Card className="cursor-pointer transition-colors hover:bg-secondary">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/20">
                  <Wallet className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">账户中心</p>
                  <p className="text-xs text-muted-foreground">钱包与提现</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Pending Alerts */}
        {role === "enterprise" && pendingReview > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  您有 {pendingReview} 个资源正在审核中
                </p>
                <p className="text-xs text-muted-foreground">平台运营方审核通过后将自动上架</p>
              </div>
              <Link href="/my-resources">
                <Button variant="outline" size="sm" className="gap-1">
                  查看
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">最近订单</CardTitle>
              <CardDescription>最新的交易记录</CardDescription>
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
                <TableRow className="hover:bg-transparent">
                  <TableHead>订单号</TableHead>
                  <TableHead>资源名称</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <OrderRow key={order.id} order={order} resourceMap={resourceMap} />
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      暂无订单记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function OrderRow({ order, resourceMap }: { order: Order; resourceMap: Map<string, Resource> }) {
  const resource = resourceMap.get(order.resourceId)
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{order.orderNo}</TableCell>
      <TableCell className="max-w-[200px] truncate">{resource?.name || "-"}</TableCell>
      <TableCell>¥{order.price.toLocaleString()}</TableCell>
      <TableCell>
        <Badge className={order.status === "paid" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
          {order.status === "paid" ? "已完成" : order.status === "pending" ? "待支付" : order.status}
        </Badge>
      </TableCell>
    </TableRow>
  )
}
