"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, FileText, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { evaluationResultApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { SceneEvaluationResult } from "@/lib/types"

function formatDateTime(value: string | Date | undefined): string {
  if (!value) return "-"
  const d = typeof value === "string" ? new Date(value) : value
  if (isNaN(d.getTime())) return "-"
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function JsonBlock({ title, data }: { title: string; data: Record<string, any> }) {
  const keys = Object.keys(data || {})
  if (keys.length === 0) return null
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <pre className="text-xs bg-muted rounded-lg p-3 overflow-auto max-h-[300px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export default function SceneResultDetailPage() {
  const params = useParams()
  const resultId = params.id as string

  const [result, setResult] = useState<SceneEvaluationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [score, setScore] = useState<string>("")
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await evaluationResultApi.get(resultId)
        setResult(data)
        setScore(data.totalScore !== undefined ? String(data.totalScore) : "")
        setComment(data.comment || "")
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "加载测评结果失败")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resultId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!result) return

    const scoreNum = Number(score)
    if (Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > result.maxScore) {
      setSaveError(`请输入 0 ~ ${result.maxScore} 之间的有效分数`)
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const updated = await evaluationResultApi.grade(result.id, {
        totalScore: scoreNum,
        comment: comment.trim() || undefined,
      })
      setResult(updated)
      setScore(updated.totalScore !== undefined ? String(updated.totalScore) : "")
      setComment(updated.comment || "")
      setSaveSuccess(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "提交评分失败")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center text-muted-foreground">
        加载中...
      </div>
    )
  }

  if (loadError || !result) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>{loadError || "未找到测评结果"}</AlertDescription>
        </Alert>
        <Button className="mt-4" asChild>
          <Link href="/evaluation/scene-results">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/evaluation/scene-results">
            <ArrowLeft className="mr-1 h-4 w-4" />
            返回列表
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">测评结果评分</h1>
        <Badge
          variant="outline"
          className={cn(
            result.status === "evaluated"
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-amber-50 text-amber-600 border-amber-200"
          )}
        >
          {result.status === "evaluated" ? "已评分" : "待评分"}
        </Badge>
      </div>

      {saveSuccess && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>评分已保存</AlertTitle>
          <AlertDescription>测评结果已成功更新。</AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive">
          <AlertTitle>保存失败</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">被评人 ID</span>
              <span className="font-medium">{result.evaluateeId}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">任务 ID</span>
              <span className="font-medium">{result.taskId}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">场景 ID</span>
              <span className="font-medium">{result.sceneId || "-"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">测评方式</span>
              <span className="font-medium">{result.methodKey}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">满分</span>
              <span className="font-medium">{result.maxScore}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">评分人</span>
              <span className="font-medium">{result.gradedBy || result.evaluatorId || "-"}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">评分时间</span>
              <span className="font-medium">{formatDateTime(result.gradedAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">评分</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="score">
                  总分 <span className="text-muted-foreground">(0 - {result.maxScore})</span>
                </Label>
                <Input
                  id="score"
                  type="number"
                  min={0}
                  max={result.maxScore}
                  step={0.5}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="请输入分数"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">评语</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="请输入评语（可选）"
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "保存中..." : "保存评分"}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
                {result.status === "evaluated" && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    已评分
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">测评详情（只读）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <JsonBlock title="评价点评分 (evalPointScores)" data={result.evalPointScores} />
          <JsonBlock title="客观题答案 (objectiveAnswers)" data={result.objectiveAnswers} />
          <JsonBlock title="主观题内容 (subjectiveContent)" data={result.subjectiveContent} />
          <JsonBlock title="抽题记录 (drawnQuestions)" data={result.drawnQuestions} />
          {Object.keys(result.evalPointScores || {}).length === 0 &&
            Object.keys(result.objectiveAnswers || {}).length === 0 &&
            Object.keys(result.subjectiveContent || {}).length === 0 &&
            Object.keys(result.drawnQuestions || {}).length === 0 && (
              <p className="text-sm text-muted-foreground">暂无详细测评数据。</p>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
