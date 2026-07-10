"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Copy, Eye } from "lucide-react"

interface ApprovalFlow {
  id: string
  name: string
  scene: string
  usageCount: number
  createdAt: string
  status: "active" | "inactive"
}

const mockFlows: ApprovalFlow[] = [
  { id: "1", name: "请假审批流程", scene: "人事管理", usageCount: 156, createdAt: "2024-01-15", status: "active" },
  { id: "2", name: "报销审批流程", scene: "财务管理", usageCount: 89, createdAt: "2024-02-20", status: "active" },
  { id: "3", name: "课程发布审批", scene: "教学管理", usageCount: 45, createdAt: "2024-03-10", status: "active" },
  { id: "4", name: "资源上传审批", scene: "资源管理", usageCount: 234, createdAt: "2024-04-05", status: "active" },
  { id: "5", name: "用户注册审批", scene: "用户管理", usageCount: 12, createdAt: "2024-05-12", status: "inactive" },
]

const scenes = ["人事管理", "财务管理", "教学管理", "资源管理", "用户管理", "系统设置"]

export default function ApprovalPage() {
  const [flows, setFlows] = useState<ApprovalFlow[]>(mockFlows)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState<ApprovalFlow | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFlows = flows.filter((flow) =>
    flow.name.includes(searchTerm) || flow.scene.includes(searchTerm)
  )

  const deleteFlow = (id: string) => {
    setFlows((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">审批流程管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">创建和管理审批流程，用于各功能模块的审批配置</p>
        </div>
        <Button size="sm" onClick={() => { setSelectedFlow(null); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" />
          新增流程
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索流程名称或场景..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

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
            {filteredFlows.map((flow) => (
              <TableRow key={flow.id} className="border-border">
                <TableCell className="font-medium">{flow.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{flow.scene}</Badge>
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
                        <Eye className="mr-2 h-4 w-4" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedFlow(flow); setIsDialogOpen(true) }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        复制
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteFlow(flow.id)} className="text-destructive">
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
              <Input placeholder="如：请假审批流程" defaultValue={selectedFlow?.name} />
            </div>
            <div className="grid gap-2">
              <Label>所属场景</Label>
              <Select defaultValue={selectedFlow?.scene}>
                <SelectTrigger><SelectValue placeholder="选择场景" /></SelectTrigger>
                <SelectContent>
                  {scenes.map((scene) => (
                    <SelectItem key={scene} value={scene}>{scene}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">审批流程配置区域</p>
              <p className="text-xs text-muted-foreground mt-1">（拖拽添加审批节点、配置审批人）</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsDialogOpen(false)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
