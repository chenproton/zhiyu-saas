'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type {
  Batch,
  Position,
  PositionType,
  Workflow,
  Ability,
  ApprovalRecord,
  DashboardStats,
  PositionRecommendation,
} from '@/lib/types/job-source'
import type { CareerPosition, JobBatch, PositionRecommendation as ApiPositionRecommendation } from '@/lib/types/job'
import { positionApi, batchApi, recommendApi, workflowApi, abilityApi, approvalApi } from '@/lib/api'
import {
  mockWorkflows,
  mockAbilities,
  mockApprovalRecords,
} from '@/lib/mock-data/job'

interface DataContextType {
  // 数据
  batches: Batch[]
  positions: Position[]
  workflows: Workflow[]
  abilities: Ability[]
  approvals: ApprovalRecord[]
  favorites: string[] // position ids
  recommendations: PositionRecommendation[]

  // 统计
  stats: DashboardStats

  // 批次操作
  addBatch: (batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateBatch: (id: string, data: Partial<Batch>) => Promise<void>
  deleteBatch: (id: string) => Promise<void>

  // 岗位操作
  addPosition: (position: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Position>
  updatePosition: (id: string, data: Partial<Position>) => Promise<void>
  deletePosition: (id: string) => Promise<void>

  // 审批流操作
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt'>) => Promise<void>
  updateWorkflow: (id: string, data: Partial<Workflow>) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>

  // 能力操作
  addAbility: (ability: Omit<Ability, 'id' | 'createdAt'>) => void
  updateAbility: (id: string, data: Partial<Ability>) => void
  deleteAbility: (id: string) => void

  // 审批操作
  submitForApproval: (positionId: string, workflowId: string, submittedBy: string, submittedByName: string) => Promise<void>
  approveApproval: (approvalId: string, reviewerId: string, reviewerName: string, comment: string) => void
  rejectApproval: (approvalId: string, reviewerId: string, reviewerName: string, comment: string) => void

  // 收藏操作
  toggleFavorite: (positionId: string) => void
  isFavorite: (positionId: string) => boolean

  // 目标岗位推荐操作
  getRecommendationsByMajor: (major: string) => PositionRecommendation[]
  addRecommendation: (data: Omit<PositionRecommendation, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Promise<void>
  updateRecommendation: (id: string, data: Partial<PositionRecommendation>) => Promise<void>
  deleteRecommendation: (id: string) => Promise<void>
  reorderRecommendations: (major: string, orderedIds: string[]) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const FAVORITES_KEY = 'career-platform-favorites'

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function convertCareerPositionToPosition(cp: CareerPosition): Position {
  return {
    id: cp.id,
    batchId: cp.batchId || '',
    version: cp.version,
    status: cp.status,
    name: cp.name,
    shortName: cp.shortName || (cp.name.length > 10 ? cp.name.slice(0, 10) : cp.name),
    industry: cp.industryId || '',
    majors: cp.majorIds,
    positionType: cp.positionType,
    salaryRange: [cp.salaryMin ?? 0, cp.salaryMax ?? 0] as [number, number],
    coverImage: cp.coverImage,
    certificates: [],
    description: cp.description || '',
    responsibilities: [],
    requirements: cp.requirements,
    careerPath: cp.careerPath || '',
    abilityModel: { nodes: [], edges: [] },
    abilityBindings: [],
    abilityDomains: [],
    competencyConfig: [],
    createdBy: cp.createdBy,
    collaborators: cp.collaborators,
    createdAt: cp.createdAt,
    updatedAt: cp.updatedAt,
    favoriteCount: 0,
  }
}

function convertJobBatchToBatch(jb: JobBatch): Batch {
  return {
    id: jb.id,
    name: jb.name,
    department: jb.orgNodeId || jb.major || '',
    major: jb.major || '',
    workflowId: jb.workflowId || '',
    status: jb.status,
    positionCount: jb.positionCount || 0,
    publishedCount: jb.publishedCount || 0,
    pendingCount: jb.pendingCount || 0,
    createdAt: jb.createdAt,
    updatedAt: jb.updatedAt,
  }
}

function calculateStats(batches: Batch[], positions: Position[], approvals: ApprovalRecord[], abilities: Ability[]): DashboardStats {
  return {
    totalBatches: batches.length,
    openBatches: batches.filter(b => b.status === 'open').length,
    totalPositions: positions.length,
    publishedPositions: positions.filter(p => p.status === 'published').length,
    pendingApprovals: approvals.filter(a => a.status === 'pending').length,
    totalAbilities: abilities.length,
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows)
  const [abilities, setAbilities] = useState<Ability[]>(mockAbilities)
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(mockApprovalRecords)
  const [favorites, setFavorites] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<PositionRecommendation[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadPositions = useCallback(async () => {
    try {
      const resp = await positionApi.list({ limit: 1000 })
      setPositions(resp.items.map(convertCareerPositionToPosition))
    } catch (err) {
      console.error('Failed to load positions:', err)
    }
  }, [])

  const loadBatches = useCallback(async () => {
    try {
      const resp = await batchApi.list({ limit: 1000 })
      setBatches(resp.items.map(convertJobBatchToBatch))
    } catch (err) {
      console.error('Failed to load batches:', err)
    }
  }, [])

  function convertApiRecommendationToLocal(rec: ApiPositionRecommendation): PositionRecommendation {
    return {
      id: rec.id,
      major: rec.major,
      positionId: rec.careerPositionId,
      positionType: rec.positionType as PositionType,
      reason: rec.reason ?? undefined,
      order: rec.sortOrder,
      isVisible: rec.isVisible,
      createdBy: rec.createdBy,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
    }
  }

  const loadRecommendations = useCallback(async () => {
    try {
      const resp = await recommendApi.list({ limit: 1000 })
      setRecommendations(resp.items.map(convertApiRecommendationToLocal))
    } catch (err) {
      console.error('Failed to load recommendations:', err)
    }
  }, [])

  function convertApiWorkflowToLocal(w: any): Workflow {
    return {
      id: w.id,
      name: w.name,
      description: w.description ?? '',
      steps: (w.steps || []).map((s: any, index: number) => ({
        id: s.id || `step-${w.id}-${index}`,
        name: s.name || '',
        role: s.role || s.reviewerType || 'reviewer',
        order: s.order ?? index + 1,
      })),
      createdAt: w.createdAt,
    }
  }

  const loadWorkflows = useCallback(async () => {
    try {
      const resp = await workflowApi.list({ limit: 1000 })
      setWorkflows(resp.items.map(convertApiWorkflowToLocal))
    } catch (err) {
      console.error('Failed to load workflows:', err)
    }
  }, [])

  // 从 localStorage 恢复收藏，并加载真实岗位/批次/推荐/审批流数据
  useEffect(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch {
        // 忽略解析错误
      }
    }

    Promise.all([loadPositions(), loadBatches(), loadRecommendations(), loadWorkflows()]).finally(() => {
      setIsLoaded(true)
    })
  }, [loadPositions, loadBatches, loadRecommendations, loadWorkflows])

  // 保存收藏到 localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
  }, [favorites, isLoaded])

  const stats = calculateStats(batches, positions, approvals, abilities)

  // 批次操作
  const addBatch = async (data: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const req: Omit<JobBatch, 'id' | 'positionCount' | 'publishedCount' | 'pendingCount' | 'createdAt' | 'updatedAt'> = {
      name: data.name,
      status: data.status,
      orgNodeId: data.department || undefined,
      major: data.major || undefined,
      workflowId: data.workflowId || undefined,
    }
    await batchApi.create(req)
    await loadBatches()
  }

  const updateBatch = async (id: string, data: Partial<Batch>) => {
    const req: Partial<Omit<JobBatch, 'id' | 'createdAt' | 'updatedAt'>> = {}
    if (data.name !== undefined) req.name = data.name
    if (data.department !== undefined) req.orgNodeId = data.department || undefined
    if (data.major !== undefined) req.major = data.major || undefined
    if (data.workflowId !== undefined) req.workflowId = data.workflowId || undefined
    if (data.status !== undefined) req.status = data.status
    if (data.positionCount !== undefined) req.positionCount = data.positionCount
    if (data.publishedCount !== undefined) req.publishedCount = data.publishedCount
    if (data.pendingCount !== undefined) req.pendingCount = data.pendingCount
    await batchApi.update(id, req)
    await loadBatches()
  }

  const deleteBatch = async (id: string) => {
    await batchApi.delete(id)
    await loadBatches()
  }

  // 岗位操作
  const addPosition = async (data: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>) => {
    const req: Omit<CareerPosition, 'id' | 'createdAt' | 'updatedAt'> = {
      batchId: data.batchId || undefined,
      name: data.name,
      shortName: data.shortName || undefined,
      industryId: data.industry || undefined,
      majorIds: data.majors,
      positionType: data.positionType,
      salaryMin: data.salaryRange?.[0],
      salaryMax: data.salaryRange?.[1],
      coverImage: data.coverImage,
      description: data.description,
      requirements: data.requirements,
      careerPath: data.careerPath,
      version: data.version,
      status: data.status,
      createdBy: data.createdBy,
      collaborators: data.collaborators,
    }
    const created = await positionApi.create(req)
    await loadPositions()
    await loadBatches()
    return convertCareerPositionToPosition(created)
  }

  const updatePosition = async (id: string, data: Partial<Position>) => {
    const req: Partial<Omit<CareerPosition, 'id' | 'createdAt' | 'updatedAt'>> = {}
    if (data.batchId !== undefined) req.batchId = data.batchId || undefined
    if (data.name !== undefined) req.name = data.name
    if (data.shortName !== undefined) req.shortName = data.shortName
    if (data.industry !== undefined) req.industryId = data.industry || undefined
    if (data.majors !== undefined) req.majorIds = data.majors
    if (data.positionType !== undefined) req.positionType = data.positionType
    if (data.salaryRange !== undefined) {
      req.salaryMin = data.salaryRange[0]
      req.salaryMax = data.salaryRange[1]
    }
    if (data.coverImage !== undefined) req.coverImage = data.coverImage
    if (data.description !== undefined) req.description = data.description
    if (data.requirements !== undefined) req.requirements = data.requirements
    if (data.careerPath !== undefined) req.careerPath = data.careerPath
    if (data.version !== undefined) req.version = data.version
    if (data.status !== undefined) req.status = data.status
    if (data.createdBy !== undefined) req.createdBy = data.createdBy
    if (data.collaborators !== undefined) req.collaborators = data.collaborators
    await positionApi.update(id, req)
    await loadPositions()
    await loadBatches()
  }

  const deletePosition = async (id: string) => {
    await positionApi.delete(id)
    await loadPositions()
    await loadBatches()
  }

  // 审批流操作
  const addWorkflow = async (data: Omit<Workflow, 'id' | 'createdAt'>) => {
    await workflowApi.create({
      name: data.name,
      description: data.description || undefined,
      steps: data.steps as any,
      status: 'active',
    } as Omit<import('@/lib/types/backend').Workflow, 'id' | 'createdAt' | 'usageCount'>)
    await loadWorkflows()
  }

  const updateWorkflow = async (id: string, data: Partial<Workflow>) => {
    const existing = workflows.find(w => w.id === id)
    await workflowApi.update(id, {
      name: data.name ?? existing?.name ?? '',
      description: data.description ?? existing?.description,
      steps: (data.steps ?? existing?.steps ?? []) as any,
      status: 'active',
    })
    await loadWorkflows()
  }

  const deleteWorkflow = async (id: string) => {
    await workflowApi.delete(id)
    await loadWorkflows()
  }

  // 能力操作
  const addAbility = (data: Omit<Ability, 'id' | 'createdAt'>) => {
    const newAbility: Ability = {
      ...data,
      id: generateId('ability'),
      createdAt: new Date().toISOString(),
    }
    setAbilities(prev => [...prev, newAbility])
  }

  const updateAbility = (id: string, data: Partial<Ability>) => {
    setAbilities(prev =>
      prev.map(ability =>
        ability.id === id ? { ...ability, ...data } : ability
      )
    )
  }

  const deleteAbility = (id: string) => {
    setAbilities(prev => prev.filter(ability => ability.id !== id))
  }

  // 审批操作
  const submitForApproval = async (
    positionId: string,
    workflowId: string,
    submittedBy: string,
    submittedByName: string
  ) => {
    const position = await positionApi.get(positionId)
    if (!position) return

    await positionApi.submit(positionId)
    await loadPositions()

    const now = new Date().toISOString()
    const newApproval: ApprovalRecord = {
      id: generateId('approval'),
      positionId,
      positionName: position.name,
      workflowId,
      currentStepIndex: 0,
      status: 'pending',
      submittedBy,
      submittedByName,
      history: [],
      createdAt: now,
      updatedAt: now,
    }
    setApprovals(prev => [...prev, newApproval])
  }

  const approveApproval = (
    approvalId: string,
    reviewerId: string,
    reviewerName: string,
    comment: string
  ) => {
    const approval = approvals.find(a => a.id === approvalId)
    if (!approval) return

    const workflow = workflows.find(w => w.id === approval.workflowId)
    if (!workflow) return

    const currentStep = workflow.steps[approval.currentStepIndex]
    const now = new Date().toISOString()

    const historyItem = {
      id: generateId('history'),
      stepId: currentStep.id,
      stepName: currentStep.name,
      reviewerId,
      reviewerName,
      status: 'approved' as const,
      comment,
      createdAt: now,
    }

    const isLastStep = approval.currentStepIndex >= workflow.steps.length - 1

    setApprovals(prev =>
      prev.map(a =>
        a.id === approvalId
          ? {
              ...a,
              currentStepIndex: isLastStep ? a.currentStepIndex : a.currentStepIndex + 1,
              status: isLastStep ? 'approved' : 'pending',
              history: [...a.history, historyItem],
              updatedAt: now,
            }
          : a
      )
    )

    // 如果是最后一步，更新岗位状态为已通过
    if (isLastStep) {
      updatePosition(approval.positionId, { status: 'approved' })
    }
  }

  const rejectApproval = (
    approvalId: string,
    reviewerId: string,
    reviewerName: string,
    comment: string
  ) => {
    const approval = approvals.find(a => a.id === approvalId)
    if (!approval) return

    const workflow = workflows.find(w => w.id === approval.workflowId)
    if (!workflow) return

    const currentStep = workflow.steps[approval.currentStepIndex]
    const now = new Date().toISOString()

    const historyItem = {
      id: generateId('history'),
      stepId: currentStep.id,
      stepName: currentStep.name,
      reviewerId,
      reviewerName,
      status: 'rejected' as const,
      comment,
      createdAt: now,
    }

    setApprovals(prev =>
      prev.map(a =>
        a.id === approvalId
          ? {
              ...a,
              status: 'rejected',
              history: [...a.history, historyItem],
              updatedAt: now,
            }
          : a
      )
    )

    // 更新岗位状态为已驳回
    updatePosition(approval.positionId, { status: 'rejected' })
  }

  // 收藏操作
  const toggleFavorite = (positionId: string) => {
    setFavorites(prev =>
      prev.includes(positionId)
        ? prev.filter(id => id !== positionId)
        : [...prev, positionId]
    )
  }

  const isFavorite = (positionId: string) => {
    return favorites.includes(positionId)
  }

  // 目标岗位推荐操作
  const getRecommendationsByMajor = (major: string) => {
    return recommendations
      .filter((rec) => rec.major === major)
      .sort((a, b) => a.order - b.order)
  }

  const addRecommendation = async (data: Omit<PositionRecommendation, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    const majorRecs = getRecommendationsByMajor(data.major)
    await recommendApi.create({
      major: data.major,
      careerPositionId: data.positionId,
      positionType: data.positionType,
      reason: data.reason,
      sortOrder: majorRecs.length + 1,
      isVisible: data.isVisible,
      createdBy: data.createdBy || '',
    } as Omit<ApiPositionRecommendation, 'id' | 'createdAt' | 'updatedAt'>)
    await loadRecommendations()
  }

  const updateRecommendation = async (id: string, data: Partial<PositionRecommendation>) => {
    const existing = recommendations.find((r) => r.id === id)
    if (!existing) return
    await recommendApi.update(id, {
      major: data.major ?? existing.major,
      careerPositionId: data.positionId ?? existing.positionId,
      positionType: data.positionType ?? existing.positionType,
      reason: data.reason ?? existing.reason,
      sortOrder: data.order ?? existing.order,
      isVisible: data.isVisible ?? existing.isVisible,
      createdBy: existing.createdBy,
    } as ApiPositionRecommendation)
    await loadRecommendations()
  }

  const deleteRecommendation = async (id: string) => {
    await recommendApi.delete(id)
    await loadRecommendations()
  }

  const reorderRecommendations = async (major: string, orderedIds: string[]) => {
    const majorRecs = recommendations
      .filter((r) => r.major === major)
      .sort((a, b) => a.order - b.order)
    await Promise.all(
      orderedIds.map(async (id, index) => {
        const rec = majorRecs.find((r) => r.id === id)
        if (!rec) return
        const newOrder = index + 1
        if (newOrder === rec.order) return
        await recommendApi.update(id, {
          major: rec.major,
          careerPositionId: rec.positionId,
          positionType: rec.positionType,
          reason: rec.reason,
          sortOrder: newOrder,
          isVisible: rec.isVisible,
          createdBy: rec.createdBy,
        } as ApiPositionRecommendation)
      })
    )
    await loadRecommendations()
  }

  if (!isLoaded) {
    return null
  }

  return (
    <DataContext.Provider
      value={{
        batches,
        positions,
        workflows,
        abilities,
        approvals,
        favorites,
        recommendations,
        stats,
        addBatch,
        updateBatch,
        deleteBatch,
        addPosition,
        updatePosition,
        deletePosition,
        addWorkflow,
        updateWorkflow,
        deleteWorkflow,
        addAbility,
        updateAbility,
        deleteAbility,
        submitForApproval,
        approveApproval,
        rejectApproval,
        toggleFavorite,
        isFavorite,
        getRecommendationsByMajor,
        addRecommendation,
        updateRecommendation,
        deleteRecommendation,
        reorderRecommendations,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
