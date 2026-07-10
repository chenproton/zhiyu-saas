'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/lib/stores/data-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Check, ArrowRight, ArrowLeft, Sparkles, Bot, Save, Eye, ImagePlus, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Step1BasicInfo, type Step1Draft } from '@/components/job/position-builder/ai-assisted-2/step1-basic-info'
import { Step2AbilityModel } from '@/components/job/position-builder/ai-assisted-2/step2-ability-model'
import { Step3ResultTable } from '@/components/job/position-builder/ai-assisted-2/step3-result-table'
import type { Position } from '@/lib/types/job-source'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const CURRENT_USER = { id: 'user-1', name: '张建设' }

const DEFAULT_DRAFT: Step1Draft = {
  id: `draft-new-${Date.now()}`,
  batchId: '',
  version: 'V1.0',
  status: 'draft',
  name: '',
  shortName: '',
  industry: '',
  majors: [],
  positionType: 'enterprise',
  salaryRange: [0, 0],
  certificates: [],
  description: '',
  responsibilities: [],
  requirements: [],
  careerPath: '',
  abilityModel: { nodes: [], edges: [] },
  abilityBindings: [],
  abilityDomains: [],
  competencyConfig: [],
  createdBy: CURRENT_USER.id,
  collaborators: [CURRENT_USER.id],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  favoriteCount: 0,
  rawResponsibilities: '',
  rawRequirements: '',
  rawCareerPath: '',
}

type WizardStep = 'basic' | 'ability' | 'result'

const steps = [
  { id: 'basic' as WizardStep, label: '基础信息润色', num: 1 },
  { id: 'ability' as WizardStep, label: '能力模型配置', num: 2 },
  { id: 'result' as WizardStep, label: '结果汇总', num: 3 },
]

