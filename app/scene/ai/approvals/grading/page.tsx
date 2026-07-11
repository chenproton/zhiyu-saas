"use client"

import { Construction } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SceneAiGradingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">AI 辅助评分审批</h1>
        <p className="text-sm text-gray-500 mt-1">管理学生场景任务提交的 AI 初评结果与人工复核</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Construction className="h-4 w-4" />
            功能建设中
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-gray-500">
          <p>AI 辅助评分审批功能尚未接入真实后端，敬请期待。</p>
        </CardContent>
      </Card>
    </div>
  )
}
