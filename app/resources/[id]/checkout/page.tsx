"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardLayout, useRole } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, CheckCircle, FileText, Building2, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { resourceApi, institutionApi, orderApi, type Resource, type Institution, type OrderDetail } from "@/lib/api"
import { RESOURCE_CATEGORIES } from "@/lib/resource-constants"

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { role, institutionId, institution: buyerInstitution } = useRole()
  const [resource, setResource] = useState<Resource | null>(null)
  const [seller, setSeller] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [orderNo, setOrderNo] = useState("")
  const [authCode, setAuthCode] = useState("")

  const resourceId = params.id as string

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const fetchedResource = await resourceApi.get(resourceId)
        if (cancelled) return
        setResource(fetchedResource)

        const fetchedSeller = await institutionApi.get(fetchedResource.institutionId)
        if (cancelled) return
        setSeller(fetchedSeller)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "加载失败")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [resourceId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/resources/${resourceId}`)}>
            返回资源详情
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  if (!resource || !seller) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">资源不存在</p>
        </div>
      </DashboardLayout>
    )
  }

  if (role !== "school") {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">仅学校机构可采购资源</p>
          <Button variant="outline" onClick={() => router.push(`/resources/${resource.id}`)}>
            返回资源详情
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const category = RESOURCE_CATEGORIES.find((c) => c.id === resource.category)
  const categoryName = category?.name || resource.category
  const categoryColor = category?.color || "bg-secondary"

  const handlePay = async () => {
    setPaying(true)
    try {
      const created = await orderApi.create(resource.id)
      const paid = await orderApi.pay(created.order.id)
      setOrderNo(paid.order.orderNo)
      setAuthCode(paid.authorization?.authCode || "")
      setSuccessOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "支付失败")
    } finally {
      setPaying(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">确认订单</h1>
          <p className="text-sm text-muted-foreground">请确认采购信息并完成支付</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">资源信息</CardTitle>
            <CardDescription>买断制资源，支付后永久使用</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative h-24 w-36 overflow-hidden rounded-md bg-muted">
                <Image
                  src={resource.coverImage || "/placeholder.jpg"}
                  alt={resource.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{resource.name}</h3>
                  <Badge className={categoryColor}>
                    {categoryName}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">版本号：{resource.version}</p>
                <p className="text-sm text-muted-foreground">创建机构：{seller.name}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">买断价格</span>
              <span className="text-2xl font-bold text-accent">
                ¥{resource.price.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">采购方信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">{buyerInstitution?.name || "未知机构"}</p>
                <p className="text-sm text-muted-foreground">{buyerInstitution?.contactName} {buyerInstitution?.contactPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">支付方式</CardTitle>
            <CardDescription>模拟支付，点击确认支付即视为支付成功</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">模拟支付</p>
                <p className="text-sm text-muted-foreground">无需对接真实支付通道</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" onClick={() => router.push(`/resources/${resource.id}`)}>
            取消
          </Button>
          <Button className="gap-2" onClick={handlePay} disabled={paying}>
            {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            确认支付 ¥{resource.price.toLocaleString()}
          </Button>
        </div>

        {/* Success Dialog */}
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                支付成功
              </DialogTitle>
              <DialogDescription>您已成功购买该资源，获得永久使用授权</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                <FileText className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">订单号</p>
                  <p className="font-mono text-sm text-foreground">{orderNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                <CheckCircle className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">授权证书编号</p>
                  <p className="font-mono text-sm text-foreground">{authCode}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button className="w-full gap-2" onClick={() => router.push("/purchased")}>
                查看授权
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/")}
              >
                继续浏览
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
