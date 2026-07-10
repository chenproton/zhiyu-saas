"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { StudentAbilityPortrait, EvaluationGrade, AbilityDomainScore, CourseRecord, PortraitUpdateConfig, AbilityDomain } from '@/lib/types/lesson-source'

function makePortrait(
  id: string, name: string, studentId: string, className: string, major: string, position: string,
  grade: string, gender: string,
  scores: [number, number, number, number, number],
  classRank: number, classTotal: number, majorRank: number, majorTotal: number,
  recs: [string, number][],
): StudentAbilityPortrait {
  const domainLabels = ['行业认知', '专业知识', '专业技能', '通用能力', '职业素养']
  const domains: AbilityDomain[] = ['industry', 'professional', 'skill', 'general', 'quality']
  const levels = ['未达标', '了解', '理解', '掌握', '熟练', '精通']
  const scoreToLevel = (s: number) => s < 60 ? levels[0] : s < 70 ? levels[1] : s < 80 ? levels[2] : s < 86 ? levels[3] : s < 93 ? levels[4] : levels[5]
  const overall = (scores.reduce((a, b) => a + b, 0) / 5)
  const overallGrade: EvaluationGrade = overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 60 ? 'D' : 'E'
  const courseNames = ['Java程序设计', '数据结构与算法', 'Web前端开发', '数据库原理', '软件工程', '操作系统', '计算机网络', 'Python数据分析']
  const sceneNames = ['Web前端开发实训室', '软件工程实训室', '项目评审室', '在线学习平台', '校企合作基地']
  const courseRecords: CourseRecord[] = courseNames.slice(0, 5 + Math.floor(Math.random() * 3)).map((cn) => {
    const fs = 55 + Math.floor(Math.random() * 45)
    const g: EvaluationGrade = fs >= 90 ? 'A' : fs >= 80 ? 'B' : fs >= 70 ? 'C' : fs >= 60 ? 'D' : 'E'
    return { courseName: cn, credit: 2 + Math.floor(Math.random() * 3), grade: g, finalScore: fs }
  })
  const totalCredit = courseRecords.reduce((s, c) => s + c.credit, 0)
  return {
    id, studentName: name, studentId, className, majorName: major, positionName: position, overallGrade,
    domainScores: scores.map((s, i) => ({ domain: domains[i], domainLabel: domainLabels[i], score: s, level: scoreToLevel(s) })),
    classRank, classTotal, majorRank, majorTotal,
    recommendPositions: recs.map(([p, m]) => ({ positionName: p, matchRate: m })),
    updatedAt: new Date('2024-05-14'),
    gender, gradeYear: '2021级',
    courses: courseNames.slice(0, 6),
    scenes: sceneNames.slice(0, 3 + Math.floor(Math.random() * 3)),
    completedCourses: 5 + Math.floor(Math.random() * 3),
    completedScenes: 3 + Math.floor(Math.random() * 3),
    totalCredits: totalCredit,
    archiveCount: Math.floor(Math.random() * 8),
    courseRecords,
    graduationQualified: overall >= 70,
    attendanceRate: 85 + Math.floor(Math.random() * 15),
    diplomaBadge: overall >= 70 ? '学历认定达标徽章' : '学历认定未达标',
    yearRank: Math.floor(Math.random() * 120) + 1,
    yearTotal: 120,
    dualBadge: overall >= 80 ? '双体系卓越认定证书' : overall >= 70 ? '双体系达标认定证书' : '双体系未达标',
  }
}

const mockStudentAbilityPortraits: StudentAbilityPortrait[] = [
  makePortrait('sp-portrait-1', '张三', '2021001', '2021级全栈开发1班', '软件工程', '全栈开发工程师', 'A', '男', [88, 92, 90, 85, 87], 2, 40, 5, 150, [['全栈开发工程师', 95], ['后端开发工程师', 88], ['前端开发工程师', 85]]),
  makePortrait('sp-portrait-2', '李四', '2021002', '2021级全栈开发1班', '软件工程', '全栈开发工程师', 'C', '男', [70, 72, 68, 75, 73], 28, 40, 95, 150, [['测试工程师', 72], ['运维工程师', 68]]),
  makePortrait('sp-portrait-3', '王五', '2021003', '2021级后端开发1班', '计算机科学与技术', '后端开发工程师', 'B', '男', [80, 85, 82, 78, 80], 8, 35, 25, 150, [['后端开发工程师', 90], ['全栈开发工程师', 82]]),
  makePortrait('sp-portrait-4', '赵六', '2021004', '2021级前端开发1班', '数字媒体技术', '前端开发工程师', 'D', '女', [62, 65, 60, 68, 55], 32, 38, 110, 150, [['UI设计师', 60], ['产品经理助理', 55]]),
  makePortrait('sp-portrait-5', '孙七', '2021005', '2021级全栈开发1班', '软件工程', '全栈开发工程师', 'A', '男', [90, 93, 91, 88, 89], 1, 40, 2, 150, [['全栈开发工程师', 98], ['架构师助理', 92], ['后端开发工程师', 90]]),
  makePortrait('sp-portrait-6', '周八', '2021006', '2021级后端开发1班', '计算机科学与技术', '后端开发工程师', 'B', '女', [82, 80, 84, 78, 81], 12, 35, 30, 150, [['后端开发工程师', 88], ['数据库工程师', 82]]),
  makePortrait('sp-portrait-23', '吕二十五', '2021023', '2021级前端开发1班', '数字媒体技术', '前端开发工程师', 'B', '男', [83, 85, 80, 78, 82], 14, 38, 45, 150, [['前端开发工程师', 86], ['UI设计师', 80]]),
  makePortrait('sp-portrait-24', '施二十六', '2021024', '2021级前端开发1班', '数字媒体技术', '前端开发工程师', 'A', '女', [90, 88, 92, 86, 89], 5, 38, 15, 150, [['前端开发工程师', 93], ['全栈开发工程师', 88]]),
  makePortrait('sp-portrait-25', '张二十七', '2021025', '2021级后端开发1班', '计算机科学与技术', '后端开发工程师', 'C', '女', [68, 70, 72, 66, 69], 25, 35, 100, 150, [['测试工程师', 72], ['运维工程师', 68]]),
  makePortrait('sp-portrait-26', '孔二十八', '2021026', '2021级全栈开发1班', '软件工程', '全栈开发工程师', 'B', '男', [80, 82, 78, 76, 81], 18, 40, 55, 150, [['全栈开发工程师', 84], ['后端开发工程师', 78]]),
]

interface DataContextValue {
  studentAbilityPortraits: StudentAbilityPortrait[]
  portraitUpdateConfig: PortraitUpdateConfig
  updateStudentAbilityPortrait: (id: string, data: Partial<StudentAbilityPortrait>) => void
  updatePortraitUpdateConfig: (config: Partial<PortraitUpdateConfig>) => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [portraits, setPortraits] = useState(mockStudentAbilityPortraits)
  const [config, setConfig] = useState<PortraitUpdateConfig>({
    autoUpdate: true,
    updateTime: '02:00',
    lastUpdateTime: new Date('2026-02-01T02:00:00'),
  })

  const updateStudentAbilityPortrait = useCallback((id: string, data: Partial<StudentAbilityPortrait>) => {
    setPortraits((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p))
  }, [])

  const updatePortraitUpdateConfig = useCallback((newConfig: Partial<PortraitUpdateConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  return (
    <DataContext.Provider value={{
      studentAbilityPortraits: portraits,
      portraitUpdateConfig: config,
      updateStudentAbilityPortrait,
      updatePortraitUpdateConfig,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider')
  }
  return ctx
}
