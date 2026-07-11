"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Download, RefreshCw } from "lucide-react"

const mockLogs: { id: string; user: string; module: string; action: string; target: string; ip: string; status: string; time: string }[] = []

export default function OperationLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLogs = mockLogs.filter((log) =>
    log.user.includes(searchTerm) || log.module.includes(searchTerm) || log.action.includes(searchTerm)
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">操作日志查看</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看用户操作记录</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索用户、模块或操作..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>用户</TableHead>
              <TableHead>模块</TableHead>
              <TableHead>操作</TableHead>
              <TableHead>操作对象</TableHead>
              <TableHead>IP地址</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-border">
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell className="text-muted-foreground">{log.target}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{log.ip}</TableCell>
                <TableCell>
                  <Badge variant={log.status === "success" ? "default" : "destructive"}>
                    {log.status === "success" ? "成功" : "失败"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{log.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>共 {filteredLogs.length} 条记录</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <span className="px-2">1 / 1</span>
          <Button variant="outline" size="sm" disabled>下一页</Button>
        </div>
      </div>
    </div>
  )
}
