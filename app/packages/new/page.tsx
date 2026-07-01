"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Save, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { featureModules, aiModels } from "@/lib/mock-data"
export default function NewPackagePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    aiModel: "",
    dailyTokenLimit: "",
    maxStudentAccounts: "",
    maxTeacherAccounts: "",
    price: "",
    isActive: true,
  })

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    )
  }

  const handleSelectModule = (moduleId: string) => {
    const module = featureModules.find((m) => m.id === moduleId)
    if (!module) return

    const moduleFeatureIds = module.children.map((f) => f.id)
    const allSelected = moduleFeatureIds.every((id) => selectedFeatures.includes(id))

    if (allSelected) {
      setSelectedFeatures((prev) =>
        prev.filter((id) => !moduleFeatureIds.includes(id))
      )
    } else {
      setSelectedFeatures((prev) => [
        ...prev,
        ...moduleFeatureIds.filter((id) => !prev.includes(id)),
      ])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ ...formData, features: selectedFeatures })
    alert("套餐创建成功！（模拟）")
    router.push("/packages")
  }

  const canProceedToStep2 = formData.name && formData.code && formData.aiModel && 
    formData.dailyTokenLimit && formData.maxStudentAccounts && formData.maxTeacherAccounts

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <Link href="/packages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">新建套餐</h1>
            <p className="text-sm text-muted-foreground">
              配置新的产品套餐，设定功能模块和资源配额
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <span className={step >= 1 ? "text-foreground" : "text-muted-foreground"}>
              基础信息 & 资源配额
            </span>
          </div>
          <div className="h-px w-16 bg-border" />
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 2 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            }`}>
              2
            </div>
            <span className={step >= 2 ? "text-foreground" : "text-muted-foreground"}>
              功能配置
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic info & Quotas */}
          {step === 1 && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Basic info */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-card-foreground">基础信息</CardTitle>
                  <CardDescription>设置套餐的名称和标识</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">套餐名称 *</Label>
                    <Input
                      id="name"
                      placeholder="例如：高级版、企业版"
                      className="bg-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">套餐标识码 *</Label>
                    <Input
                      id="code"
                      placeholder="例如：PRO-2024"
                      className="bg-input font-mono"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      用于系统内部识别，建议使用大写字母和数字
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">套餐价格 (元/年)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      className="bg-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                    <div className="space-y-0.5">
                      <Label>立即上架</Label>
                      <p className="text-xs text-muted-foreground">
                        开启后套餐将立即可供销售
                      </p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quotas */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-card-foreground">资源配额</CardTitle>
                  <CardDescription>设置套餐的资源使用限制</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aiModel">AI 模型 *</Label>
                    <Select
                      value={formData.aiModel}
                      onValueChange={(value) => setFormData({ ...formData, aiModel: value })}
                    >
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="选择 AI 模型" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyTokenLimit">每日 Token 消耗额度 *</Label>
                    <Input
                      id="dailyTokenLimit"
                      type="number"
                      placeholder="例如：50000"
                      className="bg-input"
                      value={formData.dailyTokenLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, dailyTokenLimit: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      每天可使用的 Token 数量上限
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudentAccounts">最大学生账号数 *</Label>
                    <Input
                      id="maxStudentAccounts"
                      type="number"
                      placeholder="例如：500"
                      className="bg-input"
                      value={formData.maxStudentAccounts}
                      onChange={(e) =>
                        setFormData({ ...formData, maxStudentAccounts: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTeacherAccounts">最大教师账号数 *</Label>
                    <Input
                      id="maxTeacherAccounts"
                      type="number"
                      placeholder="例如：50"
                      className="bg-input"
                      value={formData.maxTeacherAccounts}
                      onChange={(e) =>
                        setFormData({ ...formData, maxTeacherAccounts: e.target.value })
                      }
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 1 Actions */}
              <div className="flex justify-end gap-4 lg:col-span-2">
                <Link href="/packages">
                  <Button variant="outline">取消</Button>
                </Link>
                <Button 
                  type="button" 
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className="gap-2"
                >
                  下一步
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Feature configuration */}
          {step === 2 && (
            <div className="space-y-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-card-foreground">功能配置</CardTitle>
                  <CardDescription>
                    选择此套餐包含的功能模块（已选 {selectedFeatures.length} 项）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {featureModules.map((module) => {
                      const moduleFeatureIds = module.children.map((f) => f.id)
                      const allSelected = moduleFeatureIds.every((id) =>
                        selectedFeatures.includes(id)
                      )
                      const someSelected = moduleFeatureIds.some((id) =>
                        selectedFeatures.includes(id)
                      )

                      return (
                        <div key={module.id} className="space-y-3 rounded-lg border border-border p-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`module-${module.id}`}
                              checked={allSelected}
                              className={someSelected && !allSelected ? "opacity-50" : ""}
                              onCheckedChange={() => handleSelectModule(module.id)}
                            />
                            <Label
                              htmlFor={`module-${module.id}`}
                              className="text-sm font-medium text-card-foreground cursor-pointer"
                            >
                              {module.name}
                            </Label>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {moduleFeatureIds.filter(id => selectedFeatures.includes(id)).length}/{module.children.length}
                            </span>
                          </div>
                          <div className="space-y-2 pl-6 max-h-48 overflow-y-auto">
                            {module.children.map((feature) => (
                              <div key={feature.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={feature.id}
                                  checked={selectedFeatures.includes(feature.id)}
                                  onCheckedChange={() => handleFeatureToggle(feature.id)}
                                />
                                <Label
                                  htmlFor={feature.id}
                                  className="text-sm text-muted-foreground cursor-pointer"
                                >
                                  {feature.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 Actions */}
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  上一步
                </Button>
                <div className="flex gap-4">
                  <Link href="/packages">
                    <Button variant="outline">取消</Button>
                  </Link>
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    保存套餐
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}
