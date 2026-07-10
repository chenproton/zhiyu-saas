"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Lock, Info } from "lucide-react"

interface ResourceCode {
  id: string
  code: string
  name: string
  description: string
  createdAt: string
}

const mockCodes: ResourceCode[] = [
  { id: "1", code: "SCENE", name: "场景", description: "实践场景类型编码", createdAt: "2024-01-01" },
  { id: "2", code: "KNOWLEDGE", name: "知识点", description: "课程知识点类型编码", createdAt: "2024-01-01" },
  { id: "3", code: "POSITION", name: "岗位", description: "职业岗位类型编码", createdAt: "2024-01-01" },
  { id: "4", code: "COURSE", name: "课程", description: "数字课程类型编码", createdAt: "2024-01-01" },
  { id: "5", code: "TASK", name: "任务", description: "场景任务编码", createdAt: "2024-01-01" },
  { id: "6", code: "RESOURCE", name: "资源", description: "教学资源编码", createdAt: "2024-01-01" },
  { id: "7", code: "ABILITY", name: "能力", description: "能力评估编码", createdAt: "2024-01-01" },
  { id: "8", code: "CERTIFICATE", name: "证书", description: "技能证书编码", createdAt: "2024-01-01" },
  { id: "9", code: "PROJECT", name: "项目", description: "实践项目编码", createdAt: "2024-01-01" },
  { id: "10", code: "ASSESSMENT", name: "测评", description: "能力测评编码", createdAt: "2024-01-01" },
]

export default function ResourceCodesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCodes = mockCodes.filter((code) => 
    code.name.includes(searchTerm) || code.code.includes(searchTerm)
  )

  return (
    <div className="p-6 bg-[#f5f7fa] min-h-full">
      <div className="mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">资源编码管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看系统资源类型编码</p>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-sm text-blue-700">仅可通过租户 License 导入资源编码，不支持手动新增、编辑或删除</span>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索编码名称或代码..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>编码</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>说明</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>创建时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCodes.map((code) => (
              <TableRow key={code.id} className="border-border">
                <TableCell className="font-mono text-sm">{code.code}</TableCell>
                <TableCell className="font-medium">{code.name}</TableCell>
                <TableCell className="text-muted-foreground">{code.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    <Lock className="w-3 h-3 mr-1" />
                    公共编码
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{code.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">共 {filteredCodes.length} 条记录</div>
    </div>
  )
}
