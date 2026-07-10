// AI 功能演示用 Mock 数据
// 所有 AI 生成功能均返回此文件中的固定数据，用于演示交互流程

export interface AiGeneratedContent {
  content: string
  confidence: "high" | "medium" | "low"
  reasoning?: string
}

// ==========================================
// 功能1：场景背景与任务说明一键生成
// ==========================================
export const mockScenarioBackgroundGeneration = (keywords: {
  position?: string
  industry?: string
  difficulty?: string
  skillDirection?: string
}): AiGeneratedContent => {
  return {
    content: `【场景背景介绍】\n\n在现代${keywords.industry || "互联网"}行业中，${keywords.position || "前端开发工程师"}需要具备完整的项目开发能力。本场景模拟真实企业项目环境，让学员体验从需求分析、技术选型、架构设计到部署上线的完整开发流程。\n\n【任务详细描述】\n\n任务目标：\n· 核心目标：完成一个功能完整的企业级管理后台前端项目\n· 目标一：掌握 React + TypeScript 技术栈的规范用法\n· 目标二：实现用户认证、数据展示、表单处理等核心模块\n· 目标三：完成性能优化并部署上线\n\n交付要求：\n· 主交付物：项目代码仓库（Git）\n· 附属说明：技术选型理由、环境依赖版本说明\n· 篇幅要求：代码不少于500行，README不少于800字\n\n测评要求：\n· 准确性(30%)：配置正确，项目可正常运行\n· 完整性(25%)：覆盖所有技术栈配置要求\n· 清晰度(20%)：目录结构清晰，文档表达简洁\n· 实用性(15%)：工程化方案可复用，易于维护\n· 规范性(10%)：代码规范，术语统一，无明显错误`,
    confidence: "high",
    reasoning: "基于目标岗位和行业特征，结合难度等级生成的标准化场景描述",
  }
}

// ==========================================
// 功能2：任务链结构智能建议
// ==========================================
export interface TaskChainSuggestion {
  taskCount: number
  assessmentCount: number
  trainingCount: number
  tasks: {
    name: string
    type: "training" | "assessment"
    difficulty: number
    estimatedHours: number
    description: string
    dependencies: number[]
  }[]
}

export const mockTaskChainSuggestion = (theme: string, position: string): TaskChainSuggestion => {
  return {
    taskCount: 5,
    assessmentCount: 3,
    trainingCount: 2,
    tasks: [
      { name: "项目初始化与架构搭建", type: "training", difficulty: 3, estimatedHours: 8, description: "使用 React + TypeScript 搭建项目基础架构", dependencies: [] },
      { name: "用户认证模块开发", type: "assessment", difficulty: 4, estimatedHours: 12, description: "实现登录、注册、权限验证等认证功能", dependencies: [0] },
      { name: "核心业务组件开发", type: "training", difficulty: 4, estimatedHours: 16, description: "开发数据表格、图表展示、表单处理等组件", dependencies: [0] },
      { name: "接口联调与数据管理", type: "assessment", difficulty: 3, estimatedHours: 10, description: "完成前后端接口对接，实现状态管理", dependencies: [1, 2] },
      { name: "项目优化与部署", type: "assessment", difficulty: 3, estimatedHours: 8, description: "性能优化、打包配置，完成项目部署上线", dependencies: [3] },
    ],
  }
}

// ==========================================
// 功能3：题库/试卷智能出题
// ==========================================
export interface AiQuestion {
  id: string
  type: "single" | "multiple" | "judgment" | "short_answer" | "essay" | "fill_blank"
  content: string
  options?: string[]
  answer: string
  score: number
  knowledgePointTag: string
  difficulty: number
}

