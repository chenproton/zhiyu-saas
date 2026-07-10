'use client'

import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronRight } from 'lucide-react'
import { type EvalAbilityItem, type EvalAbilityPoint, type LevelMapping } from '@/lib/types'
import { AbilityPointCard } from './ability-point-card'
import { cn } from '@/lib/utils'

interface AbilityItemSectionProps {
  item: EvalAbilityItem
  globalMapping: LevelMapping[]
  onItemChange: (item: EvalAbilityItem) => void
  disabled?: boolean
}

export function AbilityItemSection({
  item,
  globalMapping,
  onItemChange,
  disabled = false,
}: AbilityItemSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handlePointChange = (updatedPoint: EvalAbilityPoint) => {
    const newPoints = item.abilityPoints.map((p) =>
      p.id === updatedPoint.id ? updatedPoint : p,
    )
    onItemChange({
      ...item,
      abilityPoints: newPoints,
    })
  }

  // 统计能力点状态
  const totalPoints = item.abilityPoints.length
  const linkedPoints = item.abilityPoints.filter(
    (p) => p.relatedTasks.length > 0,
  ).length

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center justify-between rounded-lg border bg-secondary/50 px-4 py-3 text-left transition-colors hover:bg-secondary',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            className={cn(
              'size-5 text-muted-foreground transition-transform',
              isOpen && 'rotate-90',
            )}
          />
          <h3 className="font-medium text-foreground">{item.name}</h3>
          <span className="text-sm text-muted-foreground">
            ({linkedPoints}/{totalPoints} 已关联任务)
          </span>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-3 space-y-3 pl-8">
          {item.abilityPoints.map((point) => (
            <AbilityPointCard
              key={point.id}
              point={point}
              globalMapping={globalMapping}
              onPointChange={handlePointChange}
              disabled={disabled}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
