import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Status } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'

const statusStyles: Record<Status, string> = {
  draft: 'bg-muted text-muted-foreground border-muted',
  unsubmitted: 'bg-secondary text-secondary-foreground border-secondary',
  pending: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  toPublish: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  published: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
