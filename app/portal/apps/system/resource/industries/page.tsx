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

// 参考国民经济行业分类的大类和中类
const mockIndustries: Industry[] = [
  {
    id: "A",
    code: "A",
    name: "农、林、牧、渔业",
    subIndustries: [
      { id: "A01", code: "01", name: "农业", enabled: true },
      { id: "A02", code: "02", name: "林业", enabled: true },
      { id: "A03", code: "03", name: "畜牧业", enabled: false },
      { id: "A04", code: "04", name: "渔业", enabled: false },
      { id: "A05", code: "05", name: "农、林、牧、渔专业及辅助性活动", enabled: true },
    ],
  },
  {
    id: "B",
    code: "B",
    name: "采矿业",
    subIndustries: [
      { id: "B06", code: "06", name: "煤炭开采和洗选业", enabled: true },
      { id: "B07", code: "07", name: "石油和天然气开采业", enabled: true },
      { id: "B08", code: "08", name: "黑色金属矿采选业", enabled: false },
      { id: "B09", code: "09", name: "有色金属矿采选业", enabled: false },
    ],
  },
  {
    id: "C",
    code: "C",
    name: "制造业",
    subIndustries: [
      { id: "C13", code: "13", name: "农副食品加工业", enabled: true },
      { id: "C14", code: "14", name: "食品制造业", enabled: true },
      { id: "C15", code: "15", name: "酒、饮料和精制茶制造业", enabled: true },
      { id: "C26", code: "26", name: "汽车制造业", enabled: true },
      { id: "C27", code: "27", name: "铁路、船舶、航空航天制造业", enabled: false },
      { id: "C39", code: "39", name: "计算机、通信和其他电子设备制造业", enabled: true },
    ],
  },
  {
    id: "D",
    code: "D",
    name: "电力、热力、燃气及水生产和供应业",
    subIndustries: [
      { id: "D44", code: "44", name: "电力、热力生产和供应业", enabled: true },
      { id: "D45", code: "45", name: "燃气生产和供应业", enabled: true },
      { id: "D46", code: "46", name: "水的生产和供应业", enabled: true },
    ],
  },
  {
    id: "E",
    code: "E",
    name: "建筑业",
    subIndustries: [
      { id: "E47", code: "47", name: "房屋建筑业", enabled: true },
      { id: "E48", code: "48", name: "土木工程建筑业", enabled: true },
      { id: "E49", code: "49", name: "建筑安装业", enabled: false },
      { id: "E50", code: "50", name: "建筑装饰、装修和其他建筑业", enabled: true },
    ],
  },
  {
    id: "F",
    code: "F",
    name: "批发和零售业",
    subIndustries: [
      { id: "F51", code: "51", name: "批发业", enabled: true },
      { id: "F52", code: "52", name: "零售业", enabled: true },
    ],
  },
  {
    id: "G",
    code: "G",
    name: "交通运输、仓储和邮政业",
    subIndustries: [
      { id: "G53", code: "53", name: "铁路运输业", enabled: true },
      { id: "G54", code: "54", name: "道路运输业", enabled: true },
      { id: "G55", code: "55", name: "水上运输业", enabled: false },
      { id: "G56", code: "56", name: "航空运输业", enabled: true },
      { id: "G59", code: "59", name: "仓储业", enabled: true },
      { id: "G60", code: "60", name: "邮政业", enabled: true },
    ],
  },
  {
    id: "H",
    code: "H",
    name: "住宿和餐饮业",
    subIndustries: [
      { id: "H61", code: "61", name: "住宿业", enabled: false },
      { id: "H62", code: "62", name: "餐饮业", enabled: false },
    ],
  },
  {
    id: "I",
    code: "I",
    name: "信息传输、软件和信息技术服务业",
    subIndustries: [
      { id: "I63", code: "63", name: "电信、广播电视和卫星传输服务", enabled: true },
      { id: "I64", code: "64", name: "互联网和相关服务", enabled: true },
      { id: "I65", code: "65", name: "软件和信息技术服务业", enabled: true },
    ],
  },
  {
    id: "J",
    code: "J",
    name: "金融业",
    subIndustries: [
      { id: "J66", code: "66", name: "货币金融服务", enabled: true },
      { id: "J67", code: "67", name: "资本市场服务", enabled: true },
      { id: "J68", code: "68", name: "保险业", enabled: true },
      { id: "J69", code: "69", name: "其他金融业", enabled: false },
    ],
  },
  {
    id: "K",
    code: "K",
    name: "房地产业",
    subIndustries: [
      { id: "K70", code: "70", name: "房地产业", enabled: false },
    ],
  },
  {
    id: "L",
    code: "L",
    name: "租赁和商务服务业",
    subIndustries: [
      { id: "L71", code: "71", name: "租赁业", enabled: true },
      { id: "L72", code: "72", name: "商务服务业", enabled: true },
    ],
  },
  {
    id: "M",
    code: "M",
    name: "科学研究和技术服务业",
    subIndustries: [
      { id: "M73", code: "73", name: "研究和试验发展", enabled: true },
      { id: "M74", code: "74", name: "专业技术服务业", enabled: true },
      { id: "M75", code: "75", name: "科技推广和应用服务业", enabled: true },
    ],
  },
  {
    id: "N",
    code: "N",
    name: "水利、环境和公共设施管理业",
    subIndustries: [
      { id: "N76", code: "76", name: "水利管理业", enabled: false },
      { id: "N77", code: "77", name: "生态保护和环境治理业", enabled: false },
      { id: "N78", code: "78", name: "公共设施管理业", enabled: false },
    ],
  },
  {
    id: "P",
    code: "P",
    name: "教育",
    subIndustries: [
      { id: "P83", code: "83", name: "教育", enabled: true },
    ],
  },
  {
    id: "Q",
    code: "Q",
    name: "卫生和社会工作",
    subIndustries: [
      { id: "Q84", code: "84", name: "卫生", enabled: true },
      { id: "Q85", code: "85", name: "社会工作", enabled: true },
    ],
  },
  {
    id: "R",
    code: "R",
    name: "文化、体育和娱乐业",
    subIndustries: [
      { id: "R86", code: "86", name: "新闻和出版业", enabled: true },
      { id: "R87", code: "87", name: "广播、电视、电影和录音制作业", enabled: true },
      { id: "R88", code: "88", name: "文化艺术业", enabled: true },
      { id: "R89", code: "89", name: "体育", enabled: true },
      { id: "R90", code: "90", name: "娱乐业", enabled: false },
    ],
  },
]

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>(mockIndustries)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedIndustries, setExpandedIndustries] = useState<string[]>(["I", "C"])

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
