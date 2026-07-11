export interface Course {
  id: string
  code: string
  name: string
  type: "system" | "granular" | "hybrid"
  category: string
  major?: string
  teacherId?: string
  industry?: string
  version?: string
  onlineHours?: number
  offlineHours?: number
  onlineWeight?: number
  offlineWeight?: number
  semester?: string
  className?: string
  status: "draft" | "pending" | "rejected" | "published" | "archived"
  coverColor?: string
  coverImage?: string
  courseTag?: string
  creatorId: string
  coCreatorIds: string[]
  batchGroup?: string
  nodeCount: number
  resourceCount: number
  viewCount: number
  studyCount: number
  createdAt: string
  updatedAt: string
}

export interface KnowledgePoint {
  id: string
  name: string
  code?: string
  description?: string
  linked: boolean
  granularLessonIds: string[]
  creatorId?: string
  createdAt: string
  updatedAt: string
}

export interface SystemCourseNode {
  id: string
  courseId: string
  parentId?: string
  name: string
  sortOrder: number
  refType: "normal" | "original" | "resource"
  sourceId?: string
  sourceName?: string
  teachingGoals?: string
  duration?: number
  knowledgePointIds: string[]
  resourceIds: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface NodeQuiz {
  id: string
  nodeId: string
  title: string
  type: "paper" | "question_bank"
  timeLimit?: number
}

export interface NodeQuizQuestion {
  id: string
  quizId: string
  type: "single" | "multiple" | "judge" | "essay"
  question: string
  options?: Record<string, any>
  answer?: string
  score: number
  sortOrder: number
}

export interface NodeHomework {
  id: string
  nodeId: string
  title: string
  requirement?: string
  needAttachment: boolean
  deadline?: string
}

export interface HybridNodeModule {
  id: string
  nodeId: string
  moduleKey: string
  mode: "online" | "offline"
  data: Record<string, any>
}

export interface NodeResource {
  id: string
  nodeId: string
  name: string
  type: string
  url: string
  size?: number
}

export interface CourseKnowledgeBinding {
  id: string
  courseId: string
  knowledgePointId: string
  bindType: "course" | "node"
  sourceId?: string
}

export interface LessonBatch {
  id: string
  name: string
  code?: string
  orgNodeId?: string
  major?: string
  workflowId?: string
  status: "open" | "closed"
  courseCount?: number
  createdAt: string
  updatedAt: string
}

// ==================== Admin component local types (migrated from lib/mock-data-lesson) ====================

export type ResourceType = "document" | "video" | "link" | "file"

export interface Resource {
  id: string
  name: string
  type: ResourceType
  url: string
  size?: string
}

export type LessonQuestionType = "single" | "multiple" | "judgment"

export interface QuestionItem {
  id: string
  type: LessonQuestionType
  content: string
  options?: string[]
  answer: string | string[]
  score: number
}

export interface ObjectiveConfig {
  questions: QuestionItem[]
  totalScore: number
}

export interface RubricLevel {
  id: string
  name: string
  minScore: number
  maxScore: number
  description: string
  color: string
}

export interface RubricPoint {
  id: string
  name: string
  weight: number
  maxScore: number
  levels: RubricLevel[]
}

export interface SubjectiveConfig {
  rubricPoints: RubricPoint[]
  synthesisRule: "sum" | "weighted"
}

export interface GradeMapping {
  id: string
  grade: string
  minScore: number
  maxScore: number
  color: string
  remark?: string
}

export interface KnowledgePointItem {
  id: string
  name: string
  code?: string
  description?: string
  linked: boolean
  granularLessons?: string[]
}

export interface EvalPoint {
  id: string
  name: string
  desc: string
  subType?: string
  types?: string[]
  knowledgePointIds?: string[]
  abilityPointIds?: string[]
  scoringMethod?: "score" | "level" | "rubric"
  gradeMapping?: GradeMapping[]
  weight?: number
}
