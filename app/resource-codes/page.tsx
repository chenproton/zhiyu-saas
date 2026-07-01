"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Pencil,
  RefreshCw,
  Info,
  Cog,
  Download,
} from "lucide-react"
import { resourceTypeCodes, generateResourceTypeCode, type ResourceTypeCode } from "@/lib/mock-data"

export default function ResourceCodesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [selectedCode, setSelectedCode] = useState<ResourceTypeCode | null>(null)
  const [editForm, setEditForm] = useState({
    code: "",
    description: "",
  })
  const [codeError, setCodeError] = useState("")

  const filteredCodes = resourceTypeCodes.filter((rc) =>
    rc.objectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rc.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (rc: ResourceTypeCode) => {
    setSelectedCode(rc)
    setEditForm({ code: rc.code, description: rc.description })
    setCodeError("")
    setEditOpen(true)
  }

  const validateCode = (code: string): boolean => {
    // 验证格式：1字母 + 1数字
    const regex = /^[A-Z][0-9]$/
    return regex.test(code.toUpperCase())
  }

  const isCodeUnique = (code: string): boolean => {
    // 检查是否与其他编码重复（排除当前编辑的）
    return !resourceTypeCodes.some(
      (rc) => rc.code.toUpperCase() === code.toUpperCase() && rc.id !== selectedCode?.id
    )
  }

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase()
    setEditForm({ ...editForm, code: upperValue })
    
    if (upperValue && !validateCode(upperValue)) {
      setCodeError("格式错误：必须为1位字母 + 1位数字（如 A1、B2）")
    } else if (upperValue && !isCodeUnique(upperValue)) {
      setCodeError("编码已存在，请使用其他编码")
    } else {
      setCodeError("")
    }
  }

  const handleRandomGenerate = () => {
    let newCode = generateResourceTypeCode()
    // 确保生成的编码不重复
    while (!isCodeUnique(newCode)) {
      newCode = generateResourceTypeCode()
    }
    setEditForm({ ...editForm, code: newCode })
    setCodeError("")
  }

  const handleSave = () => {
    if (!validateCode(editForm.code) || !isCodeUnique(editForm.code)) {
      return
    }
    // 模拟保存
    alert(`资源类型编码已更新！\n\n对象: ${selectedCode?.objectName}\n新编码: ${editForm.code}`)
    setEditOpen(false)
    setSelectedCode(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">资源类型编码配置</h1>
          <p className="text-sm text-muted-foreground">
            维护全平台统一的系统对象元数据标识，作为底层数据流转的基础字典
          </p>
        </div>

        {/* Important Alert */}
        <Alert className="border-info/50 bg-info/10">
          <Info className="h-4 w-4 text-info" />
          <AlertTitle className="text-info">提示</AlertTitle>
          <AlertDescription className="text-info/90">
            此处配置的资源类型编码字典，将在您进行【租户 License 及初始化包导出】时，连同【机构码】一并注入到下发文件中，供私有化平台同步。
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已配置对象
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {resourceTypeCodes.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                编码格式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="text-lg font-mono">1字母 + 1数字</Badge>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                最后更新
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-card-foreground">
                2024-03-05
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base text-card-foreground">编码列表</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索对象名称或编码..."
                  className="bg-input pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">系统对象名称</TableHead>
                  <TableHead className="text-muted-foreground">资源类型编码</TableHead>
                  <TableHead className="text-muted-foreground">描述说明</TableHead>
                  <TableHead className="text-muted-foreground">更新人</TableHead>
                  <TableHead className="text-muted-foreground">更新时间</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((rc) => (
                  <TableRow key={rc.id} className="border-border">
                    <TableCell className="font-medium text-card-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/20">
                          <Cog className="h-4 w-4 text-accent" />
                        </div>
                        {rc.objectName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-accent/20 text-accent font-mono text-lg px-3 py-1">
                        {rc.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {rc.description}
                    </TableCell>
                    <TableCell className="text-card-foreground">{rc.updatedBy}</TableCell>
                    <TableCell className="text-muted-foreground">{rc.updatedAt}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleEdit(rc)}
                      >
                        <Pencil className="h-3 w-3" />
                        配置
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Export Preview */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-card-foreground">导出预览</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                导出字典
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 font-mono text-sm">
              <pre className="text-muted-foreground">
{`{
  "resourceTypeCodes": [
${resourceTypeCodes.map(rc => `    { "object": "${rc.objectName}", "code": "${rc.code}" }`).join(',\n')}
  ],
  "version": "1.0.0",
  "exportTime": "${new Date().toISOString()}"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>配置资源类型编码</DialogTitle>
              <DialogDescription>
                为 &quot;{selectedCode?.objectName}&quot; 配置资源类型编码
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">资源类型编码 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="例如: A1, B2, C9"
                    className={`bg-input font-mono text-lg uppercase ${
                      codeError ? "border-destructive" : ""
                    }`}
                    value={editForm.code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    maxLength={2}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRandomGenerate}
                    title="随机生成"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {codeError ? (
                  <p className="text-xs text-destructive">{codeError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    格式：1位大写字母 + 1位数字（如 A1、B2、C9），全局唯一
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述说明</Label>
                <Textarea
                  id="description"
                  placeholder="请输入编码用途描述"
                  className="bg-input"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>

              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">
                  当前编码: <span className="font-mono text-accent">{selectedCode?.code}</span>
                  {editForm.code && editForm.code !== selectedCode?.code && (
                    <>
                      {" "} → 新编码: <span className="font-mono text-success">{editForm.code}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={!!codeError || !editForm.code}
              >
                保存配置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