export const mockAiGeneratedQuestions = (knowledgePoint: string, questionType: string, count: number): AiQuestion[] => {
  const questions: AiQuestion[] = [
    { id: "ai-q-1", type: "single", content: "React 18 中引入的并发特性主要解决什么问题？", options: ["性能优化", "代码复用", "状态管理", "路由控制"], answer: "性能优化", score: 10, knowledgePointTag: knowledgePoint, difficulty: 3 },
    { id: "ai-q-2", type: "multiple", content: "以下哪些是常用的 React 状态管理方案？", options: ["Redux", "MobX", "Zustand", "jQuery"], answer: "Redux,MobX,Zustand", score: 20, knowledgePointTag: knowledgePoint, difficulty: 2 },
    { id: "ai-q-3", type: "judgment", content: "TypeScript 是 JavaScript 的超集，所有 JavaScript 代码都是合法的 TypeScript 代码。", answer: "true", score: 10, knowledgePointTag: knowledgePoint, difficulty: 1 },
    { id: "ai-q-4", type: "short_answer", content: "请简述虚拟 DOM 的工作原理及其优势。", answer: "虚拟 DOM 是在内存中维护的 DOM 树形结构表示。当状态变化时，先生成新的虚拟 DOM，通过 Diff 算法与旧版本比较，计算出最小变更集，最后批量更新真实 DOM。优势包括：1. 减少直接操作 DOM 的开销；2. 跨平台能力；3. 便于实现时间切片等高级特性。", score: 15, knowledgePointTag: knowledgePoint, difficulty: 3 },
    { id: "ai-q-5", type: "fill_blank", content: "React 中 useEffect 钩子函数的第二个参数是【______】，用于控制副作用的执行时机。", answer: "依赖数组", score: 10, knowledgePointTag: knowledgePoint, difficulty: 2 },
    { id: "ai-q-6", type: "single", content: "以下哪个 Hook 用于缓存计算结果？", options: ["useMemo", "useCallback", "useRef", "useState"], answer: "useMemo", score: 10, knowledgePointTag: knowledgePoint, difficulty: 2 },
    { id: "ai-q-7", type: "multiple", content: "前端性能优化的常用手段包括哪些？", options: ["代码分割", "懒加载", "SSR", "频繁操作DOM"], answer: "代码分割,懒加载,SSR", score: 15, knowledgePointTag: knowledgePoint, difficulty: 3 },
    { id: "ai-q-8", type: "essay", content: "论述前端工程化在现代 Web 开发中的重要性，并结合实际项目说明如何落地。", answer: "前端工程化是现代 Web 开发的基石...", score: 20, knowledgePointTag: knowledgePoint, difficulty: 4 },
    { id: "ai-q-9", type: "single", content: "CSS 中 BFC（块级格式化上下文）的主要作用不包括以下哪项？", options: ["清除浮动", "防止外边距合并", "阻止元素被浮动覆盖", "改变元素定位方式"], answer: "改变元素定位方式", score: 10, knowledgePointTag: knowledgePoint, difficulty: 3 },
    { id: "ai-q-10", type: "judgment", content: "HTTP/2 协议支持多路复用，可以在一个 TCP 连接上同时传输多个请求和响应。", answer: "true", score: 10, knowledgePointTag: knowledgePoint, difficulty: 2 },
  ]
  return questions.slice(0, count)
}

// ==========================================
// 功能4：现场问答题智能生成
// ==========================================
export interface AiOnsiteQuestion {
  id: string
  name: string
  description: string
  answerPoints: string[]
  applicableMajors: string[]
  difficulty: number
}

