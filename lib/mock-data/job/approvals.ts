import type { ApprovalRecord } from '@/lib/types/job-source'

export const mockApprovalRecords: ApprovalRecord[] = [
  {
    id: 'approval-1',
    positionId: 'position-3',
    positionName: '机器学习工程师',
    workflowId: 'workflow-1',
    currentStepIndex: 0,
    status: 'pending',
    submittedBy: 'user-2',
    submittedByName: '李建设',
    history: [],
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'approval-2',
    positionId: 'position-1',
    positionName: 'Java 后端开发工程师',
    workflowId: 'workflow-1',
    currentStepIndex: 2,
    status: 'approved',
    submittedBy: 'user-2',
    submittedByName: '李建设',
    history: [
      {
        id: 'history-1',
        stepId: 'step-1',
        stepName: '部门初审',
        reviewerId: 'user-3',
        reviewerName: '王审批',
        status: 'approved',
        comment: '岗位信息完整，能力模型设计合理，同意通过。',
        createdAt: '2024-02-20T00:00:00Z',
      },
      {
        id: 'history-2',
        stepId: 'step-2',
        stepName: '教务终审',
        reviewerId: 'user-1',
        reviewerName: '张管理',
        status: 'approved',
        comment: '审核通过，可以上架。',
        createdAt: '2024-02-25T00:00:00Z',
      },
    ],
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-25T00:00:00Z',
  },
  {
    id: 'approval-3',
    positionId: 'position-6',
    positionName: '运维工程师',
    workflowId: 'workflow-1',
    currentStepIndex: 1,
    status: 'rejected',
    submittedBy: 'user-2',
    submittedByName: '李建设',
    history: [
      {
        id: 'history-3',
        stepId: 'step-1',
        stepName: '部门初审',
        reviewerId: 'user-3',
        reviewerName: '王审批',
        status: 'rejected',
        comment: '能力模型不完整，请补充后重新提交。',
        createdAt: '2024-03-08T00:00:00Z',
      },
    ],
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-03-08T00:00:00Z',
  },
  {
    id: 'approval-4',
    positionId: 'position-2',
    positionName: '前端开发工程师',
    workflowId: 'workflow-1',
    currentStepIndex: 2,
    status: 'approved',
    submittedBy: 'user-2',
    submittedByName: '李建设',
    history: [
      {
        id: 'history-4',
        stepId: 'step-1',
        stepName: '部门初审',
        reviewerId: 'user-3',
        reviewerName: '王审批',
        status: 'approved',
        comment: '内容完整，同意通过。',
        createdAt: '2024-02-22T00:00:00Z',
      },
      {
        id: 'history-5',
        stepId: 'step-2',
        stepName: '教务终审',
        reviewerId: 'user-1',
        reviewerName: '张管理',
        status: 'approved',
        comment: '审核通过。',
        createdAt: '2024-02-26T00:00:00Z',
      },
    ],
    createdAt: '2024-02-18T00:00:00Z',
    updatedAt: '2024-02-26T00:00:00Z',
  },
]

export const getApprovalById = (id: string): ApprovalRecord | undefined => {
  return mockApprovalRecords.find(approval => approval.id === id)
}

export const getApprovalByPositionId = (positionId: string): ApprovalRecord | undefined => {
  return mockApprovalRecords.find(approval => approval.positionId === positionId)
}

export const getPendingApprovals = (): ApprovalRecord[] => {
  return mockApprovalRecords.filter(approval => approval.status === 'pending')
}

export const getApprovalsByStatus = (status: ApprovalRecord['status']): ApprovalRecord[] => {
  return mockApprovalRecords.filter(approval => approval.status === status)
}
