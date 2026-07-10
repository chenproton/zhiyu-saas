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
} from "recharts"
import { BarChart3, CheckCircle2, AlertCircle, FileText, BookOpen, Users, Calendar, Award, TrendingUp } from "lucide-react"
import { CourseClassSelector } from "../_components/course-class-selector"

const semesterStats = {
  totalSessions: 16,
  avgAttendance: 91,
  compositeAvgScore: 84,
  totalStudents: 42,
  dataCollectionRate: 88,
  attentionStudents: 4,
}

const assessmentDimensions = [
  { id: "d1", name: "视频学习", category: "课中", weight: 10, avgScore: 88, sessions: 16, status: "collected" },
  { id: "d2", name: "签到考勤", category: "课中", weight: 10, avgScore: 95, sessions: 16, status: "collected" },
  { id: "d3", name: "课堂互动", category: "课中", weight: 10, avgScore: 82, sessions: 16, status: "collected" },
  { id: "d4", name: "随堂测验", category: "课中", weight: 15, avgScore: 78, sessions: 8, status: "collected" },
  { id: "d5", name: "课后作业", category: "课后", weight: 20, avgScore: 82, sessions: 6, status: "collected" },
  { id: "d6", name: "单元测验", category: "课后", weight: 15, avgScore: 76, sessions: 3, status: "collected" },
  { id: "d7", name: "互评互判", category: "课后", weight: 10, avgScore: 84, sessions: 3, status: "collecting" },
  { id: "d8", name: "实训报告", category: "课后", weight: 10, avgScore: 82, sessions: 3, status: "collecting" },
]

const sessionSummary = [
  { week: 1, day: "周一", topic: "HTML基础结构与语义化标签", attendance: 95, quizAvg: 85, homeworkSubmit: 95, homeworkAvg: 88 },
  { week: 2, day: "周三", topic: "CSS选择器与盒模型", attendance: 93, quizAvg: 82, homeworkSubmit: 92, homeworkAvg: 85 },
  { week: 3, day: "周一", topic: "CSS布局实战 - Flexbox", attendance: 90, quizAvg: 78, homeworkSubmit: null, homeworkAvg: null },
  { week: 4, day: "周五", topic: "JavaScript基础语法", attendance: 92, quizAvg: 80, homeworkSubmit: 88, homeworkAvg: 80 },
  { week: 5, day: "周一", topic: "JS DOM操作与事件", attendance: 88, quizAvg: 75, homeworkSubmit: null, homeworkAvg: null },
  { week: 6, day: "周三", topic: "JS异步编程与 Promise", attendance: 91, quizAvg: 76, homeworkSubmit: 85, homeworkAvg: 78 },
  { week: 7, day: "周一", topic: "Vue.js 组件化开发入门", attendance: 94, quizAvg: null, homeworkSubmit: null, homeworkAvg: null },
  { week: 8, day: "周五", topic: "Vue Router 与状态管理", attendance: 89, quizAvg: 72, homeworkSubmit: 82, homeworkAvg: 76 },
]

const scoreDist = [
  { range: "90-100", count: 5 },
  { range: "80-89", count: 14 },
  { range: "70-79", count: 12 },
  { range: "60-69", count: 8 },
  { range: "<60", count: 3 },
]

const studentRanking = [
  { rank: 1, name: "孙七", attendance: 98, classQuiz: 90, postQuiz: 88, homework: 92, peerReview: 90, report: 88, total: 91, grade: "A" },
  { rank: 2, name: "李明", attendance: 95, classQuiz: 88, postQuiz: 85, homework: 88, peerReview: 85, report: 86, total: 87, grade: "A" },
  { rank: 3, name: "王芳", attendance: 92, classQuiz: 85, postQuiz: 82, homework: 90, peerReview: 88, report: 85, total: 86, grade: "B" },
  { rank: 4, name: "陈静", attendance: 90, classQuiz: 82, postQuiz: 80, homework: 85, peerReview: 83, report: 82, total: 83, grade: "B" },
  { rank: 5, name: "刘洋", attendance: 88, classQuiz: 78, postQuiz: 75, homework: 80, peerReview: 80, report: 78, total: 79, grade: "B" },
  { rank: 6, name: "张伟", attendance: 85, classQuiz: 72, postQuiz: 68, homework: 72, peerReview: 75, report: 70, total: 73, grade: "C" },
  { rank: 7, name: "赵敏", attendance: 82, classQuiz: 70, postQuiz: 65, homework: 68, peerReview: 72, report: 65, total: 69, grade: "C" },
  { rank: 8, name: "黄磊", attendance: 80, classQuiz: 65, postQuiz: 60, homework: 62, peerReview: 68, report: 60, total: 64, grade: "D" },
]

const gradeColors: Record<string, string> = { A: "bg-emerald-500", B: "bg-blue-500", C: "bg-amber-500", D: "bg-orange-500", E: "bg-red-500" }

