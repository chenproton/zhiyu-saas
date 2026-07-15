"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Search,
  ShoppingCart,
  Building2,
  TrendingUp,
  Star,
  Layers,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  FileArchive,
  ChevronRight,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from "lucide-react"
import {
  RESOURCE_CATEGORIES,
  MAJOR_TAGS,
  EDUCATION_LEVELS,
  DIFFICULTY_LEVELS,
  getCategoryName,
  getCategoryColor,
  type ResourceCategoryId,
} from "@/lib/resource-constants"
import { resourceApi, institutionApi, bannerApi, type Resource, type Institution, type Banner } from "@/lib/api"

const CATEGORY_ICONS: Record<ResourceCategoryId, React.ElementType> = {
  post: Briefcase,
  scene: Layers,
  course: BookOpen,
  assessment: ClipboardCheck,
  material: FileArchive,
}

export function MarketplaceHome() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategoryId | "all">("all")
  const [selectedMajor, setSelectedMajor] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("default")

  const [resources, setResources] = useState<Resource[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const [resourcesRes, institutionsRes, bannersRes] = await Promise.all([
          resourceApi.list({ status: "published", limit: 1000 }),
          institutionApi.list({ status: "approved", limit: 1000 }),
          bannerApi.list(),
        ])
        if (cancelled) return
        setResources(resourcesRes.items)
        setInstitutions(institutionsRes.items)
        setBanners(bannersRes.items)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "加载数据失败")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredResources = useMemo(() => {
    let result = resources.filter((r) => {
      const matchesSearch =
        !searchQuery.trim() ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.intro.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || r.category === selectedCategory
      const tags = r.tags || []
      const majors = tags.filter((t) => t.tagType === "major").map((t) => t.tagValue)
      const levels = tags.filter((t) => t.tagType === "level").map((t) => t.tagValue)
      const difficulties = tags.filter((t) => t.tagType === "difficulty").map((t) => t.tagValue)
      const matchesMajor = selectedMajor === "all" || majors.includes(selectedMajor)
      const matchesLevel = selectedLevel === "all" || levels.includes(selectedLevel)
      const matchesDifficulty = selectedDifficulty === "all" || difficulties.includes(selectedDifficulty)
      return matchesSearch && matchesCategory && matchesMajor && matchesLevel && matchesDifficulty
    })

    switch (sortBy) {
      case "newest":
        result = result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        break
      case "sales":
        result = result.sort((a, b) => b.salesCount - a.salesCount)
        break
      case "price-asc":
        result = result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result = result.sort((a, b) => b.price - a.price)
        break
      default:
        break
    }

    return result
  }, [
    resources,
    searchQuery,
    selectedCategory,
    selectedMajor,
    selectedLevel,
    selectedDifficulty,
    sortBy,
  ])

  const getInstitutionName = (id: string) => institutions.find((i) => i.id === id)?.name || "-"

  const filtersActive =
    selectedCategory !== "all" ||
    selectedMajor !== "all" ||
    selectedLevel !== "all" ||
    selectedDifficulty !== "all" ||
    !!searchQuery ||
    sortBy !== "default"

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedMajor("all")
    setSelectedLevel("all")
    setSelectedDifficulty("all")
    setSortBy("default")
  }

  return (
    <div className="space-y-10 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#06b6d4] px-6 py-12 text-white md:px-12 md:py-16">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 border-white/30 bg-white/15 text-white hover:bg-white/25">
            教学资源共享商城
          </Badge>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            发现优质教学资源
            <br />
            <span className="text-cyan-200">买断即永久使用</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/80 md:text-lg">
            连接企业与职业院校，提供标准化教学资源的极简创建、审核上架、搜索交易与授权交付服务。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#resources">
              <Button size="lg" className="gap-2 bg-white text-[#4f46e5] shadow-lg hover:bg-white/90">
                <ShoppingCart className="h-4 w-4" />
                浏览资源
              </Button>
            </Link>
            <a href="http://localhost:3010/institution/apply">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
                机构入驻
              </Button>
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />
      </section>

      {/* Banner Carousel */}
      <section>
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl bg-muted md:h-56">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error && banners.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed md:h-56">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">轮播图加载失败</p>
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="relative h-48 overflow-hidden rounded-xl md:h-56">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-8">
                      <h2 className="text-xl font-bold text-white md:text-2xl">{banner.title}</h2>
                      <p className="mt-1 text-sm text-white/80">优质教学资源，买断即永久使用</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">资源品类</h2>
          <Link href="#resources" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            查看全部 <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 transition-all ${
              selectedCategory === "all"
                ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo/10"
                : "border-border bg-card hover:border-indigo-200 hover:bg-indigo-50/50"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">全部资源</span>
          </button>
          {RESOURCE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id]
            const catColors: Record<ResourceCategoryId, { from: string; to: string; text: string }> = {
              post: { from: "from-indigo-100", to: "to-violet-100", text: "text-indigo-600" },
              scene: { from: "from-cyan-100", to: "to-teal-100", text: "text-cyan-600" },
              course: { from: "from-emerald-100", to: "to-teal-100", text: "text-emerald-600" },
              assessment: { from: "from-amber-100", to: "to-orange-100", text: "text-amber-600" },
              material: { from: "from-rose-100", to: "to-pink-100", text: "text-rose-600" },
            }
            const c = catColors[cat.id]
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 transition-all ${
                  selectedCategory === cat.id
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo/10"
                    : "border-border bg-card hover:border-indigo-200 hover:bg-indigo-50/50"
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${c.from} ${c.to} ${c.text}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">热门资源</h2>
            <p className="text-sm text-muted-foreground">
              共找到 {filteredResources.length} 个资源
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索资源..."
                className="w-56 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">默认排序</SelectItem>
                <SelectItem value="newest">最新上架</SelectItem>
                <SelectItem value="sales">销量最高</SelectItem>
                <SelectItem value="price-asc">价格从低到高</SelectItem>
                <SelectItem value="price-desc">价格从高到低</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-muted/30">
          <CardContent className="flex flex-wrap items-center gap-3 py-4">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMajor} onValueChange={setSelectedMajor}>
              <SelectTrigger className="w-36 bg-background">
                <SelectValue placeholder="所属专业" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部专业</SelectItem>
                {MAJOR_TAGS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-32 bg-background">
                <SelectValue placeholder="适用层次" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部层次</SelectItem>
                {EDUCATION_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-32 bg-background">
                <SelectValue placeholder="难度等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部难度</SelectItem>
                {DIFFICULTY_LEVELS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                重置
              </Button>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Resource Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">加载资源中...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  institutionName={getInstitutionName(resource.institutionId)}
                />
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
                <Search className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">未找到符合条件的资源</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  重置筛选
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function ResourceCard({
  resource,
  institutionName,
}: {
  resource: Resource
  institutionName: string
}) {
  return (
    <a href={`http://localhost:3010/resources/${resource.id}`}>
      <Card className="group h-full cursor-pointer overflow-hidden border-border/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={resource.coverImage || "/placeholder.jpg"}
            alt={resource.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <Badge className={getCategoryColor(resource.category as ResourceCategoryId)}>
              {getCategoryName(resource.category as ResourceCategoryId)}
            </Badge>
          </div>
        </div>
        <CardContent className="space-y-3 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {resource.name}
          </h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">{resource.intro}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span className="max-w-[140px] truncate">{institutionName}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">¥{resource.price.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">买断</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {resource.salesCount}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {resource.viewCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
