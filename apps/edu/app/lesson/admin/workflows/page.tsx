"use client"

import { GitBranch, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
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
import { workflowApi } from "@/lib/api"
import type { Workflow, WorkflowStep } from "@/lib/types/backend"
import { useToast } from "@/hooks/use-toast"

export default function WorkflowsPage() {
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)

  const [workflowName, setWorkflowName] = useState("")
  const [description, setDescription] = useState("")
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: "step-1", name: "", reviewerType: "" },
  ])

  const loadWorkflows = async () => {
    setLoading(true)
    try {
      const res = await workflowApi.list({ limit: 1000 })
      setWorkflows(res.items)
    } catch (err: any) {
      toast({ variant: "destructive", title: "加载失败", description: err.message || "无法获取审批流程" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()
  }, [])

  const resetForm = () => {
    setWorkflowName("")
    setDescription("")
    setSteps([{ id: "step-1", name: "", reviewerType: "" }])
    setEditingWorkflow(null)
  }

  const openEditDialog = (workflow: Workflow) => {
    setEditingWorkflow(workflow)
    setWorkflowName(workflow.name)
    setDescription(workflow.description || "")
    setSteps(
      workflow.steps.length > 0
        ? workflow.steps.map((s, i) => ({
            id: s.id || `step-${i}`,
            name: s.name || "",
            reviewerType: s.reviewerType || "",
          }))
        : [{ id: "step-1", name: "", reviewerType: "" }]
    )
    setIsEditDialogOpen(true)
  }

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: `step-${Date.now()}`, name: "", reviewerType: "" },
    ])
  }

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStepChange = (index: number, field: keyof WorkflowStep, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  const buildSteps = () =>
    steps
      .filter((s) => s.name.trim() && (s.reviewerType || "").trim())
      .map((s, index) => ({
        id: s.id || `step-${index}`,
        name: s.name.trim(),
        reviewerType: s.reviewerType?.trim(),
      }))

  const handleCreate = async () => {
    if (!workflowName.trim()) return
    try {
      await workflowApi.create({
        name: workflowName.trim(),
        description: description.trim() || undefined,
        steps: buildSteps(),
        scene: "lesson",
        status: "active",
      })
      await loadWorkflows()
      setIsCreateDialogOpen(false)
      resetForm()
      toast({ title: "创建成功" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "创建失败", description: err.message || "请稍后重试" })
    }
  }

  const handleUpdate = async () => {
    if (!editingWorkflow || !workflowName.trim()) return
    try {
      await workflowApi.update(editingWorkflow.id, {
        name: workflowName.trim(),
        description: description.trim() || undefined,
        steps: buildSteps(),
        scene: "lesson",
        status: "active",
      })
      await loadWorkflows()
      setIsEditDialogOpen(false)
      resetForm()
      toast({ title: "保存成功" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "保存失败", description: err.message || "请稍后重试" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该审批流程吗？")) return
    try {
      await workflowApi.delete(id)
      await loadWorkflows()
      toast({ title: "删除成功" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "删除失败", description: err.message || "请稍后重试" })
    }
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
            <div key={step.id || index} className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center shrink-0">
                {index + 1}
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
                value={step.reviewerType || ""}
                onChange={(e) => handleStepChange(index, "reviewerType", e.target.value)}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">审批流程管理</h1>
          <p className="text-sm text-gray-500 mt-1">预设校内审批流模板，供批次关联使用</p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            if (open) resetForm()
            setIsCreateDialogOpen(open)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增审批流程
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>新增体系课审批流程</DialogTitle>
              <DialogDescription>创建新的审批流程模板，定义审批步骤和角色。</DialogDescription>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑审批流程</DialogTitle>
            <DialogDescription>修改审批流程的名称、说明和审批步骤。</DialogDescription>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : workflows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      暂无审批流程
                    </TableCell>
                  </TableRow>
                ) : (
                  workflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium">{workflow.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{workflow.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {workflow.steps.map((step, idx) => (
                            <Badge key={step.id || idx} variant="outline" className="text-xs">
                              {idx + 1}.{step.name}({step.reviewerType || "-"})
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(workflow)}>
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(workflow.id)}
                            >
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
