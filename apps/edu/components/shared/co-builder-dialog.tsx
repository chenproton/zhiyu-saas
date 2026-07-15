// @ts-nocheck
"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, X, UserPlus, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { userManagementApi, orgApi } from "@/lib/api"
import type { User } from "@/lib/types"

interface CoBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  onChange: (ids: string[]) => void
  title?: string
  description?: string
  annotationContext?: string
}

interface DepartmentNode {
  id: string
  name: string
  users: User[]
}

export function CoBuilderDialog({
  open,
  onOpenChange,
  selectedIds,
  onChange,
  title = "选择共建人",
  description = "从组织架构中选择共建人",
  annotationContext = "co-builder",
}: CoBuilderDialogProps) {
  const leftScrollRef = useRef<HTMLDivElement>(null)
  const [users, setUsers] = useState<User[]>([])
  const [departmentTree, setDepartmentTree] = useState<DepartmentNode[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedDepts, setExpandedDepts] = useState<string[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      userManagementApi.list({ limit: 1000 }),
      orgApi.tree({}),
    ])
      .then(([usersRes, orgs]) => {
        if (cancelled) return
        const loadedUsers = usersRes.items
        const orgMap = new Map(orgs.map((o) => [o.name, o.id]))
        const usersByOrg = new Map<string, User[]>()
        loadedUsers.forEach((u) => {
          const orgName = u.department || '未分配部门'
          if (!usersByOrg.has(orgName)) usersByOrg.set(orgName, [])
          usersByOrg.get(orgName)!.push(u)
        })
        const tree: DepartmentNode[] = orgs
          .map((o) => ({ id: o.id, name: o.name, users: usersByOrg.get(o.name) || [] }))
          .filter((d) => d.users.length > 0)
        usersByOrg.forEach((deptUsers, name) => {
          if (!orgMap.has(name)) {
            tree.push({ id: name, name, users: deptUsers })
          }
        })
        setUsers(loadedUsers)
        setDepartmentTree(tree)
        setExpandedDepts(tree.map((d) => d.name))
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load co-builders', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [open])

  const filteredTeachers = useMemo(() => {
    if (!search) return users
    return users.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.department?.toLowerCase() || '').includes(search.toLowerCase())
    )
  }, [search, users])

  const selectedUsers = users.filter((t) => selectedIds.includes(t.id))

  const toggle = (userId: string) => {
    onChange(
      selectedIds.includes(userId)
        ? selectedIds.filter((id) => id !== userId)
        : [...selectedIds, userId]
    )
  }

  const toggleDept = (dept: string) => {
    setExpandedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    )
  }

  const handleClose = () => {
    setSearch("")
    onOpenChange(false)
  }

  const treeContent = useMemo(() => {
    return departmentTree.map((dept) => {
      const isExpanded = expandedDepts.includes(dept.name)
      const deptUsers = filteredTeachers.filter((t) => t.department === dept.name)
      if (deptUsers.length === 0) return null

      return (
        <div key={dept.id}>
          <button
            onClick={() => toggleDept(dept.name)}
            className="flex items-center gap-1 w-full px-1 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            {dept.name}
            <span className="ml-auto text-xs text-gray-400">
              {deptUsers.length}
            </span>
          </button>
          {isExpanded && (
            <div className="ml-4 space-y-0.5">
              {deptUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggle(user.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-50",
                    selectedIds.includes(user.id) &&
                      "bg-primary/5 text-primary"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                      selectedIds.includes(user.id)
                        ? "bg-primary border-primary"
                        : "border-gray-300"
                    )}
                  >
                    {selectedIds.includes(user.id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{user.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {user.department}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    })
  }, [departmentTree, expandedDepts, filteredTeachers, selectedIds, toggle, toggleDept])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[80vh] overflow-hidden flex flex-col" annotationContext={annotationContext} annotationContainerRef={leftScrollRef}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden py-4">
          {/* Shuttle Box */}
          <div className="border rounded-lg overflow-hidden h-full">
            {/* Search */}
            <div className="p-3 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索用户或部门..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>

            <div
              className="grid grid-cols-2 divide-x"
              style={{ minHeight: 400, maxHeight: 500 }}
            >
              {/* Left: Organization tree + users */}
              <div className="flex flex-col">
                <div className="px-3 py-2.5 bg-gray-50 border-b text-sm font-medium text-gray-500">
                  组织架构
                </div>
                <div ref={leftScrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 relative">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      加载中...
                    </div>
                  ) : (
                    treeContent
                  )}
                </div>
              </div>

              {/* Right: Selected users */}
              <div className="flex flex-col">
                <div className="px-3 py-2.5 bg-gray-50 border-b text-sm font-medium text-gray-500 flex items-center justify-between">
                  <span>已选共建人</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {selectedUsers.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {selectedUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <UserPlus className="h-8 w-8 mb-2" />
                      <span className="text-sm">从左侧面板选择共建人</span>
                    </div>
                  )}
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 px-2 py-2 rounded text-sm bg-primary/5 text-primary"
                    >
                      <span className="flex-1 truncate">{user.name}</span>
                      <span className="text-xs text-gray-400">
                        {user.department}
                      </span>
                      <button
                        onClick={() => toggle(user.id)}
                        className="ml-1 hover:bg-primary/10 rounded-full p-0.5"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            完成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
