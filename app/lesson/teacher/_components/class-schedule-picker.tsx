"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Clock, MapPin, CalendarDays, BookOpen, Layers, MonitorPlay } from "lucide-react"

export type ScheduleType = "course" | "scene" | "hybrid"

export interface ScheduleItem {
  id: string
  name: string
  time: string
  location: string
  type: ScheduleType
}

interface DaySchedule {
  day: string
  date: string
  courses: ScheduleItem[]
}

interface ClassOption {
  id: string
  name: string
  course: string
}

const CLASS_OPTIONS: ClassOption[] = [
  { id: "cls-1", name: "软件工程2026级1班", course: "Web前端开发混合课程" },
  { id: "cls-2", name: "软件工程2026级2班", course: "软件测试技术混合课程" },
  { id: "cls-3", name: "人工智能2026级1班", course: "机器学习混合课程" },
]

const WEEK_SCHEDULE: Record<string, DaySchedule[]> = {
  "cls-1": [
    {
      day: "周一",
      date: "10/16",
      courses: [
        { id: "c1-1", name: "Web前端开发混合课程", time: "08:00-09:40", location: "教学楼 A-201", type: "hybrid" },
        { id: "c1-2", name: "HTML5 新特性", time: "14:00-15:40", location: "机房 C-303", type: "course" },
      ],
    },
    {
      day: "周二",
      date: "10/17",
      courses: [
        { id: "c1-3", name: "CSS 布局实战", time: "10:00-11:40", location: "机房 C-303", type: "course" },
      ],
    },
    {
      day: "周三",
      date: "10/18",
      courses: [
        { id: "c1-4", name: "响应式页面设计", time: "08:00-09:40", location: "教学楼 A-201", type: "course" },
        { id: "c1-5", name: "前端组件库实训", time: "14:00-15:40", location: "实训楼 B-205", type: "scene" },
      ],
    },
    {
      day: "周四",
      date: "10/19",
      courses: [
        { id: "c1-6", name: "JavaScript 基础", time: "10:00-11:40", location: "机房 C-303", type: "course" },
      ],
    },
    {
      day: "周五",
      date: "10/20",
      courses: [
        { id: "c1-7", name: "Vue 项目实战", time: "14:00-15:40", location: "实训楼 B-205", type: "scene" },
      ],
    },
  ],
  "cls-2": [
    {
      day: "周一",
      date: "10/16",
      courses: [
        { id: "c2-1", name: "软件测试技术混合课程", time: "10:00-11:40", location: "教学楼 A-302", type: "hybrid" },
      ],
    },
    {
      day: "周二",
      date: "10/17",
      courses: [
        { id: "c2-2", name: "黑盒测试方法", time: "08:00-09:40", location: "机房 D-305", type: "course" },
        { id: "c2-3", name: "自动化测试脚本", time: "14:00-15:40", location: "机房 D-305", type: "course" },
      ],
    },
    {
      day: "周三",
      date: "10/18",
      courses: [
        { id: "c2-4", name: "性能测试实践", time: "10:00-11:40", location: "实训楼 C-102", type: "scene" },
      ],
    },
    {
      day: "周四",
      date: "10/19",
      courses: [
        { id: "c2-5", name: "缺陷管理流程", time: "08:00-09:40", location: "教学楼 A-302", type: "course" },
      ],
    },
    {
      day: "周五",
      date: "10/20",
      courses: [
        { id: "c2-6", name: "测试用例设计", time: "14:00-15:40", location: "机房 D-305", type: "course" },
      ],
    },
  ],
  "cls-3": [
    {
      day: "周一",
      date: "10/16",
      courses: [
        { id: "c3-1", name: "机器学习混合课程", time: "14:00-15:40", location: "机房 D-305", type: "hybrid" },
      ],
    },
    {
      day: "周二",
      date: "10/17",
      courses: [
        { id: "c3-2", name: "监督学习算法", time: "10:00-11:40", location: "机房 D-305", type: "course" },
      ],
    },
    {
      day: "周三",
      date: "10/18",
      courses: [
        { id: "c3-3", name: "神经网络基础", time: "08:00-09:40", location: "教学楼 A-201", type: "course" },
        { id: "c3-4", name: "模型训练实训", time: "14:00-15:40", location: "实训楼 C-102", type: "scene" },
      ],
    },
    {
      day: "周四",
      date: "10/19",
      courses: [
        { id: "c3-5", name: "数据预处理", time: "10:00-11:40", location: "机房 D-305", type: "course" },
      ],
    },
    {
      day: "周五",
      date: "10/20",
      courses: [
        { id: "c3-6", name: "模型评估与调优", time: "08:00-09:40", location: "机房 D-305", type: "course" },
      ],
    },
  ],
}

