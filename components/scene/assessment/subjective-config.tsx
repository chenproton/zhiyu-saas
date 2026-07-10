"use client"

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RubricEditor } from "./rubric-editor"
import type { SubjectiveConfig, RubricPoint, RubricLevel } from "@/lib/scene-mock-data"

interface SubjectiveConfigEditorProps {
  config: SubjectiveConfig
  onChange?: (config: SubjectiveConfig) => void
}

const defaultLevels: RubricLevel[] = [
  { id: "l1", name: "优秀", minScore: 90, maxScore: 100, description: "表现卓越，超出预期", color: "bg-green-500" },
  { id: "l2", name: "良好", minScore: 75, maxScore: 89, description: "表现良好，达到预期", color: "bg-blue-500" },
  { id: "l3", name: "及格", minScore: 60, maxScore: 74, description: "基本合格，有待提升", color: "bg-yellow-500" },
  { id: "l4", name: "不合格", minScore: 0, maxScore: 59, description: "未达标准，需要改进", color: "bg-red-500" },
]

export function SubjectiveConfigEditor({ config, onChange }: SubjectiveConfigEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [expandedPoints, setExpandedPoints] = useState<string[]>([])
  const [newPoint, setNewPoint] = useState<Partial<RubricPoint>>({
    name: "",
    weight: 25,
    maxScore: 25,
  })

  const totalWeight = config.rubricPoints.reduce((sum, p) => sum + p.weight, 0)

  const toggleExpand = (pointId: string) => {
    setExpandedPoints((prev) =>
      prev.includes(pointId) ? prev.filter((id) => id !== pointId) : [...prev, pointId]
    )
  }

  const handleAddPoint = () => {
    if (!newPoint.name) return

    const point: RubricPoint = {
      id: `rp-${Date.now()}`,
      name: newPoint.name,
      weight: newPoint.weight || 25,
      maxScore: newPoint.maxScore || 25,
      levels: defaultLevels.map((l) => ({ ...l, id: `${l.id}-${Date.now()}` })),
    }

    onChange?.({
      ...config,
      rubricPoints: [...config.rubricPoints, point],
    })

    setNewPoint({ name: "", weight: 25, maxScore: 25 })
    setIsDialogOpen(false)
  }

  const handleDeletePoint = (pointId: string) => {
    onChange?.({
      ...config,
      rubricPoints: config.rubricPoints.filter((p) => p.id !== pointId),
    })
  }

  const handlePointChange = (pointId: string, field: keyof RubricPoint, value: string | number | RubricLevel[]) => {
    onChange?.({
      ...config,
      rubricPoints: config.rubricPoints.map((p) =>
        p.id === pointId ? { ...p, [field]: value } : p
      ),
    })
  }

  const handleSynthesisChange = (rule: "sum" | "weighted") => {
    onChange?.({ ...config, synthesisRule: rule })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-gray-500">测评点数量</p>
            <p className="text-xl font-semibold text-gray-800">{config.rubricPoints.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">权重合计</p>
            <p className={`text-xl font-semibold ${totalWeight === 100 ? "text-green-600" : "text-amber-600"}`}>
              {totalWeight}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">合成规则：</span>
          <Select value={config.synthesisRule} onValueChange={handleSynthesisChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sum">累加</SelectItem>
              <SelectItem value="weighted">加权</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rubric points */}
      {config.rubricPoints.length > 0 ? (
        <div className="space-y-3">
          {config.rubricPoints.map((point) => {
            const isExpanded = expandedPoints.includes(point.id)

            return (
              <Collapsible key={point.id} open={isExpanded} onOpenChange={() => toggleExpand(point.id)}>
                <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                  {/* Point header */}
                  <div className="flex items-center gap-4 p-4 group">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-800">{point.name}</h4>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          权重 {point.weight}%
                        </Badge>
                        <Badge variant="outline" className="text-gray-500">
                          满分 {point.maxScore} 分
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => handleDeletePoint(point.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Rubric levels */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                      <div className="mb-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-500">权重</Label>
                          <Input
                            type="number"
                            value={point.weight}
                            onChange={(e) => handlePointChange(point.id, "weight", parseInt(e.target.value) || 0)}
                            className="w-20 h-8"
                            min={0}
                            max={100}
                          />
                          <span className="text-sm text-gray-400">%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-500">满分</Label>
                          <Input
                            type="number"
                            value={point.maxScore}
                            onChange={(e) => handlePointChange(point.id, "maxScore", parseInt(e.target.value) || 0)}
                            className="w-20 h-8"
                            min={0}
                          />
                          <span className="text-sm text-gray-400">分</span>
                        </div>
                      </div>
                      <RubricEditor
                        levels={point.levels}
                        onChange={(levels) => handlePointChange(point.id, "levels", levels)}
                        maxScore={point.maxScore}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-500">暂无测评点，点击下方按钮添加</p>
        </div>
      )}

      {/* Add point dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            添加测评点
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加测评点</DialogTitle>
            <DialogDescription>
              创建一个新的主观测评维度
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>测评点名称</Label>
              <Input
                value={newPoint.name}
                onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
                placeholder="例如：代码质量"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>权重 (%)</Label>
                <Input
                  type="number"
                  value={newPoint.weight}
                  onChange={(e) => setNewPoint({ ...newPoint, weight: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={100}
                />
              </div>
              <div className="grid gap-2">
                <Label>满分</Label>
                <Input
                  type="number"
                  value={newPoint.maxScore}
                  onChange={(e) => setNewPoint({ ...newPoint, maxScore: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddPoint} disabled={!newPoint.name}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
