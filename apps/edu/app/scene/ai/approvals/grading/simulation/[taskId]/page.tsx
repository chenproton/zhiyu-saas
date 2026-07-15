"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SceneAiGradingSimulationRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/scene/approvals")
  }, [router])
  return (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      页面跳转中…
    </div>
  )
}
