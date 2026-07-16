"use client"

import { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useOrgTree } from "@/hooks/use-org-tree"
import type { Organization } from "@/lib/types/backend"

interface OrgNodeSelectProps {
  tenantId?: string
  value?: string
  onChange: (value: string | undefined) => void
  allowedTypes?: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
  showType?: boolean
}

export function OrgNodeSelect({
  tenantId,
  value,
  onChange,
  allowedTypes,
  placeholder = "选择组织节点",
  disabled,
  className,
  showType = false,
}: OrgNodeSelectProps) {
  const { orgTree, orgTypeMap, loading, error } = useOrgTree(tenantId)

  const options = useMemo(() => {
    if (!allowedTypes || allowedTypes.length === 0) return orgTree
    return orgTree.filter((node) => {
      const typeName = orgTypeMap.get(node.typeId)?.name
      return typeName && allowedTypes.includes(typeName)
    })
  }, [orgTree, orgTypeMap, allowedTypes])

  const handleChange = (val: string) => {
    onChange(val || undefined)
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <Select value={value || ""} onValueChange={handleChange} disabled={disabled || loading || !tenantId}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((node) => {
          const typeName = orgTypeMap.get(node.typeId)?.name
          const indent = "\u00A0\u00A0".repeat(node.depth)
          return (
            <SelectItem key={node.id} value={node.id}>
              <span className="whitespace-nowrap">
                {indent}
                {node.name}
                {showType && typeName ? (
                  <span className="ml-2 text-xs text-muted-foreground">({typeName})</span>
                ) : null}
              </span>
            </SelectItem>
          )
        })}
        {options.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">暂无可用组织节点</div>
        )}
      </SelectContent>
    </Select>
  )
}

export function getOrgTypeName(org: Organization | undefined, orgTypeMap: Map<string, { name: string }>): string | undefined {
  if (!org) return undefined
  return orgTypeMap.get(org.typeId)?.name
}
