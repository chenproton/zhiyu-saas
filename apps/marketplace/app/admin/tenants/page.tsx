"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Building2, GraduationCap } from "lucide-react"
import { institutionApi, type Institution, type InstitutionStatus } from "@/lib/api"

function InstitutionStatusBadge({ status }: { status: InstitutionStatus }) {
  const variants: Record<InstitutionStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    approved: "bg-green-100 text-green-800 hover:bg-green-100",
    disabled: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  }
  const labels: Record<InstitutionStatus, string> = {
    pending: "待审核",
    approved: "已入驻",
    disabled: "已禁用",
  }
  return (
    <Badge variant="secondary" className={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

export default function AdminTenantsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchInstitutions()
  }, [])

  const fetchInstitutions = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await institutionApi.list({})
      setInstitutions(res.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }

  const filteredInstitutions = useMemo(() => {
    if (!searchQuery.trim()) return institutions
    const q = searchQuery.toLowerCase()
    return institutions.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.creditCode.toLowerCase().includes(q) ||
        i.contactName.toLowerCase().includes(q) ||
        i.contactPhone.toLowerCase().includes(q)
    )
  }, [institutions, searchQuery])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">租户列表</h1>
          <p className="text-sm text-muted-foreground">查看平台全部学校/企业租户信息</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">租户总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{institutions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">学校</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {institutions.filter((i) => i.type === "school").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">企业</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {institutions.filter((i) => i.type === "enterprise").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">已入驻</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {institutions.filter((i) => i.status === "approved").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex flex-wrap gap-2 py-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索机构名称、信用代码、联系人..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">租户信息</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">加载中...</div>
            ) : error ? (
              <div className="py-8 text-center text-destructive">{error}</div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">暂无数据</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>机构名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>统一社会信用代码</TableHead>
                    <TableHead>联系人</TableHead>
                    <TableHead>联系电话</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>入驻时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstitutions.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">{inst.name}</TableCell>
                      <TableCell>
                        {inst.type === "school" ? (
                          <span className="inline-flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            学校
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            企业
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{inst.creditCode}</TableCell>
                      <TableCell>{inst.contactName}</TableCell>
                      <TableCell>{inst.contactPhone}</TableCell>
                      <TableCell>
                        <InstitutionStatusBadge status={inst.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{inst.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
