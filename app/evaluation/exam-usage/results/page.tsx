"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  GraduationCap,
  PlayCircle,
  User,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockUsages, type ExamUsage } from "../page"
import { PrdAnnotation } from "@/components/prd-annotation"
import { getAnnotation } from "@/lib/prd-annotations"

interface ExamStudentResult {
  id: string
  studentName: string
  studentId: string
  className: string
  grade: string
  major: string
  score: number
  totalScore: number
  submitTime: Date
  isPass: boolean
  rank: number
}

// 模拟学生数据
const mockStudentNames = [
  "张小明", "李华", "王芳", "赵强", "孙丽",
  "周杰", "吴敏", "郑伟", "钱红", "冯刚",
  "陈静", "刘洋", "杨帆", "黄磊", "林娜",
  "徐峰", "马云", "朱婷", "曹操", "孙权",
]

const mockClassNames = ['前端开发1班', '前端开发2班', '后端开发1班', '全栈开发班']
const mockGrades = ['2024级', '2023级']
const mockMajors = ['计算机科学与技术', '软件工程', '网络工程']

function getUsageById(usageId: string): ExamUsage | undefined {
  return mockUsages.find((u) => u.id === usageId)
}

function generateMockResults(usage: ExamUsage): ExamStudentResult[] {
  const count = usage.participantCount || 0
  if (count === 0) return []
  const totalScore = 100 // 默认总分
  const passScore = 60
  const examStartTime = usage.startTime || new Date()
  const examEndTime = usage.endTime || new Date(examStartTime.getTime() + 120 * 60000)
  const timeRange = examEndTime.getTime() - examStartTime.getTime()
  const results: ExamStudentResult[] = []
  for (let i = 0; i < count; i++) {
    const score = Math.floor(Math.random() * 55) + 45 // 45-100分
    results.push({
      id: `result-${usage.id}-${i}`,
      studentName: mockStudentNames[i % mockStudentNames.length],
      studentId: `2024010${i + 1}`,
      className: mockClassNames[Math.floor(Math.random() * mockClassNames.length)],
      grade: mockGrades[Math.floor(Math.random() * mockGrades.length)],
      major: mockMajors[Math.floor(Math.random() * mockMajors.length)],
      score,
      totalScore,
      submitTime: new Date(examStartTime.getTime() + Math.random() * timeRange),
      isPass: score >= passScore,
      rank: 0,
    })
  }
  const sorted = results.sort((a, b) => b.score - a.score)
  sorted.forEach((r, idx) => { r.rank = idx + 1 })
  return sorted
}

function getUsageIcon(usage: ExamUsage) {
  switch (usage.usageType) {
    case 'quiz':
      return <PlayCircle className="size-4" />
    case 'exam':
      return <GraduationCap className="size-4" />
  }
}

const USAGE_TYPE_LABELS = {
  quiz: '随堂测',
  exam: '在线考试',
}

