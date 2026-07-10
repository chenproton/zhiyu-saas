"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Download, RefreshCw } from "lucide-react"

const mockLogs = [
  { id: "1", user: "张三", ip: "192.168.1.100", location: "浙江省杭州市", device: "Chrome/Windows", status: "success", time: "2026-04-14 09:30:15" },
  { id: "2", user: "李四", ip: "192.168.1.101", location: "北京市海淀区", device: "Safari/MacOS", status: "success", time: "2026-04-14 09:25:30" },
  { id: "3", user: "王五", ip: "192.168.1.102", location: "上海市浦东新区", device: "Firefox/Windows", status: "failed", time: "2026-04-14 09:20:45" },
  { id: "4", user: "赵六", ip: "192.168.1.103", location: "广东省深圳市", device: "Chrome/Android", status: "success", time: "2026-04-14 09:15:00" },
  { id: "5", user: "钱七", ip: "192.168.1.104", location: "江苏省南京市", device: "Edge/Windows", status: "success", time: "2026-04-14 09:10:15" },
  { id: "6", user: "张三", ip: "192.168.1.100", location: "浙江省杭州市", device: "Chrome/Windows", status: "failed", time: "2026-04-14 08:55:30" },
  { id: "7", user: "孙八", ip: "192.168.1.105", location: "四川省成都市", device: "Safari/iOS", status: "success", time: "2026-04-14 08:45:45" },
  { id: "8", user: "周九", ip: "192.168.1.106", location: "湖北省武汉市", device: "Chrome/MacOS", status: "success", time: "2026-04-14 08:30:00" },
]

export default function LoginLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLogs = mockLogs.filter((log) =>
    log.user.includes(searchTerm) || log.ip.includes(searchTerm)
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">登录日志查看</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看用户登录记录</p>
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
          <Input placeholder="搜索用户名或IP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>用户</TableHead>
              <TableHead>IP地址</TableHead>
              <TableHead>登录地点</TableHead>
              <TableHead>设备</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>登录时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-border">
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{log.ip}</TableCell>
                <TableCell>{log.location}</TableCell>
                <TableCell className="text-muted-foreground">{log.device}</TableCell>
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
