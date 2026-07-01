"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Package,
  Building2,
  FileText,
  Key,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  Search,
  Settings,
  User,
  Users,
  Cog,
  UserCheck,
  Shield,
  Briefcase,
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
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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

const navigationGroups: NavGroup[] = [
  {
    name: "管理工作台",
    icon: Shield,
    items: [
      { name: "控制台", href: "/", icon: LayoutDashboard },
      { name: "租户管理", href: "/tenants", icon: Building2 },
      { name: "入驻审批", href: "/approvals", icon: UserCheck },
      { name: "套餐管理", href: "/packages", icon: Package },
      { name: "订单管理", href: "/orders", icon: FileText },
      { name: "授权与 License 管理", href: "/licenses", icon: Key },
      { name: "资源编码管理", href: "/resource-codes", icon: Cog },
    ],
  },
  {
    name: "运营工作台",
    icon: Briefcase,
    items: [
      { name: "我的客户", href: "/operations", icon: Users },
      { name: "我的 License 管理", href: "/my-licenses", icon: Key },
    ],
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  
  // Track which groups are expanded (default all expanded)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.map((g) => g.name)
  )

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    )
  }

  const isItemActive = (href: string) => {
    return pathname === href || (href !== "/" && pathname.startsWith(href))
  }

  return (
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
              <Key className="h-4 w-4 text-accent-foreground" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold text-sidebar-foreground">
                授权管理中心
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-4">
          {navigationGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.name)
            const hasActiveItem = group.items.some((item) =>
              isItemActive(item.href)
            )

            if (collapsed) {
              // When collapsed, show only icons for sub-items
              return (
                <div key={group.name} className="space-y-1">
                  <div className="flex h-8 items-center justify-center">
                    <group.icon
                      className={cn(
                        "h-4 w-4",
                        hasActiveItem
                          ? "text-accent"
                          : "text-muted-foreground"
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
                        <span>{item.name}</span>
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
                placeholder="搜索租户、订单或授权..."
                className="w-80 bg-input pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
                3
              </Badge>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>设置</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>系统配置</DropdownMenuItem>
                <DropdownMenuItem>密钥管理</DropdownMenuItem>
                <DropdownMenuItem>操作日志</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                    <User className="h-3 w-3 text-accent-foreground" />
                  </div>
                  <span className="text-sm">管理员</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>个人信息</DropdownMenuItem>
                <DropdownMenuItem>修改密码</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">退出登录</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
