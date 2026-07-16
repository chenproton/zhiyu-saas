"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PlatformShell } from "@/components/platform-shell"
import { adminNavigationConfig } from "@/lib/navigation-config"
import { useAuth } from "@/components/auth-provider"
import type { PlatformNavigationConfig } from "@/components/platform-shell"

const ALLOWED_IDENTITIES = ["school_admin", "teacher"]

const config: PlatformNavigationConfig = {
  ...adminNavigationConfig,
  sideBackHref: "/portal/apps",
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
  const { user, loading, identityTypeCode } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/portal/login")
    }
  }, [loading, user, router])

  const allowed = !loading && !!user && ALLOWED_IDENTITIES.includes(identityTypeCode ?? "")

  return (
    <PlatformShell config={config}>
      {children}
      {(loading || !allowed) && (
        <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-[#f5f7fa]">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-sm text-muted-foreground">
              当前身份暂无权限访问课程资源中心
            </div>
          )}
        </div>
      )}
    </PlatformShell>
  )
}
