"use client"

import { useEffect, useMemo, useState } from "react"
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { orgApi, orgTypeApi } from "@/lib/api"
import type { Organization, OrgType } from "@/lib/types/backend"
import { usePortalAuth } from "@/contexts/portal-auth-context"

type OrgNodeType = string

interface OrgNode {
  id: string
  name: string
  type: OrgNodeType
  order: number
  memberCount: number
  children?: OrgNode[]
  expanded?: boolean
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

function typeMetaFor(typeName: string): { icon: React.ElementType; color: string; badge: string } {
  const map: Record<string, { icon: React.ElementType; color: string; badge: string }> = {
    "学校": { icon: School, color: "text-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200" },
    "二级学院": { icon: Building2, color: "text-violet-600", badge: "bg-violet-50 text-violet-700 border-violet-200" },
    "专业": { icon: BookOpen, color: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    "班级": { icon: Users, color: "text-cyan-600", badge: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    "行政职能部门": { icon: Briefcase, color: "text-rose-600", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  }
  return (
    map[typeName] ?? {
      icon: Building,
      color: "text-slate-600",
      badge: "bg-slate-50 text-slate-700 border-slate-200",
    }
  )
}

function TreeNode({
  node,
  level = 0,
  onToggle,
  onAction,
}: {
  node: OrgNode
  level?: number
  onToggle: (id: string) => void
  onAction: (action: string, node: OrgNode) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const meta = typeMetaFor(node.type)
  const Icon = meta.icon

  return (
    <div>
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
              className="h-7 w-7"
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
          {node.children!.map((child) => (
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
  const { tenantId } = usePortalAuth()
  const [orgData, setOrgData] = useState<OrgNode[]>([])
  const [typeNames, setTypeNames] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"add" | "edit" | "members">("add")
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)

  const buildTypeNameMap = (types: OrgType[]): Record<string, string> => {
    const map: Record<string, string> = {}
    types.forEach((t) => {
      map[t.id] = t.name
    })
    return map
  }

  const mapToOrgNode = (node: Organization & { children?: (Organization & { children?: any[] })[] }): OrgNode => {
    return {
      id: node.id,
      name: node.name,
      type: typeNames[node.typeId] || "组织",
      order: node.sortOrder,
      memberCount: node.memberCount,
      expanded: true,
      children: node.children?.map(mapToOrgNode),
    }
  }

  const fetchData = async () => {
    if (!tenantId) {
      setIsLoading(false)
      setError("未获取到租户信息，请重新登录")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const [treeRes, typesRes] = await Promise.all([
        orgApi.tree({ tenantId }),
        orgTypeApi.list({ tenantId, limit: 1000 }),
      ])
      const map = buildTypeNameMap(typesRes.items)
      setTypeNames(map)
      setOrgData(treeRes.items.map((node) => mapToOrgNode(node)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载组织架构失败")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId])

  const stats = useMemo(() => {
    const knownTypes = Object.values(typeNames)
    const statMap: Record<string, number> = { members: totalMembers(orgData) }
    knownTypes.forEach((type) => {
      statMap[type] = countByType(orgData, type)
    })
    return statMap
  }, [orgData, typeNames])

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

  const statEntries = useMemo(() => {
    return Object.entries(typeNames).map(([, name]) => ({ name, count: stats[name] || 0 }))
  }, [typeNames, stats])

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

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <Spinner className="h-5 w-5" />
          加载中...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {statEntries.slice(0, 5).map((entry) => (
              <div key={entry.name} className="rounded-lg border bg-white p-3 shadow-sm">
                <div className="text-xs text-muted-foreground">{entry.name}</div>
                <div className="mt-1 text-xl font-semibold text-foreground">{entry.count}</div>
              </div>
            ))}
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
            </div>
            <ScrollArea className="h-[600px] p-4">
              {orgData.length === 0 ? (
                <Empty className="h-full">
                  <EmptyHeader>
                    <EmptyTitle>暂无组织架构</EmptyTitle>
                    <EmptyDescription>当前租户下尚未创建组织架构节点</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                orgData.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    onToggle={toggleNode}
                    onAction={handleAction}
                  />
                ))
              )}
            </ScrollArea>
          </div>
        </>
      )}

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
                    {Object.values(typeNames).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
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
