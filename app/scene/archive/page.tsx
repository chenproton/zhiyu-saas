"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Building2,
  RotateCcw,
} from "lucide-react"
import { scenarioApi, sceneBatchApi } from "@/lib/api"
import type { Scenario, SceneBatch } from "@/lib/types/scene"
import { useToast } from "@/hooks/use-toast"

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "草稿", className: "bg-gray-100 text-gray-500" },
  pending: { label: "审批中", className: "bg-yellow-50 text-yellow-600" },
  approved: { label: "已通过", className: "bg-blue-50 text-blue-600" },
  rejected: { label: "已驳回", className: "bg-red-50 text-red-500" },
  published: { label: "已发布", className: "bg-green-50 text-green-600" },
  archived: { label: "已归档", className: "bg-purple-50 text-purple-600" },
}

export default function SceneArchivePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [batches, setBatches] = useState<SceneBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [scenarioRes, batchRes] = await Promise.all([
        scenarioApi.list({ status: "archived", limit: 1000 }),
        sceneBatchApi.list({ limit: 1000 }),
      ])
      setScenarios(scenarioRes.items)
      setBatches(batchRes.items)
    } catch (err: any) {
      toast({ variant: "destructive", title: "加载失败", description: err.message || "无法获取归档数据" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const professions = useMemo(() => {
    const set = new Set<string>()
    scenarios.forEach((s) => {
      if (s.professionName) set.add(s.professionName)
    })
    return Array.from(set).sort()
  }, [scenarios])

  const filtered = useMemo(() => {
    let result = scenarios
    if (selectedProfession) {
      result = result.filter((s) => s.professionName === selectedProfession)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          (s.professionName || "").toLowerCase().includes(q) ||
          (s.industryName || "").toLowerCase().includes(q)
      )
    }
    return result
  }, [scenarios, selectedProfession, search])

  const batchMap = useMemo(() => new Map(batches.map((b) => [b.id, b])), [batches])

  const handleRestore = async (scenario: Scenario) => {
    try {
      await scenarioApi.update(scenario.id, { status: "draft" })
      await loadData()
      toast({ title: "已恢复" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "恢复失败", description: err.message || "请稍后重试" })
    }
  }

  return (
    <div className="flex gap-6 h-full -m-6">
      {/* Left Sidebar */}
      <div className="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-primary" />
            <h2 className="font-medium text-sm text-gray-800">按专业归档</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <div
            onClick={() => setSelectedProfession(null)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
              selectedProfession === null
                ? "bg-primary/10 text-primary font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="truncate">全部专业</span>
          </div>
          {professions.map((prof) => (
            <div
              key={prof}
              onClick={() => setSelectedProfession(prof)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                selectedProfession === prof
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="truncate">{prof}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 min-w-0 p-6 pl-0 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">场景历史档案库</h1>
          <p className="text-muted-foreground mt-1">
            查看已归档的场景记录，支持恢复为草稿继续编辑
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">归档场景总数</p>
                  <p className="text-2xl font-bold mt-1">{scenarios.length}</p>
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
                  <p className="text-xs text-muted-foreground">覆盖专业</p>
                  <p className="text-2xl font-bold mt-1">{professions.length}</p>
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
                  <p className="text-xs text-muted-foreground">覆盖行业</p>
                  <p className="text-2xl font-bold mt-1">
                    {new Set(scenarios.map((s) => s.industryName).filter(Boolean)).size}
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
                placeholder="搜索场景名称 / 编码 / 专业 / 行业"
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
                  <TableHead>所属行业</TableHead>
                  <TableHead>适用专业</TableHead>
                  <TableHead>所属批次分组</TableHead>
                  <TableHead>归档时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      暂无归档场景
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((entry) => {
                    const st = statusConfig[entry.status] || statusConfig.draft
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{entry.name}</span>
                            <p className="text-xs text-muted-foreground">
                              {entry.professionName || "-"} · {entry.industryName || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.code}</TableCell>
                        <TableCell className="text-sm">{entry.version}</TableCell>
                        <TableCell className="text-sm">{entry.industryName || "-"}</TableCell>
                        <TableCell className="text-sm">{entry.professionName || "-"}</TableCell>
                        <TableCell className="text-sm">{entry.batchId ? batchMap.get(entry.batchId)?.name || "-" : "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${st.className}`}>
                            {st.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                              <Link href={`/scene/scenarios/${entry.id}/edit`}>
                                <Pencil className="mr-1 h-3 w-3" />
                                查看
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                              onClick={() => handleRestore(entry)}
                            >
                              <RotateCcw className="mr-1 h-3 w-3" />
                              恢复
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
