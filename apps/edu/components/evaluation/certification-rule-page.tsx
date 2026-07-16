// @ts-nocheck
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit2, Check, Info, Settings } from 'lucide-react'

/* ─── 届别类型 ─── */
type GradeYear = '2024' | '2025' | '2026'

const DEFAULT_RULE: CertificationRule = {
  id: 'global',
  positionName: '前端开发工程师',
  status: 'draft',
  ruleSource: 'custom',
  abilityItems: [],
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  type CertificationRule,
  type LevelMapping,
  type RuleStatus,
  type EvalAbilityItem,
  defaultLevelMapping,
} from '@/lib/types'
import { positionApi } from '@/lib/api'
import { ActionBar } from './action-bar'
import { LevelMappingDialog } from './level-mapping-dialog'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import Link from 'next/link'
import { PrdAnnotation } from '@/components/prd-annotation'
import { getAnnotation } from '@/lib/prd-annotations'

interface CertificationRulePageProps {
  isGlobal?: boolean
  positionId?: string
}

/* ─── 前端开发工程师各届能力项数据 ─── */
const grade2024AbilityItems: EvalAbilityItem[] = [
  {
    id: 'item-1-2024',
    name: '岗位与行业认知',
    abilityPoints: [
      {
        id: 'point-1-1-2024',
        name: '前端行业发展趋势',
        description: '了解前端开发行业的发展历程、主流技术栈及未来趋势，能够把握技术演进方向。',
        mappingType: 'custom',
        requiredLevel: '掌握',
        weight: 18,
        customMapping: [
          { level: '未达标', min: 0, max: 55 },
          { level: '了解', min: 56, max: 68 },
          { level: '理解', min: 69, max: 78 },
          { level: '掌握', min: 79, max: 88 },
          { level: '熟练', min: 89, max: 95 },
          { level: '精通', min: 96, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-1-2024', name: 'Web前端实训室-前端基础知识测试', maxScore: 100, weight: 60 },
          { id: 'task-7-2024', name: '在线学习平台-技术调研报告', maxScore: 80, weight: 40 },
        ],
      },
      {
        id: 'point-1-2-2024',
        name: '岗位职责与规范认知',
        description: '清晰理解前端开发工程师的岗位职责，包括页面开发、性能优化、用户体验提升等核心工作内容。',
        mappingType: 'inherit',
        requiredLevel: '理解',
        weight: 12,
        relatedTasks: [],
      },
    ],
  },
  {
    id: 'item-2-2024',
    name: '专业技能',
    abilityPoints: [
      {
        id: 'point-2-1-2024',
        name: 'JavaScript 基础编程',
        description: '熟练掌握 JavaScript 语言基础，包括 DOM 操作、事件处理、AJAX 等传统前端开发技能。',
        mappingType: 'custom',
        requiredLevel: '熟练',
        weight: 20,
        customMapping: [
          { level: '未达标', min: 0, max: 50 },
          { level: '了解', min: 51, max: 65 },
          { level: '理解', min: 66, max: 75 },
          { level: '掌握', min: 76, max: 85 },
          { level: '熟练', min: 86, max: 92 },
          { level: '精通', min: 93, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-2-2024', name: '软件工程实训室-JavaScript编程实践', maxScore: 100, weight: 50 },
          { id: 'task-5-2024', name: '项目评审室-项目实战考核', maxScore: 150, weight: 30 },
          { id: 'task-9-2024', name: 'Web前端实训室-性能优化实践', maxScore: 100, weight: 20 },
        ],
      },
      {
        id: 'point-2-2-2024',
        name: 'jQuery 与 Bootstrap 应用',
        description: '熟练使用 jQuery 进行 DOM 操作和事件处理，掌握 Bootstrap 响应式布局框架。',
        mappingType: 'custom',
        requiredLevel: '熟练',
        weight: 17,
        customMapping: [
          { level: '未达标', min: 0, max: 50 },
          { level: '了解', min: 51, max: 65 },
          { level: '理解', min: 66, max: 75 },
          { level: '掌握', min: 76, max: 85 },
          { level: '熟练', min: 86, max: 92 },
          { level: '精通', min: 93, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-3-2024', name: 'Web前端实训室-jQuery项目实战', maxScore: 100, weight: 70 },
          { id: 'task-5-2024', name: '项目评审室-项目实战考核', maxScore: 150, weight: 30 },
        ],
      },
      {
        id: 'point-2-3-2024',
        name: 'CSS 布局与样式',
        description: '精通 CSS 布局技术，包括 Flexbox、Grid、响应式设计等，能够实现复杂的页面布局。',
        mappingType: 'inherit',
        requiredLevel: '掌握',
        weight: 13,
        relatedTasks: [
          { id: 'task-4-2024', name: 'Web前端实训室-CSS布局与样式', maxScore: 100, weight: 100 },
        ],
      },
    ],
  },
  {
    id: 'item-3-2024',
    name: '软技能',
    abilityPoints: [
      {
        id: 'point-3-1-2024',
        name: '团队协作能力',
        description: '具备良好的团队协作能力，能够与产品、设计、后端等角色有效沟通，推动项目顺利进行。',
        mappingType: 'custom',
        requiredLevel: '掌握',
        weight: 10,
        customMapping: [
          { level: '未达标', min: 0, max: 55 },
          { level: '了解', min: 56, max: 68 },
          { level: '理解', min: 69, max: 78 },
          { level: '掌握', min: 79, max: 88 },
          { level: '熟练', min: 89, max: 95 },
          { level: '精通', min: 96, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-8-2024', name: '协作学习空间-团队协作评估', maxScore: 100, weight: 100 },
        ],
      },
      {
        id: 'point-3-2-2024',
        name: '技术文档能力',
        description: '能够编写清晰、规范的技术文档，包括接口文档、组件文档、项目说明等。',
        mappingType: 'inherit',
        requiredLevel: '理解',
        weight: 10,
        relatedTasks: [
          { id: 'task-7-2024', name: '在线学习平台-技术文档撰写', maxScore: 80, weight: 100 },
        ],
      },
    ],
  },
]

const grade2025AbilityItems: EvalAbilityItem[] = [
  {
    id: 'item-1-2025',
    name: '岗位与行业认知',
    abilityPoints: [
      {
        id: 'point-1-1-2025',
        name: '现代前端生态认知',
        description: '深入理解现代前端工程化体系，包括模块化、组件化、构建工具链及前端架构演进。',
        mappingType: 'custom',
        requiredLevel: '掌握',
        weight: 18,
        customMapping: [
          { level: '未达标', min: 0, max: 55 },
          { level: '了解', min: 56, max: 68 },
          { level: '理解', min: 69, max: 78 },
          { level: '掌握', min: 79, max: 88 },
          { level: '熟练', min: 89, max: 95 },
          { level: '精通', min: 96, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-1-2025', name: 'Web前端实训室-前端工程化测试', maxScore: 100, weight: 60 },
          { id: 'task-7-2025', name: '在线学习平台-框架对比分析', maxScore: 80, weight: 40 },
        ],
      },
      {
        id: 'point-1-2-2025',
        name: '前端工程化思维',
        description: '具备前端工程化思维，理解代码规范、版本控制、持续集成等开发流程。',
        mappingType: 'inherit',
        requiredLevel: '理解',
        weight: 12,
        relatedTasks: [],
      },
    ],
  },
  {
    id: 'item-2-2025',
    name: '专业技能',
    abilityPoints: [
      {
        id: 'point-2-1-2025',
        name: 'TypeScript 应用开发',
        description: '熟练使用 TypeScript 进行类型安全的前端开发，掌握接口、泛型、类型推断等核心特性。',
        mappingType: 'custom',
        requiredLevel: '熟练',
        weight: 20,
        customMapping: [
          { level: '未达标', min: 0, max: 50 },
          { level: '了解', min: 51, max: 65 },
          { level: '理解', min: 66, max: 75 },
          { level: '掌握', min: 76, max: 85 },
          { level: '熟练', min: 86, max: 92 },
          { level: '精通', min: 93, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-2-2025', name: '软件工程实训室-TypeScript项目实战', maxScore: 100, weight: 50 },
          { id: 'task-5-2025', name: '项目评审室-全栈项目考核', maxScore: 150, weight: 30 },
          { id: 'task-9-2025', name: 'Web前端实训室-类型系统实践', maxScore: 100, weight: 20 },
        ],
      },
      {
        id: 'point-2-2-2025',
        name: 'Vue / React 框架应用',
        description: '熟练使用 Vue 或 React 框架进行组件化开发，理解响应式原理、Hooks、状态管理等核心概念。',
        mappingType: 'custom',
        requiredLevel: '熟练',
        weight: 17,
        customMapping: [
          { level: '未达标', min: 0, max: 50 },
          { level: '了解', min: 51, max: 65 },
          { level: '理解', min: 66, max: 75 },
          { level: '掌握', min: 76, max: 85 },
          { level: '熟练', min: 86, max: 92 },
          { level: '精通', min: 93, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-3-2025', name: 'React专项训练室-组件化开发实战', maxScore: 100, weight: 70 },
          { id: 'task-5-2025', name: '项目评审室-全栈项目考核', maxScore: 150, weight: 30 },
        ],
      },
      {
        id: 'point-2-3-2025',
        name: '前端构建工具链',
        description: '掌握 Webpack / Vite 等构建工具的配置与优化，理解打包原理和性能优化策略。',
        mappingType: 'inherit',
        requiredLevel: '掌握',
        weight: 13,
        relatedTasks: [
          { id: 'task-4-2025', name: 'Web前端实训室-构建工具配置实战', maxScore: 100, weight: 100 },
        ],
      },
    ],
  },
  {
    id: 'item-3-2025',
    name: '软技能',
    abilityPoints: [
      {
        id: 'point-3-1-2025',
        name: '团队协作与沟通',
        description: '具备良好的团队协作能力，能够与产品、设计、后端等角色有效沟通，推动项目顺利进行。',
        mappingType: 'custom',
        requiredLevel: '掌握',
        weight: 10,
        customMapping: [
          { level: '未达标', min: 0, max: 55 },
          { level: '了解', min: 56, max: 68 },
          { level: '理解', min: 69, max: 78 },
          { level: '掌握', min: 79, max: 88 },
          { level: '熟练', min: 89, max: 95 },
          { level: '精通', min: 96, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-8-2025', name: '协作学习空间-敏捷开发协作评估', maxScore: 100, weight: 100 },
        ],
      },
      {
        id: 'point-3-2-2025',
        name: '代码审查能力',
        description: '能够进行有效的代码审查，发现潜在问题并提出改进建议，提升团队代码质量。',
        mappingType: 'inherit',
        requiredLevel: '理解',
        weight: 10,
        relatedTasks: [
          { id: 'task-7-2025', name: '在线学习平台-代码审查报告', maxScore: 80, weight: 100 },
        ],
      },
    ],
  },
]

const grade2026AbilityItems: EvalAbilityItem[] = [
  {
    id: 'item-1-2026',
    name: '岗位与行业认知',
    abilityPoints: [
      {
        id: 'point-1-1-2026',
        name: '全栈前端架构认知',
        description: '理解全栈前端架构理念，掌握服务端渲染、边缘计算、微前端等前沿技术方向。',
        mappingType: 'custom',
        requiredLevel: '掌握',
        weight: 18,
        customMapping: [
          { level: '未达标', min: 0, max: 55 },
          { level: '了解', min: 56, max: 68 },
          { level: '理解', min: 69, max: 78 },
          { level: '掌握', min: 79, max: 88 },
          { level: '熟练', min: 89, max: 95 },
          { level: '精通', min: 96, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-1-2026', name: 'Web前端实训室-架构设计答辩', maxScore: 100, weight: 60 },
          { id: 'task-7-2026', name: '在线学习平台-技术趋势研究报告', maxScore: 80, weight: 40 },
        ],
      },
      {
        id: 'point-1-2-2026',
        name: 'DevOps 与持续交付',
        description: '理解 DevOps 理念，掌握 CI/CD 流程、容器化部署等现代交付实践。',
        mappingType: 'inherit',
        requiredLevel: '理解',
        weight: 12,
        relatedTasks: [],
      },
    ],
  },
  {
    id: 'item-2-2026',
    name: '专业技能',
    abilityPoints: [
      {
        id: 'point-2-1-2026',
        name: 'Next.js / Nuxt 全栈开发',
        description: '熟练使用 Next.js 或 Nuxt.js 进行全栈开发，掌握 SSR/SSG、API Routes、边缘渲染等技术。',
        mappingType: 'custom',
        requiredLevel: '熟练',
        weight: 20,
        customMapping: [
          { level: '未达标', min: 0, max: 50 },
          { level: '了解', min: 51, max: 65 },
          { level: '理解', min: 66, max: 75 },
          { level: '掌握', min: 76, max: 85 },
          { level: '熟练', min: 86, max: 92 },
          { level: '精通', min: 93, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-2-2026', name: '软件工程实训室-全栈项目开发', maxScore: 100, weight: 50 },
          { id: 'task-5-2026', name: '项目评审室-微前端架构考核', maxScore: 150, weight: 30 },
          { id: 'task-9-2026', name: 'Web前端实训室-边缘渲染实践', maxScore: 100, weight: 20 },
        ],
      },
      {
        id: 'point-2-2-2026',
        name: '微前端与模块联邦',
        description: '掌握微前端架构设计与实现，理解 Module Federation、qiankun 等微前端方案。',
        mappingType: 'custom',
        requiredLevel: '熟练',
        weight: 17,
        customMapping: [
          { level: '未达标', min: 0, max: 50 },
          { level: '了解', min: 51, max: 65 },
          { level: '理解', min: 66, max: 75 },
          { level: '掌握', min: 76, max: 85 },
          { level: '熟练', min: 86, max: 92 },
          { level: '精通', min: 93, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-3-2026', name: 'React专项训练室-微前端拆分实战', maxScore: 100, weight: 70 },
          { id: 'task-5-2026', name: '项目评审室-微前端架构考核', maxScore: 150, weight: 30 },
        ],
      },
      {
        id: 'point-2-3-2026',
        name: 'Node.js 服务端基础',
        description: '具备 Node.js 服务端开发能力，能够编写 API 接口、中间件，理解服务端运行原理。',
        mappingType: 'inherit',
        requiredLevel: '掌握',
        weight: 13,
        relatedTasks: [
          { id: 'task-4-2026', name: 'Web前端实训室-Node.js后端开发', maxScore: 100, weight: 100 },
        ],
      },
    ],
  },
  {
    id: 'item-3-2026',
    name: '软技能',
    abilityPoints: [
      {
        id: 'point-3-1-2026',
        name: '跨团队协作与领导力',
        description: '具备跨团队协作能力和一定的技术领导力，能够带领小团队完成复杂项目交付。',
        mappingType: 'custom',
        requiredLevel: '掌握',
        weight: 10,
        customMapping: [
          { level: '未达标', min: 0, max: 55 },
          { level: '了解', min: 56, max: 68 },
          { level: '理解', min: 69, max: 78 },
          { level: '掌握', min: 79, max: 88 },
          { level: '熟练', min: 89, max: 95 },
          { level: '精通', min: 96, max: 100 },
        ],
        relatedTasks: [
          { id: 'task-8-2026', name: '协作学习空间-技术方案评审', maxScore: 100, weight: 100 },
        ],
      },
      {
        id: 'point-3-2-2026',
        name: '系统设计与方案输出',
        description: '能够独立完成前端系统方案设计，输出高质量的技术方案和架构文档。',
        mappingType: 'inherit',
        requiredLevel: '理解',
        weight: 10,
        relatedTasks: [
          { id: 'task-7-2026', name: '在线学习平台-系统架构设计文档', maxScore: 80, weight: 100 },
        ],
      },
    ],
  },
]

const GRADE_ABILITY_ITEMS_MAP: Record<string, Record<GradeYear, EvalAbilityItem[]>> = {
  'pos-1': {
    '2024': grade2024AbilityItems,
    '2025': grade2025AbilityItems,
    '2026': grade2026AbilityItems,
  },
}

function formatLevelLabel(level: string): string {
  const mapping: Record<string, string> = {
    '了解': '了解L1',
    '理解': '理解L2',
    '掌握': '掌握L3',
    '熟练': '熟练L4',
    '精通': '精通L5',
  }
  return mapping[level] || level
}

function formatLevelMapping(mapping: LevelMapping[]): string {
  return mapping
    .map((level) => `${formatLevelLabel(level.level)}：${level.min}~${level.max}`)
    .join('，')
}

interface TaskRowData {
  abilityItemId: string
  abilityItemName: string
  abilityPointId: string
  abilityPointName: string
  taskId: string
  taskName: string
  taskMaxScore: number
  levelMapping: string
  weight: number
  requiredLevel: string
  isFirstOfAbilityItem: boolean
  isFirstOfAbilityPoint: boolean
  abilityItemRowSpan: number
  abilityPointRowSpan: number
  mappingType: 'inherit' | 'custom'
  customMapping?: LevelMapping[]
  pointWeight: number
}

function WeightConfigDialog({
  open, onOpenChange, title, items, onSave, variant = 'card',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  items: { id: string; name: string; weight: number; relatedTasks?: { id: string; name: string }[] }[]
  onSave: (weights: Record<string, number>) => void
  variant?: 'card' | 'table'
}) {
  const [localWeights, setLocalWeights] = useState<Record<string, number>>({})
  useMemo(() => {
    if (open) {
      const map: Record<string, number> = {}
      items.forEach((i) => { map[i.id] = i.weight })
      setLocalWeights(map)
    }
  }, [open, items])
  const total = Object.values(localWeights).reduce((s, v) => s + (v || 0), 0)
  const isValid = total === 100
  const handleChange = (id: string, val: string) => {
    const num = parseInt(val, 10) || 0
    setLocalWeights((prev) => ({ ...prev, [id]: num }))
  }
  const handleSave = () => {
    if (!isValid) return
    onSave(localWeights)
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={variant === 'table' ? 'sm:max-w-4xl w-[900px]' : 'sm:max-w-lg'} annotationContext="certification-rule">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {variant === 'table'
              ? '配置各能力点占岗位权重，合计必须为 100%'
              : '配置各子节点权重，合计必须为 100%'
            }
          </DialogDescription>
        </DialogHeader>
        {variant === 'table' ? (
          <div className="py-4">
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-transparent">
                    <TableHead className="w-[50%] text-xs font-medium">关联场景任务</TableHead>
                    <TableHead className="w-[30%] text-xs font-medium">能力点</TableHead>
                    <TableHead className="w-[20%] text-xs font-medium text-center">能力点占岗位权重</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const tasks = item.relatedTasks && item.relatedTasks.length > 0 ? item.relatedTasks : null
                    const rowSpan = tasks ? tasks.length : 1
                    return tasks ? (
                      tasks.map((task, idx) => (
                        <TableRow key={`${item.id}-${task.id}`} className="hover:bg-transparent">
                          <TableCell className="text-xs text-muted-foreground py-2.5">{task.name}</TableCell>
                          {idx === 0 && (
                            <>
                              <TableCell rowSpan={rowSpan} className="text-sm font-medium align-middle py-2.5 bg-muted/20 border-l border-r border-border">
                                {item.name}
                              </TableCell>
                              <TableCell rowSpan={rowSpan} className="text-center align-middle py-2.5 bg-muted/10">
                                <div className="flex items-center justify-center gap-1">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={localWeights[item.id] ?? item.weight}
                                    onChange={(e) => handleChange(item.id, e.target.value)}
                                    className="w-16 h-7 text-center text-sm px-1"
                                  />
                                  <span className="text-muted-foreground text-xs">%</span>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow key={item.id} className="hover:bg-transparent">
                        <TableCell className="text-xs text-muted-foreground py-2.5">--</TableCell>
                        <TableCell className="text-sm font-medium py-2.5 bg-muted/20 border-l border-r border-border">{item.name}</TableCell>
                        <TableCell className="text-center py-2.5 bg-muted/10">
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={localWeights[item.id] ?? item.weight}
                              onChange={(e) => handleChange(item.id, e.target.value)}
                              className="w-16 h-7 text-center text-sm px-1"
                            />
                            <span className="text-muted-foreground text-xs">%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className={`text-sm font-medium text-right mt-3 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              当前合计：{total}% {isValid ? '✓' : '（必须为 100%）'}
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-md bg-secondary/50 border border-border">
                <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Input type="number" min={0} max={100} value={localWeights[item.id] ?? item.weight} onChange={(e) => handleChange(item.id, e.target.value)} className="w-20 h-8 text-center" />
                  <span className="text-muted-foreground text-sm">%</span>
                </div>
              </div>
            ))}
            <div className={`text-sm font-medium text-right ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              当前合计：{total}% {isValid ? '✓' : '（必须为 100%）'}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={!isValid}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getGradeAbilityItems(positionId: string | undefined, grade: GradeYear): EvalAbilityItem[] {
  if (positionId && GRADE_ABILITY_ITEMS_MAP[positionId]?.[grade]) {
    return GRADE_ABILITY_ITEMS_MAP[positionId][grade]
  }
  return grade2024AbilityItems
}

export function CertificationRulePage({ isGlobal = false, positionId }: CertificationRulePageProps) {
  const [positionName, setPositionName] = useState<string | undefined>(undefined)
  const pageTitle = isGlobal ? '全局能力认定规则配置' : positionName || '前端开发工程师'
  const [activeGrade, setActiveGrade] = useState<GradeYear>('2024')
  const [rule, setRule] = useState<CertificationRule>(() => ({
    ...DEFAULT_RULE,
    abilityItems: getGradeAbilityItems(positionId, '2024'),
  }))

  useEffect(() => {
    if (!positionId) return
    let cancelled = false
    positionApi.get(positionId)
      .then((res) => {
        if (!cancelled) setPositionName(res.name)
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load position', err)
      })
    return () => { cancelled = true }
  }, [positionId])
  const [globalMapping, setGlobalMapping] = useState<LevelMapping[]>(defaultLevelMapping)
  const [globalConfigDialogOpen, setGlobalConfigDialogOpen] = useState(false)
  const { toast } = useToast()

  const [pointWeightDialogOpen, setPointWeightDialogOpen] = useState(false)
  const [taskWeightDialogOpen, setTaskWeightDialogOpen] = useState(false)
  const [weightDialogItemId, setWeightDialogItemId] = useState<string>('')
  const [weightDialogPointId, setWeightDialogPointId] = useState<string>('')

  const [editingTaskMapping, setEditingTaskMapping] = useState<{
    abilityItemId: string
    abilityPointId: string
    taskId: string
    taskName: string
    mapping: LevelMapping[]
  } | null>(null)
  const [overrideConfirmOpen, setOverrideConfirmOpen] = useState(false)

  const isReadOnly = rule.status === 'reviewing'

  const hasValidationErrors = useMemo(() => {
    return rule.abilityItems.some((item) =>
      item.abilityPoints.some((point) => {
        if (point.relatedTasks.length === 0) return false
        const totalWeight = point.relatedTasks.reduce((sum, t) => sum + t.weight, 0)
        return totalWeight !== 100
      }),
    )
  }, [rule.abilityItems])

  const tableRows: TaskRowData[] = useMemo(() => {
    const rows: TaskRowData[] = []
    rule.abilityItems.forEach((item) => {
      let abilityItemRowCount = 0
      item.abilityPoints.forEach((point) => { abilityItemRowCount += Math.max(point.relatedTasks.length, 1) })
      let isFirstOfAbilityItem = true
      item.abilityPoints.forEach((point) => {
        const abilityPointRowCount = Math.max(point.relatedTasks.length, 1)
        let isFirstOfAbilityPoint = true
        if (point.relatedTasks.length === 0) {
          rows.push({
            abilityItemId: item.id, abilityItemName: item.name,
            abilityPointId: point.id, abilityPointName: point.name,
            taskId: '', taskName: '--', taskMaxScore: 0, levelMapping: '--', weight: 0,
            requiredLevel: point.requiredLevel, isFirstOfAbilityItem, isFirstOfAbilityPoint,
            abilityItemRowSpan: isFirstOfAbilityItem ? abilityItemRowCount : 0,
            abilityPointRowSpan: isFirstOfAbilityPoint ? abilityPointRowCount : 0,
            mappingType: point.mappingType, customMapping: point.customMapping,
            pointWeight: point.weight || 0,
          })
          isFirstOfAbilityItem = false
          isFirstOfAbilityPoint = false
        } else {
          point.relatedTasks.forEach((task) => {
            const mapping = point.mappingType === 'custom' && point.customMapping ? point.customMapping : globalMapping
            rows.push({
              abilityItemId: item.id, abilityItemName: item.name,
              abilityPointId: point.id, abilityPointName: point.name,
              taskId: task.id, taskName: task.name, taskMaxScore: task.maxScore,
              levelMapping: formatLevelMapping(mapping), weight: task.weight,
              requiredLevel: point.requiredLevel, isFirstOfAbilityItem, isFirstOfAbilityPoint,
              abilityItemRowSpan: isFirstOfAbilityItem ? abilityItemRowCount : 0,
              abilityPointRowSpan: isFirstOfAbilityPoint ? abilityPointRowCount : 0,
              mappingType: point.mappingType, customMapping: point.customMapping,
              pointWeight: point.weight || 0,
            })
            isFirstOfAbilityItem = false
            isFirstOfAbilityPoint = false
          })
        }
      })
    })
    return rows
  }, [rule.abilityItems, globalMapping])

  const updateStatus = (status: RuleStatus) => { setRule({ ...rule, status }) }

  const handleSaveDraft = () => {
    updateStatus('draft')
    toast({ title: '保存成功', description: '规则已保存为草稿' })
  }

  const handleSubmitReview = () => {
    if (hasValidationErrors) {
      toast({ title: '提交失败', description: '请确保所有能力点的权重合计为100%', variant: 'destructive' })
      return
    }
    updateStatus('reviewing')
    toast({ title: '提交成功', description: '规则已提交审批，请等待审批结果' })
  }

  const handleCancelReview = () => {
    updateStatus('draft')
    toast({ title: '已取消', description: '审批已取消，规则回到草稿状态' })
  }

  const handlePublish = () => {
    updateStatus('published')
    toast({ title: '发布成功', description: '规则已发布生效' })
  }

  const handleCancelPublish = () => {
    updateStatus('none')
    toast({ title: '已取消发布', description: '岗位已变为无规则状态' })
  }

  const handleInviteCollaborate = () => {
    toast({ title: '邀请共建', description: '邀请链接已复制到剪贴板' })
  }

  const handleOpenPointWeightDialog = () => {
    if (isReadOnly) return
    setPointWeightDialogOpen(true)
  }

  const handleSavePointWeights = (weights: Record<string, number>) => {
    setRule((prev) => ({
      ...prev,
      abilityItems: prev.abilityItems.map((item) => ({
        ...item,
        abilityPoints: item.abilityPoints.map((point) =>
          weights[point.id] !== undefined ? { ...point, weight: weights[point.id] } : point
        ),
      })),
    }))
    toast({ title: '保存成功', description: '能力点权重已更新' })
  }

  const handleOpenTaskWeightDialog = (abilityItemId: string, abilityPointId: string) => {
    if (isReadOnly) return
    setWeightDialogItemId(abilityItemId)
    setWeightDialogPointId(abilityPointId)
    setTaskWeightDialogOpen(true)
  }

  const handleSaveTaskWeights = (weights: Record<string, number>) => {
    setRule((prev) => ({
      ...prev,
      abilityItems: prev.abilityItems.map((item) =>
        item.id === weightDialogItemId
          ? {
              ...item,
              abilityPoints: item.abilityPoints.map((point) =>
                point.id === weightDialogPointId
                  ? { ...point, relatedTasks: point.relatedTasks.map((task) => weights[task.id] !== undefined ? { ...task, weight: weights[task.id] } : task) }
                  : point
              ),
            }
          : item
      ),
    }))
    toast({ title: '保存成功', description: '任务权重已更新' })
  }

  const handleToggleMappingType = (abilityItemId: string, abilityPointId: string, newType: 'inherit' | 'custom') => {
    if (isReadOnly) return
    if (newType === 'custom') {
      const abilityItem = rule.abilityItems.find((item) => item.id === abilityItemId)
      const abilityPoint = abilityItem?.abilityPoints.find((point) => point.id === abilityPointId)
      if (!abilityPoint) return
      const currentMapping = abilityPoint.customMapping || globalMapping.map((m) => ({ ...m }))
      setEditingTaskMapping({ abilityItemId, abilityPointId, taskId: '', taskName: abilityPoint.name, mapping: currentMapping })
    } else {
      setRule((prev) => ({
        ...prev,
        abilityItems: prev.abilityItems.map((item) =>
          item.id === abilityItemId
            ? { ...item, abilityPoints: item.abilityPoints.map((point) => point.id === abilityPointId ? { ...point, mappingType: 'inherit' as const } : point) }
            : item
        ),
      }))
      toast({ title: '已切换', description: '已切换为使用全局等级映射' })
    }
  }

  const handleSaveTaskMapping = () => {
    if (!editingTaskMapping) return
    setRule((prev) => ({
      ...prev,
      abilityItems: prev.abilityItems.map((item) =>
        item.id === editingTaskMapping.abilityItemId
          ? { ...item, abilityPoints: item.abilityPoints.map((point) => point.id === editingTaskMapping.abilityPointId ? { ...point, mappingType: 'custom' as const, customMapping: editingTaskMapping.mapping } : point) }
          : item
      ),
    }))
    setEditingTaskMapping(null)
    toast({ title: '保存成功', description: '自定义映射已更新' })
  }

  const handleOpenEditMapping = (row: TaskRowData) => {
    if (isReadOnly) return
    const abilityItem = rule.abilityItems.find((item) => item.id === row.abilityItemId)
    const abilityPoint = abilityItem?.abilityPoints.find((point) => point.id === row.abilityPointId)
    if (!abilityPoint) return
    const currentMapping = abilityPoint.mappingType === 'custom' && abilityPoint.customMapping ? abilityPoint.customMapping : globalMapping
    setEditingTaskMapping({ abilityItemId: row.abilityItemId, abilityPointId: row.abilityPointId, taskId: row.taskId, taskName: row.abilityPointName, mapping: currentMapping.map((m) => ({ ...m })) })
  }

  const scoreCalculationTip = '完成任务后，系统根据实际得分和任务权重计算换算分。完成某能力点关联的全部任务后，系统汇总换算分得出最终得分，并匹配对应掌握度等级。若无已完成任务，则不显示等级。'

  const pointWeightItems = useMemo(() => {
    const items: { id: string; name: string; weight: number; relatedTasks: { id: string; name: string }[] }[] = []
    rule.abilityItems.forEach((item) => {
      item.abilityPoints.forEach((point) => {
        items.push({
          id: point.id,
          name: `${item.name} · ${point.name}`,
          weight: point.weight || 0,
          relatedTasks: point.relatedTasks.map((t) => ({ id: t.id, name: t.name })),
        })
      })
    })
    return items
  }, [rule.abilityItems])

  const taskWeightItems = useMemo(() => {
    const item = rule.abilityItems.find((i) => i.id === weightDialogItemId)
    const point = item?.abilityPoints.find((p) => p.id === weightDialogPointId)
    return point ? point.relatedTasks.map((t) => ({ id: t.id, name: t.name, weight: t.weight })) : []
  }, [rule.abilityItems, weightDialogItemId, weightDialogPointId])

  return (
    <TooltipProvider>
      <div className={cn('min-h-screen bg-background pb-24', isReadOnly && 'pointer-events-none')}>
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/evaluation/job-ability">
              <Button variant="ghost" size="sm" className={cn('gap-2', isReadOnly && 'pointer-events-auto')}>
                <ArrowLeft className="size-4" />
                返回岗位列表
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className={cn('gap-2', isReadOnly && 'pointer-events-auto')} onClick={() => setGlobalConfigDialogOpen(true)}>
                <Settings className="size-4" />
                配置全局等级映射
              </Button>
              <Button variant="default" size="sm" className={cn('gap-2', isReadOnly && 'pointer-events-auto')} onClick={() => toast({ title: '保存成功', description: '规则已保存' })}>
                <Check className="size-4" />
                保存规则
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
            </div>
            <p className="mt-2 text-muted-foreground">配置能力认定规则 · 为每个能力点选择关联任务并分配权重</p>
          </div>

          {/* 届别 Tab */}
          <div className="mb-6 flex gap-3 border-b border-border">
            {(['2024', '2025', '2026'] as GradeYear[]).map((g) => (
              <button
                key={g}
                onClick={() => {
                  setActiveGrade(g)
                  setRule((prev) => ({
                    ...prev,
                    abilityItems: getGradeAbilityItems(positionId, g),
                  }))
                }}
                className={cn(
                  'px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                  activeGrade === g
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {g} 届
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableHead className="w-[120px] font-medium">能力域</TableHead>
                  <TableHead className="w-[130px] font-medium">能力点</TableHead>
                  <TableHead className="w-[90px] text-center font-medium">能力点权重</TableHead>
                  <TableHead className="w-[200px] font-medium">关联场景任务</TableHead>
                  <TableHead className="w-[80px] text-center font-medium">任务权重</TableHead>
                  <TableHead className="w-[180px] font-medium">
                    <div className="flex items-center gap-1">
                      任务能力掌握度
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5">
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p className="text-xs">{scoreCalculationTip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead className="w-[110px] text-center font-medium">岗位所需掌握度</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row, index) => (
                  <TableRow key={`${row.abilityPointId}-${row.taskId || index}`} className="group">
                    {row.isFirstOfAbilityItem && (
                      <TableCell rowSpan={row.abilityItemRowSpan} className="align-top font-medium bg-muted/10 border-r border-border">
                        {row.abilityItemName}
                      </TableCell>
                    )}
                    {row.isFirstOfAbilityPoint && (
                      <TableCell rowSpan={row.abilityPointRowSpan} className="align-top text-muted-foreground border-r border-border">
                        {row.abilityPointName}
                      </TableCell>
                    )}
                    {row.isFirstOfAbilityPoint && (
                      <TableCell rowSpan={row.abilityPointRowSpan} className="text-center align-top border-r border-border">
                        <PrdAnnotation data={getAnnotation("jac-btn-point-weight")}>
                          <button
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm transition-colors',
                              !isReadOnly && 'hover:bg-secondary cursor-pointer',
                            )}
                            onClick={() => handleOpenPointWeightDialog()}
                            disabled={isReadOnly}
                          >
                            <Edit2 className="h-3 w-3" />
                            {row.pointWeight > 0 ? `${row.pointWeight}%` : '--'}
                          </button>
                        </PrdAnnotation>
                      </TableCell>
                    )}
                    <TableCell className="text-primary">
                      {row.taskName !== '--' ? row.taskName : <span className="text-muted-foreground">--</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.weight > 0 ? (
                        <PrdAnnotation data={getAnnotation("jac-btn-task-weight")}>
                          <button
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm transition-colors',
                              !isReadOnly && 'hover:bg-secondary cursor-pointer',
                            )}
                            onClick={() => handleOpenTaskWeightDialog(row.abilityItemId, row.abilityPointId)}
                            disabled={isReadOnly}
                          >
                            <Edit2 className="h-3 w-3" />
                            {row.weight}%
                          </button>
                        </PrdAnnotation>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    {row.isFirstOfAbilityPoint && (
                      <TableCell rowSpan={row.abilityPointRowSpan} className="text-sm text-muted-foreground align-top border-r border-border">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="max-w-[120px] truncate cursor-default">{row.levelMapping}</span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs">
                              <p className="text-xs">{row.levelMapping}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0" onClick={() => handleOpenEditMapping(row)}>
                            <Edit2 className="h-3 w-3 mr-1" />
                            修改
                          </Button>
                        </div>
                      </TableCell>
                    )}
                    {row.isFirstOfAbilityPoint && (
                      <TableCell rowSpan={row.abilityPointRowSpan} className="text-center align-top">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                          {formatLevelLabel(row.requiredLevel)}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>

        <Dialog open={!!editingTaskMapping} onOpenChange={(open) => !open && setEditingTaskMapping(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>配置自定义等级映射</DialogTitle>
              <DialogDescription>为能力点「{editingTaskMapping?.taskName}」配置自定义等级映射规则</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              {editingTaskMapping?.mapping.map((level, idx) => (
                <div key={level.level} className="flex items-center gap-3 p-3 rounded-md bg-secondary/50 border border-border">
                  <span className="w-16 font-medium text-sm">{formatLevelLabel(level.level)}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <Input type="number" min={0} max={100} value={level.min} onChange={(e) => { const newMapping = [...editingTaskMapping.mapping]; newMapping[idx] = { ...newMapping[idx], min: parseInt(e.target.value, 10) || 0 }; setEditingTaskMapping({ ...editingTaskMapping, mapping: newMapping }) }} className="w-20 h-8 text-center" />
                    <span className="text-muted-foreground">~</span>
                    <Input type="number" min={0} max={100} value={level.max} onChange={(e) => { const newMapping = [...editingTaskMapping.mapping]; newMapping[idx] = { ...newMapping[idx], max: parseInt(e.target.value, 10) || 0 }; setEditingTaskMapping({ ...editingTaskMapping, mapping: newMapping }) }} className="w-20 h-8 text-center" />
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTaskMapping(null)}>取消</Button>
              <Button onClick={handleSaveTaskMapping}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <WeightConfigDialog
          open={pointWeightDialogOpen}
          onOpenChange={setPointWeightDialogOpen}
          title="配置能力点权重"
          items={pointWeightItems}
          onSave={handleSavePointWeights}
          variant="table"
        />

        <WeightConfigDialog
          open={taskWeightDialogOpen}
          onOpenChange={setTaskWeightDialogOpen}
          title="配置任务权重"
          items={taskWeightItems}
          onSave={handleSaveTaskWeights}
        />

        <LevelMappingDialog
          open={globalConfigDialogOpen}
          onOpenChange={setGlobalConfigDialogOpen}
          mapping={globalMapping}
          onSave={setGlobalMapping}
          title="配置全局等级映射"
          description="配置全局等级映射规则，所有岗位默认继承此配置"
          onOverride={() => setOverrideConfirmOpen(true)}
        />

        <Dialog open={overrideConfirmOpen} onOpenChange={(open) => !open && setOverrideConfirmOpen(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>确认覆盖</DialogTitle>
              <DialogDescription>确定要用当前全局等级映射覆盖该岗位下所有能力点的自定义配置吗？此操作不可撤销。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOverrideConfirmOpen(false)}>取消</Button>
              <Button onClick={() => {
                setRule((prev) => ({
                  ...prev,
                  abilityItems: prev.abilityItems.map((item) => ({
                    ...item,
                    abilityPoints: item.abilityPoints.map((point) => ({
                      ...point,
                      mappingType: 'inherit' as const,
                      customMapping: undefined,
                    })),
                  })),
                }))
                toast({ title: '已覆盖', description: '当前岗位所有能力点已恢复使用全局等级映射' })
                setOverrideConfirmOpen(false)
              }}>确定覆盖</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </TooltipProvider>
  )
}
