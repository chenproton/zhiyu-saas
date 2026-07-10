'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sparkles,
  Plus,
  Search,
  Trash2,
  Lightbulb,
  BookOpen,
  Brain,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  X,
  Pencil,
} from 'lucide-react'
import { AiGenerateButton } from '@/components/job/ai/ai-generate-button'
import { AiConfidenceBadge } from '@/components/job/ai/ai-confidence-badge'
import { mockAbilityRecommendations, type AiAbilityRecommendation, mockPositionResponsibilitiesGeneration } from '@/lib/ai-mock-data-job'
import { useData } from '@/lib/stores/data-context'
import type { Position, PositionAbilityBinding, CompetencyLevel, PositionResponsibility } from '@/lib/types/job-source'
import { COMPETENCY_LEVEL_LABELS } from '@/lib/types/job-source'

interface StepAbilityModelingProps {
  position: Position
  onUpdate: (data: Partial<Position>) => void
  aiMode?: boolean
}

const COMPETENCY_LEVELS: { value: CompetencyLevel; label: string; description: string }[] = [
  { value: 'understand', label: '了解', description: '了解基本概念，能在指导下完成简单任务' },
  { value: 'comprehend', label: '理解', description: '理解原理和方法，能独立完成基本任务' },
  { value: 'master', label: '掌握', description: '能独立完成常规任务，处理一般问题' },
  { value: 'proficient', label: '熟练', description: '能处理复杂任务，指导他人，优化流程' },
  { value: 'expert', label: '精通', description: '行业专家水平，能创新和引领发展方向' },
]

const ABILITY_DOMAINS = [
  '业务洞察',
  '专业工具',
  '通用素质',
  '团队协作',
  '创新思维',
]

const ABILITY_ATTRIBUTES = ['知识', '素养', '技能']

const RESP_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500',
]

