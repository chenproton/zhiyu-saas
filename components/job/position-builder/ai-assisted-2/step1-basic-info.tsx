'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, Check, X, RefreshCw, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AiProgressDialog } from './ai-progress-dialog'
import { CertificateCard, AddCertificateButton } from './certificate-card'
import { generateAiResults } from '@/lib/ai-mock-data-v2-job'
import type { Position, PositionCertificate, PositionResponsibility } from '@/lib/types/job-source'

const MOCK_INDUSTRIES = [
  '互联网/IT',
  '金融/银行',
  '教育/培训',
  '医疗/健康',
  '制造/工业',
  '零售/电商',
  '物流/运输',
  '房地产/建筑',
  '能源/环保',
  '文化/传媒',
]

const MOCK_MAJORS = [
  '软件工程',
  '计算机科学与技术',
  '人工智能',
  '数据科学',
  '网络工程',
  '信息安全',
  '电子商务',
  '数字媒体',
  '物联网工程',
  '云计算技术',
  '物流管理',
  '供应链管理',
  '工业工程',
  '信息管理与信息系统',
  '工商管理',
  '市场营销',
  '金融学',
  '会计学',
  '人力资源管理',
  '产品设计',
]

export interface Step1Draft extends Position {
  rawResponsibilities: string
  rawRequirements: string
  rawCareerPath: string
}

interface Step1BasicInfoProps {
  draft: Step1Draft
  onUpdate: (data: Partial<Step1Draft>) => void
  onNext: () => void
}

type PolishedField = 'name' | 'shortName' | 'industry' | 'majors' | 'salaryRange' | 'description'
type AiPhase = 'idle' | 'reading' | 'understanding' | 'done'

interface PolishedSet {
  name?: string
  shortName?: string
  industry?: string
  majors?: string[]
  salaryRange?: [number, number]
  description?: string
}

