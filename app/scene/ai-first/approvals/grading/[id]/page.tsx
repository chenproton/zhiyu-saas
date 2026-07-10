"use client"

import { useRef, useState } from "react"
import { AiPreScorePanel } from "@/components/ai/ai-pre-score-panel"
import { AiCommentPanel } from "@/components/ai/ai-comment-panel"
import { AiGenerateButton } from "@/components/ai/ai-generate-button"
import {
  mockAiSubjectivePreScore,
  mockAiInitialReview,
  mockAiComment,
} from "@/lib/ai-mock-data"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileCode,
  FileText,
  GraduationCap,
  Image,
  Package,
  Save,
  Sparkles,
  Star,
  Video,
  X,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { studentSubmissions, students, scenarios } from "@/lib/scene-mock-data"
import { cn } from "@/lib/utils"
import type { AiSubjectivePreScore, AiInitialReview, AiGeneratedComment } from "@/lib/ai-mock-data"
import type {
  StudentSubmission,
  ObjectiveSubmissionAnswer,
  DrawnQuestion,
  EvalPointScoreRecord,
  TaskEvalPoint,
  GradeMapping,
  ReviewStep,
  SubmissionAttachment,
} from "@/lib/scene-mock-data"

// ============================================================================
// 辅助函数
// ============================================================================

function getStudent(studentId: string) {
  return students.find((s) => s.id === studentId)
}

function getScenario(scenarioId: string) {
  return scenarios.find((s) => s.id === scenarioId)
}

function getTaskEvalPoints(scenarioId: string, taskId: string, methodKey: "randomDraw" | "review" | "paper" | "questionBank" | "outcome" | "homework" | "quiz") {
  const scenario = getScenario(scenarioId)
  if (!scenario) return []
  const task = scenario.tasks.find((t) => t.id === taskId)
  if (!task || !task.evalPoints) return []
  return task.evalPoints[methodKey] || []
}

function getTaskReviewSteps(scenarioId: string, taskId: string): ReviewStep[] {
  const scenario = getScenario(scenarioId)
  if (!scenario) return []
  const task = scenario.tasks.find((t) => t.id === taskId)
  return task?.reviewSteps || []
}
// ============================================================================
// 客观题评分卡片
// ============================================================================

