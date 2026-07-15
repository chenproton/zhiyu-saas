"use client"

import { useState, useMemo } from "react"
import { FileText, Upload, CheckCircle2, RotateCcw, ArrowLeft, GraduationCap, Plus, Trash2, BookOpen, FileCheck, History, MessageSquare, Wrench, Monitor, Code, Presentation, ScrollText, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/components/providers/data-provider"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import type { GraduationProjectArchive, RectificationDetail } from "@/lib/types"

const PHASE_LABELS: Record<GraduationProjectArchive['phase'], string> = {
  proposal: '开题阶段', midterm: '中期阶段', process: '过程阶段', final: '结题阶段',
}

type DocCategory = 'proposal' | 'midterm' | 'process' | 'guide' | 'product' | 'thesis' | 'demo' | 'source'

interface StudentDoc {
  id: string
  name: string
  category: DocCategory
  status: 'pending' | 'submitted' | 'reviewed' | 'returned' | 'rectified'
  uploadTime: Date
  feedback?: string
  feedbackBy?: string
}

const CATEGORY_META: Record<DocCategory, { label: string; icon: React.ReactNode }> = {
  proposal: { label: '开题报告', icon: <BookOpen className="size-4" /> },
  midterm: { label: '中期检查', icon: <FileCheck className="size-4" /> },
  process: { label: '过程记录', icon: <History className="size-4" /> },
  guide: { label: '指导记录', icon: <MessageSquare className="size-4" /> },
  product: { label: '毕设作品', icon: <Wrench className="size-4" /> },
  thesis: { label: '论文/报告', icon: <ScrollText className="size-4" /> },
  demo: { label: '演示材料', icon: <Presentation className="size-4" /> },
  source: { label: '源代码/工程文件', icon: <Code className="size-4" /> },
}

const PROCESS_CATS: DocCategory[] = ['proposal','midterm','process','guide']
const OUTPUT_CATS: DocCategory[] = ['product','thesis','demo','source']

// 学生文档数据应由后端档案 API 提供，默认空状态
const INITIAL_STUDENT_DOCS: StudentDoc[] = []

export default function StudentArchivesPage() {
  const { graduationProjectArchives, rectificationDetails, updateRectificationDetail } = useData()
  const { toast } = useToast()
  const { user } = useAuth()
  const studentId = user?.id || ''

  const myArchive = useMemo(() => graduationProjectArchives.find((a) => a.studentId === studentId), [graduationProjectArchives, studentId])
  const myRects = useMemo(() => rectificationDetails.filter((r) => r.studentId === studentId), [rectificationDetails, studentId])

  const [docs, setDocs] = useState<StudentDoc[]>(INITIAL_STUDENT_DOCS)
  const [addOpen, setAddOpen] = useState(false)
  const [addCategory, setAddCategory] = useState<DocCategory>('proposal')
  const [addName, setAddName] = useState('')
  const [rectifyResponseOpen, setRectifyResponseOpen] = useState(false)
  const [currentRect, setCurrentRect] = useState<RectificationDetail | null>(null)
  const [responseText, setResponseText] = useState('')

  const handleAddDoc = () => {
    if (!addName.trim()) return
    const newDoc: StudentDoc = { id: `sd-${Date.now()}`, name: addName, category: addCategory, status: 'submitted', uploadTime: new Date() }
    setDocs(prev => [...prev, newDoc])
    toast({ title: '文档已上传' }); setAddOpen(false); setAddName('')
  }
  const handleDeleteDoc = (docId: string) => {
    setDocs(prev => prev.filter(d => d.id !== docId))
    toast({ title: '文档已删除' })
  }
  const handleRectifyResponse = () => {
    if (currentRect && responseText.trim()) {
      updateRectificationDetail(currentRect.id, { status: 'submitted', studentResponse: responseText, submittedAt: new Date() })
      toast({ title: '整改回复已提交' }); setRectifyResponseOpen(false); setCurrentRect(null); setResponseText('')
    }
  }

  const getDocStatusBadge = (status: StudentDoc['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="text-xs">待提交</Badge>
      case 'submitted': return <Badge variant="default" className="bg-blue-500 text-xs">已提交</Badge>
      case 'reviewed': return <Badge variant="default" className="bg-emerald-500 text-xs">已通过</Badge>
      case 'returned': return <Badge variant="destructive" className="text-xs">已退回</Badge>
      case 'rectified': return <Badge variant="outline" className="text-amber-600 text-xs">需整改</Badge>
    }
  }
  const formatDate = (date: Date) => new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3"><GraduationCap className="size-6 text-blue-600" /><h1 className="text-lg font-bold">学生毕设档案</h1></div>
          <Button variant="ghost" size="sm" onClick={() => window.close()}><ArrowLeft className="mr-1 size-4" />返回</Button>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-6">
        {myArchive ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">{myArchive.topicName}</h2>
                  <p className="text-sm text-muted-foreground">学生：{myArchive.studentName}（{myArchive.studentId}）| 指导教师：{myArchive.advisorName} | 当前阶段：{PHASE_LABELS[myArchive.phase]}</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="base">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="base">基础信息</TabsTrigger>
                <TabsTrigger value="process">过程性文档</TabsTrigger>
                <TabsTrigger value="output">成果性文档</TabsTrigger>
                <TabsTrigger value="evaluation">评价记录</TabsTrigger>
              </TabsList>

              {/* 基础信息 */}
              <TabsContent value="base" className="space-y-4 mt-4">
                <div className="rounded-lg border bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold">毕设项目基础信息</h3>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div><span className="text-muted-foreground">选题名称：</span><span className="font-medium">{myArchive.topicName}</span></div>
                    <div><span className="text-muted-foreground">学生姓名：</span>{myArchive.studentName}（{myArchive.studentId}）</div>
                    <div><span className="text-muted-foreground">指导教师：</span>{myArchive.advisorName}</div>
                    <div><span className="text-muted-foreground">企业导师：</span>{myArchive.enterpriseMentorName || '-'}</div>
                    <div><span className="text-muted-foreground">关联岗位：</span>{myArchive.positionName}</div>
                    <div><span className="text-muted-foreground">当前阶段：</span><Badge variant="outline">{PHASE_LABELS[myArchive.phase]}</Badge></div>
                    <div><span className="text-muted-foreground">开始日期：</span>{formatDate(new Date('2024-03-01'))}</div>
                    <div><span className="text-muted-foreground">结束日期：</span>{formatDate(new Date('2024-06-30'))}</div>
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold">选题描述</h3>
                  <p className="text-sm text-muted-foreground">该项目旨在通过微服务架构设计和实现一个完整的在线教育平台，涵盖用户管理、课程管理、直播互动、作业测评等核心模块。</p>
                </div>
              </TabsContent>

              {/* 过程性文档 */}
              <TabsContent value="process" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">过程性文档管理</h3>
                  <Button size="sm" variant="outline" onClick={() => { setAddCategory('proposal'); setAddOpen(true) }}><Plus className="mr-1 size-3" />上传文档</Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {PROCESS_CATS.map(cat => {
                    const catDocs = docs.filter(d => d.category === cat)
                    return (
                      <div key={cat} className="rounded-lg border bg-white p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">{CATEGORY_META[cat].icon}{CATEGORY_META[cat].label}</div>
                        {catDocs.length === 0 ? (
                          <div className="py-4 text-center text-xs text-muted-foreground">暂无{CATEGORY_META[cat].label}文档</div>
                        ) : (
                          <div className="space-y-2">
                            {catDocs.map(doc => (
                              <div key={doc.id} className="rounded-md border bg-gray-50 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-blue-500" />
                                    <span className="text-sm font-medium">{doc.name}</span>
                                  </div>
                                  {getDocStatusBadge(doc.status)}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">上传时间：{formatDate(doc.uploadTime)}</div>
                                {doc.feedback && (
                                  <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-700">
                                    <span className="font-medium">教师反馈（{doc.feedbackBy}）：</span>{doc.feedback}
                                  </div>
                                )}
                                <div className="mt-2 flex gap-1">
                                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleDeleteDoc(doc.id)}><Trash2 className="size-3" />删除</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              {/* 成果性文档 */}
              <TabsContent value="output" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">成果性文档管理</h3>
                  <Button size="sm" variant="outline" onClick={() => { setAddCategory('product'); setAddOpen(true) }}><Plus className="mr-1 size-3" />上传文档</Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {OUTPUT_CATS.map(cat => {
                    const catDocs = docs.filter(d => d.category === cat)
                    return (
                      <div key={cat} className="rounded-lg border bg-white p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">{CATEGORY_META[cat].icon}{CATEGORY_META[cat].label}</div>
                        {catDocs.length === 0 ? (
                          <div className="py-4 text-center text-xs text-muted-foreground">暂无{CATEGORY_META[cat].label}文档</div>
                        ) : (
                          <div className="space-y-2">
                            {catDocs.map(doc => (
                              <div key={doc.id} className="rounded-md border bg-gray-50 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-emerald-500" />
                                    <span className="text-sm font-medium">{doc.name}</span>
                                  </div>
                                  {getDocStatusBadge(doc.status)}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">上传时间：{formatDate(doc.uploadTime)}</div>
                                {doc.feedback && (
                                  <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-700">
                                    <span className="font-medium">教师反馈（{doc.feedbackBy}）：</span>{doc.feedback}
                                  </div>
                                )}
                                <div className="mt-2 flex gap-1">
                                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleDeleteDoc(doc.id)}><Trash2 className="size-3" />删除</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              {/* 评价记录 */}
              <TabsContent value="evaluation" className="space-y-4 mt-4">
                <div className="rounded-lg border bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold">各阶段评价结果</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-md border bg-gray-50 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium">开题评价</div>
                        <div className="text-xs text-muted-foreground">结构完整，技术路线清晰</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">85</div>
                        <div className="text-xs text-muted-foreground">2024-03-15</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-md border bg-gray-50 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium">中期评价</div>
                        <div className="text-xs text-muted-foreground">进展良好，核心模块已完成开发</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">88</div>
                        <div className="text-xs text-muted-foreground">2024-04-20</div>
                      </div>
                    </div>
                  </div>
                </div>
                {myRects.length > 0 && (
                  <div className="rounded-lg border bg-white p-5">
                    <h3 className="mb-3 text-sm font-semibold">整改任务</h3>
                    <div className="space-y-3">
                      {myRects.map((rect) => (
                        <div key={rect.id} className="rounded-md bg-red-50 p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-red-700">{rect.topicName}</span>
                            <Badge variant="outline" className="text-xs">{rect.status === 'pending' ? '待整改' : rect.status === 'submitted' ? '已提交' : '已通过'}</Badge>
                          </div>
                          <div className="text-sm text-red-600">{rect.requirement}</div>
                          <div className="mt-1 text-xs text-muted-foreground">截止日期：{formatDate(rect.deadline)}</div>
                          {rect.studentResponse && <div className="mt-1 text-xs text-emerald-600">已回复：{rect.studentResponse}</div>}
                          {rect.status === 'pending' && (
                            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => { setCurrentRect(rect); setRectifyResponseOpen(true) }}>
                              <RotateCcw className="mr-1 size-3" />提交整改结果
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center text-muted-foreground">未找到您的档案记录</div>
        )}
      </div>

      {/* 上传文档弹窗 */}
      <Dialog open={addOpen} onOpenChange={(open) => !open && setAddOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>上传文档</DialogTitle></DialogHeader>
          <div className="py-2">
            <div className="grid gap-3">
              <div className="grid gap-2"><Label>文档类别</Label>
                <Select value={addCategory} onValueChange={(v) => setAddCategory(v as DocCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                      <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>文档名称</Label><Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="请输入文档名称" /></div>
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">点击或拖拽文件到此处上传</p>
                <p className="text-xs text-muted-foreground">支持 PDF、Word、PPT、ZIP 等格式</p>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={handleAddDoc}><Upload className="mr-2 size-4" />确认上传</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 整改回复弹窗 */}
      <Dialog open={rectifyResponseOpen} onOpenChange={(open) => !open && setRectifyResponseOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>提交整改结果</DialogTitle></DialogHeader>
          <div className="py-4">
            <div className="mb-3 rounded-md bg-red-50 p-3 text-sm">
              <div className="font-medium text-red-700">整改要求</div>
              <div className="text-red-600">{currentRect?.requirement}</div>
            </div>
            <div className="grid gap-2">
              <Label>整改说明 / 上传补充材料</Label>
              <Textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="请说明整改完成情况..." rows={4} />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRectifyResponseOpen(false)}>取消</Button><Button onClick={handleRectifyResponse}><CheckCircle2 className="mr-2 size-4" />提交整改</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
