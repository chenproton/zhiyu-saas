"use client"

import { useState, useMemo } from "react"
import { Search, Briefcase, MapPin, Users, Clock, GraduationCap, Send, ArrowLeft, Eye, Lightbulb, Layers, Settings, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/components/providers/data-provider"
import { useToast } from "@/hooks/use-toast"
import type { GraduationProjectTopic } from "@/lib/types"

export default function StudentTopicApplyPage() {
  const { graduationProjectTopics, topicApplications, createTopicApplication } = useData()
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [applyTopic, setApplyTopic] = useState<GraduationProjectTopic | null>(null)
  const [viewDetailTopic, setViewDetailTopic] = useState<GraduationProjectTopic | null>(null)
  const [applyForm, setApplyForm] = useState({ studentId: '', studentName: '', className: '', applyReason: '' })

  const filteredTopics = useMemo(() => {
    let list = graduationProjectTopics.filter((t) => t.status === 'published')
    if (sourceFilter !== "all") list = list.filter((t) => t.source === sourceFilter)
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((t) => t.name.toLowerCase().includes(q) || t.positionName.toLowerCase().includes(q)) }
    return list
  }, [graduationProjectTopics, sourceFilter, search])

  const myApplications = useMemo(() => topicApplications.filter((a) => a.studentId === applyForm.studentId), [topicApplications, applyForm.studentId])

  const handleApply = () => {
    if (!applyForm.studentId.trim() || !applyForm.studentName.trim() || !applyForm.applyReason.trim()) {
      toast({ title: '请填写完整申请信息', variant: 'destructive' }); return
    }
    if (applyTopic) {
      createTopicApplication({ topicId: applyTopic.id, topicName: applyTopic.name, studentId: applyForm.studentId, studentName: applyForm.studentName, className: applyForm.className, applyReason: applyForm.applyReason, status: 'allocated', allocatedAdvisorName: applyTopic.advisorName })
      toast({ title: '选题申请已成功，已分配指导教师' }); setApplyTopic(null)
    }
  }

  const formatDate = (date: Date) => new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="size-6 text-blue-600" />
            <h1 className="text-lg font-bold">学生毕业设计选题申请</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.close()}><ArrowLeft className="mr-1 size-4" />返回</Button>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6 rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold">我的申请记录</h2>
          {myApplications.length === 0 ? (
            <div className="text-sm text-muted-foreground">暂无申请记录（请先填写学号查看）</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {myApplications.map((app) => (
                <Badge key={app.id} variant={app.status === 'allocated' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="gap-1">
                  {app.topicName} · {app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : app.status === 'allocated' ? '已分配' : '已驳回'}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索选题名称或岗位..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="全部来源" /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">全部来源</SelectItem><SelectItem value="scene">场景库</SelectItem><SelectItem value="enterprise">企业需求</SelectItem></SelectGroup></SelectContent></Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTopics.length === 0 ? (
            <div className="col-span-2 rounded-lg border bg-white py-12 text-center text-muted-foreground">暂无可申请的选题</div>
          ) : (filteredTopics.map((topic) => (
            <div key={topic.id} className="rounded-lg border bg-white p-4">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-sm font-semibold">{topic.name}</h3>
                <Badge variant="outline" className="text-xs">{topic.source === 'scene' ? '场景库' : '企业需求'}</Badge>
              </div>
              <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{topic.description || '暂无描述'}</p>
              <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Briefcase className="size-3" />{topic.positionName}</div>
                <div className="flex items-center gap-1"><Users className="size-3" />{topic.appliedCount} / {topic.capacity} 人</div>
                <div className="flex items-center gap-1"><MapPin className="size-3" />{topic.advisorName}{topic.enterpriseMentorName ? ` / ${topic.enterpriseMentorName}` : ''}</div>
                <div className="flex items-center gap-1"><Clock className="size-3" />{formatDate(topic.startDate)} 至 {formatDate(topic.endDate)}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewDetailTopic(topic)}>
                  <Eye className="mr-1 size-3" />查看详情
                </Button>
                <Button size="sm" className="flex-1" onClick={() => { setApplyTopic(topic) }}>
                  <Send className="mr-1 size-3" />申请选题
                </Button>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* 申请弹窗 */}
      <Dialog open={!!applyTopic} onOpenChange={(open) => !open && setApplyTopic(null)}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>申请选题</DialogTitle></DialogHeader>
          <div className="py-4">
            <div className="mb-3 rounded-lg bg-muted p-3 text-sm"><span className="font-medium">选题：</span>{applyTopic?.name}</div>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>学号 *</Label><Input value={applyForm.studentId} onChange={(e) => setApplyForm({ ...applyForm, studentId: e.target.value })} placeholder="请输入学号" /></div>
                <div><Label>姓名 *</Label><Input value={applyForm.studentName} onChange={(e) => setApplyForm({ ...applyForm, studentName: e.target.value })} placeholder="请输入姓名" /></div>
              </div>
              <div><Label>班级</Label><Input value={applyForm.className} onChange={(e) => setApplyForm({ ...applyForm, className: e.target.value })} placeholder="请输入班级" /></div>
              <div><Label>申请理由 *</Label><Textarea value={applyForm.applyReason} onChange={(e) => setApplyForm({ ...applyForm, applyReason: e.target.value })} placeholder="请说明申请该选题的理由..." rows={3} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setApplyTopic(null)}>取消</Button><Button onClick={handleApply}><Send className="mr-2 size-4" />提交申请</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看选题详情弹窗 */}
      <Dialog open={!!viewDetailTopic} onOpenChange={(open) => !open && setViewDetailTopic(null)}>
        <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>选题详情</DialogTitle></DialogHeader>
          {viewDetailTopic && (
            <div className="grid grid-cols-12 gap-6 py-4">
              <div className="col-span-7 space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <h3 className="text-sm font-semibold">{viewDetailTopic.name}</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div><span className="text-muted-foreground">关联岗位：</span>{viewDetailTopic.positionName}</div>
                    <div><span className="text-muted-foreground">选题来源：</span>{viewDetailTopic.source === 'scene' ? '场景库' : '企业需求'}</div>
                    <div><span className="text-muted-foreground">指导教师：</span>{viewDetailTopic.advisorName}</div>
                    <div><span className="text-muted-foreground">企业导师：</span>{viewDetailTopic.enterpriseMentorName || '-'}</div>
                    <div><span className="text-muted-foreground">容量：</span>{viewDetailTopic.appliedCount} / {viewDetailTopic.capacity} 人</div>
                    <div><span className="text-muted-foreground">起止时间：</span>{formatDate(viewDetailTopic.startDate)} 至 {formatDate(viewDetailTopic.endDate)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{viewDetailTopic.description || '暂无描述'}</div>
                </div>
                {/* 关联场景 / 项目配置 */}
                {viewDetailTopic.source === 'scene' ? (
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold"><Layers className="size-4 text-blue-600" />关联场景信息</div>
                    <div className="rounded-md border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 text-center">
                      <Layers className="mx-auto mb-2 size-8 text-blue-300" />
                      <p className="text-sm text-blue-700 font-medium">场景卡片展示区域</p>
                      <p className="text-xs text-blue-600 mt-1">此处将展示场景名称、场景下的能力点、知识点和任务链（待开发）</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold"><Building2 className="size-4 text-emerald-600" />企业项目配置</div>
                    <div className="rounded-md border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center">
                      <Settings className="mx-auto mb-2 size-8 text-emerald-300" />
                      <p className="text-sm text-emerald-700 font-medium">企业需求项目配置展示区域</p>
                      <p className="text-xs text-emerald-600 mt-1">此处将展示对应的能力模型和测评标准（待开发）</p>
                    </div>
                  </div>
                )}
                {/* 能力要求 */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="size-4 text-amber-600" />能力要求</div>
                  <div className="rounded-md border-2 border-dashed border-amber-200 bg-amber-50/50 p-6 text-center">
                    <Lightbulb className="mx-auto mb-2 size-8 text-amber-300" />
                    <p className="text-sm text-amber-700 font-medium">能力要求展示区域</p>
                    <p className="text-xs text-amber-600 mt-1">此处将展示学生完成该选题所需的能力要求、知识储备和技能等级（待开发）</p>
                  </div>
                </div>
              </div>
              <div className="col-span-5 space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-3 text-sm font-semibold">指导团队</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2"><div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">教</div><div><div className="font-medium">{viewDetailTopic.advisorName}</div><div className="text-muted-foreground">指导教师</div></div></div>
                    {viewDetailTopic.enterpriseMentorName && (
                      <div className="flex items-center gap-2"><div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">企</div><div><div className="font-medium">{viewDetailTopic.enterpriseMentorName}</div><div className="text-muted-foreground">企业导师</div></div></div>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-3 text-sm font-semibold">当前负责教师</div>
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">责</div>
                    <div className="text-xs">
                      <div className="font-medium">{viewDetailTopic.advisorName}</div>
                      <div className="text-muted-foreground">主要负责指导与答疑</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-3 text-sm font-semibold">申请信息</div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div>已申请 {viewDetailTopic.appliedCount} / {viewDetailTopic.capacity} 人</div>
                    <div>开始日期：{formatDate(viewDetailTopic.startDate)}</div>
                    <div>结束日期：{formatDate(viewDetailTopic.endDate)}</div>
                  </div>
                  <Button size="sm" className="mt-3 w-full" onClick={() => { setViewDetailTopic(null); setApplyTopic(viewDetailTopic) }}>
                    <Send className="mr-1 size-3" />申请该选题
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewDetailTopic(null)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
