"use client"

import { GitBranch, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { approvalWorkflows as initialWorkflows } from "@/lib/scene-mock-data"
import type { ApprovalWorkflow, ApprovalStep } from "@/lib/scene-mock-data"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(initialWorkflows)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflow | null>(null)

  const [workflowName, setWorkflowName] = useState("")
  const [description, setDescription] = useState("")
  const [steps, setSteps] = useState<ApprovalStep[]>([
    { id: "step-1", order: 1, name: "", approverRole: "" },
  ])

  const resetForm = () => {
    setWorkflowName("")
    setDescription("")
    setSteps([{ id: "step-1", order: 1, name: "", approverRole: "" }])
  }

  const openEditDialog = (workflow: ApprovalWorkflow) => {
    setEditingWorkflow(workflow)
    setWorkflowName(workflow.name)
    setDescription(workflow.description)
    setSteps(workflow.steps.map((s) => ({ ...s })))
    setIsEditDialogOpen(true)
  }

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: `step-${Date.now()}`, order: prev.length + 1, name: "", approverRole: "" },
    ])
  }

  const handleRemoveStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i + 1 }))
    )
  }

  const handleStepChange = (index: number, field: keyof ApprovalStep, value: string) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const handleCreate = () => {
    if (!workflowName.trim()) return
    const newWorkflow: ApprovalWorkflow = {
      id: `wf-${Date.now()}`,
      name: workflowName.trim(),
      description: description.trim(),
      steps: steps.filter((s) => s.name.trim() && s.approverRole.trim()),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setWorkflows((prev) => [...prev, newWorkflow])
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleUpdate = () => {
    if (!editingWorkflow || !workflowName.trim()) return
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === editingWorkflow.id
          ? {
              ...w,
              name: workflowName.trim(),
              description: description.trim(),
              steps: steps.filter((s) => s.name.trim() && s.approverRole.trim()),
            }
          : w
      )
    )
    setIsEditDialogOpen(false)
    setEditingWorkflow(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id))
  }

  const renderForm = (isEdit: boolean) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="workflowName">流程名称</Label>
        <Input
          id="workflowName"
          placeholder="例如：教研组长审批"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">流程说明</Label>
        <Textarea
          id="description"
          placeholder="描述该流程的适用场景和审批规则..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label>审批步骤</Label>
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center shrink-0">
                {step.order}
              </Badge>
              <Input
                placeholder="步骤名称"
                className="flex-1"
                value={step.name}
                onChange={(e) => handleStepChange(index, "name", e.target.value)}
              />
              <Input
                placeholder="审批角色"
                className="w-32"
                value={step.approverRole}
                onChange={(e) => handleStepChange(index, "approverRole", e.target.value)}
              />
              {steps.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleRemoveStep(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={handleAddStep}>
            <Plus className="mr-2 h-4 w-4" />
            添加步骤
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PrdAnnotation data={getAnnotation("workflows-title")}>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">审批流程管理</h1>
            <p className="text-sm text-gray-500 mt-1">预设校内审批流模板，供批次关联使用</p>
          </div>
        </PrdAnnotation>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { if (open) resetForm(); setIsCreateDialogOpen(open) }}>
          <PrdAnnotation data={getAnnotation("workflows-create")}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增审批流程
              </Button>
            </DialogTrigger>
          </PrdAnnotation>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <PrdAnnotation data={getAnnotation("dialog-workflow-form")}>
                <div>
                  <DialogTitle>新增审批流程</DialogTitle>
                  <DialogDescription>
                    创建新的审批流程模板，定义审批步骤和角色。
                  </DialogDescription>
                </div>
              </PrdAnnotation>
            </DialogHeader>
            {renderForm(false)}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreate}>创建流程</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <PrdAnnotation data={getAnnotation("dialog-workflow-form")}>
              <div>
                <DialogTitle>编辑审批流程</DialogTitle>
                <DialogDescription>
                  修改审批流程的名称、说明和审批步骤。
                </DialogDescription>
              </div>
            </PrdAnnotation>
          </DialogHeader>
          {renderForm(true)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdate}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            审批流程列表
          </CardTitle>
          <CardDescription>共 {workflows.length} 个审批流程</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-medium text-slate-500">流程名称</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">流程描述</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">审批步骤</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500">创建时间</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">{workflow.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{workflow.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {workflow.steps.map((step) => (
                          <Badge key={step.id} variant="outline" className="text-xs">
                            {step.order}.{step.name}({step.approverRole})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{workflow.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(workflow)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => handleDelete(workflow.id)}
                          >
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
