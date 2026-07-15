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

    if (user.platform !== "saas") {
      router.replace("/login")
      return
    }

    const code = identityType?.code ?? ""
    if (code === "platform_admin") {
      return
    }

    if (code === "school_admin" || code.startsWith("enterprise")) {
      router.replace("/dashboard")
    } else {
      router.replace("/login")
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

  if (user.platform !== "saas") {
    return null
  }

  const code = identityType?.code ?? ""
  if (code !== "platform_admin") {
    return null
  }

  return <>{children}</>
}
