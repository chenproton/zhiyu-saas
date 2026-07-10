"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockQuestionBank } from "@/lib/mock-data-lesson"
import type { NodeQuiz, QuizQuestion } from "@/lib/types/lesson-source"
import { X, FileText, BookOpen, Check } from "lucide-react"

interface QuizConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (quiz: NodeQuiz) => void
}

const mockPapers = [
  { id: "paper-1", name: "前端基础综合试卷", questionCount: 20, totalScore: 100 },
  { id: "paper-2", name: "React 进阶测试", questionCount: 15, totalScore: 100 },
  { id: "paper-3", name: "API 设计规范测验", questionCount: 10, totalScore: 100 },
]

type Step = "select-type" | "question-bank" | "paper"

export default function QuizConfigModal({
  open,
  onOpenChange,
  onConfirm,
}: QuizConfigModalProps) {
  const [step, setStep] = useState<Step>("select-type")
  const [quizType, setQuizType] = useState<"paper" | "question_bank">("question_bank")
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null)
  const [qbKeyword, setQbKeyword] = useState("")
  const [quizTitle, setQuizTitle] = useState("")
  const [timeLimit, setTimeLimit] = useState(120)

  // Paper settings
  const [allowRetake, setAllowRetake] = useState(false)
  const [shuffleQuestions, setShuffleQuestions] = useState(true)
  const [showScore, setShowScore] = useState(true)

  const filteredQuestions = useMemo(() => {
    if (!qbKeyword.trim()) return mockQuestionBank
    return mockQuestionBank.filter((q) =>
      q.question.toLowerCase().includes(qbKeyword.trim().toLowerCase())
    )
  }, [qbKeyword])

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBack = () => {
    setStep("select-type")
    setSelectedQuestions(new Set())
    setSelectedPaperId(null)
  }

  const handleConfirm = () => {
    if (quizType === "question_bank") {
      const questions: QuizQuestion[] = mockQuestionBank
        .filter((q) => selectedQuestions.has(q.id))
        .map((q) => ({ ...q }))
      if (questions.length === 0) return
      onConfirm({
        id: `quiz-${Date.now()}`,
        title: quizTitle || "随堂测验",
        type: "question_bank",
        questions,
        timeLimit,
      })
    } else {
      if (!selectedPaperId) return
      const paper = mockPapers.find((p) => p.id === selectedPaperId)
      onConfirm({
        id: `quiz-${Date.now()}`,
        title: quizTitle || paper?.name || "试卷测验",
        type: "paper",
        questions: [],
        timeLimit,
      })
    }
    reset()
    onOpenChange(false)
  }

  const reset = () => {
    setStep("select-type")
    setQuizType("question_bank")
    setSelectedQuestions(new Set())
    setSelectedPaperId(null)
    setQbKeyword("")
    setQuizTitle("")
    setTimeLimit(120)
    setAllowRetake(false)
    setShuffleQuestions(true)
    setShowScore(true)
  }

  const selectedList = mockQuestionBank.filter((q) => selectedQuestions.has(q.id))

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === "select-type" && "选择测验方式"}
            {step === "question-bank" && "从题库选题"}
            {step === "paper" && "选择试卷"}
          </DialogTitle>
        </DialogHeader>

        {step === "select-type" && (
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                onClick={() => {
                  setQuizType("paper")
                  setStep("paper")
                }}
              >
                <div className="text-3xl mb-3">📄</div>
                <p className="text-sm font-medium text-gray-800">试卷</p>
                <p className="text-xs text-gray-500 mt-1">创建或导入试卷</p>
              </button>
              <button
                className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                onClick={() => {
                  setQuizType("question_bank")
                  setStep("question-bank")
                }}
              >
                <div className="text-3xl mb-3">📚</div>
                <p className="text-sm font-medium text-gray-800">题库</p>
                <p className="text-xs text-gray-500 mt-1">从题库选题组卷</p>
              </button>
            </div>
          </div>
        )}

        {step === "question-bank" && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">测验标题</Label>
                <Input
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="请输入测验标题"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">作答限时（秒）</Label>
                <Input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-4 flex-1 min-h-0">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="relative mb-3">
                  <Input
                    placeholder="搜索题目名称..."
                    value={qbKeyword}
                    onChange={(e) => setQbKeyword(e.target.value)}
                  />
                </div>
                <div className="flex-1 overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader className="bg-gray-50 sticky top-0">
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>题目名称</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>分值</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((q) => {
                        const checked = selectedQuestions.has(q.id)
                        return (
                          <TableRow
                            key={q.id}
                            className="cursor-pointer"
                            onClick={() => toggleQuestion(q.id)}
                          >
                            <TableCell>
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  checked
                                    ? "bg-blue-600 border-blue-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {checked && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </TableCell>
                            <TableCell>{q.question}</TableCell>
                            <TableCell>
                              <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 rounded">
                                {q.type === "single"
                                  ? "单选"
                                  : q.type === "multiple"
                                  ? "多选"
                                  : q.type === "judge"
                                  ? "判断"
                                  : "简答"}
                              </span>
                            </TableCell>
                            <TableCell>{q.score}分</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="w-72 flex flex-col min-h-0">
                <div className="text-sm font-semibold text-gray-800 mb-2">
                  已选择题目 ({selectedList.length})
                </div>
                <div className="flex-1 overflow-auto space-y-2">
                  {selectedList.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      暂未选择题目
                    </div>
                  )}
                  {selectedList.map((q) => (
                    <div
                      key={q.id}
                      className="bg-blue-50 border border-blue-100 rounded-lg p-3 relative"
                    >
                      <div className="text-sm text-blue-700 font-medium pr-5">
                        {q.question}
                      </div>
                      <div className="flex gap-1.5 text-xs text-blue-500 mt-1">
                        <span className="bg-blue-50/50 px-2 py-0.5 rounded">
                          {q.type === "single"
                            ? "单选"
                            : q.type === "multiple"
                            ? "多选"
                            : q.type === "judge"
                            ? "判断"
                            : "简答"}
                        </span>
                        <span className="bg-blue-50/50 px-2 py-0.5 rounded">
                          {q.score}分
                        </span>
                      </div>
                      <button
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/5 text-gray-500 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                        onClick={() => toggleQuestion(q.id)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "paper" && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="mb-4">
              <Label className="text-xs text-gray-500">测验标题</Label>
              <Input
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="请输入测验标题"
                className="mt-1"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">选择已有试卷</h3>
              <div className="space-y-2 max-h-48 overflow-auto">
                {mockPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition ${
                      selectedPaperId === paper.id
                        ? "border-blue-400 bg-blue-50/40"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedPaperId(paper.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paper"
                        checked={selectedPaperId === paper.id}
                        onChange={() => setSelectedPaperId(paper.id)}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {paper.name}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                            {paper.questionCount} 题
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded">
                            总分 {paper.totalScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">考卷设置</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-500 block mb-1.5">
                    考试时长（分钟）
                  </Label>
                  <Input
                    type="number"
                    value={Math.floor(timeLimit / 60)}
                    onChange={(e) => setTimeLimit(Number(e.target.value) * 60)}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={allowRetake} onCheckedChange={setAllowRetake} />
                    <span className="text-sm text-gray-600">允许重考</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                  <span className="text-sm text-gray-600">题目乱序</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showScore} onCheckedChange={setShowScore} />
                  <span className="text-sm text-gray-600">交卷后显示成绩</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          {step !== "select-type" ? (
            <>
              <Button variant="outline" onClick={handleBack}>
                返回
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={
                  (quizType === "question_bank" && selectedQuestions.size === 0) ||
                  (quizType === "paper" && !selectedPaperId)
                }
              >
                确认选择
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
