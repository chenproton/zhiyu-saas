"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Key, Ban, CheckCircle } from "lucide-react"

const accounts = [
  { id: 1, name: "张三", identityType: "教职工", loginName: "zhangsan", status: "正常", lastLogin: "2024-03-15 10:30:00" },
  { id: 2, name: "李四", identityType: "教职工", loginName: "lisi", status: "正常", lastLogin: "2024-03-14 14:20:00" },
  { id: 3, name: "王五", identityType: "学生", loginName: "2021010001", status: "正常", lastLogin: "2024-03-15 09:15:00" },
  { id: 4, name: "赵六", identityType: "学生", loginName: "2021010002", status: "禁用", lastLogin: "2024-02-20 16:45:00" },
  { id: 5, name: "钱七", identityType: "企业人员", loginName: "qianqi@company.com", status: "正常", lastLogin: "2024-03-13 11:00:00" },
]

export default function AccountsPage() {
  const [searchText, setSearchText] = useState("")

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索姓名或账户..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">序号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>身份类型</TableHead>
              <TableHead>账户登录名</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最后登录时间</TableHead>
              <TableHead className="w-24 text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account, index) => (
              <TableRow key={account.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                    {account.identityType}
                  </span>
                </TableCell>
                <TableCell>{account.loginName}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    account.status === "正常" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {account.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{account.lastLogin}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Key className="h-4 w-4 mr-2" />
                        重置密码
                      </DropdownMenuItem>
                      {account.status === "正常" ? (
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="h-4 w-4 mr-2" />
                          禁用账户
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          启用账户
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