function ObjectiveGradingCard({
  answer,
  index,
  isGraded,
  onScoreChange,
  aiPreScore,
  onAiPreScoreChange,
}: {
  answer: ObjectiveSubmissionAnswer
  index: number
  isGraded: boolean
  onScoreChange: (questionId: string, newScore: number) => void
  aiPreScore: AiSubjectivePreScore | null
  onAiPreScoreChange: (score: AiSubjectivePreScore | null) => void
}) {
  const [localScore, setLocalScore] = useState(answer.score.toString())
  const [isExpanded, setIsExpanded] = useState(answer.questionType === "text")

  const isSubjective = answer.questionType === "text"

  const handleBlur = () => {
    const num = parseFloat(localScore)
    if (!isNaN(num) && num >= 0 && num <= answer.maxScore) {
      onScoreChange(answer.questionId, num)
    } else {
      setLocalScore(answer.score.toString())
    }
  }

  const getAnswerLabel = () => {
    if (answer.questionType === "judgment") {
      return answer.studentAnswer === "true" ? "正确" : "错误"
    }
    if (Array.isArray(answer.studentAnswer)) {
      return answer.studentAnswer.join("、")
    }
    return answer.studentAnswer
  }

  const getCorrectLabel = () => {
    if (answer.questionType === "judgment") {
      return answer.correctAnswer === "true" ? "正确" : "错误"
    }
    if (Array.isArray(answer.correctAnswer)) {
      return answer.correctAnswer.join("、")
    }
    return answer.correctAnswer
  }

  const questionTypeLabel: Record<string, string> = {
    single: "单选",
    multiple: "多选",
    judgment: "判断",
    text: "问答",
    short_answer: "简答",
    essay: "论述",
    fill_blank: "填空",
  }

  return (
    <Card className={cn("border-slate-200", isSubjective && "border-amber-200")}>
      <CardContent className="p-0">
        {/* 折叠状态 */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
            isSubjective ? "bg-amber-50/40 hover:bg-amber-50/60" : "hover:bg-gray-50/50"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Badge variant="outline" className={cn("text-xs shrink-0", isSubjective && "border-amber-300 text-amber-700")}>
            {questionTypeLabel[answer.questionType] || answer.questionType}
          </Badge>
          <span className="text-xs text-gray-400 shrink-0">第 {index + 1} 题</span>
          <span className="text-sm font-medium text-gray-800 flex-1 truncate">
            {answer.questionName || answer.questionContent}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {/* 主观题：教师评分输入框 */}
            {isSubjective ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={answer.maxScore}
                  step={0.5}
                  value={localScore}
                  onChange={(e) => setLocalScore(e.target.value)}
                  onBlur={handleBlur}
                  disabled={isGraded}
                  className="w-16 text-right h-8 text-sm font-semibold border-amber-300 focus-visible:ring-amber-400"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs text-gray-400">/ {answer.maxScore}</span>
              </div>
            ) : (
              /* 客观题：自动得分展示 */
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-700">{answer.score}</span>
                <span className="text-xs text-gray-400">/ {answer.maxScore}</span>
                {answer.isCorrect ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-[10px] px-1 py-0 h-5">
                    <CheckCircle2 className="h-3 w-3 mr-0.5" />
                    正确
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px] px-1 py-0 h-5">
                    <XCircle className="h-3 w-3 mr-0.5" />
                    错误
                  </Badge>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 ml-1"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        {/* 展开详情 */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
            <p className="text-sm text-gray-800 leading-relaxed">{answer.questionContent}</p>

            {/* 客观题选项展示 */}
            {answer.options && answer.options.length > 0 && (
              <div className="space-y-1.5">
                {answer.options.map((opt, idx) => {
                  const optLabel = String.fromCharCode(65 + idx)
                  const isSelected =
                    Array.isArray(answer.studentAnswer)
                      ? answer.studentAnswer.includes(opt)
                      : answer.studentAnswer === opt
                  const isCorrect =
                    Array.isArray(answer.correctAnswer)
                      ? answer.correctAnswer.includes(opt)
                      : answer.correctAnswer === opt

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                        isCorrect
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : isSelected && !isCorrect
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded text-xs font-medium ${
                          isCorrect
                            ? "bg-green-500 text-white"
                            : isSelected && !isCorrect
                              ? "bg-red-500 text-white"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {optLabel}
                      </span>
                      <span>{opt}</span>
                      {isCorrect && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                      )}
                      {isSelected && !isCorrect && (
                        <XCircle className="h-3.5 w-3.5 text-red-500 ml-auto" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* 判断题展示 */}
            {!answer.options && answer.questionType === "judgment" && (
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                    answer.correctAnswer === "true"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : answer.studentAnswer === "true" && answer.correctAnswer !== "true"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "text-gray-600"
                  }`}
                >
                  <span>正确</span>
                  {answer.correctAnswer === "true" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                    answer.correctAnswer === "false"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : answer.studentAnswer === "false" && answer.correctAnswer !== "false"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "text-gray-600"
                  }`}
                >
                  <span>错误</span>
                  {answer.correctAnswer === "false" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  )}
                </div>
              </div>
            )}

            {/* 主观题：学生答案 */}
            {isSubjective && (
              <div className="space-y-2">
                <div className="bg-amber-50/50 rounded-lg border border-amber-100 p-3">
                  <div className="text-xs text-amber-700 font-medium mb-1">学生答案</div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{answer.studentAnswer as string}</p>
                </div>
                {/* 主观题评分区 + AI 预评分 */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 space-y-3">
                  <SubjectiveScoreInput
                    maxScore={answer.maxScore}
                    actualScore={answer.score}
                    isGraded={isGraded}
                    onChange={(actual) => onScoreChange(answer.questionId, actual)}
                  />
                  {!isGraded && (
                    <>
                      {aiPreScore ? (
                        <AiPreScorePanel
                          key={`pre-${aiPreScore.suggestedScore}-${aiPreScore.confidence}`}
                          preScore={aiPreScore}
                          onAdopt={(score) => onScoreChange(answer.questionId, (score / 100) * answer.maxScore)}
                          onDismiss={() => onAiPreScoreChange(null)}
                        />
                      ) : (
                        <div className="flex justify-end">
                          <AiGenerateButton
                            onClick={() => {
                              setTimeout(() => onAiPreScoreChange(mockAiSubjectivePreScore()), 800)
                            }}
                            label="AI 预评分"
                            size="sm"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 客观题答案对比 */}
            {!isSubjective && (
              <div className="flex items-center gap-4 pt-1 bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-sm">
                  <span className="text-gray-500">学生答案：</span>
                  <span className={answer.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {getAnswerLabel()}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">正确答案：</span>
                  <span className="text-green-600 font-medium">{getCorrectLabel()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 现场问答抽题卡片
// ============================================================================

function DrawnQuestionCard({
  question,
  index,
  isGraded,
  onOralAnswerChange,
}: {
  question: DrawnQuestion
  index: number
  isGraded: boolean
  onOralAnswerChange: (questionId: string, oralAnswer: string) => void
}) {
  const [oralAnswer, setOralAnswer] = useState(question.studentOralAnswer || "")

  const getQuestionTypeLabel = () => {
    switch (question.questionType) {
      case "single": return "单选题"
      case "multiple": return "多选题"
      case "judgment": return "判断题"
      case "subjective": return "主观题"
      default: return question.questionType
    }
  }

  const getQuestionTypeColor = () => {
    switch (question.questionType) {
      case "single": return "bg-purple-50 text-purple-600 border-purple-200"
      case "multiple": return "bg-indigo-50 text-indigo-600 border-indigo-200"
      case "judgment": return "bg-orange-50 text-orange-600 border-orange-200"
      case "subjective": return "bg-blue-50 text-blue-600 border-blue-200"
      default: return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const getAnswerLabel = () => {
    if (question.questionType === "judgment") {
      return question.correctAnswer === "true" ? "正确" : "错误"
    }
    if (Array.isArray(question.correctAnswer)) {
      return question.correctAnswer.join("、")
    }
    return question.correctAnswer
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
            第 {index + 1} 题
          </Badge>
          <Badge variant="outline" className={`text-xs ${getQuestionTypeColor()}`}>
            {getQuestionTypeLabel()}
          </Badge>
          <span className="text-xs text-gray-400">{question.questionName}</span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed">{question.questionContent}</p>

        {question.options && question.options.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-gray-500 font-medium">选项</div>
            <div className="space-y-1">
              {question.options.map((opt, optIdx) => {
                const isCorrect = Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.includes(opt)
                  : question.correctAnswer === opt
                return (
                  <div
                    key={optIdx}
                    className={`flex items-center gap-2 text-sm px-2.5 py-1.5 rounded border ${
                      isCorrect
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-gray-50 border-gray-100 text-gray-600"
                    }`}
                  >
                    <span className={`text-xs font-mono w-5 h-5 flex items-center justify-center rounded shrink-0 ${
                      isCorrect ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-500"
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                    {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 ml-auto shrink-0" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-green-50 rounded-lg border border-green-100 p-3">
          <div className="text-xs text-green-600 font-medium mb-1">参考答案</div>
          <p className="text-sm text-green-700 leading-relaxed">{getAnswerLabel()}</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">学生口头回答记录（教师现场记录）</Label>
          <Textarea
            placeholder="请记录学生现场口头回答的要点..."
            value={oralAnswer}
            onChange={(e) => setOralAnswer(e.target.value)}
            onBlur={() => onOralAnswerChange(question.questionId, oralAnswer)}
            disabled={isGraded}
            rows={3}
            className="text-sm resize-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 上一阶段评价记录（评审历史）
// ============================================================================

function ReviewPhaseHistory({ evalPoints }: { evalPoints: TaskEvalPoint[] }) {
  const [expanded, setExpanded] = useState(false)
  // 模拟上一阶段评价数据
  const mockPhaseScores = evalPoints.map((ep) => ({
    evalPointId: ep.id,
    evalPointName: ep.name,
    score: Math.round(ep.maxScore * (0.6 + Math.random() * 0.3)),
    comment: ["表现良好，基本达到要求", "思路清晰，有改进空间", "完成度较高，细节需优化", "符合预期，建议继续保持"][Math.floor(Math.random() * 4)],
  }))

  return (
    <div className="rounded-lg border bg-white">
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">上一阶段评价（初评 - 张老师）</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t pt-2 space-y-2">
          {mockPhaseScores.map((s) => (
            <div key={s.evalPointId} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{s.evalPointName}</span>
                <span className="font-medium text-gray-800">{s.score} 分</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{s.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 附件预览
// ============================================================================

function AttachmentPreview({
  attachment,
  onClose,
}: {
  attachment: SubmissionAttachment
  onClose: () => void
}) {
  const getTypeLabel = () => {
    switch (attachment.type) {
      case "code": return "代码"
      case "video": return "视频"
      case "document": return "文档"
      case "image": return "图片"
      default: return "其他"
    }
  }

  const getTypeIcon = () => {
    switch (attachment.type) {
      case "code": return <FileCode className="h-5 w-5 text-blue-500" />
      case "video": return <Video className="h-5 w-5 text-red-500" />
      case "document": return <FileText className="h-5 w-5 text-amber-500" />
      case "image": return <Image className="h-5 w-5 text-green-500" />
      default: return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Dialog open={!!attachment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <DialogTitle className="text-sm font-medium">{attachment.name}</DialogTitle>
            <Badge variant="outline" className="text-xs ml-1">{getTypeLabel()}</Badge>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4 bg-gray-50 min-h-[300px] max-h-[calc(90vh-120px)]">
          {attachment.type === "image" && (
            <div className="flex items-center justify-center">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-w-full max-h-[70vh] rounded-lg shadow-sm border"
              />
            </div>
          )}
          {attachment.type === "video" && (
            <div className="flex items-center justify-center">
              <video
                src={attachment.url}
                controls
                className="max-w-full max-h-[70vh] rounded-lg shadow-sm border"
                preload="metadata"
              />
            </div>
          )}
          {attachment.type === "code" && (
            <div className="bg-slate-900 rounded-lg overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border-b border-slate-700">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-slate-400 ml-2">{attachment.name}</span>
              </div>
              <pre className="p-4 text-sm text-slate-200 overflow-x-auto whitespace-pre font-mono leading-relaxed">
                {attachment.content || "// 暂无预览内容"}
              </pre>
            </div>
          )}
          {attachment.type === "document" && (
            <div className="bg-white rounded-lg border p-6 max-w-2xl mx-auto">
              <div className="prose prose-sm max-w-none">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {attachment.content || "暂无预览内容"}
                </pre>
              </div>
            </div>
          )}
          {attachment.type === "other" && (
            <div className="text-center py-12 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">该类型文件暂不支持在线预览</p>
              <p className="text-xs mt-1">文件名：{attachment.name}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// 评价点评分卡片
// ============================================================================

function GradeMappingList({ gradeMapping }: { gradeMapping: GradeMapping[] }) {
  const sorted = [...gradeMapping].sort((a, b) => b.maxScore - a.maxScore)
  return (
    <div className="space-y-1">
      {sorted.map((g) => (
        <div key={g.id} className="flex items-start gap-2 text-[11px] leading-tight">
          <span className="font-medium text-gray-600 shrink-0">{g.grade}</span>
          <span className="text-gray-400 shrink-0">({g.minScore}-{g.maxScore}分)</span>
          {g.remark && <span className="text-gray-500">{g.remark}</span>}
        </div>
      ))}
    </div>
  )
}

function SubjectiveScoreInput({
  maxScore,
  actualScore,
  isGraded,
  onChange,
}: {
  maxScore: number
  actualScore: number
  isGraded: boolean
  onChange: (actualScore: number) => void
}) {
  const toStandard = (actual: number) => Math.min(100, Math.max(0, Math.round((actual / maxScore) * 100)))
  const toActual = (standard: number) => Math.min(maxScore, Math.max(0, Math.round((standard / 100) * maxScore * 10) / 10))

  const [standardInput, setStandardInput] = useState(toStandard(actualScore).toString())
  const prevActualRef = useRef(actualScore)
  if (actualScore !== prevActualRef.current) {
    prevActualRef.current = actualScore
    setStandardInput(toStandard(actualScore).toString())
  }

  const standardNum = parseFloat(standardInput) || 0
  const computedActual = toActual(standardNum)

  const handleBlur = () => {
    const num = parseFloat(standardInput)
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onChange(toActual(num))
    } else {
      setStandardInput(toStandard(actualScore).toString())
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-500">标准评分</span>
        <Input
          type="number"
          min={0}
          max={100}
          step={1}
          value={standardInput}
          onChange={(e) => setStandardInput(e.target.value)}
          onBlur={handleBlur}
          disabled={isGraded}
          className="w-16 text-right h-8 text-sm font-semibold"
        />
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
      <div className="text-[11px] text-gray-600">
        换算后：<span className="font-semibold text-gray-800">{computedActual}</span> / {maxScore} 分
      </div>
    </div>
  )
}

function StandardScoreInput({
  maxScore,
  actualScore,
  gradeMapping,
  isGraded,
  onChange,
}: {
  maxScore: number
  actualScore: number
  gradeMapping?: GradeMapping[]
  isGraded: boolean
  onChange: (actualScore: number) => void
}) {
  // 实际分数 → 标准分（0-100）
  const toStandard = (actual: number) => Math.min(100, Math.max(0, Math.round((actual / maxScore) * 100)))
  // 标准分 → 实际分数
  const toActual = (standard: number) => Math.min(maxScore, Math.max(0, Math.round((standard / 100) * maxScore * 10) / 10))

  const [standardInput, setStandardInput] = useState(toStandard(actualScore).toString())

  // 当外部 actualScore 变化时同步（如初始化或父组件更新）
  const prevActualRef = useRef(actualScore)
  if (actualScore !== prevActualRef.current) {
    prevActualRef.current = actualScore
    setStandardInput(toStandard(actualScore).toString())
  }

  const standardNum = parseFloat(standardInput) || 0
  const computedActual = toActual(standardNum)
  const matchedGrade = gradeMapping?.find((g) => standardNum >= g.minScore && standardNum <= g.maxScore)

  const handleBlur = () => {
    const num = parseFloat(standardInput)
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onChange(toActual(num))
    } else {
      setStandardInput(toStandard(actualScore).toString())
    }
  }

  return (
    <div className="shrink-0">
      <Label className="text-xs text-amber-700 font-medium block mb-1">标准评分（0-100）</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          max={100}
          step={1}
          value={standardInput}
          onChange={(e) => setStandardInput(e.target.value)}
          onBlur={handleBlur}
          disabled={isGraded}
          className="w-16 text-right h-9 text-sm font-semibold bg-white"
        />
        <span className="text-xs text-gray-500">分</span>
      </div>
      {/* 换算结果 */}
      <div className="mt-1 space-y-0.5">
        <div className="text-[11px] text-gray-600">
          加权后：<span className="font-semibold text-gray-800">{computedActual}</span> / {maxScore} 分
        </div>
        {matchedGrade && (
          <Badge variant="outline" className="text-[10px] bg-white">
            {matchedGrade.grade} 档 · {matchedGrade.remark}
          </Badge>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// 作业类型评价点表格（扣分制）
// ============================================================================

function HomeworkEvalPointTable({
  evalPoints,
  evalPointScores,
  isGraded,
  onChange,
  aiInitialReviews,
  onAiInitialReviewChange,
}: {
  evalPoints: TaskEvalPoint[]
  evalPointScores: EvalPointScoreRecord[]
  isGraded: boolean
  onChange: (record: EvalPointScoreRecord) => void
  aiInitialReviews?: Record<string, AiInitialReview>
  onAiInitialReviewChange?: (evalPointId: string, review: AiInitialReview | null) => void
}) {
  const getDeduction = (ep: TaskEvalPoint) => {
    const record = evalPointScores.find((s) => s.evalPointId === ep.id)
    if (!record) return 0
    return Math.max(0, ep.maxScore - record.score)
  }

  const handleDeductionChange = (ep: TaskEvalPoint, deductionStr: string) => {
    const deduction = parseFloat(deductionStr) || 0
    const clampedDeduction = Math.max(0, Math.min(ep.maxScore, deduction))
    const actualScore = Math.max(0, ep.maxScore - clampedDeduction)
    onChange({
      evalPointId: ep.id,
      evalPointName: ep.name,
      weight: ep.weight,
      maxScore: ep.maxScore,
      score: actualScore,
      comment: "",
    })
  }

  const totalScore = evalPointScores.reduce((sum, e) => sum + e.score, 0)
  const maxTotal = evalPoints.reduce((sum, e) => sum + e.maxScore, 0)

  return (
    <div className="space-y-3">
      {/* 表头 */}
      <div className="grid grid-cols-[1fr_100px_80px] gap-3 px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-500">
        <span>评价点</span>
        <span className="text-center">扣分值</span>
        <span className="text-right">总分</span>
      </div>
      {/* 评价点行 */}
      {evalPoints.map((ep) => {
        const record = evalPointScores.find((s) => s.evalPointId === ep.id)
        const deduction = getDeduction(ep)
        const hasScore = !!record
        const aiReview = aiInitialReviews?.[ep.id]
        return (
          <div key={ep.id} className="space-y-2">
            <div
              className={cn(
                "grid grid-cols-[1fr_100px_80px] gap-3 px-3 py-3 rounded-lg border items-center transition-colors",
                hasScore ? "bg-white border-gray-200" : "bg-amber-50/40 border-amber-200"
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-800">{ep.name}</div>
                  {!isGraded && !aiReview && (
                    <AiGenerateButton
                      onClick={() => {
                        setTimeout(() => {
                          onAiInitialReviewChange?.(ep.id, mockAiInitialReview(ep.name))
                        }, 800)
                      }}
                      label="AI"
                      size="sm"
                      className="h-6 text-[10px] px-1.5"
                    />
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{ep.desc}</div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={ep.maxScore}
                  step={0.5}
                  value={deduction}
                  onChange={(e) => handleDeductionChange(ep, e.target.value)}
                  disabled={isGraded}
                  className="w-16 text-right h-8 text-sm font-semibold"
                />
                <span className="text-xs text-gray-400">分</span>
              </div>
              <div className="text-right text-sm text-gray-500">
                <span className={cn("font-medium", hasScore ? "text-gray-700" : "text-amber-600")}>
                  {record?.score ?? "-"}
                </span>
                <span className="text-gray-400"> / {ep.maxScore}</span>
              </div>
            </div>
            {aiReview && (
              <AiPreScorePanel
                key={`hw-review-${ep.id}-${aiReview.suggestedScore}`}
                initialReview={aiReview}
                onAdopt={(score) => {
                  onChange({
                    evalPointId: ep.id,
                    evalPointName: ep.name,
                    weight: ep.weight,
                    maxScore: ep.maxScore,
                    score: (score / 100) * ep.maxScore,
                    comment: "",
                  })
                  onAiInitialReviewChange?.(ep.id, null)
                }}
                onDismiss={() => onAiInitialReviewChange?.(ep.id, null)}
              />
            )}
          </div>
        )
      })}
      {/* 合计 */}
      <div className="grid grid-cols-[1fr_100px_80px] gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border items-center">
        <span className="text-sm font-medium text-gray-700">合计</span>
        <div className="text-center text-xs text-gray-400">—</div>
        <div className="text-right text-sm font-medium text-gray-800">
          {totalScore} <span className="text-gray-400 font-normal">/ {maxTotal}</span>
        </div>
      </div>
    </div>
  )
}

function EvalPointGradingCard({
  evalPoint,
  scoreRecord,
  isGraded,
  onChange,
  aiInitialReview,
  onAiInitialReviewChange,
}: {
  evalPoint: TaskEvalPoint
  scoreRecord?: EvalPointScoreRecord
  isGraded: boolean
  onChange: (record: EvalPointScoreRecord) => void
  aiInitialReview?: AiInitialReview | null
  onAiInitialReviewChange?: (evalPointId: string, review: AiInitialReview | null) => void
}) {
  const [comment, setComment] = useState(scoreRecord?.comment || "")

  const handleScoreChange = (actualScore: number) => {
    onChange({
      evalPointId: evalPoint.id,
      evalPointName: evalPoint.name,
      weight: evalPoint.weight,
      maxScore: evalPoint.maxScore,
      score: actualScore,
      comment,
    })
  }

  const handleCommentBlur = () => {
    onChange({
      evalPointId: evalPoint.id,
      evalPointName: evalPoint.name,
      weight: evalPoint.weight,
      maxScore: evalPoint.maxScore,
      score: scoreRecord?.score || 0,
      comment,
    })
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-800 text-sm">{evalPoint.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{evalPoint.desc}</p>
          </div>
        </div>

        {/* 等级参考 */}
        {evalPoint.gradeMapping && evalPoint.gradeMapping.length > 0 && (
          <div className="bg-gray-50 rounded-md px-2.5 py-1.5">
            <GradeMappingList gradeMapping={evalPoint.gradeMapping} />
          </div>
        )}

        {/* 评分区：标准分输入 + 评语 */}
        <div className="flex items-start gap-3 bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-2.5">
          <StandardScoreInput
            maxScore={evalPoint.maxScore}
            actualScore={scoreRecord?.score || 0}
            gradeMapping={evalPoint.gradeMapping}
            isGraded={isGraded}
            onChange={handleScoreChange}
          />
          <div className="flex-1">
            <Label className="text-xs text-amber-700 font-medium block mb-1">评语</Label>
            <Textarea
              placeholder="请输入评分说明或改进建议..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={handleCommentBlur}
              disabled={isGraded}
              rows={2}
              className="text-sm resize-none bg-white"
            />
          </div>
        </div>

        {/* AI 初评建议 */}
        {!isGraded && (
          <>
            {aiInitialReview ? (
              <AiPreScorePanel
                key={`review-${evalPoint.id}-${aiInitialReview.suggestedScore}`}
                initialReview={aiInitialReview}
                onAdopt={(score) => {
                  handleScoreChange((score / 100) * evalPoint.maxScore)
                  onAiInitialReviewChange?.(evalPoint.id, null)
                }}
                onDismiss={() => onAiInitialReviewChange?.(evalPoint.id, null)}
              />
            ) : (
              <div className="flex justify-end">
                <AiGenerateButton
                  onClick={() => {
                    setTimeout(() => {
                      onAiInitialReviewChange?.(evalPoint.id, mockAiInitialReview(evalPoint.name))
                    }, 800)
                  }}
                  label="AI 初评建议"
                  size="sm"
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// 主页面
// ============================================================================

export default function GradingDetailPage() {
  const params = useParams()
  const submissionId = params.id as string

  const [submission, setSubmission] = useState<StudentSubmission | undefined>(
    studentSubmissions.find((s) => s.id === submissionId)
  )

  const [objectiveAnswers, setObjectiveAnswers] = useState<ObjectiveSubmissionAnswer[]>(
    submission?.objectiveAnswers || []
  )

  const [evalPointScores, setEvalPointScores] = useState<EvalPointScoreRecord[]>(
    submission?.evalPointScores || []
  )

  const [drawnQuestions, setDrawnQuestions] = useState<DrawnQuestion[]>(
    submission?.drawnQuestions || []
  )

  const [teacherComment, setTeacherComment] = useState(submission?.teacherComment || "")
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [manualTotal, setManualTotal] = useState<number | null>(null)
  const [previewAttachment, setPreviewAttachment] = useState<SubmissionAttachment | null>(null)
  const [questionFilter, setQuestionFilter] = useState<"all" | "pending">("all")

  // AI states
  const [aiComment, setAiComment] = useState<AiGeneratedComment | null>(null)
  const [aiCommentLoading, setAiCommentLoading] = useState(false)
  const [aiPreScore, setAiPreScore] = useState<AiSubjectivePreScore | null>(null)
  const [aiInitialReviews, setAiInitialReviews] = useState<Record<string, AiInitialReview>>({})
  const [aiScoreLoading, setAiScoreLoading] = useState(false)
  const [aiScorePreviewOpen, setAiScorePreviewOpen] = useState(false)
  const [aiScorePreview, setAiScorePreview] = useState<{
    assessmentForm: string
    objectiveAnswers?: ObjectiveSubmissionAnswer[]
    evalPointScores?: EvalPointScoreRecord[]
    teacherComment: string
    projectedTotal: number
  } | null>(null)

  if (!submission) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-700">未找到提交记录</h2>
        <p className="text-sm text-gray-500 mt-1">该评分记录不存在或已被删除</p>
        <Button className="mt-4" asChild>
          <Link href="/scene/ai-first/approvals/grading">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
      </div>
    )
  }

  const student = getStudent(submission.studentId)
  const scenario = getScenario(submission.scenarioId)

  // 根据测评形式获取对应的评价点
  const methodKeyMap: Record<string, "randomDraw" | "review" | "paper" | "questionBank" | "outcome" | "homework" | "quiz"> = {
    "现场问答": "randomDraw",
    "现场评审": "review",
    "试卷": "paper",
    "题库": "questionBank",
    "成果评价": "outcome",
    "作业": "homework",
    "随堂测": "quiz",
  }
  const evalMethodKey = methodKeyMap[submission.assessmentForm]
  const evalPoints = evalMethodKey ? getTaskEvalPoints(submission.scenarioId, submission.taskId, evalMethodKey) : []
  const reviewSteps = getTaskReviewSteps(submission.scenarioId, submission.taskId)

  const isGraded = submission.status === "graded" || isSubmitted

  // 计算客观题自动得分（单选/多选/判断）
  const autoObjectiveScore = objectiveAnswers
    .filter((a) => a.questionType !== "text")
    .reduce((sum, a) => sum + a.score, 0)
  const autoObjectiveMax = objectiveAnswers
    .filter((a) => a.questionType !== "text")
    .reduce((sum, a) => sum + a.maxScore, 0)

  // 计算主观题得分（问答）
  const subjectiveQuestionScore = objectiveAnswers
    .filter((a) => a.questionType === "text")
    .reduce((sum, a) => sum + a.score, 0)
  const subjectiveQuestionMax = objectiveAnswers
    .filter((a) => a.questionType === "text")
    .reduce((sum, a) => sum + a.maxScore, 0)

  // 计算评价点总分（现场评审/现场问答）
  const evalPointTotal = evalPointScores.reduce((sum, e) => sum + e.score, 0)
  const evalPointMaxTotal = evalPoints.reduce((sum, e) => sum + e.maxScore, 0)

  // 自动计算总分
  const isObjectiveAssessment =
    submission.assessmentForm === "试卷" ||
    submission.assessmentForm === "题库" ||
    submission.assessmentForm === "随堂测"
  const autoTotal = isObjectiveAssessment
    ? autoObjectiveScore + subjectiveQuestionScore + evalPointTotal
    : evalPointTotal

  // 最终总分（教师可手动覆盖）
  const finalTotal = manualTotal !== null ? manualTotal : autoTotal

  const handleObjectiveScoreChange = (questionId: string, newScore: number) => {
    setObjectiveAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, score: newScore } : a))
    )
  }

  const handleEvalPointScoreChange = (record: EvalPointScoreRecord) => {
    setEvalPointScores((prev) => {
      const existing = prev.find((e) => e.evalPointId === record.evalPointId)
      if (existing) {
        return prev.map((e) => (e.evalPointId === record.evalPointId ? record : e))
      }
      return [...prev, record]
    })
  }

  const handleOralAnswerChange = (questionId: string, oralAnswer: string) => {
    setDrawnQuestions((prev) =>
      prev.map((q) => (q.questionId === questionId ? { ...q, studentOralAnswer: oralAnswer } : q))
    )
  }

  const handleAiScore = () => {
    if (submission.assessmentForm === "现场问答") {
      const hasOralAnswer = drawnQuestions.some((q) => q.studentOralAnswer?.trim())
      if (!hasOralAnswer) {
        alert("请先补充学生口头回答记录，再进行智能评分")
        return
      }
    }

    setAiScoreLoading(true)
    setTimeout(() => {
      let previewObjectiveAnswers: ObjectiveSubmissionAnswer[] | undefined
      let previewEvalPointScores: EvalPointScoreRecord[] | undefined

      if (isObjectiveAssessment) {
        previewObjectiveAnswers = objectiveAnswers.map((a) => {
          if (a.questionType === "text") {
            return { ...a, score: Math.max(0, Math.min(a.maxScore, Math.round(a.maxScore * (0.6 + Math.random() * 0.35)))) }
          }
          return a
        })
      }

      if (["作业", "成果评价", "现场评审", "现场问答"].includes(submission.assessmentForm)) {
        previewEvalPointScores = evalPoints.map((ep) => {
          const ratio = submission.assessmentForm === "作业" ? 0.85 + Math.random() * 0.12 : 0.7 + Math.random() * 0.25
          const score = Math.max(0, Math.min(ep.maxScore, Math.round(ep.maxScore * ratio * 10) / 10))
          const comment = score >= ep.maxScore * 0.9
            ? "表现优秀，达到预期目标。"
            : score >= ep.maxScore * 0.7
            ? "表现良好，仍有提升空间。"
            : "需要加强练习，重点关注薄弱环节。"
          return {
            evalPointId: ep.id,
            evalPointName: ep.name,
            weight: ep.weight,
            maxScore: ep.maxScore,
            score,
            comment,
          }
        })
      }

      const comment = mockAiComment(student?.name || "学生")

      let projectedTotal = 0
      if (isObjectiveAssessment && previewObjectiveAnswers) {
        const objScore = previewObjectiveAnswers.reduce((sum, a) => sum + a.score, 0)
        const evalScore = previewEvalPointScores ? previewEvalPointScores.reduce((sum, e) => sum + e.score, 0) : 0
        projectedTotal = objScore + evalScore
      } else if (previewEvalPointScores) {
        projectedTotal = previewEvalPointScores.reduce((sum, e) => sum + e.score, 0)
      }

      setAiScorePreview({
        assessmentForm: submission.assessmentForm,
        objectiveAnswers: previewObjectiveAnswers,
        evalPointScores: previewEvalPointScores,
        teacherComment: comment.fullComment,
        projectedTotal: Math.min(projectedTotal, submission.maxScore),
      })
      setAiScorePreviewOpen(true)
      setAiScoreLoading(false)
    }, 1200)
  }

  const applyAiScorePreview = () => {
    if (!aiScorePreview) return
    if (aiScorePreview.objectiveAnswers) {
      setObjectiveAnswers(aiScorePreview.objectiveAnswers)
    }
    if (aiScorePreview.evalPointScores) {
      setEvalPointScores(aiScorePreview.evalPointScores)
    }
    setTeacherComment(aiScorePreview.teacherComment)
    setAiScorePreviewOpen(false)
    setAiScorePreview(null)
  }

  const handleSubmitGrading = () => {
    setIsSubmitted(true)
    setSubmission((prev) =>
      prev
        ? {
            ...prev,
            status: "graded",
            objectiveTotalScore: autoObjectiveScore + subjectiveQuestionScore,
            totalScore: finalTotal,
            teacherComment,
            evalPointScores,
            drawnQuestions,
            gradedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
            gradedBy: "张老师",
          }
        : prev
    )
    setIsSubmitDialogOpen(false)
  }

  const allEvalPointsScored =
    evalPoints.length === 0 || evalPoints.every((ep) => evalPointScores.some((s) => s.evalPointId === ep.id))

  const canSubmit = !isGraded && allEvalPointsScored

  const handleAiInitialReviewChange = (evalPointId: string, review: AiInitialReview | null) => {
    setAiInitialReviews((prev) => {
      const next = { ...prev }
      if (review) {
        next[evalPointId] = { ...review, evalPointId: evalPointId }
      } else {
        delete next[evalPointId]
      }
      return next
    })
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 - 紧凑 */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="sm" asChild className="h-8">
          <Link href="/scene/ai-first/approvals/grading">
            <ArrowLeft className="mr-1 h-4 w-4" />
            返回
          </Link>
        </Button>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-800">{student?.name || "未知学生"}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600">{submission.taskName}</span>
          <Badge variant="outline" className="text-xs ml-1">{submission.assessmentForm}</Badge>
        </div>
        <div className="flex-1" />
        {!isGraded && (
          <AiGenerateButton
            onClick={handleAiScore}
            loading={aiScoreLoading}
            label="智能评分"
            size="sm"
            className="h-7 text-xs"
          />
        )}
        {isGraded && (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3" />
            已评分
          </Badge>
        )}
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        {/* 试卷 / 题库 / 随堂测 - 客观题评分 */}
        {(submission.assessmentForm === "试卷" || submission.assessmentForm === "题库" || submission.assessmentForm === "随堂测") && (
          <div className="h-full flex flex-col">
            {/* 顶部大字总分 */}
            <div className="px-4 py-3 bg-white border-b shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <h2 className="text-sm font-medium text-gray-700">{submission.assessmentForm}评分</h2>
                    <p className="text-xs text-gray-400">
                      共 {objectiveAnswers.length} 题
                      （客观{objectiveAnswers.filter(a => a.questionType !== "text").length} / 主观{objectiveAnswers.filter(a => a.questionType === "text").length}）
                      {evalPoints.length > 0 ? ` · ${evalPoints.length} 个评价点` : ""}
                    </p>
                  </div>
                </div>
                {/* 最终总分 - 教师可直接修改 */}
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">最终总分</span>
                    <Input
                      type="number"
                      min={0}
                      max={submission.maxScore}
                      value={manualTotal !== null ? manualTotal : autoTotal}
                      onChange={(e) => setManualTotal(parseFloat(e.target.value) || 0)}
                      disabled={isGraded}
                      className="w-20 text-right h-10 text-lg font-bold text-blue-600"
                    />
                    <span className="text-lg text-gray-400">/ {submission.maxScore}</span>
                  </div>
                </div>
              </div>
              {/* 分项得分 */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">客观题自动得分</span>
                  <span className="font-medium text-gray-700">{autoObjectiveScore} / {autoObjectiveMax}</span>
                </div>
                <div className="h-3 w-px bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">主观题得分</span>
                  <span className={cn("font-medium", subjectiveQuestionScore > 0 ? "text-gray-700" : "text-amber-600")}>
                    {subjectiveQuestionScore} / {subjectiveQuestionMax}
                  </span>
                  {subjectiveQuestionScore === 0 && !isGraded && (
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">待评分</Badge>
                  )}
                </div>
                {evalPoints.length > 0 && (submission.assessmentForm === "试卷" || submission.assessmentForm === "随堂测") && (
                  <>
                    <div className="h-3 w-px bg-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">综合评价</span>
                      <span className="font-medium text-gray-700">{evalPointTotal} / {evalPointMaxTotal}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* 题目筛选标签 */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    questionFilter === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  onClick={() => setQuestionFilter("all")}
                >
                  全部题目 ({objectiveAnswers.length})
                </button>
                <button
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    questionFilter === "pending" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  onClick={() => setQuestionFilter("pending")}
                >
                  待评分题目 ({objectiveAnswers.filter(a => a.questionType === "text" && a.score === 0).length})
                </button>
              </div>
              {/* 客观题列表 */}
              <div className="space-y-1.5">
                {(questionFilter === "all" ? objectiveAnswers : objectiveAnswers.filter(a => a.questionType === "text" && a.score === 0)).map((answer, idx) => (
                  <ObjectiveGradingCard
                    key={answer.questionId}
                    answer={answer}
                    index={questionFilter === "all" ? idx : objectiveAnswers.indexOf(answer)}
                    isGraded={isGraded}
                    onScoreChange={handleObjectiveScoreChange}
                    aiPreScore={aiPreScore}
                    onAiPreScoreChange={setAiPreScore}
                  />
                ))}
              </div>
              {/* 评价点（仅试卷显示） */}
              {evalPoints.length > 0 && submission.assessmentForm === "试卷" && (
                <div className="space-y-2 pt-2 border-t">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">综合评价点</h3>
                  {evalPoints.map((ep) => (
                    <EvalPointGradingCard
                      key={ep.id}
                      evalPoint={ep}
                      scoreRecord={evalPointScores.find((s) => s.evalPointId === ep.id)}
                      isGraded={isGraded}
                      onChange={handleEvalPointScoreChange}
                      aiInitialReview={aiInitialReviews[ep.id]}
                      onAiInitialReviewChange={handleAiInitialReviewChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 现场评审 - 左右分屏 */}
        {submission.assessmentForm === "现场评审" && (
          <div className="h-full flex">
            {/* 左侧：评审进度 + 历史评价 + 学生材料 */}
            <div className="w-1/2 flex flex-col border-r bg-white">
              <div className="px-4 py-2 border-b flex items-center justify-between shrink-0">
                <h2 className="text-sm font-medium text-gray-700">现场评审材料</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* 评审进度条 */}
                {reviewSteps.length > 0 && (
                  <div className="px-4 py-3 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-medium text-gray-500">评审进度</h3>
                      <span className="text-xs text-gray-400">
                        {(() => {
                          const enabledSteps = reviewSteps.filter(s => s.enabled)
                          const currentIdx = submission.currentReviewPhaseIndex ?? 0
                          if (currentIdx >= enabledSteps.length) {
                            return "全部完成"
                          }
                          return `当前：${enabledSteps[currentIdx]?.label || "—"}`
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {(() => {
                        const enabledSteps = reviewSteps.filter(s => s.enabled)
                        const currentIdx = submission.currentReviewPhaseIndex ?? 0
                        return enabledSteps.map((step, idx) => {
                          const isCompleted = idx < currentIdx
                          const isCurrent = idx === currentIdx
                          const isPending = idx > currentIdx
                          return (
                            <div key={step.id} className="flex items-center flex-1">
                              <div className="flex flex-col items-center flex-1">
                                <div className={cn(
                                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors",
                                  isCompleted ? "bg-green-500 border-green-500 text-white" :
                                  isCurrent ? "bg-indigo-500 border-indigo-500 text-white ring-2 ring-indigo-200" :
                                  "bg-white border-gray-300 text-gray-400"
                                )}>
                                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                                </div>
                                <span className={cn("text-[10px] mt-1", isCompleted || isCurrent ? "text-gray-700 font-medium" : "text-gray-400")}>
                                  {step.label}
                                </span>
                              </div>
                              {idx < enabledSteps.length - 1 && (
                                <div className={cn("h-0.5 flex-1 mx-1", isCompleted ? "bg-green-400" : "bg-gray-200")} />
                              )}
                            </div>
                          )
                        })
                      })()}
                    </div>
                    {/* 当前阶段提示 */}
                    {(() => {
                      const enabledSteps = reviewSteps.filter(s => s.enabled)
                      const currentIdx = submission.currentReviewPhaseIndex ?? 0
                      const currentStep = enabledSteps[currentIdx]
                      if (!currentStep) return null
                      return (
                        <div className="mt-3 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-xs font-medium text-indigo-700">当前阶段：{currentStep.label}</span>
                          </div>
                          <p className="text-[11px] text-indigo-600 mt-0.5 ml-4">{currentStep.desc}</p>
                        </div>
                      )
                    })()}
                  </div>
                )}

                <div className="p-4 space-y-4">
                  {/* 上一阶段评价（可展开） */}
                  {reviewSteps.length > 1 && reviewSteps.filter(s => s.enabled).length > 1 && (
                    <ReviewPhaseHistory evalPoints={evalPoints} />
                  )}

                  {/* 学生提交内容 */}
                  {submission.subjectiveContent?.textAnswer && (
                    <div className="bg-gray-50 rounded-lg border p-3">
                      <h3 className="text-xs font-medium text-gray-500 mb-2">学生提交内容</h3>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {submission.subjectiveContent.textAnswer}
                      </pre>
                    </div>
                  )}
                  {submission.subjectiveContent?.attachments &&
                    submission.subjectiveContent.attachments.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-medium text-gray-500">附件</h3>
                        {submission.subjectiveContent.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm group"
                          >
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700 flex-1 min-w-0 truncate">{att.name}</span>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {att.type === "code" ? "代码" : att.type === "video" ? "视频" : att.type === "document" ? "文档" : att.type === "image" ? "图片" : "其他"}
                            </Badge>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              {["image", "video", "code", "document"].includes(att.type) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => setPreviewAttachment(att)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  预览
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                  const a = document.createElement("a")
                                  a.href = att.url
                                  a.download = att.name
                                  a.click()
                                }}
                              >
                                <Package className="h-3.5 w-3.5 mr-1" />
                                下载
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
            {/* 右侧：评价点评分 */}
            <div className="w-1/2 flex flex-col bg-gray-50">
              <div className="px-4 py-2 bg-white border-b flex items-center justify-between shrink-0">
                <h2 className="text-sm font-medium text-gray-700">评价点评分</h2>
                <div className="text-sm text-gray-500">
                  已评分：<span className="font-medium text-gray-800">{evalPointTotal} / {evalPointMaxTotal}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {evalPoints.length > 0 ? (
                  evalPoints.map((ep) =>(
                    <EvalPointGradingCard
                      key={ep.id}
                      evalPoint={ep}
                      scoreRecord={evalPointScores.find((s) => s.evalPointId === ep.id)}
                      isGraded={isGraded}
                      onChange={handleEvalPointScoreChange}
                      aiInitialReview={aiInitialReviews[ep.id]}
                      onAiInitialReviewChange={handleAiInitialReviewChange}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">该任务未配置评价点</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 成果评价 / 作业 - 左右分屏（无评审流程） */}
        {(submission.assessmentForm === "成果评价" || submission.assessmentForm === "作业") && (
          <div className="h-full flex">
            {/* 左侧：学生材料 */}
            <div className="w-1/2 flex flex-col border-r bg-white">
              <div className="px-4 py-2 border-b flex items-center justify-between shrink-0">
                <h2 className="text-sm font-medium text-gray-700">
                  {submission.assessmentForm === "成果评价" ? "成果材料" : "作业材料"}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 学生提交内容 */}
                {submission.subjectiveContent?.textAnswer && (
                  <div className="bg-gray-50 rounded-lg border p-3">
                    <h3 className="text-xs font-medium text-gray-500 mb-2">学生提交内容</h3>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {submission.subjectiveContent.textAnswer}
                    </pre>
                  </div>
                )}
                {submission.subjectiveContent?.attachments &&
                  submission.subjectiveContent.attachments.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium text-gray-500">附件</h3>
                      {submission.subjectiveContent.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm group"
                        >
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700 flex-1 min-w-0 truncate">{att.name}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {att.type === "code" ? "代码" : att.type === "video" ? "视频" : att.type === "document" ? "文档" : att.type === "image" ? "图片" : "其他"}
                          </Badge>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {["image", "video", "code", "document"].includes(att.type) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setPreviewAttachment(att)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                预览
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                const a = document.createElement("a")
                                a.href = att.url
                                a.download = att.name
                                a.click()
                              }}
                            >
                              <Package className="h-3.5 w-3.5 mr-1" />
                              下载
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
            {/* 右侧：评价点评分 */}
            <div className="w-1/2 flex flex-col bg-gray-50">
              <div className="px-4 py-2 bg-white border-b flex items-center justify-between shrink-0">
                <h2 className="text-sm font-medium text-gray-700">
                  {submission.assessmentForm === "作业" && evalPoints.length === 0 ? "评价标准" : "评价点评分"}
                </h2>
                {(submission.assessmentForm !== "作业" || evalPoints.length > 0) && (
                  <div className="text-sm text-gray-500">
                    <span>已评分：<span className="font-medium text-gray-800">{evalPointTotal} / {evalPointMaxTotal}</span></span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {submission.assessmentForm === "作业" && evalPoints.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">暂无评价标准</h3>
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                      当前作业暂未配置评价标准，无需按评价点逐项评分
                    </p>
                  </div>
                ) : submission.assessmentForm === "作业" && evalPoints.length > 0 ? (
                  <HomeworkEvalPointTable
                    evalPoints={evalPoints}
                    evalPointScores={evalPointScores}
                    isGraded={isGraded}
                    onChange={handleEvalPointScoreChange}
                    aiInitialReviews={aiInitialReviews}
                    onAiInitialReviewChange={handleAiInitialReviewChange}
                  />
                ) : evalPoints.length > 0 ? (
                  evalPoints.map((ep) => (
                    <EvalPointGradingCard
                      key={ep.id}
                      evalPoint={ep}
                      scoreRecord={evalPointScores.find((s) => s.evalPointId === ep.id)}
                      isGraded={isGraded}
                      onChange={handleEvalPointScoreChange}
                      aiInitialReview={aiInitialReviews[ep.id]}
                      onAiInitialReviewChange={handleAiInitialReviewChange}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">该任务未配置评价点</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 现场问答 - 左右分屏 */}
        {submission.assessmentForm === "现场问答" && (
          <div className="h-full flex">
            {/* 左侧：抽出的题目 */}
            <div className="w-1/2 flex flex-col border-r bg-white">
              <div className="px-4 py-2 border-b flex items-center justify-between shrink-0">
                <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  抽题记录
                </h2>
                <span className="text-xs text-gray-400">{drawnQuestions.length} 题</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {drawnQuestions.map((q, idx) => (
                  <DrawnQuestionCard
                    key={q.questionId}
                    question={q}
                    index={idx}
                    isGraded={isGraded}
                    onOralAnswerChange={handleOralAnswerChange}
                  />
                ))}
              </div>
            </div>
            {/* 右侧：评价点评分 */}
            <div className="w-1/2 flex flex-col bg-gray-50">
              <div className="px-4 py-2 bg-white border-b flex items-center justify-between shrink-0">
                <h2 className="text-sm font-medium text-gray-700">评价点评分</h2>
                <div className="text-sm text-gray-500">
                  已评分：<span className="font-medium text-gray-800">{evalPointTotal} / {evalPointMaxTotal}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {evalPoints.length > 0 ? (
                  evalPoints.map((ep) => (
                    <EvalPointGradingCard
                      key={ep.id}
                      evalPoint={ep}
                      scoreRecord={evalPointScores.find((s) => s.evalPointId === ep.id)}
                      isGraded={isGraded}
                      onChange={handleEvalPointScoreChange}
                      aiInitialReview={aiInitialReviews[ep.id]}
                      onAiInitialReviewChange={handleAiInitialReviewChange}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">该任务未配置现场问答评价点</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI 评语面板 */}
      {aiComment && !isGraded && (
        <div className="shrink-0 z-50">
          <AiCommentPanel
            comment={aiComment}
            studentName={student?.name}
            overallScore={finalTotal}
            maxScore={submission.maxScore}
            onAdopt={(comment) => {
              setTeacherComment(comment)
              setAiComment(null)
            }}
            onRegenerateWithTone={(tone) => {
              setAiCommentLoading(true)
              setTimeout(() => {
                const newComment = mockAiComment(student?.name || "学生")
                const toneLabels: Record<string, string> = {
                  encouraging: "\n\n【鼓励型评语】已调整语气，更加侧重肯定学生的努力和进步，增强激励效果。",
                  strict: "\n\n【严格型评语】已调整语气，更加侧重指出问题和改进空间，标准更为严格。",
                  neutral: "\n\n【平和型评语】已调整语气，保持客观中立，平衡肯定与建议。",
                }
                newComment.fullComment = newComment.fullComment + toneLabels[tone]
                setAiComment(newComment)
                setAiCommentLoading(false)
              }, 1200)
            }}
            loading={aiCommentLoading}
          />
        </div>
      )}

      {/* 底部评分汇总栏 - 悬浮固定 */}
      <div className="bg-white border-t shadow-[0_-2px_8px_rgba(0,0,0,0.06)] px-4 py-2.5 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-500">最终得分</span>
            <span className="text-2xl font-bold text-green-600">
              {isGraded || finalTotal > 0 ? finalTotal : "-"}
            </span>
            <span className="text-sm text-gray-400">/ {submission.maxScore}</span>
          </div>
          <div className="h-6 w-px bg-gray-200 shrink-0" />
          <div className="flex-1 min-w-0">
            <Textarea
              placeholder="教师评语..."
              value={teacherComment}
              onChange={(e) => setTeacherComment(e.target.value)}
              disabled={isGraded}
              rows={1}
              className="resize-none text-sm min-h-[36px] py-2"
            />
          </div>
          {!isGraded && (
            <AiGenerateButton
              onClick={() => {
                setAiCommentLoading(true)
                setTimeout(() => {
                  setAiComment(mockAiComment(student?.name || "学生"))
                  setAiCommentLoading(false)
                }, 1200)
              }}
              loading={aiCommentLoading}
              label="AI 生成评语"
              size="sm"
            />
          )}
          {isGraded && submission.gradedAt && (
            <div className="text-xs text-gray-400 shrink-0">
              {submission.gradedAt} · {submission.gradedBy}
            </div>
          )}
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href="/scene/ai-first/approvals/grading">取消</Link>
          </Button>
          {!isGraded && (
            <Button size="sm" onClick={() => setIsSubmitDialogOpen(true)} disabled={!canSubmit} className="shrink-0 gap-1">
              <Save className="h-3.5 w-3.5" />
              提交评分
            </Button>
          )}
          {isGraded && (
            <Button size="sm" disabled className="bg-green-600 hover:bg-green-600 shrink-0 gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              已提交
            </Button>
          )}
        </div>
      </div>

      {/* AI 智能评分预览确认 */}
      <Dialog open={aiScorePreviewOpen} onOpenChange={setAiScorePreviewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI 智能评分结果预览
            </DialogTitle>
            <DialogDescription>
              AI 已生成评分建议，预览后点击确认即可填充到评分表单，取消则保留原内容。
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {aiScorePreview && (
              <>
                <div className="flex items-center gap-4 bg-purple-50 rounded-lg p-3">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-purple-700">{aiScorePreview.projectedTotal}</div>
                    <div className="text-xs text-gray-500">预测总分</div>
                  </div>
                  <div className="w-px h-10 bg-purple-200" />
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-gray-700">{submission.maxScore}</div>
                    <div className="text-xs text-gray-500">满分</div>
                  </div>
                </div>

                {aiScorePreview.objectiveAnswers && aiScorePreview.objectiveAnswers.some(a => a.questionType === "text") && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 border-b">题目得分变化</div>
                    <div className="divide-y divide-gray-100">
                      {aiScorePreview.objectiveAnswers.filter(a => a.questionType === "text").map((a, idx) => {
                        const old = objectiveAnswers.find(o => o.questionId === a.questionId)
                        return (
                          <div key={a.questionId} className="px-3 py-2 flex items-center justify-between text-sm">
                            <span className="text-gray-700 truncate flex-1">{idx + 1}. {a.questionName || "主观题"}</span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400">{old?.score ?? "-"} 分</span>
                              <span className="text-gray-300">→</span>
                              <span className="font-medium text-purple-700">{a.score} 分</span>
                              <span className="text-gray-400">/ {a.maxScore}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {aiScorePreview.evalPointScores && aiScorePreview.evalPointScores.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 border-b">
                      {submission.assessmentForm === "作业" ? "评价点扣分与得分" : "评价点评分"}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {aiScorePreview.evalPointScores.map((record) => {
                        const ep = evalPoints.find((e) => e.id === record.evalPointId)
                        const old = evalPointScores.find((s) => s.evalPointId === record.evalPointId)
                        const deduction = ep ? Math.max(0, ep.maxScore - record.score) : 0
                        return (
                          <div key={record.evalPointId} className="px-3 py-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{record.evalPointName}</span>
                              <div className="flex items-center gap-2 text-xs">
                                {submission.assessmentForm === "作业" && (
                                  <span className="text-amber-600">扣 {deduction.toFixed(1)} 分</span>
                                )}
                                <span className="text-gray-400">{old?.score ?? "-"} →</span>
                                <span className="font-medium text-purple-700">{record.score}</span>
                                <span className="text-gray-400">/ {record.maxScore}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">{record.comment}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 border-b">教师评语</div>
                  <div className="p-3 text-sm text-gray-700 whitespace-pre-line">{aiScorePreview.teacherComment}</div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setAiScorePreviewOpen(false)}>取消</Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={applyAiScorePreview}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              确认应用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 提交确认对话框 */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提交评分</DialogTitle>
            <DialogDescription>
              评分提交后将不可修改，请确认评分结果无误。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">学生</span>
              <span className="font-medium">{student?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">任务</span>
              <span className="font-medium">{submission.taskName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">最终得分</span>
              <span className="text-xl font-bold text-green-600">
                {finalTotal} / {submission.maxScore}
              </span>
            </div>
            {teacherComment && (
              <div className="text-sm">
                <span className="text-gray-500">评语：</span>
                <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">{teacherComment}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              再检查下
            </Button>
            <Button onClick={handleSubmitGrading}>
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 附件预览 */}
      {previewAttachment && (
        <AttachmentPreview
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </div>
  )
}
