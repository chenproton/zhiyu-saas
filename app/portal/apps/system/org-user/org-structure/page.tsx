"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Users,
  Upload,
  Download,
  ArrowUp,
  GraduationCap,
  School,
  Building2,
  BookOpen,
  Briefcase,
  LayoutList,
  Building,
} from "lucide-react"
import { cn } from "@/lib/utils"

type OrgNodeType = "学校" | "二级学院" | "专业" | "班级" | "行政职能部门"

interface OrgNode {
  id: string
  name: string
  type: OrgNodeType
  order: number
  memberCount: number
  children?: OrgNode[]
  expanded?: boolean
  gradeLabel?: string
}

function generateClass(majorCode: string, grade: string, gradeLabel: string, index: number): OrgNode {
  return {
    id: `${majorCode}-${grade}-${index}`,
    name: `${majorCode}${grade.slice(2)}0${index}班`,
    type: "班级",
    order: index,
    memberCount: 28 + Math.floor(Math.random() * 20),
    gradeLabel,
  }
}

function generateMajor(
  collegeCode: string,
  name: string,
  code: string,
  order: number
): OrgNode {
  const grades = ["2021", "2022", "2023", "2024"]
  return {
    id: `${collegeCode}-${code}`,
    name,
    type: "专业",
    order,
    memberCount: 0,
    expanded: false,
    children: grades.flatMap((grade, gi) =>
      Array.from({ length: 2 }, (_, ci) =>
        generateClass(code, grade, `${grade}级`, gi * 2 + ci + 1)
      )
    ),
  }
}

function generateDepartment(
  collegeCode: string,
  name: string,
  order: number
): OrgNode {
  return {
    id: `${collegeCode}-dept-${order}`,
    name,
    type: "行政职能部门",
    order,
    memberCount: 5 + Math.floor(Math.random() * 15),
  }
}

function generateCollege(
  code: string,
  name: string,
  order: number,
  majors: { name: string; code: string }[],
  departments: string[]
): OrgNode {
  return {
    id: `college-${code}`,
    name,
    type: "二级学院",
    order,
    memberCount: 0,
    expanded: true,
    children: [
      ...majors.map((m, i) => generateMajor(code, m.name, m.code, i + 1)),
      ...departments.map((d, i) =>
        generateDepartment(code, d, i + 1 + majors.length)
      ),
    ],
  }
}

const rawMockOrgData: OrgNode[] = [
  {
    id: "school-1",
    name: "智慧大学",
    type: "学校",
    order: 1,
    memberCount: 0,
    expanded: true,
    children: [
      generateCollege(
        "cs",
        "计算机科学与技术学院",
        1,
        [
          { name: "计算机科学与技术", code: "CS" },
          { name: "软件工程", code: "SE" },
          { name: "网络工程", code: "NE" },
        ],
        ["学院办公室", "学生工作办公室", "教学科研办公室"]
      ),
      generateCollege(
        "em",
        "经济管理学院",
        2,
        [
          { name: "工商管理", code: "BA" },
          { name: "会计学", code: "AC" },
          { name: "金融学", code: "FI" },
        ],
        ["学院办公室", "学生工作办公室", "教务办公室"]
      ),
      generateCollege(
        "me",
        "机械工程学院",
        3,
        [
          { name: "机械设计制造及其自动化", code: "ME" },
          { name: "车辆工程", code: "VE" },
        ],
        ["学院办公室", "实验教学中心"]
      ),
      generateCollege(
        "admin",
        "行政教辅中心",
        4,
        [],
        [
          "教务处",
          "学生处",
          "人事处",
          "财务处",
          "图书馆",
          "信息中心",
          "后勤管理处",
        ]
      ),
    ],
  },
]

function computeMemberCount(nodes: OrgNode[]): OrgNode[] {
  return nodes.map((node) => {
    if (node.children && node.children.length > 0) {
      const children = computeMemberCount(node.children)
      return {
        ...node,
        children,
        memberCount: children.reduce((sum, child) => sum + child.memberCount, 0),
      }
    }
    return node
  })
}

