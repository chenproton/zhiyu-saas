"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Pencil, Loader2 } from "lucide-react"
import { usePortalAuth } from "@/contexts/portal-auth-context"
import { portalRequest, buildQuery, type ListResponse } from "@/lib/api"
import type { Major } from "@/lib/types/backend"

export default function MajorsPage() {
  const { tenantId, loading: authLoading } = usePortalAuth()
  const [majors, setMajors] = useState<Major[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [aliasValue, setAliasValue] = useState("")

  useEffect(() => {
    if (authLoading || !tenantId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    portalRequest<ListResponse<Major>>(`/majors${buildQuery({ tenantId, limit: 1000 })}`)
      .then((res) => {
        if (!cancelled) {
          setMajors(res.items)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载专业数据失败")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tenantId, authLoading])

  const filteredMajors = useMemo(
    () =>
      majors.filter((major) =>
        major.name.includes(searchTerm) || major.code.includes(searchTerm) || (major.alias ?? "").includes(searchTerm)
      ),
    [majors, searchTerm]
  )

  const toggleEnabled = (id: string) => {
    setMajors((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)))
  }

  const openEditDialog = (major: Major) => {
    setSelectedMajor(major)
    setAliasValue(major.alias || "")
    setIsDialogOpen(true)
  }

  const saveAlias = () => {
    if (selectedMajor) {
      setMajors((prev) =>
        prev.map((m) => (m.id === selectedMajor.id ? { ...m, alias: aliasValue || undefined } : m))
      )
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">专业管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">管理教育专业，可为专业配置别名并启用/关闭</p>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索专业代码、名称或别名..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !loading && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && (
        <>
          <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-28">专业代码</TableHead>
                  <TableHead>专业名称</TableHead>
                  <TableHead>别名（备注）</TableHead>
                  <TableHead className="w-24 text-center">状态</TableHead>
                  <TableHead className="w-24 text-center">启用/关闭</TableHead>
                  <TableHead className="w-20 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMajors.map((major) => (
                  <TableRow key={major.id} className="border-border">
                    <TableCell className="font-mono text-sm">{major.code}</TableCell>
                    <TableCell className="font-medium">{major.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {major.alias || <span className="text-gray-300">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={major.enabled ? "default" : "secondary"}>
                        {major.enabled ? "已启用" : "已关闭"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch checked={major.enabled} onCheckedChange={() => toggleEnabled(major.id)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(major)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMajors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      暂无专业数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">共 {filteredMajors.length} 条记录</div>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑专业别名</DialogTitle>
            <DialogDescription>为专业 {selectedMajor?.name} 配置别名</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>专业代码</Label>
              <Input value={selectedMajor?.code} disabled className="bg-muted" />
            </div>
            <div className="grid gap-2">
              <Label>专业名称</Label>
              <Input value={selectedMajor?.name} disabled className="bg-muted" />
            </div>
            <div className="grid gap-2">
              <Label>别名（备注）</Label>
              <Input placeholder="输入专业别名或备注" value={aliasValue} onChange={(e) => setAliasValue(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={saveAlias}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
