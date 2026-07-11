"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SceneAiRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/scene")
  }, [router])
  return (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      页面跳转中…
    </div>
  )
}
