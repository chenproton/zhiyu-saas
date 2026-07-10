"use client"

import { useState, useMemo } from "react"
import { Search, FolderOpen, AlertCircle, CheckCircle2, Clock, Eye, GraduationCap, FileText, BookOpen, FileCheck, History, MessageSquare, Wrench, Presentation, ScrollText, Code, XCircle, Check, UserCircle, Calendar, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useData } from "@/components/providers/data-provider"
import { useToast } from "@/hooks/use-toast"
import type { GraduationProjectArchive } from "@/lib/types"

const PHASE_LABELS: Record<GraduationProjectArchive['phase'], string> = {
  proposal: '开题阶段', midterm: '中期阶段', process: '过程阶段', final: '结题阶段',
}

const STATUS_META: Record<GraduationProjectArchive['docStatus'], { label: string; color: string; icon: React.ReactNode }> = {
  making: { label: '制作中', color: 'bg-slate-500', icon: <Clock className="mr-1 size-3" /> },
  reviewing: { label: '待审核', color: 'bg-amber-500', icon: <FileText className="mr-1 size-3" /> },
  returned: { label: '已退回', color: 'bg-red-500', icon: <AlertCircle className="mr-1 size-3" /> },
  passed: { label: '已通过', color: 'bg-emerald-500', icon: <CheckCircle2 className="mr-1 size-3" /> },
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode }> = {
  proposal: { label: '开题报告', icon: <BookOpen className="size-4 text-blue-500" /> },
  midterm: { label: '中期检查', icon: <FileCheck className="size-4 text-purple-500" /> },
  process: { label: '过程记录', icon: <History className="size-4 text-amber-500" /> },
  guide: { label: '指导记录', icon: <MessageSquare className="size-4 text-cyan-500" /> },
  product: { label: '毕设作品', icon: <Wrench className="size-4 text-orange-500" /> },
  thesis: { label: '论文/报告', icon: <ScrollText className="size-4 text-indigo-500" /> },
  demo: { label: '演示材料', icon: <Presentation className="size-4 text-pink-500" /> },
  source: { label: '源代码/工程文件', icon: <Code className="size-4 text-emerald-500" /> },
}

const PROCESS_CATS = ['proposal', 'midterm', 'process', 'guide']
const OUTPUT_CATS = ['product', 'thesis', 'demo', 'source']

// 模拟文档数据生成器
function generateMockDocs(archive: GraduationProjectArchive) {
  const docs: Array<{
    id: string; name: string; category: string; status: 'draft' | 'submitted' | 'reviewed' | 'returned';
    uploadTime: Date; size: string; feedback?: string; feedbackBy?: string;
  }> = []
  const baseDate = new Date(archive.lastUpdated)
  // 过程性文档
  const processNames: Record<string, string[]> = {
    proposal: [`${archive.topicName}-开题报告.pdf`, `${archive.topicName}-文献综述.docx`],
    midterm: [`${archive.topicName}-中期检查表.pdf`, `${archive.topicName}-进度汇报.pptx`],
    process: [`${archive.topicName}-周进展记录-第1周.md`, `${archive.topicName}-周进展记录-第2周.md`, `${archive.topicName}-周进展记录-第3周.md`],
    guide: [`${archive.topicName}-指导记录-3月.pdf`, `${archive.topicName}-指导记录-4月.pdf`],
  }
  PROCESS_CATS.forEach((cat, ci) => {
    const names = processNames[cat] || [`${archive.topicName}-${CATEGORY_META[cat].label}.pdf`]
    names.forEach((name, ni) => {
      const statusPool: Array<'draft' | 'submitted' | 'reviewed' | 'returned'> =
        archive.docStatus === 'making' ? ['draft', 'submitted'] :
        archive.docStatus === 'reviewing' ? ['submitted', 'reviewed'] :
        archive.docStatus === 'returned' ? ['returned', 'submitted'] :
        ['reviewed', 'reviewed']
      const st = statusPool[(ci + ni) % statusPool.length]
      docs.push({
        id: `doc-${archive.id}-${cat}-${ni}`,
        name,
        category: cat,
        status: st,
        uploadTime: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - (ci * 7 + ni * 2)),
        size: `${(Math.random() * 10 + 0.5).toFixed(1)} MB`,
        feedback: st === 'returned' ? '请补充实验数据与性能测试结果' : st === 'reviewed' ? '文档结构完整，内容符合要求' : undefined,
        feedbackBy: st === 'returned' || st === 'reviewed' ? archive.advisorName : undefined,
      })
    })
  })
  // 成果性文档
  const outputNames: Record<string, string[]> = {
    product: [`${archive.topicName}-系统部署包.zip`, `${archive.topicName}-使用说明书.pdf`],
    thesis: [`${archive.topicName}-毕业设计论文.pdf`, `${archive.topicName}-查重报告.pdf`],
    demo: [`${archive.topicName}-演示视频.mp4`, `${archive.topicName}-答辩PPT.pptx`],
    source: [`${archive.topicName}-源代码.zip`, `${archive.topicName}-数据库脚本.sql`],
  }
  OUTPUT_CATS.forEach((cat, ci) => {
    const names = outputNames[cat] || [`${archive.topicName}-${CATEGORY_META[cat].label}.pdf`]
    names.forEach((name, ni) => {
      const statusPool: Array<'draft' | 'submitted' | 'reviewed' | 'returned'> =
        archive.docStatus === 'making' ? ['draft'] :
        archive.docStatus === 'reviewing' ? ['submitted'] :
        archive.docStatus === 'returned' ? ['returned'] :
        ['reviewed']
      const st = statusPool[(ci + ni) % statusPool.length]
      docs.push({
        id: `doc-${archive.id}-${cat}-${ni}`,
        name,
        category: cat,
        status: st,
        uploadTime: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - (ci * 3 + ni)),
        size: `${(Math.random() * 50 + 2).toFixed(1)} MB`,
        feedback: st === 'returned' ? '格式不规范，请按模板重新整理' : st === 'reviewed' ? '成果完整，达到毕设要求' : undefined,
        feedbackBy: st === 'returned' || st === 'reviewed' ? archive.advisorName : undefined,
      })
    })
  })
  return docs
}

