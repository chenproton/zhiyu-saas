"use client"

import { CheckCircle2, AlertCircle } from "lucide-react"

interface CheckItem {
  label: string
  completed: boolean
}

export default function PublishCheckPanel({ items }: { items: CheckItem[] }) {
  const completed = items.filter((i) => i.completed).length
  const total = items.length
  const percent = Math.round((completed / total) * 100)

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-600">完成度</span>
          <span className="font-semibold text-gray-800">{completed}/{total}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs ${
              item.completed
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
