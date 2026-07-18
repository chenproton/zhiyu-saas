"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePortalUsers } from "@/hooks/use-portal-users"
import { useOrgTree } from "@/hooks/use-org-tree"
import { portalUserManagementApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { usePortalAuth } from "@/contexts/portal-auth-context"
import { Search, MoreHorizontal, Trash2, Loader2, AlertCircle, RotateCcw } from "lucide-react"

function mapAccountStatus(status: string): { label: string; className: string } {
  if (status === "active") {
    return { label: "正常", className: "bg-green-100 text-green-700" }
  }
  return { label: "禁用", className: "bg-red-100 text-red-700" }
}

export default function AccountsPage() {
  const { toast } = useToast()
  const { tenantId } = usePortalAuth()
  const [searchText, setSearchText] = useState("")
  const { users, loading, error, refetch } = usePortalUsers({
    search: searchText || undefined,
  })
  const { orgMap, orgTypeMap } = useOrgTree(tenantId)

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [batchDeleting, setBatchDeleting] = useState(false)

  const handleResetPassword = async (id: string, name: string) => {
    const password = window.prompt(`请输入 ${name} 的新密码：`)
    if (!password) return
    try {
      await portalUserManagementApi.resetPassword(id, password)
      toast({ title: "密码重置成功" })
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "重置失败", description: err instanceof Error ? err.message : "未知错误" })
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active"
    try {
      await portalUserManagementApi.updateStatus(id, nextStatus)
      toast({ title: nextStatus === "active" ? "账户已启用" : "账户已禁用" })
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "操作失败", description: err instanceof Error ? err.message : "未知错误" })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定要删除账户「${name}」吗？此操作不可撤销。`)) return
    try {
      await portalUserManagementApi.delete(id)
      toast({ title: "删除成功" })
      await refetch()
    } catch (err) {
      toast({ variant: "destructive", title: "删除失败", description: err instanceof Error ? err.message : "未知错误" })
    }
  }

  const toggleSelectAccount = (id: string) => {
    setSelectedAccounts((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedAccounts.length === accounts.length && accounts.length > 0) {
      setSelectedAccounts([])
    } else {
      setSelectedAccounts(accounts.map((a) => a.id))
    }
  }

  const handleBatchDelete = async () => {
    if (selectedAccounts.length === 0) return
    setBatchDeleting(true)
    let success = 0
    let fail = 0
    for (const id of selectedAccounts) {
      try {
        await portalUserManagementApi.delete(id)
        success++
      } catch {
        fail++
      }
    }
    setBatchDeleting(false)
    setSelectedAccounts([])
    if (success > 0) {
      toast({ title: `成功删除 ${success} 个账户` + (fail > 0 ? `，${fail} 个失败` : "") })
    }
    await refetch()
  }

  const accounts = users.map((user) => {
    const statusStyle = mapAccountStatus(user.status)
    const orgNode = user.orgNodeId ? orgMap.get(user.orgNodeId) : undefined
    const orgTypeName = orgNode ? orgTypeMap.get(orgNode.typeId)?.name : undefined
    return {
      id: user.id,
      name: user.name,
      roleNames: user.roleNames ?? [],
      orgNodeName: orgNode?.name || "—",
      orgTypeName: orgTypeName || undefined,
      loginName: user.loginName || user.username || "",
      rawLoginName: user.loginName || "",
      status: user.status,
      statusLabel: statusStyle.label,
      statusClassName: statusStyle.className,
      lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("zh-CN") : "—",
    }
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索姓名或账户..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedAccounts.length > 0 && (
            <Button variant="destructive" size="sm" disabled={batchDeleting} onClick={handleBatchDelete}>
              {batchDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              批量删除({selectedAccounts.length})
            </Button>
          )}
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

      <div className="bg-card rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedAccounts.length === accounts.length && accounts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>所属组织</TableHead>
              <TableHead>账户登录名</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最后登录时间</TableHead>
              <TableHead className="w-24 text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                  {searchText ? "未找到匹配的账户" : "暂无账户数据"}
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={() => toggleSelectAccount(account.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {account.roleNames.length > 0 ? (
                        account.roleNames.map((rn) => (
                          <span key={rn} className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">{rn}</span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span>{account.orgNodeName}</span>
                      {account.orgTypeName && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{account.orgTypeName}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{account.loginName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${account.statusClassName}`}>{account.statusLabel}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{account.lastLogin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleResetPassword(account.id, account.name)}>
                          重置密码
                        </DropdownMenuItem>
                        {account.status === "active" ? (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleToggleStatus(account.id, account.status)}>
                            禁用账户
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleToggleStatus(account.id, account.status)}>
                            启用账户
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(account.id, account.name)}>
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  )
}
