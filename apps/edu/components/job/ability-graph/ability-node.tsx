'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Badge } from '@/components/ui/badge'

interface AbilityNodeData {
  label: string
  description?: string
  category?: string
}

export const AbilityNode = memo(function AbilityNode({
  data,
  selected,
}: NodeProps) {
  const nodeData = data as unknown as AbilityNodeData
  
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-chart-3/10 min-w-[140px] ${
        selected ? 'border-chart-3 shadow-lg' : 'border-chart-3/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-chart-3 !border-2 !border-background"
      />
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="text-xs font-medium text-chart-3">能力点</div>
        {nodeData.category && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {nodeData.category}
          </Badge>
        )}
      </div>
      <div className="font-semibold text-foreground text-sm">{nodeData.label}</div>
      {nodeData.description && (
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {nodeData.description}
        </div>
      )}
    </div>
  )
})
