'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

interface UnitNodeData {
  label: string
  description?: string
}

export const UnitNode = memo(function UnitNode({
  data,
  selected,
}: NodeProps) {
  const nodeData = data as unknown as UnitNodeData
  
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-chart-2/10 min-w-[160px] ${
        selected ? 'border-chart-2 shadow-lg' : 'border-chart-2/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-chart-2 !border-2 !border-background"
      />
      <div className="text-xs font-medium text-chart-2 mb-1">能力单元</div>
      <div className="font-semibold text-foreground text-sm">{nodeData.label}</div>
      {nodeData.description && (
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {nodeData.description}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-chart-2 !border-2 !border-background"
      />
    </div>
  )
})
