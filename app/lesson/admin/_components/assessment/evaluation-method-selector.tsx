"use client"

import {
  CheckCircle2,
  ClipboardList,
  Database,
  BookOpen,
  FileQuestion,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface EvalMethodOption {
  key: string
  label: string
  icon: React.ReactNode
  color: string
  available: boolean
  desc: string
}

interface EvaluationMethodSelectorProps {
  selectedKeys: string[]
  onChange: (keys: string[]) => void
  allowedKeys?: string[]
}

const evaluationMethodOptions: EvalMethodOption[] = [
  { key: "paper", label: "试卷", icon: <ClipboardList className="h-5 w-5" />, color: "bg-green-50 text-green-600 border-green-200", available: true, desc: "使用固定试卷进行考核" },
  { key: "question_bank", label: "题库", icon: <Database className="h-5 w-5" />, color: "bg-orange-50 text-orange-600 border-orange-200", available: true, desc: "从题库选题组成测评资源" },
  { key: "exam", label: "作业", icon: <BookOpen className="h-5 w-5" />, color: "bg-blue-50 text-blue-600 border-blue-200", available: true, desc: "组织标准化作业进行考核" },
  { key: "quiz", label: "随堂测", icon: <FileQuestion className="h-5 w-5" />, color: "bg-purple-50 text-purple-600 border-purple-200", available: true, desc: "课堂即时测验" },
]

export function EvaluationMethodSelector({ selectedKeys, onChange, allowedKeys }: EvaluationMethodSelectorProps) {
  const toggleMethod = (key: string) => {
    const opts = evaluationMethodOptions.find((o) => o.key === key)
    if (!opts || !opts.available) return
    const enabled = selectedKeys.includes(key)
    onChange(enabled ? selectedKeys.filter((m) => m !== key) : [...selectedKeys, key])
  }

  const visibleOptions = allowedKeys
    ? evaluationMethodOptions.filter((o) => allowedKeys.includes(o.key))
    : evaluationMethodOptions

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {visibleOptions.map((method) => {
          const enabled = selectedKeys.includes(method.key)
          return (
            <button
              key={method.key}
              onClick={() => toggleMethod(method.key)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all flex flex-col gap-1.5 relative overflow-hidden",
                enabled
                  ? "border-primary bg-white ring-1 ring-primary/20 shadow-sm"
                  : "border-gray-200 hover:border-primary/40 bg-white hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className={cn("p-2 rounded-lg", method.color)}>{method.icon}</div>
                  <div>
                    <p className="text-sm font-semibold">{method.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{method.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {enabled && (
                    <div className="flex items-center gap-1.5 text-primary text-xs font-medium bg-primary/5 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      已选择
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {selectedKeys.length === 0 && (
        <div className="p-12 text-center text-gray-400 border border-dashed rounded-xl">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">请选择至少一种评价方式</p>
        </div>
      )}
    </div>
  )
}
