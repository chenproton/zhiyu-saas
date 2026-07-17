"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { orgApi, orgTypeApi } from "@/lib/api"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import type { Organization, OrgType } from "@/lib/types/backend"
import { usePortalAuth } from "@/contexts/portal-auth-context"
import { useToast } from "@/hooks/use-toast"

type OrgNodeType = string

interface OrgNode {
  id: string
  name: string
  type: OrgNodeType
  typeId: string
  parentId?: string
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
  highlightedId,
  registerRef,
}: {
  node: OrgNode
  level?: number
  onToggle: (id: string) => void
  onAction: (action: string, node: OrgNode) => void
  highlightedId?: string | null
  registerRef?: (id: string, el: HTMLDivElement | null) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const meta = typeMetaFor(node.type)
  const Icon = meta.icon
  const isHighlighted = highlightedId === node.id

  return (
    <div ref={(el) => registerRef?.(node.id, el)}>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 hover:bg-muted rounded-lg group transition-colors",
          isHighlighted && "bg-yellow-100 ring-1 ring-yellow-300"
        )}
        style={{ marginLeft: level * 24 }}
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
              添加子节点
            </DropdownMenuItem>
            {level > 0 && (
              <DropdownMenuItem onClick={() => onAction("addParent", node)}>
                添加父节点
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onAction("edit", node)}>
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("members", node)}>
              成员管理
            </DropdownMenuItem>
            {node.type === "班级" && (
              <DropdownMenuItem onClick={() => onAction("graduate", node)}>
                批量毕业
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction("delete", node)}
              className="text-destructive"
            >
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
              highlightedId={highlightedId}
              registerRef={registerRef}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrgStructurePage() {
  const { tenantId } = usePortalAuth()
  const { toast } = useToast()
  const [orgData, setOrgData] = useState<OrgNode[]>([])
  const [orgTypes, setOrgTypes] = useState<OrgType[]>([])
  const [typeNames, setTypeNames] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"addRoot" | "addChild" | "addParent" | "edit" | "members">("addRoot")
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)
  const [formName, setFormName] = useState("")
  const [formTypeId, setFormTypeId] = useState("")
  const [formSortOrder, setFormSortOrder] = useState<string>("1")
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OrgNode | null>(null)
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const buildTypeNameMap = (types: OrgType[]): Record<string, string> => {
    const map: Record<string, string> = {}
    types.forEach((t) => {
      map[t.id] = t.name
    })
    return map
  }

  const mapToOrgNode = (
    node: Organization & { children?: (Organization & { children?: any[] })[] },
    typeMap: Record<string, string>
  ): OrgNode => {
    const sortedChildren = node.children
      ? [...node.children].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((child) => mapToOrgNode(child, typeMap))
      : undefined
    return {
      id: node.id,
      name: node.name,
      type: typeMap[node.typeId] || "组织",
      typeId: node.typeId,
      parentId: node.parentId,
      order: node.sortOrder,
      memberCount: node.memberCount,
      expanded: true,
      children: sortedChildren,
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
      setOrgTypes(typesRes.items)
      setTypeNames(map)
      setOrgData(treeRes.items.map((node) => mapToOrgNode(node, map)))
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

  const registerNodeRef = (id: string, el: HTMLDivElement | null) => {
    nodeRefs.current[id] = el
  }

  useEffect(() => {
    if (!highlightedId) return
    const el = nodeRefs.current[highlightedId]
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      const timer = setTimeout(() => setHighlightedId(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [highlightedId, orgData])

  const openDialog = (mode: typeof dialogMode, node: OrgNode | null = null) => {
    setDialogMode(mode)
    setSelectedNode(node)
    setFormError(null)
    if (mode === "edit" && node) {
      setFormName(node.name)
      setFormTypeId(node.typeId)
      setFormSortOrder(String(node.order))
    } else if (mode === "addChild" && node) {
      setFormName("")
      setFormTypeId("")
      setFormSortOrder(String(node.children ? node.children.length + 1 : 1))
    } else if (mode === "addParent" && node) {
      setFormName("")
      setFormTypeId("")
      setFormSortOrder("1")
    } else {
      setFormName("")
      setFormTypeId("")
      setFormSortOrder(String(orgData.length + 1))
    }
    setIsDialogOpen(true)
  }

  const handleAction = (action: string, node: OrgNode) => {
    if (action === "addChild") {
      openDialog("addChild", node)
    } else if (action === "addParent") {
      openDialog("addParent", node)
    } else if (action === "edit") {
      openDialog("edit", node)
    } else if (action === "members") {
      openDialog("members", node)
    } else if (action === "delete") {
      handleDelete(node)
    }
  }

  const handleSave = async () => {
    if (!tenantId) {
      toast({ variant: "destructive", title: "保存失败", description: "未获取到租户信息，请重新登录" })
      return
    }
    if (!formName.trim() || !formTypeId) {
      setFormError("请填写节点名称并选择类型")
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      let targetId: string | null = null
      let toastTitle = ""
      let toastDescription = ""

      if (dialogMode === "edit" && selectedNode) {
        await orgApi.update(selectedNode.id, {
          tenantId,
          name: formName.trim(),
          typeId: formTypeId,
          sortOrder: Number(formSortOrder) || 0,
        })
        targetId = selectedNode.id
        toastTitle = "保存成功"
        toastDescription = `组织节点「${formName.trim()}」已更新`
      } else {
        let parentId: string | undefined
        if (dialogMode === "addChild" && selectedNode) {
          parentId = selectedNode.id
        } else if (dialogMode === "addParent" && selectedNode) {
          parentId = selectedNode.parentId
        }
        const newNode = await orgApi.create({
          tenantId,
          name: formName.trim(),
          typeId: formTypeId,
          parentId,
          sortOrder: Number(formSortOrder) || 0,
          memberCount: 0,
        })
        targetId = newNode.id
        if (dialogMode === "addParent" && selectedNode) {
          await orgApi.update(selectedNode.id, { parentId: newNode.id })
        }
        if (dialogMode === "addChild" && selectedNode) {
          toastTitle = "创建成功"
          toastDescription = `已在「${selectedNode.name}」下添加「${newNode.name}」`
        } else if (dialogMode === "addParent" && selectedNode) {
          toastTitle = "创建成功"
          toastDescription = `已为「${selectedNode.name}」添加父节点「${newNode.name}」`
        } else {
          toastTitle = "创建成功"
          toastDescription = `已添加根节点「${newNode.name}」`
        }
      }

      await fetchData()
      if (targetId) {
        setHighlightedId(targetId)
      }
      setIsDialogOpen(false)
      toast({ title: toastTitle, description: toastDescription })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "保存失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (node: OrgNode) => {
    setDeleteTarget(node)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await orgApi.delete(deleteTarget.id)
      toast({ title: "删除成功" })
      await fetchData()
    } catch (err) {
      toast({ variant: "destructive", title: "删除失败", description: err instanceof Error ? err.message : "未知错误" })
    } finally {
      setDeleteTarget(null)
    }
  }

  const statEntries = useMemo(() => {
    return Object.entries(typeNames).map(([, name]) => ({ name, count: stats[name] || 0 }))
  }, [typeNames, stats])

  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <Spinner className="h-5 w-5" />
        加载中...
      </div>
    )
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
            onClick={() => openDialog("addRoot")}
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
                    highlightedId={highlightedId}
                    registerRef={registerNodeRef}
                  />
                ))
              )}
            </ScrollArea>
          </div>
        </>
      )}

      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDialogOpen(false)
          }}
        >
          <div className="bg-background w-full max-w-[500px] rounded-lg border p-6 shadow-lg">
            <div className="flex flex-col gap-2 text-center sm:text-left mb-4">
              <h2 className="text-lg font-semibold">
                {dialogMode === "addRoot"
                  ? "新增节点"
                  : dialogMode === "addChild"
                  ? `添加子节点：${selectedNode?.name}`
                  : dialogMode === "addParent"
                  ? `为 ${selectedNode?.name} 添加父节点`
                  : dialogMode === "edit"
                  ? "编辑节点"
                  : "成员管理"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {dialogMode === "members"
                  ? `管理 ${selectedNode?.name} 的组织成员`
                  : "配置组织节点信息"}
              </p>
            </div>
            {dialogMode !== "members" ? (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>节点名称</Label>
                  <Input
                    placeholder="如：信息学院"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>节点类型</Label>
                  <Select value={formTypeId} onValueChange={setFormTypeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
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
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(e.target.value)}
                  />
                </div>
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>保存失败</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
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
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                取消
              </Button>
              {dialogMode !== "members" && (
                <Button onClick={handleSave} disabled={saving || !formName.trim() || !formTypeId}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  保存
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="确认删除"
        description={`确定删除组织节点「${deleteTarget?.name}」吗？如果该节点下还有子节点或成员，删除可能会失败。`}
        confirmText="删除"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
