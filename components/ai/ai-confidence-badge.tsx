"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AiConfidenceBadgeProps {
  confidence: "high" | "medium" | "low"
  className?: string
}

export function AiConfidenceBadge({ confidence, className }: AiConfidenceBadgeProps) {
  const config = {
    high: { label: "高置信度", className: "bg-green-50 text-green-700 border-green-200" },
    medium: { label: "中置信度", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    low: { label: "低置信度", className: "bg-red-50 text-red-700 border-red-200" },
  }
  const c = config[confidence]
  return (
    <Badge variant="outline" className={cn("text-[10px]", c.className, className)}>
      {c.label}
    </Badge>
  )
}
