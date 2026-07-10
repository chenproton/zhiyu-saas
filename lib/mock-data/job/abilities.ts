import type { Ability } from '@/lib/types/job-source'

export const abilityCategories = [
  '专业技能',
  '通用能力',
  '软技能',
  '工具应用',
  '行业知识',
]

export const mockAbilities: Ability[] = [
  // 专业技能
  {
    id: 'ability-1',
    name: 'Java 编程',
    category: '专业技能',
    description: '掌握 Java 语言核心语法、面向对象编程、多线程、集合框架等',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-2',
    name: 'Python 编程',
    category: '专业技能',
    description: '掌握 Python 语言基础语法、数据处理、脚本编写等',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-3',
    name: '前端开发',
    category: '专业技能',
    description: '掌握 HTML/CSS/JavaScript、主流框架（React/Vue）开发',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-4',
    name: '数据库设计',
    category: '专业技能',
    description: '掌握关系型数据库设计、SQL 语言、数据建模等',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-5',
    name: '系统架构',
    category: '专业技能',
    description: '理解分布式系统、微服务架构、系统设计原则等',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // 通用能力
  {
    id: 'ability-6',
    name: '需求分析',
    category: '通用能力',
    description: '能够理解业务需求、提炼功能点、编写需求文档',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-7',
    name: '问题解决',
    category: '通用能力',
    description: '具备问题分析、方案设计、调试排错的能力',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-8',
    name: '项目管理',
    category: '通用能力',
    description: '了解项目管理流程、进度控制、风险管理等',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // 软技能
  {
    id: 'ability-9',
    name: '团队协作',
    category: '软技能',
    description: '能够与团队成员有效沟通、协同工作',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-10',
    name: '沟通表达',
    category: '软技能',
    description: '具备清晰的口头和书面表达能力',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-11',
    name: '学习能力',
    category: '软技能',
    description: '能够快速学习新技术、新知识',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // 工具应用
  {
    id: 'ability-12',
    name: 'Git 版本控制',
    category: '工具应用',
    description: '掌握 Git 基本操作、分支管理、团队协作流程',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-13',
    name: 'Linux 系统',
    category: '工具应用',
    description: '熟悉 Linux 常用命令、Shell 脚本编写',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-14',
    name: 'Docker 容器',
    category: '工具应用',
    description: '了解容器化技术、Docker 基本使用',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // 行业知识
  {
    id: 'ability-15',
    name: '软件工程',
    category: '行业知识',
    description: '了解软件开发生命周期、敏捷开发、DevOps 等',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ability-16',
    name: '互联网产品',
    category: '行业知识',
    description: '了解互联网产品设计、用户体验、数据分析等',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
]

export const getAbilityById = (id: string): Ability | undefined => {
  return mockAbilities.find(ability => ability.id === id)
}

export const getAbilitiesByCategory = (category: string): Ability[] => {
  return mockAbilities.filter(ability => ability.category === category)
}

export const getPublicAbilities = (): Ability[] => {
  return mockAbilities.filter(ability => ability.isPublic)
}
