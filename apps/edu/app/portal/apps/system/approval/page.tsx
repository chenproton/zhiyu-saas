"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Copy, Eye, Loader2, AlertCircle } from "lucide-react"
import { usePortalAuth } from "@/contexts/portal-auth-context"
import { portalWorkflowApi } from "@/lib/api"
import type { Workflow } from "@/lib/types/backend"
import { useToast } from "@/hooks/use-toast"

const scenes = ["人事管理", "财务管理", "教学管理", "资源管理", "用户管理", "系统设置"]

export default function ApprovalPage() {
  const { tenantId } = usePortalAuth()
  const { toast } = useToast()

  const [flows, setFlows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState<Workflow | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formName, setFormName] = useState("")
  const [formScene, setFormScene] = useState("")
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active")
  const [saving, setSaving] = useState(false)

  const loadFlows = async () => {
    if (!tenantId) return
    setLoading(true)
    setError(null)
    try {
      const res = await portalWorkflowApi.list({ tenantId, limit: 1000 })
      setFlows(res.items)
    } catch (err: any) {
      setError(err?.message || "加载审批流程失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFlows()
  }, [tenantId])

  const openCreate = () => {
    setSelectedFlow(null)
    setFormName("")
    setFormScene("")
    setFormStatus("active")
    setIsDialogOpen(true)
  }

  const openEdit = (flow: Workflow) => {
    setSelectedFlow(flow)
    setFormName(flow.name)
    setFormScene(flow.scene || "")
    setFormStatus(flow.status)
    setIsDialogOpen(true)
  }

  const saveFlow = async () => {
    if (!formName.trim()) {
      toast({ variant: "destructive", title: "保存失败", description: "请填写审批流名称" })
      return
    }
    setSaving(true)
    try {
      if (selectedFlow) {
        await portalWorkflowApi.update(selectedFlow.id, {
          name: formName.trim(),
          scene: formScene || undefined,
          status: formStatus,
          steps: selectedFlow.steps,
        })
        toast({ title: "保存成功" })
      } else {
        await portalWorkflowApi.create({
          name: formName.trim(),
          scene: formScene || undefined,
          status: formStatus,
          steps: [],
        })
        toast({ title: "创建成功" })
      }
      setIsDialogOpen(false)
      await loadFlows()
    } catch (err: any) {
      toast({ title: "保存失败", description: err?.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const deleteFlow = async (id: string) => {
    if (!confirm("确定删除该审批流程吗？")) return
    try {
      await portalWorkflowApi.delete(id)
      toast({ title: "删除成功" })
      await loadFlows()
    } catch (err: any) {
      toast({ title: "删除失败", description: err?.message, variant: "destructive" })
    }
  }

  const filteredFlows = flows.filter((flow) =>
    flow.name.includes(searchTerm) || (flow.scene && flow.scene.includes(searchTerm))
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">审批流程管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">创建和管理审批流程，用于各功能模块的审批配置</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          新增流程
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索流程名称或场景..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription className="flex items-center gap-4">
            {error}
            <Button variant="outline" size="sm" onClick={loadFlows}>重试</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>流程名称</TableHead>
              <TableHead>所属场景</TableHead>
              <TableHead>使用次数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  <span className="mt-2 block text-sm">加载中...</span>
                </TableCell>
              </TableRow>
            ) : filteredFlows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  暂无审批流程
                </TableCell>
              </TableRow>
            ) : (
              filteredFlows.map((flow) => (
                <TableRow key={flow.id} className="border-border">
                  <TableCell className="font-medium">{flow.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{flow.scene || "-"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{flow.usageCount} 次</TableCell>
                  <TableCell className="text-muted-foreground">{flow.createdAt}</TableCell>
                  <TableCell>
                    <Badge variant={flow.status === "active" ? "default" : "secondary"}>
                      {flow.status === "active" ? "启用" : "停用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(flow)}>
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          复制
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteFlow(flow.id)} className="text-destructive">
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

      <div className="mt-4 text-sm text-muted-foreground">共 {filteredFlows.length} 条记录</div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedFlow ? "编辑流程" : "新增流程"}</DialogTitle>
            <DialogDescription>配置审批流程基本信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>流程名称</Label>
              <Input
                placeholder="如：请假审批流程"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>所属场景</Label>
              <Select value={formScene} onValueChange={setFormScene}>
                <SelectTrigger><SelectValue placeholder="选择场景" /></SelectTrigger>
                <SelectContent>
                  {scenes.map((scene) => (
                    <SelectItem key={scene} value={scene}>{scene}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>状态</Label>
              <Select value={formStatus} onValueChange={(v) => setFormStatus(v as "active" | "inactive")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">审批流程配置区域</p>
              <p className="text-xs text-muted-foreground mt-1">（拖拽添加审批节点、配置审批人）</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>取消</Button>
            <Button onClick={saveFlow} disabled={saving || !formName.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
