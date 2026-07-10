"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { MarketplaceLayout } from "@/components/marketplace-layout"
import { MarketplaceHome } from "@/components/marketplace-home"

export default function RootPage() {
  const router = useRouter()
  const { user, loading, identityType } = useAuth()

  useEffect(() => {
    if (loading || !user) return

    const code = identityType?.code ?? ""
    switch (code) {
      case "platform_admin":
      case "school_admin":
        router.replace("/admin")
        break
      case "teacher":
      case "student":
        router.replace("/portal/workspace")
        break
      case "enterprise_hr":
      case "enterprise_mentor":
        router.replace("/dashboard")
        break
      default:
        // Unknown identity: stay on marketplace home.
        break
    }
  }, [loading, user, identityType, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Authenticated users are redirected immediately; show nothing while routing.
  if (user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <MarketplaceLayout>
      <MarketplaceHome />
    </MarketplaceLayout>
  )
}
