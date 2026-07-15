"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CheckCircle2, Send, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { CourseClassSelector } from "../_components/course-class-selector"

const initialItems = [
  { id: "g1", name: "Web前端开发混合课程", className: "软件工程2026级1班", status: "pending", count: 42 },
  { id: "g2", name: "软件测试技术混合课程", className: "软件工程2026级2班", status: "confirmed", count: 40 },
]

export default function GradeSubmitPage() {
  const [items, setItems] = useState(initialItems)

  const handleSubmit = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: "confirmed" } : item))
    const item = items.find((i) => i.id === id)
    toast.success(`${item?.name} 成绩已提交至教务平台`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">成绩确认与提交</h1>
        <p className="text-muted-foreground mt-1">教师确认线上成绩后，提交至教务平台</p>
      </div>

      <CourseClassSelector onSelect={() => {}} showSession={false} />

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">提交前请确认</p>
            <p className="mt-1">成绩提交后将同步至教务服务平台，提交后如需修改需走成绩变更流程。</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">成绩提交状态</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.className} · {item.count}人</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={item.status === "confirmed" ? "default" : "outline"}>
                  {item.status === "confirmed" ? "已提交" : "待提交"}
                </Badge>
                {item.status === "confirmed" ? (
                  <Button size="sm" disabled>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> 已提交
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-1" /> 提交成绩
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认提交成绩？</AlertDialogTitle>
                        <AlertDialogDescription>
                          提交后 {item.name} 的线上成绩将同步至教务平台，请确认成绩无误。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleSubmit(item.id)}>确认提交</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
