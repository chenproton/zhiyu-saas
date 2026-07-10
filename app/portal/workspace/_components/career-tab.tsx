"use client"

import { useState } from "react"
import {
  Briefcase, Building2, MapPin, Star, Heart, BookOpen,
  Layers, FileText, Bookmark, Clock, Play, ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionCard } from "./section-card"

// ==================== Mock 收藏数据 ====================

const mockFavoriteJobs = [
  { id: "fj1", name: "网络运维工程师", company: "华为技术有限公司", location: "深圳", salary: "8-12K", tags: ["五险一金", "技术成长"], matchScore: 82 },
  { id: "fj2", name: "系统运维工程师", company: "腾讯云", location: "广州", salary: "10-15K", tags: ["弹性工作", "股票期权"], matchScore: 76 },
  { id: "fj3", name: "网络安全工程师", company: "奇安信", location: "北京", salary: "9-14K", tags: ["专业培训", "项目奖金"], matchScore: 68 },
  { id: "fj4", name: "售前网络工程师", company: "新华三", location: "杭州", salary: "8-13K", tags: ["客户对接", "方案设计"], matchScore: 71 },
  { id: "fj5", name: "数据中心运维", company: "阿里云", location: "上海", salary: "12-18K", tags: ["大厂背景", "年终丰厚"], matchScore: 65 },
]

const mockFavoriteCourses = [
  { id: "fc1", name: "Web前端开发实战", provider: "慕课网", duration: "32学时", level: "进阶", score: 4.8 },
  { id: "fc2", name: "Python数据分析", provider: "中国大学MOOC", duration: "24学时", level: "入门", score: 4.6 },
  { id: "fc3", name: "Docker容器化部署", provider: "极客时间", duration: "16学时", level: "进阶", score: 4.9 },
  { id: "fc4", name: "Linux网络服务配置", provider: "实验楼", duration: "20学时", level: "中级", score: 4.5 },
  { id: "fc5", name: "云计算与虚拟化技术", provider: "阿里云大学", duration: "40学时", level: "高级", score: 4.7 },
  { id: "fc6", name: "数据库原理与应用", provider: "学堂在线", duration: "28学时", level: "入门", score: 4.4 },
]

const mockFavoriteScenes = [
  { id: "fs1", name: "企业网络故障排查", tasks: 4, company: "华为", status: "进行中" },
  { id: "fs2", name: "数据中心服务器部署", tasks: 3, company: "腾讯", status: "未开始" },
  { id: "fs3", name: "校园网安全防护", tasks: 5, company: "奇安信", status: "已完成" },
  { id: "fs4", name: "客户网络需求沟通", tasks: 2, company: "新华三", status: "未开始" },
  { id: "fs5", name: "云计算平台搭建", tasks: 4, company: "阿里云", status: "未开始" },
]

const mockFavoriteExams = [
  { id: "fe1", name: "网络工程师软考真题库", type: "题库", questions: 1200, difficulty: "中等" },
  { id: "fe2", name: "HCIA-Datacom模拟试卷", type: "试卷库", questions: 3, difficulty: "困难" },
  { id: "fe3", name: "Linux认证真题汇编", type: "题库", questions: 800, difficulty: "中等" },
  { id: "fe4", name: "英语四级模拟试卷", type: "试卷库", questions: 6, difficulty: "简单" },
  { id: "fe5", name: "网络安全工程师知识题库", type: "题库", questions: 600, difficulty: "困难" },
  { id: "fe6", name: "岗位能力认定模拟卷", type: "试卷库", questions: 4, difficulty: "中等" },
]

const categoryConfig = {
  jobs: { label: "职业岗位", icon: Briefcase, color: "blue" as const },
  scenes: { label: "实践场景", icon: Layers, color: "amber" as const },
  courses: { label: "数字课程", icon: BookOpen, color: "emerald" as const },
  exams: { label: "测评资源", icon: FileText, color: "purple" as const },
}

const statusBadge: Record<string, string> = {
  "进行中": "bg-emerald-50 text-emerald-600",
  "未开始": "bg-gray-100 text-gray-500",
  "已完成": "bg-blue-50 text-blue-600",
}

