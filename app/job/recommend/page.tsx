'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useData } from '@/lib/stores/data-context'
import { useAuth } from '@/lib/stores/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Sparkles,
  GraduationCap,
  Briefcase,
  Eye,
  Check,
  ChevronsUpDown,
  ExternalLink,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PositionType } from '@/lib/types/job-source'
import { POSITION_TYPE_LABELS } from '@/lib/types/job-source'

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function PostRecommendPage() {
  const {
    positions,
    batches,
    recommendations,
    addRecommendation,
    updateRecommendation,
    deleteRecommendation,
    reorderRecommendations,
  } = useData()
  const { user } = useAuth()

  const [selectedMajor, setSelectedMajor] = useState<string>('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedPositionId, setSelectedPositionId] = useState<string>('')
  const [reason, setReason] = useState('')
  const [isVisibleNew, setIsVisibleNew] = useState(true)
  const [positionSearchOpen, setPositionSearchOpen] = useState(false)

  // 专业列表从批次和专业字符串去重得到
  const majorOptions = useMemo(() => {
    const set = new Set<string>()
    batches.forEach((b) => set.add(b.major))
    positions.forEach((p) => p.majors.forEach((m) => set.add(m)))
    return Array.from(set).sort()
  }, [batches, positions])

  // 默认选中第一个专业
  const currentMajor = selectedMajor || majorOptions[0] || ''

  const majorRecommendations = useMemo(() => {
    return recommendations
      .filter((rec) => rec.major === currentMajor)
      .sort((a, b) => a.order - b.order)
  }, [recommendations, currentMajor])

  const recommendedPositionIds = useMemo(
    () => new Set(majorRecommendations.map((rec) => rec.positionId)),
    [majorRecommendations]
  )

  const availablePositions = useMemo(() => {
    return positions.filter(
      (p) =>
        p.majors.includes(currentMajor) &&
        p.status === 'published' &&
        !recommendedPositionIds.has(p.id)
    )
  }, [positions, currentMajor, recommendedPositionIds])

  const handleMove = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= majorRecommendations.length) return
    const ids = majorRecommendations.map((rec) => rec.id)
    const [moved] = ids.splice(index, 1)
    ids.splice(newIndex, 0, moved)
    reorderRecommendations(currentMajor, ids)
  }

  const handleDelete = (id: string) => {
    deleteRecommendation(id)
  }

  const handleToggleVisible = (id: string, isVisible: boolean) => {
    updateRecommendation(id, { isVisible })
  }

  const handleAdd = () => {
    if (!selectedPositionId || !currentMajor || !user) return
    const position = positions.find((p) => p.id === selectedPositionId)
    if (!position) return
    addRecommendation({
      major: currentMajor,
      positionId: position.id,
      positionType: position.positionType,
      reason: reason.trim() || undefined,
      isVisible: isVisibleNew,
      createdBy: user.id,
    })
    setSelectedPositionId('')
    setReason('')
    setIsVisibleNew(true)
    setIsAddOpen(false)
  }

  const selectedPosition = positions.find((p) => p.id === selectedPositionId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            岗位目标推荐管理
          </h1>
          <p className="text-muted-foreground mt-1">
            按专业配置前台"为你推荐"模块展示的岗位及顺序，支持企业岗位与教学岗位混合推荐
          </p>
        </div>
        <Link href="/explore">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            前台预览
          </Button>
        </Link>
      </div>

      {/* 专业选择 */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">选择专业</span>
            </div>
            <p className="text-sm text-muted-foreground">
              已配置 {majorRecommendations.length} 个推荐岗位
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {majorOptions.map((major) => (
              <button
                key={major}
                onClick={() => setSelectedMajor(major)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  currentMajor === major
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {major}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* 已配置推荐 */}
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>推荐岗位列表</CardTitle>
              <CardDescription>
                专业「{currentMajor}」的前台推荐顺序，数字越小越靠前
              </CardDescription>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>添加岗位目标推荐</DialogTitle>
                  <DialogDescription>
                    为「{currentMajor}」专业选择一个岗位并配置推荐类型与原因
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">推荐岗位</label>
                    <Popover open={positionSearchOpen} onOpenChange={setPositionSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={positionSearchOpen}
                          className="w-full justify-between font-normal h-10 px-3 bg-background hover:bg-background border-input"
                          disabled={availablePositions.length === 0}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className={cn("truncate", !selectedPosition && "text-muted-foreground")}>
                              {selectedPosition
                                ? `${selectedPosition.name}（${selectedPosition.shortName}）`
                                : availablePositions.length === 0
                                ? '暂无可添加的岗位'
                                : '搜索或选择岗位'}
                            </span>
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                        <Command>
                          <CommandInput placeholder="搜索岗位名称、简称、行业..." />
                          <CommandList>
                            <CommandEmpty>未找到匹配岗位</CommandEmpty>
                            <CommandGroup>
                              {availablePositions.map((position) => (
                                <CommandItem
                                  key={position.id}
                                  value={`${position.name} ${position.shortName} ${position.industry}`}
                                  onSelect={() => {
                                    setSelectedPositionId(position.id)
                                    setPositionSearchOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedPositionId === position.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm">{position.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {position.shortName} · {position.industry}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedPosition && (
                    <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedPosition.name}</span>
                        </div>
                        <Link href={`/explore/${selectedPosition.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary">
                            <ExternalLink className="h-3.5 w-3.5" />
                            查看岗位
                          </Button>
                        </Link>
                      </div>
                      <div className="text-muted-foreground">
                        行业：{selectedPosition.industry} · 能力点：{selectedPosition.abilityModel?.nodes.length || 0} 个 · 上架时间：{formatDate(selectedPosition.createdAt)}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">推荐原因（选填）</label>
                    <Input
                      placeholder="例如：核心对口岗位，就业需求量大"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">是否展示</label>
                      <p className="text-xs text-muted-foreground">关闭后该推荐将不在前台显示</p>
                    </div>
                    <Switch
                      checked={isVisibleNew}
                      onCheckedChange={setIsVisibleNew}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAdd} disabled={!selectedPositionId}>
                    确认添加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">顺序</TableHead>
                  <TableHead>岗位名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>推荐原因</TableHead>
                  <TableHead>上架时间</TableHead>
                  <TableHead className="text-center">是否展示</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {majorRecommendations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Sparkles className="h-10 w-10 mb-2" />
                        <p>暂无为「{currentMajor}」配置的推荐岗位</p>
                        <p className="text-xs mt-1">添加后将在前台"为你推荐"按顺序展示</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  majorRecommendations.map((rec, index) => {
                    const position = positions.find((p) => p.id === rec.positionId)
                    return (
                      <TableRow key={rec.id} className={cn("group", !rec.isVisible && "opacity-60")}>
                        <TableCell>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {rec.order}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{position?.name || '未知岗位'}</div>
                          <div className="text-xs text-muted-foreground">
                            {position?.shortName || '-'} · {position?.industry || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              rec.positionType === 'teaching'
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-50'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-50'
                            )}
                          >
                            {POSITION_TYPE_LABELS[rec.positionType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-muted-foreground line-clamp-2">
                            {rec.reason || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(position?.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={rec.isVisible}
                            onCheckedChange={(checked) => handleToggleVisible(rec.id, checked)}
                            aria-label={rec.isVisible ? '已展示' : '已隐藏'}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={index === 0}
                              onClick={() => handleMove(index, -1)}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={index === majorRecommendations.length - 1}
                              onClick={() => handleMove(index, 1)}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(rec.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
