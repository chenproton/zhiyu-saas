"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { usePortalUsers } from "@/hooks/use-portal-users"
import { Search, Download, Eye, MoreHorizontal, RotateCcw, Loader2, AlertCircle, Info } from "lucide-react"

interface Graduate {
  id: string
  name: string
  studentId: string
  idCard: string
  graduateYear: string
  enrollYear: string
  major: string
  className: string
}

export default function GraduatesPage() {
  const [searchText, setSearchText] = useState("")
  const { users, loading, error, refetch } = usePortalUsers({
    identityTypeCode: "student",
    search: searchText || undefined,
  })

  const [graduates, setGraduates] = useState<Graduate[]>([])
  const [yearFilter, setYearFilter] = useState("all")
  const [selectedGraduates, setSelectedGraduates] = useState<string[]>([])
  const [isReEnrollDialogOpen, setIsReEnrollDialogOpen] = useState(false)
  const [graduateToReEnroll, setGraduateToReEnroll] = useState<Graduate | null>(null)

  useEffect(() => {
    setGraduates(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        studentId: u.studentNo || u.username,
        idCard: u.idCard || "—",
        graduateYear: "—",
        enrollYear: "—",
        major: "—",
        className: "—",
      }))
    )
  }, [users])

  const filteredGraduates = graduates.filter(g => {
    const matchSearch = g.name.includes(searchText) || g.studentId.includes(searchText)
    const matchYear = yearFilter === "all" || g.graduateYear === yearFilter
    return matchSearch && matchYear
  })

  const toggleSelectGraduate = (id: string) => {
    setSelectedGraduates(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedGraduates.length === filteredGraduates.length) {
      setSelectedGraduates([])
    } else {
      setSelectedGraduates(filteredGraduates.map(g => g.id))
    }
  }

  const handleReEnroll = (graduate: Graduate) => {
    setGraduateToReEnroll(graduate)
    setIsReEnrollDialogOpen(true)
  }

  const confirmReEnroll = () => {
    if (graduateToReEnroll) {
      setGraduates(prev => prev.filter(g => g.id !== graduateToReEnroll.id))
      setIsReEnrollDialogOpen(false)
      setGraduateToReEnroll(null)
    }
  }

  const graduateYears = [...new Set(graduates.map(g => g.graduateYear).filter((y): y is string => y !== "—"))].sort((a, b) => Number(b) - Number(a))

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">毕业学生管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理已毕业学生的档案信息</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          导出
        </Button>
      </div>

      <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-4 text-amber-800 flex items-start gap-3">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">后端暂无毕业状态接口</p>
          <p className="opacity-90">
            当前复用学生列表展示。毕业年份、入学年份、专业、班级等字段后端未在用户表中维护，因此显示为“—”。
          </p>
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
            {graduateYears.map(year => (
              <SelectItem key={year} value={year}>{year}届</SelectItem>
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
                    <TableCell className="font-mono text-sm">{graduate.studentId}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{graduate.idCard}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{graduate.enrollYear}级</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{graduate.graduateYear}届</Badge>
                    </TableCell>
                    <TableCell>{graduate.major}</TableCell>
                    <TableCell className="text-muted-foreground">{graduate.className}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReEnroll(graduate)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
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
                      {searchText ? "未找到匹配的学生" : "暂无数据"}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <div>共 {filteredGraduates.length} 条记录 {selectedGraduates.length > 0 && `，已选择 ${selectedGraduates.length} 条`}</div>
      </div>

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
                <span>{graduateToReEnroll?.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">原班级：</span>
                <span>{graduateToReEnroll?.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">毕业年份：</span>
                <span>{graduateToReEnroll?.graduateYear}届</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              注：重新入学后，该学生将从毕业学生列表中移除，并恢复到学生管理中。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReEnrollDialogOpen(false)}>取消</Button>
            <Button onClick={confirmReEnroll}>确认恢复</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