export const mockAiOnsiteQuestions = (direction: string, major: string, difficulty: number): AiOnsiteQuestion[] => {
  return [
    { id: "ai-osq-1", name: "请简述 React 的虚拟 DOM 工作原理", description: "考察学生对 React 核心机制的理解，包括 diff 算法和 reconciliation 过程。", answerPoints: ["虚拟 DOM 是内存中的 DOM 表示", "Diff 算法比较新旧虚拟 DOM", "批量更新真实 DOM"], applicableMajors: ["前端开发", "全栈开发"], difficulty },
    { id: "ai-osq-2", name: "什么是闭包？请举例说明其在实际开发中的应用", description: "考察 JavaScript 核心概念闭包的理解及实际应用场景。", answerPoints: ["有权访问另一个函数作用域中变量的函数", "数据封装和私有变量", "函数柯里化、防抖节流"], applicableMajors: ["前端开发", "后端开发"], difficulty },
    { id: "ai-osq-3", name: "HTTP 状态码 301 和 302 的区别是什么", description: "考察对 HTTP 协议重定向状态码的理解。", answerPoints: ["301 永久重定向", "302 临时重定向", "搜索引擎处理方式不同"], applicableMajors: ["前端开发", "后端开发", "全栈开发"], difficulty },
  ]
}

// ==========================================
// 功能5：评价点（EvalPoint）智能推荐
// ==========================================
export interface AiEvalPointSuggestion {
  id: string
  name: string
  subType: string
  suggestedWeight: number
  knowledgePointIds: string[]
  abilityPointIds: string[]
  desc: string
}

export const mockAiEvalPointSuggestions = (knowledgePoints: string[], abilityPoints: string[]): AiEvalPointSuggestion[] => {
  return [
    { id: "ai-ep-1", name: "组件封装与复用能力符合预期", subType: "知识掌握", suggestedWeight: 15, knowledgePointIds: knowledgePoints.slice(0, 2), abilityPointIds: abilityPoints.slice(0, 1), desc: "学生能否合理拆分组件，实现高复用性的组件设计" },
    { id: "ai-ep-2", name: "状态管理方案选择合理且运用熟练", subType: "知识掌握", suggestedWeight: 15, knowledgePointIds: knowledgePoints.slice(0, 2), abilityPointIds: abilityPoints.slice(0, 1), desc: "面对不同场景能否选择合适的状态管理方案" },
    { id: "ai-ep-3", name: "代码规范性强，结构清晰易于维护", subType: "成果质量", suggestedWeight: 20, knowledgePointIds: knowledgePoints.slice(1, 3), abilityPointIds: abilityPoints.slice(1, 2), desc: "代码命名规范、注释完整、目录结构清晰" },
    { id: "ai-ep-4", name: "功能需求实现完整，无明显遗漏", subType: "任务完成度", suggestedWeight: 25, knowledgePointIds: knowledgePoints.slice(0, 3), abilityPointIds: abilityPoints.slice(0, 2), desc: "是否覆盖所有需求点，边界场景是否考虑" },
    { id: "ai-ep-5", name: "技术方案具有创新性，能突破常规思路", subType: "创新能力", suggestedWeight: 10, knowledgePointIds: knowledgePoints.slice(2, 4), abilityPointIds: abilityPoints.slice(2, 3), desc: "是否提出了创新性的技术方案或优化思路" },
    { id: "ai-ep-6", name: "团队沟通顺畅，协作配合积极主动", subType: "协作能力", suggestedWeight: 15, knowledgePointIds: knowledgePoints.slice(1, 2), abilityPointIds: abilityPoints.slice(1, 3), desc: "在团队协作中是否积极沟通、主动配合" },
  ]
}

// ==========================================
// 功能6：量规/评分规则智能生成
// ==========================================
export interface AiRubricGeneration {
  evalPointName: string
  gradeDescriptions: {
    grade: string
    minScore: number
    maxScore: number
    description: string
  }[]
  scoringRules?: string[]
}

