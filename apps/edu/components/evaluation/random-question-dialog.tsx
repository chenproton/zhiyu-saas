// @ts-nocheck
"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Shuffle, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MultiSelectSearch } from "@/components/ui/multi-select-search"
import { Switch } from "@/components/ui/switch"
import { useData } from "@/components/providers/data-provider"
import { knowledgeApi } from "@/lib/api"
import type { Question, QuestionType, Difficulty, EvalKnowledgePoint } from "@/lib/types"
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS } from "@/lib/types"

interface RandomQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedQuestionIds: string[]
  onAddQuestions: (questions: Question[]) => void
}

const questionTypes: QuestionType[] = ['single', 'multiple', 'judge', 'fill', 'short_answer', 'essay']
const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

type WeightDimension = 'none' | 'bank' | 'type' | 'difficulty' | 'knowledge'

export function RandomQuestionDialog({
  open,
  onOpenChange,
  selectedQuestionIds,
  onAddQuestions,
}: RandomQuestionDialogProps) {
  const { questionBanks, questions } = useData()

  const publishedBanks = useMemo(() =>
    questionBanks.filter(bank => bank.status === 'published'),
    [questionBanks]
  )

  // 筛选条件
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([])
  const [selectedKnowledgePoints, setSelectedKnowledgePoints] = useState<string[]>([])
  const [count, setCount] = useState(5)

  // 权重维度：一次只能启用一个
  const [weightDimension, setWeightDimension] = useState<WeightDimension>('none')

  // 各维度权重配置
  const [bankWeights, setBankWeights] = useState<Record<string, number>>({})
  const [typeWeights, setTypeWeights] = useState<Record<string, number>>({})
  const [difficultyWeights, setDifficultyWeights] = useState<Record<string, number>>({})
  const [knowledgeWeights, setKnowledgeWeights] = useState<Record<string, number>>({})

  const [knowledgePoints, setKnowledgePoints] = useState<EvalKnowledgePoint[]>([])
  const [loadingKnowledgePoints, setLoadingKnowledgePoints] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoadingKnowledgePoints(true)
    knowledgeApi.list({ limit: 1000 })
      .then((res) => {
        if (cancelled) return
        setKnowledgePoints(res.items.map((kp) => ({ id: kp.id, name: kp.name })))
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load knowledge points', err)
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingKnowledgePoints(false)
      })
    return () => { cancelled = true }
  }, [open])

  const toggleDimension = (dim: WeightDimension) => {
    setWeightDimension(prev => prev === dim ? 'none' : dim)
  }

  const setWeight = (
    setter: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    key: string,
    value: number
  ) => {
    setter(prev => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }))
  }

  const normalizeWeights = useCallback((
    weights: Record<string, number>,
    keys: string[]
  ): Record<string, number> => {
    const active = keys.filter(k => weights[k] !== undefined && weights[k] > 0)
    if (active.length === 0) {
      const equal = 100 / keys.length
      return Object.fromEntries(keys.map(k => [k, Math.round(equal)]))
    }
    const sum = active.reduce((s, k) => s + (weights[k] || 0), 0)
    if (sum === 0) {
      const equal = 100 / active.length
      return Object.fromEntries(active.map(k => [k, Math.round(equal)]))
    }
    const normalized: Record<string, number> = {}
    active.forEach(k => {
      normalized[k] = Math.round(((weights[k] || 0) / sum) * 100)
    })
    // 修正四舍五入误差
    const total = Object.values(normalized).reduce((s, v) => s + v, 0)
    if (total !== 100 && active.length > 0) {
      const diff = 100 - total
      normalized[active[0]] += diff
    }
    return normalized
  }, [])

  // 计算可用题目池（仅用于筛选维度，不应用权重过滤）
  const basePool = useMemo(() => {
    let pool = questions.filter(q => {
      if (selectedQuestionIds.includes(q.id)) return false
      const bank = questionBanks.find(b => b.id === q.bankId)
      if (!bank || bank.status !== 'published') return false
      return true
    })
    return pool
  }, [questions, questionBanks, selectedQuestionIds])

  // 获取各维度的可用选项（已应用其他维度的筛选）
  const getFilteredPoolForOption = useCallback((
    dim: WeightDimension,
    optionValue: string
  ): Question[] => {
    let pool = [...basePool]

    // 应用所有非权重维度的筛选
    if (dim !== 'bank' && selectedBankIds.length > 0) {
      pool = pool.filter(q => selectedBankIds.includes(q.bankId))
    }
    if (dim !== 'type' && selectedTypes.length > 0) {
      pool = pool.filter(q => selectedTypes.includes(q.type))
    }
    if (dim !== 'difficulty' && selectedDifficulties.length > 0) {
      pool = pool.filter(q => q.difficulty && selectedDifficulties.includes(q.difficulty))
    }
    if (dim !== 'knowledge' && selectedKnowledgePoints.length > 0) {
      pool = pool.filter(q => q.knowledgePoints?.some(kp => selectedKnowledgePoints.includes(kp)))
    }

    // 应用当前选项的过滤
    if (dim === 'bank') {
      pool = pool.filter(q => q.bankId === optionValue)
    } else if (dim === 'type') {
      pool = pool.filter(q => q.type === optionValue)
    } else if (dim === 'difficulty') {
      pool = pool.filter(q => q.difficulty === optionValue)
    } else if (dim === 'knowledge') {
      pool = pool.filter(q => q.knowledgePoints?.includes(optionValue))
    }

    return pool
  }, [basePool, selectedBankIds, selectedTypes, selectedDifficulties, selectedKnowledgePoints])

  // 计算权重分配后的预估可用数量
  const weightedAvailableCount = useMemo(() => {
    if (weightDimension === 'none') {
      let pool = [...basePool]
      if (selectedBankIds.length > 0) pool = pool.filter(q => selectedBankIds.includes(q.bankId))
      if (selectedTypes.length > 0) pool = pool.filter(q => selectedTypes.includes(q.type))
      if (selectedDifficulties.length > 0) pool = pool.filter(q => q.difficulty && selectedDifficulties.includes(q.difficulty))
      if (selectedKnowledgePoints.length > 0) pool = pool.filter(q => q.knowledgePoints?.some(kp => selectedKnowledgePoints.includes(kp)))
      return pool.length
    }

    const getKeys = () => {
      switch (weightDimension) {
        case 'bank': return selectedBankIds.length > 0 ? selectedBankIds : publishedBanks.map(b => b.id)
        case 'type': return selectedTypes.length > 0 ? selectedTypes : questionTypes
        case 'difficulty': return selectedDifficulties.length > 0 ? selectedDifficulties : difficulties
        case 'knowledge': return selectedKnowledgePoints.length > 0 ? selectedKnowledgePoints : knowledgePoints.map(k => k.id)
        default: return []
      }
    }

    const keys = getKeys()
    const weights = weightDimension === 'bank' ? bankWeights
      : weightDimension === 'type' ? typeWeights
      : weightDimension === 'difficulty' ? difficultyWeights
      : knowledgeWeights
    const norm = normalizeWeights(weights, keys)

    let total = 0
    keys.forEach(key => {
      const pool = getFilteredPoolForOption(weightDimension, key)
      const target = Math.round(count * (norm[key] || 0) / 100)
      total += Math.min(target, pool.length)
    })

    return total
  }, [weightDimension, basePool, selectedBankIds, selectedTypes, selectedDifficulties, selectedKnowledgePoints, publishedBanks, bankWeights, typeWeights, difficultyWeights, knowledgeWeights, count, normalizeWeights, getFilteredPoolForOption])

  const handleRandomSelect = () => {
    let selected: Question[] = []

    if (weightDimension === 'none') {
      let pool = [...basePool]
      if (selectedBankIds.length > 0) pool = pool.filter(q => selectedBankIds.includes(q.bankId))
      if (selectedTypes.length > 0) pool = pool.filter(q => selectedTypes.includes(q.type))
      if (selectedDifficulties.length > 0) pool = pool.filter(q => q.difficulty && selectedDifficulties.includes(q.difficulty))
      if (selectedKnowledgePoints.length > 0) pool = pool.filter(q => q.knowledgePoints?.some(kp => selectedKnowledgePoints.includes(kp)))

      const shuffled = [...pool]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      selected = shuffled.slice(0, Math.min(count, shuffled.length))
    } else {
      const getKeys = () => {
        switch (weightDimension) {
          case 'bank': return selectedBankIds.length > 0 ? selectedBankIds : publishedBanks.map(b => b.id)
          case 'type': return selectedTypes.length > 0 ? selectedTypes : questionTypes
          case 'difficulty': return selectedDifficulties.length > 0 ? selectedDifficulties : difficulties
          case 'knowledge': return selectedKnowledgePoints.length > 0 ? selectedKnowledgePoints : knowledgePoints.map(k => k.id)
          default: return []
        }
      }

      const keys = getKeys()
      const weights = weightDimension === 'bank' ? bankWeights
        : weightDimension === 'type' ? typeWeights
        : weightDimension === 'difficulty' ? difficultyWeights
        : knowledgeWeights
      const norm = normalizeWeights(weights, keys)

      const usedIds = new Set<string>()
      const quotas: { key: string; target: number }[] = keys.map(key => ({
        key,
        target: Math.round(count * (norm[key] || 0) / 100),
      }))

      // 第一轮：按配额抽取
      quotas.forEach(({ key, target }) => {
        const pool = getFilteredPoolForOption(weightDimension, key).filter(q => !usedIds.has(q.id))
        const take = Math.min(target, pool.length)
        for (let i = 0; i < take; i++) {
          const idx = Math.floor(Math.random() * pool.length)
          const q = pool.splice(idx, 1)[0]
          if (q && !usedIds.has(q.id)) {
            selected.push(q)
            usedIds.add(q.id)
          }
        }
      })

      // 第二轮：如果数量不足，从剩余题目中随机补齐
      if (selected.length < count) {
        let remaining: Question[] = []
        keys.forEach(key => {
          remaining.push(...getFilteredPoolForOption(weightDimension, key).filter(q => !usedIds.has(q.id)))
        })
        remaining = remaining.filter((q, i, arr) => arr.findIndex(x => x.id === q.id) === i)
        const need = count - selected.length
        for (let i = 0; i < Math.min(need, remaining.length); i++) {
          const idx = Math.floor(Math.random() * remaining.length)
          const q = remaining.splice(idx, 1)[0]
          if (q && !usedIds.has(q.id)) {
            selected.push(q)
            usedIds.add(q.id)
          }
        }
      }

      // Fisher-Yates 打乱最终顺序
      for (let i = selected.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[selected[i], selected[j]] = [selected[j], selected[i]]
      }
    }

    onAddQuestions(selected)
    handleClose()
  }

  const handleClose = () => {
    setSelectedBankIds([])
    setSelectedTypes([])
    setSelectedDifficulties([])
    setSelectedKnowledgePoints([])
    setCount(5)
    setWeightDimension('none')
    setBankWeights({})
    setTypeWeights({})
    setDifficultyWeights({})
    setKnowledgeWeights({})
    onOpenChange(false)
  }

  const toggleType = (type: QuestionType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleDifficulty = (difficulty: Difficulty) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    )
  }

  const renderWeightConfig = (
    dim: WeightDimension,
    options: { value: string; label: string; subtitle?: string }[],
    weights: Record<string, number>,
    setWeights: React.Dispatch<React.SetStateAction<Record<string, number>>>
  ) => {
    if (weightDimension !== dim) return null
    const norm = normalizeWeights(weights, options.map(o => o.value))
    const sum = Object.values(norm).reduce((s, v) => s + v, 0)

    return (
      <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>配置各选项占比（总和自动校准为100%）</span>
          <span className={sum === 100 ? 'text-green-600' : 'text-amber-600'}>当前总和：{sum}%</span>
        </div>
        {options.map(opt => (
          <div key={opt.value} className="flex items-center gap-3">
            <span className="w-24 text-sm truncate">{opt.label}</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={weights[opt.value] ?? ''}
              placeholder="0"
              onChange={(e) => setWeight(setWeights, opt.value, parseInt(e.target.value) || 0)}
              className="h-7 w-20 text-sm"
            />
            <span className="text-xs text-muted-foreground w-12">{norm[opt.value] ?? 0}%</span>
            {opt.subtitle && <span className="text-xs text-muted-foreground">{opt.subtitle}</span>}
          </div>
        ))}
      </div>
    )
  }

  const isWeightEnabled = (dim: WeightDimension) => weightDimension === dim
  const canEnableWeight = (dim: WeightDimension) => weightDimension === 'none' || weightDimension === dim

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[720px]" annotationContext="random-question">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="size-5" />
            随机抽题
          </DialogTitle>
          <DialogDescription>
            选择筛选条件，可针对某一维度配置权重进行比例抽题
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[58vh]">
          <div className="flex flex-col gap-5 pr-4">

            {/* 维度说明 */}
            <Alert className="py-2">
              <Info className="size-4" />
              <AlertDescription className="text-xs">
                一次只能对一个维度启用权重，其他维度仅作为筛选条件。权重维度会按配置比例分配抽题数量，筛选维度用于缩小题目池范围。
              </AlertDescription>
            </Alert>

            {/* 选择题库 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="font-medium">选择题库</Label>
                  <p className="text-xs text-muted-foreground">不选则从全部已发布题库中抽取</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">启用权重</span>
                  <Switch
                    checked={isWeightEnabled('bank')}
                    onCheckedChange={() => toggleDimension('bank')}
                    disabled={!canEnableWeight('bank')}
                  />
                </div>
              </div>
              {publishedBanks.length === 0 ? (
                <Alert><Info className="size-4" /><AlertDescription>暂无已发布的题库</AlertDescription></Alert>
              ) : (
                <>
                  <MultiSelectSearch
                    options={publishedBanks.map(b => ({ label: b.name, value: b.id, subtitle: `${b.questionCount}题` }))}
                    selected={selectedBankIds}
                    onChange={setSelectedBankIds}
                    placeholder="选择题库"
                    searchPlaceholder="搜索题库名称..."
                  />
                  {renderWeightConfig('bank',
                    (selectedBankIds.length > 0 ? selectedBankIds : publishedBanks.map(b => b.id))
                      .map(id => {
                        const b = publishedBanks.find(x => x.id === id)
                        return { value: id, label: b?.name || id, subtitle: `${b?.questionCount || 0}题` }
                      }),
                    bankWeights,
                    setBankWeights
                  )}
                </>
              )}
            </div>

            {/* 选择题型 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="font-medium">题目类型</Label>
                  <p className="text-xs text-muted-foreground">不选则包含全部题型</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">启用权重</span>
                  <Switch
                    checked={isWeightEnabled('type')}
                    onCheckedChange={() => toggleDimension('type')}
                    disabled={!canEnableWeight('type')}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {questionTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleType(type)}
                  >
                    {QUESTION_TYPE_LABELS[type]}
                  </Badge>
                ))}
              </div>
              {renderWeightConfig('type',
                (selectedTypes.length > 0 ? selectedTypes : questionTypes)
                  .map(t => ({ value: t, label: QUESTION_TYPE_LABELS[t] })),
                typeWeights,
                setTypeWeights
              )}
            </div>

            {/* 选择难度 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="font-medium">难度等级</Label>
                  <p className="text-xs text-muted-foreground">不选则包含全部难度</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">启用权重</span>
                  <Switch
                    checked={isWeightEnabled('difficulty')}
                    onCheckedChange={() => toggleDimension('difficulty')}
                    disabled={!canEnableWeight('difficulty')}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <Badge
                    key={difficulty}
                    variant={selectedDifficulties.includes(difficulty) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleDifficulty(difficulty)}
                  >
                    {DIFFICULTY_LABELS[difficulty]}
                  </Badge>
                ))}
              </div>
              {renderWeightConfig('difficulty',
                (selectedDifficulties.length > 0 ? selectedDifficulties : difficulties)
                  .map(d => ({ value: d, label: DIFFICULTY_LABELS[d] })),
                difficultyWeights,
                setDifficultyWeights
              )}
            </div>

            {/* 选择知识点 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="font-medium">知识点</Label>
                  <p className="text-xs text-muted-foreground">不选则包含全部知识点</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">启用权重</span>
                  <Switch
                    checked={isWeightEnabled('knowledge')}
                    onCheckedChange={() => toggleDimension('knowledge')}
                    disabled={!canEnableWeight('knowledge')}
                  />
                </div>
              </div>
              {loadingKnowledgePoints ? (
                <div className="text-sm text-muted-foreground">加载知识点中...</div>
              ) : (
                <MultiSelectSearch
                  options={knowledgePoints.map(kp => ({ label: kp.name, value: kp.id }))}
                  selected={selectedKnowledgePoints}
                  onChange={setSelectedKnowledgePoints}
                  placeholder="选择知识点"
                  searchPlaceholder="搜索知识点..."
                />
              )}
              {renderWeightConfig('knowledge',
                (selectedKnowledgePoints.length > 0 ? selectedKnowledgePoints : knowledgePoints.map(k => k.id))
                  .map(id => {
                    const k = knowledgePoints.find(x => x.id === id)
                    return { value: id, label: k?.name || id }
                  }),
                knowledgeWeights,
                setKnowledgeWeights
              )}
            </div>

            {/* 抽取数量 */}
            <div className="rounded-lg border p-4">
              <Label className="mb-2 block font-medium">抽取数量</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  道题目{weightDimension !== 'none' && (
                    <span className="ml-1 text-amber-600">（权重模式下预估可抽取约 {weightedAvailableCount} 道）</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <div className="flex-1 text-sm text-muted-foreground">
            {weightedAvailableCount === 0 ? (
              <span className="text-destructive flex items-center gap-1">
                <AlertCircle className="size-4" />当前条件下没有可用题目
              </span>
            ) : (
              <span>
                {weightDimension === 'none'
                  ? `将随机抽取 ${Math.min(count, weightedAvailableCount)} 道题目`
                  : `权重模式下将抽取 ${Math.min(count, weightedAvailableCount)} 道题目（目标 ${count} 道）`
                }
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>取消</Button>
            <Button onClick={handleRandomSelect} disabled={weightedAvailableCount === 0}>
              <Shuffle className="mr-2 size-4" />
              随机抽题
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
