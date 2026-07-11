"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PlatformShell } from "@/components/platform-shell"
import { evaluationNavigationConfig, portalTopNavItems } from "@/lib/navigation-config"
import { useAuth } from "@/components/auth-provider"

const ALLOWED_IDENTITIES = ["platform_admin", "school_admin", "teacher", "student"]

export default function EvaluationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, identityType } = useAuth()
  const isLanding = pathname.startsWith("/evaluation/landing")

  useEffect(() => {
    if (!loading && !user && !isLanding) {
      router.replace("/login")
    }
  }, [loading, user, isLanding, router])

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
        当前身份暂无权限访问测评管理平台
      </div>
    )
  }

  if (isLanding) {
    return <>{children}</>
  }

  const config = {
    ...evaluationNavigationConfig,
    topNavItems: portalTopNavItems,
    sideBackHref: "/portal/apps",
  }

  return (
    <PlatformShell config={config}>
      {children}
    </PlatformShell>
  )
}
