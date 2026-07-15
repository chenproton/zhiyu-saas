// @ts-nocheck
"use client"

import { useState, useMemo, useRef } from "react"
import { Search, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useData } from "@/components/providers/data-provider"
import type { Question, QuestionType } from "@/lib/types"
import { QUESTION_TYPE_LABELS } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ManualQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedQuestionIds: string[]
  onAddQuestions: (questions: Question[]) => void
}

export function ManualQuestionDialog({
  open,
  onOpenChange,
  selectedQuestionIds,
  onAddQuestions,
}: ManualQuestionDialogProps) {
  const { questionBanks, getQuestionsByBank } = useData()
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedBankId, setSelectedBankId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<QuestionType | "all">("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 只显示已发布的题库
  const publishedBanks = useMemo(() => {
    return questionBanks.filter(bank => bank.status === 'published')
  }, [questionBanks])

  const questions = useMemo(() => {
    if (!selectedBankId) return []
    return getQuestionsByBank(selectedBankId)
  }, [selectedBankId, getQuestionsByBank])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch = q.content.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === "all" || q.type === typeFilter
      const notAlreadyAdded = !selectedQuestionIds.includes(q.id)
      return matchSearch && matchType && notAlreadyAdded
    })
  }, [questions, search, typeFilter, selectedQuestionIds])

  const handleToggle = (questionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  const handleAddSelected = () => {
    const questionsToAdd = questions.filter(q => selectedIds.has(q.id))
    onAddQuestions(questionsToAdd)
    setSelectedIds(new Set())
    onOpenChange(false)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)))
    }
  }

  const handleClose = () => {
    setSelectedIds(new Set())
    setSearch("")
    setTypeFilter("all")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex h-[80vh] max-w-3xl flex-col p-0" annotationContext="manual-question" annotationContainerRef={scrollRef}>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>手动抽题</DialogTitle>
          <DialogDescription>
            从已发布的题库中选择题目添加到试卷
          </DialogDescription>
        </DialogHeader>

        <div className="border-b px-6 py-4">
          {/* 题库选择 */}
          <div className="mb-3">
            <Select value={selectedBankId} onValueChange={setSelectedBankId}>
              <SelectTrigger>
                <SelectValue placeholder="选择题库" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {publishedBanks.length === 0 ? (
                    <SelectItem value="none" disabled>
                      暂无已发布的题库
                    </SelectItem>
                  ) : (
                    publishedBanks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name} ({bank.questionCount} 题)
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* 搜索和筛选 */}
          {selectedBankId && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索题目..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as QuestionType | "all")}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">全部类型</SelectItem>
                    {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {QUESTION_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* 题目列表 */}
        {selectedBankId ? (
          <>
            <div className="flex items-center justify-between border-b px-6 py-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={filteredQuestions.length > 0 && selectedIds.size === filteredQuestions.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  已选 {selectedIds.size} 题 / 共 {filteredQuestions.length} 题
                </span>
              </div>
              <Button
                size="sm"
                disabled={selectedIds.size === 0}
                onClick={handleAddSelected}
              >
                <Plus />
                添加选中 ({selectedIds.size})
              </Button>
            </div>
            <ScrollArea className="flex-1 overflow-hidden">
              <div ref={scrollRef} className="flex flex-col gap-1 p-4">
                {filteredQuestions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {questions.length === 0 ? "该题库暂无题目" : "没有找到匹配的题目"}
                  </p>
                ) : (
                  filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-muted/50",
                        selectedIds.has(question.id) && "border-primary bg-primary/5"
                      )}
                      onClick={() => handleToggle(question.id)}
                    >
                      <Checkbox
                        checked={selectedIds.has(question.id)}
                        onCheckedChange={() => handleToggle(question.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">{question.content}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {QUESTION_TYPE_LABELS[question.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {question.score} 分
                          </span>
                        </div>
                      </div>
                      {selectedIds.has(question.id) && (
                        <Check className="size-4 text-primary shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            请先选择一个题库
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
