"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { usePortalAuth } from "@/contexts/portal-auth-context"
import { usePortalUsers } from "@/hooks/use-portal-users"
import { useOrgTree, findOrgAncestor } from "@/hooks/use-org-tree"
import { OrgNodeSelect } from "@/components/shared/org-node-select"
import { OrgFilterTree, collectOrgSubtreeIds } from "@/components/shared/org-filter-tree"
import { MajorSelect } from "@/components/shared/major-select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { portalUserManagementApi, majorApi, portalGraduateApi } from "@/lib/api"
import type { Organization } from "@/lib/types/backend"
import { useToast } from "@/hooks/use-toast"
import {
  Plus, MoreHorizontal, Power, Trash2, Search, Filter, Upload, Download,
  FolderTree, Key, Loader2, AlertCircle, RotateCcw, Award
} from "lucide-react"

const DEPT_TYPE = "二级学院"
const MAJOR_TYPE = "专业"
const CLASS_TYPE = "班级"

interface Major {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
  studentNo: string
  className: string
  major: string
  department: string
  orgNodeId?: string
  majorId?: string
  status: "在籍" | "休学" | "退学" | "毕业" | "结业"
}

const statusColor: Record<string, string> = {
  "在籍": "default",
  "休学": "secondary",
  "退学": "destructive",
  "毕业": "default",
  "结业": "secondary",
}

function mapStudentStatus(status: string): Student["status"] {
  if (status === "active") return "在籍"
  if (status === "inactive") return "休学"
  if (status === "disabled") return "退学"
  return "在籍"
}

function toBackendStatus(status: Student["status"]): string {
  if (status === "在籍") return "active"
  if (status === "休学") return "inactive"
  if (status === "退学") return "disabled"
  return "active"
}

function classBadge(variant: string) {
  if (variant === "destructive") return "destructive" as const
  if (variant === "secondary") return "secondary" as const
  return "default" as const
}

function getOrgTypeName(org: Organization | undefined, orgTypeMap: Map<string, { name: string }>): string | undefined {
  if (!org) return undefined
  return orgTypeMap.get(org.typeId)?.name
}

