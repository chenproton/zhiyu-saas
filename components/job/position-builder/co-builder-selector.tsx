'use client'

import { useState, useMemo, useEffect } from 'react'
import { UserPlus, X, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/components/auth-provider'
import { userManagementApi, orgApi } from '@/lib/api'
import type { User } from '@/lib/api'
import type { Organization } from '@/lib/types/backend'

interface OrgUser {
  id: string
  name: string
  role: string
  orgNodeId?: string
}

interface OrgDepartment {
  id: string
  name: string
  users: OrgUser[]
}

interface CoBuilderSelectorProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function CoBuilderSelector({ selectedIds, onChange }: CoBuilderSelectorProps) {
  const { user: currentUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set())
  const [users, setUsers] = useState<User[]>([])
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      userManagementApi.list({ limit: 1000 }),
      orgApi.tree(),
    ])
      .then(([usersRes, orgsRes]) => {
        if (cancelled) return
        setUsers(usersRes.items || [])
        setOrgs(orgsRes || [])
        setExpandedDepts(new Set((orgsRes || []).map((o) => o.id)))
      })
      .catch(() => {
        if (cancelled) return
        setUsers([])
        setOrgs([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const userMap = useMemo(() => {
    const map = new Map<string, User>()
    users.forEach((u) => map.set(u.id, u))
    return map
  }, [users])

  const orgMap = useMemo(() => {
    const map = new Map<string, Organization>()
    orgs.forEach((o) => map.set(o.id, o))
    return map
  }, [orgs])

  const departments: OrgDepartment[] = useMemo(() => {
    const grouped = new Map<string, OrgUser[]>()
    users.forEach((u) => {
      const deptId = u.orgNodeId || 'unassigned'
      if (!grouped.has(deptId)) grouped.set(deptId, [])
      grouped.get(deptId)!.push({
        id: u.id,
        name: u.name || u.username,
        role: u.role,
        orgNodeId: u.orgNodeId,
      })
    })

    const result: OrgDepartment[] = []
    orgs.forEach((org) => {
      const deptUsers = grouped.get(org.id) || []
      if (deptUsers.length > 0) {
        result.push({ id: org.id, name: org.name, users: deptUsers })
      }
    })

    const unassigned = grouped.get('unassigned') || []
    if (unassigned.length > 0) {
      result.push({ id: 'unassigned', name: '未分配部门', users: unassigned })
    }

    return result
  }, [users, orgs])

  const selectedUsers = useMemo(() => {
    return draftIds
      .map((id) => userMap.get(id))
      .filter(Boolean)
      .map((u) => ({
        id: u!.id,
        name: u!.name || u!.username,
        deptName: u!.orgNodeId ? orgMap.get(u!.orgNodeId)?.name : undefined,
      }))
  }, [draftIds, userMap, orgMap])

  const toggleUser = (userId: string) => {
    setDraftIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const toggleDepartment = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId)
    if (!dept) return
    const deptUserIds = dept.users.map((u) => u.id)
    const allSelected = deptUserIds.every((id) => draftIds.includes(id))
    if (allSelected) {
      setDraftIds((prev) => prev.filter((id) => !deptUserIds.includes(id)))
    } else {
      setDraftIds((prev) => Array.from(new Set([...prev, ...deptUserIds])))
    }
  }

  const toggleDeptExpanded = (deptId: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev)
      if (next.has(deptId)) {
        next.delete(deptId)
      } else {
        next.add(deptId)
      }
      return next
    })
  }

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments
    const q = searchQuery.trim().toLowerCase()
    return departments
      .map((dept) => ({
        ...dept,
        users: dept.users.filter(
          (u) => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
        ),
      }))
      .filter((dept) => dept.name.toLowerCase().includes(q) || dept.users.length > 0)
  }, [searchQuery, departments])

  const handleOpen = () => {
    setDraftIds(selectedIds)
    setSearchQuery('')
    setExpandedDepts(new Set(orgs.map((o) => o.id)))
    setOpen(true)
  }

  const handleConfirm = () => {
    onChange(draftIds)
    setOpen(false)
  }

  const handleCancel = () => {
    setDraftIds(selectedIds)
    setOpen(false)
  }

  const displayNames = useMemo(() => {
    return selectedIds
      .map((id) => userMap.get(id))
      .filter(Boolean)
      .map((u) => u!.name || u!.username)
  }, [selectedIds, userMap])

  return (
    <>
      <div
        onClick={handleOpen}
        className="mt-1 flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent"
      >
        <UserPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
        {displayNames.length === 0 ? (
          <span className="text-muted-foreground">点击选择共建人</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {displayNames.map((name) => (
              <Badge
                key={name}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>选择共建人/共建部门</DialogTitle>
            <DialogDescription>从组织架构中选择共建人，选中的用户将参与该场景的建设</DialogDescription>
          </DialogHeader>

          <div className="px-6 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索用户或部门..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0 border-t">
            <div className="border-r p-4">
              <p className="mb-3 text-sm font-medium text-gray-700">组织架构</p>
              <ScrollArea className="h-[320px]">
                <div className="space-y-2 pr-3">
                  {loading && <p className="py-8 text-center text-sm text-muted-foreground">加载中...</p>}
                  {!loading && filteredDepartments.map((dept) => {
                    const deptUserIds = dept.users.map((u) => u.id)
                    const selectedCount = deptUserIds.filter((id) => draftIds.includes(id)).length
                    const isAllSelected =
                      dept.users.length > 0 && selectedCount === dept.users.length
                    const isIndeterminate =
                      selectedCount > 0 && selectedCount < dept.users.length

                    return (
                      <Collapsible
                        key={dept.id}
                        open={expandedDepts.has(dept.id)}
                        onOpenChange={() => toggleDeptExpanded(dept.id)}
                      >
                        <div className="rounded-md hover:bg-gray-50">
                          <div className="flex items-center justify-between px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={isAllSelected}
                                data-state={isIndeterminate ? 'indeterminate' : undefined}
                                onCheckedChange={() => toggleDepartment(dept.id)}
                              />
                              <span className="text-sm font-medium">{dept.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{dept.users.length}</span>
                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {expandedDepts.has(dept.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent>
                            <div className="ml-6 space-y-1 pb-1">
                              {dept.users.map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-gray-100"
                                >
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={draftIds.includes(user.id)}
                                      onCheckedChange={() => toggleUser(user.id)}
                                    />
                                    <span className="text-sm">{user.name}</span>
                                    {currentUser?.id === user.id && (
                                      <span className="text-[10px] text-muted-foreground">(我)</span>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{user.role}</span>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )
                  })}
                  {!loading && filteredDepartments.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">未找到匹配结果</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">已选共建人</p>
                <Badge variant="outline" className="text-xs">
                  {draftIds.length}
                </Badge>
              </div>
              <ScrollArea className="h-[320px]">
                <div className="space-y-2 pr-3">
                  {selectedUsers.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">暂未选择共建人</p>
                  )}
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-blue-700">{user.name}</p>
                        <p className="text-xs text-blue-600/70">{user.deptName || '未分配部门'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleUser(user.id)}
                        className="text-blue-600/70 hover:text-blue-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleConfirm}>完成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
