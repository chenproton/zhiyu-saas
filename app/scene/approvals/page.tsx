"use client"

import { Check, CheckSquare, Eye, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
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
import { approvalItems } from "@/lib/scene-mock-data"
import type { ApprovalItem } from "@/lib/scene-mock-data"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

const statusConfig = {
  pending: { label: "待审批", className: "bg-yellow-50 text-yellow-600" },
  approved: { label: "已通过", className: "bg-green-50 text-green-600" },
  rejected: { label: "已驳回", className: "bg-red-50 text-red-500" },
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>(approvalItems)
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [comment, setComment] = useState("")

  const pendingItems = items.filter((a) => a.status === "pending")
  const processedItems = items.filter((a) => a.status !== "pending")

  const handleApproveClick = (item: ApprovalItem) => {
    setSelectedItem(item)
    setComment("")
    setIsApproveDialogOpen(true)
  }

  const handleApproveConfirm = () => {
    if (!selectedItem) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, status: "approved" as const, comments: comment || "审批通过。" }
          : item
      )
    )
    setIsApproveDialogOpen(false)
    setComment("")
    setSelectedItem(null)
  }

  const handleRejectClick = (item: ApprovalItem) => {
    setSelectedItem(item)
    setComment("")
    setIsRejectDialogOpen(true)
  }

  const handleRejectConfirm = () => {
    if (!selectedItem) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, status: "rejected" as const, comments: comment, rejectReason: comment }
          : item
      )
    )
    setIsRejectDialogOpen(false)
    setComment("")
    setSelectedItem(null)
  }

  const renderTable = (data: ApprovalItem[]) => (
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
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">场景名称</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">场景编码</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 text-center whitespace-nowrap">版本</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">所属岗位</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">所属批次分组</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">创建人</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 whitespace-nowrap">提交审批日期</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 text-center whitespace-nowrap">状态</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium whitespace-nowrap">{item.scenarioName}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.scenarioCode}</TableCell>
                    <TableCell className="text-center text-sm text-gray-600 whitespace-nowrap">{item.version}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.positionName || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.batchName}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.submitterName}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.submittedAt}</TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Badge variant="secondary" className={statusConfig[item.status].className}>
                        {statusConfig[item.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap sticky right-0 bg-white z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-end gap-2">
                        <PrdAnnotation data={getAnnotation("approvals-action-view")}>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/scenarios/${item.scenarioId}/edit`}>
                              <Eye className="mr-1 h-3 w-3" />
                              查看
                            </Link>
                          </Button>
                        </PrdAnnotation>
                        {item.status === "pending" && (
                          <>
                            <PrdAnnotation data={getAnnotation("approvals-action-reject")}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleRejectClick(item)}
                              >
                                <X className="mr-1 h-3 w-3" />
                                驳回
                              </Button>
                            </PrdAnnotation>
                            <PrdAnnotation data={getAnnotation("approvals-action-pass")}>
                              <Button size="sm" onClick={() => handleApproveClick(item)}>
                                <Check className="mr-1 h-3 w-3" />
                                通过
                              </Button>
                            </PrdAnnotation>
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
      {/* Header */}
      <PrdAnnotation data={getAnnotation("approvals-title")}>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">资源审批管理</h1>
          <p className="text-sm text-gray-500 mt-1">审核场景提交申请，管理审批流程</p>
        </div>
      </PrdAnnotation>

      <Tabs defaultValue="pending">
        <TabsList>
          <PrdAnnotation data={getAnnotation("approvals-tab-pending")} className="flex-1">
            <TabsTrigger value="pending" className="gap-2 w-full">
              待审批
              {pendingItems.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-yellow-100 text-yellow-700">
                  {pendingItems.length}
                </Badge>
              )}
            </TabsTrigger>
          </PrdAnnotation>
          <PrdAnnotation data={getAnnotation("approvals-tab-approved")} className="flex-1">
            <TabsTrigger value="processed" className="w-full">已审批</TabsTrigger>
          </PrdAnnotation>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingItems.length > 0 ? (
            renderTable(pendingItems)
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">暂无待审批项</h3>
                <p className="text-sm text-gray-500 mt-1">所有提交的场景都已处理完毕</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="processed" className="mt-6">
          {processedItems.length > 0 ? (
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

      {/* Approve dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-approve-confirm")}>
              <div>
                <DialogTitle>通过审批</DialogTitle>
                <DialogDescription>
                  请填写审批备注（可选），确认通过该场景审批。
                </DialogDescription>
              </div>
            </PrdAnnotation>
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
            <Button onClick={handleApproveConfirm}>
              确认通过
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-reject-confirm")}>
              <div>
                <DialogTitle>驳回场景</DialogTitle>
                <DialogDescription>
                  请填写驳回原因，建设者将收到修改通知。
                </DialogDescription>
              </div>
            </PrdAnnotation>
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
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!comment.trim()}
            >
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
