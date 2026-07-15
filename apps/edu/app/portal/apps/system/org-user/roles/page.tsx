"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Upload, Download, Eye, Settings, ChevronRight, ChevronDown, FolderTree, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { roleApi } from "@/lib/api"
import type { Role } from "@/lib/types/backend"
import { usePortalAuth } from "@/contexts/portal-auth-context"

let roleCounter = 5

const permissionTree = [
  {
    id: "system",
    name: "系统设置",
    children: [
      {
        id: "system-tenant",
        name: "租户管理",
        children: [
          { id: "system-tenant-view", name: "查看" },
          { id: "system-tenant-add", name: "新增" },
          { id: "system-tenant-edit", name: "编辑" },
          { id: "system-tenant-delete", name: "删除" },
        ],
      },
      {
        id: "system-resource",
        name: "资源管理",
        children: [
          { id: "system-resource-view", name: "查看" },
          { id: "system-resource-add", name: "新增" },
          { id: "system-resource-edit", name: "编辑" },
        ],
      },
    ],
  },
  {
    id: "org",
    name: "组织用户",
    children: [
      {
        id: "org-structure",
        name: "组织架构",
        children: [
          { id: "org-structure-view", name: "查看" },
          { id: "org-structure-add", name: "新增" },
          { id: "org-structure-edit", name: "编辑" },
          { id: "org-structure-delete", name: "删除" },
        ],
      },
      {
        id: "org-users",
        name: "用户管理",
        children: [
          { id: "org-users-view", name: "查看" },
          { id: "org-users-add", name: "新增" },
          { id: "org-users-edit", name: "编辑" },
          { id: "org-users-import", name: "导入" },
          { id: "org-users-export", name: "导出" },
        ],
      },
    ],
  },
]

const orgTree = [
  {
    id: "1",
    name: "清华大学",
    children: [
      { id: "1-1", name: "信息学院", children: [{ id: "1-1-1", name: "计算机系" }, { id: "1-1-2", name: "软件工程系" }] },
      { id: "1-2", name: "经济管理学院", children: [{ id: "1-2-1", name: "会计系" }] },
      { id: "1-3", name: "教务处" },
    ],
  },
]

function PermissionNode({ node, level = 0, checked, onCheck }: { node: any; level?: number; checked: Set<string>; onCheck: (id: string) => void }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div className={cn("flex items-center gap-2 py-1.5", level > 0 && "ml-6")}>
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="w-4 h-4">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <Checkbox checked={checked.has(node.id)} onCheckedChange={() => onCheck(node.id)} />
        <span className="text-sm">{node.name}</span>
      </div>
      {hasChildren && expanded && node.children.map((child: any) => (
        <PermissionNode key={child.id} node={child} level={level + 1} checked={checked} onCheck={onCheck} />
      ))}
    </div>
  )
}

function OrgNode({ node, level = 0, checked, onCheck }: { node: any; level?: number; checked: Set<string>; onCheck: (id: string) => void }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div className={cn("flex items-center gap-2 py-1.5", level > 0 && "ml-6")}>
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="w-4 h-4">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <Checkbox checked={checked.has(node.id)} onCheckedChange={() => onCheck(node.id)} />
        <FolderTree className="w-4 h-4 text-primary" />
        <span className="text-sm">{node.name}</span>
      </div>
      {hasChildren && expanded && node.children.map((child: any) => (
        <OrgNode key={child.id} node={child} level={level + 1} checked={checked} onCheck={onCheck} />
      ))}
    </div>
  )
}

export default function RolesPage() {
  const { tenantId } = usePortalAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPermDialogOpen, setIsPermDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [checkedPerms, setCheckedPerms] = useState<Set<string>>(new Set())
  const [checkedOrgs, setCheckedOrgs] = useState<Set<string>>(new Set())

  const fetchData = async () => {
    if (!tenantId) {
      setIsLoading(false)
      setError("未获取到租户信息，请重新登录")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await roleApi.list({ tenantId, search: searchTerm || undefined, limit: 1000 })
      setRoles(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载角色失败")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, searchTerm])

  const filteredRoles = useMemo(
    () => roles.filter((role) => role.name.includes(searchTerm) || role.code.includes(searchTerm)),
    [roles, searchTerm]
  )

  const generateRoleCode = () => {
    roleCounter++
    return `ROLE${String(roleCounter).padStart(3, "0")}`
  }

  const togglePerm = (id: string) => {
    setCheckedPerms((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleOrg = (id: string) => {
    setCheckedOrgs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const roleStatus = (role: Role): "active" | "inactive" => {
    if (role.status === "active" || role.status === "inactive") return role.status as "active" | "inactive"
    return role.status ? "active" : "inactive"
  }

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">角色权限管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理系统角色及权限配置</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            导入
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
          <Button size="sm" onClick={() => { setSelectedRole(null); setIsDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-1" />
            新增角色
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索角色名称或编码..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
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
          <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>角色编码</TableHead>
                  <TableHead>角色名称</TableHead>
                  <TableHead>关联用户</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <Empty className="h-full">
                        <EmptyHeader>
                          <EmptyTitle>暂无角色</EmptyTitle>
                          <EmptyDescription>
                            {searchTerm ? "未找到匹配的角色" : "当前租户下尚未创建角色"}
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => {
                    const status = roleStatus(role)
                    return (
                      <TableRow key={role.id} className="border-border">
                        <TableCell className="font-mono text-sm text-muted-foreground">{role.code}</TableCell>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{role.userCount} 人</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status === "active" ? "default" : "secondary"}>
                            {status === "active" ? "启用" : "停用"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{role.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedRole(role); setIsDialogOpen(true) }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedRole(role); setIsPermDialogOpen(true) }}>
                                <Settings className="mr-2 h-4 w-4" />
                                权限配置
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                查看用户
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">共 {filteredRoles.length} 条记录</div>
        </>
      )}

      {/* 新增/编辑角色 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRole ? "编辑角色" : "新增角色"}</DialogTitle>
            <DialogDescription>角色编码由系统自动生成</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>角色编码</Label>
              <Input value={selectedRole?.code || generateRoleCode()} disabled className="bg-muted font-mono" />
            </div>
            <div className="grid gap-2">
              <Label>角色名称</Label>
              <Input placeholder="如：学校管理员" defaultValue={selectedRole?.name} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsDialogOpen(false)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 权限配置 */}
      <Dialog open={isPermDialogOpen} onOpenChange={setIsPermDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>权限配置 - {selectedRole?.name}</DialogTitle>
            <DialogDescription>配置角色的系统权限和数据权限</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="system" className="mt-4">
            <TabsList>
              <TabsTrigger value="system">系统权限绑定</TabsTrigger>
              <TabsTrigger value="data">数据权限设置</TabsTrigger>
            </TabsList>
            <TabsContent value="system" className="mt-4">
              <div className="text-sm text-muted-foreground mb-3">选择角色可访问的模块、页面和按钮</div>
              <ScrollArea className="h-[300px] border border-border rounded-lg p-4">
                {permissionTree.map((node) => (
                  <PermissionNode key={node.id} node={node} checked={checkedPerms} onCheck={togglePerm} />
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="data" className="mt-4">
              <div className="text-sm text-muted-foreground mb-3">选择角色可访问的组织数据范围</div>
              <ScrollArea className="h-[300px] border border-border rounded-lg p-4">
                {orgTree.map((node) => (
                  <OrgNode key={node.id} node={node} checked={checkedOrgs} onCheck={toggleOrg} />
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPermDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsPermDialogOpen(false)}>保存配置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
