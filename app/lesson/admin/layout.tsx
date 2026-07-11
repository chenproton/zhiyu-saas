"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PlatformShell } from "@/components/platform-shell"
import { adminNavigationConfig, portalTopNavItems } from "@/lib/navigation-config"
import { useAuth } from "@/components/auth-provider"
import type { PlatformNavigationConfig } from "@/components/platform-shell"

const ALLOWED_IDENTITIES = ["platform_admin", "school_admin", "teacher"]

const config: PlatformNavigationConfig = {
  ...adminNavigationConfig,
  topNavItems: portalTopNavItems,
  platformSwitchItems: [
    { id: "teacher", label: "教学空间", href: "/lesson/teacher/claim", icon: "bookOpen" },
  ],
}

export default function LessonAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, identityType } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || !ALLOWED_IDENTITIES.includes(identityType?.code ?? "")) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        当前身份暂无权限访问课程资源中心
      </div>
    )
  }

  return (
    <PlatformShell config={config}>
      {children}
    </PlatformShell>
  )
}
