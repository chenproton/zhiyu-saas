"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, AlertCircle } from "lucide-react"

interface ExtendField {
  id: number
  name: string
  enabled: boolean
  identityTypes: string[] // 适用的身份类型
}

const identityTypeOptions = [
  { id: "teacher", label: "教职工" },
  { id: "student", label: "学生" },
  { id: "enterprise", label: "企业人员" },
]

const defaultFields: ExtendField[] = [
  { id: 1, name: "籍贯", enabled: true, identityTypes: ["teacher", "student"] },
  { id: 2, name: "民族", enabled: true, identityTypes: ["teacher", "student"] },
  { id: 3, name: "政治面貌", enabled: true, identityTypes: ["teacher", "student"] },
  { id: 4, name: "婚姻状况", enabled: true, identityTypes: ["teacher"] },
  { id: 5, name: "紧急联系人", enabled: true, identityTypes: ["teacher", "student", "enterprise"] },
  { id: 6, name: "紧急联系电话", enabled: true, identityTypes: ["teacher", "student", "enterprise"] },
  { id: 7, name: "毕业院校", enabled: true, identityTypes: ["teacher"] },
  { id: 8, name: "最高学历", enabled: true, identityTypes: ["teacher"] },
  { id: 9, name: "所学专业", enabled: false, identityTypes: ["teacher"] },
  { id: 10, name: "入职日期", enabled: true, identityTypes: ["teacher", "enterprise"] },
  { id: 11, name: "家庭住址", enabled: false, identityTypes: ["student"] },
  { id: 12, name: "监护人姓名", enabled: true, identityTypes: ["student"] },
  { id: 13, name: "监护人电话", enabled: true, identityTypes: ["student"] },
  { id: 14, name: "企业职务", enabled: true, identityTypes: ["enterprise"] },
  { id: 15, name: "企业部门", enabled: true, identityTypes: ["enterprise"] },
  { id: 16, name: "扩展字段16", enabled: false, identityTypes: [] },
  { id: 17, name: "扩展字段17", enabled: false, identityTypes: [] },
  { id: 18, name: "扩展字段18", enabled: false, identityTypes: [] },
  { id: 19, name: "扩展字段19", enabled: false, identityTypes: [] },
  { id: 20, name: "扩展字段20", enabled: false, identityTypes: [] },
]

export default function UserFieldsPage() {
  const [fields, setFields] = useState<ExtendField[]>(defaultFields)
  const [showDialog, setShowDialog] = useState(false)
  const [editingField, setEditingField] = useState<ExtendField | null>(null)
  const [editName, setEditName] = useState("")
  const [editIdentityTypes, setEditIdentityTypes] = useState<string[]>([])

  const handleToggle = (id: number) => {
    setFields(fields.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ))
  }

  const handleEdit = (field: ExtendField) => {
    setEditingField(field)
    setEditName(field.name)
    setEditIdentityTypes(field.identityTypes)
    setShowDialog(true)
  }

  const handleSave = () => {
    if (editingField) {
      setFields(fields.map(f => 
        f.id === editingField.id 
          ? { ...f, name: editName, identityTypes: editIdentityTypes }
          : f
      ))
    }
    setShowDialog(false)
  }

  const toggleIdentityType = (typeId: string) => {
    setEditIdentityTypes(prev =>
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
  }

  const getIdentityTypeLabels = (types: string[]) => {
    return types.map(t => identityTypeOptions.find(opt => opt.id === t)?.label).filter(Boolean)
  }

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">用户字段扩展</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          系统预留20个用户扩展字段，您可以根据需要启用、命名这些字段，并指定适用的身份类型
        </p>
      </div>

      <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-4 text-amber-800 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">后端暂无用户扩展字段接口</p>
          <p className="opacity-90">
            当前页面展示的是静态示例数据，用于保留 UI 结构。待后端提供 /user-extension-fields 相关接口后再替换为真实数据。
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">序号</TableHead>
              <TableHead>字段名称</TableHead>
              <TableHead>适用身份类型</TableHead>
              <TableHead className="w-24 text-center">是否启用</TableHead>
              <TableHead className="w-20 text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell className="text-muted-foreground">{field.id}</TableCell>
                <TableCell className="font-medium">{field.name}</TableCell>
                <TableCell>
                  {field.identityTypes.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {getIdentityTypeLabels(field.identityTypes).map((label, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">未指定</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Switch 
                    checked={field.enabled} 
                    onCheckedChange={() => handleToggle(field.id)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(field)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        已启用 {fields.filter(f => f.enabled).length} / {fields.length} 个扩展字段
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>编辑扩展字段</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>字段名称</Label>
              <Input 
                placeholder="请输入字段名称" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>适用身份类型（可多选）</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                {identityTypeOptions.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleIdentityType(type.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      editIdentityTypes.includes(type.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                选择此字段适用的身份类型，不选则表示所有身份类型均可使用
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={handleSave}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
