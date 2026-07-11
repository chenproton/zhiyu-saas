export type UsageType = 'quiz' | 'exam'

export type SceneType = 'scene' | 'course'

export interface ExamUsage {
  id: string
  examId: string
  examName: string
  displayType: '场景' | '课程' | '教学考试'
  sceneName: string
  usageType: UsageType
  description?: string
  duration?: number
  startTime?: Date
  endTime?: Date
  participantCount: number
  passCount?: number
  status: 'pending' | 'active' | 'ended'
  approvalStatus?: 'draft' | 'pending' | 'toPublish' | 'published'
  targetAudience?: 'student' | 'teacher'
  teacherIds?: string[]
}

export interface OrgNode {
  id: string
  name: string
  type: 'department' | 'grade' | 'class' | 'student'
  children?: OrgNode[]
}

export const mockClasses = [
  { id: 'class-1', name: '2024级前端开发1班' },
  { id: 'class-2', name: '2024级前端开发2班' },
  { id: 'class-3', name: '2024级后端开发1班' },
  { id: 'class-4', name: '2024级后端开发2班' },
  { id: 'class-5', name: '2024级全栈开发班' },
  { id: 'class-6', name: '2024级测试工程班' },
  { id: 'class-7', name: '2024级产品设计班' },
  { id: 'class-8', name: '2023级前端开发1班' },
]

export const mockOrgClasses: OrgNode[] = [
  {
    id: 'dept-1',
    name: '计算机学院',
    type: 'department',
    children: [
      {
        id: 'grade-1-1',
        name: '2024级',
        type: 'grade',
        children: [
          {
            id: 'class-1',
            name: '2024级前端开发1班',
            type: 'class',
            children: [
              { id: 'stu-1-1', name: '张伟', type: 'student' },
              { id: 'stu-1-2', name: '李娜', type: 'student' },
              { id: 'stu-1-3', name: '王强', type: 'student' },
            ]
          },
          {
            id: 'class-2',
            name: '2024级前端开发2班',
            type: 'class',
            children: [
              { id: 'stu-2-1', name: '刘洋', type: 'student' },
              { id: 'stu-2-2', name: '陈静', type: 'student' },
              { id: 'stu-2-3', name: '杨帆', type: 'student' },
            ]
          },
          {
            id: 'class-3',
            name: '2024级后端开发1班',
            type: 'class',
            children: [
              { id: 'stu-3-1', name: '赵敏', type: 'student' },
              { id: 'stu-3-2', name: '孙磊', type: 'student' },
              { id: 'stu-3-3', name: '周涛', type: 'student' },
            ]
          },
        ]
      },
      {
        id: 'grade-1-2',
        name: '2023级',
        type: 'grade',
        children: [
          {
            id: 'class-8',
            name: '2023级前端开发1班',
            type: 'class',
            children: [
              { id: 'stu-8-1', name: '吴倩', type: 'student' },
              { id: 'stu-8-2', name: '郑宇', type: 'student' },
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'dept-2',
    name: '软件工程学院',
    type: 'department',
    children: [
      {
        id: 'grade-2-1',
        name: '2024级',
        type: 'grade',
        children: [
          {
            id: 'class-4',
            name: '2024级后端开发2班',
            type: 'class',
            children: [
              { id: 'stu-4-1', name: '马超', type: 'student' },
              { id: 'stu-4-2', name: '朱琳', type: 'student' },
              { id: 'stu-4-3', name: '胡军', type: 'student' },
            ]
          },
          {
            id: 'class-5',
            name: '2024级全栈开发班',
            type: 'class',
            children: [
              { id: 'stu-5-1', name: '郭明', type: 'student' },
              { id: 'stu-5-2', name: '何秀', type: 'student' },
              { id: 'stu-5-3', name: '高飞', type: 'student' },
            ]
          },
          {
            id: 'class-6',
            name: '2024级测试工程班',
            type: 'class',
            children: [
              { id: 'stu-6-1', name: '林峰', type: 'student' },
              { id: 'stu-6-2', name: '罗丹', type: 'student' },
              { id: 'stu-6-3', name: '梁雪', type: 'student' },
            ]
          },
        ]
      },
      {
        id: 'grade-2-2',
        name: '2023级',
        type: 'grade',
        children: [
          {
            id: 'class-7',
            name: '2023级产品设计班',
            type: 'class',
            children: [
              { id: 'stu-7-1', name: '宋佳', type: 'student' },
              { id: 'stu-7-2', name: '唐勇', type: 'student' },
            ]
          },
        ]
      }
    ]
  }
]

export const mockUsages: ExamUsage[] = [
  {
    id: 'usage-1',
    examId: 'exam-1',
    examName: '前端基础测试',
    displayType: '课程',
    sceneName: 'JavaScript入门到精通',
    usageType: 'quiz',
    description: 'JavaScript基础语法与API测试',
    duration: 60,
    startTime: new Date('2024-03-10 14:00'),
    endTime: new Date('2024-03-10 15:00'),
    participantCount: 156,
    passCount: 128,
    status: 'active',
  },
  {
    id: 'usage-2',
    examId: 'exam-1',
    examName: '前端基础测试',
    displayType: '场景',
    sceneName: '2024春季招聘',
    usageType: 'exam',
    description: '2024年春季校园招聘技术笔试',
    duration: 120,
    startTime: new Date('2024-03-15 09:00'),
    endTime: new Date('2024-03-15 11:00'),
    participantCount: 89,
    passCount: 67,
    status: 'ended',
  },
  {
    id: 'usage-3',
    examId: 'exam-2',
    examName: 'TypeScript 能力测试',
    displayType: '教学考试',
    sceneName: 'TypeScript高级教程',
    usageType: 'quiz',
    description: 'TypeScript类型系统与高级特性测验',
    duration: 45,
    startTime: new Date('2024-03-20 10:00'),
    endTime: new Date('2024-03-20 10:45'),
    participantCount: 42,
    passCount: 38,
    status: 'active',
    approvalStatus: 'published',
    targetAudience: 'student',
  },
  {
    id: 'usage-4',
    examId: 'exam-2',
    examName: 'TypeScript 能力测试',
    displayType: '场景',
    sceneName: '技术能力评估',
    usageType: 'exam',
    description: '季度技术能力综合评估',
    duration: 90,
    startTime: new Date('2024-04-01 14:00'),
    endTime: new Date('2024-04-01 15:30'),
    participantCount: 0,
    passCount: 0,
    status: 'pending',
  },
  {
    id: 'usage-5',
    examId: 'exam-3',
    examName: 'React 进阶考核',
    displayType: '教学考试',
    sceneName: 'React实战开发',
    usageType: 'exam',
    description: 'React Hooks与性能优化专项考核',
    duration: 120,
    startTime: new Date('2024-04-10 09:00'),
    endTime: new Date('2024-04-10 11:00'),
    participantCount: 0,
    passCount: 0,
    status: 'pending',
    approvalStatus: 'pending',
    targetAudience: 'teacher',
    teacherIds: ['user-1', 'user-2'],
  },
  {
    id: 'usage-6',
    examId: 'exam-4',
    examName: 'Node.js 后端测试',
    displayType: '课程',
    sceneName: '后端开发岗位筛选',
    usageType: 'exam',
    description: 'Node.js基础与Express框架测试',
    duration: 100,
    startTime: new Date('2024-02-28 14:00'),
    endTime: new Date('2024-02-28 15:40'),
    participantCount: 56,
    passCount: 44,
    status: 'ended',
  },
]
