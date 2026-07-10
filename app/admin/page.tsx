"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
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
  Package,
  TrendingUp,
  FileText,
  Wallet,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { statsApi, resourceApi, orderApi, institutionApi } from "@/lib/api"
import type { DashboardStats, Resource, Order, Institution } from "@/lib/api"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [statsRes, resourcesRes, ordersRes, institutionsRes] = await Promise.all([
          statsApi.dashboard(),
          resourceApi.list({ limit: 1000 }),
          orderApi.list({ limit: 1000 }),
          institutionApi.list({ limit: 1000 }),
        ])
        if (cancelled) return
        setStats(statsRes)
        setResources(resourcesRes.items)
        setOrders(ordersRes.items)
        setInstitutions(institutionsRes.items)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载失败")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const topResources = useMemo(
    () =>
      [...resources]
        .filter((r) => r.salesCount > 0)
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 10),
    [resources]
  )

  const paidOrders = useMemo(() => orders.filter((o) => o.status === "paid"), [orders])

  const buyerStats = useMemo(
    () =>
      institutions
        .filter((i) => i.type === "school")
        .map((inst) => ({
          ...inst,
          spent: paidOrders
            .filter((o) => o.buyerId === inst.id)
            .reduce((sum, o) => sum + o.price, 0),
        }))
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 10),
    [institutions, paidOrders]
  )

  const creatorStats = useMemo(
    () =>
      institutions
        .filter((i) => i.type === "enterprise")
        .map((inst) => ({
          ...inst,
          income: paidOrders
            .filter((o) => o.sellerId === inst.id)
            .reduce((sum, o) => sum + o.sellerIncome, 0),
        }))
        .sort((a, b) => b.income - a.income)
        .slice(0, 10),
    [institutions, paidOrders]
  )

  const gmvData = useMemo(() => {
    const days = 30
    const today = new Date()
    const data: { date: string; gmv: number; orders: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      data.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, gmv: 0, orders: 0 })
    }
    for (const order of paidOrders) {
      const dateStr = order.paidAt || order.createdAt
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) continue
      const key = `${date.getMonth() + 1}/${date.getDate()}`
      const item = data.find((d) => d.date === key)
      if (item) {
        item.gmv += order.price
        item.orders += 1
      }
    }
    return data
  }, [paidOrders])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !stats) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-medium">加载失败</p>
            <p className="text-sm text-muted-foreground">{error || "无法获取数据"}</p>
          </div>
          <Button onClick={() => window.location.reload()}>重试</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">运营仪表盘</h1>
          <p className="text-sm text-muted-foreground">平台核心业务数据总览</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">入驻机构</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInstitutions}</div>
              <p className="text-xs text-muted-foreground">
                学校 {stats.schoolCount} / 企业 {stats.enterpriseCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">平台资源</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResources}</div>
              <p className="text-xs text-muted-foreground">
                已发布 {stats.publishedResources} / 审核中 {stats.reviewingResources}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">累计 GMV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ¥{stats.totalGMV.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">本月 ¥{stats.monthlyGMV.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">累计订单</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Todo alerts */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.pendingInstitutions > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="flex items-center gap-4 py-4">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    待审核机构 {stats.pendingInstitutions} 家
                  </p>
                </div>
                <Link href="/admin/institutions">
                  <Button variant="outline" size="sm" className="gap-1">
                    处理
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          {stats.reviewingResources > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="flex items-center gap-4 py-4">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    待审核资源 {stats.reviewingResources} 个
                  </p>
                </div>
                <Link href="/admin/resources">
                  <Button variant="outline" size="sm" className="gap-1">
                    处理
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          {stats.pendingWithdrawals > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="flex items-center gap-4 py-4">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    待处理提现 {stats.pendingWithdrawals} 笔
                  </p>
                </div>
                <Link href="/admin/withdrawals">
                  <Button variant="outline" size="sm" className="gap-1">
                    处理
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">近 30 日 GMV 趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gmvData}>
                  <defs>
                    <linearGradient id="gmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="gmv"
                    stroke="hsl(var(--accent))"
                    fillOpacity={1}
                    fill="url(#gmv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Lists */}
        <div className="grid gap-6 lg:grid-cols-3">
          <TopListCard
            title="Top 10 热销资源"
            icon={Package}
            items={topResources.map((r) => ({ name: r.name, value: `${r.salesCount} 销量` }))}
          />
          <TopListCard
            title="Top 10 采购机构"
            icon={Building2}
            items={buyerStats.map((i) => ({ name: i.name, value: `¥${i.spent.toLocaleString()}` }))}
          />
          <TopListCard
            title="Top 10 创作者机构"
            icon={TrendingUp}
            items={creatorStats.map((i) => ({ name: i.name, value: `¥${i.income.toLocaleString()}` }))}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

function TopListCard({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: React.ElementType
  items: { name: string; value: string }[]
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Icon className="h-4 w-4 text-accent" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>排名</TableHead>
              <TableHead>名称</TableHead>
              <TableHead className="text-right">数据</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Badge variant={index < 3 ? "default" : "outline"}>{index + 1}</Badge>
                </TableCell>
                <TableCell className="max-w-[160px] truncate">{item.name}</TableCell>
                <TableCell className="text-right font-medium">{item.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
