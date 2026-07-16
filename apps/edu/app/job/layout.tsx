"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PlatformShell } from "@/components/platform-shell"
import { jobNavigationConfig } from "@/lib/navigation-config"
import { useAuth } from "@/components/auth-provider"

const ALLOWED_IDENTITIES = ["teacher", "school_admin", "enterprise_mentor"]

export default function JobLayout({
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

  const config = {
    ...jobNavigationConfig,
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
              当前身份暂无权限访问岗位学习平台
            </div>
          )}
        </div>
      )}
    </PlatformShell>
  )
}
