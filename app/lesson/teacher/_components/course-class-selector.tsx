"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const semesters = [
  "2025 年第一学期",
  "2025 年第二学期",
  "2026 年第一学期",
]

const courses = [
  { id: "cls-1", name: "软件工程2026级1班", course: "Web前端开发混合课程", term: "2025 年第一学期" },
  { id: "cls-2", name: "软件工程2026级2班", course: "软件测试技术混合课程", term: "2025 年第一学期" },
  { id: "cls-3", name: "人工智能2026级1班", course: "机器学习混合课程", term: "2025 年第一学期" },
  { id: "cls-4", name: "大数据技术2026级1班", course: "数据分析与可视化混合课程", term: "2025 年第二学期" },
  { id: "cls-5", name: "云计算2026级1班", course: "云原生应用开发混合课程", term: "2025 年第二学期" },
  { id: "cls-6", name: "物联网2026级1班", course: "嵌入式系统开发混合课程", term: "2026 年第一学期" },
]

const sessions = [
  { id: "s-1-1", classId: "cls-1", week: 1, weekday: "周一", period: "上午 1-2 节", venue: "教学楼 A-101" },
  { id: "s-1-2", classId: "cls-1", week: 2, weekday: "周三", period: "上午 1-2 节", venue: "教学楼 A-101" },
  { id: "s-1-3", classId: "cls-1", week: 4, weekday: "周五", period: "下午 5-6 节", venue: "实训楼 B-202" },
  { id: "s-1-4", classId: "cls-1", week: 6, weekday: "周一", period: "上午 3-4 节", venue: "教学楼 A-101" },
  { id: "s-1-5", classId: "cls-1", week: 8, weekday: "周三", period: "下午 5-6 节", venue: "实训楼 B-202" },
  { id: "s-2-1", classId: "cls-2", week: 1, weekday: "周二", period: "上午 1-2 节", venue: "教学楼 A-102" },
  { id: "s-2-2", classId: "cls-2", week: 3, weekday: "周四", period: "上午 3-4 节", venue: "实训楼 B-203" },
  { id: "s-2-3", classId: "cls-2", week: 5, weekday: "周二", period: "上午 1-2 节", venue: "教学楼 A-102" },
  { id: "s-3-1", classId: "cls-3", week: 2, weekday: "周一", period: "上午 3-4 节", venue: "教学楼 C-301" },
  { id: "s-3-2", classId: "cls-3", week: 4, weekday: "周四", period: "下午 7-8 节", venue: "实训楼 D-401" },
  { id: "s-4-1", classId: "cls-4", week: 3, weekday: "周三", period: "上午 1-2 节", venue: "教学楼 B-201" },
  { id: "s-4-2", classId: "cls-4", week: 6, weekday: "周五", period: "上午 3-4 节", venue: "实训楼 C-102" },
  { id: "s-5-1", classId: "cls-5", week: 1, weekday: "周二", period: "下午 5-6 节", venue: "教学楼 A-301" },
  { id: "s-5-2", classId: "cls-5", week: 3, weekday: "周四", period: "上午 1-2 节", venue: "实训楼 B-202" },
  { id: "s-6-1", classId: "cls-6", week: 2, weekday: "周三", period: "上午 3-4 节", venue: "教学楼 C-201" },
]

const weekdayOrder = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

export interface CourseClassSelection {
  semester: string
  courseId: string
  courseName: string
  className: string
  sessionId?: string
  sessionLabel?: string
}

interface CourseClassSelectorProps {
  onSelect: (selection: CourseClassSelection) => void
  showSession?: boolean
}

export function CourseClassSelector({ onSelect, showSession = true }: CourseClassSelectorProps) {
  const [semester, setSemester] = useState(semesters[0])
  const [courseId, setCourseId] = useState<string>("")
  const [sessionId, setSessionId] = useState<string>("")
  const [initialized, setInitialized] = useState(false)

  const filteredCourses = courses.filter((c) => c.term === semester)
  const filteredSessions = sessions
    .filter((s) => s.classId === courseId)
    .sort((a, b) => a.week - b.week || weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday))

  const emitSelection = (sem: string, cid: string, sid?: string) => {
    const course = courses.find((c) => c.id === cid)
    const session = sid ? sessions.find((s) => s.id === sid) : undefined
    if (course) {
      onSelect({
        semester: sem,
        courseId: cid,
        courseName: course.course,
        className: course.name,
        sessionId: sid || undefined,
        sessionLabel: session ? `第${session.week}周 ${session.weekday} ${session.period}` : undefined,
      })
    }
  }

  // 默认选中第一个课程和第一个课时节次
  useEffect(() => {
    if (initialized) return
    const firstCourse = filteredCourses[0]
    if (firstCourse) {
      setCourseId(firstCourse.id)
      const firstSession = sessions
        .filter((s) => s.classId === firstCourse.id)
        .sort((a, b) => a.week - b.week || weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday))[0]
      if (firstSession) {
        setSessionId(firstSession.id)
        emitSelection(semester, firstCourse.id, firstSession.id)
      } else {
        emitSelection(semester, firstCourse.id)
      }
      setInitialized(true)
    }
  }, [])

  const handleSemesterChange = (value: string) => {
    setSemester(value)
    const first = courses.find((c) => c.term === value)
    if (first) {
      setCourseId(first.id)
      const firstSession = sessions
        .filter((s) => s.classId === first.id)
        .sort((a, b) => a.week - b.week || weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday))[0]
      if (firstSession) {
        setSessionId(firstSession.id)
        emitSelection(value, first.id, firstSession.id)
      } else {
        setSessionId("")
        emitSelection(value, first.id)
      }
    } else {
      setCourseId("")
      setSessionId("")
    }
  }

  const handleCourseChange = (value: string) => {
    setCourseId(value)
    const firstSession = sessions
      .filter((s) => s.classId === value)
      .sort((a, b) => a.week - b.week || weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday))[0]
    if (firstSession) {
      setSessionId(firstSession.id)
      emitSelection(semester, value, firstSession.id)
    } else {
      setSessionId("")
      emitSelection(semester, value)
    }
  }

  const handleSessionChange = (value: string) => {
    setSessionId(value)
    emitSelection(semester, courseId, value)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">学期</label>
            <Select value={semester} onValueChange={handleSemesterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">课程 / 班级</label>
            <Select value={courseId || ""} onValueChange={handleCourseChange}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="选择课程与班级" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.course} - {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        {showSession && filteredSessions.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">课时节次</label>
              <Select value={sessionId || ""} onValueChange={handleSessionChange}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="选择课时节次" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      第{s.week}周 {s.weekday} {s.period} · {s.venue}
                    </SelectItem>
                  ))}
                  {filteredSessions.length === 0 && (
                    <SelectItem value="none" disabled>暂无课时节次</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