export const mockAiRubricGeneration = (evalPointName: string): AiRubricGeneration => {
  return {
    evalPointName,
    gradeDescriptions: [
      { grade: "A", minScore: 90, maxScore: 100, description: `在"${evalPointName}"方面表现卓越，完全超出预期要求，可作为标杆示范。代码结构严谨，设计思路清晰，具备很强的可推广价值。` },
      { grade: "B", minScore: 75, maxScore: 89, description: `在"${evalPointName}"方面表现良好，达到预期要求，仅有少量可改进之处。整体质量较高，符合团队标准。` },
      { grade: "C", minScore: 60, maxScore: 74, description: `在"${evalPointName}"方面基本达标，核心要求已满足，但存在明显不足。需要针对性地改进和提升。` },
      { grade: "D", minScore: 0, maxScore: 59, description: `在"${evalPointName}"方面未达标准，核心要求未完成。需要重新学习相关知识点或进行专项训练。` },
    ],
    scoringRules: [
      "代码无语法错误，基础功能正常运行：不扣分",
      "出现1-2处非核心功能缺陷：扣5-10分",
      "缺少必要的错误处理或边界判断：扣10-15分",
      "存在明显的设计缺陷或安全隐患：扣15-25分",
      "核心功能无法正常运行或存在严重安全漏洞：扣25分以上",
    ],
  }
}

// ==========================================
// 功能7：知识点与能力点智能推荐关联
// ==========================================
export interface AiKnowledgeAbilityRecommendation {
  knowledgePoints: { id: string; name: string; confidence: "high" | "medium"; reason: string }[]
  abilityPoints: { id: string; name: string; confidence: "high" | "medium"; reason: string }[]
}

export const mockAiKnowledgeAbilityRecommendation = (taskDescription: string): AiKnowledgeAbilityRecommendation => {
  return {
    knowledgePoints: [
      { id: "kp-1", name: "React 核心概念与 Hooks", confidence: "high", reason: "任务描述中明确涉及 React 组件开发和状态管理" },
      { id: "kp-2", name: "TypeScript 类型系统", confidence: "high", reason: "要求使用 TypeScript 进行开发，涉及类型定义和接口设计" },
      { id: "kp-6", name: "前端工程化", confidence: "medium", reason: "任务涉及项目初始化和构建配置" },
      { id: "kp-7", name: "前端性能优化", confidence: "medium", reason: "任务包含性能优化和部署相关目标" },
    ],
    abilityPoints: [
      { id: "ab-1", name: "前端框架应用能力", confidence: "high", reason: "任务核心要求使用 React 完成项目开发" },
      { id: "ab-2", name: "TypeScript 工程实践能力", confidence: "high", reason: "任务要求 TypeScript 类型完整、规范" },
      { id: "ab-6", name: "代码质量与规范意识", confidence: "medium", reason: "任务涉及代码规范和可维护性要求" },
      { id: "ab-7", name: "系统部署与运维能力", confidence: "medium", reason: "任务包含部署上线环节" },
    ],
  }
}

// ==========================================
// 功能8：场景资源智能推荐
// ==========================================
export interface AiResourceRecommendation {
  type: string
  description: string
  reason: string
}

export const mockAiResourceRecommendations = (taskDescription: string, knowledgePoints: string[]): AiResourceRecommendation[] => {
  return [
    { type: "video", description: "React 18 并发特性原理讲解（约15分钟），涵盖 useTransition、useDeferredValue 的使用场景和最佳实践", reason: "任务涉及 React 核心机制，视频资源可帮助学生直观理解复杂概念" },
    { type: "document", description: "企业级前端项目架构设计规范 V2.0，包含目录结构、命名规范、组件设计原则", reason: "任务要求搭建规范的项目架构，文档可作为直接参考标准" },
    { type: "software", description: "VS Code + ESLint + Prettier 统一配置包（v1.3.0），包含团队预设规则", reason: "任务强调代码规范，配置包可一键统一开发环境" },
    { type: "link", description: "React 官方文档 - 性能优化章节（https://react.dev/learn/thinking-in-react）", reason: "官方权威资料，适合学生查阅最新最佳实践" },
    { type: "video", description: "TypeScript 高级类型体操实战（约30分钟），包含泛型、条件类型、映射类型", reason: "任务要求 TypeScript 类型完整，视频可提升学生类型设计能力" },
    { type: "document", description: "JWT 认证方案设计白皮书，包含 Token 刷新策略、安全存储方案、常见攻击防护", reason: "任务涉及用户认证模块，文档可提供安全设计参考" },
  ]
}

