"use client"

import {
  FileText,
  Link2,
  Package,
  Search,
  Upload,
  Video,
  Image,
  Table,
  Headphones,
  Archive,
  MapPin,
  Building2,
  Globe,
  X,
  CheckCircle2,
  RotateCcw,
  Plus,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface ResourceItem {
  id: string
  name: string
  type: string
  url?: string
  uploadedBy?: string
  uploadedAt?: string
  thumbnail?: string
  description?: string
}

interface ResourceSelectorProps {
  pool: ResourceItem[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  onUpload?: (resource: ResourceItem) => void
}

const ALL_TYPES = ["all", "video", "document", "spreadsheet", "image", "audio"]

const resourceTypeIcons: Record<string, React.ReactNode> = {
  document: <FileText className="h-4 w-4 text-blue-500" />,
  spreadsheet: <Table className="h-4 w-4 text-teal-500" />,
  image: <Image className="h-4 w-4 text-green-500" />,
  link: <Link2 className="h-4 w-4 text-cyan-500" />,
  audio: <Headphones className="h-4 w-4 text-violet-500" />,
  video: <Video className="h-4 w-4 text-red-500" />,
  archive: <Archive className="h-4 w-4 text-amber-500" />,
  venue: <MapPin className="h-4 w-4 text-orange-500" />,
  facility: <Building2 className="h-4 w-4 text-rose-500" />,
  software: <Globe className="h-4 w-4 text-purple-500" />,
  other: <Package className="h-4 w-4 text-gray-500" />,
}

const resourceTypeLabels: Record<string, string> = {
  all: "全部",
  document: "文档",
  spreadsheet: "表格",
  image: "图片",
  link: "链接",
  audio: "音频",
  video: "视频",
  archive: "压缩包",
  venue: "场地",
  facility: "设施",
  software: "软件",
  other: "其他",
}

const resourceTypeColors: Record<string, string> = {
  document: "bg-blue-50 text-blue-600 border-blue-200",
  spreadsheet: "bg-teal-50 text-teal-600 border-teal-200",
  image: "bg-green-50 text-green-600 border-green-200",
  link: "bg-cyan-50 text-cyan-600 border-cyan-200",
  audio: "bg-violet-50 text-violet-600 border-violet-200",
  video: "bg-red-50 text-red-600 border-red-200",
  archive: "bg-amber-50 text-amber-600 border-amber-200",
  venue: "bg-orange-50 text-orange-600 border-orange-200",
  facility: "bg-rose-50 text-rose-600 border-rose-200",
  software: "bg-purple-50 text-purple-600 border-purple-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
}

export function ResourceSelector({ pool, selectedIds, onChange, onUpload }: ResourceSelectorProps) {
  const [resType, setResType] = useState("all")
  const [resSearchName, setResSearchName] = useState("")
  const [resSearchProvider, setResSearchProvider] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const [newResName, setNewResName] = useState("")
  const [newResType, setNewResType] = useState("document")
  const [newResUrl, setNewResUrl] = useState("")
  const [newResDescription, setNewResDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredRes = pool.filter((r) => {
    const matchType = resType === "all" || r.type === resType
    const matchName = !resSearchName || r.name.includes(resSearchName)
    const matchProvider = !resSearchProvider || (r.uploadedBy && r.uploadedBy.includes(resSearchProvider))
    return matchType && matchName && matchProvider
  })

  const toggleResource = (rid: string) => {
    const selected = selectedIds.includes(rid)
    onChange(selected ? selectedIds.filter((id) => id !== rid) : [...selectedIds, rid])
  }

  const resetFilters = () => {
    setResType("all")
    setResSearchName("")
    setResSearchProvider("")
  }

  const handleUpload = () => {
    if (!newResName.trim()) return
    const newRes: ResourceItem = {
      id: `res-${Date.now()}`,
      name: newResName.trim(),
      type: newResType,
      url: newResUrl,
      description: newResDescription,
      uploadedBy: "当前用户",
      uploadedAt: new Date().toISOString().slice(0, 10),
    }
    onUpload?.(newRes)
    onChange([...selectedIds, newRes.id])
    setNewResName("")
    setNewResUrl("")
    setNewResDescription("")
    setShowUpload(false)
  }

  const selectedResources = selectedIds.map((id) => pool.find((r) => r.id === id)).filter(Boolean) as ResourceItem[]

  return (
    <div className="space-y-4">
      {/* Selected tags */}
      {selectedResources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedResources.map((r) => (
            <Badge
              key={r.id}
              variant="secondary"
              className="px-2.5 py-1 text-xs font-normal bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
            >
              {resourceTypeIcons[r.type] && <span className="mr-1">{resourceTypeIcons[r.type]}</span>}
              {r.name}
              <button
                className="ml-1 text-blue-400 hover:text-blue-700"
                onClick={() => toggleResource(r.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add button + dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            添加课程资源
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加课程资源</DialogTitle>
            <DialogDescription>从资源库中选择或上传新资源</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Toolbar */}
            <div className="shrink-0 space-y-3">
              {/* Type filters */}
              <div className="flex gap-1.5 flex-wrap">
                {ALL_TYPES.map((t) => (
                  <Button
                    key={t}
                    variant={resType === t ? "default" : "outline"}
                    size="sm"
                    className={cn("text-xs h-7", resType === t ? "" : "bg-white")}
                    onClick={() => setResType(t)}
                  >
                    {resourceTypeIcons[t] && <span className="mr-1.5">{resourceTypeIcons[t]}</span>}
                    {resourceTypeLabels[t] || t}
                  </Button>
                ))}
              </div>
              {/* Search & Actions */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={resSearchName}
                    onChange={(e) => setResSearchName(e.target.value)}
                    placeholder="搜索资源名称..."
                    className="pl-9 text-sm"
                  />
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={resSearchProvider}
                    onChange={(e) => setResSearchProvider(e.target.value)}
                    placeholder="搜索资源提供者..."
                    className="pl-9 text-sm"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 text-xs" onClick={resetFilters}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />重置
                </Button>
                <Button size="sm" className="h-9 text-xs" onClick={() => setShowUpload(true)}>
                  <Upload className="h-3.5 w-3.5 mr-1" />上传资源
                </Button>
              </div>
            </div>

            <div className="flex gap-3 min-h-[260px]">
              {/* Left: Resource cards grid */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0 border rounded-xl p-3 overflow-hidden">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <p className="text-sm font-medium text-gray-700">
                    资源列表 <span className="text-gray-400 font-normal">({filteredRes.length})</span>
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 min-w-0">
                  {filteredRes.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">未找到匹配的资源</p>
                      <p className="text-xs mt-1">尝试调整筛选条件</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {filteredRes.map((r) => {
                        const selected = selectedIds.includes(r.id)
                        return (
                          <div
                            key={r.id}
                            className={cn(
                              "relative rounded-lg border overflow-hidden transition-all cursor-pointer group",
                              selected
                                ? "border-primary shadow-sm ring-1 ring-primary/10"
                                : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                            )}
                          >
                            {/* Thumbnail area */}
                            <div className="relative h-14 bg-gray-50 border-b border-gray-100 overflow-hidden">
                              {r.thumbnail && r.type === "image" ? (
                                <img src={r.thumbnail} alt={r.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className={cn("p-1.5 rounded-md border", resourceTypeColors[r.type] || "bg-gray-50 border-gray-200")}>
                                    {resourceTypeIcons[r.type] || <Package className="h-4 w-4 text-gray-400" />}
                                  </div>
                                </div>
                              )}
                              {selected && (
                                <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5 shadow-sm">
                                  <CheckCircle2 className="h-3 w-3" />
                                </div>
                              )}
                              {/* Type badge */}
                              <div className="absolute bottom-1 left-1">
                                <Badge className={cn("text-[9px] px-1 py-0 h-4 border", resourceTypeColors[r.type] || "")}>
                                  {resourceTypeLabels[r.type] || r.type}
                                </Badge>
                              </div>
                            </div>
                            {/* Info */}
                            <div className="p-2" onClick={() => toggleResource(r.id)}>
                              <p className="text-xs font-medium text-gray-800 truncate" title={r.name}>{r.name}</p>
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">{r.uploadedBy || "-"}</p>
                            </div>
                            {/* Actions */}
                            <div className="px-2 pb-2">
                              <Button
                                variant={selected ? "outline" : "default"}
                                size="sm"
                                className="h-6 text-[10px] px-2 w-full"
                                onClick={(e) => { e.stopPropagation(); toggleResource(r.id) }}
                              >
                                {selected ? "已选择" : "选择"}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Selected resources sidebar */}
              <div className="w-52 shrink-0 flex flex-col min-h-0 border rounded-xl p-3 bg-gray-50/50 overflow-hidden">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <p className="text-sm font-semibold text-gray-700">已选资源</p>
                  <Badge variant="secondary" className="text-[10px]">{selectedIds.length}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
                  {selectedIds.length === 0 ? (
                    <div className="text-center text-gray-400 py-6">
                      <Package className="h-7 w-7 mx-auto mb-1.5 opacity-50" />
                      <p className="text-xs">请从左侧选择资源</p>
                    </div>
                  ) : (
                    selectedIds.map((rid) => {
                      const r = pool.find((res) => res.id === rid)
                      if (!r) return null
                      return (
                        <div key={rid} className="flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-white shadow-sm">
                          <div className={cn("w-7 h-7 rounded-md border flex items-center justify-center shrink-0", resourceTypeColors[r.type] || "bg-gray-50")}>
                            {resourceTypeIcons[r.type] || <Package className="h-3.5 w-3.5 text-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate text-gray-800" title={r.name}>{r.name}</p>
                          </div>
                          <button
                            className="text-gray-400 hover:text-red-500 shrink-0 p-0.5 rounded hover:bg-red-50 transition-colors"
                            onClick={() => toggleResource(rid)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>上传资源</DialogTitle>
            <DialogDescription>补充本地资源，上传后将自动选中</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>资源名称</Label>
              <Input value={newResName} onChange={(e) => setNewResName(e.target.value)} placeholder="输入资源名称" className="mt-1.5" />
            </div>
            <div>
              <Label>资源类型</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {ALL_TYPES.filter((t) => t !== "all").map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewResType(t)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-center",
                      newResType === t ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-md border", resourceTypeColors[t] || "bg-gray-50 border-gray-200")}>
                      {resourceTypeIcons[t] || <Package className="h-4 w-4 text-gray-400" />}
                    </div>
                    <span className="text-[10px] font-medium text-gray-700">{resourceTypeLabels[t] || t}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>URL 地址</Label>
              <Input value={newResUrl} onChange={(e) => setNewResUrl(e.target.value)} placeholder="https://..." className="mt-1.5" />
            </div>
            <div>
              <Label>资源描述</Label>
              <Textarea value={newResDescription} onChange={(e) => setNewResDescription(e.target.value)} placeholder="输入资源简介、用途说明等" className="mt-1.5" rows={2} />
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">点击或拖拽上传文件</p>
                <p className="text-xs text-gray-500 mt-1">支持多种格式，最大 100MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>取消</Button>
            <Button onClick={handleUpload} disabled={!newResName.trim()}>上传并选中</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
