"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePortalUsers } from "@/hooks/use-portal-users"
import { portalUserManagementApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Search, MoreHorizontal, Key, Ban, CheckCircle, Loader2, AlertCircle, RotateCcw } from "lucide-react"

function mapAccountStatus(status: string): { label: string; className: string } {
  if (status === "active") {
    return { label: "正常", className: "bg-green-100 text-green-700" }
  }
  return { label: "禁用", className: "bg-red-100 text-red-700" }
}

export default function AccountsPage() {
  const { toast } = useToast()
  const [searchText, setSearchText] = useState("")
  const { users, identityTypeMap, loading, error, refetch } = usePortalUsers({
    search: searchText || undefined,
  })

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

  const accounts = users.map((user) => {
    const idType = user.identityTypeId ? identityTypeMap.get(user.identityTypeId) : undefined
    const statusStyle = mapAccountStatus(user.status)
    return {
      id: user.id,
      name: user.name,
      identityType: idType?.name || "—",
      loginName: user.loginName || user.username,
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
              <TableHead className="w-12">序号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>身份类型</TableHead>
              <TableHead>账户登录名</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最后登录时间</TableHead>
              <TableHead className="w-24 text-center">操作</TableHead>
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
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  {searchText ? "未找到匹配的账户" : "暂无账户数据"}
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account, index) => (
                <TableRow key={account.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">{account.identityType}</span>
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
                          <Key className="h-4 w-4 mr-2" />
                          重置密码
                        </DropdownMenuItem>
                        {account.statusLabel === "正常" ? (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleToggleStatus(account.id, account.status)}>
                            <Ban className="h-4 w-4 mr-2" />
                            禁用账户
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleToggleStatus(account.id, account.status)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            启用账户
                          </DropdownMenuItem>
                        )}
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
