"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { usePortalAuth } from "@/contexts/portal-auth-context"
import { portalGraduateApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Search, Download, Eye, MoreHorizontal, RotateCcw, Loader2, AlertCircle, Pencil } from "lucide-react"
import type { Graduate } from "@/lib/types/backend"

export default function GraduatesPage() {
  const { tenantId } = usePortalAuth()
  const { toast } = useToast()
  const [searchText, setSearchText] = useState("")
  const [graduates, setGraduates] = useState<Graduate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [yearFilter, setYearFilter] = useState("all")
  const [selectedGraduates, setSelectedGraduates] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGraduate, setEditingGraduate] = useState<Graduate | null>(null)
  const [saving, setSaving] = useState(false)
  const [isReEnrollDialogOpen, setIsReEnrollDialogOpen] = useState(false)
  const [graduateToReEnroll, setGraduateToReEnroll] = useState<Graduate | null>(null)

  const [formName, setFormName] = useState("")
  const [formStudentNo, setFormStudentNo] = useState("")
  const [formIdCard, setFormIdCard] = useState("")
  const [formEnrollYear, setFormEnrollYear] = useState("")
  const [formGraduateYear, setFormGraduateYear] = useState("")
  const [formMajorName, setFormMajorName] = useState("")
  const [formClassName, setFormClassName] = useState("")

  const fetchGraduates = async () => {
    if (!tenantId) return
    setLoading(true)
    setError(undefined)
    try {
      const res = await portalGraduateApi.list({ tenantId, search: searchText || undefined, limit: 1000 })
      setGraduates(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGraduates()
  }, [tenantId, searchText])

  const filteredGraduates = useMemo(() => {
    return graduates.filter((g) => {
      const matchYear = yearFilter === "all" || String(g.graduateYear) === yearFilter
      return matchYear
    })
  }, [graduates, yearFilter])

  const graduateYears = useMemo(() => {
    return [...new Set(graduates.map((g) => g.graduateYear).filter((y): y is number => y !== undefined))]
      .sort((a, b) => b - a)
      .map(String)
  }, [graduates])

  const toggleSelectGraduate = (id: string) => {
    setSelectedGraduates((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedGraduates.length === filteredGraduates.length && filteredGraduates.length > 0) {
      setSelectedGraduates([])
    } else {
      setSelectedGraduates(filteredGraduates.map((g) => g.id))
    }
  }

  const resetForm = (graduate?: Graduate | null) => {
    setFormName(graduate?.name || "")
    setFormStudentNo(graduate?.studentNo || "")
    setFormIdCard(graduate?.idCard || "")
    setFormEnrollYear(graduate?.enrollYear !== undefined ? String(graduate.enrollYear) : "")
    setFormGraduateYear(graduate?.graduateYear !== undefined ? String(graduate.graduateYear) : "")
    setFormMajorName(graduate?.majorName || "")
    setFormClassName(graduate?.className || "")
  }

  const openEditDialog = (graduate: Graduate) => {
    setEditingGraduate(graduate)
    resetForm(graduate)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!tenantId) {
      toast({ variant: "destructive", title: "保存失败", description: "未获取到租户信息，请重新登录" })
      return
    }
    if (!formName.trim()) return
    setSaving(true)
    try {
      const payload = {
        tenantId,
        name: formName.trim(),
        studentNo: formStudentNo.trim() || undefined,
        idCard: formIdCard.trim() || undefined,
        enrollYear: formEnrollYear ? Number(formEnrollYear) : undefined,
        graduateYear: formGraduateYear ? Number(formGraduateYear) : undefined,
        majorName: formMajorName.trim() || undefined,
        className: formClassName.trim() || undefined,
      }
      if (editingGraduate) {
        await portalGraduateApi.update(editingGraduate.id, payload)
        toast({ title: "保存成功" })
      } else {
        await portalGraduateApi.create(payload as Omit<Graduate, "id" | "createdAt">)
        toast({ title: "创建成功" })
      }
      setIsDialogOpen(false)
      await fetchGraduates()
    } catch (err) {
      toast({ variant: "destructive", title: "保存失败", description: err instanceof Error ? err.message : "未知错误" })
    } finally {
      setSaving(false)
    }
  }

  const handleReEnroll = (graduate: Graduate) => {
    setGraduateToReEnroll(graduate)
    setIsReEnrollDialogOpen(true)
  }

  const confirmReEnroll = async () => {
    if (!graduateToReEnroll) return
    try {
      await portalGraduateApi.delete(graduateToReEnroll.id)
      toast({ title: "已恢复入学" })
      setIsReEnrollDialogOpen(false)
      setGraduateToReEnroll(null)
      await fetchGraduates()
    } catch (err) {
      toast({ variant: "destructive", title: "操作失败", description: err instanceof Error ? err.message : "未知错误" })
    }
  }

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">毕业学生管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理已毕业学生的档案信息</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">加载失败</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchGraduates}>
            <RotateCcw className="h-4 w-4 mr-1" />重试
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索姓名或学号..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="毕业年份" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部年份</SelectItem>
            {graduateYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}届
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedGraduates.length === filteredGraduates.length && filteredGraduates.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>学号</TableHead>
              <TableHead>身份证号</TableHead>
              <TableHead>入学年份</TableHead>
              <TableHead>毕业年份</TableHead>
              <TableHead>专业</TableHead>
              <TableHead>班级</TableHead>
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
            ) : (
              <>
                {filteredGraduates.map((graduate) => (
                  <TableRow key={graduate.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedGraduates.includes(graduate.id)}
                        onCheckedChange={() => toggleSelectGraduate(graduate.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{graduate.name}</TableCell>
                    <TableCell className="font-mono text-sm">{graduate.studentNo || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{graduate.idCard || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{graduate.enrollYear !== undefined ? `${graduate.enrollYear}级` : "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{graduate.graduateYear !== undefined ? `${graduate.graduateYear}届` : "—"}</Badge>
                    </TableCell>
                    <TableCell>{graduate.majorName || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{graduate.className || "—"}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(graduate)}>
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReEnroll(graduate)}>
                            重新入学
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredGraduates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {searchText || yearFilter !== "all" ? "未找到匹配的学生" : "暂无数据"}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <div>
          共 {filteredGraduates.length} 条记录 {selectedGraduates.length > 0 && `，已选择 ${selectedGraduates.length} 条`}
        </div>
      </div>

      {/* 新增/编辑毕业学生 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingGraduate ? "编辑毕业学生" : "新增毕业学生"}</DialogTitle>
            <DialogDescription>填写毕业学生档案信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>姓名 <span className="text-destructive">*</span></Label>
                <Input placeholder="请输入姓名" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>学号</Label>
                <Input placeholder="如：S2024001" value={formStudentNo} onChange={(e) => setFormStudentNo(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>身份证号</Label>
              <Input placeholder="请输入身份证号" value={formIdCard} onChange={(e) => setFormIdCard(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>入学年份</Label>
                <Input placeholder="如：2020" value={formEnrollYear} onChange={(e) => setFormEnrollYear(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>毕业年份</Label>
                <Input placeholder="如：2024" value={formGraduateYear} onChange={(e) => setFormGraduateYear(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>专业</Label>
                <Input placeholder="如：计算机科学与技术" value={formMajorName} onChange={(e) => setFormMajorName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>班级</Label>
                <Input placeholder="如：计算机2401班" value={formClassName} onChange={(e) => setFormClassName(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving || !formName.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重新入学确认对话框 */}
      <Dialog open={isReEnrollDialogOpen} onOpenChange={setIsReEnrollDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认重新入学</DialogTitle>
            <DialogDescription>
              确定要将 <span className="font-medium text-foreground">{graduateToReEnroll?.name}</span> 恢复到学生管理吗？
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">学号：</span>
                <span>{graduateToReEnroll?.studentNo || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">原班级：</span>
                <span>{graduateToReEnroll?.className || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">毕业年份：</span>
                <span>{graduateToReEnroll?.graduateYear !== undefined ? `${graduateToReEnroll.graduateYear}届` : "—"}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              注：重新入学后，该学生将从毕业学生列表中移除，并恢复到学生管理中。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReEnrollDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={confirmReEnroll}>确认恢复</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
