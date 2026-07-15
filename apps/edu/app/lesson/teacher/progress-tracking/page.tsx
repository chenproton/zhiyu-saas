"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { FileText, BookOpen, Users, CheckCircle2, HelpCircle, Award, FolderOpen } from "lucide-react"
import { CourseClassSelector } from "../_components/course-class-selector"

const homeworkStats = {
  totalAssigned: 6,
  avgSubmitRate: 88,
  avgScore: 82,
  unsubmitted: 5,
}

const homeworkList = [
  { id: "hw-1", name: "第1次作业：HTML结构设计", submitRate: 95, avgScore: 88, deadline: "2026-03-15" },
  { id: "hw-2", name: "第2次作业：CSS布局练习", submitRate: 92, avgScore: 85, deadline: "2026-03-22" },
  { id: "hw-3", name: "第3次作业：JS DOM操作", submitRate: 88, avgScore: 80, deadline: "2026-04-05" },
  { id: "hw-4", name: "第4次作业：接口调用实战", submitRate: 85, avgScore: 78, deadline: "2026-04-15" },
  { id: "hw-5", name: "第5次作业：综合项目实践", submitRate: 82, avgScore: 82, deadline: "2026-05-01" },
  { id: "hw-6", name: "第6次作业：优化重构", submitRate: 86, avgScore: 79, deadline: "2026-05-15" },
]

const homeworkSubmitTrend = [
  { name: "第1次", rate: 95 },
  { name: "第2次", rate: 92 },
  { name: "第3次", rate: 88 },
  { name: "第4次", rate: 85 },
  { name: "第5次", rate: 82 },
  { name: "第6次", rate: 86 },
]

const quizResults = [
  { id: "pq-1", name: "单元测验1：HTML/CSS", avgScore: 85, passRate: 92, dist: [{ range: "90-100", count: 12 }, { range: "80-89", count: 15 }, { range: "70-79", count: 8 }, { range: "60-69", count: 3 }, { range: "<60", count: 2 }] },
  { id: "pq-2", name: "单元测验2：JavaScript", avgScore: 78, passRate: 85, dist: [{ range: "90-100", count: 8 }, { range: "80-89", count: 14 }, { range: "70-79", count: 10 }, { range: "60-69", count: 5 }, { range: "<60", count: 3 }] },
  { id: "pq-3", name: "单元测验3：综合实战", avgScore: 72, passRate: 78, dist: [{ range: "90-100", count: 5 }, { range: "80-89", count: 12 }, { range: "70-79", count: 13 }, { range: "60-69", count: 6 }, { range: "<60", count: 4 }] },
]

const peerReview = {
  totalGroups: 8,
  avgReviewScore: 84,
  completionRate: 90,
  steps: [
    { name: "学生自评", avgScore: 88, weight: 20 },
    { name: "小组互评", avgScore: 82, weight: 30 },
    { name: "教师评价", avgScore: 85, weight: 50 },
  ],
}

const scoreDistByLevel = [
  { range: "90-100", count: 8 },
  { range: "80-89", count: 15 },
  { range: "70-79", count: 12 },
  { range: "60-69", count: 7 },
  { range: "<60", count: 3 },
]

const reportStats = [
  { name: "实训报告1：前端开发实训", submitted: 38, total: 40, avgScore: 86 },
  { name: "实训报告2：接口联调实训", submitted: 36, total: 40, avgScore: 82 },
  { name: "实训报告3：项目部署实训", submitted: 34, total: 40, avgScore: 80 },
]

export default function ProgressTrackingPage() {
  const [activeQuiz, setActiveQuiz] = useState<string>(quizResults[0].id)

  const currentQuiz = quizResults.find((q) => q.id === activeQuiz) || quizResults[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">课程测评跟踪</h1>
        <p className="text-muted-foreground mt-1">跟踪课后测评数据，包括作业、测验、互评、实训报告等课后学习评价</p>
      </div>

      <CourseClassSelector onSelect={() => {}} />

      {/* 课后测评概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">作业提交率</p>
                <p className="text-2xl font-bold">{homeworkStats.avgSubmitRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-600">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">课后测验均分</p>
                <p className="text-2xl font-bold">{Math.round(quizResults.reduce((s, q) => s + q.avgScore, 0) / quizResults.length)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-100 text-green-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">互评完成率</p>
                <p className="text-2xl font-bold">{peerReview.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">综合评测均分</p>
                <p className="text-2xl font-bold">{homeworkStats.avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 课后作业统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              课后作业提交情况
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{hw.name}</span>
                  <span className="text-xs text-muted-foreground">截止 {hw.deadline}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={hw.submitRate} className="h-2 flex-1" />
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <span className="text-blue-600 font-medium">{hw.submitRate}%</span>
                    <span className="text-muted-foreground">均分 {hw.avgScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">作业提交率趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={homeworkSubmitTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[75, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} name="提交率%" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 课后测验结果 - 带Tab切换 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-purple-500" />
              课后测验分析
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeQuiz} onValueChange={setActiveQuiz}>
            <TabsList className="mb-4">
              {quizResults.map((q) => (
                <TabsTrigger key={q.id} value={q.id} className="text-xs">{q.name}</TabsTrigger>
              ))}
            </TabsList>
            {quizResults.map((q) => (
              <TabsContent key={q.id} value={q.id}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">平均分</p>
                      <p className="text-2xl font-bold text-blue-700">{q.avgScore}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">通过率</p>
                      <p className="text-2xl font-bold text-green-700">{q.passRate}%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">参与人数</p>
                      <p className="text-2xl font-bold text-purple-700">40</p>
                    </CardContent>
                  </Card>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={q.dist}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="人数" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 互评数据 + 成绩分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              互评互判统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Card className="bg-gray-50">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold">{peerReview.totalGroups}</p>
                  <p className="text-xs text-muted-foreground">互评小组</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold">{peerReview.avgReviewScore}</p>
                  <p className="text-xs text-muted-foreground">互评均分</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold">{peerReview.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">完成率</p>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-3">
              {peerReview.steps.map((step) => (
                <div key={step.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{step.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px]">权重 {step.weight}%</Badge>
                      <span className="font-medium">{step.avgScore} 分</span>
                    </div>
                  </div>
                  <Progress value={step.avgScore} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">综合成绩分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={scoreDistByLevel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="人数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 实训报告 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-orange-500" />
            实训报告完成情况
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs">报告名称</TableHead>
                  <TableHead className="text-xs">提交/总数</TableHead>
                  <TableHead className="text-xs">提交率</TableHead>
                  <TableHead className="text-xs">平均分</TableHead>
                  <TableHead className="text-xs">评级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportStats.map((r) => {
                  const rate = Math.round((r.submitted / r.total) * 100)
                  return (
                    <TableRow key={r.name}>
                      <TableCell className="text-sm">{r.name}</TableCell>
                      <TableCell className="text-sm">{r.submitted}/{r.total}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Progress value={rate} className="h-1.5 w-20" />
                          <span>{rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{r.avgScore}</TableCell>
                      <TableCell>
                        <Badge variant={r.avgScore >= 85 ? "default" : r.avgScore >= 75 ? "secondary" : "outline"} className="text-[10px]">
                          {r.avgScore >= 85 ? "优秀" : r.avgScore >= 75 ? "良好" : "待提升"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
