"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Pencil,
  Archive,
  GraduationCap,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Building2,
} from "lucide-react"
import {
  sceneArchiveTree,
  sceneArchiveEntries,
  filterSceneArchiveEntries,
  type SceneArchiveTreeNode,
} from "@/lib/scene-archive-mock"

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "草稿", className: "bg-gray-100 text-gray-500" },
  pending: { label: "审批中", className: "bg-yellow-50 text-yellow-600" },
  approved: { label: "已通过", className: "bg-blue-50 text-blue-600" },
  rejected: { label: "已驳回", className: "bg-red-50 text-red-500" },
  published: { label: "已发布", className: "bg-green-50 text-green-600" },
}

function TreeNode({
  node,
  selectedCollege,
  selectedMajor,
  selectedGrade,
  onSelect,
  expandedIds,
  onToggle,
  depth,
}: {
  node: SceneArchiveTreeNode
  selectedCollege: string | null
  selectedMajor: string | null
  selectedGrade: string | null
  onSelect: (node: SceneArchiveTreeNode) => void
  expandedIds: Set<string>
  onToggle: (id: string) => void
  depth: number
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedIds.has(node.id)

  const isSelected =
    (node.level === "college" && selectedCollege === node.label && !selectedMajor) ||
    (node.level === "major" && selectedMajor === node.label && !selectedGrade) ||
    (node.level === "grade" && selectedGrade === node.label)

  return (
    <div>
      <div
        onClick={() => {
          if (hasChildren) {
            onToggle(node.id)
          }
          onSelect(node)
        }}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors
          ${isSelected
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-600 hover:bg-gray-100"
          }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          )
        ) : (
          <div className="w-3.5 shrink-0" />
        )}
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedCollege={selectedCollege}
              selectedMajor={selectedMajor}
              selectedGrade={selectedGrade}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SceneArchivePage() {
  const [search, setSearch] = useState("")
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null)
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)

  const allExpandableIds = useMemo(() => {
    const ids: string[] = []
    const walk = (nodes: SceneArchiveTreeNode[]) => {
      for (const node of nodes) {
        if (node.children?.length) {
          ids.push(node.id)
          walk(node.children)
        }
      }
    }
    walk(sceneArchiveTree)
    return ids
  }, [])

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(allExpandableIds))

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelect = (node: SceneArchiveTreeNode) => {
    if (node.level === "college") {
      if (selectedCollege === node.label && !selectedMajor) {
        setSelectedCollege(null)
        setSelectedMajor(null)
        setSelectedGrade(null)
      } else {
        setSelectedCollege(node.label)
        setSelectedMajor(null)
        setSelectedGrade(null)
      }
    } else if (node.level === "major") {
      if (selectedMajor === node.label && !selectedGrade) {
        setSelectedMajor(null)
        setSelectedGrade(null)
      } else {
        setSelectedMajor(node.label)
        setSelectedGrade(null)
      }
    } else if (node.level === "grade") {
      if (selectedGrade === node.label) {
        setSelectedGrade(null)
      } else {
        setSelectedGrade(node.label)
      }
    }
  }

  const filtered = useMemo(
    () => filterSceneArchiveEntries(selectedCollege, selectedMajor, selectedGrade, search),
    [selectedCollege, selectedMajor, selectedGrade, search]
  )

  const breadcrumb = useMemo(() => {
    const parts: string[] = []
    if (selectedCollege) parts.push(selectedCollege)
    if (selectedMajor) parts.push(selectedMajor)
    if (selectedGrade) parts.push(selectedGrade)
    return parts
  }, [selectedCollege, selectedMajor, selectedGrade])

  return (
    <div className="flex gap-6 h-full -m-6">
      {/* Left Sidebar */}
      <div className="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-primary" />
            <h2 className="font-medium text-sm text-gray-800">历史档案目录</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {sceneArchiveTree.map((college) => (
            <TreeNode
              key={college.id}
              node={college}
              selectedCollege={selectedCollege}
              selectedMajor={selectedMajor}
              selectedGrade={selectedGrade}
              onSelect={handleSelect}
              expandedIds={expandedIds}
              onToggle={handleToggle}
              depth={0}
            />
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 min-w-0 p-6 pl-0 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">场景历史档案库</h1>
          <p className="text-muted-foreground mt-1">
            按学院、专业、年级查看历史场景归档记录，每个学期开课后自动归档至对应目录
          </p>
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            {breadcrumb.map((part, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className="font-medium text-gray-700">{part}</span>
              </span>
            ))}
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
              {filtered.length} 个场景
            </span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">归档场景总数</p>
                  <p className="text-2xl font-bold mt-1">{sceneArchiveEntries.length}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-100 text-purple-600">
                  <Archive className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">覆盖学院</p>
                  <p className="text-2xl font-bold mt-1">{sceneArchiveTree.length}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">覆盖专业</p>
                  <p className="text-2xl font-bold mt-1">
                    {sceneArchiveTree.reduce((sum, c) => sum + (c.children?.length || 0), 0)}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-green-100 text-green-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search + Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索场景名称 / 编码 / 岗位"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>

          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>场景名称</TableHead>
                  <TableHead>场景编码</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>所属岗位</TableHead>
                  <TableHead>所属批次分组</TableHead>
                  <TableHead>创建人</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead>任务数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => {
                  const st = statusConfig[entry.status] || statusConfig.draft
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{entry.name}</span>
                          <p className="text-xs text-muted-foreground">
                            {entry.college} · {entry.major} · {entry.grade}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{entry.code}</TableCell>
                      <TableCell className="text-sm">{entry.version}</TableCell>
                      <TableCell className="text-sm">{entry.positionName || "-"}</TableCell>
                      <TableCell className="text-sm">{entry.batchName || "-"}</TableCell>
                      <TableCell className="text-sm">{entry.creatorName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{entry.publishTime || "-"}</TableCell>
                      <TableCell className="text-sm text-center">{entry.taskCount}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${st.className}`}>
                          {st.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                          <Link href="/scene/scenarios/scenario-1/edit" className="flex items-center">
                            <Pencil className="mr-1 h-3 w-3" />
                            编辑
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                      暂无匹配的归档场景
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
