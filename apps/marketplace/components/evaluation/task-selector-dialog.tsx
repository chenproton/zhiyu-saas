// @ts-nocheck
'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Search } from 'lucide-react'
import { type RelatedTask } from '@/lib/types'
import { taskApi } from '@/lib/api'

interface TaskSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingTaskIds: string[]
  onConfirm: (tasks: RelatedTask[]) => void
}

export function TaskSelectorDialog({
  open,
  onOpenChange,
  existingTaskIds,
  onConfirm,
}: TaskSelectorDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [tasks, setTasks] = useState<RelatedTask[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    taskApi.list({ limit: 1000 })
      .then((res) => {
        if (cancelled) return
        setTasks(res.items.map((t) => ({
          id: t.id,
          name: t.name,
          maxScore: 100,
          weight: 0,
        })))
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load tasks', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [open])

  // 过滤掉已经关联的任务
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => !existingTaskIds.includes(task.id))
      .filter((task) =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
  }, [tasks, existingTaskIds, searchQuery])

  const handleToggle = (taskId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedIds(newSelected)
  }

  const handleConfirm = () => {
    const selectedTasks = tasks
      .filter((task) => selectedIds.has(task.id))
      .map((task) => ({ ...task, weight: 0 }))

    onConfirm(selectedTasks)
    setSelectedIds(new Set())
    setSearchQuery('')
    onOpenChange(false)
  }

  const handleClose = () => {
    setSelectedIds(new Set())
    setSearchQuery('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" annotationContext="task-selector" annotationContainerRef={scrollRef}>
        <DialogHeader>
          <DialogTitle>选择关联任务</DialogTitle>
          <DialogDescription>
            选择要关联的任务，确认后权重将平均分配
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索任务名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div ref={scrollRef} className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                加载任务中...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                暂无可关联的任务
              </div>
            ) : (
              filteredTasks.map((task) => (
                <label
                  key={task.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedIds.has(task.id)}
                    onCheckedChange={() => handleToggle(task.id)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{task.name}</div>
                    <div className="text-xs text-muted-foreground">
                      满分: {task.maxScore}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            已选择 {selectedIds.size} 个任务
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
            确认添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
