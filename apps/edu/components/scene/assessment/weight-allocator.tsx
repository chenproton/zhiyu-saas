"use client"

import { Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TaskWeight {
  taskId: string
  taskName: string
  weight: number
  locked: boolean
}

interface WeightAllocatorProps {
  tasks: TaskWeight[]
  onChange?: (tasks: TaskWeight[]) => void
}

export function WeightAllocator({ tasks, onChange }: WeightAllocatorProps) {
  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0)
  const isValid = totalWeight === 100

  const handleWeightChange = (taskId: string, newWeight: number) => {
    const updatedTasks = tasks.map((t) =>
      t.taskId === taskId ? { ...t, weight: Math.max(0, Math.min(100, newWeight)) } : t
    )
    onChange?.(updatedTasks)
  }

  const toggleLock = (taskId: string) => {
    const updatedTasks = tasks.map((t) =>
      t.taskId === taskId ? { ...t, locked: !t.locked } : t
    )
    onChange?.(updatedTasks)
  }

  const distributeEvenly = () => {
    const unlockedTasks = tasks.filter((t) => !t.locked)
    const lockedWeight = tasks
      .filter((t) => t.locked)
      .reduce((sum, t) => sum + t.weight, 0)
    
    const remainingWeight = 100 - lockedWeight
    const weightPerTask = Math.floor(remainingWeight / unlockedTasks.length)
    const remainder = remainingWeight % unlockedTasks.length

    let unlockedIndex = 0
    const updatedTasks = tasks.map((task) => {
      if (task.locked) {
        return task
      }
      const extra = unlockedIndex < remainder ? 1 : 0
      unlockedIndex++
      return {
        ...task,
        weight: weightPerTask + extra,
      }
    })

    onChange?.(updatedTasks)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={cn(
            "text-lg font-semibold",
            isValid ? "text-green-600" : "text-amber-600"
          )}>
            总权重: {totalWeight}%
          </span>
          {!isValid && (
            <span className="text-sm text-amber-600">
              {totalWeight > 100 ? `超出 ${totalWeight - 100}%` : `还需分配 ${100 - totalWeight}%`}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={distributeEvenly}>
          均匀分配
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
        {tasks.map((task, index) => {
          const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-orange-500",
            "bg-cyan-500",
            "bg-pink-500",
          ]
          return (
            <div
              key={task.taskId}
              className={cn("transition-all duration-300", colors[index % colors.length])}
              style={{ width: `${task.weight}%` }}
            />
          )
        })}
      </div>

      {/* Task weight inputs */}
      <div className="space-y-2">
        {tasks.map((task, index) => {
          const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-orange-500",
            "bg-cyan-500",
            "bg-pink-500",
          ]

          return (
            <div
              key={task.taskId}
              className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-colors"
            >
              {/* Color indicator */}
              <div className={cn("w-3 h-8 rounded-full shrink-0", colors[index % colors.length])} />

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-700 truncate">{task.taskName}</span>
                </div>
              </div>

              {/* Weight input */}
              <div className="flex items-center gap-2 shrink-0">
                <Input
                  type="number"
                  value={task.weight}
                  onChange={(e) => handleWeightChange(task.taskId, parseInt(e.target.value) || 0)}
                  disabled={task.locked}
                  className={cn("w-20 text-center", task.locked && "bg-gray-50")}
                  min={0}
                  max={100}
                />
                <span className="text-gray-500 w-4">%</span>
              </div>

              {/* Lock toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleLock(task.taskId)}
                className={cn("h-8 w-8", task.locked ? "text-amber-500" : "text-gray-400")}
              >
                {task.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
