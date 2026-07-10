"use client"

import { useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Sparkles, Bot, MessageSquare, BookOpen, Target, CheckCircle2, ChevronRight, Lightbulb, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { simulatedTasksMap } from "@/app/scene/approvals/grading/simulation/components/task-data"
import { AiChatPanel } from "@/components/ai/ai-chat-panel"
import { AiGenerateButton } from "@/components/ai/ai-generate-button"
import { mockAiLearningAssistantResponse, mockAiWeakPointDiagnosis, mockAiMaterialCheck } from "@/lib/ai-mock-data"

export default function AiFirstSimulationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const taskId = params.taskId as string
  const task = simulatedTasksMap[taskId]

  const [step, setStep] = useState<"diagnosis" | "learning" | "practice" | "assessment" | "submitted">("diagnosis")
  const [diagnosisDone, setDiagnosisDone] = useState(false)
  const [materialChecked, setMaterialChecked] = useState(false)

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-xl font-medium text-gray-700">任务不存在</h1>
        <Button className="mt-4" asChild>
          <Link href="/student_3.html">返回列表</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student_3.html">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-500" />
              <span className="font-medium text-gray-900">AI 主导学习</span>
            </div>
            <Badge variant="outline" className="text-xs">{task.scenarioName}</Badge>
            <Badge variant="secondary" className="text-xs">{task.name}</Badge>
          </div>
          <div className="flex items-center gap-1">
            {["diagnosis", "learning", "practice", "assessment", "submitted"].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium",
                  step === s ? "bg-purple-600 text-white" : 
                  ["diagnosis", "learning", "practice", "assessment", "submitted"].indexOf(step) > i ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                )}>
                  {["diagnosis", "learning", "practice", "assessment", "submitted"].indexOf(step) > i ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                </div>
                {i < 4 && <div className={cn("w-4 h-px", ["diagnosis", "learning", "practice", "assessment", "submitted"].indexOf(step) > i ? "bg-green-500" : "bg-gray-200")} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {step === "diagnosis" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">AI 学前诊断</h1>
              <p className="text-gray-500">AI 将分析你的知识薄弱点，为你定制个性化学习路径</p>
            </div>

            {!diagnosisDone ? (
              <Card className="max-w-xl mx-auto">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-medium">开始 AI 学前诊断</h2>
                  <p className="text-sm text-gray-500">AI 将基于你的历史学习数据生成能力雷达图和薄弱知识点清单</p>
                  <Button
                    variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                    onClick={() => setDiagnosisDone(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始诊断
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="border-purple-200 bg-purple-50/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-purple-900">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      AI 诊断结果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {mockAiWeakPointDiagnosis().weakPoints.map((wp, i) => (
                        <Card key={i} className="border-0 shadow-none">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium">{wp.name}</span>
                            </div>
                            <div className="space-y-1">
                              {wp.recommendedPath.map((path, j) => (
                                <div key={j} className="flex items-center gap-1 text-xs text-gray-600">
                                  <ChevronRight className="h-3 w-3 text-purple-400" />
                                  {path.name}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-center">
                  <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800" onClick={() => setStep("learning")}>
                    进入个性化学习
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "learning" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">AI 个性化学习</h1>
              <p className="text-gray-500">AI 已根据你的诊断结果定制了学习内容和资源</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    任务说明
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 rounded-lg p-4">
                    {task.detailedDescription}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI 推荐学习路径
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAiWeakPointDiagnosis().weakPoints[0].recommendedPath.map((path, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 text-xs flex items-center justify-center font-medium">{i + 1}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{path.name}</p>
                        <p className="text-xs text-gray-500">{path.type === "lesson" ? "颗粒课" : path.type === "resource" ? "学习资源" : "练习题"}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800" onClick={() => setStep("practice")}>
                完成学习，进入巩固练习
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {step === "practice" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">AI 巩固练习</h1>
              <p className="text-gray-500">针对薄弱知识点的微测，不计入正式成绩</p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  「React 高级 Hooks 原理」巩固练习微测
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { q: "useEffect 的依赖数组为空数组时，副作用函数何时执行？", options: ["每次渲染后", "仅组件挂载时", "仅组件卸载时", "从不执行"], answer: 1 },
                  { q: "以下哪个 Hook 用于缓存计算结果？", options: ["useCallback", "useMemo", "useRef", "useState"], answer: 1 },
                ].map((item, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-gray-800">{i + 1}. {item.q}</p>
                    <div className="space-y-1">
                      {item.options.map((opt, j) => (
                        <button key={j} className="w-full text-left text-sm px-3 py-2 rounded border hover:bg-purple-50 hover:border-purple-200 transition-colors">
                          {String.fromCharCode(65 + j)}. {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800" onClick={() => setStep("assessment")}>
                  提交练习，进入正式测评
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "assessment" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">正式测评</h1>
              <p className="text-gray-500">完成测评后，AI 将预检你的提交材料</p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto" />
                <h2 className="text-lg font-medium">模拟测评内容区域</h2>
                <p className="text-sm text-gray-500">（此处展示试卷/题库/评审等测评形式）</p>
                <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800" onClick={() => setStep("submitted")}>
                  提交测评
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "submitted" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold text-gray-900">测评已提交</h1>
            </div>

            {!materialChecked ? (
              <Card className="max-w-xl mx-auto border-purple-200">
                <CardContent className="p-6 text-center space-y-4">
                  <Sparkles className="h-8 w-8 text-purple-500 mx-auto" />
                  <h2 className="text-lg font-medium">AI 材料预检</h2>
                  <p className="text-sm text-gray-500">让 AI 检查你的提交材料完整度与规范性</p>
                  <Button
                    variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                    onClick={() => setMaterialChecked(true)}
                  >
                    开始 AI 预检
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className={cn("max-w-xl mx-auto", mockAiMaterialCheck().overallStatus === "warning" ? "border-amber-200" : "border-green-200")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI 材料检查结果
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[10px]">
                      完整度 78%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAiMaterialCheck().checks.map((check, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className={cn("mt-0.5", check.status === "pass" ? "text-green-500" : "text-amber-500")}>
                        {check.status === "pass" ? "✓" : "!"}
                      </span>
                      <span className="text-gray-700">{check.message}</span>
                    </div>
                  ))}
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs font-medium text-amber-800 mb-1">优化建议</p>
                    {mockAiMaterialCheck().suggestions.map((s, i) => (
                      <p key={i} className="text-xs text-amber-700">· {s}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* AI Learning Assistant */}
      <AiChatPanel
        title="AI 学习助手"
        quickQuestions={[
          "这个任务要求我做什么？",
          "我该如何准备现场问答？",
          "评审材料需要包含哪些内容？",
          "我的薄弱知识点有哪些？",
        ]}
        onSendMessage={(msg) => mockAiLearningAssistantResponse(msg, { scenarioName: task.scenarioName, taskName: task.name })}
        defaultExpanded={false}
      />
    </div>
  )
}
