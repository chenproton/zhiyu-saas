"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Calendar,
  Eye,
  GraduationCap,
  ImageIcon,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/stores/data-context"

type BannerStatus = "visible" | "hidden"

interface Banner {
  id: string
  imageData: string
  fileName: string
  title: string
  description: string
  college: string
  boundPosition: string
  jumpPosition: string
  status: BannerStatus
  sortOrder: number
  createdAt: string
}

const STORAGE_KEY = "zhiyu_banners"
const SEED_KEY = "zhiyu_banners_seeded"

const COLLEGES = [
  "全部",
  "校本级",
  "智能制造学院",
  "信息技术学院",
  "经济管理学院",
  "艺术设计学院",
  "新能源工程学院",
  "生物医药学院",
  "现代服务学院",
  "国际教育学院",
  "创新创业学院",
  "继续教育学院",
]

const SAMPLE_BANNERS: Omit<Banner, "id" | "createdAt">[] = [
  {
    imageData:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop",
    fileName: "banner-it.jpg",
    title: "信息技术，引领未来",
    description: "覆盖前端、后端、数据分析、人工智能等热门岗位",
    college: "信息技术学院",
    boundPosition: "前端开发工程师",
    jumpPosition: "前端开发工程师",
    status: "visible",
    sortOrder: 1,
  },
  {
    imageData:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop",
    fileName: "banner-manufacture.jpg",
    title: "智能制造，匠心筑梦",
    description: "机械、电气、自动化、嵌入式工程师能力模型",
    college: "智能制造学院",
    boundPosition: "机械工程师",
    jumpPosition: "机械工程师",
    status: "visible",
    sortOrder: 2,
  },
  {
    imageData:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop",
    fileName: "banner-ecommerce.jpg",
    title: "电商运营，玩转新零售",
    description: "电商运营、新媒体、直播带货岗位能力精准对接",
    college: "经济管理学院",
    boundPosition: "电商运营专员",
    jumpPosition: "电商运营专员",
    status: "visible",
    sortOrder: 3,
  },
  {
    imageData:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop",
    fileName: "banner-finance.jpg",
    title: "财税精英，从这里起步",
    description: "会计、税务、财务分析岗位能力模型",
    college: "经济管理学院",
    boundPosition: "会计师",
    jumpPosition: "会计师",
    status: "hidden",
    sortOrder: 4,
  },
  {
    imageData:
      "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&h=400&fit=crop",
    fileName: "banner-art.jpg",
    title: "艺术设计，创意无限",
    description: "品牌、视觉、UI 设计岗位能力对接",
    college: "艺术设计学院",
    boundPosition: "品牌经理",
    jumpPosition: "品牌经理",
    status: "visible",
    sortOrder: 5,
  },
]

function loadBanners(): Banner[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveBanners(banners: Banner[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banners))
}

