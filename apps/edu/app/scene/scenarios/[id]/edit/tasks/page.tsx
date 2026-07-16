"use client"

import { ArrowLeft, ArrowUp, ArrowDown, GripVertical, Plus, Save, Trash2, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { scenarioApi, taskApi } from "@/lib/api"
import type { ScenarioTask } from "@/lib/types/scene"
import { useToast } from "@/hooks/use-toast"

const taskTypeOptions = [
  { value: "training", label: "训练任务" },
  { value: "assessment", label: "测评任务" },
]

function generateCode(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`
}

export default function ScenarioTasksPage() {
  const router = useRouter()
  const params = useParams()
  const scenarioId = params.id as string
  const { toast } = useToast()

  const [scenarioName, setScenarioName] = useState("")
  const [tasks, setTasks] = useState<ScenarioTask[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ScenarioTask | null>(null)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [taskType, setTaskType] = useState<"training" | "assessment">("training")
  const [difficulty, setDifficulty] = useState<number>(3)
  const [estimatedHours, setEstimatedHours] = useState<number>(1)
  const [description, setDescription] = useState("")
  const [background, setBackground] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const [scenarioRes, tasksRes] = await Promise.all([
        scenarioApi.get(scenarioId),
        taskApi.list({ scenarioId, limit: 1000 }),
      ])
      setScenarioName(scenarioRes.name)
      setTasks(tasksRes.items.sort((a, b) => a.sortOrder - b.sortOrder))
    } catch (err: any) {
      toast({ variant: "destructive", title: "加载失败", description: err.message || "无法获取任务数据" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [scenarioId])

  const resetForm = () => {
    setName("")
    setCode(generateCode("TK"))
    setTaskType("training")
    setDifficulty(3)
    setEstimatedHours(1)
    setDescription("")
    setBackground("")
    setEditingTask(null)
  }

  const openAdd = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEdit = (task: ScenarioTask) => {
    setEditingTask(task)
    setName(task.name)
    setCode(task.code)
    setTaskType(task.taskType)
    setDifficulty(task.difficulty)
    setEstimatedHours(task.estimatedHours)
    setDescription(task.description || "")
    setBackground(task.background || "")
    setIsDialogOpen(true)
  }

  const handleSaveTask = async () => {
    if (!name.trim() || !code.trim()) {
      toast({ variant: "destructive", title: "请填写完整", description: "任务名称和编码不能为空" })
      return
    }
    setSaving(true)
    try {
      const payload: Partial<ScenarioTask> = {
        name: name.trim(),
        code: code.trim(),
        taskType,
        difficulty,
        estimatedHours,
        description: description.trim() || undefined,
        background: background.trim() || undefined,
      }
      if (editingTask) {
        await taskApi.update(editingTask.id, payload)
      } else {
        await taskApi.create({
          ...payload,
          scenarioId,
          sortOrder: tasks.length + 1,
          dependencyIds: [],
          isReferenced: false,
        } as Omit<ScenarioTask, "id">)
      }
      await loadData()
      setIsDialogOpen(false)
      resetForm()
      toast({ title: editingTask ? "保存成功" : "添加成功" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "保存失败", description: err.message || "请稍后重试" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该任务吗？")) return
    try {
      await taskApi.delete(id)
      await loadData()
      toast({ title: "删除成功" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "删除失败", description: err.message || "请稍后重试" })
    }
  }

  const moveTask = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= tasks.length) return
    const newTasks = [...tasks]
    const [moved] = newTasks.splice(index, 1)
    newTasks.splice(newIndex, 0, moved)
    setTasks(newTasks)
    try {
      await taskApi.reorder(scenarioId, newTasks.map((t) => t.id))
      await loadData()
    } catch (err: any) {
      toast({ variant: "destructive", title: "排序失败", description: err.message || "请稍后重试" })
      await loadData()
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/scene/scenarios/${scenarioId}/edit`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回基础信息
            </Button>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">步骤 2</Badge>
              <span className="text-sm font-medium text-gray-800">任务链配置</span>
            </div>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            添加任务
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{scenarioName || "场景"} - 任务链</h1>
          <p className="text-sm text-gray-500 mt-1">配置场景下的任务列表与执行顺序</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">任务列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">加载中...</p>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>暂无任务，点击右上角添加</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{task.name}</p>
                        <p className="text-xs text-gray-500">
                          {task.code} · {taskTypeOptions.find((t) => t.value === task.taskType)?.label} · {task.estimatedHours} 课时
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => moveTask(index, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={index === tasks.length - 1} onClick={() => moveTask(index, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(task)}>
                        编辑
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>{editingTask ? "编辑任务" : "添加任务"}</DialogTitle>
            <DialogDescription>配置任务基础信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>任务名称</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入任务名称" />
              </div>
              <div className="grid gap-2">
                <Label>任务编码</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="任务编码" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>任务类型</Label>
                <Select value={taskType} onValueChange={(v) => setTaskType(v as "training" | "assessment")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypeOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>难度</Label>
                <Select value={String(difficulty)} onValueChange={(v) => setDifficulty(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} 星
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>预计课时</Label>
                <Input type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>任务说明</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid gap-2">
              <Label>任务背景</Label>
              <Textarea value={background} onChange={(e) => setBackground(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveTask} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
