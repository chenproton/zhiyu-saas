"use client"

import type { LucideIcon } from "lucide-react"
import { Bell, BookOpen, Briefcase, Calendar, CheckSquare, ChevronRight, Clock, GraduationCap, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SectionCard } from "./section-card"
import { ScheduleGrid } from "./schedule-grid"
import { mockAnnouncements, mockTodos, mockScheduleEvents } from "../_data/mock-student-data"

interface DashboardTabProps {
  onTabChange: (tab: string) => void
}

const typeIconMap: Record<string, LucideIcon> = {
  course: BookOpen,
  scene: Layers,
  exam: GraduationCap,
  report: Briefcase,
}

const typeLabelMap: Record<string, string> = {
  course: "课程",
  scene: "场景",
  exam: "测评",
  report: "报告",
}

export function DashboardTab({ onTabChange }: DashboardTabProps) {
  return (
    <div className="space-y-3">
      {/* 主体：课程表（3/4） + 右侧边栏（1/4） */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <SectionCard>
            <ScheduleGrid events={mockScheduleEvents} />
          </SectionCard>
        </div>

        <div className="space-y-3">
          {/* 今日待办 */}
          <SectionCard
            title="今日待办"
            icon={CheckSquare}
            iconColor="rose"
            action={{ label: "查看全部", onClick: () => onTabChange("learning") }}
          >
            <ScrollArea className="h-[260px]">
              <div className="space-y-2 pr-2">
                {mockTodos.map((item) => {
                  const Icon = typeIconMap[item.type]
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          {item.deadline && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              截止 {item.deadline} · {typeLabelMap[item.type]}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.urgent ? "destructive" : "secondary"}
                          className="text-xs bg-white border-gray-100"
                        >
                          {item.count}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </SectionCard>

          {/* 通知公告 */}
          <SectionCard title="通知公告" icon={Bell} iconColor="blue" action={{ label: "查看全部" }}>
            <ScrollArea className="h-[220px]">
              <div className="space-y-2 pr-2">
                {mockAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <Badge
                      variant={item.type === "重要" ? "destructive" : "secondary"}
                      className="shrink-0 text-xs px-1.5 py-0 h-5 mt-0.5 bg-white border-gray-100"
                    >
                      {item.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    {item.isNew && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
