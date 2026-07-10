"use client"

import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/scene-mock-data"

interface TaskNodeProps {
  task: Task
  scenarioId: string
  isActive?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

const assessmentTypeConfig = {
  objective: { label: "客观测评", className: "bg-blue-50 text-blue-600 border-blue-200" },
  subjective: { label: "主观测评", className: "bg-purple-50 text-purple-600 border-purple-200" },
  mixed: { label: "混合测评", className: "bg-amber-50 text-amber-600 border-amber-200" },
  null: { label: "未配置", className: "bg-gray-100 text-gray-500 border-gray-200" },
}

export function TaskNode({ task, scenarioId, isActive, onEdit, onDelete }: TaskNodeProps) {
  const assessmentType = task.assessment?.type || "null"
  const config = assessmentTypeConfig[assessmentType]

  return (
    <div
      className={cn(
        "group relative flex items-stretch rounded-xl border bg-white transition-all duration-200",
        isActive
          ? "border-primary shadow-sm ring-2 ring-primary/10"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      )}
    >
      {/* Drag handle */}
      <div className="flex items-center px-2 border-r border-gray-100 cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-gray-300" />
      </div>

      {/* Order number */}
      <div className="flex items-center justify-center w-12 border-r border-gray-100">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold">
          {task.order}
        </span>
      </div>

      {/* Main content */}
      <Link
        href={`/scenarios/${scenarioId}/tasks/${task.id}`}
        className="flex-1 flex items-center gap-4 px-4 py-3 min-w-0"
      >
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate group-hover:text-primary transition-colors">
            {task.name}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-500 truncate mt-0.5">{task.description}</p>
          )}
        </div>

        {/* Assessment badge */}
        <Badge variant="outline" className={cn("shrink-0 text-xs font-medium", config.className)}>
          {config.label}
        </Badge>

        {/* Dependencies indicator */}
        {task.dependencies.length > 0 && (
          <span className="shrink-0 text-xs text-gray-400">
            前置: {task.dependencies.length} 项
          </span>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center px-2 border-l border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
