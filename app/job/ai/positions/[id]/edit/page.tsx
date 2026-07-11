'use client'

import { Suspense, useState, useCallback, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useData } from '@/lib/stores/data-context'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Save, Eye, ArrowRight, ArrowLeft, ImagePlus } from 'lucide-react'
import { Step1BasicInfo, type Step1Draft } from '@/components/job/position-builder/ai-assisted-2/step1-basic-info'
import { Step2AbilityModel } from '@/components/job/position-builder/ai-assisted-2/step2-ability-model'
import { Step3ResultTable } from '@/components/job/position-builder/ai-assisted-2/step3-result-table'
import { CoBuilderSelector } from '@/components/job/position-builder/co-builder-selector'
import type { Position } from '@/lib/types/job-source'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type WizardStep = 'basic' | 'ability' | 'result'

const steps = [
  { id: 'basic' as WizardStep, label: '基础信息润色', num: 1 },
  { id: 'ability' as WizardStep, label: '能力模型配置', num: 2 },
  { id: 'result' as WizardStep, label: '结果汇总', num: 3 },
]

function positionToDraft(position: Position): Step1Draft {
  return {
    ...position,
    rawResponsibilities: '',
    rawRequirements: '',
    rawCareerPath: '',
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

function AiAssisted2EditPositionPageContent({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: currentUser } = useAuth()
  const { positions, batches, updatePosition } = useData()

  const [step, setStep] = useState<WizardStep>('basic')
  const [draft, setDraft] = useState<Step1Draft | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [coverInputOpen, setCoverInputOpen] = useState(false)
  const [coverUrl, setCoverUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // 加载岗位数据
  useEffect(() => {
    const found = positions.find((p) => p.id === id)
    if (found) {
      setDraft(positionToDraft(found))
    }
  }, [id, positions])

  // 处理 URL ?step= 参数
  useEffect(() => {
    const stepParam = searchParams.get('step')
    if (stepParam === '1') {
      setStep('ability')
    } else if (stepParam === '2') {
      setStep('result')
    }
  }, [searchParams])

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  const updateDraft = useCallback((data: Partial<Step1Draft>) => {
    setDraft((prev) => (prev ? { ...prev, ...data } : null))
  }, [])

  const handleCoverUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const url = URL.createObjectURL(file)
        updateDraft({ coverImage: url })
      }
    }
    input.click()
  }

  const handleConfirmCoverUrl = () => {
    if (coverUrl.trim()) {
      updateDraft({ coverImage: coverUrl.trim() })
    }
    setCoverUrl('')
    setCoverInputOpen(false)
  }

  const handleSave = async () => {
    if (!draft) return
    setIsSaving(true)
    await updatePosition(id, draft)
    setIsSaving(false)
    router.push('/job/ai/positions')
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">岗位不存在</p>
      </div>
    )
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
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? '保存中...' : '保存'}
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
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? '保存中...' : '保存岗位'}
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
                    onClick={handleCoverUpload}
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
                            className="bg-white/90 text-gray-800 border-white hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCoverUpload()
                            }}
                          >
                            上传封面
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/90 text-gray-800 border-white hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCoverInputOpen(true)
                            }}
                          >
                            URL 封面
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
                        <p className="text-sm text-gray-500">点击上传封面图片</p>
                        <p className="text-xs text-gray-400 mt-1">建议尺寸 320x200</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCoverInputOpen(true)
                          }}
                        >
                          使用图片链接
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
                    <p className="font-medium text-gray-800 mt-1">{currentUser?.name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs">共建人</Label>
                    <CoBuilderSelector
                      selectedIds={draft.collaborators || []}
                      onChange={(ids) => updateDraft({ collaborators: ids })}
                    />
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

      {/* Cover URL Input Dialog */}
      <Dialog open={coverInputOpen} onOpenChange={setCoverInputOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>设置封面图片</DialogTitle>
            <DialogDescription>输入岗位封面图片的 URL 地址</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="https://..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setCoverInputOpen(false)}>取消</Button>
            <Button size="sm" onClick={handleConfirmCoverUrl}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


export default function AiAssisted2EditPositionPage(props: PageProps) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AiAssisted2EditPositionPageContent {...props} />
    </Suspense>
  )
}
