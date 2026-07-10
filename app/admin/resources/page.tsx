"use client"

import { useState } from "react"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect } from "react"
import { Eye, CheckCircle, XCircle, Download, AlertTriangle, Loader2 } from "lucide-react"
import {
  getCategoryName,
  getCategoryColor,
  type ResourceStatus,
} from "@/lib/mock-data"
import { resourceApi, institutionApi, type Resource, type Institution } from "@/lib/api"

export default function AdminResourcesPage() {
  const [activeTab, setActiveTab] = useState("reviewing")
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [offlineOpen, setOfflineOpen] = useState(false)
  const [offlineReason, setOfflineReason] = useState("")
  const [resources, setResources] = useState<Resource[]>([])
  const [institutions, setInstitutions] = useState<Record<string, Institution>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [resList, instList] = await Promise.all([
        resourceApi.list({ limit: 1000 }),
        institutionApi.list({ limit: 1000 }),
      ])
      setResources(resList.items)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredResources = (status: ResourceStatus | ResourceStatus[]) => {
    const statuses = Array.isArray(status) ? status : [status]
    return resources.filter((r) => statuses.includes(r.status))
  }

  const handleView = (resource: Resource) => {
    setSelectedResource(resource)
    setDetailsOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedResource) return
    setActionLoading(true)
    try {
      await resourceApi.review(selectedResource.id, { status: "pending_publish" })
      await resourceApi.publish(selectedResource.id)
      await loadData()
      setDetailsOpen(false)
    } catch (err: any) {
      setError(err.message || "操作失败")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedResource || !rejectReason.trim()) return
    setActionLoading(true)
    try {
      await resourceApi.review(selectedResource.id, { status: "rejected", rejectReason })
      await loadData()
      setRejectOpen(false)
      setRejectReason("")
      setDetailsOpen(false)
    } catch (err: any) {
      setError(err.message || "操作失败")
    } finally {
      setActionLoading(false)
    }
  }

  const handleOffline = async () => {
    if (!selectedResource || !offlineReason.trim()) return
    setActionLoading(true)
    try {
      await resourceApi.offline(selectedResource.id)
      // Note: backend offline doesn't store reason; would need update API to set rejectReason
      await loadData()
      setOfflineOpen(false)
      setOfflineReason("")
      setDetailsOpen(false)
    } catch (err: any) {
      setError(err.message || "操作失败")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">资源审核与管理</h1>
          <p className="text-sm text-muted-foreground">审核资源、监管已发布资源</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="reviewing">待审核</TabsTrigger>
            <TabsTrigger value="published">已发布</TabsTrigger>
            <TabsTrigger value="offlined">已下架</TabsTrigger>
          </TabsList>

          <TabsContent value="reviewing" className="space-y-4">
            <ResourceTable
              resources={filteredResources("reviewing")}
              institutions={institutions}
              onView={handleView}
              onApprove={(r) => { setSelectedResource(r); handleApprove() }}
              actions={["view", "approve", "reject"]}
            />
          </TabsContent>

          <TabsContent value="published" className="space-y-4">
            <ResourceTable
              resources={filteredResources("published")}
              institutions={institutions}
              onView={handleView}
              actions={["view", "offline"]}
            />
          </TabsContent>

          <TabsContent value="offlined" className="space-y-4">
            <ResourceTable
              resources={filteredResources("offlined")}
              institutions={institutions}
              onView={handleView}
              actions={["view"]}
            />
          </TabsContent>
        </Tabs>
        )}

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>资源详情</DialogTitle>
              <DialogDescription>审核与管理资源信息</DialogDescription>
            </DialogHeader>
            {selectedResource && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-36 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={selectedResource.coverImage || "/placeholder.jpg"}
                      alt={selectedResource.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{selectedResource.name}</h3>
                    <p className="text-sm text-muted-foreground">版本：{selectedResource.version}</p>
                    <p className="text-sm text-muted-foreground">
                      创建机构：{institutions[selectedResource.institutionId]?.name}
                    </p>
                    <Badge className={`mt-2 ${getCategoryColor(selectedResource.category)}`}>
                      {getCategoryName(selectedResource.category)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">资源简介</p>
                  <p className="text-sm text-foreground">{selectedResource.intro}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedResource.tags?.map((tag) => (
                    <Badge key={tag.id || tag.tagValue} variant="secondary">
                      {tag.tagValue}
                    </Badge>
                  ))}
                </div>

                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">买断价格</span>
                    <span className="text-xl font-bold text-accent">
                      ¥{selectedResource.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{selectedResource.attachmentName || "资源附件"}</span>
                </div>

                {selectedResource.status === "reviewing" && (
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2 bg-success hover:bg-success/90" onClick={handleApprove} disabled={actionLoading}>
                      <CheckCircle className="h-4 w-4" />
                      {actionLoading ? "处理中..." : "审核通过"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => setRejectOpen(true)}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4" />
                      驳回
                    </Button>
                  </div>
                )}

                {selectedResource.status === "published" && (
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={() => setOfflineOpen(true)}
                    disabled={actionLoading}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    强制下架
                  </Button>
                )}

                {selectedResource.status === "offlined" && (
                  <div className="rounded-lg bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">
                      下架原因：{selectedResource.rejectReason || "违规资源"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>驳回资源</DialogTitle>
              <DialogDescription>请填写驳回原因，创作者可见</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="rejectReason">驳回原因 *</Label>
              <Textarea
                id="rejectReason"
                placeholder="请说明驳回原因..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
                确认驳回
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Offline Dialog */}
        <Dialog open={offlineOpen} onOpenChange={setOfflineOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">强制下架</DialogTitle>
              <DialogDescription>请填写下架原因，创作者和已购用户可见</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="offlineReason">下架原因 *</Label>
              <Textarea
                id="offlineReason"
                placeholder="请说明下架原因..."
                value={offlineReason}
                onChange={(e) => setOfflineReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOfflineOpen(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleOffline} disabled={!offlineReason.trim()}>
                确认下架
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function ResourceTable({
  resources,
  institutions,
  onView,
  onApprove,
  actions,
}: {
  resources: Resource[]
  institutions: Record<string, Institution>
  onView: (r: Resource) => void
  onApprove?: (r: Resource) => void
  actions: ("view" | "approve" | "reject" | "offline")[]
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>资源信息</TableHead>
              <TableHead>品类</TableHead>
              <TableHead>创建机构</TableHead>
              <TableHead>买断价格</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-14 overflow-hidden rounded-md bg-muted">
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
                <TableCell>{institutions[resource.institutionId]?.name}</TableCell>
                <TableCell className="font-medium">¥{resource.price.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{resource.createdAt}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(resource)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {actions.includes("approve") && onApprove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-success"
                        onClick={() => onApprove(resource)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {resources.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">暂无数据</div>
        )}
      </CardContent>
    </Card>
  )
}