const TYPE_CONFIG: Record<
  ScheduleType,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  course: {
    label: "课程",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <BookOpen className="h-3 w-3" />,
  },
  scene: {
    label: "实践",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: <Layers className="h-3 w-3" />,
  },
  hybrid: {
    label: "混合",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    icon: <MonitorPlay className="h-3 w-3" />,
  },
}

export interface ClassSchedulePickerProps {
  onSelect?: (item: ScheduleItem | null) => void
}

function getFirstCourseId(schedule: DaySchedule[]) {
  return schedule.flatMap((d) => d.courses)[0]?.id || null
}

export function ClassSchedulePicker({ onSelect }: ClassSchedulePickerProps) {
  const [classId, setClassId] = useState(CLASS_OPTIONS[0].id)
  const [weekOffset, setWeekOffset] = useState(0)
  const schedule = useMemo(() => WEEK_SCHEDULE[classId] || WEEK_SCHEDULE["cls-1"], [classId])
  const [selectedId, setSelectedId] = useState<string | null>(() => getFirstCourseId(WEEK_SCHEDULE[CLASS_OPTIONS[0].id] || WEEK_SCHEDULE["cls-1"]))

  const currentClass = CLASS_OPTIONS.find((c) => c.id === classId) || CLASS_OPTIONS[0]

  const selectedItem = useMemo(() => {
    if (!selectedId) return null
    return schedule.flatMap((d) => d.courses).find((c) => c.id === selectedId) || null
  }, [selectedId, schedule])

  const handleSelect = (item: ScheduleItem) => {
    setSelectedId(item.id)
    onSelect?.(item)
  }

  // 组件首次挂载时触发一次默认选中的回调
  const didMountRef = useRef(false)
  useEffect(() => {
    if (didMountRef.current) return
    didMountRef.current = true
    const first = schedule.flatMap((d) => d.courses)[0] || null
    if (first) onSelect?.(first)
  }, [schedule, onSelect])

  const weekLabel = useMemo(() => {
    const base = new Date(2026, 9, 13)
    const start = new Date(base.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000)
    const end = new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000)
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
  }, [weekOffset])

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">课时选择</CardTitle>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              选择课时后再配置本页内容
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={classId} onValueChange={(v) => {
              setClassId(v)
              const newSchedule = WEEK_SCHEDULE[v] || WEEK_SCHEDULE["cls-1"]
              const firstId = getFirstCourseId(newSchedule)
              setSelectedId(firstId)
              if (firstId) {
                const first = newSchedule.flatMap((d) => d.courses).find((c) => c.id === firstId) || null
                onSelect?.(first)
              } else {
                onSelect?.(null)
              }
            }}>
              <SelectTrigger className="h-8 w-[220px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASS_OPTIONS.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 rounded-md border bg-background p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setWeekOffset((w) => w - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center text-xs font-medium">{weekLabel}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setWeekOffset((w) => w + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="overflow-x-auto pb-1 -mx-2 px-2">
          <div className="flex gap-3 min-w-[720px]">
            {schedule.map((day) => (
              <div key={day.day} className="flex-1 min-w-[130px] space-y-2">
                <div className="text-center text-xs font-medium text-muted-foreground pb-1 border-b">
                  <div>{day.day}</div>
                  <div className="text-[10px]">{day.date}</div>
                </div>
                {day.courses.length === 0 ? (
                  <div className="h-20 rounded-lg border border-dashed bg-muted/30 flex items-center justify-center text-[10px] text-muted-foreground">
                    无课时
                  </div>
                ) : (
                  day.courses.map((course) => {
                    const cfg = TYPE_CONFIG[course.type]
                    const isSelected = selectedId === course.id
                    return (
                      <button
                        key={course.id}
                        onClick={() => handleSelect(course)}
                        className={`w-full text-left rounded-lg border p-2.5 transition-all ${
                          isSelected
                            ? `ring-2 ring-offset-1 ring-primary ${cfg.border} ${cfg.bg}`
                            : "border-border bg-card hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-xs font-medium line-clamp-2 leading-snug">{course.name}</span>
                          <Badge variant="outline" className={`text-[10px] h-4 px-1 shrink-0 ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                            <span className="mr-0.5">{cfg.icon}</span>
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="space-y-0.5 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {course.location}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedItem ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
            <span className="text-muted-foreground">当前选中：</span>
            <span className="font-medium">{currentClass.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-medium">{selectedItem.name}</span>
            <span className="text-muted-foreground">·</span>
            <span>{selectedItem.time}</span>
            <span className="text-muted-foreground">·</span>
            <span>{selectedItem.location}</span>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
            请从上方课表中选择一个课时，以继续配置本页内容。
          </div>
        )}
      </CardContent>
    </Card>
  )
}
