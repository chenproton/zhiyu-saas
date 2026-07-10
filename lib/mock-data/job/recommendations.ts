import type { PositionRecommendation } from '@/lib/types/job-source'

// 每个专业对应的推荐岗位 ID 列表（3-7 条不等）
const majorPositions: Record<string, string[]> = {
  软件工程: ['position-1', 'position-2', 'position-4', 'position-6', 'position-9'],
  '计算机科学与技术': ['position-1', 'position-2', 'position-3', 'position-4', 'position-6', 'position-9', 'position-10'],
  人工智能: ['position-3', 'position-10', 'position-1', 'position-2', 'position-5'],
  数学: ['position-3', 'position-7', 'position-1', 'position-5'],
  市场营销: ['position-5', 'position-7', 'position-8', 'position-2', 'position-1'],
  工商管理: ['position-5', 'position-7', 'position-8', 'position-1'],
  产品设计: ['position-7', 'position-8', 'position-2', 'position-5', 'position-9'],
  计算机科学: ['position-1', 'position-2', 'position-3', 'position-7', 'position-9', 'position-10'],
  视觉传达: ['position-8', 'position-7', 'position-2', 'position-5'],
  '数字媒体艺术': ['position-8', 'position-7', 'position-2', 'position-5', 'position-9'],
  财务管理: ['position-5', 'position-7', 'position-1', 'position-3', 'position-2', 'position-8'],
}

const positionTypes: Record<string, 'enterprise' | 'teaching'> = {
  'position-1': 'enterprise',
  'position-2': 'enterprise',
  'position-3': 'enterprise',
  'position-4': 'enterprise',
  'position-5': 'enterprise',
  'position-6': 'enterprise',
  'position-7': 'enterprise',
  'position-8': 'enterprise',
  'position-9': 'teaching',
  'position-10': 'teaching',
}

const positionReasons: Record<string, string> = {
  'position-1': 'Java 后端开发是该专业核心就业方向，岗位需求稳定',
  'position-2': '前端开发工程师需求量大，适合该专业学生入门',
  'position-3': '机器学习/算法岗位薪资高，是本专业热门发展方向',
  'position-4': '测试开发工程师门槛适中，适合注重质量意识的学生',
  'position-5': '市场营销专员对口度高，就业面广',
  'position-6': '运维工程师是互联网基础设施岗位，稳定性强',
  'position-7': '产品经理岗位发展空间大，适合沟通表达能力强的学生',
  'position-8': 'UI 设计师适合有审美和创意能力的本专业学生',
  'position-9': '教学实践岗可强化工程实践能力，衔接企业真实需求',
  'position-10': 'AI 教学实践岗培养算法实验与科研入门能力',
}

let recCounter = 0
const allRecommendations: PositionRecommendation[] = []

Object.entries(majorPositions).forEach(([major, positionIds]) => {
  positionIds.forEach((positionId, index) => {
    recCounter++
    allRecommendations.push({
      id: `rec-${recCounter}`,
      major,
      positionId,
      positionType: positionTypes[positionId] || 'enterprise',
      reason: positionReasons[positionId] || '推荐岗位，发展前景良好',
      order: index + 1,
      isVisible: true,
      createdBy: 'user-1',
      createdAt: '2024-03-15T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
    })
  })
})

export const mockRecommendations: PositionRecommendation[] = allRecommendations

export const getRecommendationsByMajor = (major: string): PositionRecommendation[] => {
  return mockRecommendations
    .filter((rec) => rec.major === major)
    .sort((a, b) => a.order - b.order)
}

export const getRecommendationById = (id: string): PositionRecommendation | undefined => {
  return mockRecommendations.find((rec) => rec.id === id)
}
