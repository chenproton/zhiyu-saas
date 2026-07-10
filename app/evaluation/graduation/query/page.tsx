"use client"

import { useState, useMemo } from "react"
import { Search, GraduationCap, CheckCircle2, XCircle, Clock, AlertCircle, Award, FileText, Eye, FileDown, ShieldAlert, FileCheck, MessageSquare, Send } from "lucide-react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useData } from "@/components/providers/data-provider"
import { useToast } from "@/hooks/use-toast"
import type { GraduationQueryResult, AppealRecord } from "@/lib/types"

export default function GraduationQueryPage() {
  const { graduationQueryResults, rectificationDetails, processEvaluations, appealRecords, updateAppealRecord } = useData()
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [graduationStatusFilter, setGraduationStatusFilter] = useState<string>("all")
  const [viewResult, setViewResult] = useState<GraduationQueryResult | null>(null)
  const [certOpen, setCertOpen] = useState(false)
  const [certStudent, setCertStudent] = useState<GraduationQueryResult | null>(null)
  const [exportOpen, setExportOpen] = useState(false)

  const [appealManageOpen, setAppealManageOpen] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyAppeal, setReplyAppeal] = useState<AppealRecord | null>(null)
  const [replyText, setReplyText] = useState('')

  const filteredResults = useMemo(() => {
    let list = [...graduationQueryResults]
    if (graduationStatusFilter !== "all") list = list.filter((r) => r.graduationStatus === graduationStatusFilter)
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((r) => r.studentName.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q) || r.className.toLowerCase().includes(q)) }
    return list
  }, [graduationQueryResults, graduationStatusFilter, search])

  const stats = useMemo(() => {
    const total = graduationQueryResults.length
    return { total, qualified: graduationQueryResults.filter((r) => r.graduationStatus === 'qualified').length, unqualified: graduationQueryResults.filter((r) => r.graduationStatus === 'unqualified').length, pending: graduationQueryResults.filter((r) => r.graduationStatus === 'pending').length, certified: graduationQueryResults.filter((r) => r.abilityCertStatus === 'certified').length }
  }, [graduationQueryResults])

  const studentRects = useMemo(() => (studentId: string) => rectificationDetails.filter((r) => r.studentId === studentId), [rectificationDetails])
  const studentProcs = useMemo(() => (studentId: string) => processEvaluations.filter((p) => p.studentName === filteredResults.find(r => r.studentId === studentId)?.studentName), [processEvaluations, filteredResults])
  const studentAppeals = useMemo(() => (studentId: string) => appealRecords.filter((a) => a.studentId === studentId), [appealRecords])
  const hasAppeal = (studentId: string) => appealRecords.some((a) => a.studentId === studentId)

  const getGraduationBadge = (status: string) => {
    switch (status) {
      case 'qualified': return <Badge variant="default" className="bg-emerald-500 gap-1"><CheckCircle2 className="size-3" />已达标</Badge>
      case 'unqualified': return <Badge variant="destructive" className="gap-1"><XCircle className="size-3" />未达标</Badge>
      case 'pending': return <Badge variant="secondary" className="gap-1"><Clock className="size-3" />审核中</Badge>
    }
  }
  const getAbilityCertBadge = (status: string) => {
    switch (status) {
      case 'certified': return <Badge variant="default" className="bg-blue-500 gap-1"><Award className="size-3" />已认证</Badge>
      case 'uncertified': return <Badge variant="outline" className="text-red-600 gap-1"><AlertCircle className="size-3" />未认证</Badge>
      case 'pending': return <Badge variant="secondary" className="gap-1"><Clock className="size-3" />审核中</Badge>
    }
  }
  const getAppealTypeLabel = (type: string) => {
    switch (type) {
      case 'grade': return '成绩申诉'
      case 'graduation': return '毕业资格申诉'
      case 'ability': return '能力认证申诉'
      default: return type
    }
  }
  const getAppealStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="gap-1"><Clock className="size-3" />待处理</Badge>
      case 'processing': return <Badge variant="default" className="bg-amber-500 gap-1"><Clock className="size-3" />处理中</Badge>
      case 'resolved': return <Badge variant="default" className="bg-emerald-500 gap-1"><CheckCircle2 className="size-3" />已处理</Badge>
      case 'rejected': return <Badge variant="destructive" className="gap-1"><XCircle className="size-3" />已驳回</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const openReply = (appeal: AppealRecord) => {
    setReplyAppeal(appeal)
    setReplyText(appeal.reason)
    setReplyOpen(true)
  }
  const handleReply = () => {
    if (replyAppeal && replyText.trim()) {
      updateAppealRecord(replyAppeal.id, { status: 'resolved' })
      toast({ title: '申诉已回复，状态更新为已处理' })
      setReplyOpen(false)
      setReplyAppeal(null)
      setReplyText('')
    }
  }

  const formatDate = (date: Date) => new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date)

  return (
    <div className="px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">毕业查询管理</h1><p className="text-muted-foreground">查询学生毕业资格审查结果、毕设评价结果及整改状态</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setExportOpen(true)}><FileDown className="mr-2 size-4" />导出报表</Button>
          <Button variant="outline" onClick={() => setAppealManageOpen(true)}><ShieldAlert className="mr-2 size-4" />结果申诉</Button>
          <Button variant="outline" onClick={() => window.open('/graduation-project/student/query', '_blank')}><GraduationCap className="mr-2 size-4" />学生查询入口</Button>
        </div>
      </div>
      <div className="mb-4 flex gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-lg border bg-white px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-50"><GraduationCap className="size-4 text-blue-600" /></div>
          <div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">毕业状态分布</div><div className="flex items-center gap-2 text-xs"><span>已达标 <strong className="text-emerald-600">{stats.qualified}</strong></span><span className="text-gray-300">|</span><span>未达标 <strong className="text-red-600">{stats.unqualified}</strong></span><span className="text-gray-300">|</span><span>审核中 <strong className="text-amber-600">{stats.pending}</strong></span></div></div>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-lg border bg-white px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-emerald-50"><Award className="size-4 text-emerald-600" /></div>
          <div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">能力认证</div><div className="flex items-center gap-2 text-xs"><span>已认证 <strong className="text-emerald-600">{stats.certified}</strong></span><span className="text-gray-300">|</span><span>总计 <strong className="text-foreground">{stats.total}</strong></span></div></div>
        </div>
      </div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索姓名、学号或班级..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={graduationStatusFilter} onValueChange={setGraduationStatusFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="全部毕业状态" /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">全部毕业状态</SelectItem><SelectItem value="qualified">已达标</SelectItem><SelectItem value="unqualified">未达标</SelectItem><SelectItem value="pending">审核中</SelectItem></SelectGroup></SelectContent></Select>
      </div>
      <div className="rounded-lg border bg-white px-4 py-3">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="w-[100px]">学号</TableHead><TableHead className="w-[100px]">姓名</TableHead><TableHead className="w-[160px]">班级</TableHead><TableHead className="w-[120px]">专业</TableHead><TableHead className="w-[120px]">学分完成</TableHead><TableHead className="w-[120px]">场景达标</TableHead><TableHead className="w-[90px]">毕设等级</TableHead><TableHead className="w-[100px]">毕业状态</TableHead><TableHead className="w-[100px]">能力认证</TableHead><TableHead className="w-[80px]">整改数</TableHead><TableHead className="sticky right-0 w-[180px] bg-white text-right">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (<TableRow><TableCell colSpan={11} className="h-24 text-center text-muted-foreground">暂无查询记录</TableCell></TableRow>) : (filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell><span className="text-sm text-muted-foreground">{result.studentId}</span></TableCell>
                  <TableCell><span className="text-sm font-medium">{result.studentName}</span></TableCell>
                  <TableCell><span className="text-sm">{result.className}</span></TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{result.majorName}</span></TableCell>
                  <TableCell><div className="w-24"><div className="mb-1 flex justify-between text-xs"><span>{result.creditCompleted}/{result.creditRequired}</span></div><Progress value={(result.creditCompleted / result.creditRequired) * 100} className="h-1.5" /></div></TableCell>
                  <TableCell><span className="text-sm">{result.scenePassed} / {result.sceneRequired}</span></TableCell>
                  <TableCell>{result.projectGrade ? (<Badge variant="outline" className="text-xs font-normal">{result.projectGrade}</Badge>) : (<span className="text-sm text-muted-foreground">-</span>)}</TableCell>
                  <TableCell>{getGraduationBadge(result.graduationStatus)}</TableCell>
                  <TableCell>{getAbilityCertBadge(result.abilityCertStatus)}</TableCell>
                  <TableCell>{result.rectificationCount > 0 ? (<Badge variant="destructive" className="text-xs">{result.rectificationCount}</Badge>) : (<span className="text-sm text-muted-foreground">-</span>)}</TableCell>
                  <TableCell className="sticky right-0 bg-white text-right">
                    <div className="flex items-center justify-end gap-1">
                      {hasAppeal(result.studentId) && (
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-amber-600" onClick={() => { setViewResult(result) }}>
                          <ShieldAlert className="size-3" />查看申诉
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setViewResult(result)}><Eye className="size-3" />详情</Button>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-amber-600" onClick={() => { setCertStudent(result); setCertOpen(true) }}><FileCheck className="size-3" />证明</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 查看详情弹窗 */}
      <Dialog open={!!viewResult} onOpenChange={(open) => !open && setViewResult(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>毕业状态详情</DialogTitle></DialogHeader>
          {viewResult && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">学号</span><span>{viewResult.studentId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">姓名</span><span className="font-medium">{viewResult.studentName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">班级</span><span>{viewResult.className}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">专业</span><span>{viewResult.majorName}</span></div>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 text-sm font-semibold">学历认定进度</h4>
                <div className="space-y-3">
                  <div><div className="mb-1 flex justify-between text-xs"><span>学分完成</span><span>{viewResult.creditCompleted} / {viewResult.creditRequired}</span></div><Progress value={(viewResult.creditCompleted / viewResult.creditRequired) * 100} className="h-2" /></div>
                  <div><div className="mb-1 flex justify-between text-xs"><span>场景达标</span><span>{viewResult.scenePassed} / {viewResult.sceneRequired}</span></div><Progress value={(viewResult.scenePassed / viewResult.sceneRequired) * 100} className="h-2" /></div>
                </div>
              </div>
              {studentProcs(viewResult.studentId).length > 0 && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 text-sm font-semibold">毕设各阶段评价</h4>
                  <div className="space-y-2">
                    {studentProcs(viewResult.studentId).map((proc) => (
                      <div key={proc.id} className="flex justify-between text-sm"><span>{proc.phase === 'proposal' ? '开题评价' : proc.phase === 'midterm' ? '中期评价' : '过程评价'}</span><span className="text-muted-foreground">{proc.advisorScore}分 · {proc.comment}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {studentRects(viewResult.studentId).length > 0 && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 text-sm font-semibold">整改意见</h4>
                  <div className="space-y-2">
                    {studentRects(viewResult.studentId).map((rect) => (
                      <div key={rect.id} className="rounded-md bg-red-50 px-3 py-2 text-sm">
                        <div className="font-medium text-red-700">{rect.requirement}</div>
                        <div className="text-xs text-muted-foreground mt-1">截止日期：{formatDate(rect.deadline)}</div>
                        {rect.studentResponse && <div className="text-xs text-emerald-600 mt-1">学生回复：{rect.studentResponse}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {studentAppeals(viewResult.studentId).length > 0 && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 text-sm font-semibold">申诉记录</h4>
                  <div className="space-y-2">
                    {studentAppeals(viewResult.studentId).map((appeal) => (
                      <div key={appeal.id} className="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{getAppealTypeLabel(appeal.type)}</Badge>
                          <span className="text-muted-foreground">{appeal.reason}</span>
                        </div>
                        {getAppealStatusBadge(appeal.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">毕设等级</span><Badge variant="outline">{viewResult.projectGrade || '-'}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">毕业状态</span>{getGraduationBadge(viewResult.graduationStatus)}</div>
                <div className="flex justify-between"><span className="text-muted-foreground">能力认证</span>{getAbilityCertBadge(viewResult.abilityCertStatus)}</div>
                <div className="flex justify-between"><span className="text-muted-foreground">整改次数</span><span>{viewResult.rectificationCount}</span></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewResult(null)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 申诉管理列表弹窗 */}
      <Dialog open={appealManageOpen} onOpenChange={(open) => !open && setAppealManageOpen(false)}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>学生申诉管理</DialogTitle></DialogHeader>
          <div className="py-2">
            {appealRecords.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">暂无申诉记录</div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">学号</TableHead>
                      <TableHead className="w-[100px]">姓名</TableHead>
                      <TableHead className="w-[120px]">申诉类型</TableHead>
                      <TableHead>申诉理由</TableHead>
                      <TableHead className="w-[120px]">提交时间</TableHead>
                      <TableHead className="w-[100px]">状态</TableHead>
                      <TableHead className="w-[120px] text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appealRecords.map((appeal) => (
                      <TableRow key={appeal.id}>
                        <TableCell><span className="text-sm text-muted-foreground">{appeal.studentId}</span></TableCell>
                        <TableCell><span className="text-sm font-medium">{appeal.studentName}</span></TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{getAppealTypeLabel(appeal.type)}</Badge></TableCell>
                        <TableCell><span className="text-sm text-muted-foreground">{appeal.reason}</span></TableCell>
                        <TableCell><span className="text-xs text-muted-foreground">{formatDate(appeal.createdAt)}</span></TableCell>
                        <TableCell>{getAppealStatusBadge(appeal.status)}</TableCell>
                        <TableCell className="text-right">
                          {appeal.status === 'pending' ? (
                            <Button size="sm" className="h-7 text-xs" onClick={() => openReply(appeal)}><MessageSquare className="mr-1 size-3" />回复</Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">已处理</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAppealManageOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 回复申诉弹窗 */}
      <Dialog open={replyOpen} onOpenChange={(open) => !open && setReplyOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>回复学生申诉</DialogTitle></DialogHeader>
          {replyAppeal && (
            <div className="py-2 space-y-3">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">学生</span><span className="font-medium">{replyAppeal.studentName}（{replyAppeal.studentId}）</span></div>
                <div className="flex justify-between mt-1"><span className="text-muted-foreground">申诉类型</span><Badge variant="outline" className="text-xs">{getAppealTypeLabel(replyAppeal.type)}</Badge></div>
              </div>
              <div className="rounded-md bg-amber-50 p-3 text-sm">
                <div className="font-medium text-amber-800 mb-1">申诉理由</div>
                <div className="text-amber-700">{replyAppeal.reason}</div>
              </div>
              <div className="grid gap-2">
                <Label>回复内容</Label>
                <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="请输入回复内容..." rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyOpen(false)}>取消</Button>
            <Button onClick={handleReply}><Send className="mr-2 size-4" />确认回复</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 毕业证明预览弹窗 */}
      <Dialog open={certOpen} onOpenChange={(open) => !open && setCertOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>毕业证明预览</DialogTitle></DialogHeader>
          {certStudent && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-emerald-50 p-6 text-center">
                <div className="mb-2 text-lg font-bold text-blue-800">学历认定证书</div>
                <div className="text-sm text-blue-600">兹证明 {certStudent.studentName}（{certStudent.studentId}）</div>
                <div className="text-sm text-blue-600">已完成规定学分 {certStudent.creditCompleted}/{certStudent.creditRequired}</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="size-4" />{certStudent.graduationStatus === 'qualified' ? '已达到毕业要求' : '未达到毕业要求'}
                </div>
              </div>
              <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
                <div className="mb-2 text-lg font-bold text-amber-800">能力认定徽章</div>
                <div className="text-sm text-amber-600">岗位能力认证状态</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
                  <Award className="size-4" />{certStudent.abilityCertStatus === 'certified' ? '已认证' : certStudent.abilityCertStatus === 'pending' ? '审核中' : '未认证'}
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setCertOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导出报表弹窗 */}
      <Dialog open={exportOpen} onOpenChange={(open) => !open && setExportOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>导出毕业查询报表</DialogTitle></DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3"><FileText className="size-5 text-blue-500" /><div><div className="text-sm font-medium">Excel 报表</div><div className="text-xs text-muted-foreground">包含所有学生的毕业状态、学分、场景达标、毕设等级</div></div></div>
              <div className="flex items-center gap-3"><FileText className="size-5 text-emerald-500" /><div><div className="text-sm font-medium">PDF 汇总报告</div><div className="text-xs text-muted-foreground">包含统计图表和详细分析</div></div></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button><Button onClick={() => { toast({ title: '报表导出成功' }); setExportOpen(false) }}><FileDown className="mr-2 size-4" />确认导出</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
