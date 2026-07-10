"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Pencil } from "lucide-react"

interface Major {
  id: string
  code: string
  name: string
  alias: string
  enabled: boolean
}

const mockMajors: Major[] = [
  { id: "1", code: "510201", name: "计算机应用技术", alias: "", enabled: true },
  { id: "2", code: "510202", name: "计算机网络技术", alias: "", enabled: true },
  { id: "3", code: "510203", name: "软件技术", alias: "软件开发", enabled: true },
  { id: "4", code: "510204", name: "数字媒体技术", alias: "", enabled: true },
  { id: "5", code: "510205", name: "大数据技术", alias: "大数据分析", enabled: true },
  { id: "6", code: "510206", name: "云计算技术应用", alias: "", enabled: true },
  { id: "7", code: "510207", name: "信息安全技术应用", alias: "网络安全", enabled: true },
  { id: "8", code: "510208", name: "虚拟现实技术应用", alias: "VR技术", enabled: false },
  { id: "9", code: "510209", name: "人工智能技术应用", alias: "AI技术", enabled: true },
  { id: "10", code: "510210", name: "嵌入式技术应用", alias: "", enabled: false },
  { id: "11", code: "510211", name: "工业互联网技术", alias: "", enabled: true },
  { id: "12", code: "510212", name: "区块链技术应用", alias: "", enabled: false },
  { id: "13", code: "530301", name: "大数据与财务管理", alias: "智能财务", enabled: true },
  { id: "14", code: "530302", name: "大数据与会计", alias: "智能会计", enabled: true },
  { id: "15", code: "530501", name: "国际经济与贸易", alias: "", enabled: true },
  { id: "16", code: "530601", name: "工商企业管理", alias: "", enabled: true },
  { id: "17", code: "530701", name: "电子商务", alias: "跨境电商", enabled: true },
  { id: "18", code: "530801", name: "物流管理", alias: "智慧物流", enabled: true },
  { id: "19", code: "540101", name: "旅游管理", alias: "", enabled: false },
  { id: "20", code: "550101", name: "艺术设计", alias: "数字艺术", enabled: true },
  { id: "21", code: "560102", name: "机械制造与自动化", alias: "智能制造", enabled: true },
  { id: "22", code: "560103", name: "数控技术", alias: "", enabled: true },
  { id: "23", code: "560110", name: "焊接技术与自动化", alias: "", enabled: false },
  { id: "24", code: "560113", name: "模具设计与制造", alias: "", enabled: true },
  { id: "25", code: "560301", name: "机电一体化技术", alias: "", enabled: true },
]

export default function MajorsPage() {
  const [majors, setMajors] = useState<Major[]>(mockMajors)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [aliasValue, setAliasValue] = useState("")

  const filteredMajors = majors.filter((major) =>
    major.name.includes(searchTerm) || major.code.includes(searchTerm) || major.alias.includes(searchTerm)
  )

  const toggleEnabled = (id: string) => {
    setMajors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    )
  }

  const openEditDialog = (major: Major) => {
    setSelectedMajor(major)
    setAliasValue(major.alias)
    setIsDialogOpen(true)
  }

  const saveAlias = () => {
    if (selectedMajor) {
      setMajors((prev) =>
        prev.map((m) => (m.id === selectedMajor.id ? { ...m, alias: aliasValue } : m))
      )
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">专业管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">管理教育专业，可为专业配置别名并启用/关闭</p>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索专业代码、名称或别名..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="w-28">专业代码</TableHead>
              <TableHead>专业名称</TableHead>
              <TableHead>别名（备注）</TableHead>
              <TableHead className="w-24 text-center">状态</TableHead>
              <TableHead className="w-24 text-center">启用/关闭</TableHead>
              <TableHead className="w-20 text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMajors.map((major) => (
              <TableRow key={major.id} className="border-border">
                <TableCell className="font-mono text-sm">{major.code}</TableCell>
                <TableCell className="font-medium">{major.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {major.alias || <span className="text-gray-300">-</span>}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={major.enabled ? "default" : "secondary"}>
                    {major.enabled ? "已启用" : "已关闭"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={major.enabled}
                    onCheckedChange={() => toggleEnabled(major.id)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(major)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">共 {filteredMajors.length} 条记录</div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑专业别名</DialogTitle>
            <DialogDescription>为专业 {selectedMajor?.name} 配置别名</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>专业代码</Label>
              <Input value={selectedMajor?.code} disabled className="bg-muted" />
            </div>
            <div className="grid gap-2">
              <Label>专业名称</Label>
              <Input value={selectedMajor?.name} disabled className="bg-muted" />
            </div>
            <div className="grid gap-2">
              <Label>别名（备注）</Label>
              <Input 
                placeholder="输入专业别名或备注" 
                value={aliasValue} 
                onChange={(e) => setAliasValue(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={saveAlias}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
