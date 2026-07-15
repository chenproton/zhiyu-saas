"use client"

import { Code, FileText, Film, Plus, Presentation, Trash2, File } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import type { DeliverableType } from "@/lib/types/scene-mock"

interface DeliverableConfigProps {
  deliverables: DeliverableType[]
  onDeliverableAdd?: (deliverable: DeliverableType) => void
  onDeliverableDelete?: (deliverableId: string) => void
  onDeliverableUpdate?: (deliverable: DeliverableType) => void
}

const deliverableTypeConfig = {
  report: { icon: FileText, label: "报告", color: "text-blue-500 bg-blue-50" },
  code: { icon: Code, label: "代码", color: "text-green-500 bg-green-50" },
  video: { icon: Film, label: "视频", color: "text-purple-500 bg-purple-50" },
  presentation: { icon: Presentation, label: "演示", color: "text-orange-500 bg-orange-50" },
  document: { icon: FileText, label: "文档", color: "text-cyan-500 bg-cyan-50" },
  other: { icon: File, label: "其他", color: "text-gray-500 bg-gray-50" },
}

export function DeliverableConfig({
  deliverables,
  onDeliverableAdd,
  onDeliverableDelete,
  onDeliverableUpdate,
}: DeliverableConfigProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newDeliverable, setNewDeliverable] = useState<Partial<DeliverableType>>({
    type: "document",
    name: "",
    description: "",
    required: true,
  })

  const handleAdd = () => {
    if (newDeliverable.name && newDeliverable.type) {
      onDeliverableAdd?.({
        id: `del-${Date.now()}`,
        name: newDeliverable.name,
        type: newDeliverable.type as DeliverableType["type"],
        description: newDeliverable.description || "",
        required: newDeliverable.required ?? true,
      })
      setNewDeliverable({ type: "document", name: "", description: "", required: true })
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Deliverable list */}
      {deliverables.length > 0 ? (
        <div className="space-y-2">
          {deliverables.map((deliverable) => {
            const config = deliverableTypeConfig[deliverable.type]
            const Icon = config.icon

            return (
              <div
                key={deliverable.id}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-white group hover:border-gray-200 transition-colors"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-700">{deliverable.name}</p>
                    <Badge variant={deliverable.required ? "default" : "secondary"} className="text-xs">
                      {deliverable.required ? "必须" : "可选"}
                    </Badge>
                  </div>
                  {deliverable.description && (
                    <p className="text-sm text-gray-500">{deliverable.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => onDeliverableDelete?.(deliverable.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
          <FileText className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">暂无交付物定义</p>
        </div>
      )}

      {/* Add deliverable dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            添加交付物
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加交付物定义</DialogTitle>
            <DialogDescription>
              定义学员需要提交的成果类型
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>交付物类型</Label>
              <Select
                value={newDeliverable.type}
                onValueChange={(value) => setNewDeliverable({ ...newDeliverable, type: value as DeliverableType["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="report">报告</SelectItem>
                  <SelectItem value="code">代码</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="presentation">演示</SelectItem>
                  <SelectItem value="document">文档</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>交付物名称</Label>
              <Input
                value={newDeliverable.name}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, name: e.target.value })}
                placeholder="例如：项目代码仓库"
              />
            </div>
            <div className="grid gap-2">
              <Label>说明描述</Label>
              <Textarea
                value={newDeliverable.description}
                onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                placeholder="描述交付物的具体要求..."
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="required"
                checked={newDeliverable.required}
                onCheckedChange={(checked) => setNewDeliverable({ ...newDeliverable, required: checked as boolean })}
              />
              <Label htmlFor="required" className="text-sm font-normal">
                设为必须提交
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleAdd} disabled={!newDeliverable.name}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
