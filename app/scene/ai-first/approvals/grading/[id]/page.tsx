"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SceneAiFirstGradingDetailPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/scene/approvals")
  }, [router])
  return null
}
