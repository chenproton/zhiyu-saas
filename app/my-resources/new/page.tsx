"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Upload } from "lucide-react"
import Link from "next/link"
import {
  RESOURCE_CATEGORIES,
  MAJOR_TAGS,
  INDUSTRY_TAGS,
  EDUCATION_LEVELS,
  DIFFICULTY_LEVELS,
  getCategoryName,
  getCategoryColor,
  type ResourceCategoryId,
} from "@/lib/mock-data"
import { resourceApi } from "@/lib/api"

export default function NewResourcePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    intro: "",
    category: "course" as ResourceCategoryId,
    price: "",
    level: "",
    difficulty: "",
    coverImage: "",
    attachment: "",
    attachmentName: "",
  })
  const [majors, setMajors] = useState<string[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleMajor = (tag: string) => {
    setMajors((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleIndustry = (tag: string) => {
    setIndustries((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = async (action: "draft" | "submit") => {
    setLoading(true)
    setError(null)
    try {
      const tags = [
        ...majors.map((v) => ({ tagType: "major" as const, tagValue: v })),
        ...industries.map((v) => ({ tagType: "industry" as const, tagValue: v })),
        ...(formData.level ? [{ tagType: "level" as const, tagValue: formData.level }] : []),
        ...(formData.difficulty ? [{ tagType: "difficulty" as const, tagValue: formData.difficulty }] : []),
      ]

      const res = await resourceApi.create({
        name: formData.name,
        intro: formData.intro,
        category: formData.category,
        price: Number(formData.price) || 0,
        coverImage: formData.coverImage || undefined,
        attachment: formData.attachment || undefined,
        attachmentName: formData.attachmentName || undefined,
        tags,
      })

      if (action === "submit") {
        await resourceApi.submit(res.id)
      }

      router.push("/my-resources")
    } catch (err: any) {
      setError(err.message || "保存失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/my-resources">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">新建资源</h1>
            <p className="text-sm text-muted-foreground">填写资源信息并上传附件</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">基本信息</CardTitle>
                <CardDescription>资源的核心展示信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">资源名称 *</Label>
                  <Input
                    id="name"
                    placeholder="不超过 50 字"
                    maxLength={50}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intro">资源简介 *</Label>
                  <Textarea
                    id="intro"
                    placeholder="不超过 500 字"
                    maxLength={500}
                    rows={5}
                    value={formData.intro}
                    onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>资源品类 *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as ResourceCategoryId })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择品类" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOURCE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">买断价格 *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="填写金额（元）"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>适用层次</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(v) => setFormData({ ...formData, level: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择适用层次" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>难度等级</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择难度等级" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((diff) => (
                          <SelectItem key={diff} value={diff}>
                            {diff}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">标签信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>所属专业 *</Label>
                  <div className="flex flex-wrap gap-2">
                    {MAJOR_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={majors.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleMajor(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>所属行业</Label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRY_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={industries.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleIndustry(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">资源文件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coverImage">封面图 URL</Label>
                  <Input
                    id="coverImage"
                    placeholder="https://..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">建议尺寸 800×600，留空使用默认封面</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attachment">资源附件 URL</Label>
                  <Input
                    id="attachment"
                    placeholder="https://..."
                    value={formData.attachment}
                    onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attachmentName">附件名称</Label>
                  <Input
                    id="attachmentName"
                    placeholder="资源包_v1.0.zip"
                    value={formData.attachmentName}
                    onChange={(e) => setFormData({ ...formData, attachmentName: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "保存中..." : "保存草稿"}
              </Button>
              <Button onClick={() => handleSubmit("submit")} disabled={loading}>
                <Upload className="mr-2 h-4 w-4" />
                {loading ? "提交中..." : "提交审核"}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">实时预览</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={formData.coverImage || "/placeholder.jpg"}
                    alt="预览封面"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {formData.name || "资源名称"}
                  </h3>
                  <Badge className={`mt-2 ${getCategoryColor(formData.category)}`}>
                    {getCategoryName(formData.category)}
                  </Badge>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {formData.intro || "资源简介将显示在这里..."}
                </p>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">买断价格</p>
                  <p className="text-xl font-bold text-accent">
                    ¥{formData.price ? Number(formData.price).toLocaleString() : "0"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">版本号</p>
                  <p className="font-mono text-sm font-medium text-foreground">v1.0（首次创建）</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
