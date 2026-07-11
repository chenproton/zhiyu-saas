// @ts-nocheck
"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, UserPlus, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { userManagementApi } from "@/lib/api"
import type { User } from "@/lib/types"

type Role = 'editor' | 'viewer'

interface SelectedUser {
  user: User
  role: Role
}

interface InviteCollaboratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  existingCollaboratorIds?: string[]
  onInvite: (users: { userId: string; role: Role }[]) => void
}

const ROLE_LABELS: Record<Role, string> = {
  editor: '可编辑',
  viewer: '仅查看',
}

export function InviteCollaboratorDialog({
  open,
  onOpenChange,
  title,
  description,
  existingCollaboratorIds = [],
  onInvite,
}: InviteCollaboratorDialogProps) {
  const [search, setSearch] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    userManagementApi.list({ limit: 1000 })
      .then((res) => {
        if (!cancelled) setUsers(res.items)
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load users', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [open])

  // 过滤可选用户（排除已有协作者和已选择的用户）
  const availableUsers = useMemo(() => {
    const selectedIds = selectedUsers.map(s => s.user.id)
    return users.filter(user =>
      !existingCollaboratorIds.includes(user.id) &&
      !selectedIds.includes(user.id) &&
      (user.name.includes(search) || user.email.includes(search) || user.department?.includes(search))
    )
  }, [search, selectedUsers, existingCollaboratorIds, users])

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => [...prev, { user, role: 'editor' }])
    setSearch("")
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(s => s.user.id !== userId))
  }

  const handleRoleChange = (userId: string, role: Role) => {
    setSelectedUsers(prev => 
      prev.map(s => s.user.id === userId ? { ...s, role } : s)
    )
  }

  const handleInvite = () => {
    onInvite(selectedUsers.map(s => ({ userId: s.user.id, role: s.role })))
    setSelectedUsers([])
    setSearch("")
    onOpenChange(false)
  }

  const handleClose = () => {
    setSelectedUsers([])
    setSearch("")
    onOpenChange(false)
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" annotationContext="invite-collaborator">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* 已选择的用户 */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(({ user, role }) => (
                <Badge
                  key={user.id}
                  variant="secondary"
                  className="flex items-center gap-1 py-1 pl-1 pr-2"
                >
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                  <Select
                    value={role}
                    onValueChange={(v) => handleRoleChange(user.id, v as Role)}
                  >
                    <SelectTrigger className="h-5 w-auto gap-1 border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="editor">可编辑</SelectItem>
                        <SelectItem value="viewer">仅查看</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索用户姓名、邮箱或部门..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 用户列表 */}
          <ScrollArea className="h-[240px] rounded-lg border">
            {loading ? (
              <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                加载用户中...
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
                {search ? "未找到匹配的用户" : "暂无可邀请的用户"}
              </div>
            ) : (
              <div className="flex flex-col">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                        {user.department && ` · ${user.department}`}
                      </p>
                    </div>
                    <Check className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleInvite} disabled={selectedUsers.length === 0}>
            邀请 {selectedUsers.length > 0 && `(${selectedUsers.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
