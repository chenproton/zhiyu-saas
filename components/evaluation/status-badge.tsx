'use client'

import { Badge } from '@/components/ui/badge'
import { type RuleStatus, statusConfig } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: RuleStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-medium',
        config.bgColor,
        config.color,
        className,
      )}
    >
      <span
        className={cn(
          'mr-1.5 inline-block size-1.5 rounded-full',
          status === 'published' && 'bg-green-500',
          status === 'reviewing' && 'bg-amber-500',
          status === 'rejected' && 'bg-red-500',
          status === 'ready' && 'bg-blue-500',
          (status === 'draft' ||
            status === 'not_submitted' ||
            status === 'none') &&
            'bg-slate-400',
        )}
      />
      {config.label}
    </Badge>
  )
}
