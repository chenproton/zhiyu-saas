"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { DashboardLayout, useRole } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, Award, Shield, Loader2, AlertCircle } from "lucide-react"
import {
  orderApi,
  resourceApi,
  institutionApi,
  type Authorization,
  type Resource,
  type Institution,
  type Order,
} from "@/lib/api"
import { getCategoryName, getCategoryColor } from "@/lib/resource-constants"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PurchasedResourcesPage() {
  const { institutionId } = useRole()
  const [selectedAuth, setSelectedAuth] = useState<Authorization | null>(null)
  const [auths, setAuths] = useState<Authorization[]>([])
  const [resources, setResources] = useState<Record<string, Resource>>({})
  const [institutions, setInstitutions] = useState<Record<string, Institution>>({})
  const [orders, setOrders] = useState<Record<string, Order>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!institutionId) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [authList, resourceList, instList, orderList] = await Promise.all([
          orderApi.listAuthorizations(),
          resourceApi.list({ limit: 1000 }),
          institutionApi.list({ limit: 1000 }),
          orderApi.list({ limit: 1000 }),
        ])
        if (cancelled) return
        const resMap: Record<string, Resource> = {}
        resourceList.items.forEach((r) => (resMap[r.id] = r))
        const instMap: Record<string, Institution> = {}
        instList.items.forEach((i) => (instMap[i.id] = i))
        const orderMap: Record<string, Order> = {}
        orderList.items.forEach((o) => (orderMap[o.id] = o))
        setAuths(authList.items.filter((a) => a.buyerId === institutionId))
        setResources(resMap)
        setInstitutions(instMap)
        setOrders(orderMap)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载已购资源失败")
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
  }, [institutionId])

  if (!institutionId) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">请先入驻机构</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">已购资源库</h1>
          <p className="text-sm text-muted-foreground">您采购的教学资源，可重复下载，永久有效</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">已购资源列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>资源信息</TableHead>
                      <TableHead>品类</TableHead>
                      <TableHead>创建机构</TableHead>
                      <TableHead>购买时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auths.map((auth) => {
                      const resource = resources[auth.resourceId]
                      if (!resource) return null
                      const seller = institutions[resource.institutionId]
                      return (
                        <TableRow key={auth.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
                                <Image
                                  src={resource.coverImage || "/placeholder.jpg"}
                                  alt={resource.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{resource.name}</p>
                                <p className="text-xs text-muted-foreground">版本 {resource.version}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(resource.category)}>
                              {getCategoryName(resource.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>{seller?.name || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{auth.createdAt}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                disabled={!resource.attachment}
                                onClick={() => {
                                  if (resource.attachment) {
                                    window.open(resource.attachment, "_blank")
                                  }
                                }}
                              >
                                <Download className="h-3.5 w-3.5" />
                                {resource.attachment ? "下载" : "无附件"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => setSelectedAuth(auth)}
                              >
                                <Award className="h-3.5 w-3.5" />
                                授权
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {auths.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">暂无已购资源</div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Authorization Certificate Dialog */}
        <Dialog open={!!selectedAuth} onOpenChange={() => setSelectedAuth(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                授权证书
              </DialogTitle>
              <DialogDescription>本证书证明采购方获得资源永久使用授权</DialogDescription>
            </DialogHeader>
            {selectedAuth && (
              <CertificateContent
                auth={selectedAuth}
                resource={resources[selectedAuth.resourceId]}
                buyer={institutions[selectedAuth.buyerId]}
                seller={resources[selectedAuth.resourceId] ? institutions[resources[selectedAuth.resourceId].institutionId] : undefined}
                order={orders[selectedAuth.orderId]}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function CertificateContent({
  auth,
  resource,
  buyer,
  seller,
  order,
}: {
  auth: Authorization
  resource?: Resource
  buyer?: Institution
  seller?: Institution
  order?: Order
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-foreground">教学资源买断授权证书</h3>
        <p className="mt-1 text-sm text-muted-foreground">证书编号：{auth.authCode}</p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-3 gap-2">
          <span className="text-muted-foreground">资源名称</span>
          <span className="col-span-2 font-medium text-foreground">{resource?.name || "-"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-muted-foreground">版本号</span>
          <span className="col-span-2 font-medium text-foreground">{resource?.version || "-"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-muted-foreground">授权方</span>
          <span className="col-span-2 font-medium text-foreground">{seller?.name || "-"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-muted-foreground">被授权方</span>
          <span className="col-span-2 font-medium text-foreground">{buyer?.name || "-"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-muted-foreground">授权模式</span>
          <span className="col-span-2 font-medium text-success">买断（永久使用）</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-muted-foreground">生效日期</span>
          <span className="col-span-2 font-medium text-foreground">{auth.createdAt}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <span className="text-muted-foreground">关联订单</span>
          <span className="col-span-2 font-mono text-foreground">{order?.orderNo || "-"}</span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-foreground">教学资源共享商城 平台电子签章</span>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          本证书由平台自动生成，具有唯一编号，禁止转售或转让
        </p>
      </div>
    </div>
  )
}
