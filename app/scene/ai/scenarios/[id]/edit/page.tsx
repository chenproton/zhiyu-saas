"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function SceneAiEditRedirectPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  useEffect(() => {
    router.replace(`/scene/scenarios/${params.id}/edit`)
  }, [router, params.id])
  return null
}
