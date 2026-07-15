'use client'

import { type LevelMapping } from '@/lib/types'

interface LevelMappingDisplayProps {
  mapping: LevelMapping[]
}

export function LevelMappingDisplay({ mapping }: LevelMappingDisplayProps) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      {mapping.map((level) => (
        <div 
          key={level.level} 
          className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border"
        >
          <span className="font-medium text-foreground">{level.level}</span>
          <span className="text-muted-foreground">
            {level.min}-{level.max}分
          </span>
        </div>
      ))}
    </div>
  )
}