export default function FinalAssessmentPage() {
  const [dimensionTab, setDimensionTab] = useState<string>("all")

  const filteredDimensions = dimensionTab === "all"
    ? assessmentDimensions
    : assessmentDimensions.filter((d) => d.category === dimensionTab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">课程期末总评</h1>
        <p className="text-muted-foreground mt-1">汇总一学期全部课时的课中学习行为与课后测评数据，自动生成过程性考核总评</p>
      </div>

      <CourseClassSelector onSelect={() => {}} showSession={false} />

      {/* 学期汇总概览 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">总课时</p>
                <p className="text-2xl font-bold">{semesterStats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-100 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">平均出勤率</p>
                <p className="text-2xl font-bold">{semesterStats.avgAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">综合平均分</p>
                <p className="text-2xl font-bold">{semesterStats.compositeAvgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-100 text-cyan-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">参与学生</p>
                <p className="text-2xl font-bold">{semesterStats.totalStudents}</p>
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
                <p className="text-xs text-muted-foreground">数据采集完成度</p>
                <p className="text-2xl font-bold">{semesterStats.dataCollectionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-100 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">需关注学生</p>
                <p className="text-2xl font-bold">{semesterStats.attentionStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 考核维度汇总 + 成绩分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>过程性考核维度汇总</span>
              <Tabs value={dimensionTab} onValueChange={setDimensionTab}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3">全部</TabsTrigger>
                  <TabsTrigger value="课中" className="text-xs px-3">课中</TabsTrigger>
                  <TabsTrigger value="课后" className="text-xs px-3">课后</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
            {filteredDimensions.map((item) => (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.name}</span>
                    <Badge variant="outline" className="text-[10px]">{item.weight}%</Badge>
                    <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                    <Badge variant={item.status === "collected" ? "default" : "secondary"} className="text-[10px]">
                      {item.status === "collected" ? "已汇总" : "采集中"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.sessions} 次</span>
                    <span className="font-medium text-foreground">{item.avgScore} 分</span>
                  </div>
                </div>
                <Progress value={item.avgScore} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">学期综合成绩分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={scoreDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="人数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 各课时汇总明细 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            各课时汇总明细
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs w-[80px]">周次/日期</TableHead>
                  <TableHead className="text-xs">课时主题</TableHead>
                  <TableHead className="text-xs w-[70px]">出勤率</TableHead>
                  <TableHead className="text-xs w-[90px]">随堂测验均分</TableHead>
                  <TableHead className="text-xs w-[80px]">作业提交率</TableHead>
                  <TableHead className="text-xs w-[80px]">作业均分</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionSummary.map((s) => (
                  <TableRow key={`${s.week}-${s.day}`}>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className="text-xs font-normal">第{s.week}周 {s.day}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{s.topic}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1.5">
                        <Progress value={s.attendance} className="h-1.5 w-12" />
                        <span>{s.attendance}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.quizAvg != null ? (
                        <Badge variant={s.quizAvg >= 80 ? "default" : s.quizAvg >= 70 ? "secondary" : "outline"} className="text-xs font-normal">
                          {s.quizAvg} 分
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.homeworkSubmit != null ? (
                        <div className="flex items-center gap-1.5">
                          <Progress value={s.homeworkSubmit} className="h-1.5 w-12" />
                          <span>{s.homeworkSubmit}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.homeworkAvg != null ? (
                        <Badge variant={s.homeworkAvg >= 80 ? "default" : s.homeworkAvg >= 70 ? "secondary" : "outline"} className="text-xs font-normal">
                          {s.homeworkAvg} 分
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 学生综合排名 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            学生综合成绩排名
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs w-[50px]">排名</TableHead>
                    <TableHead className="text-xs w-[70px]">姓名</TableHead>
                    <TableHead className="text-xs w-[65px]">出勤</TableHead>
                    <TableHead className="text-xs w-[65px]">随堂测验</TableHead>
                    <TableHead className="text-xs w-[65px]">课后测验</TableHead>
                    <TableHead className="text-xs w-[65px]">作业</TableHead>
                    <TableHead className="text-xs w-[65px]">互评</TableHead>
                    <TableHead className="text-xs w-[65px]">报告</TableHead>
                    <TableHead className="text-xs w-[70px]">总评</TableHead>
                    <TableHead className="text-xs w-[60px]">等级</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentRanking.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell className="text-sm font-bold text-center">
                        {s.rank <= 3 ? (
                          <span className={s.rank === 1 ? "text-amber-500" : s.rank === 2 ? "text-gray-400" : "text-amber-700"}>{s.rank}</span>
                        ) : (
                          <span className="text-muted-foreground">{s.rank}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{s.name}</TableCell>
                      <TableCell className="text-sm">{s.attendance}</TableCell>
                      <TableCell className="text-sm">{s.classQuiz}</TableCell>
                      <TableCell className="text-sm">{s.postQuiz}</TableCell>
                      <TableCell className="text-sm">{s.homework}</TableCell>
                      <TableCell className="text-sm">{s.peerReview}</TableCell>
                      <TableCell className="text-sm">{s.report}</TableCell>
                      <TableCell className="text-sm font-semibold">{s.total}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${gradeColors[s.grade]}`}>{s.grade}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
