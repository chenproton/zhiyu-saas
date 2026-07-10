"use client"

import { Loader2 } from "lucide-react"
import { PlatformShell } from "@/components/platform-shell"
import { unifiedNavigationConfig } from "@/lib/navigation-config"
import { useAuth } from "@/components/auth-provider"

const ALLOWED_IDENTITIES = ["platform_admin", "school_admin", "teacher"]

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, identityType } = useAuth()

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
        当前身份暂无权限访问教学空间
      </div>
    )
  }

  return (
    <PlatformShell config={unifiedNavigationConfig}>
      {children}
    </PlatformShell>
  )
}
