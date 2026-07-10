"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { RubricLevel } from "@/lib/scene-mock-data"

interface RubricEditorProps {
  levels: RubricLevel[]
  onChange?: (levels: RubricLevel[]) => void
  maxScore: number
}

const defaultColors = [
  { name: "绿色", value: "bg-green-500", light: "bg-green-50 border-green-200" },
  { name: "蓝色", value: "bg-blue-500", light: "bg-blue-50 border-blue-200" },
  { name: "黄色", value: "bg-yellow-500", light: "bg-yellow-50 border-yellow-200" },
  { name: "红色", value: "bg-red-500", light: "bg-red-50 border-red-200" },
]

export function RubricEditor({ levels, onChange, maxScore }: RubricEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleLevelChange = (levelId: string, field: keyof RubricLevel, value: string | number) => {
    const newLevels = levels.map((level) =>
      level.id === levelId ? { ...level, [field]: value } : level
    )
    onChange?.(newLevels)
  }

  return (
    <div className="space-y-3">
      {levels.map((level, index) => {
        const colorConfig = defaultColors[index] || defaultColors[0]
        const isEditing = editingId === level.id

        return (
          <div
            key={level.id}
            className={cn(
              "rounded-lg border p-4 transition-all",
              colorConfig.light,
              isEditing && "ring-2 ring-primary/20"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Color indicator */}
              <div className={cn("w-3 h-full min-h-[60px] rounded-full shrink-0", colorConfig.value)} />

              {/* Content */}
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <Input
                        value={level.name}
                        onChange={(e) => handleLevelChange(level.id, "name", e.target.value)}
                        className="w-24 h-8 text-sm font-medium"
                      />
                    ) : (
                      <span className="font-semibold text-gray-800">{level.name}</span>
                    )}
                    
                    {/* Score range */}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      {isEditing ? (
                        <>
                          <Input
                            type="number"
                            value={level.minScore}
                            onChange={(e) => handleLevelChange(level.id, "minScore", parseInt(e.target.value) || 0)}
                            className="w-16 h-7 text-center text-sm"
                            min={0}
                            max={maxScore}
                          />
                          <span>-</span>
                          <Input
                            type="number"
                            value={level.maxScore}
                            onChange={(e) => handleLevelChange(level.id, "maxScore", parseInt(e.target.value) || 0)}
                            className="w-16 h-7 text-center text-sm"
                            min={0}
                            max={maxScore}
                          />
                          <span>分</span>
                        </>
                      ) : (
                        <span className="px-2 py-0.5 bg-white/50 rounded text-xs font-medium">
                          {level.minScore} - {level.maxScore} 分
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(isEditing ? null : level.id)}
                    className="text-xs"
                  >
                    {isEditing ? "完成" : "编辑"}
                  </Button>
                </div>

                {/* Description */}
                {isEditing ? (
                  <Textarea
                    value={level.description}
                    onChange={(e) => handleLevelChange(level.id, "description", e.target.value)}
                    placeholder="描述该档次的评分标准..."
                    rows={2}
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-600">{level.description}</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
