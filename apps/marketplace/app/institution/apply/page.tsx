"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Building2, Upload, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { authApi, institutionApi } from "@/lib/api"

const steps = ["选择类型", "基本信息", "资质文件", "机构简介", "提交审核"]

const MAJOR_TAGS = [
  "信息安全",
  "计算机网络",
  "软件技术",
  "大数据技术",
  "人工智能",
  "物联网",
  "云计算",
  "数字媒体",
  "电子商务",
  "智能制造",
]

function generateOrgCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "ORG-"
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function InstitutionApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [type, setType] = useState<"school" | "enterprise" | "">("")
  const [formData, setFormData] = useState({
    name: "",
    creditCode: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    intro: "",
  })
  const [expertiseTags, setExpertiseTags] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [qualificationFile, setQualificationFile] = useState<string>("")
  const [logoFile, setLogoFile] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    async function loadMe() {
      try {
        const { institution } = await authApi.me()
        if (!cancelled && institution) {
          setExistingId(institution.id)
          setType(institution.type)
          setFormData({
            name: institution.name,
            creditCode: institution.creditCode,
            contactName: institution.contactName,
            contactPhone: institution.contactPhone,
            contactEmail: institution.contactEmail,
            intro: institution.intro,
          })
          setExpertiseTags(institution.expertiseTags || [])
          setQualificationFile(institution.qualificationFile || "")
          setLogoFile(institution.logo || "")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "获取机构信息失败")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    loadMe()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleTag = (tag: string) => {
    setExpertiseTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const canProceed = () => {
    if (step === 0) return !!type
    if (step === 1) {
      return (
        formData.name.trim() &&
        formData.creditCode.trim() &&
        formData.contactName.trim() &&
        formData.contactPhone.trim() &&
        formData.contactEmail.trim()
      )
    }
    if (step === 2) return true
    if (step === 3) return true
    return true
  }

  const handleNext = () => {
    if (!canProceed()) return
    if (step < steps.length - 1) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!type) return
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        type,
        name: formData.name.trim(),
        creditCode: formData.creditCode.trim(),
        intro: formData.intro.trim(),
        contactName: formData.contactName.trim(),
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim(),
        expertiseTags,
        logo: logoFile || undefined,
        qualificationFile: qualificationFile || undefined,
      }

      if (existingId) {
        await institutionApi.update(existingId, payload)
      } else {
        await institutionApi.create({ ...payload, orgCode: generateOrgCode() })
      }

      setSubmitted(true)
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试")
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">机构入驻申请</h1>
            <p className="text-sm text-muted-foreground">填写信息，提交平台审核</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between">
          {steps.map((label, index) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    index <= step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-1 text-xs text-muted-foreground">{label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    index < step ? "bg-accent" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {submitted ? (
          <Card className="border-success/30 bg-success/10">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-success" />
              <h2 className="mt-4 text-xl font-semibold text-success">入驻申请已提交</h2>
              <p className="mt-2 text-sm text-success/80">
                平台将在 1-3 个工作日内完成审核，请耐心等待
              </p>
              <p className="mt-4 text-xs text-muted-foreground">3 秒后自动返回首页...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{steps[step]}</CardTitle>
              <CardDescription>
                {step === 0 && "请选择您的机构类型"}
                {step === 1 && "填写机构基本信息"}
                {step === 2 && "上传机构资质文件"}
                {step === 3 && "填写机构简介并选择擅长领域"}
                {step === 4 && "确认信息并提交审核"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">加载中...</p>
                </div>
              )}

              {!loading && error && (
                <Alert variant="destructive">
                  <AlertTitle>出错了</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!loading && step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => setType("school")}
                    className={`flex flex-col items-center gap-3 rounded-lg border p-6 transition-colors ${
                      type === "school"
                        ? "border-accent bg-accent/10"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <Building2 className="h-10 w-10 text-accent" />
                    <span className="font-medium text-foreground">学校</span>
                    <span className="text-xs text-muted-foreground">职业院校、技工院校等</span>
                  </button>
                  <button
                    onClick={() => setType("enterprise")}
                    className={`flex flex-col items-center gap-3 rounded-lg border p-6 transition-colors ${
                      type === "enterprise"
                        ? "border-accent bg-accent/10"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <Building2 className="h-10 w-10 text-info" />
                    <span className="font-medium text-foreground">企业</span>
                    <span className="text-xs text-muted-foreground">教育科技企业、培训机构等</span>
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>机构名称 *</Label>
                    <Input
                      placeholder="请输入机构全称"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>统一社会信用代码 *</Label>
                    <Input
                      placeholder="请输入统一社会信用代码"
                      value={formData.creditCode}
                      onChange={(e) => setFormData({ ...formData, creditCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>联系人姓名 *</Label>
                    <Input
                      placeholder="请输入联系人姓名"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>联系人手机号 *</Label>
                    <Input
                      placeholder="请输入手机号"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>联系人邮箱 *</Label>
                    <Input
                      type="email"
                      placeholder="请输入邮箱"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>机构 Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Input type="file" className="max-w-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      资质文件 *（{type === "school" ? "办学许可证" : "营业执照"}）
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input type="file" />
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>机构简介（200字内）</Label>
                    <Textarea
                      placeholder="简要介绍机构情况..."
                      maxLength={200}
                      value={formData.intro}
                      onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>擅长专业领域</Label>
                    <div className="flex flex-wrap gap-2">
                      {MAJOR_TAGS.map((tag) => (
                        <Badge
                          key={tag}
                          variant={expertiseTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 rounded-lg bg-secondary p-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">机构类型</p>
                      <p className="font-medium text-foreground">{type === "school" ? "学校" : "企业"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">机构名称</p>
                      <p className="font-medium text-foreground">{formData.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">统一社会信用代码</p>
                      <p className="font-medium text-foreground">{formData.creditCode || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">联系人</p>
                      <p className="font-medium text-foreground">{formData.contactName || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">擅长领域</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {expertiseTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handlePrev} disabled={step === 0}>
                  上一步
                </Button>
                {step === steps.length - 1 ? (
                  <Button onClick={handleSubmit}>提交审核</Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={step === 0 && !type}
                  >
                    下一步
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
