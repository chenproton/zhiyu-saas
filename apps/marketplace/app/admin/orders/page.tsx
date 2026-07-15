"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Eye, RotateCcw, Loader2, AlertCircle } from "lucide-react"
import { getCategoryName, RESOURCE_CATEGORIES } from "@/lib/resource-constants"
import { orderApi, resourceApi, institutionApi, type Order, type Resource, type Institution } from "@/lib/api"

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [resources, setResources] = useState<Record<string, Resource>>({})
  const [institutions, setInstitutions] = useState<Record<string, Institution>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [orderList, resourceList, instList] = await Promise.all([
        orderApi.list({ limit: 1000 }),
        resourceApi.list({ limit: 1000 }),
        institutionApi.list({ limit: 1000 }),
      ])
      setOrders(orderList.items)
      const resMap: Record<string, Resource> = {}
      resourceList.items.forEach((r) => (resMap[r.id] = r))
      setResources(resMap)
      const instMap: Record<string, Institution> = {}
      instList.items.forEach((i) => (instMap[i.id] = i))
      setInstitutions(instMap)
    } catch (err: any) {
      setError(err.message || "加载失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "paid")
    return {
      total: orders.length,
      gmv: paid.reduce((sum, o) => sum + o.price, 0),
      platformIncome: paid.reduce((sum, o) => sum + o.platformFee, 0),
      creatorIncome: paid.reduce((sum, o) => sum + o.sellerIncome, 0),
      refunded: orders.filter((o) => o.status === "refunded").reduce((sum, o) => sum + o.price, 0),
    }
  }, [orders])

  const filteredOrders = orders.filter((o) => {
    const resource = resources[o.resourceId]
    const matchesSearch =
      !searchQuery.trim() ||
      o.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    const matchesCategory = categoryFilter === "all" || resource?.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">订单管理</h1>
          <p className="text-sm text-muted-foreground">全平台交易订单查看与处理</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">总订单数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">总 GMV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">¥{stats.gmv.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">平台收入</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">¥{stats.platformIncome.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">创作者分成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">¥{stats.creatorIncome.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex flex-wrap gap-2 py-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索订单号或资源名称..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="订单状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="paid">已完成</SelectItem>
                <SelectItem value="pending">待支付</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
                <SelectItem value="refunded">已退款</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="资源品类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部品类</SelectItem>
                {RESOURCE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">订单列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>订单号</TableHead>
                      <TableHead>资源名称</TableHead>
                      <TableHead>采购机构</TableHead>
                      <TableHead>创建机构</TableHead>
                      <TableHead>买断金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>下单时间</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const resource = resources[order.resourceId]
                      const buyer = institutions[order.buyerId]
                      const seller = institutions[order.sellerId]
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.orderNo}</TableCell>
                          <TableCell className="max-w-[180px] truncate">{resource?.name || "-"}</TableCell>
                          <TableCell>{buyer?.name || "-"}</TableCell>
                          <TableCell>{seller?.name || "-"}</TableCell>
                          <TableCell className="font-medium">¥{order.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={order.status === "paid" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
                              {order.status === "paid" ? "已完成" : order.status === "pending" ? "待支付" : order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{order.createdAt}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {filteredOrders.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">暂无订单</div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>订单详情</DialogTitle>
              <DialogDescription>订单号：{selectedOrder?.orderNo}</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">资源名称</p>
                    <p className="font-medium text-foreground">{resources[selectedOrder.resourceId]?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">资源品类</p>
                    <p className="text-foreground">{getCategoryName(resources[selectedOrder.resourceId]?.category || "course")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">采购机构</p>
                    <p className="text-foreground">{institutions[selectedOrder.buyerId]?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">创建机构</p>
                    <p className="text-foreground">{institutions[selectedOrder.sellerId]?.name}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">买断金额</span>
                    <span className="text-xl font-bold text-foreground">¥{selectedOrder.price.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">平台抽成</span>
                    <span className="text-foreground">¥{selectedOrder.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">创作者收益</span>
                    <span className="font-medium text-success">¥{selectedOrder.sellerIncome.toLocaleString()}</span>
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
