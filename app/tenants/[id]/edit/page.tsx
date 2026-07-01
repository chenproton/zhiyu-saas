"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Building2, User, Globe } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { tenants, packages } from "@/lib/mock-data"

function EditTenantContent() {
  const router = useRouter()
  const params = useParams()
  const tenantId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    contactPhone: "",
    username: "",
    password: "",
    packageId: "",
    domain: "",
    address: "",
    enterpriseCode: "",
    description: "",
    remark: "",
  })

  useEffect(() => {
    const tenant = tenants.find((t) => t.id === tenantId)
    if (tenant) {
      setFormData({
        name: tenant.name,
        contactName: tenant.contactName,
        contactPhone: tenant.contactPhone,
        username: tenant.username,
        password: "",
        packageId: tenant.packageId,
        domain: tenant.domain,
        address: tenant.address,
        enterpriseCode: tenant.enterpriseCode,
        description: tenant.description,
        remark: tenant.remark,
      })
    }
    setIsLoading(false)
  }, [tenantId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
    alert("租户信息更新成功！（模拟）")
    router.push("/tenants")
  }

  const activePackages = packages.filter((p) => p.status === "active")

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <Link href="/tenants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">编辑租户</h1>
            <p className="text-sm text-muted-foreground">
              修改 {formData.name} 的配置信息
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
          {/* Company info */}
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                  <Building2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base text-card-foreground">企业信息</CardTitle>
                  <CardDescription>修改租户的企业基本资料</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">企业名称 *</Label>
                <Input
                  id="name"
                  placeholder="例如：XX科技有限公司"
                  className="bg-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enterpriseCode">企业代码 *</Label>
                <Input
                  id="enterpriseCode"
                  placeholder="统一社会信用代码"
                  className="bg-input font-mono"
                  value={formData.enterpriseCode}
                  onChange={(e) =>
                    setFormData({ ...formData, enterpriseCode: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">企业地址</Label>
                <Input
                  id="address"
                  placeholder="企业详细地址"
                  className="bg-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">企业简介</Label>
                <Textarea
                  id="description"
                  placeholder="简要描述企业情况"
                  className="bg-input min-h-[80px]"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact info */}
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-info/20">
                  <User className="h-5 w-5 text-info" />
                </div>
                <div>
                  <CardTitle className="text-base text-card-foreground">联系信息</CardTitle>
                  <CardDescription>修改客户联系人信息</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactName">联系人 *</Label>
                  <Input
                    id="contactName"
                    placeholder="联系人姓名"
                    className="bg-input"
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">联系电话 *</Label>
                  <Input
                    id="contactPhone"
                    placeholder="手机号码"
                    className="bg-input"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名 *</Label>
                  <Input
                    id="username"
                    placeholder="管理员用户名"
                    className="bg-input font-mono"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">用户密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="留空则不修改密码"
                    className="bg-input"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package & Domain */}
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/20">
                  <Globe className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-base text-card-foreground">套餐与域名</CardTitle>
                  <CardDescription>修改租户套餐及绑定域名</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="packageId">租户套餐 *</Label>
                <Select
                  value={formData.packageId}
                  onValueChange={(value) => setFormData({ ...formData, packageId: value })}
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="选择套餐" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - ¥{pkg.price.toLocaleString()}/年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  试用版套餐对应试用客户，其他套餐对应正式客户
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">绑定域名 *</Label>
                <Input
                  id="domain"
                  placeholder="例如：company.example.com"
                  className="bg-input font-mono"
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  客户私有化部署的访问域名
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">备注信息</CardTitle>
              <CardDescription>添加其他需要记录的信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="remark">备注</Label>
                <Textarea
                  id="remark"
                  placeholder="其他需要记录的信息"
                  className="bg-input min-h-[120px]"
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4 lg:col-span-2">
            <Link href="/tenants">
              <Button variant="outline">取消</Button>
            </Link>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              保存修改
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function EditTenantPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex h-[60vh] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        </DashboardLayout>
      }
    >
      <EditTenantContent />
    </Suspense>
  )
}
