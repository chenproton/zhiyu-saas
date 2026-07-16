"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const ALLOWED_IDENTITIES = ["teacher", "school_admin"]

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, identityTypeCode } = useAuth()
  const isLanding = pathname.startsWith("/lesson/landing")

  useEffect(() => {
    if (isLanding) return
    if (loading || !user) return
    if (!ALLOWED_IDENTITIES.includes(identityTypeCode ?? "")) {
      router.replace("/portal")
    }
  }, [loading, user, identityTypeCode, isLanding, router])

  if (isLanding) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || !ALLOWED_IDENTITIES.includes(identityTypeCode ?? "")) {
    return null
  }

  return <>{children}</>
}
