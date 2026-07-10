"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, BookOpen, Loader2 } from "lucide-react"
import { MAJOR_TAGS, INDUSTRY_TAGS, EDUCATION_LEVELS, DIFFICULTY_LEVELS } from "@/lib/mock-data"

type TabDef = {
  id: string
  label: string
  type: "major" | "industry" | "level" | "difficulty"
}

const tabs: TabDef[] = [
  { id: "majors", label: "专业标签", type: "major" },
  { id: "industries", label: "行业标签", type: "industry" },
  { id: "levels", label: "适用层次", type: "level" },
  { id: "difficulties", label: "难度等级", type: "difficulty" },
]

export default function AdminDictionaryPage() {
  const [activeTab, setActiveTab] = useState("majors")
  const [newItem, setNewItem] = useState("")
  const [items, setItems] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function loadDictionaries() {
      try {
        // Backend does not yet expose a dictionary API; keep static reference lists.
        await new Promise((resolve) => setTimeout(resolve, 300))
        if (cancelled) return
        setItems({
          major: [...MAJOR_TAGS],
          industry: [...INDUSTRY_TAGS],
          level: [...EDUCATION_LEVELS],
          difficulty: [...DIFFICULTY_LEVELS],
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载字典失败")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDictionaries()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setNewItem("")
  }, [activeTab])

  const currentTab = tabs.find((t) => t.id === activeTab)
  const currentItems = currentTab ? items[currentTab.type] ?? [] : []

  const handleAdd = () => {
    if (!currentTab || !newItem.trim()) return
    const value = newItem.trim()
    if (currentItems.includes(value)) {
      alert(`标签 "${value}" 已存在`)
      return
    }
    setItems((prev) => ({
      ...prev,
      [currentTab.type]: [...(prev[currentTab.type] ?? []), value],
    }))
    setNewItem("")
  }

  const handleDelete = (item: string) => {
    if (!currentTab) return
    if (!confirm(`确定删除标签 "${item}" 吗？`)) return
    setItems((prev) => ({
      ...prev,
      [currentTab.type]: (prev[currentTab.type] ?? []).filter((i) => i !== item),
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">标签字典</h1>
          <p className="text-sm text-muted-foreground">维护专业、行业、适用层次、难度等级等标签字典</p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-accent" />
                    {tab.label}管理
                  </CardTitle>
                  <CardDescription>共 {items[tab.type]?.length ?? 0} 个标签</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`输入新${tab.label}名称`}
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      disabled={loading}
                    />
                    <Button className="gap-2" onClick={handleAdd} disabled={loading || !newItem.trim()}>
                      <Plus className="h-4 w-4" />
                      新增
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      加载中…
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>标签名称</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(items[tab.type] ?? []).map((item) => (
                          <TableRow key={item}>
                            <TableCell>
                              <Badge variant="secondary">{item}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
