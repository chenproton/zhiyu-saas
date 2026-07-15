'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

interface ResponsibilityNodeData {
  label: string
  description?: string
}

export const ResponsibilityNode = memo(function ResponsibilityNode({
  data,
  selected,
}: NodeProps) {
  const nodeData = data as unknown as ResponsibilityNodeData
  
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-chart-1/10 min-w-[160px] ${
        selected ? 'border-chart-1 shadow-lg' : 'border-chart-1/50'
      }`}
    >
      <div className="text-xs font-medium text-chart-1 mb-1">工作职责</div>
      <div className="font-semibold text-foreground text-sm">{nodeData.label}</div>
      {nodeData.description && (
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {nodeData.description}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-chart-1 !border-2 !border-background"
      />
    </div>
  )
})