const DOC_STATUS_BADGE: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' | 'outline'; className?: string }> = {
  draft: { label: '草稿', variant: 'secondary' },
  submitted: { label: '已提交', variant: 'default', className: 'bg-blue-500' },
  reviewed: { label: '已通过', variant: 'default', className: 'bg-emerald-500' },
  returned: { label: '已退回', variant: 'destructive' },
}

export default function GraduationProjectArchivesPage() {
  const { graduationProjectArchives, updateGraduationProjectArchive } = useData()
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [selectedTopicId, setSelectedTopicId] = useState<string>("all")
  const [detailArchive, setDetailArchive] = useState<GraduationProjectArchive | null>(null)

  // 左侧选题列表（去重，只显示有档案的选题）
  const topicList = useMemo(() => {
    const map = new Map<string, string>()
    graduationProjectArchives.forEach(a => map.set(a.topicId, a.topicName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [graduationProjectArchives])

  // 右侧筛选后的档案
  const filteredArchives = useMemo(() => {
    let list = [...graduationProjectArchives]
    if (selectedTopicId !== "all") list = list.filter((a) => a.topicId === selectedTopicId)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((a) => a.studentName.toLowerCase().includes(q) || a.topicName.toLowerCase().includes(q) || a.advisorName.toLowerCase().includes(q))
    }
    return list.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
  }, [graduationProjectArchives, selectedTopicId, search])

  const stats = useMemo(() => {
    const total = graduationProjectArchives.length
    return {
      total,
      proposal: graduationProjectArchives.filter((a) => a.phase === 'proposal').length,
      midterm: graduationProjectArchives.filter((a) => a.phase === 'midterm').length,
      process: graduationProjectArchives.filter((a) => a.phase === 'process').length,
      final: graduationProjectArchives.filter((a) => a.phase === 'final').length,
      making: graduationProjectArchives.filter((a) => a.docStatus === 'making').length,
      reviewing: graduationProjectArchives.filter((a) => a.docStatus === 'reviewing').length,
      returned: graduationProjectArchives.filter((a) => a.docStatus === 'returned').length,
      passed: graduationProjectArchives.filter((a) => a.docStatus === 'passed').length,
    }
  }, [graduationProjectArchives])

  const getStatusBadge = (status: GraduationProjectArchive['docStatus']) => {
    const meta = STATUS_META[status]
    return <Badge variant="default" className={`${meta.color} gap-1 text-white`}>{meta.icon}{meta.label}</Badge>
  }

  const formatDate = (date: Date) => new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date)
  const formatDateTime = (date: Date) => new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date)

  const handlePass = (archive: GraduationProjectArchive, e: React.MouseEvent) => {
    e.stopPropagation()
    updateGraduationProjectArchive(archive.id, { docStatus: 'passed' })
    toast({ title: `「${archive.studentName}」的档案已通过审核` })
  }

  const handleReturn = (archive: GraduationProjectArchive, e: React.MouseEvent) => {
    e.stopPropagation()
    updateGraduationProjectArchive(archive.id, { docStatus: 'returned' })
    toast({ title: `「${archive.studentName}」的档案已退回` })
  }

  const detailDocs = useMemo(() => detailArchive ? generateMockDocs(detailArchive) : [], [detailArchive])

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* 左侧选题导航 */}
      <div className="flex w-64 flex-col border-r bg-white">
        <div className="border-b p-4">
          <h2 className="text-sm font-semibold">毕业设计选题</h2>
          <p className="text-xs text-muted-foreground">点击选题查看档案</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <button
              onClick={() => setSelectedTopicId("all")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                selectedTopicId === "all" ? "bg-primary/10 font-medium text-primary" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>全部选题</span>
              <span className="text-xs text-muted-foreground">{graduationProjectArchives.length} 人</span>
            </button>
            {topicList.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`flex w-full flex-col rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedTopicId === topic.id ? "bg-primary/10 font-medium text-primary" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{topic.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{graduationProjectArchives.filter(a => a.topicId === topic.id).length} 人</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧档案列表 */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">毕设档案管理</h1>
            <p className="text-muted-foreground">
              {selectedTopicId === "all" ? "管理所有毕设档案" : `查看 ${topicList.find(t => t.id === selectedTopicId)?.name || ''} 的档案`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.open('/graduation-project/student/archives', '_blank')}><GraduationCap className="mr-2 size-4" />学生档案入口</Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-3">
          <div className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-50"><FolderOpen className="size-4 text-blue-600" /></div>
            <div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">档案总数</div><div className="text-sm font-semibold">{stats.total}</div></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-slate-50"><Clock className="size-4 text-slate-600" /></div>
            <div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">制作中</div><div className="text-sm font-semibold">{stats.making}</div></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-amber-50"><FileText className="size-4 text-amber-600" /></div>
            <div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">待审核</div><div className="text-sm font-semibold">{stats.reviewing}</div></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-emerald-50"><CheckCircle2 className="size-4 text-emerald-600" /></div>
            <div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">已通过</div><div className="text-sm font-semibold">{stats.passed}</div></div>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索学生或导师..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="rounded-lg border bg-white px-4 py-3">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">选题名称</TableHead>
                  <TableHead className="w-[90px]">学生</TableHead>
                  <TableHead className="w-[100px]">负责教师</TableHead>
                  <TableHead className="w-[70px]">文档数</TableHead>
                  <TableHead className="w-[90px]">当前阶段</TableHead>
                  <TableHead className="w-[90px]">档案状态</TableHead>
                  <TableHead className="w-[110px]">最近更新</TableHead>
                  <TableHead className="sticky right-0 w-[200px] bg-white text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArchives.length === 0 ? (<TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">暂无档案记录</TableCell></TableRow>) : (filteredArchives.map((archive) => (
                  <TableRow key={archive.id}>
                    <TableCell><div className="text-sm font-medium">{archive.topicName}</div></TableCell>
                    <TableCell><span className="text-sm">{archive.studentName}</span></TableCell>
                    <TableCell><div className="text-sm">{archive.advisorName}</div>{archive.enterpriseMentorName && <div className="text-xs text-muted-foreground">{archive.enterpriseMentorName}</div>}</TableCell>
                    <TableCell><div className="flex items-center gap-1"><FileText className="size-3.5 text-muted-foreground" /><span className="text-sm">{archive.docCount}</span></div></TableCell>
                    <TableCell><Badge variant="outline" className="text-xs font-normal">{PHASE_LABELS[archive.phase]}</Badge></TableCell>
                    <TableCell>{getStatusBadge(archive.docStatus)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(archive.lastUpdated)}</TableCell>
                    <TableCell className="sticky right-0 bg-white text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setDetailArchive(archive)}><Eye className="size-3" />查看</Button>
                        {archive.docStatus === 'reviewing' && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-emerald-600" onClick={(e) => handlePass(archive, e)}><Check className="size-3" />通过</Button>
                            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-red-600" onClick={(e) => handleReturn(archive, e)}><XCircle className="size-3" />退回</Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 档案详情弹窗 - 纯展示 */}
        <Dialog open={!!detailArchive} onOpenChange={(open) => !open && setDetailArchive(null)}>
          <DialogContent className="sm:max-w-6xl max-h-[92vh] overflow-y-auto p-0">
            {detailArchive && (
              <div className="p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle>「{detailArchive.topicName}」毕设档案</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="base">
                  <TabsList className="mb-4 grid w-full grid-cols-4">
                    <TabsTrigger value="base">基础信息</TabsTrigger>
                    <TabsTrigger value="process">过程性文档</TabsTrigger>
                    <TabsTrigger value="output">成果性文档</TabsTrigger>
                    <TabsTrigger value="evaluation">评价记录</TabsTrigger>
                  </TabsList>

                  <TabsContent value="base" className="space-y-4">
                    <div className="rounded-lg border bg-muted/30 p-5">
                      <h3 className="mb-4 text-sm font-semibold">毕设项目基础信息</h3>
                      <div className="grid grid-cols-3 gap-y-3 text-sm">
                        <div><span className="text-muted-foreground">选题名称：</span><span className="font-medium">{detailArchive.topicName}</span></div>
                        <div><span className="text-muted-foreground">学生姓名：</span>{detailArchive.studentName}（{detailArchive.studentId}）</div>
                        <div><span className="text-muted-foreground">指导教师：</span>{detailArchive.advisorName}</div>
                        <div><span className="text-muted-foreground">企业导师：</span>{detailArchive.enterpriseMentorName || '-'}</div>
                        <div><span className="text-muted-foreground">关联岗位：</span>{detailArchive.positionName}</div>
                        <div><span className="text-muted-foreground">当前阶段：</span><Badge variant="outline">{PHASE_LABELS[detailArchive.phase]}</Badge></div>
                        <div><span className="text-muted-foreground">档案状态：</span>{getStatusBadge(detailArchive.docStatus)}</div>
                        <div><span className="text-muted-foreground">最近更新：</span>{formatDate(detailArchive.lastUpdated)}</div>
                        <div><span className="text-muted-foreground">文档总数：</span>{detailArchive.docCount}</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="process" className="space-y-4">
                    <h3 className="text-sm font-semibold">过程性文档</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {PROCESS_CATS.map(cat => {
                        const catDocs = detailDocs.filter(d => d.category === cat)
                        return (
                          <div key={cat} className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">{CATEGORY_META[cat].icon}{CATEGORY_META[cat].label}</div>
                            {catDocs.length === 0 ? (
                              <div className="py-4 text-center text-xs text-muted-foreground">暂无{CATEGORY_META[cat].label}文档</div>
                            ) : (
                              <div className="space-y-2">
                                {catDocs.map(doc => {
                                  const meta = DOC_STATUS_BADGE[doc.status]
                                  return (
                                    <div key={doc.id} className="rounded-md border bg-white p-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <FileText className="size-4 text-blue-500" />
                                          <span className="text-sm font-medium">{doc.name}</span>
                                        </div>
                                        <Badge variant={meta.variant} className={`text-xs ${meta.className || ''}`}>{meta.label}</Badge>
                                      </div>
                                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Calendar className="size-3" />{formatDate(doc.uploadTime)}</span>
                                        <span className="flex items-center gap-1"><Hash className="size-3" />{doc.size}</span>
                                      </div>
                                      {doc.feedback && (
                                        <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-700">
                                          <span className="font-medium">教师反馈（{doc.feedbackBy}）：</span>{doc.feedback}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="output" className="space-y-4">
                    <h3 className="text-sm font-semibold">成果性文档</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {OUTPUT_CATS.map(cat => {
                        const catDocs = detailDocs.filter(d => d.category === cat)
                        return (
                          <div key={cat} className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">{CATEGORY_META[cat].icon}{CATEGORY_META[cat].label}</div>
                            {catDocs.length === 0 ? (
                              <div className="py-4 text-center text-xs text-muted-foreground">暂无{CATEGORY_META[cat].label}文档</div>
                            ) : (
                              <div className="space-y-2">
                                {catDocs.map(doc => {
                                  const meta = DOC_STATUS_BADGE[doc.status]
                                  return (
                                    <div key={doc.id} className="rounded-md border bg-white p-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <FileText className="size-4 text-emerald-500" />
                                          <span className="text-sm font-medium">{doc.name}</span>
                                        </div>
                                        <Badge variant={meta.variant} className={`text-xs ${meta.className || ''}`}>{meta.label}</Badge>
                                      </div>
                                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Calendar className="size-3" />{formatDate(doc.uploadTime)}</span>
                                        <span className="flex items-center gap-1"><Hash className="size-3" />{doc.size}</span>
                                      </div>
                                      {doc.feedback && (
                                        <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-700">
                                          <span className="font-medium">教师反馈（{doc.feedbackBy}）：</span>{doc.feedback}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="evaluation" className="space-y-4">
                    <div className="rounded-lg border bg-muted/30 p-5">
                      <h3 className="mb-3 text-sm font-semibold">评价记录</h3>
                      <div className="text-sm text-muted-foreground">暂无评价记录</div>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-5">
                      <h3 className="mb-3 text-sm font-semibold">整改意见</h3>
                      <div className="text-sm text-muted-foreground">暂无整改记录</div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
