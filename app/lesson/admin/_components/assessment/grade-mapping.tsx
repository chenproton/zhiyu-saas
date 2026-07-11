"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { GradeMapping } from "@/lib/types/lesson"

interface GradeMappingEditorProps {
  grades: GradeMapping[]
  onChange?: (grades: GradeMapping[]) => void
}

const colorOptions = [
  { value: "bg-green-500", light: "bg-green-50 border-green-200 text-green-700" },
  { value: "bg-blue-500", light: "bg-blue-50 border-blue-200 text-blue-700" },
  { value: "bg-yellow-500", light: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  { value: "bg-red-500", light: "bg-red-50 border-red-200 text-red-700" },
  { value: "bg-purple-500", light: "bg-purple-50 border-purple-200 text-purple-700" },
]

export function GradeMappingEditor({ grades, onChange }: GradeMappingEditorProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleGradeChange = (gradeId: string, field: keyof GradeMapping, value: string | number) => {
    const newGrades = grades.map((g) =>
      g.id === gradeId ? { ...g, [field]: value } : g
    )
    onChange?.(newGrades)
  }

  // Validate score ranges don't overlap and cover 0-100
  const validateRanges = () => {
    const sorted = [...grades].sort((a, b) => b.maxScore - a.maxScore)
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].minScore !== sorted[i + 1].maxScore + 1) {
        return false
      }
    }
    return sorted[0].maxScore === 100 && sorted[sorted.length - 1].minScore === 0
  }

  const isValid = validateRanges()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValid ? (
            <span className="text-sm text-green-600">分数区间配置有效</span>
          ) : (
            <span className="text-sm text-amber-600">请确保分数区间完整覆盖 0-100 且无重叠</span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "完成编辑" : "编辑等级"}
        </Button>
      </div>

      {/* Visual grade bar */}
      <div className="h-10 bg-gray-100 rounded-lg overflow-hidden flex">
        {grades
          .sort((a, b) => a.minScore - b.minScore)
          .map((grade, index) => {
            const width = grade.maxScore - grade.minScore + 1
            return (
              <div
                key={grade.id}
                className={cn(
                  "flex items-center justify-center text-white font-medium text-sm transition-all",
                  grade.color
                )}
                style={{ width: `${width}%` }}
              >
                {grade.grade}
              </div>
            )
          })}
      </div>

      {/* Grade cards */}
      <div className="grid grid-cols-2 gap-3">
        {grades
          .sort((a, b) => b.maxScore - a.maxScore)
          .map((grade, index) => {
            const colorConfig = colorOptions[index % colorOptions.length]

            return (
              <div
                key={grade.id}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  colorConfig.light
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  {isEditing ? (
                    <Input
                      value={grade.grade}
                      onChange={(e) => handleGradeChange(grade.id, "grade", e.target.value)}
                      className="w-20 h-8 text-center font-semibold"
                    />
                  ) : (
                    <span className="text-xl font-bold">{grade.grade}</span>
                  )}
                  <div className={cn("w-4 h-4 rounded-full", grade.color)} />
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        type="number"
                        value={grade.minScore}
                        onChange={(e) => handleGradeChange(grade.id, "minScore", parseInt(e.target.value) || 0)}
                        className="w-16 h-7 text-center text-sm"
                        min={0}
                        max={100}
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        type="number"
                        value={grade.maxScore}
                        onChange={(e) => handleGradeChange(grade.id, "maxScore", parseInt(e.target.value) || 0)}
                        className="w-16 h-7 text-center text-sm"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm text-gray-500">分</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium">
                      {grade.minScore} - {grade.maxScore} 分
                    </span>
                  )}
                </div>
              </div>
            )
          })}
      </div>

      {/* Score preview */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-600 mb-3">分数换算验证</h4>
        <div className="flex items-center gap-4">
          <ScorePreview grades={grades} />
        </div>
      </div>
    </div>
  )
}

function ScorePreview({ grades }: { grades: GradeMapping[] }) {
  const [testScore, setTestScore] = useState(85)

  const getGradeForScore = (score: number) => {
    return grades.find((g) => score >= g.minScore && score <= g.maxScore)
  }

  const grade = getGradeForScore(testScore)

  return (
    <div className="flex items-center gap-4 w-full">
      <Input
        type="number"
        value={testScore}
        onChange={(e) => setTestScore(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
        className="w-24"
        min={0}
        max={100}
      />
      <span className="text-gray-500">分 =</span>
      {grade ? (
        <div className={cn("px-4 py-2 rounded-lg font-semibold", grade.color, "text-white")}>
          {grade.grade} 等级
        </div>
      ) : (
        <span className="text-gray-400">无匹配等级</span>
      )}
    </div>
  )
}
