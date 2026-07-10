"use client"

import { useState } from "react"
import {
  CheckCircle2,
  FileQuestion,
  Users,
  Calendar,
  MapPin,
  Mic,
  ClipboardCheck,
  Send,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Clock,
  UserCheck,
  MessageSquare,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { SimulatedTask, LocalSubmission, OnSiteQAState } from "./types"
import { randomDrawQuestions } from "./task-data"

interface OnSiteQAPanelProps {
  task: SimulatedTask
  onSubmit: (submission: LocalSubmission) => void
  studentId?: string
  scenarioId?: string
  scenarioName?: string
  taskId?: string
}

export function OnSiteQAPanel({
  task,
  onSubmit,
  studentId = "stu-sim",
  scenarioId = "scenario-sim",
  scenarioName = "模拟场景",
  taskId = "task-sim",
}: OnSiteQAPanelProps) {
  const [state, setState] = useState<OnSiteQAState>({
    isCompleted: false,
    notes: "",
  })
  const [showQuestions, setShowQuestions] = useState(false)

  // 模拟抽取题目（随机选2道）
  const drawnQuestions = randomDrawQuestions.slice(0, 2)

  const handleNotifyTeacher = () => {
    const submission: LocalSubmission = {
      id: `sub-sim-${Date.now()}`,
      studentId,
      scenarioId,
      scenarioName,
      taskId,
      taskName: task.name,
      assessmentForm: "现场问答",
      status: "pending",
      submittedAt: new Date().toLocaleString("zh-CN"),
      maxScore: 100,
      drawnQuestions: drawnQuestions.map((q) => ({
        questionId: q.questionId,
        questionName: q.questionName,
        questionContent: q.questionContent,
        questionType: q.questionType,
        correctAnswer: q.correctAnswer,
      })),
      evalPointScores: [],
    }
    setState((prev) => ({ ...prev, isCompleted: true }))
    onSubmit(submission)
  }

  if (state.isCompleted) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-700">现场问答已预约</h3>
            <p className="text-sm text-gray-500 mt-1">
              你已提交现场问答申请，教师将安排具体时间进行测评
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border text-left space-y-2 max-w-md mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">测评形式</span>
              <span>现场问答</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">抽题数量</span>
              <span>{drawnQuestions.length} 道</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">评价维度</span>
              <span>{task.evalPoints?.length || 4} 项</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">当前状态</span>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">等待教师安排</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowQuestions(true)}>
            <HelpCircle className="h-4 w-4 mr-1" />
            查看可能抽到的题目范围
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 现场问答说明 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">现场问答安排</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">{task.description}</div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500">测评主体</div>
                <div className="text-sm font-medium">指导教师</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500">测评时间</div>
                <div className="text-sm font-medium">教师安排</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500">测评地点</div>
                <div className="text-sm font-medium">实训室 A-301</div>
              </div>
            </div>
          </div>

          {task.evalPoints && (
            <div className="space-y-2">
              <div className="text-sm font-medium">评价维度</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {task.evalPoints.map((ep) => (
                  <div key={ep.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                    <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{ep.name}</div>
                      <div className="text-xs text-gray-500">{ep.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">重要提示</p>
              <p className="text-xs mt-0.5">
                现场问答由教师从题库中随机抽题进行口头提问。学生端不会提前展示具体题目，请在测评前充分复习相关知识点。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleNotifyTeacher}>
        <ClipboardCheck className="h-4 w-4 mr-1" />
        提交测评申请
      </Button>

      {/* 抽题记录对话框 */}
      <Dialog open={showQuestions} onOpenChange={setShowQuestions}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>可能抽到的题目范围</DialogTitle>
            <DialogDescription>
              以下是从题库中可能抽取的题目类型（仅供参考，实际抽题由教师决定）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {randomDrawQuestions.map((q, idx) => (
              <Card key={q.questionId}>
                <CardContent className="pt-4">
                  <Badge variant="outline" className="mb-2">
                    题目 {idx + 1}
                  </Badge>
                  <p className="text-sm font-medium">{q.questionContent}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
