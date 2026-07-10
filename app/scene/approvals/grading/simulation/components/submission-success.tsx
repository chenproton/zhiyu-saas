"use client"

import { CheckCircle2, ArrowRight, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface SubmissionSuccessProps {
  taskName: string
  assessmentForm: string
}

export function SubmissionSuccess({ taskName, assessmentForm }: SubmissionSuccessProps) {
  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardContent className="pt-6 pb-6 text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-green-700">任务提交成功</h3>
          <p className="text-sm text-gray-500 mt-1">
            「{taskName}」的{assessmentForm}测评已完成提交
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border text-left space-y-2 max-w-md mx-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">任务名称</span>
            <span className="font-medium">{taskName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">测评形式</span>
            <span>{assessmentForm}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">当前状态</span>
            <span className="text-amber-600">待评分</span>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/scene/ai/approvals/grading">
              返回评分列表
            </Link>
          </Button>
          <Button asChild>
            <Link href="/scene/ai/approvals/grading">
              <ClipboardCheck className="h-4 w-4 mr-1" />
              查看评分列表
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
