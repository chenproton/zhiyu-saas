"use client"

import { Bell, Search, Settings, User, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  title?: string
  breadcrumb?: { label: string; href?: string }[]
}

export function Header({ title, breadcrumb }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-muted-foreground">/</span>}
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-foreground">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {title && !breadcrumb && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="搜索..."
            className="h-9 w-64 rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm">管理员</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>个人设置</DropdownMenuItem>
            <DropdownMenuItem>账户安全</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href="https://v0-saa-s-one-chi.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                SaaS 统一管理后台
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">退出登录</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
