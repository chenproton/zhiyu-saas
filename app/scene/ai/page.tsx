"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SceneAiRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/scene")
  }, [router])
  return null
}
