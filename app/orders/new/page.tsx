"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, FileText } from "lucide-react"
import Link from "next/link"
import { tenants, packages } from "@/lib/mock-data"

export default function NewOrderPage() {
  const [formData, setFormData] = useState({
    tenantId: "",
    packageId: "",
    orderType: "new",
    amount: "",
    duration: "",
    paymentStatus: "pending",
  })

  const selectedPackage = packages.find((p) => p.id === formData.packageId)

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId)
    setFormData({
      ...formData,
      packageId,
      amount: pkg ? pkg.price.toString() : "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`
    console.log({ ...formData, orderNumber })
    alert(`订单 ${orderNumber} 创建成功！（模拟）`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">手工录单</h1>
            <p className="text-sm text-muted-foreground">
              手动录入租户的商业交易订单
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Tenant selection */}
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base text-card-foreground">订单信息</CardTitle>
                  <CardDescription>选择租户并配置订单详情</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">关联租户 *</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tenantId: value })
                  }
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="选择租户" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants
                      .filter((t) => t.status !== "churned")
                      .map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="package">购买套餐 *</Label>
                <Select
                  value={formData.packageId}
                  onValueChange={handlePackageChange}
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="选择套餐" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages
                      .filter((p) => p.status === "active")
                      .map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - ¥{pkg.price.toLocaleString()}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orderType">订单类型 *</Label>
                  <Select
                    value={formData.orderType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, orderType: value })
                    }
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">新购</SelectItem>
                      <SelectItem value="renewal">续费</SelectItem>
                      <SelectItem value="expansion">扩容</SelectItem>
                      <SelectItem value="upgrade">升级</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">购买时长 *</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) =>
                      setFormData({ ...formData, duration: value })
                    }
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="选择时长" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30天">30天（试用）</SelectItem>
                      <SelectItem value="6个月">6个月</SelectItem>
                      <SelectItem value="1年">1年</SelectItem>
                      <SelectItem value="2年">2年</SelectItem>
                      <SelectItem value="3年">3年</SelectItem>
                      <SelectItem value="买断">永久买断</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment info */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">支付信息</CardTitle>
              <CardDescription>设置订单金额和支付状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">订单金额 (元) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    className="bg-input"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                  {selectedPackage && (
                    <p className="text-xs text-muted-foreground">
                      参考价格: ¥{selectedPackage.price.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">支付状态 *</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentStatus: value })
                    }
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">待支付</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.amount && (
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">订单总金额</span>
                    <span className="text-2xl font-bold text-card-foreground">
                      ¥{Number(formData.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/orders">
              <Button variant="outline">取消</Button>
            </Link>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              保存订单
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
