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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Download,
  CalendarIcon,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { orders, type Order } from "@/lib/mock-data"

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

function getOrderTypeBadge(type: string) {
  switch (type) {
    case "new":
      return <Badge variant="outline" className="border-info text-info">新购</Badge>
    case "renewal":
      return <Badge variant="outline" className="border-success text-success">续费</Badge>
    case "expansion":
      return <Badge variant="outline" className="border-accent text-accent">扩容</Badge>
    case "upgrade":
      return <Badge variant="outline" className="border-warning text-warning">升级</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || order.paymentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const exportOrders = () => {
    const csvContent = [
      ["订单号", "租户名称", "套餐", "类型", "金额", "状态", "时长", "创建时间"],
      ...filteredOrders.map((o) => [
        o.orderNumber,
        o.tenantName,
        o.packageName,
        o.orderType,
        o.amount,
        o.paymentStatus,
        o.duration,
        o.createdAt,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${format(new Date(), "yyyyMMdd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalAmount = filteredOrders.reduce((sum, o) => sum + o.amount, 0)
  const completedAmount = filteredOrders
    .filter((o) => o.paymentStatus === "completed")
    .reduce((sum, o) => sum + o.amount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">订单与账单管理</h1>
            <p className="text-sm text-muted-foreground">
              记录租户的商业化交易行为与财务明细
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportOrders}>
              <Download className="h-4 w-4" />
              导出账单
            </Button>
            <Link href="/orders/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                手工录单
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总订单数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{orders.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                订单总金额
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                ¥{totalAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已收款金额
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ¥{completedAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                待收款金额
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                ¥{(totalAmount - completedAmount).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base text-card-foreground">订单列表</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start bg-input">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MM/dd", { locale: zhCN })} -{" "}
                            {format(dateRange.to, "MM/dd", { locale: zhCN })}
                          </>
                        ) : (
                          format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })
                        )
                      ) : (
                        "选择日期范围"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) =>
                        setDateRange({ from: range?.from, to: range?.to })
                      }
                      locale={zhCN}
                    />
                  </PopoverContent>
                </Popover>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-input">
                    <SelectValue placeholder="支付状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="pending">待支付</SelectItem>
                    <SelectItem value="cancelled">已作废</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索订单号或租户..."
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
                  <TableHead className="text-muted-foreground">订单编号</TableHead>
                  <TableHead className="text-muted-foreground">租户名称</TableHead>
                  <TableHead className="text-muted-foreground">购买套餐</TableHead>
                  <TableHead className="text-muted-foreground">订单类型</TableHead>
                  <TableHead className="text-muted-foreground">金额</TableHead>
                  <TableHead className="text-muted-foreground">购买时长</TableHead>
                  <TableHead className="text-muted-foreground">支付状态</TableHead>
                  <TableHead className="text-muted-foreground">创建时间</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-border">
                    <TableCell className="font-mono text-xs text-card-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-accent/20">
                          <FileText className="h-3.5 w-3.5 text-accent" />
                        </div>
                        {order.orderNumber}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-card-foreground">
                      {order.tenantName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.packageName}</TableCell>
                    <TableCell>{getOrderTypeBadge(order.orderType)}</TableCell>
                    <TableCell className="font-medium text-card-foreground">
                      {order.amount === 0 ? (
                        <span className="text-muted-foreground">免费</span>
                      ) : (
                        `¥${order.amount.toLocaleString()}`
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.duration}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell className="text-muted-foreground">{order.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            编辑订单
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {order.paymentStatus === "pending" && (
                            <DropdownMenuItem className="text-success">
                              确认收款
                            </DropdownMenuItem>
                          )}
                          {order.paymentStatus === "pending" && (
                            <DropdownMenuItem className="text-destructive">
                              作废订单
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
              <DialogTitle>订单详情</DialogTitle>
              <DialogDescription>订单号: {selectedOrder?.orderNumber}</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">租户名称</p>
                    <p className="text-sm text-card-foreground">{selectedOrder.tenantName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">购买套餐</p>
                    <p className="text-sm text-card-foreground">{selectedOrder.packageName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">订单类型</p>
                    {getOrderTypeBadge(selectedOrder.orderType)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">购买时长</p>
                    <p className="text-sm text-card-foreground">{selectedOrder.duration}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">支付状态</p>
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">创建时间</p>
                    <p className="text-sm text-card-foreground">{selectedOrder.createdAt}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">订单金额</span>
                    <span className="text-2xl font-bold text-card-foreground">
                      {selectedOrder.amount === 0
                        ? "免费"
                        : `¥${selectedOrder.amount.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                {selectedOrder.paymentStatus === "completed" && (
                  <div className="flex justify-end">
                    <Link href={`/licenses/issue?order=${selectedOrder.id}`}>
                      <Button className="gap-2">签发授权</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
