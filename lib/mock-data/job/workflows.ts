import type { Workflow } from '@/lib/types/job-source'

export const mockWorkflows: Workflow[] = [
  {
    id: 'workflow-1',
    name: '标准审批流程',
    description: '适用于常规岗位的两级审批流程',
    steps: [
      {
        id: 'step-1',
        name: '部门初审',
        role: 'reviewer',
        order: 1,
      },
      {
        id: 'step-2',
        name: '教务终审',
        role: 'admin',
        order: 2,
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'workflow-2',
    name: '快速审批流程',
    description: '适用于紧急岗位的单级审批流程',
    steps: [
      {
        id: 'step-3',
        name: '教务审批',
        role: 'admin',
        order: 1,
      },
    ],
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'workflow-3',
    name: '三级审批流程',
    description: '适用于重点岗位的多级审批流程',
    steps: [
      {
        id: 'step-4',
        name: '院系初审',
        role: 'reviewer',
        order: 1,
      },
      {
        id: 'step-5',
        name: '专家评审',
        role: 'reviewer',
        order: 2,
      },
      {
        id: 'step-6',
        name: '教务终审',
        role: 'admin',
        order: 3,
      },
    ],
    createdAt: '2024-02-01T00:00:00Z',
  },
]

export const getWorkflowById = (id: string): Workflow | undefined => {
  return mockWorkflows.find(workflow => workflow.id === id)
}
