"use client"

import { useParams } from "next/navigation"
import { ScenarioForm } from "../../_components/scenario-form"

export default function EditScenarioPage() {
  const params = useParams()
  const scenarioId = params.id as string

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <ScenarioForm scenarioId={scenarioId} />
      </div>
    </div>
  )
}
