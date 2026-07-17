"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plus, Pencil, Trash2, Search, AlertCircle } from "lucide-react"
import { identityTypeApi } from "@/lib/api"
import type { IdentityType } from "@/lib/types/backend"
import { usePortalAuth } from "@/contexts/portal-auth-context"

export default function IdentityTypesPage() {
  const { tenantId } = usePortalAuth()
  const [items, setItems] = useState<IdentityType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editingType, setEditingType] = useState<IdentityType | null>(null)
  const [searchText, setSearchText] = useState("")

  const fetchData = async () => {
    if (!tenantId) {
      setIsLoading(false)
      setError("未获取到租户信息，请重新登录")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await identityTypeApi.list({ tenantId, search: searchText || undefined, limit: 1000 })
      setItems(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载身份类型失败")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, searchText])

  const handleAdd = () => {
    setEditingType(null)
    setShowDialog(true)
  }

  const handleEdit = (type: IdentityType) => {
    setEditingType(type)
    setShowDialog(true)
  }

  const filteredItems = items.filter(
    (type) =>
      type.name.includes(searchText) ||
      type.code.includes(searchText) ||
      (type.description && type.description.includes(searchText))
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索身份类型..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          新增身份类型
        </Button>
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
        <div className="bg-card rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>类型名称</TableHead>
                <TableHead>类型编码</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>关联用户数</TableHead>
                <TableHead className="w-32 text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <Empty className="h-full">
                      <EmptyHeader>
                        <EmptyTitle>暂无身份类型</EmptyTitle>
                        <EmptyDescription>
                          {searchText ? "未找到匹配的身份类型" : "当前租户下尚未创建身份类型"}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((type, index) => (
                  <TableRow key={type.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="text-muted-foreground">{type.code}</TableCell>
                    <TableCell className="text-muted-foreground">{type.description || "-"}</TableCell>
                    <TableCell>
                      <span className="text-primary">{type.userCount}</span> 人
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(type)}>
                            编辑
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
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? "编辑身份类型" : "新增身份类型"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">类型名称</label>
              <Input placeholder="请输入类型名称" defaultValue={editingType?.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">类型编码</label>
              <Input placeholder="请输入类型编码" defaultValue={editingType?.code} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <Input placeholder="请输入描述" defaultValue={editingType?.description} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={() => setShowDialog(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
