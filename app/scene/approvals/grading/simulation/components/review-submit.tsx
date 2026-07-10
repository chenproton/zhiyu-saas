"use client"

import { useState } from "react"
import {
  CheckCircle2,
  FileText,
  Upload,
  X,
  Paperclip,
  Send,
  AlertTriangle,
  Gavel,
  Calendar,
  RotateCcw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SimulatedTask, LocalSubmission, ReviewSubmissionState } from "./types"

interface ReviewSubmitPanelProps {
  task: SimulatedTask
  onSubmit: (submission: LocalSubmission) => void
  studentId?: string
  scenarioId?: string
  scenarioName?: string
  taskId?: string
}

export function ReviewSubmitPanel({
  task,
  onSubmit,
  studentId = "stu-sim",
  scenarioId = "scenario-sim",
  scenarioName = "模拟场景",
  taskId = "task-sim",
}: ReviewSubmitPanelProps) {
  const [state, setState] = useState<ReviewSubmissionState>({
    textAnswer: "",
    attachments: [],
    isSubmitted: false,
  })
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [teacherGraded, setTeacherGraded] = useState(false)

  const handleAttachmentAdd = () => {
    const types = [
      { name: "auth-module.zip", type: "code" as const },
      { name: "项目演示视频.mp4", type: "video" as const },
      { name: "设计文档.pdf", type: "document" as const },
      { name: "接口说明.md", type: "document" as const },
    ]
    const random = types[Math.floor(Math.random() * types.length)]
    setState((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          id: `att-${Date.now()}`,
          name: random.name,
          type: random.type,
          url: "#",
        },
      ],
    }))
  }

  const handleAttachmentRemove = (id: string) => {
    setState((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }))
  }

  const handleSubmit = () => {
    const submission: LocalSubmission = {
      id: `sub-sim-${Date.now()}`,
      studentId,
      scenarioId,
      scenarioName,
      taskId,
      taskName: task.name,
      assessmentForm: "评审",
      status: "pending",
      submittedAt: new Date().toLocaleString("zh-CN"),
      maxScore: 100,
      subjectiveContent: {
        textAnswer: state.textAnswer,
        attachments: state.attachments,
      },
    }
    setState((prev) => ({ ...prev, isSubmitted: true }))
    onSubmit(submission)
    setShowSubmitDialog(false)
  }

  if (state.isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-700">评审材料已提交</h3>
            <p className="text-sm text-gray-500 mt-1">
              您的评审材料已成功提交，等待教师评审
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">提交材料</span>
              <span>{state.attachments.length} 个附件</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">评审维度</span>
              <span>{task.evalPoints?.length || 4} 项</span>
            </div>
            {task.reviewConfig && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">允许重提交</span>
                <span>{task.reviewConfig.allowResubmit ? "是" : "否"}</span>
              </div>
            )}
          </div>
          {task.reviewConfig?.allowResubmit && (
            <Button
              variant="outline"
              onClick={() =>
                setState({ textAnswer: "", attachments: [], isSubmitted: false })
              }
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              重新提交
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-base">评审要求与材料提交</CardTitle>
            </div>
            <Button
              variant={teacherGraded ? "default" : "outline"}
              size="sm"
              onClick={() => setTeacherGraded((v) => !v)}
            >
              教师是否已评分：{teacherGraded ? "是" : "否"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 评审要求 */}
          <div className="space-y-3">
            <div className="text-sm text-gray-600">{task.description}</div>
            {task.reviewConfig && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  截止：{task.reviewConfig.deadlineDays} 天内
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  允许重提交：{task.reviewConfig.allowResubmit ? "是" : "否"}
                </Badge>
              </div>
            )}
            {task.evalPoints && (
              <div className="space-y-2">
                <div className="text-sm font-medium">评审维度</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {task.evalPoints.map((ep) => (
                    <div
                      key={ep.id}
                      className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg"
                    >
                      <div className="text-sm font-medium text-purple-700 min-w-[20px]">
                        {ep.weight}%
                      </div>
                      <div>
                        <div className="text-sm font-medium">{ep.name}</div>
                        <div className="text-xs text-gray-500">{ep.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            {/* 提交评审材料 */}
            <div>
              <div className="text-sm font-medium mb-2">文字说明</div>
              <Textarea
                placeholder="请描述您的项目实现思路、遇到的问题及解决方案..."
                rows={6}
                value={state.textAnswer}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, textAnswer: e.target.value }))
                }
                disabled={teacherGraded}
              />
            </div>

            <div>
              <div className="text-sm font-medium mb-2">附件上传</div>
              <div className="space-y-2">
                {state.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{att.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {att.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAttachmentRemove(att.id)}
                      disabled={teacherGraded}
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAttachmentAdd}
                  disabled={teacherGraded}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  添加附件（模拟）
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">注意事项</p>
                <p className="text-xs mt-0.5">
                  请确保提交的材料真实有效，评审将围绕代码规范性、功能完整性、安全设计意识和方案可维护性四个维度进行评分。
                </p>
              </div>
            </div>

            {teacherGraded && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">教师已评分</p>
                  <p className="text-xs mt-0.5">教师已完成评分，当前不允许提交或修改评审材料。</p>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={teacherGraded || (!state.textAnswer && state.attachments.length === 0)}
              onClick={() => setShowSubmitDialog(true)}
            >
              <Send className="h-4 w-4 mr-1" />
              提交评审材料
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 提交确认对话框 */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提交评审材料？</DialogTitle>
            <DialogDescription>
              提交后将进入教师评审流程，请确认材料完整。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">文字说明</span>
              <span>{state.textAnswer ? "已填写" : "未填写"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">附件数量</span>
              <span>{state.attachments.length} 个</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              再检查一下
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-1" />
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
