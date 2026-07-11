"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MAJORS } from "@/lib/types/lesson-source"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { BookOpen, Users, Calendar, CheckCircle2, MapPin, Clock, Rocket, Settings, Search, Copy } from "lucide-react"
import { courseApi } from "@/lib/api"
import type { Course } from "@/lib/types/lesson"
import { useToast } from "@/hooks/use-toast"

const semesters = [
  "2025 年第一学期",
  "2025 年第二学期",
  "2026 年第一学期",
]

interface ClassSession {
  id: string
  classId: string
  venue: string
  week: number
  weekday: string
  period: string
  status: "pending" | "associated"
  hybridCourseId?: string
}

interface ClassItem {
  id: string
  name: string
  course: string
  term: string
  students: number
  teacher: string
  status: "pending" | "active"
}

const MOCK_TEACHERS = ["张教授", "李讲师", "王老师", "赵副教授", "陈老师", "刘老师", "周老师"]

const initialClasses: ClassItem[] = [
  { id: "cls-1", name: "软件工程2026级1班", course: "Web前端开发混合课程", term: "2025 年第一学期", students: 42, teacher: "张教授", status: "pending" },
  { id: "cls-2", name: "软件工程2026级2班", course: "软件测试技术混合课程", term: "2025 年第一学期", students: 40, teacher: "李讲师", status: "active" },
  { id: "cls-3", name: "人工智能2026级1班", course: "机器学习混合课程", term: "2025 年第一学期", students: 38, teacher: "王老师", status: "pending" },
  { id: "cls-4", name: "大数据技术2026级1班", course: "数据分析与可视化混合课程", term: "2025 年第二学期", students: 36, teacher: "赵副教授", status: "pending" },
  { id: "cls-5", name: "云计算2026级1班", course: "云原生应用开发混合课程", term: "2025 年第二学期", students: 35, teacher: "陈老师", status: "active" },
  { id: "cls-6", name: "物联网2026级1班", course: "嵌入式系统开发混合课程", term: "2026 年第一学期", students: 33, teacher: "刘老师", status: "pending" },
]

const initialSessions: ClassSession[] = [
  { id: "s-1-1", classId: "cls-1", venue: "教学楼 A-101", week: 1, weekday: "周一", period: "上午 1", status: "pending" },
  { id: "s-1-2", classId: "cls-1", venue: "教学楼 A-101", week: 2, weekday: "周三", period: "上午 2", status: "pending" },
  { id: "s-1-3", classId: "cls-1", venue: "实训楼 B-202", week: 4, weekday: "周五", period: "下午 1", status: "pending" },
  { id: "s-2-1", classId: "cls-2", venue: "教学楼 A-102", week: 1, weekday: "周二", period: "上午 1", status: "associated", hybridCourseId: "hybrid-2" },
  { id: "s-2-2", classId: "cls-2", venue: "实训楼 B-203", week: 3, weekday: "周四", period: "上午 2", status: "pending" },
]

const weekdayOrder = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

