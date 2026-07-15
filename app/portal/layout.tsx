"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { TopNav } from "@/components/portal/top-nav"
import { PortalAuthProvider, usePortalAuth } from "@/contexts/portal-auth-context"
import { YiKnowAssistant } from "@/components/portal/yi-know-assistant"

function PortalAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, identityType, loading } = usePortalAuth()

  const isLoginPage = pathname === "/portal/login"
  const identityCode = identityType?.code

  useEffect(() => {
    if (loading || isLoginPage) return
    if (!user) {
      router.replace("/portal/login")
      return
    }
    if (user.platform !== "portal") {
      router.replace("/portal/login")
      return
    }

    // 应用服务中心 + 系统管理只对学校管理员开放
    if (pathname.startsWith("/portal/apps") && identityCode !== "school_admin") {
      router.replace("/portal")
      return
    }

    // 我的服务台只对教师、学生开放
    if (
      (pathname === "/portal/workspace" || pathname.startsWith("/portal/workspace/")) &&
      identityCode !== "teacher" &&
      identityCode !== "student"
    ) {
      router.replace("/portal")
      return
    }
  }, [loading, user, identityCode, router, pathname, isLoginPage])

  if (loading && !isLoginPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isLoginPage && (!user || user.platform !== "portal")) {
    return null
  }

  return <>{children}</>
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PortalAuthProvider>
      <PortalAuthGuard>
        <div className="min-h-screen pt-14">
          <TopNav />
          <main>{children}</main>
          <YiKnowAssistant />
        </div>
      </PortalAuthGuard>
    </PortalAuthProvider>
  )
}
