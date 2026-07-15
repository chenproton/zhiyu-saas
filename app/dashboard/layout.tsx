"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const ALLOWED_DASHBOARD_IDENTITIES = [
  "school_admin",
  "enterprise_hr",
  "enterprise_mentor",
]

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, identityType, loading } = useAuth()

  useEffect(() => {
    if (loading || !user) return

    const code = identityType?.code ?? ""
    if (!ALLOWED_DASHBOARD_IDENTITIES.includes(code)) {
      if (code === "platform_admin") {
        router.replace("/admin")
      } else {
        router.replace("/portal/workspace")
      }
    }
  }, [loading, user, identityType, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    router.replace("/login")
    return null
  }

  if (!ALLOWED_DASHBOARD_IDENTITIES.includes(identityType?.code ?? "")) {
    return null
  }

  return <>{children}</>
}