export default function ClassClaimPage() {
  const { toast } = useToast()
  const [hybridCourses, setHybridCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses)
  const [sessions] = useState<ClassSession[]>(initialSessions)
  const [selectedTerm, setSelectedTerm] = useState(semesters[0])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmClass, setConfirmClass] = useState<ClassItem | null>(null)
  const [cloneOpen, setCloneOpen] = useState(false)
  const [cloneSearch, setCloneSearch] = useState("")
  const [cloneMajor, setCloneMajor] = useState("全部")
  const [cloneCategory, setCloneCategory] = useState("全部")
  const [cloneBatch, setCloneBatch] = useState("全部")
  const [cloneScope, setCloneScope] = useState<"mine" | "shared" | "public">("mine")
  const [cloneSelectedId, setCloneSelectedId] = useState<string | null>(null)
  const [cloneClassContext, setCloneClassContext] = useState<{ course: string; teacher: string; className: string; sessions: ClassSession[] } | null>(null)

  useEffect(() => {
    setCoursesLoading(true)
    courseApi
      .list({ type: "hybrid", status: "published", limit: 1000 })
      .then((res) => setHybridCourses(res.items))
      .catch((err: any) => toast({ variant: "destructive", title: "加载混合课失败", description: err.message }))
      .finally(() => setCoursesLoading(false))
  }, [])

  const uniqueCategories = useMemo(() => {
    const cats = new Set(hybridCourses.map((c) => c.category).filter(Boolean))
    return [...cats]
  }, [hybridCourses])

  const uniqueBatches = useMemo(() => {
    const batches = new Set(hybridCourses.map((c) => c.batchGroup).filter(Boolean) as string[])
    return [...batches]
  }, [hybridCourses])

  const getCourseScope = (c: Course) => {
    if (c.status === "published") return "public" as const
    return "mine" as const
  }

  const filteredHybrid = useMemo(() =>
    hybridCourses.filter((c) => {
      if (getCourseScope(c) !== cloneScope) return false
      if (cloneMajor !== "全部" && c.major !== cloneMajor) return false
      if (cloneCategory !== "全部" && c.category !== cloneCategory) return false
      if (cloneBatch !== "全部" && c.batchGroup !== cloneBatch) return false
      if (cloneSearch && !c.name.includes(cloneSearch) && !(c.major || "").includes(cloneSearch)) return false
      return true
    }),
    [hybridCourses, cloneSearch, cloneScope, cloneMajor, cloneCategory, cloneBatch]
  )

  const termClasses = classes.filter((c) => c.term === selectedTerm)
  const termClassIds = new Set(termClasses.map((c) => c.id))
  const termSessions = sessions.filter((s) => termClassIds.has(s.classId))
  const associatedCount = termSessions.filter((s) => s.status === "associated").length

  const handleOpenHybridAdd = (courseName: string, className: string, classSessions: ClassSession[]) => {
    const teacher = MOCK_TEACHERS[className.length % MOCK_TEACHERS.length]
    const payload = {
      course: courseName,
      teacher,
      className,
      sessions: classSessions.map((s) => ({
        week: s.week,
        weekday: s.weekday,
        period: s.period,
        venue: s.venue,
      })),
    }
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)))
    const url = `/lesson/admin/hybrid/add?claimCourse=${encodeURIComponent(courseName)}&claimSessions=${encodeURIComponent(encoded)}`
    window.open(url, "_blank")
  }

  const handleOpenConfirm = (cls: ClassItem) => {
    setConfirmClass(cls)
    setConfirmOpen(true)
  }

  const handleConfirmStart = () => {
    if (!confirmClass) return
    setClasses((prev) =>
      prev.map((c) => (c.id === confirmClass.id ? { ...c, status: "active" as const } : c))
    )
    setConfirmOpen(false)
    setConfirmClass(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">开课计划管理</h1>
        <p className="text-muted-foreground mt-1">管理课程节次并关联混合课程资源</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><BookOpen className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">课程节次列表</p>
                <p className="text-2xl font-bold">{termSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle2 className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">已关联混合课程</p>
                <p className="text-2xl font-bold">{associatedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">覆盖学生</p>
                <p className="text-2xl font-bold">{termClasses.reduce((sum, c) => sum + c.students, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-base">课程节次列表</CardTitle>
          <Tabs value={selectedTerm} onValueChange={setSelectedTerm}>
            <TabsList className="h-9">
              {semesters.map((term) => (
                <TabsTrigger key={term} value={term} className="text-xs px-3">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {term}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4">
          {termClasses.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">该学期暂无课程安排</div>
          ) : (
            termClasses.map((cls) => {
              const classSessions = sessions
                .filter((s) => s.classId === cls.id)
                .sort(
                  (a, b) =>
                    a.week - b.week ||
                    weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday)
                )

              return (
                <div key={cls.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{cls.course}</h3>
                        <Badge variant="outline">{cls.name}</Badge>
                        <Badge variant={cls.status === "active" ? "default" : "secondary"}>
                          {cls.status === "active" ? "已开课" : "待开课"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{cls.students}人 · {cls.term}</p>
                      <p className="text-sm text-muted-foreground">任课教师：{cls.teacher}</p>
                    </div>
                    {cls.status === "active" ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleOpenHybridAdd(cls.course, cls.name, classSessions)}
                        >
                          <Settings className="h-3.5 w-3.5 mr-1" />
                          新建混合课
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCloneSearch("")
                            setCloneMajor("全部")
                            setCloneCategory("全部")
                            setCloneBatch("全部")
                            setCloneScope("mine")
                            setCloneSelectedId(null)
                            setCloneClassContext({
                              course: cls.course,
                              teacher: cls.teacher,
                              className: cls.name,
                              sessions: classSessions,
                            })
                            setCloneOpen(true)
                          }}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          克隆混合课
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="shrink-0"
                        onClick={() => handleOpenConfirm(cls)}
                        disabled={classSessions.length === 0}
                      >
                        <Rocket className="h-3.5 w-3.5 mr-1" />
                        开课
                      </Button>
                    )}
                  </div>

                  {classSessions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {classSessions.map((session) => (
                        <div
                          key={session.id}
                          className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow"
                        >
                          <div className="space-y-2">
                            <div className="text-sm font-semibold">第 {session.week} 周</div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>{session.weekday} · {session.period}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span>{session.venue}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">暂无课程节次</div>
                  )}
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认开课</AlertDialogTitle>
            <AlertDialogDescription>
              确认将「{confirmClass?.course} - {confirmClass?.name}」的状态设为"已开课"吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStart}>确认开课</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clone hybrid course dialog */}
      <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>克隆混合课</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Scope tabs */}
            <div className="flex gap-2">
              {[
                { key: "mine" as const, label: "我的" },
                { key: "shared" as const, label: "共建" },
                { key: "public" as const, label: "公共" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setCloneScope(t.key); setCloneSelectedId(null) }}
                  className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                    cloneScope === t.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={cloneSearch}
                onChange={(e) => {
                  setCloneSearch(e.target.value)
                  setCloneSelectedId(null)
                }}
                placeholder="搜索混合课名称、专业..."
                className="pl-9 text-sm h-9"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>所属专业</Label>
                  <Select value={cloneMajor} onValueChange={(v) => { setCloneMajor(v); setCloneSelectedId(null) }}>
                    <SelectTrigger className="h-9 text-sm w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部</SelectItem>
                      {MAJORS.filter((m) => m !== "全部").map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>课程分类</Label>
                  <Select value={cloneCategory} onValueChange={(v) => { setCloneCategory(v); setCloneSelectedId(null) }}>
                    <SelectTrigger className="h-9 text-sm w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部</SelectItem>
                      {uniqueCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>所属批次分组</Label>
                  <Select value={cloneBatch} onValueChange={(v) => { setCloneBatch(v); setCloneSelectedId(null) }}>
                    <SelectTrigger className="h-9 text-sm w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部</SelectItem>
                      {uniqueBatches.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Course list */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-400 mb-2">
                共 {filteredHybrid.length} 门课程
                {coursesLoading && <span className="text-primary ml-2">加载中...</span>}
                {cloneSelectedId && (
                  <span className="text-primary ml-2">已选择 1 门</span>
                )}
              </p>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {filteredHybrid.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">未找到匹配的混合课</p>
                ) : (
                  filteredHybrid.map((c) => {
                    const selected = cloneSelectedId === c.id
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCloneSelectedId(selected ? null : c.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all",
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/10"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                            selected ? "bg-primary border-primary" : "border-gray-300"
                          )}>
                            {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate flex-1">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 pl-7 text-xs text-gray-500">
                          {c.major && <span>{c.major}</span>}
                          {c.major && c.category && <span className="text-gray-300">|</span>}
                          {c.category && <span>{c.category}</span>}
                          {c.category && c.batchGroup && <span className="text-gray-300">|</span>}
                          {c.batchGroup && <span>{c.batchGroup}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 pl-7">
                          {c.teacherId && <span className="text-[10px] text-gray-400">{c.teacherId}</span>}
                          {c.onlineHours != null && c.offlineHours != null && (
                            <span className="text-[10px] text-gray-400">
                              线上{c.onlineHours}学时 + 线下{c.offlineHours}学时
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneOpen(false)}>
              取消
            </Button>
            <Button
              disabled={!cloneSelectedId}
              onClick={() => {
                if (!cloneSelectedId || !cloneClassContext) return
                const payload = {
                  course: cloneClassContext.course,
                  teacher: cloneClassContext.teacher,
                  className: cloneClassContext.className,
                  sessions: cloneClassContext.sessions.map((s) => ({
                    week: s.week,
                    weekday: s.weekday,
                    period: s.period,
                    venue: s.venue,
                  })),
                }
                const encoded = btoa(encodeURIComponent(JSON.stringify(payload)))
                const url = `/lesson/admin/hybrid/add?id=${cloneSelectedId}&claimCourse=${encodeURIComponent(cloneClassContext.course)}&claimSessions=${encodeURIComponent(encoded)}`
                setCloneOpen(false)
                window.open(url, "_blank")
              }}
            >
              确认克隆
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
