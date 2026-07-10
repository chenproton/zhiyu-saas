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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Plus, Pencil, Trash2, Search, ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const relationTypes = [
  { value: "superior", label: "上下级" },
  { value: "collaboration", label: "业务协同" },
  { value: "management", label: "管理关系" },
  { value: "service", label: "服务关系" },
  { value: "project", label: "项目参与" },
  { value: "external", label: "外部合作" },
]

const mockUsers = [
  { id: "1", name: "张三", department: "信息工程学院" },
  { id: "2", name: "李四", department: "计算机系" },
  { id: "3", name: "王五", department: "教务处" },
  { id: "4", name: "赵六", department: "学生处" },
  { id: "5", name: "钱七", department: "财务处" },
]

const relations = [
  { id: 1, initiator: "张三", initiatorDept: "信息工程学院", target: "李四", targetDept: "计算机系", type: "上下级", createdAt: "2024-01-15" },
  { id: 2, initiator: "王五", initiatorDept: "教务处", target: "赵六", targetDept: "学生处", type: "业务协同", createdAt: "2024-02-20" },
  { id: 3, initiator: "钱七", initiatorDept: "财务处", target: "张三", targetDept: "信息工程学院", type: "服务关系", createdAt: "2024-03-10" },
]

export default function RelationsPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [initiatorOpen, setInitiatorOpen] = useState(false)
  const [targetOpen, setTargetOpen] = useState(false)
  const [selectedInitiator, setSelectedInitiator] = useState("")
  const [selectedTarget, setSelectedTarget] = useState("")

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索关系..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
        <Button onClick={() => setShowDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          新增关系
        </Button>
      </div>

      <div className="bg-card rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">序号</TableHead>
              <TableHead>关系发起人</TableHead>
              <TableHead>所属部门</TableHead>
              <TableHead>关系目标人</TableHead>
              <TableHead>所属部门</TableHead>
              <TableHead>关系类型</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-32 text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relations.map((relation, index) => (
              <TableRow key={relation.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{relation.initiator}</TableCell>
                <TableCell className="text-muted-foreground">{relation.initiatorDept}</TableCell>
                <TableCell className="font-medium">{relation.target}</TableCell>
                <TableCell className="text-muted-foreground">{relation.targetDept}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                    {relation.type}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{relation.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增关系</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">关系发起人</label>
              <Popover open={initiatorOpen} onOpenChange={setInitiatorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={initiatorOpen}
                    className="w-full justify-between"
                  >
                    {selectedInitiator
                      ? mockUsers.find((user) => user.id === selectedInitiator)?.name
                      : "搜索选择用户..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="搜索用户..." />
                    <CommandList>
                      <CommandEmpty>未找到用户</CommandEmpty>
                      <CommandGroup>
                        {mockUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={(currentValue) => {
                              setSelectedInitiator(currentValue === selectedInitiator ? "" : currentValue)
                              setInitiatorOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedInitiator === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <div>{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.department}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">关系目标人</label>
              <Popover open={targetOpen} onOpenChange={setTargetOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={targetOpen}
                    className="w-full justify-between"
                  >
                    {selectedTarget
                      ? mockUsers.find((user) => user.id === selectedTarget)?.name
                      : "搜索选择用户..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="搜索用户..." />
                    <CommandList>
                      <CommandEmpty>未找到用户</CommandEmpty>
                      <CommandGroup>
                        {mockUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={(currentValue) => {
                              setSelectedTarget(currentValue === selectedTarget ? "" : currentValue)
                              setTargetOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTarget === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <div>{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.department}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">关系类型</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="请选择关系类型" />
                </SelectTrigger>
                <SelectContent>
                  {relationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={() => setShowDialog(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
