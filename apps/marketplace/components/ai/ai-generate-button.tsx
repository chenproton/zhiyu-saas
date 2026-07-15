"use client"

import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AiGenerateButtonProps {
  onClick: () => void
  loading?: boolean
  label?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export function AiGenerateButton({
  onClick,
  loading = false,
  label = "AI 生成",
  size = "sm",
  variant = "outline",
  className,
}: AiGenerateButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={loading}
      className={cn("gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800", className)}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {loading ? "生成中..." : label}
    </Button>
  )
}
