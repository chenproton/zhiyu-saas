import type { ObjectiveSubmissionAnswer, SubmissionAttachment } from "@/lib/scene-mock-data"

export type LearningMode = "separate" | "integrated"
export type TaskPhase = "learning" | "assessment" | "submitted"
export type AssessmentForm = "paper" | "question_bank" | "random_draw" | "review"

export interface KnowledgePointItem {
  id: string
  name: string
  description: string
  category?: string
  code?: string
  granularLessons?: string[]
}

export interface AbilityPointItem {
  id: string
  name: string
  description: string
  category?: string
  domain?: string
  proficiencyDesc?: string
  requiredLevel?: "了解" | "理解" | "掌握" | "熟练" | "精通"
  code?: string
}

export interface ResourceItem {
  id: string
  name: string
  type: string
  description?: string
  url?: string
  size?: string
}

export interface SimulatedTask {
  id: string
  name: string
  description: string
  detailedDescription: string
  scenarioName: string
  scenarioId: string
  assessmentForm: AssessmentForm
  difficulty: number
  estimatedHours: number
  knowledgePoints: KnowledgePointItem[]
  abilityPoints: AbilityPointItem[]
  resources: ResourceItem[]
  background: string
  taskType: "assessment" | "training"
  evalPoints?: { id: string; name: string; desc: string; weight: number; maxScore: number }[]
  reviewConfig?: {
    materialTypes: string[]
    deadlineDays: number
    allowResubmit: boolean
  }
  paperConfig?: {
    duration: number
    passScore: number
    allowRetake: boolean
    shuffleQuestions: boolean
  }
  questionBankConfig?: {
    duration: number
    questionCount: number
    totalScore: number
  }
}

export interface ExamQuestion {
  id: string
  name: string
  type: "single" | "multiple" | "judgment" | "text"
  content: string
  options?: string[]
  correctAnswer?: string | string[]
  score: number
}

export interface StudentExamState {
  answers: Record<string, string | string[]>
  timeRemaining: number
  isStarted: boolean
  isSubmitted: boolean
}

export interface ReviewSubmissionState {
  textAnswer: string
  attachments: SubmissionAttachment[]
  isSubmitted: boolean
}

export interface OnSiteQAState {
  isCompleted: boolean
  notes: string
}

export interface LocalSubmission {
  id: string
  studentId: string
  scenarioId: string
  scenarioName: string
  taskId: string
  taskName: string
  assessmentForm: string
  status: "pending"
  submittedAt: string
  maxScore: number
  objectiveAnswers?: ObjectiveSubmissionAnswer[]
  subjectiveContent?: { textAnswer?: string; attachments?: SubmissionAttachment[] }
  drawnQuestions?: { questionId: string; questionName: string; questionContent: string; questionType: string; options?: string[]; correctAnswer?: string | string[] }[]
  evalPointScores?: never[]
}