export function Step1BasicInfo({ draft, onUpdate, onNext }: Step1BasicInfoProps) {
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPhase, setAiPhase] = useState<AiPhase>('idle')
  const aiPhaseRef = useRef(aiPhase)
  const [aiProgress, setAiProgress] = useState(0)
  useEffect(() => {
    aiPhaseRef.current = aiPhase
  }, [aiPhase])
  const draftRef = useRef(draft)
  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  const [polished, setPolished] = useState<PolishedSet>({})
  const [suggestedResponsibilities, setSuggestedResponsibilities] = useState<PositionResponsibility[] | null>(null)
  const [suggestedRequirements, setSuggestedRequirements] = useState<string[] | null>(null)
  const [suggestedCareerPath, setSuggestedCareerPath] = useState<string | null>(null)
  const [suggestedCertificates, setSuggestedCertificates] = useState<PositionCertificate[] | null>(null)

  const [quickFillOpen, setQuickFillOpen] = useState(false)
  const [quickFill, setQuickFill] = useState({
    name: '',
    industry: '',
    description: '',
    rawResponsibilities: '',
    rawRequirements: '',
  })

  const validateRequired = () => {
    if (!draft.name.trim()) return '岗位名称'
    if (!draft.industry.trim()) return '所属行业'
    if (!draft.description.trim()) return '岗位简介'
    if (!draft.rawResponsibilities.trim()) return '工作职责'
    if (!draft.rawRequirements.trim()) return '任职要求'
    return null
  }

  const getMissingFields = () => {
    const missing: string[] = []
    if (!draft.name.trim()) missing.push('name')
    if (!draft.industry.trim()) missing.push('industry')
    if (!draft.description.trim()) missing.push('description')
    if (!draft.rawResponsibilities.trim()) missing.push('rawResponsibilities')
    if (!draft.rawRequirements.trim()) missing.push('rawRequirements')
    return missing
  }

  const openQuickFill = () => {
    setQuickFill({
      name: draft.name,
      industry: draft.industry,
      description: draft.description,
      rawResponsibilities: draft.rawResponsibilities,
      rawRequirements: draft.rawRequirements,
    })
    setQuickFillOpen(true)
  }

  const confirmQuickFillAndStartAi = () => {
    onUpdate({
      name: quickFill.name,
      industry: quickFill.industry,
      description: quickFill.description,
      rawResponsibilities: quickFill.rawResponsibilities,
      rawRequirements: quickFill.rawRequirements,
    })
    setQuickFillOpen(false)
    // wait for state update then start real AI assist
    setTimeout(() => runAiAssist(), 0)
  }

  const startAiAssist = () => {
    const missing = getMissingFields()
    if (missing.length > 0) {
      openQuickFill()
      return
    }
    runAiAssist()
  }

  const runAiAssist = () => {
    setAiOpen(true)
    setAiPhase('reading')
    setAiProgress(0)

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 2
      if (progress >= 100) progress = 100
      setAiProgress(progress)
      if (progress >= 45 && aiPhaseRef.current === 'reading') {
        setAiPhase('understanding')
      }
    }, 250)

    setTimeout(() => {
      clearInterval(interval)
      setAiProgress(100)
      setTimeout(() => {
        setAiOpen(false)
        setAiPhase('done')
        applyAiResults()
      }, 400)
    }, 5000)
  }

  const applyAiResults = () => {
    const currentDraft = draftRef.current
    const results = generateAiResults(currentDraft.name, currentDraft.industry, currentDraft.majors)
    setPolished(results.polish)
    setSuggestedResponsibilities(results.responsibilities)
    setSuggestedRequirements(results.requirements)
    setSuggestedCareerPath(results.careerPathVertical)
    setSuggestedCertificates(results.certificates)
  }

  const adoptSuggestions = (type: 'responsibilities' | 'requirements' | 'careerPath' | 'certificates') => {
    if (type === 'responsibilities' && suggestedResponsibilities) {
      onUpdate({ responsibilities: suggestedResponsibilities })
      setSuggestedResponsibilities(null)
    } else if (type === 'requirements' && suggestedRequirements) {
      onUpdate({ requirements: suggestedRequirements })
      setSuggestedRequirements(null)
    } else if (type === 'careerPath' && suggestedCareerPath) {
      onUpdate({ careerPath: suggestedCareerPath })
      setSuggestedCareerPath(null)
    } else if (type === 'certificates' && suggestedCertificates) {
      onUpdate({ certificates: [...draft.certificates, ...suggestedCertificates] })
      setSuggestedCertificates(null)
    }
  }

  const dismissSuggestions = (type: 'responsibilities' | 'requirements' | 'careerPath' | 'certificates') => {
    if (type === 'responsibilities') setSuggestedResponsibilities(null)
    else if (type === 'requirements') setSuggestedRequirements(null)
    else if (type === 'careerPath') setSuggestedCareerPath(null)
    else if (type === 'certificates') setSuggestedCertificates(null)
  }

  const regenerateField = (field: PolishedField | 'responsibilities' | 'requirements' | 'careerPath' | 'certificates') => {
    const currentDraft = draftRef.current
    const results = generateAiResults(currentDraft.name, currentDraft.industry, currentDraft.majors)
    if (field === 'responsibilities') {
      setSuggestedResponsibilities(results.responsibilities)
    } else if (field === 'requirements') {
      setSuggestedRequirements(results.requirements)
    } else if (field === 'careerPath') {
      setSuggestedCareerPath(results.careerPathVertical)
    } else if (field === 'certificates') {
      setSuggestedCertificates(results.certificates)
    } else {
      setPolished((prev) => ({ ...prev, [field]: results.polish[field] }))
    }
  }

  const adoptPolish = (field: PolishedField) => {
    if (field === 'description' && polished.description) {
      onUpdate({ description: polished.description })
    } else if (field === 'name' && polished.name) {
      onUpdate({ name: polished.name })
    } else if (field === 'shortName' && polished.shortName) {
      onUpdate({ shortName: polished.shortName })
    } else if (field === 'industry' && polished.industry) {
      onUpdate({ industry: polished.industry })
    } else if (field === 'majors' && polished.majors) {
      onUpdate({ majors: polished.majors })
    } else if (field === 'salaryRange' && polished.salaryRange) {
      onUpdate({ salaryRange: polished.salaryRange })
    }
    setPolished((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const dismissPolish = (field: PolishedField) => {
    setPolished((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const renderPolishCard = (field: PolishedField, label: string) => {
    let display: React.ReactNode = null
    if (field === 'majors') {
      const majors = polished.majors
      if (!majors || majors.length === 0) return null
      display = (
        <div className="flex flex-wrap gap-1">
          {majors.map((m) => (
            <span key={m} className="px-2 py-0.5 rounded-md bg-white border border-purple-100 text-xs text-gray-700">{m}</span>
          ))}
        </div>
      )
    } else if (field === 'salaryRange') {
      const range = polished.salaryRange
      if (!range) return null
      display = (
        <div className="text-sm text-gray-700">
          {range[0].toLocaleString()} 元/月 - {range[1].toLocaleString()} 元/月
        </div>
      )
    } else {
      const value = polished[field]
      if (value === undefined || value === null || value === '') return null
      display = <div className="text-sm text-gray-700 whitespace-pre-line">{String(value)}</div>
    }

    return (
      <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          <span className="text-xs font-medium text-purple-800">AI 润色建议：{label}</span>
        </div>
        <div className="mb-2">{display}</div>
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => dismissPolish(field)}>
            <X className="h-3 w-3 mr-1" /> 不采纳
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => regenerateField(field)}>
            <RefreshCw className="h-3 w-3 mr-1" /> 重新生成
          </Button>
          <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => adoptPolish(field)}>
            <Check className="h-3 w-3 mr-1" /> 采纳
          </Button>
        </div>
      </div>
    )
  }

  const updateResponsibility = (index: number, name: string) => {
    const next = draft.responsibilities.map((r, i) => (i === index ? { ...r, name } : r))
    onUpdate({ responsibilities: next })
  }

  const removeResponsibility = (index: number) => {
    onUpdate({ responsibilities: draft.responsibilities.filter((_, i) => i !== index) })
  }

  const addResponsibility = () => {
    onUpdate({
      responsibilities: [
        ...draft.responsibilities,
        { id: `resp-manual-${Date.now()}`, name: '', description: '' },
      ],
    })
  }

  const updateRequirement = (index: number, value: string) => {
    const next = draft.requirements.map((r, i) => (i === index ? value : r))
    onUpdate({ requirements: next })
  }

  const removeRequirement = (index: number) => {
    onUpdate({ requirements: draft.requirements.filter((_, i) => i !== index) })
  }

  const addRequirement = () => {
    onUpdate({ requirements: [...draft.requirements, ''] })
  }

  const updateCareerPath = (value: string) => {
    onUpdate({ careerPath: value })
  }

  const updateCertificate = (index: number, cert: PositionCertificate) => {
    const next = [...draft.certificates]
    next[index] = cert
    onUpdate({ certificates: next })
  }

  const removeCertificate = (index: number) => {
    onUpdate({ certificates: draft.certificates.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">步骤一：岗位基础信息</h2>
          <p className="text-sm text-gray-500 mt-0.5">填写基础信息后，点击右上角「AI 辅助编写」让大模型帮您润色、补齐与条目化</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 gap-1"
            onClick={startAiAssist}
          >
            <Sparkles className="h-4 w-4" />
            AI 辅助编写
          </Button>

        </div>
      </div>

      {/* Basic info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基础信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">岗位名称 <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="例如：Java 后端开发工程师"
              />
              {renderPolishCard('name', '岗位名称')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortName">岗位简称</Label>
              <Input
                id="shortName"
                value={draft.shortName}
                onChange={(e) => onUpdate({ shortName: e.target.value })}
                placeholder="例如：Java开发"
              />
              {renderPolishCard('shortName', '岗位简称')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">所属行业 <span className="text-red-500">*</span></Label>
              <Select value={draft.industry} onValueChange={(v) => onUpdate({ industry: v })}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="选择行业" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {renderPolishCard('industry', '所属行业')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">适用专业</Label>
              <Select
                value={draft.majors[0] || ''}
                onValueChange={(v) => onUpdate({ majors: v ? [v] : [] })}
              >
                <SelectTrigger id="major">
                  <SelectValue placeholder="选择专业（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_MAJORS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {renderPolishCard('majors', '关联专业')}
            </div>
          </div>

          <div className="space-y-2">
            <Label>参考薪资（元/月）</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={draft.salaryRange[0] || ''}
                onChange={(e) => onUpdate({ salaryRange: [Number(e.target.value), draft.salaryRange[1]] })}
                placeholder="最低"
                className="w-32"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                value={draft.salaryRange[1] || ''}
                onChange={(e) => onUpdate({ salaryRange: [draft.salaryRange[0], Number(e.target.value)] })}
                placeholder="最高"
                className="w-32"
              />
            </div>
            {renderPolishCard('salaryRange', '薪资范围')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">岗位简介 <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={draft.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="对岗位做简要的背景介绍"
              rows={4}
            />
            {renderPolishCard('description', '岗位简介')}
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities raw input + itemized */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">工作职责 <span className="text-red-500">*</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>原始工作职责描述</Label>
            <Textarea
              value={draft.rawResponsibilities}
              onChange={(e) => onUpdate({ rawResponsibilities: e.target.value })}
              placeholder="请输入工作职责，可以是一句话或一大段话，AI 将帮您拆解为条目..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>条目化工作职责</Label>
            <div className="space-y-2">
              {draft.responsibilities.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Badge variant="outline" className="shrink-0">{index + 1}</Badge>
                  <Input
                    value={item.name}
                    onChange={(e) => updateResponsibility(index, e.target.value)}
                    className="flex-1 text-sm h-8"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeResponsibility(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addResponsibility}>
                + 添加工作职责
              </Button>
            </div>
          </div>

          {suggestedResponsibilities && suggestedResponsibilities.length > 0 && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">AI 建议：工作职责</span>
              </div>
              <div className="space-y-1 mb-3">
                {suggestedResponsibilities.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <Badge variant="outline" className="shrink-0 text-[10px]">{i + 1}</Badge>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => dismissSuggestions('responsibilities')}>
                  <X className="h-3 w-3 mr-1" /> 不采纳
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => regenerateField('responsibilities')}>
                  <RefreshCw className="h-3 w-3 mr-1" /> 重新生成
                </Button>
                <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => adoptSuggestions('responsibilities')}>
                  <Check className="h-3 w-3 mr-1" /> 采纳
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requirements raw input + itemized */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">任职要求 <span className="text-red-500">*</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>原始任职要求描述</Label>
            <Textarea
              value={draft.rawRequirements}
              onChange={(e) => onUpdate({ rawRequirements: e.target.value })}
              placeholder="请输入任职要求，可以是一句话或一大段话，AI 将帮您拆解为条目..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>条目化任职要求</Label>
            <div className="space-y-2">
              {draft.requirements.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline" className="shrink-0">{index + 1}</Badge>
                  <Input
                    value={item}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="flex-1 text-sm h-8"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeRequirement(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addRequirement}>
                + 添加任职要求
              </Button>
            </div>
          </div>

          {suggestedRequirements && suggestedRequirements.length > 0 && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">AI 建议：任职要求</span>
              </div>
              <div className="space-y-1 mb-3">
                {suggestedRequirements.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Badge variant="outline" className="shrink-0 text-[10px]">{i + 1}</Badge>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => dismissSuggestions('requirements')}>
                  <X className="h-3 w-3 mr-1" /> 不采纳
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => regenerateField('requirements')}>
                  <RefreshCw className="h-3 w-3 mr-1" /> 重新生成
                </Button>
                <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => adoptSuggestions('requirements')}>
                  <Check className="h-3 w-3 mr-1" /> 采纳
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Career path */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">晋升路径</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>原始晋升路径描述</Label>
            <Textarea
              value={draft.rawCareerPath}
              onChange={(e) => onUpdate({ rawCareerPath: e.target.value })}
              placeholder="请输入晋升路径，可以是一句话或一大段话，AI 将帮您整理为 A→B→C 的发展路线..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>发展路线</Label>
            <Textarea
              value={draft.careerPath}
              onChange={(e) => updateCareerPath(e.target.value)}
              placeholder="例如：纵向晋升：开发工程师 → 高级开发工程师 → 技术专家 → 架构师 → 技术总监"
              rows={3}
            />
          </div>

          {suggestedCareerPath && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">AI 建议：晋升路径</span>
              </div>
              <div className="mb-3">
                <span className="text-sm text-gray-700">{suggestedCareerPath}</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => dismissSuggestions('careerPath')}>
                  <X className="h-3 w-3 mr-1" /> 不采纳
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => regenerateField('careerPath')}>
                  <RefreshCw className="h-3 w-3 mr-1" /> 重新生成
                </Button>
                <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => adoptSuggestions('careerPath')}>
                  <Check className="h-3 w-3 mr-1" /> 采纳
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">证书推荐</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedCertificates && suggestedCertificates.length > 0 && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">AI 建议：证书推荐</span>
              </div>
              <div className="grid gap-2 mb-3">
                {suggestedCertificates.map((cert) => (
                  <div key={cert.id} className="rounded-lg border border-purple-100 bg-white p-2.5">
                    <p className="text-sm font-medium text-gray-800">{cert.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cert.description}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => dismissSuggestions('certificates')}>
                  <X className="h-3 w-3 mr-1" /> 不采纳
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => regenerateField('certificates')}>
                  <RefreshCw className="h-3 w-3 mr-1" /> 重新生成
                </Button>
                <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => adoptSuggestions('certificates')}>
                  <Check className="h-3 w-3 mr-1" /> 采纳
                </Button>
              </div>
            </div>
          )}
          <div className="grid gap-3">
            {draft.certificates.map((cert, index) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                onChange={(c) => updateCertificate(index, c)}
                onRemove={() => removeCertificate(index)}
              />
            ))}
            <AddCertificateButton onAdd={(cert) => onUpdate({ certificates: [...draft.certificates, cert] })} />
          </div>
        </CardContent>
      </Card>

      <AiProgressDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        title="AI 辅助编写"
        description="大模型正在阅读岗位信息并生成润色、拆解与补齐结果"
        steps={['阅读岗位基础信息', '理解岗位背景与要求']}
        currentStep={aiPhase === 'reading' ? 0 : 1}
        progress={aiProgress}
      />

      <Dialog open={quickFillOpen} onOpenChange={setQuickFillOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl border-gray-200 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-800">
              <Sparkles className="h-5 w-5 text-purple-500" />
              快速补全必填信息
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              以下必填字段尚未填写，请补充后继续使用 AI 辅助编写。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!draft.name.trim() && (
              <div className="space-y-1.5">
                <Label>岗位名称 <span className="text-red-500">*</span></Label>
                <Input
                  value={quickFill.name}
                  onChange={(e) => setQuickFill({ ...quickFill, name: e.target.value })}
                  placeholder="例如：Java 后端开发工程师"
                  className="h-9"
                />
              </div>
            )}

            {!draft.industry.trim() && (
              <div className="space-y-1.5">
                <Label>所属行业 <span className="text-red-500">*</span></Label>
                <Select
                  value={quickFill.industry}
                  onValueChange={(v) => setQuickFill({ ...quickFill, industry: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="选择行业" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!draft.description.trim() && (
              <div className="space-y-1.5">
                <Label>岗位简介 <span className="text-red-500">*</span></Label>
                <Textarea
                  value={quickFill.description}
                  onChange={(e) => setQuickFill({ ...quickFill, description: e.target.value })}
                  placeholder="对岗位做简要的背景介绍"
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}

            {!draft.rawResponsibilities.trim() && (
              <div className="space-y-1.5">
                <Label>工作职责 <span className="text-red-500">*</span></Label>
                <Textarea
                  value={quickFill.rawResponsibilities}
                  onChange={(e) => setQuickFill({ ...quickFill, rawResponsibilities: e.target.value })}
                  placeholder="请输入工作职责，可以是一句话或一大段话..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}

            {!draft.rawRequirements.trim() && (
              <div className="space-y-1.5">
                <Label>任职要求 <span className="text-red-500">*</span></Label>
                <Textarea
                  value={quickFill.rawRequirements}
                  onChange={(e) => setQuickFill({ ...quickFill, rawRequirements: e.target.value })}
                  placeholder="请输入任职要求，可以是一句话或一大段话..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setQuickFillOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 gap-1"
              disabled={
                (!draft.name.trim() && !quickFill.name.trim()) ||
                (!draft.industry.trim() && !quickFill.industry.trim()) ||
                (!draft.description.trim() && !quickFill.description.trim()) ||
                (!draft.rawResponsibilities.trim() && !quickFill.rawResponsibilities.trim()) ||
                (!draft.rawRequirements.trim() && !quickFill.rawRequirements.trim())
              }
              onClick={confirmQuickFillAndStartAi}
            >
              <Sparkles className="h-4 w-4" />
              开始 AI 辅助编写
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