function getRespColor(respId: string) {
  let hash = 0
  for (let i = 0; i < respId.length; i++) {
    hash = respId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return RESP_COLORS[Math.abs(hash) % RESP_COLORS.length]
}

export function StepAbilityModeling({ position, onUpdate, aiMode = false }: StepAbilityModelingProps) {
  const { abilities } = useData()
  const [selectedRespId, setSelectedRespId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newAbilityName, setNewAbilityName] = useState('')
  const [newAbilityCategory, setNewAbilityCategory] = useState('专业技能')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<AiAbilityRecommendation[]>([])
  const [selectedAiRecIds, setSelectedAiRecIds] = useState<string[]>([])
  const [editingRespId, setEditingRespId] = useState<string | null>(null)
  const [editRespName, setEditRespName] = useState('')
  const [expandedBindingId, setExpandedBindingId] = useState<string | null>(null)

  // AI 补充工作职责弹窗状态
  const [aiRespDialogOpen, setAiRespDialogOpen] = useState(false)
  const [aiRespDirection, setAiRespDirection] = useState('')
  const [aiRespLoading, setAiRespLoading] = useState(false)
  const [aiRespSuggestions, setAiRespSuggestions] = useState<PositionResponsibility[]>([])
  const [selectedAiRespIds, setSelectedAiRespIds] = useState<string[]>([])

  const selectedResp = position.responsibilities.find(r => r.id === selectedRespId)

  const filteredPublicAbilities = useMemo(() => {
    if (!searchQuery.trim()) return []
    return abilities.filter(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [abilities, searchQuery])

  const handleAddFromPool = (ability: typeof abilities[0]) => {
    if (!selectedRespId) return
    const exists = position.abilityBindings.some(
      b => b.responsibilityId === selectedRespId && b.publicAbilityId === ability.id
    )
    if (exists) return

    const newBinding: PositionAbilityBinding = {
      id: `bind-${Date.now()}`,
      responsibilityId: selectedRespId,
      source: 'public',
      publicAbilityId: ability.id,
      name: ability.name,
      category: ability.category,
      level: 'master',
      domain: ABILITY_DOMAINS[0],
      rubricDescription: '',
      description: '',
      attributes: [],
    }
    onUpdate({ abilityBindings: [...position.abilityBindings, newBinding] })
    setSearchQuery('')
  }

  const handleCreateCustom = () => {
    if (!selectedRespId || !newAbilityName.trim()) return
    const newBinding: PositionAbilityBinding = {
      id: `bind-${Date.now()}`,
      responsibilityId: selectedRespId,
      source: 'custom',
      name: newAbilityName.trim(),
      category: newAbilityCategory,
      level: 'master',
      domain: ABILITY_DOMAINS[0],
      rubricDescription: '',
      description: '',
      attributes: [],
    }
    onUpdate({ abilityBindings: [...position.abilityBindings, newBinding] })
    setExpandedBindingId(newBinding.id)
    setNewAbilityName('')
    setShowCreateDialog(false)
  }

  const handleRemoveBinding = (bindingId: string) => {
    onUpdate({
      abilityBindings: position.abilityBindings.filter(b => b.id !== bindingId),
    })
  }

  const handleUpdateBinding = (bindingId: string, updates: Partial<PositionAbilityBinding>) => {
    onUpdate({
      abilityBindings: position.abilityBindings.map(b =>
        b.id === bindingId ? { ...b, ...updates } : b
      ),
    })
  }

  const handleSetAttribute = (bindingId: string, attr: string) => {
    const binding = position.abilityBindings.find((b) => b.id === bindingId)
    if (!binding) return
    const current = binding.attributes || []
    const next = current.includes(attr)
      ? current.filter((a) => a !== attr)
      : [...current, attr]
    handleUpdateBinding(bindingId, { attributes: next })
  }

  const handleAIGenerate = async () => {
    if (!selectedRespId) return
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (aiMode) {
      const recs = mockAbilityRecommendations(selectedResp?.name)
      setAiRecommendations(recs)
      setSelectedAiRecIds(recs.map(r => r.id))
    } else {
      const mockBindings: PositionAbilityBinding[] = ([
        {
          id: `bind-ai-1-${Date.now()}`,
          responsibilityId: selectedRespId,
          source: 'public' as const,
          publicAbilityId: abilities[0]?.id,
          name: abilities[0]?.name || '编程开发',
          category: abilities[0]?.category || '专业技能',
          level: 'proficient' as const,
          domain: ABILITY_DOMAINS[0],
          rubricDescription: '能够独立完成复杂业务模块的编码实现，代码质量达到团队规范要求',
          description: '掌握至少一门主流编程语言，熟悉常用开发框架和工具链',
          attributes: ['知识', '技能'],
        },
        {
          id: `bind-ai-2-${Date.now()}`,
          responsibilityId: selectedRespId,
          source: 'public' as const,
          publicAbilityId: abilities[1]?.id,
          name: abilities[1]?.name || '系统设计',
          category: abilities[1]?.category || '专业技能',
          level: 'master' as const,
          domain: ABILITY_DOMAINS[1 % ABILITY_DOMAINS.length],
          rubricDescription: '能够进行模块级设计，理解并能运用常见设计模式',
          description: '具备系统架构设计能力，能进行需求分析和方案选型',
          attributes: ['知识', '技能'],
        },
        {
          id: `bind-ai-3-${Date.now()}`,
          responsibilityId: selectedRespId,
          source: 'custom' as const,
          name: '代码审查',
          category: '通用能力',
          level: 'comprehend' as const,
          domain: ABILITY_DOMAINS[2 % ABILITY_DOMAINS.length],
          rubricDescription: '能够发现代码中的明显缺陷，并提出改进建议',
          description: '熟悉代码规范和质量标准，能进行有效的代码评审',
          attributes: ['素养', '技能'],
        },
      ] as PositionAbilityBinding[]).filter(b => b.name)

      const cleaned = position.abilityBindings.filter(b => b.responsibilityId !== selectedRespId)
      onUpdate({ abilityBindings: [...cleaned, ...mockBindings] })
    }
    setIsGenerating(false)
  }

  const handleAdoptAiRecommendations = () => {
    if (!selectedRespId || aiRecommendations.length === 0) return

    const toAdopt = aiRecommendations.filter(r => selectedAiRecIds.includes(r.id))
    const newBindings: PositionAbilityBinding[] = toAdopt.map((rec, i) => ({
      id: `bind-${Date.now()}-${rec.id}`,
      responsibilityId: selectedRespId,
      source: rec.id.startsWith('ai-ab-') && abilities.some(a => a.name === rec.name) ? 'public' : 'custom',
      publicAbilityId: abilities.find(a => a.name === rec.name)?.id,
      name: rec.name,
      category: rec.category,
      level: rec.level,
      domain: ABILITY_DOMAINS[i % ABILITY_DOMAINS.length],
      rubricDescription: rec.rubricDescription,
      description: '',
      attributes: [],
    }))

    const cleaned = position.abilityBindings.filter(b => b.responsibilityId !== selectedRespId)
    onUpdate({ abilityBindings: [...cleaned, ...newBindings] })
    setAiRecommendations([])
    setSelectedAiRecIds([])
  }

  const handleDismissAiRecommendations = () => {
    setAiRecommendations([])
    setSelectedAiRecIds([])
  }

  const handleAddResponsibility = () => {
    const newResp: Position['responsibilities'][0] = {
      id: `resp-${Date.now()}`,
      name: '',
      description: '',
    }
    onUpdate({ responsibilities: [...position.responsibilities, newResp] })
    setSelectedRespId(newResp.id)
    setEditingRespId(newResp.id)
    setEditRespName('')
  }

  const handleRemoveResponsibility = (respId: string) => {
    onUpdate({
      responsibilities: position.responsibilities.filter(r => r.id !== respId),
      abilityBindings: position.abilityBindings.filter(b => b.responsibilityId !== respId),
    })
    if (selectedRespId === respId) {
      setSelectedRespId(null)
      setAiRecommendations([])
      setSelectedAiRecIds([])
    }
  }

  const handleStartEditResp = (resp: Position['responsibilities'][0]) => {
    setEditingRespId(resp.id)
    setEditRespName(resp.name)
  }

  const handleSaveEditResp = () => {
    if (!editingRespId) return
    const trimmed = editRespName.trim()
    if (!trimmed) {
      // Delete empty responsibility
      onUpdate({
        responsibilities: position.responsibilities.filter(r => r.id !== editingRespId),
      })
      if (selectedRespId === editingRespId) {
        setSelectedRespId(null)
      }
      setEditingRespId(null)
      setEditRespName('')
      return
    }
    onUpdate({
      responsibilities: position.responsibilities.map(r =>
        r.id === editingRespId ? { ...r, name: trimmed } : r
      ),
    })
    setEditingRespId(null)
    setEditRespName('')
  }

  const toggleAiRecSelection = (id: string) => {
    setSelectedAiRecIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleOpenAiRespDialog = () => {
    setAiRespDialogOpen(true)
    setAiRespDirection('')
    setAiRespSuggestions([])
    setSelectedAiRespIds([])
  }

  const handleAiGenerateResponsibilities = async () => {
    setAiRespLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1200))

    const generated = mockPositionResponsibilitiesGeneration(position.name, position.industry)
    // 去重：过滤掉已存在的同名职责
    const existingNames = new Set(position.responsibilities.map(r => r.name))
    const filtered = generated.filter(g => !existingNames.has(g.name))
    // 如果全部重复，生成一些带后缀的
    const suggestions: PositionResponsibility[] = filtered.length > 0
      ? filtered.map(g => ({ ...g, id: `ai-resp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }))
      : generated.map((g, i) => ({
          ...g,
          id: `ai-resp-${Date.now()}-${i}`,
          name: `${g.name}（补充${i + 1}）`,
        }))

    setAiRespSuggestions(suggestions.slice(0, 5))
    setSelectedAiRespIds(suggestions.slice(0, 5).map(s => s.id))
    setAiRespLoading(false)
  }

  const handleAdoptAiResponsibilities = () => {
    const toAdopt = aiRespSuggestions.filter(r => selectedAiRespIds.includes(r.id))
    if (toAdopt.length === 0) return
    onUpdate({ responsibilities: [...position.responsibilities, ...toAdopt] })
    setAiRespDialogOpen(false)
    setAiRespSuggestions([])
    setSelectedAiRespIds([])
    setAiRespDirection('')
  }

  const toggleAiRespSelection = (id: string) => {
    setSelectedAiRespIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const totalBindings = position.abilityBindings.length
  const totalResponsibilities = position.responsibilities.length
  const filteredBindings = position.abilityBindings.filter(b => !selectedRespId || b.responsibilityId === selectedRespId)
  const filteredCount = filteredBindings.length

  return (
    <div className="grid gap-6 lg:grid-cols-5 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Left Panel - Responsibilities */}
      <Card className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl shadow-sm border-gray-200">
        <CardHeader className="shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-gray-800">工作职责列表</CardTitle>
              <CardDescription className="text-gray-400">共 {totalResponsibilities} 项职责</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 px-3 shrink-0 bg-primary hover:bg-gray-800 text-primary-foreground text-xs"
                onClick={handleAddResponsibility}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                添加工作职责
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-1.5">
          {position.responsibilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertCircle className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">暂无工作职责</p>
              <p className="text-xs mt-1">点击右上角按钮添加</p>
            </div>
          ) : (
            position.responsibilities.map((resp) => {
              const bindingCount = position.abilityBindings.filter(b => b.responsibilityId === resp.id).length
              const isSelected = resp.id === selectedRespId
              const isEditing = resp.id === editingRespId
              return (
                <div
                  key={resp.id}
                  onClick={() => {
                    if (isEditing) return
                    if (!resp.name) {
                      setEditingRespId(resp.id)
                      setEditRespName('')
                    } else {
                      setSelectedRespId(resp.id)
                    }
                  }}
                  className={`group w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary/30 bg-primary/[0.03]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-stretch gap-2.5">
                    <div className={`w-1.5 rounded-full ${getRespColor(resp.id)}`} />
                    <div className={`shrink-0 h-5 w-5 self-center rounded-full border-2 flex items-center justify-center ${
                      bindingCount > 0
                        ? 'border-gray-800 bg-gray-800 text-white'
                        : 'border-gray-300'
                    }`}>
                      {bindingCount > 0 && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Input
                            value={editRespName}
                            onChange={e => setEditRespName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEditResp()
                              if (e.key === 'Escape') handleSaveEditResp()
                            }}
                            onBlur={handleSaveEditResp}
                            placeholder="输入职责名称..."
                            className="h-7 text-sm py-0 border-gray-200"
                            autoFocus
                          />
                          <Button size="sm" className="h-7 px-2" onClick={handleSaveEditResp}>
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                          {resp.name || <span className="text-gray-400 italic">未命名职责</span>}
                        </p>
                      )}
                      {!isEditing && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{bindingCount} 个能力点</span>
                          {bindingCount === 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">待拆解</span>
                          )}
                        </div>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEditResp(resp)
                          }}
                          className="p-1.5 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveResponsibility(resp.id)
                          }}
                          className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Right Panel - All Abilities Flattened by Responsibility */}
      <Card className="lg:col-span-3 flex flex-col overflow-hidden rounded-xl shadow-sm border-gray-200">
        <CardHeader className="shrink-0 flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base text-gray-800">岗位能力</CardTitle>
            <CardDescription className="text-gray-400">
              {selectedRespId
                ? `共 ${filteredCount} 个能力点（来自「${selectedResp?.name}」）`
                : `共 ${totalBindings} 个能力点，${totalResponsibilities} 项职责`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedResp && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRespId(null)
                    setExpandedBindingId(null)
                  }}
                  className="h-8 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  查看全部
                </Button>
                {aiMode ? (
                  <AiGenerateButton
                    onClick={handleAIGenerate}
                    loading={isGenerating}
                    label="AI 智能匹配"
                    size="sm"
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="h-8 text-xs border-gray-200 hover:bg-gray-50"
                  >
                    {isGenerating ? (
                      <Sparkles className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    AI 智能匹配
                  </Button>
                )}
              </>
            )}

          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-6">
          {/* AI Recommendations */}
          {aiMode && selectedResp && aiRecommendations.length > 0 && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-gray-800">AI 智能推荐能力点</span>
                  <Badge variant="outline" className="text-[10px] rounded-md bg-white text-indigo-600 border-indigo-100 px-1.5 py-0">
                    {selectedAiRecIds.length}/{aiRecommendations.length} 已选
                  </Badge>
                </div>
                <button onClick={handleDismissAiRecommendations} className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                根据「{selectedResp.name}」职责特征推荐以下能力点
              </p>
              <div className="space-y-2">
                {aiRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => toggleAiRecSelection(rec.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedAiRecIds.includes(rec.id)
                        ? 'border-indigo-200 bg-white shadow-sm'
                        : 'border-gray-100 bg-white/60 hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      selectedAiRecIds.includes(rec.id) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                    }`}>
                      {selectedAiRecIds.includes(rec.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">{rec.name}</span>
                        <Badge variant="outline" className="text-[10px] rounded-md px-1.5 py-0 border-gray-200">{rec.category}</Badge>
                        <AiConfidenceBadge confidence={rec.confidence} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{rec.reason}</p>
                      <p className="text-xs text-indigo-500 mt-0.5 font-medium">
                        建议等级：{COMPETENCY_LEVEL_LABELS[rec.level]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <AiGenerateButton onClick={handleAIGenerate} loading={isGenerating} label="重新推荐" size="sm" />
                <Button
                  size="sm"
                  onClick={handleAdoptAiRecommendations}
                  disabled={selectedAiRecIds.length === 0}
                  className="gap-1 bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                  采纳选中项 ({selectedAiRecIds.length})
                </Button>
              </div>
            </div>
          )}

          {/* Search & Add */}
          {selectedResp && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="搜索公共能力点库..."
                    className="pl-9 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={!selectedResp}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 text-sm"
                  onClick={() => setShowCreateDialog(true)}
                  disabled={!selectedResp}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  新建能力点
                </Button>
              </div>
              {searchQuery.trim() && (
                <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2 max-h-56 overflow-y-auto shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">公共能力点库（{abilities.length}）</p>
                    <p className="text-xs text-gray-400">搜索「{searchQuery}」</p>
                  </div>
                  {filteredPublicAbilities.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-400">未找到匹配的能力点</p>
                    </div>
                  ) : (
                    filteredPublicAbilities.map((ability) => (
                      <div
                        key={ability.id}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleAddFromPool(ability)}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{ability.name}</span>
                          <Badge variant="outline" className="text-[10px] rounded-md px-1.5 py-0">{ability.category}</Badge>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-gray-400 hover:text-primary">
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                  {filteredPublicAbilities.length === 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50/50"
                        onClick={() => {
                          setNewAbilityName(searchQuery)
                          setShowCreateDialog(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        库中不存在，新建「{searchQuery}」能力点
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* All abilities flat list — collapsible cards */}
          {filteredCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Brain className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">
                {selectedRespId ? '该职责暂无能力点' : '暂无能力点'}
              </p>
              <p className="text-xs mt-1 text-gray-300">
                {selectedRespId ? '点击 AI 智能匹配或搜索添加' : '搜索公共库或新建能力点进行添加'}
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredBindings.map((binding) => {
                const resp = position.responsibilities.find(r => r.id === binding.responsibilityId)
                const isExpanded = expandedBindingId === binding.id
                return isExpanded ? (
                  <div key={binding.id} className="rounded-xl border border-gray-300 bg-white p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${getRespColor(binding.responsibilityId)}`} />
                      <span className="text-sm font-semibold text-gray-800">{binding.name}</span>
                      <span className="text-[11px] text-gray-400">{COMPETENCY_LEVEL_LABELS[binding.level]}</span>
                      {resp && (
                        <span className="text-[11px] text-gray-300">{resp.name}</span>
                      )}
                    </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-gray-500 hover:text-gray-800" onClick={() => setExpandedBindingId(null)}>
                          收起
                        </Button>
                        <button
                          className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          onClick={() => handleRemoveBinding(binding.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Domain */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-400 font-medium">所属能力域</Label>
                      <Select
                        value={binding.domain || ABILITY_DOMAINS[0]}
                        onValueChange={(v) => handleUpdateBinding(binding.id, { domain: v })}
                      >
                        <SelectTrigger className="h-8 text-sm w-full max-w-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ABILITY_DOMAINS.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Attributes — multi select */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-400 font-medium">能力属性</Label>
                      <div className="flex gap-2">
                        {ABILITY_ATTRIBUTES.map((attr) => {
                          const isSelected = (binding.attributes || []).includes(attr)
                          return (
                            <button
                              key={attr}
                              type="button"
                              onClick={() => handleSetAttribute(binding.id, attr)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                isSelected
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                              }`}
                            >
                              {attr}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Level - Node progress bar */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400 font-medium">掌握程度</Label>
                      <div className="relative pt-2 pb-1 max-w-md">
                        <div className="absolute top-[14px] left-0 right-0 h-1 bg-gray-100 rounded-full" />
                        <div
                          className="absolute top-[14px] left-0 h-1 bg-gray-800 rounded-full transition-all"
                          style={{
                            width: `${(COMPETENCY_LEVELS.findIndex(l => l.value === binding.level) / (COMPETENCY_LEVELS.length - 1)) * 100}%`,
                          }}
                        />
                        <div className="relative flex justify-between">
                          {COMPETENCY_LEVELS.map((level) => {
                            const currentIdx = COMPETENCY_LEVELS.findIndex(l => l.value === binding.level)
                            const idx = COMPETENCY_LEVELS.findIndex(l => l.value === level.value)
                            const isActive = idx <= currentIdx
                            const isSelected = binding.level === level.value
                            return (
                              <button
                                key={level.value}
                                type="button"
                                onClick={() => handleUpdateBinding(binding.id, { level: level.value })}
                                className="flex flex-col items-center gap-1 group"
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'border-gray-800 bg-gray-800 scale-110'
                                      : isActive
                                        ? 'border-gray-800 bg-gray-800/15'
                                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span
                                  className={`text-[10px] font-medium transition-colors ${
                                    isSelected ? 'text-gray-900' : isActive ? 'text-gray-700' : 'text-gray-400'
                                  }`}
                                >
                                  {level.label}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Rubric Description */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-400 font-medium">胜任标准描述</Label>
                      <Textarea
                        value={binding.rubricDescription}
                        onChange={(e) => handleUpdateBinding(binding.id, { rubricDescription: e.target.value })}
                        placeholder="描述该能力点在本岗位中的具体达标表现..."
                        className="text-sm min-h-[56px] resize-none border-gray-200 focus:border-gray-400"
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    key={binding.id}
                    onClick={() => setExpandedBindingId(binding.id)}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${getRespColor(binding.responsibilityId)} shrink-0`} />
                      <span className="text-sm font-medium text-gray-700 truncate">{binding.name}</span>
                      <span className="text-[11px] text-gray-400 shrink-0">{COMPETENCY_LEVEL_LABELS[binding.level]}</span>
                      {resp && (
                        <span className="text-[11px] text-gray-300 truncate max-w-[120px]">{resp.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveBinding(binding.id)
                        }}
                        className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Custom Ability Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-xl border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-800">新建能力点</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedResp
                ? `为「${selectedResp.name}」新建岗位能力点`
                : '请先选择一项工作职责'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">能力点名称</Label>
              <Input
                value={newAbilityName}
                onChange={(e) => setNewAbilityName(e.target.value)}
                placeholder="例如：微服务架构设计"
                className="border-gray-200 focus:border-gray-400"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreateCustom}
              disabled={!newAbilityName.trim() || !selectedRespId}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              创建并关联
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI 补充工作职责弹窗 */}
      <Dialog open={aiRespDialogOpen} onOpenChange={setAiRespDialogOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-xl border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-800">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI 补充工作职责
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {aiRespSuggestions.length === 0
                ? '请描述您希望 AI 补充的工作职责方向，留空则使用默认策略'
                : `已生成 ${aiRespSuggestions.length} 条工作职责建议，勾选后点击确认添加`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {aiRespSuggestions.length === 0 && (
              <Textarea
                value={aiRespDirection}
                onChange={(e) => setAiRespDirection(e.target.value)}
                placeholder="例如：侧重于仓储物流自动化方向、需要强调数据分析能力、面向电商行业等..."
                rows={3}
                className="border-gray-200 focus:border-gray-400 resize-none"
              />
            )}

            {aiRespSuggestions.length > 0 && (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {aiRespSuggestions.map((resp) => (
                  <div
                    key={resp.id}
                    onClick={() => toggleAiRespSelection(resp.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedAiRespIds.includes(resp.id)
                        ? 'border-indigo-200 bg-indigo-50/30 shadow-sm'
                        : 'border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      selectedAiRespIds.includes(resp.id) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                    }`}>
                      {selectedAiRespIds.includes(resp.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{resp.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{resp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
              onClick={() => {
                setAiRespDialogOpen(false)
                setAiRespSuggestions([])
                setSelectedAiRespIds([])
                setAiRespDirection('')
              }}
            >
              取消
            </Button>
            {aiRespSuggestions.length === 0 ? (
              <Button
                onClick={handleAiGenerateResponsibilities}
                disabled={aiRespLoading}
                className="gap-1 bg-purple-600 hover:bg-purple-700"
              >
                {aiRespLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    确认生成
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleAdoptAiResponsibilities}
                disabled={selectedAiRespIds.length === 0}
                className="gap-1 bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Check className="h-4 w-4" />
                确认添加 ({selectedAiRespIds.length})
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