// ==========================================
// 功能9：场景上下文感知的学习问答
// ==========================================
export interface AiChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export const mockAiLearningAssistantResponse = (question: string, context: { scenarioName: string; taskName: string }): string => {
  const responses: Record<string, string> = {
    "这个任务要求我做什么": `在「${context.taskName}」任务中，你需要完成以下核心目标：\n\n1. 搭建一个符合企业规范的前端项目基础架构\n2. 配置 TypeScript、ESLint、Prettier 等开发环境\n3. 集成路由、状态管理和 UI 组件库\n\n成功标准是：项目能正常启动运行，目录结构清晰规范，代码不少于300行，README不少于500字。`,
    "我该如何准备现场问答": `针对「${context.taskName}」的现场问答，建议你重点复习以下知识点：\n\n1. React 虚拟 DOM 工作原理和 Diff 算法\n2. Hooks 的使用规则和常见陷阱\n3. TypeScript 类型推断和泛型应用\n4. 前端性能优化常用手段\n\n系统已为你抽取了3道相关练习题，可在「巩固练习」中提前演练。`,
    "评审材料需要包含哪些内容": `「${context.taskName}」的评审材料应包含：\n\n· 项目代码仓库（含完整 README）\n· 技术选型理由文档\n· 环境依赖版本说明\n· 核心代码不少于300行\n\n特别注意：材料中需要回应对「准确性」「完整性」「规范性」三个维度的测评要求。`,
  }
  
  for (const key of Object.keys(responses)) {
    if (question.includes(key) || key.includes(question)) return responses[key]
  }
  
  return `关于「${context.taskName}」的问题，我已经结合了当前场景「${context.scenarioName}」的上下文进行分析。\n\n根据任务描述和关联的知识点，建议你可以从以下角度思考：\n\n1. 回顾任务目标中的核心交付要求\n2. 检查是否覆盖了所有子目标和成功标准\n3. 参考关联知识点中的颗粒课进行针对性复习\n\n如果你有更具体的问题，欢迎继续提问。`
}

// ==========================================
// 功能11：薄弱知识点智能诊断
// ==========================================
export interface AiWeakPointDiagnosis {
  radarData: { dimension: string; score: number; fullMark: number }[]
  weakPoints: {
    name: string
    severity: "high" | "medium" | "low"
    recommendedPath: { type: "lesson" | "resource" | "practice"; name: string; id: string }[]
  }[]
  summary: string
}

export const mockAiWeakPointDiagnosis = (): AiWeakPointDiagnosis => {
  return {
    radarData: [
      { dimension: "知识掌握", score: 72, fullMark: 100 },
      { dimension: "操作规范", score: 85, fullMark: 100 },
      { dimension: "任务完成度", score: 68, fullMark: 100 },
      { dimension: "成果质量", score: 75, fullMark: 100 },
      { dimension: "沟通表达", score: 80, fullMark: 100 },
      { dimension: "创新能力", score: 55, fullMark: 100 },
    ],
    weakPoints: [
      {
        name: "React 高级 Hooks 原理",
        severity: "high",
        recommendedPath: [
          { type: "lesson", name: "深入理解 useEffect 依赖机制", id: "gl-1" },
          { type: "resource", name: "React 源码解析视频", id: "lr-1" },
          { type: "practice", name: "Hooks 练习题集", id: "prac-1" },
        ],
      },
      {
        name: "TypeScript 泛型与类型推断",
        severity: "medium",
        recommendedPath: [
          { type: "lesson", name: "TypeScript 高级类型系统", id: "gl-2" },
          { type: "practice", name: "类型体操挑战题", id: "prac-2" },
        ],
      },
      {
        name: "前端性能优化策略",
        severity: "medium",
        recommendedPath: [
          { type: "lesson", name: "浏览器渲染原理", id: "gl-3" },
          { type: "resource", name: "Lighthouse 优化指南", id: "lr-2" },
        ],
      },
    ],
    summary: "该学生在「操作规范」和「沟通表达」方面表现稳定，但「创新能力」在各场景中 consistently 偏低。建议重点关注 React 高级特性和前端性能优化方向，通过颗粒课学习和配套练习进行针对性提升。",
  }
}

