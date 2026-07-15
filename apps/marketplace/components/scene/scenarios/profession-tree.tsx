"use client"

import { ChevronDown, ChevronRight, Search } from "lucide-react"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Profession, Scenario } from "@/lib/types/scene-mock"

interface ProfessionTreeProps {
  professions: Profession[]
  scenarios: Scenario[]
  selectedPositionId: string | null
  onSelectPosition: (positionId: string | null) => void
}

export function ProfessionTree({ professions, scenarios, selectedPositionId, onSelectPosition }: ProfessionTreeProps) {
  const [expandedProfessions, setExpandedProfessions] = useState<string[]>(professions.map((p) => p.id))
  const [searchQuery, setSearchQuery] = useState("")

  const toggleProfession = (profId: string) => {
    setExpandedProfessions((prev) =>
      prev.includes(profId) ? prev.filter((id) => id !== profId) : [...prev, profId]
    )
  }

  const query = searchQuery.toLowerCase().trim()

  const filteredProfessions = useMemo(() => {
    if (!query) return professions

    const positionIdsFromScenarios = new Set<string>()
    scenarios.forEach((s) => {
      if (s.positionId && s.name.toLowerCase().includes(query)) {
        positionIdsFromScenarios.add(s.positionId)
      }
    })

    return professions
      .map((prof) => ({
        ...prof,
        positions: prof.positions.filter(
          (pos) =>
            pos.name.toLowerCase().includes(query) ||
            prof.name.toLowerCase().includes(query) ||
            positionIdsFromScenarios.has(pos.id)
        ),
      }))
      .filter((prof) => prof.positions.length > 0 || prof.name.toLowerCase().includes(query))
  }, [professions, scenarios, query])

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索专业、岗位或场景..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* All option */}
        <button
          onClick={() => onSelectPosition(null)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            selectedPositionId === null
              ? "bg-primary/5 text-primary"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <span className="w-4" />
          全部场景
        </button>

        {/* Profession tree */}
        {filteredProfessions.map((profession) => {
          const isExpanded = expandedProfessions.includes(profession.id)

          return (
            <div key={profession.id} className="mt-1">
              {/* Profession header */}
              <button
                onClick={() => toggleProfession(profession.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                {profession.name}
                <span className="ml-auto text-xs text-gray-400">{profession.positions.length}</span>
              </button>

              {/* Position list */}
              {isExpanded && (
                <div className="ml-4 space-y-0.5">
                  {profession.positions.map((position) => (
                    <button
                      key={position.id}
                      onClick={() => onSelectPosition(position.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        selectedPositionId === position.id
                          ? "bg-primary/5 text-primary border-l-2 border-primary -ml-[2px] pl-[calc(0.75rem+2px)]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      )}
                    >
                      <span className="w-4 h-0.5 bg-gray-200 rounded" />
                      {position.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
