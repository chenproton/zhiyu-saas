"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

const identityTypes = [
  { id: 1, name: "教职工", code: "STAFF", description: "学校教职工人员", userCount: 256 },
  { id: 2, name: "学生", code: "STUDENT", description: "在校学生", userCount: 3500 },
  { id: 3, name: "企业人员", code: "ENTERPRISE", description: "合作企业人员", userCount: 128 },
  { id: 4, name: "系统管理员", code: "ADMIN", description: "系统管理人员", userCount: 5 },
]

export default function IdentityTypesPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [editingType, setEditingType] = useState<typeof identityTypes[0] | null>(null)
  const [searchText, setSearchText] = useState("")

  const handleAdd = () => {
    setEditingType(null)
    setShowDialog(true)
  }

  const handleEdit = (type: typeof identityTypes[0]) => {
    setEditingType(type)
    setShowDialog(true)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索身份类型..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          新增身份类型
        </Button>
      </div>

      <div className="bg-card rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">序号</TableHead>
              <TableHead>类型名称</TableHead>
              <TableHead>类型编码</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>关联用户数</TableHead>
              <TableHead className="w-32 text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {identityTypes.map((type, index) => (
              <TableRow key={type.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell className="text-muted-foreground">{type.code}</TableCell>
                <TableCell className="text-muted-foreground">{type.description}</TableCell>
                <TableCell>
                  <span className="text-primary">{type.userCount}</span> 人
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(type)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? "编辑身份类型" : "新增身份类型"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">类型名称</label>
              <Input placeholder="请输入类型名称" defaultValue={editingType?.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">类型编码</label>
              <Input placeholder="请输入类型编码" defaultValue={editingType?.code} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <Input placeholder="请输入描述" defaultValue={editingType?.description} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={() => setShowDialog(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
