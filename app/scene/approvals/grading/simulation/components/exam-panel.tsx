"use client"

import { useState, useEffect, useCallback } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Save,
  Send,
  Timer,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { ExamQuestion, StudentExamState, LocalSubmission } from "./types"

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

interface ExamPanelProps {
  questions: ExamQuestion[]
  duration: number // minutes
  taskName: string
  assessmentForm: string
  onSubmit: (submission: LocalSubmission) => void
  studentId?: string
  scenarioId?: string
  scenarioName?: string
  taskId?: string
}

export function ExamPanel({
  questions,
  duration,
  taskName,
  assessmentForm,
  onSubmit,
  studentId = "stu-sim",
  scenarioId = "scenario-sim",
  scenarioName = "模拟场景",
  taskId = "task-sim",
}: ExamPanelProps) {
  const [examState, setExamState] = useState<StudentExamState>({
    answers: {},
    timeRemaining: duration * 60,
    isStarted: false,
    isSubmitted: false,
  })
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false)

  // 倒计时
  useEffect(() => {
    if (!examState.isStarted || examState.isSubmitted) return
    const timer = setInterval(() => {
      setExamState((prev) => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer)
          setShowTimeUpDialog(true)
          return { ...prev, timeRemaining: 0 }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [examState.isStarted, examState.isSubmitted])

  const startExam = () => {
    setExamState((prev) => ({ ...prev, isStarted: true }))
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setExamState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }))
  }

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  const answeredCount = Object.keys(examState.answers).filter(
    (qid) => {
      const ans = examState.answers[qid]
      return Array.isArray(ans) ? ans.length > 0 : ans !== undefined && ans !== ""
    }
  ).length

  const handleSubmit = useCallback(() => {
    const objectiveAnswers = questions.map((q) => {
      const studentAnswer = examState.answers[q.id] || (q.type === "multiple" ? [] : "")
      const isText = q.type === "text"
      let isCorrect = false
      if (!isText && q.correctAnswer !== undefined) {
        if (Array.isArray(q.correctAnswer)) {
          isCorrect =
            Array.isArray(studentAnswer) &&
            studentAnswer.length === q.correctAnswer.length &&
            studentAnswer.every((a) => q.correctAnswer!.includes(a))
        } else {
          isCorrect = studentAnswer === q.correctAnswer
        }
      }
      return {
        questionId: q.id,
        questionName: q.name,
        questionType: q.type,
        questionContent: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer || "",
        studentAnswer: studentAnswer,
        score: isCorrect ? q.score : 0,
        maxScore: q.score,
        isCorrect,
      }
    })

    const totalScore = objectiveAnswers.reduce((sum, a) => sum + a.score, 0)
    const maxScore = questions.reduce((sum, q) => sum + q.score, 0)

    const submission: LocalSubmission = {
      id: `sub-sim-${Date.now()}`,
      studentId,
      scenarioId,
      scenarioName,
      taskId,
      taskName,
      assessmentForm,
      status: "pending",
      submittedAt: new Date().toLocaleString("zh-CN"),
      maxScore,
      objectiveAnswers,
    }

    setExamState((prev) => ({ ...prev, isSubmitted: true }))
    onSubmit(submission)
    setShowSubmitDialog(false)
  }, [examState.answers, questions, onSubmit, studentId, scenarioId, scenarioName, taskId, taskName, assessmentForm])

  // 时间到自动提交
  useEffect(() => {
    if (showTimeUpDialog) {
      handleSubmit()
    }
  }, [showTimeUpDialog, handleSubmit])

  if (!examState.isStarted) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Timer className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium">{assessmentForm}测评</h3>
            <p className="text-sm text-gray-500 mt-1">
              共 {questions.length} 道题目，限时 {duration} 分钟
            </p>
          </div>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {duration} 分钟
            </Badge>
            <Badge variant="outline">
              <Flag className="h-3 w-3 mr-1" />
              {questions.length} 题
            </Badge>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">注意事项</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li>· 开始答题后计时器将自动启动，不可暂停</li>
                  <li>· 答题过程中可随时标记疑问题目</li>
                  <li>· 时间结束后将自动交卷</li>
                  <li>· 交卷后无法修改答案</li>
                </ul>
              </div>
            </div>
          </div>
          <Button onClick={startExam} size="lg">
            开始答题
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (examState.isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-700">提交成功</h3>
            <p className="text-sm text-gray-500 mt-1">
              您的{assessmentForm}已提交，等待教师评分
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">答题用时</span>
              <span>{formatTime(duration * 60 - examState.timeRemaining)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">完成题目</span>
              <span>
                {answeredCount} / {questions.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">标记疑问</span>
              <span>{flaggedQuestions.size} 题</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            您可以在「学生评分管理」中查看评分进度
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswered =
    currentQuestion &&
    (() => {
      const ans = examState.answers[currentQuestion.id]
      return Array.isArray(ans) ? ans.length > 0 : ans !== undefined && ans !== ""
    })()

  return (
    <div className="space-y-4">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
        <div className="flex items-center gap-3">
          <Badge
            variant={examState.timeRemaining < 300 ? "destructive" : "outline"}
            className="gap-1"
          >
            <Clock className="h-3 w-3" />
            {formatTime(examState.timeRemaining)}
          </Badge>
          <span className="text-sm text-gray-500">
            {answeredCount} / {questions.length} 题已答
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowSubmitDialog(true)}>
          <Send className="h-3.5 w-3.5 mr-1" />
          交卷
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 题目导航 */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">题目导航</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const answered =
                  (() => {
                    const ans = examState.answers[q.id]
                    return Array.isArray(ans) ? ans.length > 0 : ans !== undefined && ans !== ""
                  })()
                const isFlagged = flaggedQuestions.has(q.id)
                const isCurrent = idx === currentQuestionIndex
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`relative h-9 rounded-md text-sm font-medium transition-colors ${
                      isCurrent
                        ? "bg-blue-500 text-white"
                        : answered
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-green-50 border border-green-200" />
                已答
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-gray-50 border border-gray-200" />
                未答
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-blue-500" />
                当前
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 答题区域 */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">第 {currentQuestionIndex + 1} 题</Badge>
                  <Badge variant="secondary" className="text-xs">
                    {currentQuestion.score} 分
                  </Badge>
                  {currentQuestion.type === "single" && (
                    <Badge variant="outline" className="text-xs">单选题</Badge>
                  )}
                  {currentQuestion.type === "multiple" && (
                    <Badge variant="outline" className="text-xs">多选题</Badge>
                  )}
                  {currentQuestion.type === "judgment" && (
                    <Badge variant="outline" className="text-xs">判断题</Badge>
                  )}
                  {currentQuestion.type === "text" && (
                    <Badge variant="outline" className="text-xs">问答题</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={flaggedQuestions.has(currentQuestion.id) ? "text-amber-500" : ""}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {flaggedQuestions.has(currentQuestion.id) ? "已标记" : "标记"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-base font-medium">{currentQuestion.content}</div>

              {/* 单选题 */}
              {currentQuestion.type === "single" && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        examState.answers[currentQuestion.id] === opt
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={opt}
                        checked={examState.answers[currentQuestion.id] === opt}
                        onChange={() => handleAnswerChange(currentQuestion.id, opt)}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* 多选题 */}
              {currentQuestion.type === "multiple" && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((opt) => {
                    const selected = (examState.answers[currentQuestion.id] as string[]) || []
                    const isSelected = selected.includes(opt)
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opt}
                          checked={isSelected}
                          onChange={(e) => {
                            const newSelected = e.target.checked
                              ? [...selected, opt]
                              : selected.filter((s) => s !== opt)
                            handleAnswerChange(currentQuestion.id, newSelected)
                          }}
                          className="h-4 w-4 rounded text-blue-500"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {/* 判断题 */}
              {currentQuestion.type === "judgment" && (
                <div className="flex gap-3">
                  {["true", "false"].map((val) => (
                    <label
                      key={val}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        examState.answers[currentQuestion.id] === val
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={val}
                        checked={examState.answers[currentQuestion.id] === val}
                        onChange={() => handleAnswerChange(currentQuestion.id, val)}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-sm">{val === "true" ? "正确" : "错误"}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* 问答题 */}
              {currentQuestion.type === "text" && (
                <Textarea
                  placeholder="请输入您的答案..."
                  rows={6}
                  value={(examState.answers[currentQuestion.id] as string) || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          {/* 导航按钮 */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((i) => i - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一题
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={() => setCurrentQuestionIndex((i) => i + 1)}>
                下一题
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => setShowSubmitDialog(true)}>
                <Send className="h-4 w-4 mr-1" />
                提交试卷
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 提交确认对话框 */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提交？</DialogTitle>
            <DialogDescription>
              提交后将无法修改答案，请确认是否完成所有题目。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">总题数</span>
              <span>{questions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">已答题</span>
              <span className="text-green-600">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">未答题</span>
              <span className={answeredCount < questions.length ? "text-amber-600" : ""}>
                {questions.length - answeredCount}
              </span>
            </div>
            {flaggedQuestions.size > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">标记疑问</span>
                <span className="text-amber-600">{flaggedQuestions.size}</span>
              </div>
            )}
            {answeredCount < questions.length && (
              <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                还有 {questions.length - answeredCount} 道题目未作答，确定要提交吗？
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              继续答题
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-1" />
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 时间到对话框 */}
      <Dialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>考试时间已结束</DialogTitle>
            <DialogDescription>系统将自动提交您的答卷。</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <Clock className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">答题时间已用完，正在自动交卷...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
