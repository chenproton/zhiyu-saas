"use client"

import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { MarketplaceLayout } from "@/components/marketplace-layout"
import { MarketplaceHome } from "@/components/marketplace-home"

export default function RootPage() {
  const { loading } = useAuth()

  if (loading) {
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