function ExamResultsContent() {
  const searchParams = useSearchParams()
  const usageId = searchParams.get("usageId") || ""
  const [search, setSearch] = useState("")
  const [passFilter, setPassFilter] = useState<string>("all")

  const usage = getUsageById(usageId)
  const results = useMemo(() => {
    if (!usage) return []
    return generateMockResults(usage)
  }, [usage])

  const filteredResults = useMemo(() => {
    let list = [...results]
    if (passFilter !== "all") {
      list = list.filter((r) =>
        passFilter === "pass" ? r.isPass : !r.isPass
      )
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((r) => r.studentName.toLowerCase().includes(q))
    }
    return list
  }, [results, passFilter, search])

  const stats = useMemo(() => {
    const total = results.length
    const pass = results.filter((r) => r.isPass).length
    const fail = total - pass
    const avgScore = total > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / total)
      : 0
    const maxScore = total > 0 ? Math.max(...results.map((r) => r.score)) : 0
    const minScore = total > 0 ? Math.min(...results.map((r) => r.score)) : 0
    return { total, pass, fail, avgScore, maxScore, minScore }
  }, [results])

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (!usage) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">考试记录不存在</h2>
          <p className="mb-4 text-muted-foreground">该考试记录可能已被删除</p>
          <Button asChild>
            <Link href="/evaluation/exam-usage">返回考试管理</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/evaluation/exam-usage">
            <ArrowLeft className="mr-1 size-4" />
            返回考试管理
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{usage.examName}</h1>
            <Badge variant="outline" className="gap-1">
              {getUsageIcon(usage)}
              {USAGE_TYPE_LABELS[usage.usageType]}
            </Badge>
          </div>
          <PrdAnnotation data={getAnnotation("eur-btn-export")}>
            <Button variant="outline">
              <Download className="mr-2 size-4" />
              导出数据
            </Button>
          </PrdAnnotation>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">参考人数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">平均分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.avgScore}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">最高分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.maxScore}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">最低分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.minScore}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">及格人数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.pass}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">不及格人数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.fail}</div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选栏 */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索学生姓名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={passFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setPassFilter("all")}
          >
            全部
          </Button>
          <Button
            variant={passFilter === "pass" ? "default" : "outline"}
            size="sm"
            onClick={() => setPassFilter("pass")}
          >
            <CheckCircle2 className="mr-1 size-3.5 text-emerald-500" />
            及格
          </Button>
          <Button
            variant={passFilter === "fail" ? "default" : "outline"}
            size="sm"
            onClick={() => setPassFilter("fail")}
          >
            <XCircle className="mr-1 size-3.5 text-red-500" />
            不及格
          </Button>
        </div>
      </div>

      {/* 结果列表 */}
      <div className="rounded-lg border bg-white px-4 py-3">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <PrdAnnotation data={getAnnotation("eur-col-student")}>
                    <div className="flex items-center gap-1">
                      <User className="size-3.5" />
                      学生名称
                    </div>
                  </PrdAnnotation>
                </TableHead>
                <TableHead className="w-[120px]">
                  <PrdAnnotation data={getAnnotation("eur-col-student-id")}>学号</PrdAnnotation>
                </TableHead>
                <TableHead className="w-[120px]">
                  <PrdAnnotation data={getAnnotation("eur-col-class")}>班级</PrdAnnotation>
                </TableHead>
                <TableHead className="w-[100px]">
                  <PrdAnnotation data={getAnnotation("eur-col-grade")}>年级</PrdAnnotation>
                </TableHead>
                <TableHead className="w-[140px]">
                  <PrdAnnotation data={getAnnotation("eur-col-major")}>专业</PrdAnnotation>
                </TableHead>
                <TableHead className="w-[160px]">
                  <PrdAnnotation data={getAnnotation("eur-col-submit-time")}>考试时间</PrdAnnotation>
                </TableHead>
                <TableHead className="w-[100px]">
                  <PrdAnnotation data={getAnnotation("eur-col-score")}>
                    <div className="flex items-center gap-1">
                      <Award className="size-3.5" />
                      考试得分
                    </div>
                  </PrdAnnotation>
                </TableHead>
                <TableHead className="w-[100px]">
                  <PrdAnnotation data={getAnnotation("eur-col-pass")}>是否及格</PrdAnnotation>
                </TableHead>
                <TableHead className="sticky right-0 w-[100px] bg-white text-right">
                  <PrdAnnotation data={getAnnotation("eur-col-actions")}>操作</PrdAnnotation>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    {results.length === 0 ? "暂无考试结果" : "没有找到匹配的结果"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex w-6 items-center justify-center text-xs font-semibold text-muted-foreground">
                          {result.rank}
                        </span>
                        <User className="size-3.5 text-blue-500" />
                        <span className="text-sm">{result.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{result.studentId}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{result.className}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{result.grade}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{result.major}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(result.submitTime)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{result.score}</span>
                        <span className="text-xs text-muted-foreground">/ {result.totalScore}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            result.isPass ? "bg-emerald-500" : "bg-red-500"
                          }`}
                          style={{ width: `${(result.score / result.totalScore) * 100}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {result.isPass ? (
                        <Badge variant="default" className="gap-1 bg-emerald-500">
                          <CheckCircle2 className="size-3" />
                          及格
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="size-3" />
                          不及格
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-white text-right">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                        <Eye className="size-3.5" />
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default function ExamResultsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">加载中...</div>}>
      <ExamResultsContent />
    </Suspense>
  )
}
