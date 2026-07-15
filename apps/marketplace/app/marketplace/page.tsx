"use client"

import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MarketplaceHome } from "@/components/marketplace-home"

export default function MarketplacePage() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <MarketplaceHome />
    </DashboardLayout>
  )
}
