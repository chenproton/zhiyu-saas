"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { CheckCircle2, Zap, MessageSquare, Trophy, Users, ClipboardList } from "lucide-react"
import { CourseClassSelector } from "../_components/course-class-selector"

const signInData = {
  total: 42,
  present: 38,
  late: 3,
  absent: 1,
  rate: 90,
}

const signInDaily = [
  { date: "周一", present: 40, late: 2, absent: 0 },
  { date: "周二", present: 38, late: 3, absent: 1 },
  { date: "周三", present: 39, late: 2, absent: 1 },
  { date: "周四", present: 37, late: 4, absent: 1 },
  { date: "周五", present: 36, late: 3, absent: 3 },
]

const quizResults = [
  { id: "iq-1", name: "随堂测验1：HTML基础", avgScore: 85, passRate: 92, count: 40 },
  { id: "iq-2", name: "随堂测验2：CSS布局", avgScore: 78, passRate: 85, count: 39 },
  { id: "iq-3", name: "随堂测验3：JS语法基础", avgScore: 72, passRate: 78, count: 38 },
]

const rushAnswerRanking = [
  { rank: 1, name: "李明", correctCount: 8, avgTime: "0.9s", badge: "抢答达人" },
  { rank: 2, name: "王芳", correctCount: 7, avgTime: "1.1s", badge: "积极参与" },
  { rank: 3, name: "张伟", correctCount: 6, avgTime: "1.3s", badge: "" },
  { rank: 4, name: "陈静", correctCount: 6, avgTime: "1.5s", badge: "" },
  { rank: 5, name: "孙七", correctCount: 5, avgTime: "1.0s", badge: "" },
]

const classInteraction = [
  { name: "课堂提问", active: 8, total: 10 },
  { name: "课堂测验", active: 5, total: 8 },
  { name: "小组活动", active: 4, total: 5 },
  { name: "讨论发言", active: 6, total: 8 },
  { name: "实操演示", active: 3, total: 4 },
]

const attendanceRateData = [
  { name: "第1周", rate: 95 },
  { name: "第2周", rate: 93 },
  { name: "第3周", rate: 90 },
  { name: "第4周", rate: 92 },
  { name: "第5周", rate: 88 },
  { name: "第6周", rate: 91 },
  { name: "第7周", rate: 94 },
  { name: "第8周", rate: 89 },
]

const studentDetails = [
  { name: "李明", attendance: 95, quizAvg: 88, interaction: 8, praise: 5 },
  { name: "王芳", attendance: 98, quizAvg: 91, interaction: 6, praise: 4 },
  { name: "张伟", attendance: 85, quizAvg: 72, interaction: 3, praise: 1 },
  { name: "陈静", attendance: 96, quizAvg: 85, interaction: 7, praise: 3 },
  { name: "孙七", attendance: 92, quizAvg: 90, interaction: 5, praise: 4 },
  { name: "刘洋", attendance: 88, quizAvg: 78, interaction: 4, praise: 2 },
]

export default function BehaviorCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">课程学习跟踪</h1>
        <p className="text-muted-foreground mt-1">跟踪课堂学习过程数据，包括签到、随堂测验、课堂互动等课中学习行为</p>
      </div>

      <CourseClassSelector onSelect={() => {}} />

      {/* 签到统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">应到人数</p>
                <p className="text-2xl font-bold">{signInData.total}</p>
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
                <p className="text-xs text-muted-foreground">实到/迟到/缺勤</p>
                <p className="text-2xl font-bold">{signInData.present}<span className="text-base font-normal text-muted-foreground">/{signInData.late}/{signInData.absent}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">随堂测验均分</p>
                <p className="text-2xl font-bold">{Math.round(quizResults.reduce((s, q) => s + q.avgScore, 0) / quizResults.length)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">抢答参与率</p>
                <p className="text-2xl font-bold">76%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-100 text-cyan-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">课堂互动次数</p>
                <p className="text-2xl font-bold">28</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 每日签到 + 随堂测验 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              每日签到统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={signInDaily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="present" fill="#22c55e" stackId="a" name="实到" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#f59e0b" stackId="a" name="迟到" />
                <Bar dataKey="absent" fill="#ef4444" stackId="a" name="缺勤" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-purple-500" />
              随堂测验成绩
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quizResults.map((q) => (
              <div key={q.id} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{q.name}</span>
                  <span className="text-xs text-muted-foreground">参与 {q.count} 人</span>
                </div>
                <Progress value={q.avgScore} className="h-2 mb-1" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>平均分 {q.avgScore}</span>
                  <span>通过率 {q.passRate}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 抢答排行 + 出勤趋势 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              课堂抢答排行
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rushAnswerRanking.map((r) => (
                <div key={r.rank} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 text-center ${r.rank <= 3 ? "text-amber-500" : "text-muted-foreground"}`}>
                      {r.rank === 1 ? <Trophy className="h-4 w-4 inline text-amber-500" /> : r.rank}
                    </span>
                    <span className="text-sm">{r.name}</span>
                    {r.badge && <Badge variant="secondary" className="text-[10px]">{r.badge}</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>正确 {r.correctCount} 题</span>
                    <span>平均 {r.avgTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">出勤率趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attendanceRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} name="出勤率%" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 课堂互动参与度 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">课堂互动参与度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {classInteraction.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.active}/{item.total} 次</span>
                </div>
                <Progress value={(item.active / item.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 学生课中学习明细 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">学生课中学习明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs">姓名</TableHead>
                  <TableHead className="text-xs">出勤率</TableHead>
                  <TableHead className="text-xs">随堂测验均分</TableHead>
                  <TableHead className="text-xs">课堂互动次数</TableHead>
                  <TableHead className="text-xs">表扬次数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentDetails.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="text-sm font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm">{s.attendance}%</TableCell>
                    <TableCell className="text-sm">{s.quizAvg}</TableCell>
                    <TableCell className="text-sm">{s.interaction}</TableCell>
                    <TableCell className="text-sm">{s.praise}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
