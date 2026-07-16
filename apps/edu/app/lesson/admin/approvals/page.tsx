"use client"

import { Check, CheckSquare, Eye, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { courseApi, lessonBatchApi } from "@/lib/api"
import type { Course } from "@/lib/types/lesson"
import type { LessonBatch } from "@/lib/types/lesson"
import { useToast } from "@/hooks/use-toast"

const statusConfig = {
  pending: { label: "待审批", className: "bg-yellow-50 text-yellow-600" },
  approved: { label: "已通过", className: "bg-green-50 text-green-600" },
  rejected: { label: "已驳回", className: "bg-red-50 text-red-500" },
}

interface ApprovalView {
  id: string
  courseId: string
  courseName: string
  courseCode: string
  version: string
  courseType: Course["type"]
  major?: string
  batchName?: string
  submitterId: string
  submitterName: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
}

const COURSE_TYPE_LABELS: Record<Course["type"], string> = {
  system: "体系课",
  granular: "颗粒课",
  hybrid: "混合课",
}

export default function ApprovalsPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<ApprovalView[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ApprovalView | null>(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [comment, setComment] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const [courseRes, batchRes] = await Promise.all([
        courseApi.list({ limit: 1000 }),
        lessonBatchApi.list({ limit: 1000 }),
      ])
      const batchMap = new Map(batchRes.items.map((b) => [b.id, b]))

      const mapped: ApprovalView[] = courseRes.items
        .filter((c) => ["pending", "published", "rejected"].includes(c.status))
        .map((c) => ({
          id: c.id,
          courseId: c.id,
          courseName: c.name,
          courseCode: c.code,
          version: c.version || "-",
          courseType: c.type,
          major: c.major,
          batchName: c.batchId ? batchMap.get(c.batchId)?.name : undefined,
          submitterId: c.creatorId,
          submitterName: c.creatorId,
          status: c.status === "published" ? "approved" : (c.status as ApprovalView["status"]),
          submittedAt: new Date(c.updatedAt).toLocaleDateString(),
        }))
      setItems(mapped)
    } catch (err: any) {
      toast({ variant: "destructive", title: "加载失败", description: err.message || "无法获取审批数据" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const pendingItems = items.filter((a) => a.status === "pending")
  const processedItems = items.filter((a) => a.status !== "pending")

  const handleApproveClick = (item: ApprovalView) => {
    setSelectedItem(item)
    setComment("")
    setIsApproveDialogOpen(true)
  }

  const handleApproveConfirm = async () => {
    if (!selectedItem) return
    try {
      await courseApi.review(selectedItem.courseId, { status: "published", comment: comment || "审批通过。" })
      await loadData()
      setIsApproveDialogOpen(false)
      setComment("")
      setSelectedItem(null)
      toast({ title: "审批通过" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "操作失败", description: err.message || "请稍后重试" })
    }
  }

  const handleRejectClick = (item: ApprovalView) => {
    setSelectedItem(item)
    setComment("")
    setIsRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedItem || !comment.trim()) return
    try {
      await courseApi.review(selectedItem.courseId, { status: "rejected", comment: comment.trim() })
      await loadData()
      setIsRejectDialogOpen(false)
      setComment("")
      setSelectedItem(null)
      toast({ title: "已驳回" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "操作失败", description: err.message || "请稍后重试" })
    }
  }

  const listHref = (type: Course["type"]) => {
    if (type === "system") return "/lesson/admin/system"
    if (type === "granular") return "/lesson/admin/granular"
    return "/lesson/admin/hybrid"
  }

  const renderTable = (data: ApprovalView[]) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          审批记录列表
        </CardTitle>
        <CardDescription>共 {data.length} 条审批记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">课程名称</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">课程编码</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">课程类型</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 text-center whitespace-nowrap">版本</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">适用专业</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">所属批次分组</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">创建人</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">提交审批日期</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 text-center whitespace-nowrap">状态</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium whitespace-nowrap">{item.courseName}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.courseCode}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{COURSE_TYPE_LABELS[item.courseType]}</TableCell>
                    <TableCell className="text-center text-sm text-gray-600 whitespace-nowrap">{item.version}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.major || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.batchName || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.submitterName}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.submittedAt}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge variant="secondary" className={statusConfig[item.status].className}>
                        {statusConfig[item.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap sticky right-0 bg-white z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={listHref(item.courseType)}>
                            <Eye className="mr-1 h-3 w-3" />
                            查看
                          </Link>
                        </Button>
                        {item.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleRejectClick(item)}
                            >
                              <X className="mr-1 h-3 w-3" />
                              驳回
                            </Button>
                            <Button size="sm" onClick={() => handleApproveClick(item)}>
                              <Check className="mr-1 h-3 w-3" />
                              通过
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">审批管理</h1>
        <p className="text-sm text-gray-500 mt-1">审核课程提交申请，管理审批流程</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2 w-full">
            待审批
            {pendingItems.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-yellow-100 text-yellow-700">
                {pendingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processed" className="w-full">已审批</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingItems.length > 0 || loading ? (
            renderTable(pendingItems)
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">暂无待审批项</h3>
                <p className="text-sm text-gray-500 mt-1">所有提交的课程都已处理完毕</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="processed" className="mt-6">
          {processedItems.length > 0 || loading ? (
            renderTable(processedItems)
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">暂无已处理记录</h3>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>通过审批</DialogTitle>
            <DialogDescription>请填写审批备注（可选），确认通过该课程审批。</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="请输入审批备注..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleApproveConfirm}>确认通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>驳回课程</DialogTitle>
            <DialogDescription>请填写驳回原因，创建人将收到修改通知。</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="请详细说明需要修改的内容..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={!comment.trim()}>
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
