"use client"

import Link from "next/link"
import {
  ClipboardList,
  FileText,
  Database,
  ClipboardCheck,
  BookOpen,
  MessageCircle,
  FolderCheck,
  UserCheck,
  PlayCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AssessmentItem {
  title: string
  count: number
  type: string
}

const typeConfig: Record<string, {
  icon: React.ElementType
  label: string
  color: string
  bg: string
  borderColor: string
}> = {
  "题库": { icon: Database, label: "题库", color: "text-green-600", bg: "bg-green-50", borderColor: "border-green-200" },
  "试卷": { icon: FileText, label: "试卷", color: "text-blue-600", bg: "bg-blue-50", borderColor: "border-blue-200" },
  "随堂测": { icon: ClipboardCheck, label: "随堂测", color: "text-red-600", bg: "bg-red-50", borderColor: "border-red-200" },
  "作业": { icon: BookOpen, label: "作业", color: "text-pink-600", bg: "bg-pink-50", borderColor: "border-pink-200" },
  "现场问答": { icon: MessageCircle, label: "现场问答", color: "text-amber-600", bg: "bg-amber-50", borderColor: "border-amber-200" },
  "成果评价": { icon: FolderCheck, label: "成果评价", color: "text-cyan-600", bg: "bg-cyan-50", borderColor: "border-cyan-200" },
  "在线评审": { icon: UserCheck, label: "在线评审", color: "text-purple-600", bg: "bg-purple-50", borderColor: "border-purple-200" },
}

function getConfig(type: string) {
  return typeConfig[type] || {
    icon: ClipboardList,
    label: type,
    color: "text-gray-600",
    bg: "bg-gray-50",
    borderColor: "border-gray-200",
  }
}

interface AssessmentCardGroupProps {
  items: AssessmentItem[]
  emptyMessage?: string
  getLink?: (item: AssessmentItem, index: number) => string
  onItemClick?: (item: AssessmentItem, index: number) => void
}

export function AssessmentCardGroup({ items, emptyMessage, getLink, onItemClick }: AssessmentCardGroupProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>{emptyMessage || "暂无测评内容"}</p>
      </div>
    )
  }

  const groups: Record<string, AssessmentItem[]> = {}
  for (const item of items) {
    if (!groups[item.type]) groups[item.type] = []
    groups[item.type].push(item)
  }

  const typeKeys = Object.keys(groups)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {typeKeys.map((type) => {
        const cfg = getConfig(type)
        const Icon = cfg.icon
        const groupItems = groups[type]
        const totalCount = groupItems.reduce((s, i) => s + i.count, 0)

        return (
          <div
            key={type}
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
              <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              <span className="text-sm font-semibold text-gray-800">{cfg.label}</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.borderColor} font-medium`}>
                共 {totalCount} 题
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-2.5">
              {groupItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.count} 道题目</p>
                  </div>
                  {getLink ? (
                    <Link href={getLink(item, idx)}>
                      <Button size="sm" variant="outline" className="shrink-0 ml-2 h-8 text-xs gap-1">
                        <PlayCircle className="w-3 h-3" />
                        进入测评
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 ml-2 h-8 text-xs gap-1"
                      onClick={onItemClick ? () => onItemClick(item, idx) : undefined}
                    >
                      <PlayCircle className="w-3 h-3" />
                      进入测评
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
