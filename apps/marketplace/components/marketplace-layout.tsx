"use client"

import Link from "next/link"
import { GraduationCap, Search, ShoppingCart, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"

interface MarketplaceLayoutProps {
  children: React.ReactNode
}

export function MarketplaceLayout({ children }: MarketplaceLayoutProps) {
  const { user, identityType, loading, logout } = useAuth()
  const isLoggedIn = !!user

  const dashboardHref =
    identityType?.code === "platform_admin"
      ? "/admin"
      : identityType?.code === "school_admin" ||
          identityType?.code === "enterprise_hr" ||
          identityType?.code === "enterprise_mentor"
        ? "/dashboard"
        : "/"

  return (
    <div className="min-h-screen bg-background">
      {/* Public marketplace header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                <GraduationCap className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-base font-semibold">教学资源商城</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <Link href="/" className="hover:text-foreground">首页</Link>
              <Link href="#resources" className="hover:text-foreground">资源</Link>
              <Link href="/institution/apply" className="hover:text-foreground">机构入驻</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索教学资源..."
                className="h-9 w-56 bg-muted pl-9 text-sm"
              />
            </div>

            {loading ? null : isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      进入后台
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link href="/login" className="gap-2">
                    <User className="h-4 w-4" />
                    登录
                  </Link>
                </Button>
                <Button size="sm" asChild className="hidden sm:flex">
                  <Link href="/login" className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    商家后台
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="mt-16 border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} 教学资源商城 · 连接企业与职业院校</p>
      </footer>
    </div>
  )
}
