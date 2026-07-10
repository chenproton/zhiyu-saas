import type { Batch } from '@/lib/types/job-source'

export const mockBatches: Batch[] = [
  {
    id: 'batch-1',
    name: '2024年春季岗位建设批次',
    department: '计算机学院',
    major: '软件工程',
    workflowId: 'workflow-1',
    status: 'open',
    positionCount: 12,
    publishedCount: 8,
    pendingCount: 3,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'batch-2',
    name: '2024年春季岗位建设批次',
    department: '计算机学院',
    major: '人工智能',
    workflowId: 'workflow-1',
    status: 'open',
    positionCount: 8,
    publishedCount: 5,
    pendingCount: 2,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'batch-3',
    name: '2024年春季岗位建设批次',
    department: '商学院',
    major: '市场营销',
    workflowId: 'workflow-2',
    status: 'open',
    positionCount: 6,
    publishedCount: 4,
    pendingCount: 1,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
  },
  {
    id: 'batch-4',
    name: '2023年秋季岗位建设批次',
    department: '计算机学院',
    major: '软件工程',
    workflowId: 'workflow-1',
    status: 'closed',
    positionCount: 15,
    publishedCount: 15,
    pendingCount: 0,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-12-20T00:00:00Z',
  },
  {
    id: 'batch-5',
    name: '2023年秋季岗位建设批次',
    department: '商学院',
    major: '财务管理',
    workflowId: 'workflow-3',
    status: 'closed',
    positionCount: 10,
    publishedCount: 10,
    pendingCount: 0,
    createdAt: '2023-09-15T00:00:00Z',
    updatedAt: '2023-12-15T00:00:00Z',
  },
]

export const getBatchById = (id: string): Batch | undefined => {
  return mockBatches.find(batch => batch.id === id)
}

export const getBatchesByDepartment = (department: string): Batch[] => {
  return mockBatches.filter(batch => batch.department === department)
}

export const getBatchesByStatus = (status: Batch['status']): Batch[] => {
  return mockBatches.filter(batch => batch.status === status)
}
