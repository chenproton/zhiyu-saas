"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Key,
  Building2,
  Server,
  Download,
  Copy,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { tenants, orders, resourceTypeCodes } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, name: "选择租户与订单", description: "关联已付款订单" },
  { id: 2, name: "录入环境特征", description: "绑定机器码" },
  { id: 3, name: "生成与签发", description: "下载授权文件" },
]

function generateSerialNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const segments = []
  for (let i = 0; i < 4; i++) {
    let segment = ""
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    segments.push(segment)
  }
  return segments.join("-")
}

function calculateEndDate(startDate: string, duration: string) {
  const start = new Date(startDate)
  switch (duration) {
    case "30天":
      start.setDate(start.getDate() + 30)
      break
    case "6个月":
      start.setMonth(start.getMonth() + 6)
      break
    case "1年":
      start.setFullYear(start.getFullYear() + 1)
      break
    case "2年":
      start.setFullYear(start.getFullYear() + 2)
      break
    case "3年":
      start.setFullYear(start.getFullYear() + 3)
      break
    case "买断":
      start.setFullYear(start.getFullYear() + 99)
      break
    default:
      start.setFullYear(start.getFullYear() + 1)
  }
  return start.toISOString().split("T")[0]
}

function IssueLicenseContent() {
  const searchParams = useSearchParams()
  const preselectedOrderId = searchParams.get("order")

  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    tenantId: "",
    orderId: preselectedOrderId || "",
    machineCode: "",
  })

  const [generatedLicense, setGeneratedLicense] = useState<{
    serialNumber: string
    startDate: string
    endDate: string
  } | null>(null)

  // Filter orders for selected tenant that are completed
  const availableOrders = orders.filter(
    (o) => o.tenantId === formData.tenantId && o.paymentStatus === "completed"
  )

  const selectedTenant = tenants.find((t) => t.id === formData.tenantId)
  const selectedOrder = orders.find((o) => o.id === formData.orderId)

  // Auto-select tenant if order is preselected
  useEffect(() => {
    if (preselectedOrderId) {
      const order = orders.find((o) => o.id === preselectedOrderId)
      if (order) {
        setFormData((prev) => ({
          ...prev,
          tenantId: order.tenantId,
          orderId: preselectedOrderId,
        }))
      }
    }
  }, [preselectedOrderId])

  const canProceedStep1 = formData.tenantId && formData.orderId
  const canProceedStep2 = formData.machineCode.length >= 10

  const handleGenerate = () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate generation process
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          const today = new Date().toISOString().split("T")[0]
          setGeneratedLicense({
            serialNumber: generateSerialNumber(),
            startDate: today,
            endDate: calculateEndDate(today, selectedOrder?.duration || "1年"),
          })
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 400)
  }

  const handleCopySerialNumber = () => {
    if (generatedLicense) {
      navigator.clipboard.writeText(generatedLicense.serialNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (!generatedLicense || !selectedTenant || !selectedOrder) return

    // 资源类型编码字典格式化
    const resourceCodesSection = resourceTypeCodes
      .map(rc => `  ${rc.objectName.padEnd(8, ' ')}: ${rc.code}`)
      .join('\n')

    const licenseContent = `
================================================================================
                        LICENSE AUTHORIZATION FILE
================================================================================

Serial Number:    ${generatedLicense.serialNumber}
Tenant:           ${selectedTenant.name}
Org Code:         ${selectedTenant.orgCode}
Order:            ${selectedOrder.orderNumber}
Package:          ${selectedOrder.packageName}
Machine Code:     ${formData.machineCode}

Valid From:       ${generatedLicense.startDate}
Valid Until:      ${generatedLicense.endDate}

Status:           ACTIVE

================================================================================
                        ORGANIZATION CODE (机构码)
================================================================================
${selectedTenant.orgCode}

================================================================================
                    RESOURCE TYPE CODES (资源类型编码字典)
================================================================================
${resourceCodesSection}

================================================================================
                          DIGITAL SIGNATURE
================================================================================
SIG:${btoa(JSON.stringify({ 
  sn: generatedLicense.serialNumber, 
  mc: formData.machineCode, 
  exp: generatedLicense.endDate, 
  tenant: selectedTenant.id,
  orgCode: selectedTenant.orgCode,
  resourceCodes: resourceTypeCodes.map(rc => ({ obj: rc.objectName, code: rc.code }))
}))}
================================================================================

This license file is encrypted and bound to the specified machine code.
It contains the organization code and resource type codes dictionary.
Any attempt to modify this file will invalidate the license.

Generated: ${new Date().toISOString()}
================================================================================
    `.trim()

    const blob = new Blob([licenseContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `license-${selectedTenant.orgCode}-${generatedLicense.serialNumber}.lic`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <Link href="/licenses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">License 签发向导</h1>
            <p className="text-sm text-muted-foreground">
              按步骤完成离线授权文件的生成与签发
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li
                  key={step.id}
                  className={cn("relative", stepIdx !== steps.length - 1 ? "flex-1" : "")}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                        currentStep > step.id
                          ? "border-accent bg-accent"
                          : currentStep === step.id
                            ? "border-accent bg-transparent"
                            : "border-border bg-transparent"
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5 text-accent-foreground" />
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            currentStep === step.id
                              ? "text-accent"
                              : "text-muted-foreground"
                          )}
                        >
                          {step.id}
                        </span>
                      )}
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div
                        className={cn(
                          "ml-4 h-0.5 flex-1",
                          currentStep > step.id ? "bg-accent" : "bg-border"
                        )}
                      />
                    )}
                  </div>
                  <div className="mt-2">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Step content */}
        <div className="mx-auto max-w-2xl">
          {/* Step 1: Select Tenant & Order */}
          {currentStep === 1 && (
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                    <Building2 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-card-foreground">
                      选择目标租户及关联订单
                    </CardTitle>
                    <CardDescription>
                      选择需要签发授权的租户，并关联已付款的订单
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tenant">目标租户 *</Label>
                  <Select
                    value={formData.tenantId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tenantId: value, orderId: "" })
                    }
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="选择租户" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants
                        .filter((t) => t.status !== "churned")
                        .map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.tenantId && (
                  <div className="space-y-2">
                    <Label htmlFor="order">关联订单 *</Label>
                    {availableOrders.length > 0 ? (
                      <Select
                        value={formData.orderId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, orderId: value })
                        }
                      >
                        <SelectTrigger className="bg-input">
                          <SelectValue placeholder="选择已付款订单" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.orderNumber} - {order.packageName} ({order.duration})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
                        该租户暂无已付款订单
                      </p>
                    )}
                  </div>
                )}

                {selectedOrder && (
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="mb-2 text-sm font-medium text-card-foreground">订单信息</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">套餐: </span>
                        <span className="text-card-foreground">{selectedOrder.packageName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">时长: </span>
                        <span className="text-card-foreground">{selectedOrder.duration}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">金额: </span>
                        <span className="text-card-foreground">
                          ¥{selectedOrder.amount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">状态: </span>
                        <Badge className="bg-success/20 text-success">已付款</Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    disabled={!canProceedStep1}
                    onClick={() => setCurrentStep(2)}
                    className="gap-2"
                  >
                    下一步
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Machine Code */}
          {currentStep === 2 && (
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                    <Server className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-card-foreground">
                      录入私有化环境特征
                    </CardTitle>
                    <CardDescription>
                      输入客户提供的内网服务器机器码/MAC地址，用于防拷贝绑定
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="mb-1 text-sm font-medium text-card-foreground">
                    目标租户: {selectedTenant?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    关联订单: {selectedOrder?.orderNumber}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="machineCode">机器码 / MAC 地址 *</Label>
                  <Input
                    id="machineCode"
                    placeholder="例如: 8C:85:90:A1:B2:C3 或 服务器唯一标识"
                    className="bg-input font-mono"
                    value={formData.machineCode}
                    onChange={(e) =>
                      setFormData({ ...formData, machineCode: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    此信息由客户在其私有化服务器上获取并提供，用于将授权绑定到特定硬件
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    上一步
                  </Button>
                  <Button
                    disabled={!canProceedStep2}
                    onClick={() => setCurrentStep(3)}
                    className="gap-2"
                  >
                    下一步
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Generate & Issue */}
          {currentStep === 3 && (
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                    <Key className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-card-foreground">
                      生成与签发 License
                    </CardTitle>
                    <CardDescription>
                      确认信息无误后，点击生成按钮完成授权签发
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="space-y-4 rounded-lg bg-secondary p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">租户: </span>
                      <span className="font-medium text-card-foreground">
                        {selectedTenant?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">订单: </span>
                      <span className="font-mono text-card-foreground">
                        {selectedOrder?.orderNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">套餐: </span>
                      <span className="text-card-foreground">{selectedOrder?.packageName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">时长: </span>
                      <span className="text-card-foreground">{selectedOrder?.duration}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">机器码: </span>
                      <span className="font-mono text-card-foreground">
                        {formData.machineCode}
                      </span>
                    </div>
                  </div>
                </div>

                {!generatedLicense && !isGenerating && (
                  <Button onClick={handleGenerate} className="w-full gap-2">
                    <Key className="h-4 w-4" />
                    生成 License
                  </Button>
                )}

                {isGenerating && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">正在生成授权...</span>
                      <span className="text-card-foreground">
                        {Math.round(generationProgress)}%
                      </span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </div>
                )}

                {generatedLicense && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm font-medium text-success">
                        License 生成成功！
                      </span>
                    </div>

                    {/* 下载包内容清单 */}
                    <div className="rounded-lg bg-secondary p-4">
                      <p className="mb-3 text-sm font-medium text-card-foreground">
                        下载包包含以下内容：
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-card-foreground">License 授权凭证</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-muted-foreground">客户机构码: </span>
                          <span className="font-mono font-semibold text-accent">
                            {selectedTenant?.orgCode}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-card-foreground">
                            最新资源类型编码字典（{resourceTypeCodes.length} 项）
                          </span>
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>License 序列号</Label>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={generatedLicense.serialNumber}
                            className="bg-input font-mono"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopySerialNumber}
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">生效日期</Label>
                          <p className="text-sm font-medium text-card-foreground">
                            {generatedLicense.startDate}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">失效日期</Label>
                          <p className="text-sm font-medium text-card-foreground">
                            {generatedLicense.endDate}
                          </p>
                        </div>
                      </div>

                      <Button onClick={handleDownload} className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        下载 License 授权文件 (.lic)
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    disabled={isGenerating}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    上一步
                  </Button>
                  {generatedLicense && (
                    <Link href="/licenses">
                      <Button variant="outline">返回授权列表</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function IssueLicensePage() {
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
      <IssueLicenseContent />
    </Suspense>
  )
}
