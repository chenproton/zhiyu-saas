"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  Search,
  Filter,
  Shield,
  Upload,
  FileKey,
  Users,
  X,
} from "lucide-react"

interface Admin {
  id: string
  name: string
  account: string
  phone: string
}

interface Tenant {
  id: string
  code: string
  enterpriseName: string
  contact: string
  phone: string
  admins: Admin[]
  userCount: number
  domain: string
  address: string
  enterpriseCode: string
  description: string
  status: "active" | "inactive"
  createdAt: string
}

const mockTenants: Tenant[] = []

export default function TenantPage() {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [isLicenseDialogOpen, setIsLicenseDialogOpen] = useState(false)
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingAdmins, setEditingAdmins] = useState<Admin[]>([])
  const [newAdmin, setNewAdmin] = useState({ name: "", account: "", phone: "" })

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.enterpriseName.includes(searchTerm) ||
      tenant.code.includes(searchTerm) ||
      tenant.contact.includes(searchTerm)
  )

  const toggleStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t
      )
    )
  }

  const deleteTenant = (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id))
  }

  const openAdminDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setEditingAdmins([...tenant.admins])
    setNewAdmin({ name: "", account: "", phone: "" })
    setIsAdminDialogOpen(true)
  }

  const addAdmin = () => {
    if (newAdmin.name && newAdmin.account) {
      setEditingAdmins([...editingAdmins, { id: `new-${Date.now()}`, ...newAdmin }])
      setNewAdmin({ name: "", account: "", phone: "" })
    }
  }

  const removeAdmin = (adminId: string) => {
    setEditingAdmins(editingAdmins.filter(a => a.id !== adminId))
  }

  const saveAdmins = () => {
    if (selectedTenant) {
      setTenants(prev => prev.map(t => 
        t.id === selectedTenant.id ? { ...t, admins: editingAdmins } : t
      ))
      setIsAdminDialogOpen(false)
    }
  }

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">租户信息管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理平台租户，配置租户权限和资源</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsLicenseDialogOpen(true)} size="sm">
            <FileKey className="h-4 w-4 mr-1" />
            导入License
          </Button>
          <Button onClick={() => { setSelectedTenant(null); setIsCreateDialogOpen(true) }} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            新增租户
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索企业名称、标识或联系人..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1" />
          筛选
        </Button>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">租户标识</TableHead>
              <TableHead className="text-muted-foreground">企业名称</TableHead>
              <TableHead className="text-muted-foreground">联系人</TableHead>
              <TableHead className="text-muted-foreground">联系电话</TableHead>
              <TableHead className="text-muted-foreground">管理员</TableHead>
              <TableHead className="text-muted-foreground">用户数量</TableHead>
              <TableHead className="text-muted-foreground">状态</TableHead>
              <TableHead className="text-muted-foreground">创建时间</TableHead>
              <TableHead className="text-muted-foreground text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id} className="border-border">
                <TableCell className="font-mono text-sm text-muted-foreground">{tenant.code}</TableCell>
                <TableCell className="font-medium">{tenant.enterpriseName}</TableCell>
                <TableCell>{tenant.contact}</TableCell>
                <TableCell className="text-muted-foreground">{tenant.phone}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto py-1 px-2 text-primary"
                    onClick={() => openAdminDialog(tenant)}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {tenant.admins.length}人
                  </Button>
                </TableCell>
                <TableCell>{tenant.userCount}</TableCell>
                <TableCell>
                  <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                    {tenant.status === "active" ? "启用" : "停用"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{tenant.createdAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedTenant(tenant); setIsCreateDialogOpen(true) }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAdminDialog(tenant)}>
                        <Users className="mr-2 h-4 w-4" />
                        管理员管理
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedTenant(tenant); setIsPermissionDialogOpen(true) }}>
                        <Shield className="mr-2 h-4 w-4" />
                        权限资源管理
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(tenant.id)}>
                        <Power className="mr-2 h-4 w-4" />
                        {tenant.status === "active" ? "停用" : "启用"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTenant(tenant.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>共 {filteredTenants.length} 条记录</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <span className="px-2">1 / 1</span>
          <Button variant="outline" size="sm" disabled>下一页</Button>
        </div>
      </div>

      {/* 管理员管理对话框 */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>管理员管理</DialogTitle>
            <DialogDescription>管理 {selectedTenant?.enterpriseName} 的管理员账号</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* 现有管理员列表 */}
            <div>
              <Label className="mb-2 block">现有管理员 ({editingAdmins.length}人)</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editingAdmins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-medium">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{admin.name}</div>
                        <div className="text-xs text-muted-foreground">账号：{admin.account} | 电话：{admin.phone || "-"}</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAdmin(admin.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {editingAdmins.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">暂无管理员</div>
                )}
              </div>
            </div>

            {/* 添加新管理员 */}
            <div className="border-t pt-4">
              <Label className="mb-2 block">添加管理员</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input 
                  placeholder="姓名" 
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                />
                <Input 
                  placeholder="登录账号" 
                  value={newAdmin.account}
                  onChange={(e) => setNewAdmin({ ...newAdmin, account: e.target.value })}
                />
                <Input 
                  placeholder="手机号（选填）" 
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={addAdmin}
                disabled={!newAdmin.name || !newAdmin.account}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)}>取消</Button>
            <Button onClick={saveAdmins}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入License对话框 */}
      <Dialog open={isLicenseDialogOpen} onOpenChange={setIsLicenseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>导入License</DialogTitle>
            <DialogDescription>上传License文件以导入租户配置和资源</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">点击或拖拽上传License文件</p>
              <p className="text-xs text-gray-400">支持 .lic, .license 格式</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                License文件包含租户配置、资源编码、套餐信息等数据，导入后将自动创建租户和相关资源。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLicenseDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsLicenseDialogOpen(false)}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增/编辑租户对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTenant ? "编辑租户" : "新增租户"}</DialogTitle>
            <DialogDescription>{selectedTenant ? "修改租户信息，租户标识创建后不可修改" : "创建新的租户"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>租户唯一标识</Label>
                <Input value={selectedTenant?.code || "系统自动生成"} disabled className="bg-muted font-mono" />
              </div>
              <div className="grid gap-2">
                <Label>租户状态</Label>
                <Select defaultValue={selectedTenant?.status || "active"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="inactive">停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>企业名称 <span className="text-destructive">*</span></Label>
              <Input placeholder="如：清华大学" defaultValue={selectedTenant?.enterpriseName} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>联系人 <span className="text-destructive">*</span></Label>
                <Input placeholder="企业联系人姓名" defaultValue={selectedTenant?.contact} />
              </div>
              <div className="grid gap-2">
                <Label>联系电话 <span className="text-destructive">*</span></Label>
                <Input placeholder="联系电话" defaultValue={selectedTenant?.phone} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>用户数量</Label>
                <Input type="number" placeholder="最大用户数" defaultValue={selectedTenant?.userCount} />
              </div>
              <div className="grid gap-2">
                <Label>绑定域名</Label>
                <Input placeholder="如：xxx.edu.cn" defaultValue={selectedTenant?.domain} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>企业地址</Label>
              <Input placeholder="企业详细地址" defaultValue={selectedTenant?.address} />
            </div>
            <div className="grid gap-2">
              <Label>企业代码</Label>
              <Input placeholder="统一社会信用代码" defaultValue={selectedTenant?.enterpriseCode} />
            </div>
            <div className="grid gap-2">
              <Label>企业简介</Label>
              <Textarea placeholder="企业简介描述" defaultValue={selectedTenant?.description} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>{selectedTenant ? "保存" : "创建"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 权限资源管理对话框 */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>租户权限资源管理</DialogTitle>
            <DialogDescription>为 {selectedTenant?.enterpriseName} 配置可访问的系统资源和权限</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-3 font-medium">系统模块权限</h4>
              <div className="grid grid-cols-2 gap-3">
                {["基础数据管理", "组织架构管理", "用户管理", "职位管理", "角色权限", "系统设置"].map((module) => (
                  <label key={module} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border" />
                    <span className="text-sm">{module}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-3 font-medium">数据容量限制</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">最大用户数</span>
                  <Input className="w-32" type="number" defaultValue="1000" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">存储空间 (GB)</span>
                  <Input className="w-32" type="number" defaultValue="100" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>取消</Button>
            <Button onClick={() => setIsPermissionDialogOpen(false)}>保存配置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
