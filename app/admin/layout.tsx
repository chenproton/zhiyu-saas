"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, identityType, loading } = useAuth()

  useEffect(() => {
    if (loading || !user) return

    const code = identityType?.code ?? ""
    if (code !== "platform_admin") {
      router.replace("/dashboard")
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

  if (identityType?.code !== "platform_admin") {
    return null
  }

  return <>{children}</>
}
