import type { User } from '@/lib/types/job-source'

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '张管理',
    email: 'admin@example.com',
    role: 'admin',
    department: '教务处',
  },
  {
    id: 'user-2',
    name: '李建设',
    email: 'builder@example.com',
    role: 'builder',
    department: '计算机学院',
  },
  {
    id: 'user-3',
    name: '王审批',
    email: 'reviewer@example.com',
    role: 'reviewer',
    department: '教务处',
  },
  {
    id: 'user-4',
    name: '赵学生',
    email: 'student@example.com',
    role: 'student',
    department: '计算机学院',
  },
]

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id)
}

export const getUsersByRole = (role: User['role']): User[] => {
  return mockUsers.filter(user => user.role === role)
}
