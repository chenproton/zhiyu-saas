import { Badge } from '@/components/ui/badge'
import {
  type PositionStatus,
  type BatchStatus,
  type ApprovalStatus,
  POSITION_STATUS_LABELS,
  BATCH_STATUS_LABELS,
} from '@/lib/types/job-source'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: PositionStatus | BatchStatus | ApprovalStatus
  type?: 'position' | 'batch' | 'approval'
  className?: string
}

const statusStyles: Record<string, string> = {
  // Position status
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/15 text-warning-foreground border-warning/30',
  approved: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  published: 'bg-primary/15 text-primary border-primary/30',
  archived: 'bg-muted text-muted-foreground',
  // Batch status
  open: 'bg-success/15 text-success border-success/30',
  closed: 'bg-muted text-muted-foreground',
}

const approvalLabels: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
}

export function StatusBadge({ status, type = 'position', className }: StatusBadgeProps) {
  let label: string

  if (type === 'approval') {
    label = approvalLabels[status as ApprovalStatus]
  } else if (type === 'batch') {
    label = BATCH_STATUS_LABELS[status as BatchStatus]
  } else {
    label = POSITION_STATUS_LABELS[status as PositionStatus]
  }

  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status] || 'bg-muted text-muted-foreground', className)}
    >
      {label}
    </Badge>
  )
}
