"use client"

import { BrainCircuit } from "lucide-react"

export interface KnowledgePoint {
  id: string
  name: string
  code: string
  desc: string
}

interface KnowledgePointsListProps {
  points: KnowledgePoint[]
}

export function KnowledgePointsList({ points }: KnowledgePointsListProps) {
  return (
    <>
      <h3 className="text-base font-semibold text-[#1f2937] mb-4 flex items-center gap-2">
        <BrainCircuit className="w-4 h-4 text-[#3b82f6]" />
        关联知识点
        <span className="text-xs font-normal text-gray-400">({points.length} 项)</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {points.map((kp) => (
          <div
            key={kp.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <BrainCircuit className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-gray-700">{kp.name}</p>
                <span className="text-[10px] font-mono text-gray-400">{kp.code}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{kp.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
