"use client"

import { useState, useEffect } from "react"
import { Sparkles, Check, X, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AiConfidenceBadge } from "./ai-confidence-badge"
import { cn } from "@/lib/utils"
import type { AiSubjectivePreScore, AiInitialReview } from "@/lib/types/ai"

interface AiPreScorePanelProps {
  preScore?: AiSubjectivePreScore
  initialReview?: AiInitialReview
  onAdopt?: (score: number) => void
  onDismiss?: () => void
  className?: string
}

export function AiPreScorePanel({ preScore, initialReview, onAdopt, onDismiss, className }: AiPreScorePanelProps) {
  const [expanded, setExpanded] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(false)
  }, [preScore?.suggestedScore, initialReview?.suggestedScore])

  if (dismissed) return null

  const isPreScore = !!preScore
  const data = preScore || initialReview
  if (!data) return null

  const score = isPreScore ? (preScore?.suggestedScore || 0) : (initialReview?.suggestedScore || 0)
  const maxScore = isPreScore ? (preScore?.maxScore || 100) : (initialReview?.maxScore || 100)
  const confidence = isPreScore ? preScore?.confidence : initialReview?.confidence

  return (
    <Card className={cn("border-purple-200 bg-purple-50/30 animate-in fade-in slide-in-from-bottom-2 duration-300", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm font-medium text-purple-900">
              {isPreScore ? "AI 预评分建议" : "AI 初评建议"}
            </CardTitle>
            {confidence && <AiConfidenceBadge confidence={confidence} className="text-xs px-2 py-0.5 h-5" />}
            {confidence === "low" && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                建议教师重点关注
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3">
          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-purple-700">{score}</div>
            <div className="text-sm text-gray-500">/ {maxScore} 分</div>
            {!isPreScore && initialReview?.suggestedGrade && (
              <div className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-700 text-sm font-medium">
                {initialReview.suggestedGrade} 档
              </div>
            )}
          </div>

          {/* Reasoning */}
          {preScore?.reasoning && (
            <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border">
              <span className="font-medium">评分理由：</span>{preScore.reasoning}
            </div>
          )}

          {/* Hit points */}
          {preScore?.hitPoints && preScore.hitPoints.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-green-700">命中要点</span>
              {preScore.hitPoints.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                  <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          )}

          {/* Missed points */}
          {preScore?.missedPoints && preScore.missedPoints.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-amber-700">遗漏项</span>
              {preScore.missedPoints.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                  <X className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          )}

          {/* Basis & Doubts for initial review */}
          {!isPreScore && initialReview?.basis && initialReview.basis.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-green-700">判定依据</span>
              {initialReview.basis.map((b, i) => (
                <div key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                  <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          )}
          {!isPreScore && initialReview?.doubts && initialReview.doubts.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-amber-700">存疑之处</span>
              {initialReview.doubts.map((d, i) => (
                <div key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          )}

          {/* Highlights */}
          {preScore?.highlights && preScore.highlights.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-blue-700">扩展亮点</span>
              {preScore.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                  <span className="text-blue-500 mt-0.5 shrink-0">★</span>
                  {h}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                onAdopt?.(score)
                setDismissed(true)
              }}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              采纳建议
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDismiss?.()
                setDismissed(true)
              }}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              忽略
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
