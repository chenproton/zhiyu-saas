"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ScenarioForm } from "../../_components/scenario-form"

function NewScenarioPageInner() {
  const searchParams = useSearchParams()
  const batchId = searchParams.get("batchId") || undefined
  const positionId = searchParams.get("positionId") || undefined

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <ScenarioForm defaultBatchId={batchId} defaultPositionId={positionId} />
      </div>
    </div>
  )
}

export default function NewScenarioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">加载中...</div>}>
      <NewScenarioPageInner />
    </Suspense>
  )
}
