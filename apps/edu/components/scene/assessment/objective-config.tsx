"use client"

import { CheckCircle, Circle, CircleDot, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ObjectiveConfig, QuestionItem } from "@/lib/types/scene-mock"

interface ObjectiveConfigEditorProps {
  config: ObjectiveConfig
  onChange?: (config: ObjectiveConfig) => void
}

const questionTypeConfig = {
  single: { icon: CircleDot, label: "单选题", color: "bg-blue-50 text-blue-600" },
  multiple: { icon: CheckCircle, label: "多选题", color: "bg-purple-50 text-purple-600" },
  judgment: { icon: Circle, label: "判断题", color: "bg-green-50 text-green-600" },
}

export function ObjectiveConfigEditor({ config, onChange }: ObjectiveConfigEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState<Partial<QuestionItem>>({
    type: "single",
    content: "",
    options: ["", "", "", ""],
    answer: "",
    score: 10,
  })

  const totalScore = config.questions.reduce((sum, q) => sum + q.score, 0)

  const handleAddQuestion = () => {
    if (!newQuestion.content || !newQuestion.answer) return

    const question: QuestionItem = {
      id: `q-${Date.now()}`,
      type: newQuestion.type as QuestionItem["type"],
      content: newQuestion.content,
      options: newQuestion.type !== "judgment" ? newQuestion.options?.filter(Boolean) : undefined,
      answer: newQuestion.answer,
      score: newQuestion.score || 10,
    }

    onChange?.({
      ...config,
      questions: [...config.questions, question],
      totalScore: config.totalScore + question.score,
    })

    setNewQuestion({
      type: "single",
      content: "",
      options: ["", "", "", ""],
      answer: "",
      score: 10,
    })
    setIsDialogOpen(false)
  }

  const handleDeleteQuestion = (questionId: string) => {
    const question = config.questions.find((q) => q.id === questionId)
    onChange?.({
      ...config,
      questions: config.questions.filter((q) => q.id !== questionId),
      totalScore: config.totalScore - (question?.score || 0),
    })
  }

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-gray-500">题目数量</p>
            <p className="text-xl font-semibold text-gray-800">{config.questions.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">总分值</p>
            <p className="text-xl font-semibold text-primary">{totalScore} 分</p>
          </div>
        </div>
      </div>

      {/* Question list */}
      {config.questions.length > 0 ? (
        <div className="space-y-3">
          {config.questions.map((question, index) => {
            const typeConfig = questionTypeConfig[question.type]
            const Icon = typeConfig.icon

            return (
              <div
                key={question.id}
                className="p-4 rounded-lg border border-gray-100 bg-white group hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-sm font-medium text-gray-600 shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={typeConfig.color}>
                        <Icon className="mr-1 h-3 w-3" />
                        {typeConfig.label}
                      </Badge>
                      <span className="text-sm text-gray-500">{question.score} 分</span>
                    </div>
                    <p className="text-gray-700 mb-2">{question.content}</p>
                    {question.options && (
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                        {question.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="text-gray-400">{String.fromCharCode(65 + i)}.</span>
                            <span className={question.answer === opt || (Array.isArray(question.answer) && question.answer.includes(opt)) ? "text-green-600 font-medium" : ""}>
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === "judgment" && (
                      <p className="text-sm">
                        答案：<span className="text-green-600 font-medium">{question.answer === "true" ? "正确" : "错误"}</span>
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500 shrink-0"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
          <CheckCircle className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">暂无题目，点击下方按钮添加</p>
        </div>
      )}

      {/* Add question dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            添加题目
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>添加题目</DialogTitle>
            <DialogDescription>
              创建客观测评题目
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>题型</Label>
                <Select
                  value={newQuestion.type}
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value as QuestionItem["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">单选题</SelectItem>
                    <SelectItem value="multiple">多选题</SelectItem>
                    <SelectItem value="judgment">判断题</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>分值</Label>
                <Input
                  type="number"
                  value={newQuestion.score}
                  onChange={(e) => setNewQuestion({ ...newQuestion, score: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>题目内容</Label>
              <Textarea
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                placeholder="请输入题目内容..."
                rows={2}
              />
            </div>
            {newQuestion.type !== "judgment" && (
              <div className="grid gap-2">
                <Label>选项</Label>
                <div className="space-y-2">
                  {newQuestion.options?.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 text-sm text-gray-500">{String.fromCharCode(65 + i)}.</span>
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...(newQuestion.options || [])]
                          newOptions[i] = e.target.value
                          setNewQuestion({ ...newQuestion, options: newOptions })
                        }}
                        placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label>正确答案</Label>
              {newQuestion.type === "judgment" ? (
                <Select
                  value={newQuestion.answer as string}
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, answer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择答案" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">正确</SelectItem>
                    <SelectItem value="false">错误</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={newQuestion.answer as string}
                  onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                  placeholder={newQuestion.type === "multiple" ? "多个答案用逗号分隔" : "输入正确选项内容"}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddQuestion} disabled={!newQuestion.content || !newQuestion.answer}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
