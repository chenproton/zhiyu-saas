'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FolderOpen,
  Plus,
  Trash2,
  MoveRight,
  CheckCircle2,
  AlertCircle,
  Boxes,
  GripVertical,
  Sparkles,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { AiGenerateButton } from '@/components/job/ai/ai-generate-button'
import { AiConfidenceBadge } from '@/components/job/ai/ai-confidence-badge'
import { mockDomainClassification, type AiDomainClassification } from '@/lib/ai-mock-data-job'
import type { Position, AbilityDomain, PositionAbilityBinding } from '@/lib/types/job-source'
import { COMPETENCY_LEVEL_LABELS } from '@/lib/types/job-source'

interface StepCompetencyConfigProps {
  position: Position
  onUpdate: (updates: Partial<Position>) => void
  aiMode?: boolean
  onSubmit?: () => void
}

const PRESET_DOMAINS = [
  { id: 'domain-business', name: '业务洞察', description: '对业务场景、用户需求的理解与洞察能力' },
  { id: 'domain-tools', name: '专业工具', description: '专业领域内的工具使用与技术应用能力' },
  { id: 'domain-quality', name: '通用素质', description: '通用职业素养与基础素质能力' },
  { id: 'domain-team', name: '团队协作', description: '团队沟通、协作与领导能力' },
  { id: 'domain-innovation', name: '创新思维', description: '创新意识、问题解决与学习能力' },
]

