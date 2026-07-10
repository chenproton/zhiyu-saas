'use client'

import { useState, useMemo } from 'react'
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

interface OrgUser {
  id: string
  name: string
  role: string
}

interface OrgDepartment {
  id: string
  name: string
  users: OrgUser[]
}

const MOCK_DEPARTMENTS: OrgDepartment[] = [
  {
    id: 'dept-1',
    name: '信息工程系',
    users: [
      { id: 'user-1', name: '张老师', role: '建设者' },
      { id: 'user-2', name: '李老师', role: '建设者' },
      { id: 'user-3', name: '陈老师', role: '建设者' },
      { id: 'user-4', name: '杨老师', role: '建设者' },
    ],
  },
  {
    id: 'dept-2',
    name: '经济管理系',
    users: [
      { id: 'user-5', name: '王老师', role: '审批人' },
      { id: 'user-6', name: '赵老师', role: '建设者' },
      { id: 'user-7', name: '吴老师', role: '建设者' },
    ],
  },
  {
    id: 'dept-3',
    name: '教务处',
    users: [
      { id: 'user-8', name: '刘老师', role: '管理员' },
      { id: 'user-9', name: '何老师', role: '管理员' },
    ],
  },
]

interface CoBuilderSelectorProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function CoBuilderSelector({ selectedIds, onChange }: CoBuilderSelectorProps) {
  const [open, setOpen] = useState(false)
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(
    () => new Set(MOCK_DEPARTMENTS.map((d) => d.id))
  )

  const selectedUsers = useMemo(() => {
    const list: OrgUser[] = []
    MOCK_DEPARTMENTS.forEach((dept) => {
      dept.users.forEach((user) => {
        if (draftIds.includes(user.id)) {
          list.push({ ...user, deptName: dept.name } as OrgUser & { deptName: string })
        }
      })
    })
    return list as (OrgUser & { deptName: string })[]
  }, [draftIds])

  const toggleUser = (userId: string) => {
    setDraftIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const toggleDepartment = (deptId: string) => {
    const dept = MOCK_DEPARTMENTS.find((d) => d.id === deptId)
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
    if (!searchQuery.trim()) return MOCK_DEPARTMENTS
    const q = searchQuery.trim().toLowerCase()
    return MOCK_DEPARTMENTS.map((dept) => ({
      ...dept,
      users: dept.users.filter(
        (u) => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
      ),
    })).filter((dept) => dept.name.toLowerCase().includes(q) || dept.users.length > 0)
  }, [searchQuery])

  const handleOpen = () => {
    setDraftIds(selectedIds)
    setSearchQuery('')
    setExpandedDepts(new Set(MOCK_DEPARTMENTS.map((d) => d.id)))
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

  const allUserIds = useMemo(
    () => MOCK_DEPARTMENTS.flatMap((d) => d.users.map((u) => u.id)),
    []
  )

  const displayNames = useMemo(() => {
    return selectedIds
      .map((id) => {
        for (const dept of MOCK_DEPARTMENTS) {
          const user = dept.users.find((u) => u.id === id)
          if (user) return user.name
        }
        return null
      })
      .filter(Boolean) as string[]
  }, [selectedIds])

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
                  {filteredDepartments.map((dept) => {
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
                  {filteredDepartments.length === 0 && (
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
                        <p className="text-xs text-blue-600/70">{user.deptName}</p>
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
