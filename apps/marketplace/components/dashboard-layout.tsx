"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  Package,
  Building2,
  FileText,
  Wallet,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  User,
  Users,
  CheckCircle,
  BarChart3,
  ImageIcon,
  BookOpen,
  LogOut,
  GraduationCap,
  Loader2,
  Briefcase,
  Layers,
  Compass,
  Award,
  FolderKanban,
  History,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuth } from "@/components/auth-provider"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

interface NavGroup {
  name: string
  icon: React.ElementType
  items: NavItem[]
}

const IDENTITY_LABELS: Record<string, string> = {
  platform_admin: "平台管理员",
  school_admin: "学校管理员",
  teacher: "教师",
  student: "学生",
  enterprise_hr: "企业人事",
  enterprise_mentor: "企业导师",
}

export function useRole() {
  return useAuth()
}

const platformAdminNavigation: NavGroup[] = [
  {
    name: "平台概览",
    icon: LayoutDashboard,
    items: [{ name: "运营仪表盘", href: "/admin", icon: LayoutDashboard }],
  },
  {
    name: "租户管理",
    icon: Building2,
    items: [
      { name: "租户列表", href: "/admin/tenants", icon: Building2 },
      { name: "机构入驻审核", href: "/admin/institutions", icon: CheckCircle },
    ],
  },
  {
    name: "内容管理",
    icon: BookOpen,
    items: [{ name: "资源审核", href: "/admin/resources", icon: BookOpen }],
  },
  {
    name: "交易管理",
    icon: FileText,
    items: [
      { name: "全平台订单", href: "/admin/orders", icon: FileText },
      { name: "提现审核", href: "/admin/withdrawals", icon: Wallet },
      { name: "结算中心", href: "/admin/settlement", icon: BarChart3 },
    ],
  },
  {
    name: "系统配置",
    icon: Settings,
    items: [
      { name: "轮播图配置", href: "/admin/banners", icon: ImageIcon },
      { name: "标签字典", href: "/admin/dictionary", icon: BookOpen },
    ],
  },
]

// 商城侧导航仅包含本应用内实际存在的页面，禁止指向 /portal、/job、/scene、/lesson、/evaluation 等
// 教育管理后台路由，避免在 marketplace 应用中出现 404。
const schoolNavigation: NavGroup[] = [
  {
    name: "机构概览",
    icon: LayoutDashboard,
    items: [{ name: "学校仪表盘", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    name: "资源采购",
    icon: Store,
    items: [
      { name: "资源商城", href: "/marketplace", icon: Store },
      { name: "已购资源", href: "/purchased", icon: ShoppingBag },
      { name: "本校订单", href: "/orders", icon: FileText },
    ],
  },
  {
    name: "财务管理",
    icon: Wallet,
    items: [{ name: "本校钱包", href: "/wallet", icon: Wallet }],
  },
  {
    name: "机构信息",
    icon: Building2,
    items: [{ name: "学校信息", href: "/institution", icon: Building2 }],
  },
]

const enterpriseNavigation: NavGroup[] = [
  {
    name: "资源工坊",
    icon: Package,
    items: [
      { name: "资源仪表盘", href: "/dashboard", icon: LayoutDashboard },
      { name: "新建资源", href: "/my-resources/new", icon: Package },
      { name: "我的资源库", href: "/my-resources", icon: BookOpen },
    ],
  },
  {
    name: "交易管理",
    icon: FileText,
    items: [{ name: "销售订单", href: "/orders", icon: FileText }],
  },
  {
    name: "财务管理",
    icon: Wallet,
    items: [{ name: "钱包/提现", href: "/wallet", icon: Wallet }],
  },
  {
    name: "机构中心",
    icon: Building2,
    items: [{ name: "企业信息", href: "/institution", icon: Building2 }],
  },
]

function getNavigationGroups(identityCode?: string): NavGroup[] {
  switch (identityCode) {
    case "platform_admin":
      return platformAdminNavigation
    case "school_admin":
      return schoolNavigation
    case "enterprise_hr":
    case "enterprise_mentor":
      return enterpriseNavigation
    case "teacher":
    case "student":
    // 教师/学生属于教育管理平台，商城侧不展示功能菜单
    default:
      return []
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, identityType, loading, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  const navigationGroups = getNavigationGroups(identityType?.code)

  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.map((g) => g.name)
  )

  useEffect(() => {
    setExpandedGroups(navigationGroups.map((g) => g.name))
  }, [navigationGroups])

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    )
  }

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const roleLabel = IDENTITY_LABELS[identityType?.code ?? ""] ?? "用户"
  const unsupportedIdentity = navigationGroups.length === 0

  if (unsupportedIdentity) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">当前账号无法在商城使用</h1>
        <p className="max-w-md text-muted-foreground">
          教师和学生账号请访问教育管理平台登录：
          <br />
          <a
            href="http://localhost:3020/portal/login"
            className="text-accent hover:underline"
          >
            http://localhost:3020/portal/login
          </a>
        </p>
        <Button variant="outline" onClick={logout}>
          退出登录
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {/* Logo */}
          <div className="flex h-14 items-center border-b border-sidebar-border px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                <GraduationCap className="h-4 w-4 text-accent-foreground" />
              </div>
              {!collapsed && (
                <span className="text-sm font-semibold text-sidebar-foreground">
                  教学资源商城
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-4">
            {navigationGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.name)
              const hasActiveItem = group.items.some((item) => isItemActive(item.href))

              if (collapsed) {
                return (
                  <div key={group.name} className="space-y-1">
                    <div className="flex h-8 items-center justify-center">
                      <group.icon
                        className={cn(
                          "h-4 w-4",
                          hasActiveItem ? "text-accent" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    {group.items.map((item) => {
                      const isActive = isItemActive(item.href)
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center justify-center rounded-md p-2 transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                          title={item.name}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                )
              }

              return (
                <Collapsible
                  key={group.name}
                  open={isExpanded}
                  onOpenChange={() => toggleGroup(group.name)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
                        hasActiveItem
                          ? "text-accent"
                          : "text-muted-foreground hover:text-sidebar-foreground"
                      )}
                    >
                      <group.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{group.name}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pt-1">
                    {group.items.map((item) => {
                      const isActive = isItemActive(item.href)
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md py-2 pl-10 pr-3 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.name}</span>
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </nav>

          {/* Collapse toggle */}
          <div className="border-t border-sidebar-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索教学资源..."
                  className="w-80 bg-input pl-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                      <User className="h-3 w-3 text-accent-foreground" />
                    </div>
                    <span className="text-sm">
                      {user?.name} ({roleLabel})
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </>
  )
}
