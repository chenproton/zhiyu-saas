"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const ALLOWED_IDENTITIES = ["teacher", "school_admin"]

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, identityTypeCode } = useAuth()

  useEffect(() => {
    if (loading || !user) return
    if (!ALLOWED_IDENTITIES.includes(identityTypeCode ?? "")) {
      router.replace("/portal")
    }
  }, [loading, user, identityTypeCode, router])

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
