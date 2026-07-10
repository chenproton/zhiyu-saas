"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Download, RefreshCw } from "lucide-react"

const mockLogs = [
  { id: "1", user: "张三", module: "用户管理", action: "新增用户", target: "李明", ip: "192.168.1.100", status: "success", time: "2026-04-14 10:30:15" },
  { id: "2", user: "李四", module: "角色管理", action: "编辑角色", target: "管理员", ip: "192.168.1.101", status: "success", time: "2026-04-14 10:25:30" },
  { id: "3", user: "王五", module: "组织架构", action: "删除节点", target: "测试部门", ip: "192.168.1.102", status: "failed", time: "2026-04-14 10:20:45" },
  { id: "4", user: "赵六", module: "资源管理", action: "上传文件", target: "课程资料.pdf", ip: "192.168.1.103", status: "success", time: "2026-04-14 10:15:00" },
  { id: "5", user: "钱七", module: "审批流程", action: "新增流程", target: "请假审批", ip: "192.168.1.104", status: "success", time: "2026-04-14 10:10:15" },
  { id: "6", user: "张三", module: "系统设置", action: "修改配置", target: "邮件服务", ip: "192.168.1.100", status: "success", time: "2026-04-14 09:55:30" },
  { id: "7", user: "孙八", module: "用户管理", action: "停用用户", target: "测试账号", ip: "192.168.1.105", status: "success", time: "2026-04-14 09:45:45" },
  { id: "8", user: "周九", module: "权限管理", action: "分配权限", target: "编辑角色", ip: "192.168.1.106", status: "success", time: "2026-04-14 09:30:00" },
]

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
