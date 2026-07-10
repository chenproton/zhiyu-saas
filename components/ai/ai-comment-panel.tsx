"use client"

import { useState } from "react"
import { Sparkles, Check, RotateCcw, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { AiGeneratedComment } from "@/lib/ai-mock-data"

interface AiCommentPanelProps {
  comment: AiGeneratedComment
  studentName?: string
  overallScore?: number
  maxScore?: number
  onAdopt?: (comment: string) => void
  onRegenerate?: () => void
  onRegenerateWithTone?: (tone: "encouraging" | "strict" | "neutral") => void
  loading?: boolean
  className?: string
}

export function AiCommentPanel({ comment, studentName, overallScore, maxScore, onAdopt, onRegenerate, onRegenerateWithTone, loading = false, className }: AiCommentPanelProps) {
  const [editedComment, setEditedComment] = useState(comment.fullComment)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTone, setSelectedTone] = useState<"encouraging" | "strict" | "neutral">("neutral")

  return (
    <Card className={cn("border-purple-200 bg-purple-50/30", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm font-medium text-purple-900">AI 评语建议</CardTitle>
            {(studentName || overallScore !== undefined) && (
              <span className="text-xs text-gray-500">
                {studentName && `针对 ${studentName}`}
                {overallScore !== undefined && maxScore !== undefined && ` · 总分 ${overallScore}/${maxScore}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "完成编辑" : "编辑"}
            </Button>
            {!onRegenerateWithTone && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onRegenerate} disabled={loading}>
                <RotateCcw className="h-3 w-3 mr-1" />
                重新生成
              </Button>
            )}
          </div>
        </div>
        {onRegenerateWithTone && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[11px] text-gray-500">重新生成语气：</span>
            {(["neutral", "encouraging", "strict"] as const).map((tone) => (
              <Button
                key={tone}
                variant={selectedTone === tone ? "secondary" : "ghost"}
                size="sm"
                className="h-6 text-[11px] px-2"
                onClick={() => {
                  setSelectedTone(tone)
                  onRegenerateWithTone(tone)
                }}
                disabled={loading}
              >
                {tone === "neutral" && "平和型"}
                {tone === "encouraging" && "鼓励型"}
                {tone === "strict" && "严格型"}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Highlights & Improvements */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <span className="text-xs font-medium text-green-700">亮点</span>
            <ul className="mt-1 space-y-1">
              {comment.highlights.map((h, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <span className="text-xs font-medium text-amber-700">改进建议</span>
            <ul className="mt-1 space-y-1">
              {comment.improvements.map((imp, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                  <span className="text-amber-500 mt-0.5">→</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Comment text */}
        {isEditing ? (
          <Textarea
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            className="text-sm leading-relaxed min-h-[120px]"
          />
        ) : (
          <div className="bg-white rounded-lg p-3 border text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {editedComment}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigator.clipboard.writeText(editedComment)}>
            <Copy className="h-3 w-3 mr-1" />
            复制评语
          </Button>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => onAdopt?.(editedComment)}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            采纳评语
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