// ==========================================
// 功能12：个性化场景推荐（巩固练习微测）
// ==========================================
export interface AiMicroTest {
  title: string
  questions: { content: string; options: string[]; correctAnswer: string }[]
  relatedWeakPoint: string
}

export const mockAiMicroTest = (weakPoint: string): AiMicroTest => {
  return {
    title: `「${weakPoint}」巩固练习微测`,
    relatedWeakPoint: weakPoint,
    questions: [
      { content: "useEffect 的依赖数组为空数组时，副作用函数何时执行？", options: ["每次渲染后", "仅组件挂载时", "仅组件卸载时", "从不执行"], correctAnswer: "仅组件挂载时" },
      { content: "以下哪个 Hook 用于缓存计算结果，避免不必要的重计算？", options: ["useCallback", "useMemo", "useRef", "useState"], correctAnswer: "useMemo" },
      { content: "React 18 中的自动批处理（Automatic Batching）有什么优势？", options: ["减少渲染次数", "增加渲染次数", "改变组件生命周期", "不影响性能"], correctAnswer: "减少渲染次数" },
    ],
  }
}

// ==========================================
// 功能14：材料提交智能检查
// ==========================================
export interface AiMaterialCheckResult {
  overallStatus: "pass" | "warning" | "fail"
  completeness: number
  checks: {
    item: string
    status: "pass" | "warning" | "fail"
    message: string
  }[]
  suggestions: string[]
}

export const mockAiMaterialCheck = (): AiMaterialCheckResult => {
  return {
    overallStatus: "warning",
    completeness: 78,
    checks: [
      { item: "必备模块检查", status: "warning", message: "材料中缺少「技术选型理由」模块，建议补充" },
      { item: "文档规范性", status: "pass", message: "文档结构清晰，包含目录和标题层级" },
      { item: "字数检查", status: "pass", message: "当前字数 1250 字，满足不少于 800 字的要求" },
      { item: "任务目标关联度", status: "warning", message: "材料对「性能优化」要求的回应不够充分，建议补充相关章节" },
      { item: "代码完整性", status: "pass", message: "核心代码超过 300 行，符合要求" },
    ],
    suggestions: [
      "建议补充「技术选型理由」章节，说明选择 React + TypeScript 的原因",
      "增加「性能优化措施」小节，回应对 Lighthouse 评分的要求",
      "README 中可添加项目启动步骤和截图演示",
    ],
  }
}

// ==========================================
// 功能15：主观题/开放题 AI 预评分
// ==========================================
export interface AiSubjectivePreScore {
  suggestedScore: number
  maxScore: number
  reasoning: string
  hitPoints: string[]
  missedPoints: string[]
  highlights: string[]
  confidence: "high" | "medium" | "low"
}

export const mockAiSubjectivePreScore = (): AiSubjectivePreScore => {
  return {
    suggestedScore: 82,
    maxScore: 100,
    reasoning: "学生答案涵盖了虚拟 DOM 的基本概念和 Diff 算法，但对 reconciliation 过程的描述不够深入。答案结构清晰，表达准确。",
    hitPoints: ["正确描述了虚拟 DOM 是内存中的 DOM 表示", "提到了 Diff 算法比较新旧虚拟 DOM", "说明了批量更新真实 DOM 的优势"],
    missedPoints: ["缺少对 Fiber 架构的解释", "未提及时间切片（Time Slicing）机制", "没有举例说明实际应用场景"],
    highlights: ["答案逻辑清晰，层次分明", "术语使用准确"],
    confidence: "medium",
  }
}

