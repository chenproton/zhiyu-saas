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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import {
  Plus, MoreHorizontal, Pencil, Power, Trash2, Search, Filter, Upload, Download,
  ChevronRight, ChevronDown, FolderTree, Users, GraduationCap, UserMinus, UserCheck, BookOpen, Award, Check, ChevronsUpDown
} from "lucide-react"

interface Student {
  id: string
  name: string
  studentNo: string
  className: string
  major: string
  department: string
  status: "在籍" | "休学" | "退学" | "毕业" | "结业"
}

interface OrgClassNode {
  id: string
  name: string
  gradeLabel?: string
}

interface OrgMajorNode {
  id: string
  name: string
  classes: OrgClassNode[]
}

interface OrgDeptNode {
  id: string
  name: string
  majors: OrgMajorNode[]
}

const orgTreeData: OrgDeptNode[] = [
  {
    id: "dept-1",
    name: "信息学院",
    majors: [
      {
        id: "major-1-1",
        name: "计算机系",
        classes: [
          { id: "class-1-1-1", name: "计算机2401班", gradeLabel: "2024级" },
          { id: "class-1-1-2", name: "计算机2301班", gradeLabel: "2023级" },
          { id: "class-1-1-3", name: "计算机2201班", gradeLabel: "2022级" },
        ],
      },
      {
        id: "major-1-2",
        name: "软件工程系",
        classes: [
          { id: "class-1-2-1", name: "2024级软件班", gradeLabel: "2024级" },
          { id: "class-1-2-2", name: "软件2301班", gradeLabel: "2023级" },
        ],
      },
    ],
  },
  {
    id: "dept-2",
    name: "经济管理学院",
    majors: [
      {
        id: "major-2-1",
        name: "会计系",
        classes: [
          { id: "class-2-1-1", name: "会计2401班", gradeLabel: "2024级" },
        ],
      },
      {
        id: "major-2-2",
        name: "金融系",
        classes: [
          { id: "class-2-1-2", name: "金融2401班", gradeLabel: "2024级" },
        ],
      },
    ],
  },
  {
    id: "dept-3",
    name: "教务处",
    majors: [],
  },
  {
    id: "dept-4",
    name: "学生处",
    majors: [],
  },
]

const allClasses = orgTreeData.flatMap(d =>
  d.majors.flatMap(m => m.classes)
)

const statusColor: Record<string, string> = {
  "在籍": "default",
  "休学": "secondary",
  "退学": "destructive",
  "毕业": "default",
  "结业": "secondary",
}

const mockStudents: Student[] = [
  { id: "1", name: "王五", studentNo: "S2024001", className: "计算机2401班", major: "计算机系", department: "信息学院", status: "在籍" },
  { id: "2", name: "赵六", studentNo: "S2024002", className: "计算机2401班", major: "计算机系", department: "信息学院", status: "在籍" },
  { id: "3", name: "钱七", studentNo: "S2024003", className: "计算机2301班", major: "计算机系", department: "信息学院", status: "在籍" },
  { id: "4", name: "孙八", studentNo: "S2024004", className: "软件2301班", major: "软件工程系", department: "信息学院", status: "在籍" },
  { id: "5", name: "周九", studentNo: "S2023005", className: "2024级软件班", major: "软件工程系", department: "信息学院", status: "在籍" },
  { id: "6", name: "吴十", studentNo: "S2023006", className: "2024级软件班", major: "软件工程系", department: "信息学院", status: "在籍" },
  { id: "7", name: "郑十一", studentNo: "S2022007", className: "计算机2201班", major: "计算机系", department: "信息学院", status: "在籍" },
  { id: "8", name: "冯十二", studentNo: "S2022008", className: "计算机2201班", major: "计算机系", department: "信息学院", status: "退学" },
  { id: "9", name: "陈十三", studentNo: "S2025001", className: "会计2401班", major: "会计系", department: "经济管理学院", status: "休学" },
  { id: "10", name: "刘十四", studentNo: "S2024009", className: "金融2401班", major: "金融系", department: "经济管理学院", status: "在籍" },
]

