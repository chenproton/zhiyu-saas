"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SceneAiFirstGradingSimulationRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/scene/ai-first/approvals/grading")
  }, [router])
  return null
}