function seedSampleBanners() {
  if (typeof window === "undefined") return
  if (localStorage.getItem(SEED_KEY)) return
  const list: Banner[] = SAMPLE_BANNERS.map((b, idx) => ({
    ...b,
    id: `banner_sample_${idx}`,
    createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
  }))
  saveBanners(list)
  localStorage.setItem(SEED_KEY, "1")
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`
}

export default function BannerManagementPage() {
  const { positions } = useData()
  const [banners, setBanners] = useState<Banner[]>([])
  const [mounted, setMounted] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [activeCollege, setActiveCollege] = useState("全部")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [imageData, setImageData] = useState("")
  const [fileName, setFileName] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [college, setCollege] = useState(COLLEGES[1])
  const [boundPosition, setBoundPosition] = useState("")
  const [jumpPosition, setJumpPosition] = useState("")
  const [status, setStatus] = useState<BannerStatus>("visible")
  const [sortOrder, setSortOrder] = useState(0)

  useEffect(() => {
    setMounted(true)
    seedSampleBanners()
    setBanners(loadBanners())
  }, [])

  const positionOptions = useMemo(
    () => Array.from(new Set(positions.map((p) => p.name).filter(Boolean))),
    [positions]
  )

  const filteredBanners = useMemo(() => {
    let result = [...banners]
    if (activeCollege !== "全部") {
      result = result.filter((b) => b.college === activeCollege)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.fileName.toLowerCase().includes(q) ||
          b.boundPosition.toLowerCase().includes(q) ||
          b.college.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => a.sortOrder - b.sortOrder)
  }, [banners, activeCollege, searchQuery])

  const visibleCount = useMemo(
    () => banners.filter((b) => b.status === "visible").length,
    [banners]
  )
  const hiddenCount = useMemo(
    () => banners.filter((b) => b.status === "hidden").length,
    [banners]
  )

  const resetForm = () => {
    setImageData("")
    setFileName("")
    setTitle("")
    setDescription("")
    setCollege(COLLEGES[1])
    setBoundPosition("")
    setJumpPosition("")
    setStatus("visible")
    setSortOrder(0)
    setEditingBanner(null)
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setImageData(banner.imageData)
    setFileName(banner.fileName)
    setTitle(banner.title)
    setDescription(banner.description)
    setCollege(banner.college || COLLEGES[1])
    setBoundPosition(banner.boundPosition)
    setJumpPosition(banner.jumpPosition)
    setStatus(banner.status)
    setSortOrder(banner.sortOrder)
    setIsDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setImageData(event.target?.result as string)
      setFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!imageData) {
      alert("请先上传轮播图")
      return
    }

    const list = loadBanners()
    if (editingBanner) {
      const index = list.findIndex((b) => b.id === editingBanner.id)
      if (index >= 0) {
        list[index] = {
          ...editingBanner,
          imageData,
          fileName,
          title,
          description,
          college,
          boundPosition,
          jumpPosition,
          status,
          sortOrder,
        }
      }
    } else {
      list.push({
        id: `banner_${Date.now()}`,
        imageData,
        fileName,
        title,
        description,
        college,
        boundPosition,
        jumpPosition,
        status,
        sortOrder,
        createdAt: new Date().toISOString(),
      })
    }

    saveBanners(list)
    setBanners(list)
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (!confirm("确定删除该轮播图吗？")) return
    const list = loadBanners().filter((b) => b.id !== id)
    saveBanners(list)
    setBanners(list)
  }

  const handleToggleStatus = (banner: Banner) => {
    const list = loadBanners().map((b) =>
      b.id === banner.id
        ? { ...b, status: b.status === "visible" ? "hidden" : "visible" }
        : b
    ) as Banner[]
    saveBanners(list)
    setBanners(list)
  }

  const stats = [
    { label: "全部轮播图", value: banners.length, icon: Layers, color: "text-blue-600 bg-blue-50" },
    { label: "展示中", value: visibleCount, icon: Eye, color: "text-green-600 bg-green-50" },
    { label: "已隐藏", value: hiddenCount, icon: Eye, color: "text-gray-600 bg-gray-100" },
  ]

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">轮播图管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              管理首页岗位能力精准对接栏的轮播图展示
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">轮播图管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理首页岗位能力精准对接栏的轮播图展示
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增轮播图
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">筛选条件</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜索轮播图标题、描述、岗位..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {COLLEGES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCollege(c)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activeCollege === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">轮播图列表</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 text-xs font-medium text-slate-500 border-b border-slate-100 items-center">
              <div className="col-span-2">轮播图</div>
              <div className="col-span-2">描述</div>
              <div className="col-span-1 text-center">排序</div>
              <div className="col-span-2">创建时间</div>
              <div className="col-span-1 text-center">状态</div>
              <div className="col-span-2">所属学院</div>
              <div className="col-span-1">跳转岗位</div>
              <div className="col-span-1 text-right">操作</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredBanners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">暂无轮播图，点击右上角按钮新增</p>
                </div>
              ) : (
                filteredBanners.map((banner) => (
                  <div
                    key={banner.id}
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50 transition-colors group relative"
                  >
                    <div className="col-span-2">
                      <img
                        src={banner.imageData}
                        alt={banner.title || banner.fileName}
                        className="h-14 w-24 rounded-md object-cover border border-slate-100"
                      />
                    </div>

                    <div className="col-span-2 text-sm text-slate-600 truncate">
                      {banner.description || "暂无描述"}
                    </div>

                    <div className="col-span-1 text-center text-sm text-slate-600">
                      {banner.sortOrder}
                    </div>

                    <div className="col-span-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(banner.createdAt)}
                      </div>
                    </div>

                    <div className="col-span-1 text-center">
                      <Switch
                        checked={banner.status === "visible"}
                        onCheckedChange={() => handleToggleStatus(banner)}
                        aria-label={banner.status === "visible" ? "展示中" : "已隐藏"}
                      />
                    </div>

                    <div className="col-span-2 text-sm text-slate-600 truncate">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                        {banner.college || "校本级"}
                      </div>
                    </div>

                    <div className="col-span-1 text-sm text-slate-600 truncate">
                      {banner.jumpPosition ? (
                        <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-600">
                          {banner.jumpPosition}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">无跳转</span>
                      )}
                    </div>

                    <div className="col-span-1 text-right relative">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm z-10 px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleOpenEdit(banner)}
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "编辑轮播图" : "新增轮播图"}</DialogTitle>
            <DialogDescription>
              上传轮播图并完善相关信息，图片将保存在浏览器本地。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>
                Banner 图片
                <span className="text-xs text-muted-foreground ml-1">
                  支持 jpg、png、gif，建议尺寸 1200×400
                </span>
              </Label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-primary hover:bg-slate-50 transition-colors cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="banner-upload"
                />
                <label htmlFor="banner-upload" className="cursor-pointer block">
                  {imageData ? (
                    <img
                      src={imageData}
                      alt="预览"
                      className="max-h-[180px] mx-auto rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
                      <span className="text-sm text-slate-500">点击上传图片</span>
                    </div>
                  )}
                  {fileName && (
                    <span className="block text-xs text-slate-500 mt-2">{fileName}</span>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  排序
                  <span className="text-xs text-muted-foreground ml-1">数字越小越靠前</span>
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>所属学院</Label>
                <Select value={college} onValueChange={setCollege}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择所属学院" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGES.filter((c) => c !== "全部").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                placeholder="请输入轮播图副标题或描述"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>
                点击跳转岗位
                <span className="text-xs text-muted-foreground ml-1">非必填</span>
              </Label>
              <Select value={jumpPosition || "__none__"} onValueChange={(v) => setJumpPosition(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="不设置跳转" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">不设置跳转</SelectItem>
                  {positionOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm">展示状态</Label>
                <p className="text-xs text-muted-foreground">
                  关闭后该轮播图将不在首页显示
                </p>
              </div>
              <Switch
                checked={status === "visible"}
                onCheckedChange={(checked) =>
                  setStatus(checked ? "visible" : "hidden")
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={!imageData}>
              {editingBanner ? "保存" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
