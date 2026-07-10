"use client"

import { useState, useMemo } from "react"
import { GraduationCap, CheckCircle2, XCircle, Clock, Award, FileCheck, ShieldAlert, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useData } from "@/components/providers/data-provider"
import { useToast } from "@/hooks/use-toast"

export default function StudentGraduationQueryPage() {
  const { graduationQueryResults, rectificationDetails, processEvaluations, appealRecords, createAppealRecord } = useData()
  const { toast } = useToast()

  const [studentId, setStudentId] = useState('')
  const [searchId, setSearchId] = useState('')
  const [certOpen, setCertOpen] = useState(false)
  const [appealOpen, setAppealOpen] = useState(false)
  const [appealForm, setAppealForm] = useState({ type: 'grade' as 'grade' | 'graduation' | 'ability', reason: '' })

  const result = useMemo(() => graduationQueryResults.find((r) => r.studentId === studentId), [graduationQueryResults, studentId])
  const myRects = useMemo(() => rectificationDetails.filter((r) => r.studentId === studentId), [rectificationDetails, studentId])
  const myProcs = useMemo(() => processEvaluations.filter((p) => studentId && p.studentName === result?.studentName), [processEvaluations, studentId, result])
  const myAppeals = useMemo(() => appealRecords.filter((a) => a.studentId === studentId), [appealRecords, studentId])

  const handleSearch = () => { setStudentId(searchId.trim()) }
  const handleAppeal = () => {
    if (result && appealForm.reason.trim()) {
      createAppealRecord({ studentId: result.studentId, studentName: result.studentName, type: appealForm.type, reason: appealForm.reason })
      toast({ title: '申诉已提交，进入复核流程' }); setAppealOpen(false); setAppealForm({ type: 'grade', reason: '' })
    }
  }

  const getGraduationBadge = (status: string) => {
    switch (status) {
      case 'qualified': return <Badge variant="default" className="bg-emerald-500 gap-1"><CheckCircle2 className="size-3" />已达标</Badge>
      case 'unqualified': return <Badge variant="destructive" className="gap-1"><XCircle className="size-3" />未达标</Badge>
      case 'pending': return <Badge variant="secondary" className="gap-1"><Clock className="size-3" />审核中</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3"><GraduationCap className="size-6 text-blue-600" /><h1 className="text-lg font-bold">学生毕业查询</h1></div>
          <Button variant="ghost" size="sm" onClick={() => window.close()}><ArrowLeft className="mr-1 size-4" />返回</Button>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-6">
        <div className="mb-6 flex gap-3">
          <Input placeholder="请输入学号查询毕业状态" value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch}>查询</Button>
        </div>

        {!result ? (
          <div className="rounded-lg border bg-white py-12 text-center text-muted-foreground">请输入学号查询您的毕业状态</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-white p-5">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">学生基础信息</h2>{getGraduationBadge(result.graduationStatus)}</div>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div><span className="text-muted-foreground">学号：</span>{result.studentId}</div>
                <div><span className="text-muted-foreground">姓名：</span>{result.studentName}</div>
                <div><span className="text-muted-foreground">班级：</span>{result.className}</div>
                <div><span className="text-muted-foreground">专业：</span>{result.majorName}</div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-5">
              <h2 className="mb-4 text-base font-semibold">毕业资格进度</h2>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-sm"><span>学分完成</span><span>{result.creditCompleted} / {result.creditRequired}</span></div>
                  <Progress value={(result.creditCompleted / result.creditRequired) * 100} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm"><span>场景达标</span><span>{result.scenePassed} / {result.sceneRequired}</span></div>
                  <Progress value={(result.scenePassed / result.sceneRequired) * 100} className="h-2" />
                </div>
              </div>
            </div>

            {myProcs.length > 0 && (
              <div className="rounded-lg border bg-white p-5">
                <h2 className="mb-3 text-base font-semibold">毕设评价结果</h2>
                <div className="space-y-2">
                  {myProcs.map((proc) => (
                    <div key={proc.id} className="rounded-md bg-muted px-3 py-2 text-sm">
                      <div className="flex justify-between"><span>{proc.phase === 'proposal' ? '开题评价' : proc.phase === 'midterm' ? '中期评价' : '过程评价'}</span><span className="font-medium">{proc.advisorScore}分</span></div>
                      <div className="text-xs text-muted-foreground">{proc.comment}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>毕设综合等级</span><Badge variant="outline">{result.projectGrade || '-'}</Badge>
                </div>
              </div>
            )}

            {myRects.length > 0 && (
              <div className="rounded-lg border bg-white p-5">
                <h2 className="mb-3 text-base font-semibold">整改意见</h2>
                {myRects.map((rect) => (
                  <div key={rect.id} className="mb-2 rounded-md bg-red-50 p-3 text-sm">
                    <div className="font-medium text-red-700">{rect.requirement}</div>
                    <div className="mt-1 text-xs text-muted-foreground">截止日期：{new Intl.DateTimeFormat("zh-CN").format(rect.deadline)}</div>
                    {rect.studentResponse && <div className="mt-1 text-xs text-emerald-600">已回复：{rect.studentResponse}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border bg-white p-5">
              <h2 className="mb-3 text-base font-semibold">能力认证</h2>
              <div className="flex items-center gap-2">
                {result.abilityCertStatus === 'certified' ? <Award className="size-5 text-blue-500" /> : <Clock className="size-5 text-amber-500" />}
                <span className="text-sm">{result.abilityCertStatus === 'certified' ? '已认证' : result.abilityCertStatus === 'pending' ? '审核中' : '未认证'}</span>
              </div>
            </div>

            {myAppeals.length > 0 && (
              <div className="rounded-lg border bg-white p-5">
                <h2 className="mb-3 text-base font-semibold">我的申诉</h2>
                {myAppeals.map((appeal) => (
                  <div key={appeal.id} className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{appeal.type === 'grade' ? '成绩申诉' : appeal.type === 'graduation' ? '毕业申诉' : '能力认证申诉'}</Badge>
                    <span className="text-muted-foreground">{appeal.reason}</span>
                    <Badge variant="secondary">{appeal.status === 'pending' ? '待处理' : appeal.status}</Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCertOpen(true)}><FileCheck className="mr-2 size-4" />毕业证明预览</Button>
              <Button variant="outline" className="flex-1" onClick={() => setAppealOpen(true)}><ShieldAlert className="mr-2 size-4" />结果申诉</Button>
            </div>
          </div>
        )}
      </div>

      {/* 证书预览 */}
      <Dialog open={certOpen} onOpenChange={(open) => !open && setCertOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>毕业证明预览</DialogTitle></DialogHeader>
          {result && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-emerald-50 p-6 text-center">
                <div className="mb-2 text-lg font-bold text-blue-800">学历认定证书</div>
                <div className="text-sm text-blue-600">兹证明 {result.studentName}（{result.studentId}）</div>
                <div className="text-sm text-blue-600">已完成规定学分 {result.creditCompleted}/{result.creditRequired}</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700"><CheckCircle2 className="size-4" />{result.graduationStatus === 'qualified' ? '已达到毕业要求' : '未达到毕业要求'}</div>
              </div>
              <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
                <div className="mb-2 text-lg font-bold text-amber-800">能力认定徽章</div>
                <div className="text-sm text-amber-600">岗位能力认证状态</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700"><Award className="size-4" />{result.abilityCertStatus === 'certified' ? '已认证' : result.abilityCertStatus === 'pending' ? '审核中' : '未认证'}</div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setCertOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 申诉弹窗 */}
      <Dialog open={appealOpen} onOpenChange={(open) => !open && setAppealOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>结果申诉</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>申诉类型</Label>
              <Select value={appealForm.type} onValueChange={(v) => setAppealForm({ ...appealForm, type: v as 'grade' | 'graduation' | 'ability' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="grade">成绩申诉</SelectItem><SelectItem value="graduation">毕业资格申诉</SelectItem><SelectItem value="ability">能力认证申诉</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>申诉理由</Label><Textarea value={appealForm.reason} onChange={(e) => setAppealForm({ ...appealForm, reason: e.target.value })} placeholder="请详细说明申诉理由..." rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAppealOpen(false)}>取消</Button><Button onClick={handleAppeal}><ShieldAlert className="mr-2 size-4" />提交申诉</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
