"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, MoreHorizontal, Pencil, Power, Trash2, Search, Upload, Download, Eye } from "lucide-react"

interface Position {
  id: string
  name: string
  userCount: number
  status: "active" | "inactive"
  createdAt: string
}

const mockPositions: Position[] = [
  { id: "1", name: "系主任", userCount: 8, status: "active", createdAt: "2024-01-01" },
  { id: "2", name: "教授", userCount: 45, status: "active", createdAt: "2024-01-01" },
  { id: "3", name: "副教授", userCount: 78, status: "active", createdAt: "2024-01-01" },
  { id: "4", name: "讲师", userCount: 120, status: "active", createdAt: "2024-01-01" },
  { id: "5", name: "企业导师", userCount: 35, status: "active", createdAt: "2024-02-15" },
  { id: "6", name: "辅导员", userCount: 25, status: "active", createdAt: "2024-03-01" },
  { id: "7", name: "班主任", userCount: 60, status: "active", createdAt: "2024-03-01" },
  { id: "8", name: "实验员", userCount: 15, status: "inactive", createdAt: "2024-04-01" },
]

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>(mockPositions)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPositions = positions.filter((pos) => pos.name.includes(searchTerm))

  const toggleStatus = (id: string) => {
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p)))
  }

  const deletePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">职位管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理系统职位信息</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            导入
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
          <Button size="sm" onClick={() => { setSelectedPosition(null); setIsDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-1" />
            新增职位
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索职位名称..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>职位名称</TableHead>
              <TableHead>关联用户数量</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPositions.map((position) => (
              <TableRow key={position.id} className="border-border">
                <TableCell className="font-medium">{position.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{position.userCount} 人</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={position.status === "active" ? "default" : "secondary"}>
                    {position.status === "active" ? "启用" : "停用"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{position.createdAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedPosition(position); setIsDialogOpen(true) }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedPosition(position); setIsUsersDialogOpen(true) }}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看用户
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(position.id)}>
                        <Power className="mr-2 h-4 w-4" />
                        {position.status === "active" ? "停用" : "启用"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deletePosition(position.id)} className="text-destructive">
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

      <div className="mt-4 text-sm text-muted-foreground">共 {filteredPositions.length} 条记录</div>

      {/* 新增/编辑职位 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPosition ? "编辑职位" : "新增职位"}</DialogTitle>
            <DialogDescription>职位用于用户身份标识</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>职位名称</Label>
              <Input placeholder="如：教授" defaultValue={selectedPosition?.name} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsDialogOpen(false)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看关联用户 */}
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>关联用户 - {selectedPosition?.name}</DialogTitle>
            <DialogDescription>共 {selectedPosition?.userCount} 名用户关联此职位</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {["张三", "李四", "王五", "赵六", "钱七"].slice(0, Math.min(5, selectedPosition?.userCount || 0)).map((name, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {name[0]}
                    </div>
                    <span className="text-sm">{name}</span>
                  </div>
                  <Badge variant="outline">T00{i + 1}</Badge>
                </div>
              ))}
              {(selectedPosition?.userCount || 0) > 5 && (
                <p className="text-center text-sm text-muted-foreground">... 还有 {(selectedPosition?.userCount || 0) - 5} 名用户</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUsersDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
