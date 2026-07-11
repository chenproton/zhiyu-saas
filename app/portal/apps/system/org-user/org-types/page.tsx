"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search, Upload, Download } from "lucide-react"

interface OrgType {
  id: string
  name: string
  category: "internal" | "business" | "external"
  createdAt: string
}

const mockOrgTypes: OrgType[] = []

const categoryLabels = { internal: "内部组织", business: "业务组织", external: "外部协作组织" }
const categoryColors = { internal: "bg-blue-100 text-blue-700", business: "bg-green-100 text-green-700", external: "bg-orange-100 text-orange-700" }

export default function OrgTypesPage() {
  const [orgTypes, setOrgTypes] = useState<OrgType[]>(mockOrgTypes)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<OrgType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTypes = orgTypes.filter((type) => type.name.includes(searchTerm))

  const deleteType = (id: string) => {
    setOrgTypes((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">组织类型管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理组织架构中的节点类型</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            批量导入
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            批量导出
          </Button>
          <Button size="sm" onClick={() => { setSelectedType(null); setIsDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-1" />
            新增类型
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索类型名称..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>类型名称</TableHead>
              <TableHead>类型分类</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTypes.map((type) => (
              <TableRow key={type.id} className="border-border">
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>
                  <Badge className={categoryColors[type.category]}>{categoryLabels[type.category]}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{type.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedType(type); setIsDialogOpen(true) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteType(type.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">共 {filteredTypes.length} 条记录</div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedType ? "编辑类型" : "新增类型"}</DialogTitle>
            <DialogDescription>组织类型用于组织架构节点分类</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>类型名称</Label>
              <Input placeholder="如：二级学院" defaultValue={selectedType?.name} />
            </div>
            <div className="grid gap-2">
              <Label>类型分类</Label>
              <Select defaultValue={selectedType?.category || "internal"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">内部组织</SelectItem>
                  <SelectItem value="business">业务组织</SelectItem>
                  <SelectItem value="external">外部协作组织</SelectItem>
                </SelectContent>
              </Select>
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
