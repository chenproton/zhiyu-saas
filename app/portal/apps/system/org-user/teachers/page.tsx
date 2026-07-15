"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { usePortalAuth } from "@/contexts/portal-auth-context"
import { usePortalUsers } from "@/hooks/use-portal-users"
import { portalUserManagementApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Plus, MoreHorizontal, Power, Trash2, Search, Filter, Upload, Download,
  ChevronRight, ChevronDown, FolderTree, Key, Loader2, AlertCircle, RotateCcw
} from "lucide-react"

interface Teacher {
  id: string
  name: string
  workNo: string
  department: string
  roles: string[]
  positions: string[]
  status: "在职" | "离职" | "外聘" | "禁用"
}

interface OrgMajorNode {
  id: string
  name: string
}

interface OrgDeptNode {
  id: string
  name: string
  majors: OrgMajorNode[]
}

const orgTreeData: OrgDeptNode[] = [
  { id: "dept-1", name: "信息学院", majors: [{ id: "major-1-1", name: "计算机系" }, { id: "major-1-2", name: "软件工程系" }] },
  { id: "dept-2", name: "经济管理学院", majors: [{ id: "major-2-1", name: "会计系" }, { id: "major-2-2", name: "金融系" }] },
  { id: "dept-3", name: "教务处", majors: [] },
  { id: "dept-4", name: "学生处", majors: [] },
]

function mapTeacherStatus(status: string): Teacher["status"] {
  if (status === "active") return "在职"
  if (status === "inactive") return "离职"
  if (status === "disabled") return "禁用"
  return "外聘"
}

function toBackendStatus(status: Teacher["status"]): string {
  if (status === "在职") return "active"
  if (status === "离职") return "inactive"
  if (status === "禁用") return "disabled"
  return "active"
}