export function CareerTab() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [favorites, setFavorites] = useState({
    jobs: mockFavoriteJobs,
    courses: mockFavoriteCourses,
    scenes: mockFavoriteScenes,
    exams: mockFavoriteExams,
  })

  const handleUnfavorite = (category: keyof typeof categoryConfig, id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== id),
    }))
  }

  const cats = Object.entries(categoryConfig).map(([k, v]) => ({ id: k, ...v }))

  return (
    <div className="space-y-5">
      <SectionCard title="我的收藏" icon={Heart} iconColor="rose">
        {/* 分类筛选 */}
        <div className="flex items-center gap-5 mb-5 border-b border-gray-100">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-sm pb-2 border-b-2 transition-colors ${
              activeCategory === "all"
                ? "text-rose-600 border-rose-600 font-medium"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            全部收藏
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`text-sm pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeCategory === c.id
                  ? "text-rose-600 border-rose-600 font-medium"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <c.icon className="w-3.5 h-3.5" />
              {c.label}
            </button>
          ))}
        </div>

        {/* 职业岗位 */}
        {(activeCategory === "all" || activeCategory === "jobs") && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              职业岗位
              <span className="text-xs text-gray-400 font-normal">（{favorites.jobs.length}）</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {favorites.jobs.map((job) => (
                <div key={job.id} className="p-3.5 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{job.company}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnfavorite("jobs", job.id)
                      }}
                      className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-rose-500 transition-colors"
                      title="取消收藏"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      取消收藏
                    </button>
                  </div>
                  <h5 className="text-sm font-semibold text-gray-900 truncate mb-1">{job.name}</h5>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                    <span className="font-medium text-gray-900 ml-auto">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">{job.matchScore}%匹配</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-500">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 数字课程 */}
        {(activeCategory === "all" || activeCategory === "courses") && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              数字课程
              <span className="text-xs text-gray-400 font-normal">（{favorites.courses.length}）</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {favorites.courses.map((course) => (
                <div key={course.id} className="p-3.5 rounded-xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600">{course.level}</Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnfavorite("courses", course.id)
                      }}
                      className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-rose-500 transition-colors"
                      title="取消收藏"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      取消收藏
                    </button>
                  </div>
                  <h5 className="text-sm font-semibold text-gray-900 truncate mb-1">{course.name}</h5>
                  <p className="text-xs text-gray-500 mb-2">{course.provider}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                    <span className="text-amber-500 font-medium">★ {course.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 实践场景 */}
        {(activeCategory === "all" || activeCategory === "scenes") && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              实践场景
              <span className="text-xs text-gray-400 font-normal">（{favorites.scenes.length}）</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {favorites.scenes.map((scene) => (
                <div key={scene.id} className="p-3.5 rounded-xl border border-gray-100 bg-white hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{scene.company}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusBadge[scene.status]}`}>{scene.status}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUnfavorite("scenes", scene.id)
                        }}
                        className="text-[10px] text-gray-400 hover:text-rose-500 transition-colors"
                        title="取消收藏"
                      >
                        取消收藏
                      </button>
                    </div>
                  </div>
                  <h5 className="text-sm font-semibold text-gray-900 truncate mb-1">{scene.name}</h5>
                  <p className="text-xs text-gray-500 mb-3">{scene.tasks} 个任务</p>
                  <Button size="sm" className="w-full text-[10px] h-7 bg-amber-500 hover:bg-amber-600">
                    <Play className="w-3 h-3 mr-1" />
                    进入场景
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 测评资源 */}
        {(activeCategory === "all" || activeCategory === "exams") && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              测评资源
              <span className="text-xs text-gray-400 font-normal">（{favorites.exams.length}）</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {favorites.exams.map((exam) => (
                <div key={exam.id} className="p-3.5 rounded-xl border border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-600">{exam.type}</Badge>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${exam.difficulty === "简单" ? "bg-emerald-50 text-emerald-600" : exam.difficulty === "中等" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>
                        {exam.difficulty}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUnfavorite("exams", exam.id)
                        }}
                        className="text-[10px] text-gray-400 hover:text-rose-500 transition-colors"
                        title="取消收藏"
                      >
                        取消收藏
                      </button>
                    </div>
                  </div>
                  <h5 className="text-sm font-semibold text-gray-900 truncate mb-2">{exam.name}</h5>
                  <p className="text-xs text-gray-500 mb-3">{exam.questions} 道题目</p>
                  <Button size="sm" variant="outline" className="w-full text-[10px] h-7 border-purple-200 text-purple-600 hover:bg-purple-50">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    开始练习
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
