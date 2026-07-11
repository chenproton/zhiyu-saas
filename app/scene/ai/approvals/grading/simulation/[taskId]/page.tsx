"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SceneAiGradingSimulationRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/scene/ai/approvals/grading")
  }, [router])
  return null
}
