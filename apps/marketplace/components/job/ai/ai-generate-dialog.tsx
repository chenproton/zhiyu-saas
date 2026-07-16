"use client"

import { useState } from "react"
import { Sparkles, RotateCcw, Check, X, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AiConfidenceBadge } from "./ai-confidence-badge"
import { cn } from "@/lib/utils"

interface AiGenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  generatedContent: string
  confidence?: "high" | "medium" | "low"
  reasoning?: string
  onRegenerate?: () => void
  onAdopt?: (content: string) => void
  loading?: boolean
}

export function AiGenerateDialog({
  open,
  onOpenChange,
  title = "AI 生成结果",
  description = "AI 已根据您提供的信息生成内容，您可以一键采纳或重新生成",
  generatedContent,
  confidence = "medium",
  reasoning,
  onRegenerate,
  onAdopt,
  loading = false,
}: AiGenerateDialogProps) {
  const [editedContent, setEditedContent] = useState(generatedContent)
  const [isEditing, setIsEditing] = useState(false)

  const displayContent = isEditing ? editedContent : generatedContent

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <DialogTitle>{title}</DialogTitle>
            <AiConfidenceBadge confidence={confidence} />
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-3 py-4">
          {reasoning && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <span className="font-medium">生成依据：</span>{reasoning}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">生成内容</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  if (isEditing) {
                    setEditedContent(generatedContent)
                    setIsEditing(false)
                  } else {
                    setEditedContent(generatedContent)
                    setIsEditing(true)
                  }
                }}
              >
                {isEditing ? "取消编辑" : "编辑"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => navigator.clipboard.writeText(displayContent)}
              >
                <Copy className="h-3 w-3 mr-1" />
                复制
              </Button>
            </div>
          </div>

          {isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="flex-1 min-h-[200px] text-sm leading-relaxed resize-none"
            />
          ) : (
            <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50/50">
              <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                {displayContent}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={loading}
            className="gap-1.5"
          >
            {loading ? (
              <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            重新生成
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-1" />
              放弃
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onAdopt?.(isEditing ? editedContent : generatedContent)
                onOpenChange(false)
              }}
            >
              <Check className="h-4 w-4 mr-1" />
              一键采纳
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