export default function AiAssisted2NewPositionPage() {
  const router = useRouter()
  const { addPosition, batches } = useData()
  const [step, setStep] = useState<WizardStep>('basic')
  const [draft, setDraft] = useState<Step1Draft>({ ...DEFAULT_DRAFT })
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [coverRegenOpen, setCoverRegenOpen] = useState(false)
  const [coverRegenPrompt, setCoverRegenPrompt] = useState('')
  const [coverRegenLoading, setCoverRegenLoading] = useState(false)
  const [coverRegenProgress, setCoverRegenProgress] = useState(0)

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  const updateDraft = useCallback((data: Partial<Step1Draft>) => {
    setDraft((prev) => ({ ...prev, ...data }))
  }, [])

  const handleAiGenerateCover = () => {
    setCoverRegenLoading(true)
    setCoverRegenProgress(0)
    let p = 0
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 15) + 10
      if (p >= 100) {
        p = 100
        clearInterval(interval)
        setCoverRegenProgress(100)
        setTimeout(() => {
          const covers = ['/cover-wms-1.png', '/cover-wms-2.png', '/cover-wms-3.png']
          const nextIdx = Math.floor(Math.random() * covers.length)
          updateDraft({ coverImage: covers[nextIdx] })
          setCoverRegenLoading(false)
          setCoverRegenProgress(0)
          setCoverRegenPrompt('')
        }, 400)
      } else {
        setCoverRegenProgress(p)
      }
    }, 150)
  }

  const handleSave = () => {
    const positionData: Omit<Position, 'id' | 'createdAt' | 'updatedAt'> = {
      batchId: draft.batchId || '',
      version: draft.version,
      status: 'draft',
      name: draft.name || '未命名岗位',
      shortName: draft.shortName || '',
      industry: draft.industry || '',
      majors: draft.majors || [],
      positionType: draft.positionType || 'enterprise',
      salaryRange: draft.salaryRange || [0, 0],
      certificates: draft.certificates || [],
      description: draft.description || '',
      responsibilities: draft.responsibilities || [],
      requirements: draft.requirements || [],
      careerPath: draft.careerPath || '',
      abilityModel: draft.abilityModel || { nodes: [], edges: [] },
      abilityBindings: draft.abilityBindings || [],
      abilityDomains: draft.abilityDomains || [],
      competencyConfig: draft.competencyConfig || [],
      createdBy: CURRENT_USER.id,
      collaborators: [CURRENT_USER.id],
      favoriteCount: 0,
    }
    addPosition(positionData)
    router.push('/job/ai/positions')
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/job/ai/positions')}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                步骤 {currentStepIndex + 1}
              </Badge>
              <span className="text-sm font-medium text-gray-800">{steps[currentStepIndex].label}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              保存草稿
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              预览
            </Button>
            {currentStepIndex > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(steps[currentStepIndex - 1].id as WizardStep)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                上一步
              </Button>
            )}
            {currentStepIndex < steps.length - 1 ? (
              <Button size="sm" onClick={() => setStep(steps[currentStepIndex + 1].id as WizardStep)}>
                下一步
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                保存岗位
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {step === 'basic' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <Step1BasicInfo draft={draft} onUpdate={updateDraft} onNext={() => setStep('ability')} />
            </div>
            <div className="space-y-6">
              {/* Cover Image */}
              <Card>
                <CardContent className="pt-6">
                  <Label className="mb-3 block">岗位封面</Label>
                  <div
                    className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden relative group"
                    onClick={() => !draft.coverImage && updateDraft({ coverImage: '/placeholder.svg?height=200&width=300' })}
                  >
                    {draft.coverImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={draft.coverImage}
                          alt="岗位封面"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/90 text-gray-800 border-white hover:bg-white gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCoverRegenOpen(true)
                            }}
                          >
                            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                            重新生成
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/90 text-gray-800 border-white hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateDraft({ coverImage: '' })
                            }}
                          >
                            移除封面
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">点击设置封面图片</p>
                        <p className="text-xs text-gray-400 mt-1">建议尺寸 320x200</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 gap-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCoverRegenOpen(true)
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          AI 生成封面
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Meta Info */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label className="text-gray-500 text-xs">所属批次</Label>
                    <div className="mt-1">
                      <Select
                        value={draft.batchId || '__none__'}
                        onValueChange={(v) => updateDraft({ batchId: v === '__none__' ? '' : v })}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="选择批次" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">未选择批次</SelectItem>
                          {batches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs">创建人</Label>
                    <p className="font-medium text-gray-800 mt-1">{CURRENT_USER.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs">共建人</Label>
                    <div className="mt-1 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      {draft.collaborators.length === 0 ? (
                        <div className="flex items-center gap-2 text-gray-400">
                          <UserPlus className="h-4 w-4" />
                          <span className="text-sm">点击选择共建人</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            <span>{CURRENT_USER.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <Label className="text-gray-500 text-xs">当前版本号</Label>
                    <p className="font-medium text-gray-800 mt-1">{draft.version}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {step === 'ability' && (
          <Step2AbilityModel position={draft} onUpdate={updateDraft} onNext={() => setStep('result')} />
        )}
        {step === 'result' && (
          <Step3ResultTable position={draft} onUpdate={updateDraft} onPrev={() => setStep('ability')} onSave={handleSave} />
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>岗位信息预览</DialogTitle>
            <DialogDescription>预览当前填写的岗位信息</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">岗位名称</p>
                <p className="font-medium text-sm">{draft.name || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">所属行业</p>
                <p className="font-medium text-sm">{draft.industry || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">适用专业</p>
                <p className="font-medium text-sm">{draft.majors.join('、') || '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">薪资范围</p>
                <p className="font-medium text-sm">{draft.salaryRange[0]} - {draft.salaryRange[1]}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">岗位描述</p>
              <p className="text-sm">{draft.description || '暂无描述'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">工作职责 ({draft.responsibilities.length})</p>
              <ul className="text-sm space-y-1 mt-1">
                {draft.responsibilities.map((r) => (
                  <li key={r.id}>• {r.name}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">能力绑定 ({draft.abilityBindings.length})</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {draft.abilityBindings.map((b) => (
                  <Badge key={b.id} variant="secondary" className="text-xs">{b.name}</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cover Regeneration Prompt Dialog */}
      <Dialog open={coverRegenOpen} onOpenChange={setCoverRegenOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI 生成封面
            </DialogTitle>
            <DialogDescription>输入您对封面图的要求，AI 将为您生成新的岗位封面</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label htmlFor="cover-prompt">封面描述要求</Label>
            <Textarea
              id="cover-prompt"
              placeholder="例如：蓝色科技风格，展现软件开发工作场景..."
              value={coverRegenPrompt}
              onChange={(e) => setCoverRegenPrompt(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <p className="text-xs text-gray-400">留空将随机生成封面图</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setCoverRegenOpen(false)}>取消</Button>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                setCoverRegenOpen(false)
                handleAiGenerateCover()
              }}
            >
              确认生成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cover Regeneration Progress Dialog */}
      <Dialog open={coverRegenLoading} onOpenChange={(v) => !v && setCoverRegenLoading(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI 正在生成封面
            </DialogTitle>
            <DialogDescription>
              {coverRegenPrompt ? `正在根据要求生成封面：${coverRegenPrompt}` : '正在为您生成新的岗位封面...'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-purple-700">
              <span>生成进度</span>
              <span>{coverRegenProgress}%</span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all"
                style={{ width: `${coverRegenProgress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="h-4 w-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <span>AI 正在绘制封面图像...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
