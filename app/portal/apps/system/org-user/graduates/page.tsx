"use client"

import { useState } from "react"
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
import { Search, Download, Eye, MoreHorizontal, RotateCcw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

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

const mockGraduates: Graduate[] = [
  { id: "1", name: "陈小明", studentId: "2020010001", idCard: "330102200201010011", graduateYear: "2024", enrollYear: "2020", major: "软件工程", className: "软件2001班" },
  { id: "2", name: "王小红", studentId: "2020010002", idCard: "330102200202020022", graduateYear: "2024", enrollYear: "2020", major: "计算机科学", className: "计科2001班" },
  { id: "3", name: "李小华", studentId: "2020010003", idCard: "330102200203030033", graduateYear: "2024", enrollYear: "2020", major: "人工智能", className: "智能2001班" },
  { id: "4", name: "张小强", studentId: "2019010001", idCard: "330102200104040044", graduateYear: "2023", enrollYear: "2019", major: "软件工程", className: "软件1901班" },
  { id: "5", name: "刘小丽", studentId: "2019010002", idCard: "330102200105050055", graduateYear: "2023", enrollYear: "2019", major: "数据科学", className: "数科1901班" },
  { id: "6", name: "赵小军", studentId: "2018010001", idCard: "330102200006060066", graduateYear: "2022", enrollYear: "2018", major: "网络工程", className: "网络1801班" },
]

export default function GraduatesPage() {
  const [graduates, setGraduates] = useState<Graduate[]>(mockGraduates)
  const [searchText, setSearchText] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [selectedGraduates, setSelectedGraduates] = useState<string[]>([])
  const [isReEnrollDialogOpen, setIsReEnrollDialogOpen] = useState(false)
  const [graduateToReEnroll, setGraduateToReEnroll] = useState<Graduate | null>(null)

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
      alert(`已将 ${graduateToReEnroll.name} 恢复到学生管理`)
    }
  }

  const graduateYears = [...new Set(mockGraduates.map(g => g.graduateYear))].sort((a, b) => Number(b) - Number(a))

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
