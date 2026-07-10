"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Upload, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { resourceApi, type Resource, type ResourceTag } from "@/lib/api"
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

function buildTags(resourceId: string, majors: string[], industries: string[], level: string, difficulty: string): ResourceTag[] {
  const tags: ResourceTag[] = []
  majors.forEach((tagValue) => {
    tags.push({ id: "", resourceId, tagType: "major", tagValue })
  })
  industries.forEach((tagValue) => {
    tags.push({ id: "", resourceId, tagType: "industry", tagValue })
  })
  if (level) {
    tags.push({ id: "", resourceId, tagType: "level", tagValue: level })
  }
  if (difficulty) {
    tags.push({ id: "", resourceId, tagType: "difficulty", tagValue: difficulty })
  }
  return tags
}

export default function EditResourcePage() {
  const params = useParams()
  const router = useRouter()
  const resourceId = params.id as string

  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    intro: "",
    category: "course" as ResourceCategoryId,
    price: "",
    level: "",
    difficulty: "",
  })
  const [majors, setMajors] = useState<string[]>([])
  const [industries, setIndustries] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await resourceApi.get(resourceId)
        if (cancelled) return
        setResource(data)
        const tags = data.tags || []
        setFormData({
          name: data.name || "",
          intro: data.intro || "",
          category: (data.category as ResourceCategoryId) || "course",
          price: data.price?.toString() || "",
          level: tags.find((t) => t.tagType === "level")?.tagValue || "",
          difficulty: tags.find((t) => t.tagType === "difficulty")?.tagValue || "",
        })
        setMajors(tags.filter((t) => t.tagType === "major").map((t) => t.tagValue))
        setIndustries(tags.filter((t) => t.tagType === "industry").map((t) => t.tagValue))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载资源失败")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [resourceId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !resource) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{error || "资源不存在"}</p>
          <Link href="/my-resources">
            <Button variant="outline">返回我的资源</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const isPublished = resource.status === "published"
  const nextVersion = isPublished
    ? `v${(parseFloat(resource.version.replace("v", "")) + 0.1).toFixed(1)}`
    : resource.version

  const toggleMajor = (tag: string) => {
    setMajors((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleIndustry = (tag: string) => {
    setIndustries((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = async (action: "draft" | "submit") => {
    setSaving(true)
    setError(null)
    try {
      const payload: Partial<Resource> = {
        name: formData.name,
        intro: formData.intro,
        category: formData.category,
        price: Number(formData.price) || 0,
        version: nextVersion,
        coverImage: resource.coverImage,
        attachment: resource.attachment,
        attachmentName: resource.attachmentName,
        tags: buildTags(resource.id, majors, industries, formData.level, formData.difficulty),
      }
      await resourceApi.update(resource.id, payload)
      if (action === "submit") {
        await resourceApi.submit(resource.id)
      }
      router.push("/my-resources")
    } catch (err) {
      setError(err instanceof Error ? err.message : `${action === "draft" ? "保存" : "提交审核"}失败`)
    } finally {
      setSaving(false)
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
            <h1 className="text-2xl font-semibold text-foreground">编辑资源</h1>
            <p className="text-sm text-muted-foreground">修改资源信息</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPublished && (
          <Alert className="border-warning/30 bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              修改后将生成新版本 {nextVersion}，已购用户仍可使用旧版本 {resource.version}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">资源名称 *</Label>
                  <Input
                    id="name"
                    maxLength={50}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intro">资源简介 *</Label>
                  <Textarea
                    id="intro"
                    maxLength={500}
                    rows={5}
                    value={formData.intro}
                    onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>资源品类 *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as ResourceCategoryId })}
                      disabled={saving}
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
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>适用层次</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(v) => setFormData({ ...formData, level: v })}
                      disabled={saving}
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
                      disabled={saving}
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
                  <Label>封面图 *</Label>
                  <Input type="file" accept="image/*" disabled={saving} />
                </div>
                <div className="space-y-2">
                  <Label>资源附件</Label>
                  <Input type="file" disabled={saving} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                保存
              </Button>
              <Button onClick={() => handleSubmit("submit")} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                提交审核
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
                    src={resource.coverImage || "/placeholder.jpg"}
                    alt="预览封面"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{formData.name || "资源名称"}</h3>
                  <Badge className={`mt-2 ${getCategoryColor(formData.category)}`}>
                    {getCategoryName(formData.category)}
                  </Badge>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {formData.intro || "资源简介"}
                </p>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">买断价格</p>
                  <p className="text-xl font-bold text-accent">
                    ¥{formData.price ? Number(formData.price).toLocaleString() : "0"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">版本号</p>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {nextVersion}
                    {isPublished && <span className="ml-2 text-xs text-warning">新版本</span>}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
