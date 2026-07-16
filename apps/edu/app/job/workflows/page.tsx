'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Plus, Trash2, GripVertical, ArrowRight, GitBranch, Pencil, FolderKanban, Loader2 } from 'lucide-react'
import { ROLE_LABELS, type UserRole, type Workflow, type WorkflowStep } from '@/lib/types/job-source'
import { convertApiWorkflowToLocal, convertJobBatchToBatch } from '@/lib/stores/job-converters'
import { workflowApi, batchApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { Batch } from '@/lib/types/job-source'

export default function WorkflowsPage() {
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: [] as Omit<WorkflowStep, 'id'>[],
  })
  const [newStep, setNewStep] = useState({
    name: '',
    role: '' as UserRole | '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [wfRes, batchRes] = await Promise.all([
        workflowApi.list({ limit: 1000 }),
        batchApi.list({ limit: 1000 }),
      ])
      setWorkflows(wfRes.items.map(convertApiWorkflowToLocal))
      setBatches(batchRes.items.map(convertJobBatchToBatch))
    } catch (err: any) {
      toast({ variant: 'destructive', title: '加载失败', description: err?.message || '请稍后重试' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const resetForm = () => {
    setFormData({ name: '', description: '', steps: [] })
    setNewStep({ name: '', role: '' })
  }

  const handleAddStep = () => {
    if (!newStep.name || !newStep.role) return
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          name: newStep.name,
          role: newStep.role as UserRole,
          order: formData.steps.length + 1,
        },
      ],
    })
    setNewStep({ name: '', role: '' })
  }

  const handleRemoveStep = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      steps: newSteps.map((step, i) => ({ ...step, order: i + 1 })),
    })
  }

  const handleCreate = async () => {
    if (!formData.name || formData.steps.length === 0) return
    try {
      await workflowApi.create({
        name: formData.name,
        description: formData.description || undefined,
        steps: formData.steps.map((step) => ({
          name: step.name,
          reviewerType: step.role,
        })) as any,
        status: 'active',
      } as any)
      await loadData()
      setIsCreateOpen(false)
      resetForm()
    } catch (err: any) {
      toast({ variant: 'destructive', title: '创建失败', description: err?.message || '请稍后重试' })
    }
  }

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow)
    setFormData({
      name: workflow.name,
      description: workflow.description,
      steps: workflow.steps.map(({ name, role, order }) => ({ name, role, order })),
    })
  }

  const handleUpdate = async () => {
    if (!editingWorkflow) return
    try {
      await workflowApi.update(editingWorkflow.id, {
        name: formData.name,
        description: formData.description,
        steps: formData.steps.map((step) => ({
          name: step.name,
          reviewerType: step.role,
        })) as any,
        status: 'active',
      })
      await loadData()
      setEditingWorkflow(null)
      resetForm()
    } catch (err: any) {
      toast({ variant: 'destructive', title: '更新失败', description: err?.message || '请稍后重试' })
    }
  }

  const handleDelete = async (workflowId: string) => {
    if (!confirm('确定要删除这个审批流程吗？')) return
    try {
      await workflowApi.delete(workflowId)
      await loadData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: '删除失败', description: err?.message || '请稍后重试' })
    }
  }

  const getRelatedBatches = (workflowId: string) => {
    return batches.filter(b => b.workflowId === workflowId)
  }

  const WorkflowForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel>流程名称</FieldLabel>
        <Input
          placeholder="例如：标准审批流程"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel>流程说明</FieldLabel>
        <Textarea
          placeholder="描述这个流程的用途..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Field>

      <div className="space-y-3">
        <FieldLabel>审批步骤</FieldLabel>
        {formData.steps.length > 0 && (
          <div className="space-y-2">
            {formData.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="shrink-0">
                  第 {index + 1} 步
                </Badge>
                <span className="flex-1 font-medium">{step.name}</span>
                <Badge>{ROLE_LABELS[step.role]}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleRemoveStep(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="步骤名称"
            value={newStep.name}
            onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
            className="flex-1"
          />
          <Select
            value={newStep.role}
            onValueChange={(value) => setNewStep({ ...newStep, role: value as UserRole })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reviewer">审批者</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={handleAddStep}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            if (isEdit) setEditingWorkflow(null)
            else setIsCreateOpen(false)
            resetForm()
          }}
        >
          取消
        </Button>
        <Button onClick={isEdit ? handleUpdate : handleCreate}>
          {isEdit ? '保存' : '创建'}
        </Button>
      </DialogFooter>
    </FieldGroup>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">审批流程管理</h1>
          <p className="text-muted-foreground mt-1">配置岗位审批的流程和步骤</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建流程
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建审批流程</DialogTitle>
              <DialogDescription>创建一个新的审批流程模板</DialogDescription>
            </DialogHeader>
            <WorkflowForm />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => {
            const relatedBatches = getRelatedBatches(workflow.id)
            return (
              <Card key={workflow.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <GitBranch className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(workflow)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(workflow.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">审批步骤</p>
                    <div className="flex items-center flex-wrap gap-2">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                            <span className="text-sm font-medium">{step.name}</span>
                          </div>
                          {index < workflow.steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      <FolderKanban className="inline h-3.5 w-3.5 mr-1" />
                      关联批次 ({relatedBatches.length})
                    </p>
                    {relatedBatches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">暂无关联批次</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {relatedBatches.map((batch) => (
                          <Badge key={batch.id} variant="secondary" className="text-xs">
                            {batch.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!loading && workflows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">暂无审批流程，点击上方按钮创建</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editingWorkflow} onOpenChange={(open) => !open && setEditingWorkflow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑审批流程</DialogTitle>
            <DialogDescription>修改审批流程配置</DialogDescription>
          </DialogHeader>
          <WorkflowForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  )
}
