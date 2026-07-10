"use client"

import { FolderKanban, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { batches, approvalWorkflows } from "@/lib/mock-data-lesson"
import type { Batch } from "@/lib/mock-data-lesson"

export default function BatchesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [localBatches, setLocalBatches] = useState<Batch[]>(batches)
  const [newBatchName, setNewBatchName] = useState("")
  const [newBatchWorkflow, setNewBatchWorkflow] = useState("")

  const handleAddBatch = () => {
    if (!newBatchName || !newBatchWorkflow) return
    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      name: newBatchName,
      code: Array.from({ length: 6 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join(""),
      departmentId: "",
      departmentName: "",
      workflowId: newBatchWorkflow,
      workflowName: approvalWorkflows.find((w) => w.id === newBatchWorkflow)?.name || "",
      scenarioCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setLocalBatches((prev) => [...prev, newBatch])
    setNewBatchName("")
    setNewBatchWorkflow("")
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">批次分组管理</h1>
            <p className="text-muted-foreground mt-1">管理课程建设批次分组，关联审批流程</p>
          </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增批次
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <div>
                  <DialogTitle>新增批次</DialogTitle>
                  <DialogDescription>
                    创建新的课程建设批次分组，并关联审批流程。
                  </DialogDescription>
                </div>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="batchName">分组名称</Label>
                <Input
                  id="batchName"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="例如：2026春季电商实训场景开发"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batchCode">批次编号</Label>
                <Input
                  id="batchCode"
                  value={`BG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500">批次编号自动生成，不可修改</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workflow">关联审批流 <span className="text-red-500">*</span></Label>
                <Select value={newBatchWorkflow} onValueChange={setNewBatchWorkflow}>
                  <SelectTrigger id="workflow">
                    <SelectValue placeholder="选择审批流程" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvalWorkflows.map((wf) => (
                      <SelectItem key={wf.id} value={wf.id}>
                        <span className="inline-flex items-center">
                          <span>{wf.name}</span>
                          <span className="text-xs text-gray-400 ml-2">({wf.steps.length}步)</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  批次内所有场景将强制使用相同的审批流程
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddBatch} disabled={!newBatchName || !newBatchWorkflow}>
                创建批次
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Batches table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            批次列表
          </CardTitle>
          <CardDescription>共 {localBatches.length} 个批次分组</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-medium text-slate-500">分组名称</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">批次编号</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">审批流程</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">体系课数</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{batch.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {batch.workflowName || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{batch.scenarioCount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
