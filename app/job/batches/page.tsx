'use client'

import { useState } from 'react'
import { useData } from '@/lib/stores/data-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/job/status-badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Plus, Search, Pencil, Trash2, FolderOpen, GitBranch } from 'lucide-react'
import Link from 'next/link'
import type { Batch } from '@/lib/types/job-source'

export default function BatchesPage() {
  const { batches, workflows, addBatch, updateBatch, deleteBatch } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    major: '',
    workflowId: '',
  })

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.major.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const resetForm = () => {
    setFormData({ name: '', department: '', major: '', workflowId: '' })
    setEditingBatch(null)
  }

  const handleCreate = () => {
    if (!formData.name || !formData.department || !formData.major || !formData.workflowId) return

    addBatch({
      name: formData.name,
      department: formData.department,
      major: formData.major,
      workflowId: formData.workflowId,
      status: 'open',
      positionCount: 0,
      publishedCount: 0,
      pendingCount: 0,
    })
    setIsCreateOpen(false)
    resetForm()
  }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setFormData({
      name: batch.name,
      department: batch.department,
      major: batch.major,
      workflowId: batch.workflowId,
    })
  }

  const handleUpdate = () => {
    if (!editingBatch) return
    updateBatch(editingBatch.id, {
      name: formData.name,
      department: formData.department,
      major: formData.major,
      workflowId: formData.workflowId,
    })
    setEditingBatch(null)
    resetForm()
  }

  const handleToggleStatus = (batch: Batch) => {
    updateBatch(batch.id, {
      status: batch.status === 'open' ? 'closed' : 'open',
    })
  }

  const handleDelete = (batchId: string) => {
    if (confirm('确定要删除这个批次吗？')) {
      deleteBatch(batchId)
    }
  }

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    return workflow?.name || '-'
  }

  const BatchForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel>批次名称</FieldLabel>
        <Input
          placeholder="例如：2024年春季岗位建设批次"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel>所属院系</FieldLabel>
        <Input
          placeholder="例如：计算机学院"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel>专业方向</FieldLabel>
        <Input
          placeholder="例如：软件工程"
          value={formData.major}
          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel>审批流程</FieldLabel>
        <Select
          value={formData.workflowId}
          onValueChange={(value) => setFormData({ ...formData, workflowId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择审批流程" />
          </SelectTrigger>
          <SelectContent>
            {workflows.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id}>
                {workflow.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <DialogFooter>
        <Button variant="outline" onClick={() => {
          if (isEdit) setEditingBatch(null)
          else setIsCreateOpen(false)
          resetForm()
        }}>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">批次管理</h1>
          <p className="text-muted-foreground mt-1">管理岗位建设批次，设置审批流程</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建批次
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建批次</DialogTitle>
              <DialogDescription>创建一个新的岗位建设批次</DialogDescription>
            </DialogHeader>
            <BatchForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索批次名称、院系、专业..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="open">开放中</SelectItem>
                <SelectItem value="closed">已截止</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>批次列表</CardTitle>
          <CardDescription>共 {filteredBatches.length} 个批次</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>批次名称</TableHead>
                <TableHead>院系</TableHead>
                <TableHead>专业</TableHead>
                <TableHead>关联审批流程</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>岗位数</TableHead>
                <TableHead>已上架</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FolderOpen className="h-10 w-10 mb-2" />
                      <p>暂无批次数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((batch) => (
                  <TableRow key={batch.id} className="group">
                    <TableCell>
                      <Link
                        href={`/job/batches/${batch.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {batch.name}
                      </Link>
                    </TableCell>
                    <TableCell>{batch.department}</TableCell>
                    <TableCell>{batch.major}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <GitBranch className="h-3 w-3" />
                        {getWorkflowName(batch.workflowId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={batch.status} type="batch" />
                    </TableCell>
                    <TableCell>{batch.positionCount}</TableCell>
                    <TableCell>{batch.publishedCount}</TableCell>
                    <TableCell className="text-right relative">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm z-10 px-2 py-1 rounded-lg shadow-sm border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleEdit(batch)}
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleToggleStatus(batch)}
                        >
                          {batch.status === 'open' ? '截止批次' : '重新开放'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive"
                          onClick={() => handleDelete(batch.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingBatch} onOpenChange={(open) => !open && setEditingBatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑批次</DialogTitle>
            <DialogDescription>修改批次信息</DialogDescription>
          </DialogHeader>
          <BatchForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  )
}
