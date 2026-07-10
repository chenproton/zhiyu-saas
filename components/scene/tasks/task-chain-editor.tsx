"use client"

import { ArrowDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TaskNode } from "./task-node"
import type { Task } from "@/lib/scene-mock-data"
import { useState } from "react"

interface TaskChainEditorProps {
  tasks: Task[]
  scenarioId: string
  onTaskAdd?: (task: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskReorder?: (tasks: Task[]) => void
}

export function TaskChainEditor({
  tasks,
  scenarioId,
  onTaskAdd,
  onTaskDelete,
}: TaskChainEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      onTaskAdd?.({
        name: newTaskName.trim(),
        description: newTaskDescription.trim(),
        order: tasks.length + 1,
        dependencies: [],
        resources: [],
        deliverables: [],
        assessment: null,
      })
      setNewTaskName("")
      setNewTaskDescription("")
      setIsAddDialogOpen(false)
    }
  }

  return (
    <div className="space-y-1">
      {/* Task list with connections */}
      {sortedTasks.length > 0 ? (
        <div className="space-y-1">
          {sortedTasks.map((task, index) => (
            <div key={task.id}>
              <TaskNode
                task={task}
                scenarioId={scenarioId}
                onDelete={() => onTaskDelete?.(task.id)}
              />
              {/* Connection line */}
              {index < sortedTasks.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-4 bg-gray-200" />
                    <ArrowDown className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-3">暂无任务节点</p>
          <p className="text-sm text-gray-400 mb-4">点击下方按钮添加第一个任务</p>
        </div>
      )}

      {/* Add task button */}
      <div className="pt-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-dashed text-gray-500 hover:text-primary hover:border-primary">
              <Plus className="mr-2 h-4 w-4" />
              添加任务节点
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>添加任务节点</DialogTitle>
              <DialogDescription>
                创建一个新的任务节点，稍后可以配置资源和测评内容。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="taskName">任务名称</Label>
                <Input
                  id="taskName"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="例如：需求分析与设计"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskDesc">任务描述</Label>
                <Textarea
                  id="taskDesc"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="简要描述该任务的目标和要求..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddTask} disabled={!newTaskName.trim()}>
                添加任务
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