function countByType(nodes: OrgNode[], type: OrgNodeType): number {
  let count = 0
  nodes.forEach((node) => {
    if (node.type === type) count += 1
    if (node.children) count += countByType(node.children, type)
  })
  return count
}

function totalMembers(nodes: OrgNode[]): number {
  return nodes.reduce((sum, node) => sum + node.memberCount, 0)
}

const typeMeta: Record<
  OrgNodeType,
  { icon: React.ElementType; color: string; badge: string }
> = {
  学校: { icon: School, color: "text-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  二级学院: { icon: Building2, color: "text-violet-600", badge: "bg-violet-50 text-violet-700 border-violet-200" },
  专业: { icon: BookOpen, color: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  班级: { icon: Users, color: "text-cyan-600", badge: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  行政职能部门: { icon: Briefcase, color: "text-rose-600", badge: "bg-rose-50 text-rose-700 border-rose-200" },
}

function TreeNode({
  node,
  level = 0,
  onToggle,
  onAction,
  groupLabel,
}: {
  node: OrgNode
  level?: number
  onToggle: (id: string) => void
  onAction: (action: string, node: OrgNode) => void
  groupLabel?: string
}) {
  const hasChildren = node.children && node.children.length > 0
  const meta = typeMeta[node.type]
  const Icon = meta.icon

  const studentChildren =
    node.type === "二级学院"
      ? node.children?.filter((c) => c.type !== "行政职能部门") || []
      : []
  const teacherChildren =
    node.type === "二级学院"
      ? node.children?.filter((c) => c.type === "行政职能部门") || []
      : []
  const normalChildren =
    node.type !== "二级学院" ? node.children || [] : []

  return (
    <div>
      {groupLabel && (
        <div
          className={cn(
            "flex items-center gap-2 py-1.5 px-3 text-xs font-medium text-muted-foreground",
            level > 0 && "ml-6"
          )}
        >
          <div className="w-5" />
          <Badge variant="secondary" className="text-[10px]">
            {groupLabel}
          </Badge>
        </div>
      )}
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 hover:bg-muted rounded-lg group transition-colors",
          level > 0 && "ml-6"
        )}
      >
        <button
          onClick={() => onToggle(node.id)}
          className="w-5 h-5 flex items-center justify-center"
        >
          {hasChildren ? (
            node.expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>
        <Icon className={cn("w-4 h-4", meta.color)} />
        <span className="flex-1 text-sm font-medium truncate">{node.name}</span>
        {node.gradeLabel && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground mr-1 shrink-0">{node.gradeLabel}</span>
        )}
        <Badge variant="outline" className={cn("text-xs shrink-0", meta.badge)}>
          {node.type}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-[3rem] justify-end">
          <Users className="w-3 h-3" />
          {node.memberCount}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAction("addChild", node)}>
              <Plus className="mr-2 h-4 w-4" />
              添加子节点
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("addParent", node)}>
              <ArrowUp className="mr-2 h-4 w-4" />
              添加父节点
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("edit", node)}>
              <Pencil className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("members", node)}>
              <Users className="mr-2 h-4 w-4" />
              成员管理
            </DropdownMenuItem>
            {node.type === "班级" && (
              <DropdownMenuItem onClick={() => onAction("graduate", node)}>
                <GraduationCap className="mr-2 h-4 w-4" />
                批量毕业
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction("delete", node)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && node.expanded && (
        <div>
          {node.type === "二级学院" && studentChildren.length > 0 && (
            <>
              <div className="flex items-center gap-2 py-1 px-3 ml-6">
                <div className="w-5" />
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <GraduationCap className="w-3 h-3" />
                  学生线：专业 / 班级
                </span>
                <div className="flex-1 h-px bg-emerald-100" />
              </div>
              {studentChildren.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  onToggle={onToggle}
                  onAction={onAction}
                />
              ))}
            </>
          )}

          {node.type === "二级学院" && teacherChildren.length > 0 && (
            <>
              <div className="flex items-center gap-2 py-1 px-3 ml-6">
                <div className="w-5" />
                <span className="flex items-center gap-1 text-xs font-semibold text-rose-600">
                  <Briefcase className="w-3 h-3" />
                  教师线：行政职能部门
                </span>
                <div className="flex-1 h-px bg-rose-100" />
              </div>
              {teacherChildren.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  onToggle={onToggle}
                  onAction={onAction}
                />
              ))}
            </>
          )}

          {normalChildren.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrgStructurePage() {
  const [orgData, setOrgData] = useState<OrgNode[]>(() =>
    computeMemberCount(rawMockOrgData)
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"add" | "edit" | "members">("add")
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)

  const stats = useMemo(() => {
    return {
      school: countByType(orgData, "学校"),
      college: countByType(orgData, "二级学院"),
      major: countByType(orgData, "专业"),
      class: countByType(orgData, "班级"),
      department: countByType(orgData, "行政职能部门"),
      members: totalMembers(orgData),
    }
  }, [orgData])

  const toggleNode = (id: string) => {
    const toggle = (nodes: OrgNode[]): OrgNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, expanded: !node.expanded }
        }
        if (node.children) {
          return { ...node, children: toggle(node.children) }
        }
        return node
      })
    }
    setOrgData(toggle(orgData))
  }

  const handleAction = (action: string, node: OrgNode) => {
    setSelectedNode(node)
    if (action === "addChild" || action === "addParent") {
      setDialogType("add")
      setIsDialogOpen(true)
    } else if (action === "edit") {
      setDialogType("edit")
      setIsDialogOpen(true)
    } else if (action === "members") {
      setDialogType("members")
      setIsDialogOpen(true)
    }
  }

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">组织架构管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理学校组织架构树，同时维护学生线与教师线的组织归属
          </p>
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
          <Button
            size="sm"
            onClick={() => {
              setSelectedNode(null)
              setDialogType("add")
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            新增节点
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">学校</div>
          <div className="mt-1 text-xl font-semibold text-blue-600">{stats.school}</div>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">二级学院</div>
          <div className="mt-1 text-xl font-semibold text-violet-600">{stats.college}</div>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">专业</div>
          <div className="mt-1 text-xl font-semibold text-emerald-600">{stats.major}</div>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">班级</div>
          <div className="mt-1 text-xl font-semibold text-cyan-600">{stats.class}</div>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">职能部门</div>
          <div className="mt-1 text-xl font-semibold text-rose-600">{stats.department}</div>
        </div>
        <div className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">总人数</div>
          <div className="mt-1 text-xl font-semibold text-foreground">{stats.members}</div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm font-medium">
            <LayoutList className="w-4 h-4 text-muted-foreground" />
            组织架构树
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">学生线</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-muted-foreground">教师线</span>
            </div>
          </div>
        </div>
        <ScrollArea className="h-[600px] p-4">
          {orgData.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              onToggle={toggleNode}
              onAction={handleAction}
            />
          ))}
        </ScrollArea>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "add"
                ? "新增节点"
                : dialogType === "edit"
                ? "编辑节点"
                : "成员管理"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "members"
                ? `管理 ${selectedNode?.name} 的组织成员`
                : "配置组织节点信息"}
            </DialogDescription>
          </DialogHeader>
          {dialogType !== "members" ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>节点名称</Label>
                <Input
                  placeholder="如：信息学院"
                  defaultValue={dialogType === "edit" ? selectedNode?.name : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label>节点类型</Label>
                <Select
                  defaultValue={dialogType === "edit" ? selectedNode?.type : undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="学校">学校</SelectItem>
                    <SelectItem value="二级学院">二级学院</SelectItem>
                    <SelectItem value="专业">专业</SelectItem>
                    <SelectItem value="班级">班级</SelectItem>
                    <SelectItem value="行政职能部门">行政职能部门</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>排序序号</Label>
                <Input
                  type="number"
                  placeholder="1"
                  defaultValue={dialogType === "edit" ? selectedNode?.order : 1}
                />
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">主归属成员</span>
                  <Badge>{selectedNode?.memberCount || 0} 人</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">兼职归属成员</span>
                  <Badge variant="outline">5 人</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">教学归属成员</span>
                  <Badge variant="outline">8 人</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Users className="h-4 w-4 mr-1" />
                管理成员
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setIsDialogOpen(false)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
