"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SceneAiFirstGradingPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/scene/approvals")
  }, [router])
  return null
}
