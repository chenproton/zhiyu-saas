"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function SceneAiNewRedirectPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  useEffect(() => {
    router.replace(`/scene/scenarios/${params.id}/edit`)
  }, [router, params.id])
  return (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      页面跳转中…
    </div>
  )
}
