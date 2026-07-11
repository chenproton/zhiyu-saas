"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubIndustry {
  id: string
  code: string
  name: string
  enabled: boolean
}

interface Industry {
  id: string
  code: string
  name: string
  subIndustries: SubIndustry[]
}

const mockIndustries: Industry[] = []

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>(mockIndustries)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedIndustries, setExpandedIndustries] = useState<string[]>([])

  const toggleExpand = (id: string) => {
    setExpandedIndustries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSubIndustry = (industryId: string, subId: string) => {
    setIndustries((prev) =>
      prev.map((ind) =>
        ind.id === industryId
          ? {
              ...ind,
              subIndustries: ind.subIndustries.map((sub) =>
                sub.id === subId ? { ...sub, enabled: !sub.enabled } : sub
              ),
            }
          : ind
      )
    )
  }

  const filteredIndustries = industries.filter(
    (industry) =>
      industry.name.includes(searchTerm) ||
      industry.code.includes(searchTerm) ||
      industry.subIndustries.some(
        (sub) => sub.name.includes(searchTerm) || sub.code.includes(searchTerm)
      )
  )

  const totalEnabled = industries.reduce(
    (acc, ind) => acc + ind.subIndustries.filter((s) => s.enabled).length,
    0
  )
  const totalSub = industries.reduce((acc, ind) => acc + ind.subIndustries.length, 0)

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">行业管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          管理系统中的行业分类（参考国民经济行业分类），仅可启用或关闭二级行业
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索行业名称或代码..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          已启用 <span className="text-primary font-medium">{totalEnabled}</span> / {totalSub} 个二级行业
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
        {filteredIndustries.map((industry) => {
          const isExpanded = expandedIndustries.includes(industry.id)
          const enabledCount = industry.subIndustries.filter((s) => s.enabled).length

          return (
            <div key={industry.id} className="border-b border-gray-100 last:border-b-0">
              {/* 一级行业 - 不可选中，只作为分组 */}
              <button
                onClick={() => toggleExpand(industry.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-mono text-sm text-muted-foreground w-8">{industry.code}</span>
                  <span className="font-medium text-foreground">{industry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {enabledCount}/{industry.subIndustries.length} 已启用
                  </Badge>
                </div>
              </button>

              {/* 二级行业列表 */}
              {isExpanded && (
                <div className="bg-gray-50/50 border-t border-gray-100">
                  {industry.subIndustries.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between px-4 py-3 pl-12 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground w-8">{sub.code}</span>
                        <span className={cn("text-sm", sub.enabled ? "text-foreground" : "text-muted-foreground")}>
                          {sub.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={sub.enabled ? "default" : "secondary"} className="text-xs">
                          {sub.enabled ? "已启用" : "已关闭"}
                        </Badge>
                        <Switch
                          checked={sub.enabled}
                          onCheckedChange={() => toggleSubIndustry(industry.id, sub.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        共 {filteredIndustries.length} 个一级行业，{totalSub} 个二级行业
      </div>
    </div>
  )
}