export function StepCompetencyConfig({
  position,
  onUpdate,
  aiMode = false,
  onSubmit,
}: StepCompetencyConfigProps) {
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null)
  const [showAddDomain, setShowAddDomain] = useState(false)
  const [newDomainName, setNewDomainName] = useState('')
  const [selectedBindingIds, setSelectedBindingIds] = useState<string[]>([])
  const [isAiClassifying, setIsAiClassifying] = useState(false)
  const [aiClassifications, setAiClassifications] = useState<AiDomainClassification[]>([])

  const domains = position.abilityDomains.length > 0
    ? position.abilityDomains
    : PRESET_DOMAINS.map(d => ({ ...d, bindingIds: [] }))

  const unassignedBindings = position.abilityBindings.filter(
    b => !domains.some(d => d.bindingIds.includes(b.id))
  )

  const handleInitDomains = () => {
    const initDomains: AbilityDomain[] = PRESET_DOMAINS.map(d => ({
      ...d,
      bindingIds: [],
    }))
    onUpdate({ abilityDomains: initDomains })
  }

  const handleAddDomain = () => {
    if (!newDomainName.trim()) return
    const newDomain: AbilityDomain = {
      id: `domain-${Date.now()}`,
      name: newDomainName.trim(),
      description: '',
      bindingIds: [],
    }
    onUpdate({ abilityDomains: [...domains, newDomain] })
    setNewDomainName('')
    setShowAddDomain(false)
  }

  const handleDeleteDomain = (domainId: string) => {
    onUpdate({ abilityDomains: domains.filter(d => d.id !== domainId) })
  }

  const handleAssignToDomain = (domainId: string, bindingIds: string[]) => {
    onUpdate({
      abilityDomains: domains.map(d =>
        d.id === domainId
          ? { ...d, bindingIds: Array.from(new Set([...d.bindingIds, ...bindingIds])) }
          : d
      ),
    })
    setSelectedBindingIds([])
  }

  const handleRemoveFromDomain = (domainId: string, bindingId: string) => {
    onUpdate({
      abilityDomains: domains.map(d =>
        d.id === domainId
          ? { ...d, bindingIds: d.bindingIds.filter(id => id !== bindingId) }
          : d
      ),
    })
  }

  const handleToggleBinding = (bindingId: string) => {
    setSelectedBindingIds(prev =>
      prev.includes(bindingId)
        ? prev.filter(id => id !== bindingId)
        : [...prev, bindingId]
    )
  }

  const handleAiClassify = async () => {
    if (position.abilityBindings.length === 0) return
    setIsAiClassifying(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const classifications = mockDomainClassification()
    // 将推荐绑定 ID 替换为实际存在的能力点 binding ID
    const availableBindingIds = position.abilityBindings.map(b => b.id)
    const mappedClassifications = classifications.map(c => ({
      ...c,
      bindingIds: c.bindingIds
        .map((_id, idx) => availableBindingIds[idx])
        .filter(Boolean)
        .slice(0, Math.floor(Math.random() * 3) + 1),
    }))
    setAiClassifications(mappedClassifications)
    setIsAiClassifying(false)
  }

  const handleAdoptAiClassification = () => {
    if (aiClassifications.length === 0) return

    const updatedDomains = domains.map(d => {
      const classification = aiClassifications.find(c => c.domainId === d.id)
      if (classification && classification.bindingIds.length > 0) {
        return {
          ...d,
          bindingIds: Array.from(new Set([...d.bindingIds, ...classification.bindingIds])),
        }
      }
      return d
    })

    onUpdate({ abilityDomains: updatedDomains })
    setAiClassifications([])
  }

  const handleDismissAiClassification = () => {
    setAiClassifications([])
  }

  const totalBindings = position.abilityBindings.length
  const assignedCount = position.abilityBindings.filter(
    b => domains.some(d => d.bindingIds.includes(b.id))
  ).length

  const getBindingById = (id: string): PositionAbilityBinding | undefined => {
    return position.abilityBindings.find(b => b.id === id)
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Boxes className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">能力领域归类</p>
                <p className="text-sm text-muted-foreground">
                  将已配置的能力点分配到对应的能力领域容器中
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {totalBindings > 0 ? Math.round((assignedCount / totalBindings) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">
                {assignedCount} / {totalBindings} 已归类
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Classification Suggestion */}
      {aiMode && aiClassifications.length > 0 && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">AI 智能归类建议</span>
              <AiConfidenceBadge confidence="medium" />
            </div>
            <button
              onClick={handleDismissAiClassification}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            AI 已根据能力点的名称和类型特征，为您推荐以下归类方案。采纳后将自动分配到对应领域。
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {aiClassifications.filter(c => c.bindingIds.length > 0).map((c) => (
              <div key={c.domainId} className="rounded-md bg-white border border-purple-100 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-medium">{c.domainName}</span>
                  <Badge variant="outline" className="text-[10px]">{c.bindingIds.length} 个</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.bindingIds.map(bid => {
                    const binding = getBindingById(bid)
                    return binding ? (
                      <Badge key={bid} variant="secondary" className="text-xs">
                        {binding.name}
                      </Badge>
                    ) : null
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{c.reasoning}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <AiGenerateButton
              onClick={handleAiClassify}
              loading={isAiClassifying}
              label="重新分析"
              size="sm"
            />
            <Button
              size="sm"
              onClick={handleAdoptAiClassification}
              className="gap-1 bg-purple-600 hover:bg-purple-700"
            >
              <Check className="h-3.5 w-3.5" />
              采纳建议
            </Button>
          </div>
        </div>
      )}

      {/* Unassigned Pool */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            待归类能力点
          </CardTitle>
          {aiMode && unassignedBindings.length > 0 && aiClassifications.length === 0 && (
            <AiGenerateButton
              onClick={handleAiClassify}
              loading={isAiClassifying}
              label="AI 智能归类"
              size="sm"
            />
          )}
        </CardHeader>
        <CardContent>
          {unassignedBindings.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <CheckCircle2 className="h-4 w-4 text-success" />
              所有能力点已完成归类
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unassignedBindings.map((binding) => (
                <button
                  key={binding.id}
                  onClick={() => handleToggleBinding(binding.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    selectedBindingIds.includes(binding.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/30 hover:bg-accent/30'
                  }`}
                >
                  <div className={`h-3 w-3 rounded-full border ${
                    selectedBindingIds.includes(binding.id)
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground'
                  }`} />
                  {binding.name}
                  <Badge variant="outline" className="text-xs">{binding.category}</Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Containers */}
      {domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">尚未创建能力领域</p>
          <Button className="mt-4" onClick={handleInitDomains}>
            <Plus className="mr-2 h-4 w-4" />
            初始化默认领域
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {domains.map((domain) => {
            const domainBindings = domain.bindingIds
              .map(id => getBindingById(id))
              .filter(Boolean) as PositionAbilityBinding[]
            const isSelected = selectedDomainId === domain.id

            return (
              <Card
                key={domain.id}
                className={`transition-all ${isSelected ? 'ring-1 ring-primary' : ''}`}
                onClick={() => setSelectedDomainId(domain.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <CardTitle className="text-base">{domain.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{domainBindings.length}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDomain(domain.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {domain.description && (
                    <CardDescription>{domain.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Assign button */}
                  {selectedBindingIds.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mb-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAssignToDomain(domain.id, selectedBindingIds)
                      }}
                    >
                      <MoveRight className="mr-2 h-4 w-4" />
                      将 {selectedBindingIds.length} 个能力点移入
                    </Button>
                  )}

                  {domainBindings.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                      暂无能力点
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {domainBindings.map((binding) => (
                        <Badge
                          key={binding.id}
                          variant="outline"
                          className="text-xs px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFromDomain(domain.id, binding.id)
                          }}
                        >
                          {binding.name}
                          <Trash2 className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* Add Domain Card */}
          <Button
            variant="outline"
            className="h-auto min-h-[120px] flex flex-col items-center justify-center gap-2 border-dashed"
            onClick={() => setShowAddDomain(true)}
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">新增领域容器</span>
          </Button>
        </div>
      )}

      {/* Summary Table */}
      {domains.length > 0 && assignedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">岗位胜任力标准总表预览</CardTitle>
            <CardDescription>按领域聚合的能力达标要求汇总</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">能力领域</th>
                    <th className="text-left px-4 py-2 font-medium">能力点</th>
                    <th className="text-left px-4 py-2 font-medium">达标等级</th>
                    <th className="text-left px-4 py-2 font-medium">量规描述</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {domains.flatMap(domain =>
                    domain.bindingIds.map((bid, idx) => {
                      const binding = getBindingById(bid)
                      if (!binding) return null
                      return (
                        <tr key={`${domain.id}-${bid}`} className="hover:bg-accent/30">
                          {idx === 0 ? (
                            <td className="px-4 py-2 font-medium align-top" rowSpan={domain.bindingIds.length}>
                              {domain.name}
                            </td>
                          ) : null}
                          <td className="px-4 py-2">{binding.name}</td>
                          <td className="px-4 py-2">
                            <Badge variant="outline" className="text-xs">
                              {binding.level ? COMPETENCY_LEVEL_LABELS[binding.level] : '未配置'}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground max-w-xs truncate">
                            {binding.rubricDescription || '-'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      {onSubmit && (
        <div className="flex justify-end pt-2">
          <Button onClick={onSubmit} className="gap-1 bg-gray-900 hover:bg-gray-800 text-white">
            <Check className="h-4 w-4" />
            提交审批
          </Button>
        </div>
      )}

      {/* Add Domain Dialog */}
      <Dialog open={showAddDomain} onOpenChange={setShowAddDomain}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增能力领域</DialogTitle>
            <DialogDescription>创建一个新的能力领域分类容器</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>领域名称</Label>
              <Input
                value={newDomainName}
                onChange={(e) => setNewDomainName(e.target.value)}
                placeholder="例如：数据分析能力"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDomain(false)}>取消</Button>
            <Button onClick={handleAddDomain} disabled={!newDomainName.trim()}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