export default function TeachersPage() {
  const { institution, institutionId, tenantId } = usePortalAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const { users, identityTypeMap, loading, error, refetch } = usePortalUsers({
    identityTypeCode: "teacher",
    search: searchTerm || undefined,
  })

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formName, setFormName] = useState("")
  const [formUsername, setFormUsername] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formWorkId, setFormWorkId] = useState("")

  useEffect(() => {
    setTeachers(
      users.map((u) => {
        const idType = u.identityTypeId ? identityTypeMap.get(u.identityTypeId) : undefined
        return {
          id: u.id,
          name: u.name,
          workNo: u.workId || u.username,
          department: institution?.name || "—",
          roles: idType ? [idType.name] : [],
          positions: u.titleIds ?? [],
          status: mapTeacherStatus(u.status),
        }
      })
    )
  }, [users, identityTypeMap, institution])

  const filteredTeachers = teachers.filter((teacher) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!teacher.name.toLowerCase().includes(term) && !teacher.workNo.toLowerCase().includes(term)) return false
    }
    if (statusFilter !== "all" && teacher.status !== statusFilter) return false
    if (selectedDeptId) {
      const dept = orgTreeData.find((d) => d.id === selectedDeptId)
      if (dept && teacher.department !== dept.name) return false
    }
    return true
  })

  const resetForm = () => {
    setFormName("")
    setFormUsername("")
    setFormPassword("")
    setFormWorkId("")
  }

  const openCreateDialog = () => {
    setSelectedTeacher(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!tenantId || !institutionId || !formName.trim() || !formUsername.trim() || !formPassword.trim()) return
    const teacherType = Array.from(identityTypeMap.values()).find((it) => it.code === "teacher")
    if (!teacherType) {
      toast({ variant: "destructive", title: "创建失败", description: "未找到教职工身份类型" })
      return
    }
    setSaving(true)
    try {
      await portalUserManagementApi.create({
        tenantId,
        institutionId,
        identityTypeId: teacherType.id,
        role: "school",
        platform: "portal",
        loginName: formUsername.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        name: formName.trim(),
        workId: formWorkId.trim() || undefined,
      })
      toast({ title: "创建成功" })
      setIsDialogOpen(false)
      resetForm()
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "创建失败", description: err instanceof Error ? err.message : "未知错误" })
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (teacher: Teacher) => {
    const backendStatus = toBackendStatus(teacher.status)
    const nextBackendStatus = backendStatus === "active" ? "inactive" : "active"
    try {
      await portalUserManagementApi.updateStatus(teacher.id, nextBackendStatus)
      toast({ title: "状态已更新" })
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "操作失败", description: err instanceof Error ? err.message : "未知错误" })
    }
  }

  const deleteTeacher = async (id: string) => {
    if (!window.confirm("确定要删除该教职工吗？此操作不可恢复。")) return
    try {
      await portalUserManagementApi.delete(id)
      toast({ title: "删除成功" })
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "删除失败", description: err instanceof Error ? err.message : "未知错误" })
    }
  }

  const resetPassword = async (teacher: Teacher) => {
    const password = window.prompt(`请输入 ${teacher.name} 的新密码：`)
    if (!password) return
    try {
      await portalUserManagementApi.resetPassword(teacher.id, password)
      toast({ title: "密码重置成功" })
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "重置失败", description: err instanceof Error ? err.message : "未知错误" })
    }
  }

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">教职工管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">维护教师档案信息</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />导入
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />导出
          </Button>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-1" />新建教师
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">加载失败</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RotateCcw className="h-4 w-4 mr-1" />重试
          </Button>
        </div>
      )}

      <div className="flex gap-4 items-start">
        <div className="w-64 shrink-0 rounded-lg border border-gray-100 bg-white shadow-sm p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <FolderTree className="h-4 w-4 text-primary" />组织架构
          </h3>
          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedDeptId(null)}
                className={cn(
                  "w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                  selectedDeptId === null ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                全部教职工
              </button>
              {orgTreeData.map((dept) => (
                <DeptTreeNode key={dept.id} dept={dept} selectedDeptId={selectedDeptId} onSelectDept={setSelectedDeptId} />
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-gray-100 bg-white shadow-sm p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="搜索姓名或工号..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="在职">在职</SelectItem>
                  <SelectItem value="离职">离职</SelectItem>
                  <SelectItem value="外聘">外聘</SelectItem>
                  <SelectItem value="禁用">禁用</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />筛选
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>工号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>所属院系</TableHead>
                  <TableHead>关联角色</TableHead>
                  <TableHead>职位</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id} className="border-border">
                        <TableCell className="font-mono text-sm">{teacher.workNo}</TableCell>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.department}</TableCell>
                        <TableCell>
                          {teacher.roles.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {teacher.roles.map((role, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{role}</Badge>
                              ))}
                            </div>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {teacher.positions.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {teacher.positions.map((pos, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{pos}</Badge>
                              ))}
                            </div>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={teacher.status === "在职" ? "default" : teacher.status === "禁用" ? "destructive" : "secondary"}>{teacher.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => resetPassword(teacher)}>
                              重置密码
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toggleStatus(teacher)}>
                                  <Power className="mr-2 h-4 w-4" />
                                  {teacher.status === "在职" ? "设为离职" : "设为在职"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => resetPassword(teacher)}>
                                  <Key className="mr-2 h-4 w-4" />
                                  重置密码
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteTeacher(teacher.id)} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {searchTerm ? "未找到匹配的教职工" : "暂无教职工数据"}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">共 {filteredTeachers.length} 条记录</div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>新建教师</DialogTitle>
            <DialogDescription>填写教职工基本信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>姓名 <span className="text-destructive">*</span></Label>
              <Input placeholder="请输入姓名" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>登录账号 <span className="text-destructive">*</span></Label>
              <Input placeholder="如：zhangsan" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>密码 <span className="text-destructive">*</span></Label>
              <Input type="password" placeholder="请输入密码" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>工号</Label>
              <Input placeholder="如：T001" value={formWorkId} onChange={(e) => setFormWorkId(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>取消</Button>
            <Button onClick={handleCreate} disabled={saving || !formName.trim() || !formUsername.trim() || !formPassword.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DeptTreeNode({
  dept,
  selectedDeptId,
  onSelectDept,
}: {
  dept: OrgDeptNode
  selectedDeptId: string | null
  onSelectDept: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
          {open ? <ChevronDown className="h-3.5 w-3.5 mr-1 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 mr-1 shrink-0" />}
          <button
            onClick={(e) => { e.stopPropagation(); onSelectDept(dept.id) }}
            className={cn(
              "flex-1 text-left truncate rounded px-1 -mx-1 transition-colors",
              selectedDeptId === dept.id ? "bg-primary/10 text-primary font-medium" : ""
            )}
          >
            {dept.name}
          </button>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 space-y-1">
          {dept.majors.map((major) => (
            <div key={major.id} className="px-2 py-1 text-sm text-muted-foreground truncate">
              {major.name}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