function classBadge(variant: string) {
  if (variant === "destructive") return "destructive" as const
  if (variant === "secondary") return "secondary" as const
  return "default" as const
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [classOpen, setClassOpen] = useState(false)
  const [formClassId, setFormClassId] = useState("")
  const [formClassName, setFormClassName] = useState("")

  const filteredStudents = students.filter((student) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!student.name.toLowerCase().includes(term) && !student.studentNo.toLowerCase().includes(term)) return false
    }
    if (statusFilter !== "all" && student.status !== statusFilter) return false
    if (selectedClassId) {
      const cls = allClasses.find(c => c.id === selectedClassId)
      if (cls && student.className !== cls.name) return false
    }
    return true
  })

  const stats = {
    total: students.length,
    enrolled: students.filter(s => s.status === "在籍").length,
    suspended: students.filter(s => s.status === "休学").length,
    graduated: students.filter(s => s.status === "毕业").length,
    dropped: students.filter(s => s.status === "退学").length,
    completed: students.filter(s => s.status === "结业").length,
  }

  const toggleStatus = (id: string) => {
    setStudents((prev) => prev.map((s) => {
      if (s.id !== id) return s
      const nextMap: Record<string, Student["status"]> = { "在籍": "休学", "休学": "在籍", "退学": "在籍", "毕业": "在籍", "结业": "在籍" }
      return { ...s, status: nextMap[s.status] || "在籍" }
    }))
  }

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  const toggleSelectStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const openCreateDialog = () => {
    setSelectedStudent(null)
    setFormClassId("")
    setFormClassName("")
    setIsDialogOpen(true)
  }

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student)
    const cls = allClasses.find(c => c.name === student.className)
    setFormClassId(cls?.id || "")
    setFormClassName(student.className)
    setClassOpen(false)
    setIsDialogOpen(true)
  }

  const selectedOrgClass = allClasses.find(c => c.id === formClassId)
  const selectedOrgMajor = selectedOrgClass
    ? orgTreeData.flatMap(d => d.majors).find(m => m.classes.some(c => c.id === formClassId))
    : null
  const selectedOrgDept = selectedOrgMajor
    ? orgTreeData.find(d => d.majors.some(m => m.id === selectedOrgMajor.id))
    : null

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
          <Button variant="outline" size="sm">
            <Award className="h-4 w-4 mr-1" />批量毕业
          </Button>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-1" />新生录入
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="w-64 shrink-0 rounded-lg border border-gray-100 bg-white shadow-sm p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <FolderTree className="h-4 w-4 text-primary" />组织架构
          </h3>
          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedClassId(null)}
                className={cn(
                  "w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                  selectedClassId === null ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                全部学生
              </button>
              {orgTreeData.map(dept => (
                <DeptTreeNode
                  key={dept.id}
                  dept={dept}
                  selectedClassId={selectedClassId}
                  onSelectClass={setSelectedClassId}
                />
              ))}
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
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="border-border">
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleSelectStudent(student.id)}
                      />
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
                            <Pencil className="mr-2 h-4 w-4" />编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(student.id)}>
                            <Power className="mr-2 h-4 w-4" />
                            {student.status === "在籍" ? "设为休学" : "设为在籍"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteStudent(student.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">暂无数据</TableCell>
                  </TableRow>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedStudent ? "编辑学生" : "新生录入"}</DialogTitle>
            <DialogDescription>填写学生基本信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>学号 <span className="text-destructive">*</span></Label>
                <Input placeholder="如：S2024001" defaultValue={selectedStudent?.studentNo} />
              </div>
              <div className="grid gap-2">
                <Label>姓名 <span className="text-destructive">*</span></Label>
                <Input placeholder="请输入姓名" defaultValue={selectedStudent?.name} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>密码 <span className="text-destructive">*</span></Label>
                <Input type="password" placeholder="请输入密码" />
              </div>
              <div className="grid gap-2">
                <Label>状态</Label>
                <Select defaultValue={selectedStudent?.status || "在籍"}>
                  <SelectTrigger><SelectValue placeholder="选择状态" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="在籍">在籍</SelectItem>
                    <SelectItem value="休学">休学</SelectItem>
                    <SelectItem value="退学">退学</SelectItem>
                    <SelectItem value="毕业">毕业</SelectItem>
                    <SelectItem value="结业">结业</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>所属班级</Label>
              <Popover open={classOpen} onOpenChange={setClassOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {formClassName || "搜索并选择班级..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="搜索班级名称..." />
                    <CommandList>
                      <CommandEmpty>未找到班级</CommandEmpty>
                      <CommandGroup>
                        {allClasses.map((c) => {
                          const major = orgTreeData.flatMap(d => d.majors).find(m => m.classes.some(cl => cl.id === c.id))
                          const dept = orgTreeData.find(d => d.majors.some(m => m.id === major?.id))
                          return (
                            <CommandItem
                              key={c.id}
                              value={c.name + " " + (major?.name || "") + " " + (dept?.name || "")}
                              onSelect={() => {
                                setFormClassId(c.id)
                                setFormClassName(c.name)
                                setClassOpen(false)
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", formClassId === c.id ? "opacity-100" : "opacity-0")} />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <span>{c.name}</span>
                                  {c.gradeLabel && <span className="text-[10px] px-1 rounded bg-muted">{c.gradeLabel}</span>}
                                </div>
                                <span className="text-xs text-muted-foreground">{major?.name} · {dept?.name}</span>
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>所属院系</Label>
                <Input value={selectedOrgDept?.name || "—"} readOnly className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label>所属专业</Label>
                <Input value={selectedOrgMajor?.name || "—"} readOnly className="bg-muted" />
              </div>
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

function DeptTreeNode({
  dept,
  selectedClassId,
  onSelectClass,
}: {
  dept: OrgDeptNode
  selectedClassId: string | null
  onSelectClass: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
          {open ? <ChevronDown className="h-3.5 w-3.5 mr-1 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 mr-1 shrink-0" />}
          <span className="truncate">{dept.name}</span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 space-y-1">
          {dept.majors.map(major => (
            <MajorTreeNode key={major.id} major={major} selectedClassId={selectedClassId} onSelectClass={onSelectClass} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function MajorTreeNode({
  major,
  selectedClassId,
  onSelectClass,
}: {
  major: OrgMajorNode
  selectedClassId: string | null
  onSelectClass: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
          {open ? <ChevronDown className="h-3.5 w-3.5 mr-1 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 mr-1 shrink-0" />}
          <span className="truncate">{major.name}</span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 space-y-0.5">
          {major.classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => onSelectClass(cls.id)}
              className={cn(
                "w-full text-left px-2 py-1 text-xs rounded-md transition-colors truncate flex items-center gap-1",
                selectedClassId === cls.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <span className="truncate">{cls.name}</span>
              {cls.gradeLabel && (
                <span className="shrink-0 text-[10px] px-1 rounded bg-muted-foreground/10">{cls.gradeLabel}</span>
              )}
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
