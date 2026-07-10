"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, CheckCircle, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SubModule {
  name: string
  enabled: boolean
}

interface PackageModule {
  name: string
  enabled: boolean
  expanded?: boolean
  subModules: SubModule[]
}

const packageInfo = {
  name: "教育版专业套餐",
  validUntil: "2027-12-31",
  status: "active",
}

const packageModules: PackageModule[] = [
  {
    name: "系统设置",
    enabled: true,
    subModules: [
      { name: "租户信息管理", enabled: true },
      { name: "系统资源管理", enabled: true },
      { name: "日志管理", enabled: true },
      { name: "组织用户管理", enabled: true },
      { name: "审批流程管理", enabled: true },
    ],
  },
  {
    name: "职业岗位学习平台",
    enabled: true,
    subModules: [
      { name: "岗位资源管理", enabled: true },
      { name: "岗位能力图谱", enabled: true },
      { name: "学习路径规划", enabled: true },
      { name: "岗位认证管理", enabled: true },
      { name: "数据分析报表", enabled: true },
    ],
  },
  {
    name: "实践场景学习平台",
    enabled: true,
    subModules: [
      { name: "场景资源管理", enabled: true },
      { name: "虚拟仿真实训", enabled: true },
      { name: "实践任务管理", enabled: true },
      { name: "成果评估中心", enabled: true },
      { name: "场景数据统计", enabled: true },
    ],
  },
  {
    name: "能力评价与测评资源管理平台",
    enabled: true,
    subModules: [
      { name: "测评题库管理", enabled: true },
      { name: "在线考试中心", enabled: true },
      { name: "能力认证管理", enabled: true },
      { name: "证书生成发放", enabled: true },
      { name: "测评数据分析", enabled: true },
    ],
  },
  {
    name: "数字课程服务平台",
    enabled: true,
    subModules: [
      { name: "课程资源管理", enabled: true },
      { name: "在线学习中心", enabled: true },
      { name: "互动教学工具", enabled: true },
      { name: "学习进度跟踪", enabled: true },
      { name: "课程数据分析", enabled: true },
    ],
  },
  {
    name: "AI 智能服务平台",
    enabled: true,
    subModules: [
      { name: "智能问答助手", enabled: true },
      { name: "内容智能生成", enabled: true },
      { name: "智能推荐引擎", enabled: true },
      { name: "学情智能分析", enabled: true },
      { name: "AI 模型管理", enabled: true },
    ],
  },
  {
    name: "教学资源共享服务平台",
    enabled: true,
    subModules: [
      { name: "资源共享中心", enabled: true },
      { name: "资源审核管理", enabled: true },
      { name: "版权保护管理", enabled: true },
      { name: "资源统计分析", enabled: true },
      { name: "积分奖励体系", enabled: true },
    ],
  },
  {
    name: "教学资源商城",
    enabled: true,
    subModules: [
      { name: "商品管理", enabled: true },
      { name: "订单管理", enabled: true },
      { name: "支付管理", enabled: true },
      { name: "商城数据统计", enabled: true },
      { name: "营销推广管理", enabled: true },
    ],
  },
  {
    name: "教科研服务平台",
    enabled: false,
    subModules: [
      { name: "科研项目管理", enabled: false },
      { name: "论文成果管理", enabled: false },
      { name: "学术交流中心", enabled: false },
      { name: "科研数据分析", enabled: false },
      { name: "专利管理", enabled: false },
    ],
  },
  {
    name: "教务服务平台",
    enabled: false,
    subModules: [
      { name: "课程排课管理", enabled: false },
      { name: "学籍管理", enabled: false },
      { name: "成绩管理", enabled: false },
      { name: "教室资源管理", enabled: false },
      { name: "教务数据分析", enabled: false },
    ],
  },
  {
    name: "决策支持平台",
    enabled: true,
    subModules: [
      { name: "数据看板中心", enabled: true },
      { name: "报表生成管理", enabled: true },
      { name: "预警监控系统", enabled: true },
      { name: "决策分析模型", enabled: true },
      { name: "数据导出工具", enabled: true },
    ],
  },
  {
    name: "就业服务平台",
    enabled: false,
    subModules: [
      { name: "招聘信息管理", enabled: false },
      { name: "简历管理", enabled: false },
      { name: "就业数据统计", enabled: false },
      { name: "企业合作管理", enabled: false },
      { name: "职业指导服务", enabled: false },
    ],
  },
]

export default function PackagePage() {
  const [expandedModules, setExpandedModules] = useState<string[]>(["系统设置"])

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((m) => m !== moduleName)
        : [...prev, moduleName]
    )
  }

  const enabledCount = packageModules.filter((m) => m.enabled).length
  const totalCount = packageModules.length

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">套餐情况查看</h1>
        <p className="mt-1 text-sm text-muted-foreground">查看当前租户购买的套餐内容和功能模块</p>
      </div>

      <div className="grid gap-6">
        {/* 套餐基本信息 */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{packageInfo.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      有效期至 {packageInfo.validUntil}
                    </span>
                    <span className="text-primary">
                      已开通 {enabledCount}/{totalCount} 个平台
                    </span>
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                已激活
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* 套餐功能模块 - 两级结构 */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">套餐功能模块</CardTitle>
            <CardDescription>展开查看各平台包含的二级功能模块</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packageModules.map((module) => {
                const isExpanded = expandedModules.includes(module.name)
                return (
                  <div key={module.name} className="border border-gray-100 rounded-lg overflow-hidden">
                    {/* 一级模块 */}
                    <button
                      onClick={() => toggleModule(module.name)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 text-left transition-colors",
                        module.enabled ? "hover:bg-gray-50" : "bg-gray-50/50 opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle
                          className={cn(
                            "w-5 h-5",
                            module.enabled ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span className={cn(
                          "font-medium",
                          module.enabled ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {module.name}
                        </span>
                        {!module.enabled && (
                          <Badge variant="secondary" className="text-xs">未开通</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {module.subModules.filter(s => s.enabled).length}/{module.subModules.length} 个功能
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    
                    {/* 二级模块列表 */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                        <div className="grid grid-cols-5 gap-2">
                          {module.subModules.map((subModule) => (
                            <div
                              key={subModule.name}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-md border text-sm",
                                subModule.enabled
                                  ? "border-primary/30 bg-white"
                                  : "border-gray-200 bg-gray-100/50 opacity-60"
                              )}
                            >
                              <CheckCircle
                                className={cn(
                                  "w-3.5 h-3.5 shrink-0",
                                  subModule.enabled ? "text-primary" : "text-muted-foreground"
                                )}
                              />
                              <span className={cn(
                                "truncate",
                                subModule.enabled ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {subModule.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