export default function StudentsPage() {
  const { institution, institutionId, tenantId } = usePortalAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const { users, identityTypeMap, loading, error, refetch } = usePortalUsers({
    identityTypeCode: "student",
    search: searchTerm || undefined,
  })
  const { orgs, orgMap, orgTypeMap, loading: orgLoading } = useOrgTree(tenantId)

  const [students, setStudents] = useState<Student[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("在籍")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedOrgNodeId, setSelectedOrgNodeId] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const [graduateLoading, setGraduateLoading] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const [majors, setMajors] = useState<Major[]>([])

  const [formName, setFormName] = useState("")
  const [formUsername, setFormUsername] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formStudentNo, setFormStudentNo] = useState("")
  const [formClassNodeId, setFormClassNodeId] = useState<string>("")
  const [formMajorId, setFormMajorId] = useState<string>("")

  useEffect(() => {
    if (!tenantId) {
      setMajors([])
      return
    }
    let cancelled = false
    majorApi.list({ tenantId, limit: 1000 })
      .then((res) => {
        if (cancelled) return
        setMajors(res.items.map((m) => ({ id: m.id, name: m.name })))
      })
      .catch((err) => {
        if (cancelled) return
        toast({ variant: "destructive", title: "加载专业失败", description: err instanceof Error ? err.message : "未知错误" })
      })
    return () => {
      cancelled = true
    }
  }, [tenantId, toast])

  const majorMap = useMemo(() => {
    const map = new Map<string, Major>()
    majors.forEach((m) => map.set(m.id, m))
    return map
  }, [majors])



  useEffect(() => {
    setStudents(
      users.map((u) => {
        const classNode = u.orgNodeId ? orgMap.get(u.orgNodeId) : undefined
        const className = classNode?.name || "—"

        let majorName = "—"
        if (u.majorId && majorMap.has(u.majorId)) {
          majorName = majorMap.get(u.majorId)!.name
        } else if (classNode) {
          const majorNode = findOrgAncestor(orgMap, classNode.id, (org) => getOrgTypeName(org, orgTypeMap) === MAJOR_TYPE)
          majorName = majorNode?.name || "—"
        }

        let departmentName = institution?.name || "—"
        if (classNode) {
          const deptNode = findOrgAncestor(orgMap, classNode.id, (org) => getOrgTypeName(org, orgTypeMap) === DEPT_TYPE)
          departmentName = deptNode?.name || institution?.name || "—"
        }

        return {
          id: u.id,
          name: u.name,
          studentNo: u.studentNo || u.username,
          className,
          major: majorName,
          department: departmentName,
          orgNodeId: u.orgNodeId,
          majorId: u.majorId,
          status: mapStudentStatus(u.status),
        }
      })
    )
  }, [users, institution, orgMap, orgTypeMap, majorMap])

  const selectedOrgIds = useMemo(() => {
    if (!selectedOrgNodeId) return null
    return collectOrgSubtreeIds(orgMap, selectedOrgNodeId)
  }, [selectedOrgNodeId, orgMap])

  const filteredStudents = students.filter((student) => {
    if (statusFilter !== "all" && student.status !== statusFilter) return false
    if (selectedOrgIds) {
      return !!student.orgNodeId && selectedOrgIds.has(student.orgNodeId)
    }
    return true
  })

  const toggleStatus = async (student: Student) => {
    const backendStatus = toBackendStatus(student.status)
    const nextBackendStatus = backendStatus === "active" ? "inactive" : "active"
    try {
      await portalUserManagementApi.updateStatus(student.id, nextBackendStatus)
      toast({ title: "状态已更新" })
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "操作失败", description: err instanceof Error ? err.message : "未知错误" })
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id)
  }

  const confirmDeleteStudent = async () => {
    if (!deleteTarget) return
    try {
      await portalUserManagementApi.delete(deleteTarget)
      toast({ title: "删除成功" })
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "删除失败", description: err instanceof Error ? err.message : "未知错误" })
    } finally {
      setDeleteTarget(null)
    }
  }

  const resetPassword = async (student: Student) => {
    const password = window.prompt(`请输入 ${student.name} 的新密码：`)
    if (!password) return
    try {
      await portalUserManagementApi.resetPassword(student.id, password)
      toast({ title: "密码重置成功" })
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "重置失败", description: err instanceof Error ? err.message : "未知错误" })
    }
  }

  const toggleSelectStudent = (id: string) => {
    setSelectedStudents((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

	const toggleSelectAll = () => {
		if (selectedStudents.length === filteredStudents.length && filteredStudents.length > 0) {
			setSelectedStudents([])
		} else {
			setSelectedStudents(filteredStudents.map((s) => s.id))
		}
	}

	const handleBatchGraduate = async () => {
		if (selectedStudents.length === 0 || !tenantId) return
		setGraduateLoading(true)
		try {
			await portalGraduateApi.batchCreate({ tenantId, userIds: selectedStudents })
			toast({ title: "批量毕业成功", description: `已将 ${selectedStudents.length} 名学生移至毕业列表` })
			setSelectedStudents([])
			await refetch()
		} catch (err) {
			toast({ variant: "destructive", title: "批量毕业失败", description: err instanceof Error ? err.message : "未知错误" })
		} finally {
			setGraduateLoading(false)
		}
	}

  const resetForm = () => {
    setFormName("")
    setFormUsername("")
    setFormPassword("")
    setFormStudentNo("")
    setFormClassNodeId("")
    setFormMajorId("")
  }

  const openCreateDialog = () => {
    setSelectedStudent(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student)
    setFormName(student.name)
    setFormUsername("")
    setFormPassword("")
    setFormStudentNo(student.studentNo)
    setFormClassNodeId(student.orgNodeId || "")
    setFormMajorId(student.majorId || "")
    setIsDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedStudent || !formName.trim()) return
    const original = users.find((u) => u.id === selectedStudent.id)
    if (!original) {
      toast({ variant: "destructive", title: "保存失败", description: "未找到原始用户数据" })
      return
    }
    setSaving(true)
    try {
      await portalUserManagementApi.update(selectedStudent.id, {
        institutionId: original.institutionId,
        identityTypeId: original.identityTypeId,
        orgNodeId: formClassNodeId || undefined,
        majorId: formMajorId || undefined,
        role: original.role,
        loginName: original.loginName || original.username,
        username: original.username,
        name: formName.trim(),
        email: original.email,
        phone: original.phone,
        avatarUrl: original.avatarUrl,
        studentNo: formStudentNo.trim() || undefined,
        workId: original.workId,
        idCard: original.idCard,
        titleIds: original.titleIds,
      })
      toast({ title: "保存成功" })
      setIsDialogOpen(false)
      resetForm()
      setSelectedStudent(null)
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "保存失败", description: err instanceof Error ? err.message : "未知错误" })
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!tenantId) {
      toast({ variant: "destructive", title: "创建失败", description: "未获取到租户信息，请重新登录" })
      return
    }
    if (!formClassNodeId || !formMajorId) {
      toast({ variant: "destructive", title: "创建失败", description: "请选择班级和专业" })
      return
    }
    const studentType = Array.from(identityTypeMap.values()).find((it) => it.code === "student")
    if (!studentType) {
      toast({ variant: "destructive", title: "创建失败", description: "未找到学生身份类型" })
      return
    }
    setSaving(true)
    try {
      await portalUserManagementApi.create({
        tenantId,
        institutionId,
        identityTypeId: studentType.id,
        role: "school",
        platform: "portal",
        loginName: formUsername.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        name: formName.trim(),
        studentNo: formStudentNo.trim() || undefined,
        orgNodeId: formClassNodeId,
        majorId: formMajorId,
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

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">学生管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理学生基础信息与学籍数据</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />导入
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />导出
          </Button>
			<Button variant="outline" size="sm" disabled={selectedStudents.length === 0 || graduateLoading} onClick={handleBatchGraduate}>
				{graduateLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Award className="h-4 w-4 mr-1" />}
				{selectedStudents.length > 0 ? `批量毕业(${selectedStudents.length})` : "批量毕业"}
			</Button>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-1" />新生录入
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
                onClick={() => setSelectedOrgNodeId(null)}
                className={cn(
                  "w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                  selectedOrgNodeId === null ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                全部学生
              </button>
              {orgLoading ? (
                <div className="flex items-center gap-2 px-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> 加载中...
                </div>
              ) : (
                <OrgFilterTree
                  nodes={orgs}
                  orgTypeMap={orgTypeMap}
                  selectedId={selectedOrgNodeId}
                  onSelect={setSelectedOrgNodeId}
                />
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-gray-100 bg-white shadow-sm p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="搜索姓名、学号..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="在籍">在籍</SelectItem>
                  <SelectItem value="休学">休学</SelectItem>
                  <SelectItem value="退学">退学</SelectItem>
                  <SelectItem value="毕业">毕业</SelectItem>
                  <SelectItem value="结业">结业</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />更多筛选
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>学号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>所属院系</TableHead>
                  <TableHead>专业</TableHead>
                  <TableHead>班级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="border-border">
                        <TableCell>
                          <Checkbox checked={selectedStudents.includes(student.id)} onCheckedChange={() => toggleSelectStudent(student.id)} />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{student.studentNo}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell className="text-muted-foreground">{student.major}</TableCell>
                        <TableCell>{student.className}</TableCell>
                        <TableCell>
                          <Badge variant={classBadge(statusColor[student.status])}>{student.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(student)}>
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => resetPassword(student)}>
                                重置密码
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleStatus(student)}>
                                {student.status === "在籍" ? "设为休学" : "设为在籍"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(student.id)} className="text-destructive">
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          {searchTerm ? "未找到匹配的学生" : "暂无学生数据"}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>共 {filteredStudents.length} 条记录{selectedStudents.length > 0 && `，已选择 ${selectedStudents.length} 条`}</span>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{selectedStudent ? "编辑学生" : "新生录入"}</DialogTitle>
            <DialogDescription>{selectedStudent ? "修改学生基本信息与班级、专业归属" : "填写学生基本信息，并关联到真实班级与专业"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>姓名 <span className="text-destructive">*</span></Label>
              <Input placeholder="请输入姓名" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            {!selectedStudent && (
              <>
                <div className="grid gap-2">
                  <Label>登录账号 <span className="text-destructive">*</span></Label>
                  <Input placeholder="如：zhangsan" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>密码 <span className="text-destructive">*</span></Label>
                  <Input type="password" placeholder="请输入密码" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                </div>
              </>
            )}
            <div className="grid gap-2">
              <Label>学号</Label>
              <Input placeholder="如：S2024001" value={formStudentNo} onChange={(e) => setFormStudentNo(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>班级 <span className="text-destructive">*</span></Label>
              <OrgNodeSelect
                tenantId={tenantId}
                value={formClassNodeId}
                onChange={(value) => {
                  setFormClassNodeId(value || "")
                }}
                allowedTypes={[CLASS_TYPE]}
                placeholder="选择班级"
              />
            </div>
            <div className="grid gap-2">
              <Label>专业 <span className="text-destructive">*</span></Label>
              <MajorSelect
                tenantId={tenantId}
                value={formMajorId}
                onChange={(value) => setFormMajorId(value || "")}
                placeholder="选择专业"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>取消</Button>
            <Button
              onClick={selectedStudent ? handleUpdate : handleCreate}
              disabled={saving || !tenantId || !formName.trim() || !formClassNodeId || !formMajorId || (!selectedStudent && (!formUsername.trim() || !formPassword.trim()))}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              保存
            </Button>
          </DialogFooter>
          {!saving && !formClassNodeId && (
            <p className="text-xs text-muted-foreground">请选择班级</p>
          )}
          {!saving && formClassNodeId && !formMajorId && (
            <p className="text-xs text-muted-foreground">请选择专业</p>
          )}
          {!saving && !selectedStudent && formClassNodeId && formMajorId && !formUsername.trim() && (
            <p className="text-xs text-muted-foreground">请填写登录账号</p>
          )}
          {!saving && !selectedStudent && formClassNodeId && formMajorId && formUsername.trim() && !formPassword.trim() && (
            <p className="text-xs text-muted-foreground">请填写密码</p>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="确认删除"
        description="确定要删除该学生吗？此操作不可恢复。"
        confirmText="删除"
        variant="destructive"
        onConfirm={confirmDeleteStudent}
      />
    </div>
  )
}
