"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PlatformShell } from "@/components/platform-shell"
import { sceneNavigationConfig, portalTopNavItems } from "@/lib/navigation-config"
import { useAuth } from "@/components/auth-provider"

const ALLOWED_IDENTITIES = ["platform_admin", "school_admin", "teacher", "student"]

export default function SceneLayout({
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

  const allowed = !loading && !!user && ALLOWED_IDENTITIES.includes(identityType?.code ?? "")

  const config = {
    ...sceneNavigationConfig,
    topNavItems: portalTopNavItems,
    sideBackHref: "/portal/apps",
  }

  return (
    <PlatformShell config={config}>
      {children}
      {(loading || !allowed) && (
        <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-[#f5f7fa]">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <div className="text-sm text-muted-foreground">
              当前身份暂无权限访问场景学习平台
            </div>
          )}
        </div>
      )}
    </PlatformShell>
  )
}
