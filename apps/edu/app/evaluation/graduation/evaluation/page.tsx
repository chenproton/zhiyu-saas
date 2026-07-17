"use client"

import { useState, useMemo } from "react"
import { Search, Award, CheckCircle2, Clock, Star, TrendingUp, Eye, Pencil, Settings, Send, ClipboardCheck, Bookmark, Lightbulb, Sparkles, FileCheck } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import { useData } from "@/components/providers/data-provider"
import { useToast } from "@/hooks/use-toast"
import type { GraduationProjectEvaluation, EvaluationGrade, EvaluationStandard } from "@/lib/types"

const GRADE_LABELS: Record<EvaluationGrade, string> = { A: '优秀', B: '良好', C: '中等', D: '及格', E: '不及格' }

interface EvalScores {
  abilityScore: number
  qualityScore: number
  processScore: number
  finalScore: number
}

function defaultScores(): EvalScores {
  return { abilityScore: 0, qualityScore: 0, processScore: 0, finalScore: 0 }
}

function calcTotal(scores: EvalScores) {
  return scores.abilityScore * 0.3 + scores.qualityScore * 0.2 + scores.processScore * 0.2 + scores.finalScore * 0.3
}

function scoreToGrade(score: number): EvaluationGrade {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'E'
}

export default function GraduationProjectEvaluationPage() {
  const { graduationProjectEvaluations, evaluationStandards, positionsList, updateGraduationProjectEvaluation } = useData()
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [viewEval, setViewEval] = useState<GraduationProjectEvaluation | null>(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [configStandard, setConfigStandard] = useState<EvaluationStandard | null>(null)

  const [evalOpen, setEvalOpen] = useState(false)
  const [evalItem, setEvalItem] = useState<GraduationProjectEvaluation | null>(null)
  const [advisorScores, setAdvisorScores] = useState<EvalScores>(defaultScores())
  const [mentorScores, setMentorScores] = useState<EvalScores>(defaultScores())
  const [defenseScores, setDefenseScores] = useState<EvalScores>(defaultScores())
  const [comprehensiveGrade, setComprehensiveGrade] = useState<EvaluationGrade>('C')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmEval, setConfirmEval] = useState<GraduationProjectEvaluation | null>(null)
  const [syncToDiploma, setSyncToDiploma] = useState(false)
  const [syncToPortrait, setSyncToPortrait] = useState(false)
  const [markBenchmark, setMarkBenchmark] = useState(false)

  const filteredEvaluations = useMemo(() => {
    let list = [...graduationProjectEvaluations]
    if (gradeFilter !== "all") list = list.filter((e) => e.comprehensiveGrade === gradeFilter)
    if (statusFilter !== "all") list = list.filter((e) => e.status === statusFilter)
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((e) => e.topicName.toLowerCase().includes(q) || e.studentName.toLowerCase().includes(q)) }
    return list.sort((a, b) => b.evaluationTime.getTime() - a.evaluationTime.getTime())
  }, [graduationProjectEvaluations, gradeFilter, statusFilter, search])

  const stats = useMemo(() => {
    const total = graduationProjectEvaluations.length
    const completed = graduationProjectEvaluations.filter((e) => e.status === 'completed').length
    const pending = graduationProjectEvaluations.filter((e) => e.status === 'pending').length
    const excellent = graduationProjectEvaluations.filter((e) => e.isExcellent).length
    const avgAdvisor = total > 0 ? Math.round(graduationProjectEvaluations.reduce((sum, e) => sum + e.advisorScore, 0) / total) : 0
    return { total, completed, pending, excellent, avgAdvisor }
  }, [graduationProjectEvaluations])

  const openEval = (item: GraduationProjectEvaluation) => {
    setEvalItem(item)
    setAdvisorScores({ abilityScore: Math.round(item.advisorScore * 0.85), qualityScore: Math.round(item.advisorScore * 0.8), processScore: Math.round(item.advisorScore * 0.9), finalScore: Math.round(item.advisorScore * 0.88) })
    setMentorScores({ abilityScore: item.enterpriseScore ? Math.round(item.enterpriseScore * 0.85) : 0, qualityScore: item.enterpriseScore ? Math.round(item.enterpriseScore * 0.8) : 0, processScore: item.enterpriseScore ? Math.round(item.enterpriseScore * 0.9) : 0, finalScore: item.enterpriseScore ? Math.round(item.enterpriseScore * 0.88) : 0 })
    setDefenseScores({ abilityScore: item.defenseScore ? Math.round(item.defenseScore * 0.85) : 0, qualityScore: item.defenseScore ? Math.round(item.defenseScore * 0.8) : 0, processScore: item.defenseScore ? Math.round(item.defenseScore * 0.9) : 0, finalScore: item.defenseScore ? Math.round(item.defenseScore * 0.88) : 0 })
    setComprehensiveGrade(item.comprehensiveGrade)
    setEvalOpen(true)
  }

  const autoCalculate = () => {
    const advisorTotal = calcTotal(advisorScores)
    const mentorTotal = mentorScores.finalScore > 0 ? calcTotal(mentorScores) : advisorTotal
    const defenseTotal = defenseScores.finalScore > 0 ? calcTotal(defenseScores) : advisorTotal
    const weighted = advisorTotal * 0.4 + mentorTotal * 0.3 + defenseTotal * 0.3
    const grade = scoreToGrade(weighted)
    setComprehensiveGrade(grade)
    toast({ title: `综合等级：${GRADE_LABELS[grade]}（加权 ${weighted.toFixed(1)} 分）` })
  }

  const handleSubmitEval = () => {
    if (evalItem) {
      const advisorTotal = calcTotal(advisorScores)
      const mentorTotal = mentorScores.finalScore > 0 ? calcTotal(mentorScores) : undefined
      const defenseTotal = defenseScores.finalScore > 0 ? calcTotal(defenseScores) : undefined
      updateGraduationProjectEvaluation(evalItem.id, {
        advisorScore: Math.round(advisorTotal),
        enterpriseScore: mentorTotal ? Math.round(mentorTotal) : undefined,
        defenseScore: defenseTotal ? Math.round(defenseTotal) : undefined,
        comprehensiveGrade,
      })
      toast({ title: '评价已提交' })
      setEvalOpen(false)
      setConfirmEval({ ...evalItem, advisorScore: Math.round(advisorTotal), enterpriseScore: mentorTotal ? Math.round(mentorTotal) : undefined, defenseScore: defenseTotal ? Math.round(defenseTotal) : undefined, comprehensiveGrade })
      setSyncToDiploma(false)
      setSyncToPortrait(false)
      setMarkBenchmark(false)
      setConfirmOpen(true)
    }
  }

  const handleConfirm = () => {
    if (confirmEval) {
      const parts: string[] = []
      if (syncToDiploma) parts.push('学历认定模块')
      if (syncToPortrait) parts.push('能力画像模块')
      if (markBenchmark) {
        updateGraduationProjectEvaluation(confirmEval.id, { isExcellent: true })
        parts.push('标杆案例')
      }
      toast({ title: parts.length > 0 ? `已同步/标记：${parts.join('、')}` : '评价结果已确认' })
      setConfirmOpen(false)
      setConfirmEval(null)
    }
  }

  const getGradeBadge = (grade: EvaluationGrade) => {
    const colors: Record<EvaluationGrade, string> = { A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-amber-500', D: 'bg-orange-500', E: 'bg-red-500' }
    return <Badge variant="default" className={`${colors[grade]} gap-1`}>{GRADE_LABELS[grade]}</Badge>
  }

  const ScoreTab = ({
    title, icon, scores, onChange, weight,
  }: {
    title: string; icon: React.ReactNode; scores: EvalScores; onChange: (s: EvalScores) => void; weight: number
  }) => {
    const total = calcTotal(scores)
    return (
      <div className="space-y-4">
        {/* a. 能力点权重配置 */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="size-4 text-blue-600" />岗位能力模型引用与权重配置</div>
          <div className="rounded-md border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 text-center">
            <Lightbulb className="mx-auto mb-2 size-8 text-blue-300" />
            <p className="text-sm text-blue-700 font-medium">岗位能力模型能力点权重配置区域</p>
            <p className="text-xs text-blue-600 mt-1">引用岗位能力模型中的能力点，配置各能力点在毕设评价中的权重占比（待开发）</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>能力达成度评分（30%）</Label><Input type="number" min={0} max={100} value={scores.abilityScore} onChange={(e) => onChange({ ...scores, abilityScore: Number(e.target.value) })} /></div>
          </div>
        </div>

        {/* b. 素养类评价 */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="size-4 text-purple-600" />素养类评价——岗位测评规则库</div>
          <div className="rounded-md border-2 border-dashed border-purple-200 bg-purple-50/50 p-6 text-center">
            <Sparkles className="mx-auto mb-2 size-8 text-purple-300" />
            <p className="text-sm text-purple-700 font-medium">素养类评价规则库引用区域</p>
            <p className="text-xs text-purple-600 mt-1">引用岗位测评规则库中的素养维度，如：口语表达能力-清晰/流畅/优秀、团队协作-主动/配合/引领（待开发）</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>素养评价得分（20%）</Label><Input type="number" min={0} max={100} value={scores.qualityScore} onChange={(e) => onChange({ ...scores, qualityScore: Number(e.target.value) })} /></div>
          </div>
        </div>

        {/* c. 过程性评价 */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><ClipboardCheck className="size-4 text-amber-600" />过程性评价——阶段性评价汇总</div>
          <div className="rounded-md border-2 border-dashed border-amber-200 bg-amber-50/50 p-6 text-center">
            <ClipboardCheck className="mx-auto mb-2 size-8 text-amber-300" />
            <p className="text-sm text-amber-700 font-medium">过程性评价阶段性评价区域</p>
            <p className="text-xs text-amber-600 mt-1">汇总开题评价、中期检查、指导过程中的阶段性评价结果，自动加权计算过程性得分（待开发）</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>过程性评价得分（20%）</Label><Input type="number" min={0} max={100} value={scores.processScore} onChange={(e) => onChange({ ...scores, processScore: Number(e.target.value) })} /></div>
          </div>
        </div>

        {/* d. 终结性评价 */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><FileCheck className="size-4 text-emerald-600" />终结性评价——成果与答辩</div>
          <div className="rounded-md border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center">
            <FileCheck className="mx-auto mb-2 size-8 text-emerald-300" />
            <p className="text-sm text-emerald-700 font-medium">终结性评价区域</p>
            <p className="text-xs text-emerald-600 mt-1">成果评阅、答辩评价、综合等级评定，支持多维度终结性评价打分（待开发）</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>终结性评价得分（30%）</Label><Input type="number" min={0} max={100} value={scores.finalScore} onChange={(e) => onChange({ ...scores, finalScore: Number(e.target.value) })} /></div>
          </div>
        </div>

        {/* 该主体汇总 */}
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">{icon}<span className="text-sm font-semibold">{title}评分汇总</span></div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{total.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">权重 {weight * 100}%</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">能力达成度({scores.abilityScore}×30%) + 素养评价({scores.qualityScore}×20%) + 过程性评价({scores.processScore}×20%) + 终结性评价({scores.finalScore}×30%)</div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">毕设评价管理</h1><p className="text-muted-foreground">配置评价标准，管理多主体评价流程，汇总综合评定结果</p></div>
        <Button variant="outline" onClick={() => { setConfigStandard(evaluationStandards[0] || null); setConfigOpen(true) }}><Settings className="mr-2 size-4" />评价标准配置</Button>
      </div>
      <div className="mb-4 flex gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-lg border bg-white px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-50"><Award className="size-4 text-blue-600" /></div>
          <div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">评价概况</div><div className="flex items-center gap-2 text-xs"><span>总数 <strong className="text-foreground">{stats.total}</strong></span><span className="text-gray-300">|</span><span>已完成 <strong className="text-emerald-600">{stats.completed}</strong></span><span className="text-gray-300">|</span><span>待评价 <strong className="text-amber-600">{stats.pending}</strong></span></div></div>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-lg border bg-white px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-emerald-50"><Star className="size-4 text-emerald-600" /></div>
          <div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">优秀毕设</div><div className="flex items-center gap-2 text-xs"><span>标杆案例 <strong className="text-emerald-600">{stats.excellent}</strong></span></div></div>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-lg border bg-white px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-amber-50"><TrendingUp className="size-4 text-amber-600" /></div>
          <div className="min-w-0 flex-1"><div className="text-xs text-muted-foreground">平均指导分</div><div className="flex items-center gap-2 text-xs"><span>均分 <strong className="text-amber-600">{stats.avgAdvisor}</strong></span></div></div>
        </div>
      </div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索选题或学生..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={gradeFilter} onValueChange={setGradeFilter}><SelectTrigger className="w-[140px]"><SelectValue placeholder="全部等级" /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">全部等级</SelectItem><SelectItem value="A">优秀</SelectItem><SelectItem value="B">良好</SelectItem><SelectItem value="C">中等</SelectItem><SelectItem value="D">及格</SelectItem><SelectItem value="E">不及格</SelectItem></SelectGroup></SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[140px]"><SelectValue placeholder="全部状态" /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">全部状态</SelectItem><SelectItem value="completed">已完成</SelectItem><SelectItem value="pending">待评价</SelectItem></SelectGroup></SelectContent></Select>
      </div>
      <div className="rounded-lg border bg-white px-4 py-3">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="w-[260px]">选题名称</TableHead><TableHead className="w-[90px]">学生</TableHead><TableHead className="w-[90px]">指导教师评分</TableHead><TableHead className="w-[90px]">企业导师评分</TableHead><TableHead className="w-[90px]">答辩评分</TableHead><TableHead className="w-[90px]">综合等级</TableHead><TableHead className="w-[90px]">状态</TableHead><TableHead className="sticky right-0 w-[200px] bg-white text-right">操作</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredEvaluations.length === 0 ? (<TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">暂无评价记录</TableCell></TableRow>) : (filteredEvaluations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><div className="text-sm font-medium">{item.topicName}</div></TableCell>
                  <TableCell><span className="text-sm">{item.studentName}</span></TableCell>
                  <TableCell><span className="text-sm font-semibold">{item.advisorScore}</span></TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{item.enterpriseScore ?? '-'}</span></TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{item.defenseScore || '-'}</span></TableCell>
                  <TableCell>{getGradeBadge(item.comprehensiveGrade)}</TableCell>
                  <TableCell>{item.status === 'completed' ? (<Badge variant="default" className="bg-emerald-500 gap-1"><CheckCircle2 className="size-3" />已完成</Badge>) : (<Badge variant="secondary" className="gap-1"><Clock className="size-3" />待评价</Badge>)}</TableCell>
                  <TableCell className="sticky right-0 bg-white text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewEval(item)}>
                          详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEval(item)}>
                          评价
                        </DropdownMenuItem>
                        {item.status === 'completed' && (
                          <DropdownMenuItem onClick={() => { setConfirmEval(item); setSyncToDiploma(false); setSyncToPortrait(false); setMarkBenchmark(false); setConfirmOpen(true) }}>
                            认定
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {item.isExcellent && (<Badge variant="outline" className="text-xs text-amber-600 gap-1"><Bookmark className="size-3" />标杆</Badge>)}
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 查看详情弹窗 */}
      <Dialog open={!!viewEval} onOpenChange={(open) => !open && setViewEval(null)}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>评价详情</DialogTitle></DialogHeader>
          {viewEval && (
            <div className="space-y-3 py-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">选题名称</span><span className="font-medium">{viewEval.topicName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">学生</span><span>{viewEval.studentName} ({viewEval.studentId})</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">指导教师评分</span><span className="font-semibold">{viewEval.advisorScore}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">企业导师评分</span><span>{viewEval.enterpriseScore ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">答辩评分</span><span>{viewEval.defenseScore || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">综合等级</span>{getGradeBadge(viewEval.comprehensiveGrade)}</div>
              <div className="flex justify-between"><span className="text-muted-foreground">优秀案例</span><span>{viewEval.isExcellent ? '是' : '否'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">状态</span><span>{viewEval.status === 'completed' ? '已完成' : '待评价'}</span></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewEval(null)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 评价弹窗 */}
      <Dialog open={evalOpen} onOpenChange={(open) => !open && setEvalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提交评价 — {evalItem?.topicName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
              <ClipboardCheck className="mx-auto mb-3 size-10 text-blue-300" />
              <p className="text-sm text-blue-700 font-medium">参考场景/任务中的现场评审功能，对学生提交的毕设档案进行测评</p>
              <p className="text-xs text-blue-600 mt-2">此处将集成现场评审模块，支持对学生提交的过程性文档、成果性文档进行在线批阅与评分（待开发）</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvalOpen(false)}>取消</Button>
            <Button onClick={handleSubmitEval}><CheckCircle2 className="mr-2 size-4" />提交评价</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 评价标准配置弹窗 */}
      <Dialog open={configOpen} onOpenChange={(open) => !open && setConfigOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>评价标准配置</DialogTitle></DialogHeader>
          <div className="py-4">
            <div className="mb-3">
              <Label>关联岗位</Label>
              <Select value={configStandard?.id || ''} onValueChange={(v) => setConfigStandard(evaluationStandards.find((s) => s.id === v) || null)}>
                <SelectTrigger><SelectValue placeholder="选择岗位" /></SelectTrigger>
                <SelectContent>{positionsList.map((pos) => (<SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            {configStandard && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">评价维度与权重</h4>
                {configStandard.dimensions.map((dim, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <Input value={dim.name} readOnly />
                    <Input value={dim.weight} readOnly />
                    <Input value={dim.maxScore} readOnly />
                  </div>
                ))}
                <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">注：权重总和为100%，评价时按此权重自动计算综合得分。</div>
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setConfigOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 认定弹窗 - 可勾选同步选项 */}
      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>评价结果认定</DialogTitle></DialogHeader>
          {confirmEval && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="flex justify-between"><span>学生</span><span className="font-medium">{confirmEval.studentName}</span></div>
                <div className="flex justify-between mt-1"><span>综合等级</span>{getGradeBadge(confirmEval.comprehensiveGrade)}</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox id="sync-diploma" checked={syncToDiploma} onCheckedChange={(v) => setSyncToDiploma(v === true)} />
                  <div className="grid gap-1">
                    <Label htmlFor="sync-diploma" className="text-sm font-medium cursor-pointer">同步至学历认定模块</Label>
                    <p className="text-xs text-muted-foreground">毕设评价等级将计入毕业学分审核</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox id="sync-portrait" checked={syncToPortrait} onCheckedChange={(v) => setSyncToPortrait(v === true)} />
                  <div className="grid gap-1">
                    <Label htmlFor="sync-portrait" className="text-sm font-medium cursor-pointer">同步至能力画像模块</Label>
                    <p className="text-xs text-muted-foreground">涉及的能力点测评结果将更新学生岗位胜任力画像</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox id="mark-benchmark" checked={markBenchmark} onCheckedChange={(v) => setMarkBenchmark(v === true)} />
                  <div className="grid gap-1">
                    <Label htmlFor="mark-benchmark" className="text-sm font-medium cursor-pointer">标记为标杆案例</Label>
                    <p className="text-xs text-muted-foreground">将此优秀毕设作为标杆案例进入平台案例资源库</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>取消</Button>
            <Button onClick={handleConfirm}><Send className="mr-2 size-4" />确认认定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