// ==========================================
// 功能16：评审材料/作业/成果 AI 初评
// ==========================================
export interface AiInitialReview {
  evalPointId: string
  evalPointName: string
  suggestedGrade: string
  suggestedScore: number
  maxScore: number
  basis: string[]
  doubts: string[]
  confidence: "high" | "medium" | "low"
}

export const mockAiInitialReview = (evalPointName: string): AiInitialReview => {
  return {
    evalPointId: "ai-review-1",
    evalPointName,
    suggestedGrade: "B",
    suggestedScore: 82,
    maxScore: 100,
    basis: [
      "材料中明确描述了项目架构的分层设计（第2章）",
      "包含了完整的目录结构说明和代码示例（附录A）",
      "技术选型理由充分，考虑了团队实际情况（第3.2节）",
    ],
    doubts: [
      "缺少对异常场景的处理方案描述",
      "未提供性能测试数据支撑优化效果",
    ],
    confidence: "medium",
  }
}

// ==========================================
// 功能18/19：个性化评语/批量评语生成
// ==========================================
export interface AiGeneratedComment {
  overallSummary: string
  highlights: string[]
  improvements: string[]
  fullComment: string
}

export const mockAiComment = (studentName: string): AiGeneratedComment => {
  return {
    overallSummary: `${studentName}在本次任务中表现良好，整体达到了预期要求。`,
    highlights: [
      "「代码规范性」表现优秀，命名规范、注释完整",
      "「功能完整性」得分较高，覆盖了所有核心需求",
      "「技术选型」理由充分，展现了良好的技术判断力",
    ],
    improvements: [
      "「创新能力」方面还有提升空间，建议多关注行业前沿方案",
      "「文档表达」可以更加精炼，突出重点",
      "建议加强异常处理和边界场景的考虑",
    ],
    fullComment: `${studentName}在本次「企业级前端项目开发实战」中表现良好，整体达到了预期要求。亮点在于代码规范性强，命名规范、注释完整，功能实现覆盖了所有核心需求。技术选型理由充分，展现了良好的技术判断力。\n\n改进方向：创新能力方面还有提升空间，建议多关注行业前沿方案；文档表达可以更加精炼，突出重点；建议加强异常处理和边界场景的考虑。期待在后续任务中继续保持优势，针对性提升短板。`,
  }
}

// ==========================================
// 功能21：评分标准一致性分析
// ==========================================
export interface AiConsistencyAnalysis {
  heatmap: { evalPoint: string; teacherScores: { teacher: string; score: number }[] }[]
  outliers: { teacher: string; evalPoint: string; deviation: number; reason: string }[]
  suggestions: string[]
}

export const mockAiConsistencyAnalysis = (): AiConsistencyAnalysis => {
  return {
    heatmap: [
      { evalPoint: "代码规范性", teacherScores: [{ teacher: "张老师", score: 85 }, { teacher: "李老师", score: 82 }, { teacher: "王老师", score: 88 }] },
      { evalPoint: "功能完整性", teacherScores: [{ teacher: "张老师", score: 90 }, { teacher: "李老师", score: 88 }, { teacher: "王老师", score: 92 }] },
      { evalPoint: "创新能力", teacherScores: [{ teacher: "张老师", score: 70 }, { teacher: "李老师", score: 55 }, { teacher: "王老师", score: 72 }] },
      { evalPoint: "文档规范性", teacherScores: [{ teacher: "张老师", score: 80 }, { teacher: "李老师", score: 78 }, { teacher: "王老师", score: 85 }] },
    ],
    outliers: [
      { teacher: "李老师", evalPoint: "创新能力", deviation: -15, reason: "该教师对「创新能力」的评分明显低于其他教师，建议教研组统一该评价点的判定标准" },
      { teacher: "王老师", evalPoint: "文档规范性", deviation: +8, reason: "该教师对文档要求较为严格，整体评分偏高" },
    ],
    suggestions: [
      "评价点「创新能力」的评分标准较模糊，建议教研组统一量规描述，明确各等级的判定依据",
      "建议组织评分校准会议，针对「创新能力」「文档规范性」等分歧较大的评价点进行讨论",
      "李老师在多个评价点上评分偏低，建议关注是否存在评分过严的倾向",
    ],
  }
}

