"use client"

import { useState } from "react"
import { Award, FileCheck, GraduationCap, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionCard } from "./section-card"
import { mockExams } from "../_data/mock-student-data"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

// ==================== Mock 岗位认定数据 ====================

interface AssessmentIndicator {
  label: string
  value: string
}

interface PositionAssessment {
  id: string
  positionName: string
  indicators: AssessmentIndicator[]
  details: { name: string; score: number; level: string; required: string; passed: boolean }[]
}

const mockPositionAssessments: PositionAssessment[] = [
  {
    id: "pa1",
    positionName: "网络运维工程师",
    indicators: [
      { label: "岗位能力达标率", value: "89%" },
      { label: "岗位胜任度", value: "32%" },
      { label: "岗位能力认定得分", value: "87" },
      { label: "毕业标准", value: "A" },
    ],
    details: [
      { name: "网络故障诊断", score: 78, level: "L4", required: "L5", passed: true },
      { name: "交换机配置", score: 85, level: "L5", required: "L5", passed: true },
      { name: "路由协议", score: 72, level: "L4", required: "L5", passed: true },
      { name: "网络监控工具", score: 90, level: "L5", required: "L5", passed: true },
      { name: "故障排查流程", score: 68, level: "L4", required: "L5", passed: false },
      { name: "客户沟通能力", score: 82, level: "L5", required: "L5", passed: true },
    ],
  },
  {
    id: "pa2",
    positionName: "网络安全工程师",
    indicators: [
      { label: "岗位能力达标率", value: "78%" },
      { label: "岗位胜任度", value: "28%" },
      { label: "岗位能力认定得分", value: "76" },
      { label: "毕业标准", value: "B+" },
    ],
    details: [
      { name: "防火墙策略配置", score: 82, level: "L5", required: "L5", passed: true },
      { name: "入侵检测系统", score: 70, level: "L4", required: "L5", passed: true },
      { name: "安全审计", score: 65, level: "L4", required: "L5", passed: false },
      { name: "漏洞扫描", score: 88, level: "L5", required: "L5", passed: true },
      { name: "应急响应", score: 74, level: "L4", required: "L5", passed: true },
    ],
  },
  {
    id: "pa3",
    positionName: "系统运维工程师",
    indicators: [
      { label: "岗位能力达标率", value: "72%" },
      { label: "岗位胜任度", value: "18%" },
      { label: "岗位能力认定得分", value: "72" },
      { label: "毕业标准", value: "B" },
    ],
    details: [
      { name: "Linux操作", score: 85, level: "L5", required: "L5", passed: true },
      { name: "Shell脚本", score: 68, level: "L4", required: "L5", passed: false },
      { name: "Docker容器", score: 76, level: "L4", required: "L5", passed: true },
      { name: "监控告警", score: 80, level: "L5", required: "L5", passed: true },
      { name: "自动化部署", score: 62, level: "L4", required: "L5", passed: false },
    ],
  },
]

const statusVariantMap: Record<string, string> = {
  待考: "bg-amber-50 text-amber-600",
  进行中: "bg-blue-50 text-blue-600",
  已完成: "bg-emerald-50 text-emerald-600",
}

const typeIconMap: Record<string, typeof GraduationCap> = {
  随堂测: FileCheck,
  单元测试: FileCheck,
  在线测评: GraduationCap,
  岗位能力认定: Award,
}

export function AssessmentTab() {
  const [examFilter, setExamFilter] = useState("all")

  const filteredExams = examFilter === "all"
    ? mockExams
    : mockExams.filter((e) => e.status === examFilter)

  return (
    <div className="space-y-5">
      {/* ===== 岗位能力认定结果 ===== */}
      <SectionCard title="岗位能力认定结果" icon={Award} iconColor="amber">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {mockPositionAssessments.map((pa) => (
            <div key={pa.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* 岗位头 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-4 py-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  {pa.positionName}
                </h4>
              </div>
              {/* 四项指标 */}
              <div className="grid grid-cols-2 gap-3 p-4">
                {pa.indicators.map((ind) => (
                  <div key={ind.label} className="rounded-lg border border-gray-200 p-2.5 text-center">
                    <p className="text-xs text-gray-500 leading-tight">{ind.label}</p>
                    <p className="text-lg font-bold leading-tight mt-0.5">{ind.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ===== 参与的考试/测评清单 ===== */}
      <SectionCard title="参与的日常考试与期末测评" icon={FileCheck} iconColor="blue">
        {/* 状态筛选 */}
        <Tabs value={examFilter} onValueChange={setExamFilter}>
          <TabsList className="h-8 bg-gray-100 mb-4">
            <TabsTrigger value="all" className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">全部</TabsTrigger>
            <TabsTrigger value="待考" className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">待考</TabsTrigger>
            <TabsTrigger value="进行中" className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">进行中</TabsTrigger>
            <TabsTrigger value="已完成" className="text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">已完成</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs w-8">序号</TableHead>
                <TableHead className="text-xs">考试名称</TableHead>
                <TableHead className="text-xs">类型</TableHead>
                <TableHead className="text-xs">状态</TableHead>
                <TableHead className="text-xs">时间</TableHead>
                <TableHead className="text-xs">时长</TableHead>
                <TableHead className="text-xs text-right">结果</TableHead>
                <TableHead className="text-xs text-right w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam, i) => {
                const Icon = typeIconMap[exam.type]
                return (
                  <TableRow key={exam.id}>
                    <TableCell className="text-xs text-gray-400">{i + 1}</TableCell>
                    <TableCell className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        {exam.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{exam.type}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusVariantMap[exam.status]}`}>
                        {exam.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{exam.startTime}</TableCell>
                    <TableCell className="text-xs text-gray-500">{exam.duration}分钟</TableCell>
                    <TableCell className="text-xs text-right font-semibold">
                      {exam.score !== undefined
                        ? <span className="text-emerald-600">{exam.score}/{exam.totalScore}</span>
                        : <span className="text-gray-400">-</span>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-[10px] h-7 px-2">
                        {exam.status === "已完成" ? "查看" : "进入"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filteredExams.length === 0 && (
            <div className="py-10 text-center text-xs text-gray-400">暂无记录</div>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
