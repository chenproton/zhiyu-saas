"use client"

import { Loader2 } from "lucide-react"
import { usePathname } from "next/navigation"
import { PlatformShell } from "@/components/platform-shell"
import { evaluationNavigationConfig } from "@/lib/navigation-config"
import { useAuth } from "@/components/auth-provider"

const ALLOWED_IDENTITIES = ["platform_admin", "school_admin", "teacher", "student"]

export default function EvaluationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, loading, identityType } = useAuth()
  const isLanding = pathname.startsWith("/evaluation/landing")

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

  return (
    <PlatformShell config={evaluationNavigationConfig}>
      {children}
    </PlatformShell>
  )
}