// ==========================================
// 功能22：学生能力画像摘要
// ==========================================
export interface AiCompetencySummary {
  summary: string
  trends: { scenario: string; score: number }[]
  qaPairs: { question: string; answer: string }[]
}

export const mockAiCompetencySummary = (studentName: string): AiCompetencySummary => {
  return {
    summary: `该学生在「任务完成度」和「操作规范」方面表现稳定，但「创新思维」在各场景中 consistently 偏低。建议加强前沿技术学习和创新方案设计训练。跨场景能力变化呈上升趋势，从初期的 68 分提升至近期的 82 分，进步明显。`,
    trends: [
      { scenario: "项目初始化与架构搭建", score: 72 },
      { scenario: "用户认证模块开发", score: 78 },
      { scenario: "核心业务组件开发", score: 85 },
      { scenario: "项目优化与部署", score: 82 },
    ],
    qaPairs: [
      { question: "这个学生相比班级平均水平如何？", answer: "该学生整体能力略高于班级平均水平（班级均分 76，该生均分 79）。特别是在「操作规范」维度显著优于班级平均（+12 分），但在「创新能力」维度低于班级平均（-8 分）。" },
      { question: "他在哪个场景进步最大？", answer: "「核心业务组件开发」场景进步最大，从初期的 65 分提升至 85 分，主要得益于该阶段对组件设计模式的学习和实践。" },
    ],
  }
}

// ==========================================
// 功能23：班级学情 AI 分析报告
// ==========================================
export interface AiClassReport {
  overallDistribution: { range: string; count: number; percentage: number }[]
  weakPoints: { name: string; avgScore: number; failRate: number }[]
  attentionList: { studentName: string; reason: string }[]
  teachingSuggestions: string[]
}

export const mockAiClassReport = (): AiClassReport => {
  return {
    overallDistribution: [
      { range: "90-100分", count: 5, percentage: 12.5 },
      { range: "75-89分", count: 18, percentage: 45.0 },
      { range: "60-74分", count: 12, percentage: 30.0 },
      { range: "0-59分", count: 5, percentage: 12.5 },
    ],
    weakPoints: [
      { name: "React Hooks 原理", avgScore: 62, failRate: 28 },
      { name: "TypeScript 泛型", avgScore: 58, failRate: 35 },
      { name: "前端性能优化", avgScore: 65, failRate: 22 },
      { name: "组件设计模式", avgScore: 68, failRate: 18 },
      { name: "工程化配置", avgScore: 70, failRate: 15 },
    ],
    attentionList: [
      { studentName: "张三", reason: "多项能力待提升，特别是「知识掌握」和「创新能力」维度均低于 60 分" },
      { studentName: "李四", reason: "「任务完成度」连续两个场景低于及格线，存在明显的学习困难" },
      { studentName: "王五", reason: "虽然总分达标，但「沟通表达」维度持续偏低，可能影响团队协作任务" },
    ],
    teachingSuggestions: [
      "下次教学应加强 React Hooks 原理的深度讲解，建议增加源码阅读环节",
      "针对 TypeScript 泛型的普遍薄弱，建议增设「类型体操」专项练习课",
      "建议引入更多前沿技术案例，激发学生的创新思维",
      "对关注名单中的学生实施一对一辅导计划，制定个性化学习路径",
    ],
  }
}
