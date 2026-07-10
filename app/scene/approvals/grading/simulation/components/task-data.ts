import type { SimulatedTask, ExamQuestion } from "./types"

// ============================================================================
// 颗粒课数据（用于知识点详情展示）
// ============================================================================

export const granularLessons = [
  { id: "gl-1", name: "React 基础入门", description: "React 核心概念与 Hooks 使用", code: "GL-001" },
  { id: "gl-2", name: "TypeScript 实战", description: "TS 类型系统与工程化实践", code: "GL-002" },
  { id: "gl-3", name: "CSS 布局精讲", description: "Flexbox 与 Grid 布局详解", code: "GL-003" },
  { id: "gl-4", name: "RESTful API 设计", description: "API 设计规范与最佳实践", code: "GL-004" },
  { id: "gl-5", name: "数据库设计基础", description: "关系型数据库建模方法", code: "GL-005" },
  { id: "gl-6", name: "Node.js 服务端开发", description: "Node.js 后端服务开发与性能优化", code: "GL-006" },
  { id: "gl-7", name: "Docker 容器化部署", description: "Docker 镜像构建与容器编排", code: "GL-007" },
  { id: "gl-8", name: "Redis 缓存策略", description: "Redis 数据结构与缓存设计模式", code: "GL-008" },
  { id: "gl-9", name: "Git 工作流与协作", description: "Git 分支策略与团队协作规范", code: "GL-009" },
  { id: "gl-10", name: "前端安全攻防", description: "XSS、CSRF 等常见漏洞原理与防御", code: "GL-010" },
  { id: "gl-11", name: "JWT 认证实战", description: "JSON Web Token 原理与工程实践", code: "GL-011" },
  { id: "gl-12", name: "React 性能优化", description: "渲染优化、代码分割、懒加载策略", code: "GL-012" },
  { id: "gl-13", name: "前端工程化配置", description: "Webpack/Vite 配置与构建优化", code: "GL-013" },
  { id: "gl-14", name: "HTTP 协议深度解析", description: "请求方法、状态码、缓存机制", code: "GL-014" },
  { id: "gl-15", name: "SQL 查询优化", description: "索引原理、查询计划分析与优化", code: "GL-015" },
]

// ============================================================================
// 四种测评类型的模拟任务数据
// ============================================================================

export const simulatedTasksMap: Record<string, SimulatedTask> = {
  "sim-paper": {
    id: "sim-paper",
    name: "项目初始化与架构搭建 — 期中测验",
    description: "使用 React + TypeScript 技术栈搭建项目基础架构，配置开发环境和工具链。",
    detailedDescription: `你需要完成企业级前端项目初始化与架构搭建。该任务基于 React + TypeScript 技术栈，要求你从零开始搭建规范的项目基础框架。

任务目标

· 核心目标：搭建一个符合企业规范的前端项目基础架构
· 目标一：完成项目脚手架初始化与目录结构设计
· 目标二：配置 TypeScript、ESLint、Prettier 等开发环境
· 目标三：集成路由、状态管理和 UI 组件库
· 成功标准：项目能正常启动运行，目录结构清晰规范

测评要求

· 准确性(30%)：配置正确无误，项目可正常运行
· 完整性(25%)：覆盖所有技术栈配置要求
· 清晰度(20%)：目录结构清晰，文档表达简洁
· 实用性(15%)：工程化方案可复用，易于维护
· 规范性(10%)：代码规范，术语统一，无明显错误`,
    scenarioName: "企业级前端项目开发实战",
    scenarioId: "scenario-1",
    assessmentForm: "paper",
    difficulty: 3,
    estimatedHours: 2,
    background: "在现代企业开发中，规范的项目初始化是保证代码质量的第一步。本项目要求学员掌握 React 生态的核心技术栈，能够独立搭建可维护、可扩展的企业级前端项目架构。",
    taskType: "assessment",
    knowledgePoints: [
      { id: "kp-1", name: "React Hooks", description: "React 函数组件中的状态和副作用管理，包括 useState、useEffect、useContext、useReducer 等核心 Hook 的使用原理与最佳实践", category: "前端开发", code: "KP-001", granularLessons: ["gl-1", "gl-12"] },
      { id: "kp-2", name: "TypeScript 基础", description: "TypeScript 类型系统和基本语法，包括接口、泛型、类型推断、类型守卫等核心概念", category: "前端开发", code: "KP-002", granularLessons: ["gl-2", "gl-13"] },
      { id: "kp-3", name: "CSS Flexbox 与 Grid", description: "CSS 现代布局技术，包括 Flexbox 一维布局和 Grid 二维布局的原理、属性及响应式设计实践", category: "前端开发", code: "KP-003", granularLessons: ["gl-3"] },
      { id: "kp-7", name: "Git 版本控制", description: "Git 分支管理和协作开发，包括分支策略、代码审查、冲突解决和版本发布流程", category: "工具", code: "KP-007", granularLessons: ["gl-9"] },
      { id: "kp-13", name: "前端工程化", description: "前端构建工具链配置与优化，包括 Webpack/Vite 配置、Babel 转译、代码规范工具集成", category: "前端开发", code: "KP-013", granularLessons: ["gl-13", "gl-2"] },
      { id: "kp-14", name: "React 组件设计", description: "React 组件的拆分原则、通信方式、复用模式，以及高阶组件和自定义 Hooks 的设计方法", category: "前端开发", code: "KP-014", granularLessons: ["gl-1", "gl-12"] },
    ],
    abilityPoints: [
      { id: "ab-1", name: "组件封装能力", description: "能够将业务逻辑封装为可复用的组件", category: "开发能力", domain: "前端工程化", proficiencyDesc: "L1:能使用现有组件; L2:能修改组件适配需求; L3:能独立封装通用组件; L4:能设计组件库架构; L5:能制定团队组件规范", code: "AB-001", requiredLevel: "精通" },
      { id: "ab-2", name: "状态管理能力", description: "合理使用状态管理方案管理应用数据", category: "开发能力", domain: "前端工程化", proficiencyDesc: "L1:了解useState/useReducer; L2:能使用Context; L3:能使用Redux/Zustand; L4:能设计状态架构; L5:能优化大规模状态性能", code: "AB-002", requiredLevel: "熟练" },
      { id: "ab-11", name: "CSS 样式开发能力", description: "掌握现代 CSS 技术，实现复杂的页面布局和视觉效果", category: "开发能力", domain: "前端工程化", proficiencyDesc: "L1:能写基础样式; L2:能使用Flexbox/Grid; L3:能实现响应式布局; L4:能优化样式性能; L5:能设计CSS架构", code: "AB-011", requiredLevel: "熟练" },
      { id: "ab-12", name: "前端构建工具配置", description: "配置和优化前端工程化工具链", category: "开发能力", domain: "前端工程化", proficiencyDesc: "L1:能使用现成脚手架; L2:能配置Webpack/Vite; L3:能优化构建配置; L4:能定制构建流程; L5:能设计工程化体系", code: "AB-012", requiredLevel: "掌握" },
      { id: "ab-7", name: "团队协作能力", description: "有效沟通、代码审查、文档编写", category: "软技能", domain: "职业素养", proficiencyDesc: "L1:能完成分配任务; L2:能主动沟通问题; L3:能进行代码审查; L4:能指导初级成员; L5:能推动团队协作文化", code: "AB-007", requiredLevel: "理解" },
    ],
    resources: [
      { id: "lr-1", name: "React 官方文档", type: "link", description: "React 框架官方中文文档，包含完整 API 参考和最佳实践指南", url: "https://react.dev" },
      { id: "lr-2", name: "TypeScript 入门教程.pdf", type: "document", description: "TypeScript 从入门到精通，涵盖类型系统、泛型和工程化实践", url: "/files/ts-guide.pdf", size: "2.3MB" },
      { id: "lr-7", name: "Git 协作开发指南", type: "document", description: "团队 Git 工作流最佳实践，包含 Git Flow 和 Trunk-based 开发模式", url: "/files/git-guide.pdf", size: "3.1MB" },
      { id: "lr-13", name: "前端开发工具包.zip", type: "archive", description: "包含常用前端工具、脚手架和配置文件，开箱即用", url: "/files/frontend-toolkit.zip", size: "45MB" },
      { id: "lr-14", name: "VS Code 开发环境", type: "tool", description: "推荐使用的代码编辑器及插件配置说明，提升开发效率", url: "https://code.visualstudio.com" },
      { id: "lr-24", name: "React 18 新特性视频教程", type: "video", description: "深入讲解 React 18 并发特性和自动批处理，含实战案例", url: "/videos/react18-features.mp4", size: "230MB" },
      { id: "lr-26", name: "ESLint + Prettier 配置模板", type: "document", description: "企业级代码规范配置文件，支持 React + TypeScript 项目", url: "/files/eslint-config.zip", size: "0.5MB" },
      { id: "lr-27", name: "前端性能优化手册", type: "document", description: "Web 性能优化最佳实践，涵盖加载优化、渲染优化和缓存策略", url: "/files/performance-guide.pdf", size: "4.2MB" },
    ],
    paperConfig: {
      duration: 60,
      passScore: 60,
      allowRetake: false,
      shuffleQuestions: true,
    },
  },
  "sim-question-bank": {
    id: "sim-question-bank",
    name: "API 设计规范学习 — 知识自测",
    description: "学习 RESTful API 设计原则和规范，通过题库抽题方式进行自测。",
    detailedDescription: `你需要完成 RESTful API 设计规范的学习与实践。该任务基于后端服务开发场景，要求你掌握 API 设计原则并完成一套接口设计文档。

任务目标

· 核心目标：掌握 RESTful API 设计规范并完成接口设计
· 目标一：学习 HTTP 方法、状态码、资源命名等核心规范
· 目标二：完成用户管理模块的 API 接口设计文档
· 目标三：掌握 API 版本控制、分页、错误处理等最佳实践
· 成功标准：接口设计符合 RESTful 规范，文档清晰完整

测评要求

· 准确性(30%)：接口设计符合 RESTful 规范，URI 命名合理
· 完整性(25%)：覆盖 CRUD 操作及错误处理场景
· 清晰度(20%)：文档结构清晰，参数说明完整
· 实用性(15%)：接口设计可落地，易于前后端对接
· 规范性(10%)：符合文档规范，术语统一，无明显错误`,
    scenarioName: "RESTful API 设计与开发",
    scenarioId: "scenario-2",
    assessmentForm: "question_bank",
    difficulty: 2,
    estimatedHours: 1,
    background: "RESTful API 是现代 Web 服务的标准接口规范。本任务帮助学员掌握 API 设计原则和最佳实践，能够设计出清晰、规范、易于维护的接口。",
    taskType: "training",
    knowledgePoints: [
      { id: "kp-4", name: "RESTful API", description: "REST 风格的 API 设计原则，包括资源命名、HTTP 方法语义、状态码规范和 HATEOAS 架构", category: "后端开发", code: "KP-004", granularLessons: ["gl-4", "gl-14"] },
      { id: "kp-5", name: "数据库设计", description: "关系型数据库表结构设计，包括范式理论、索引优化、事务管理和连接查询优化", category: "后端开发", code: "KP-005", granularLessons: ["gl-5", "gl-15"] },
      { id: "kp-15", name: "HTTP 协议", description: "HTTP/HTTPS 协议原理，包括请求响应模型、头部字段、缓存机制和 Cookie/Session 工作原理", category: "后端开发", code: "KP-015", granularLessons: ["gl-14", "gl-4"] },
      { id: "kp-16", name: "SQL 语言", description: "结构化查询语言，包括 DDL/DML/DQL 语句、聚合函数、子查询和存储过程", category: "后端开发", code: "KP-016", granularLessons: ["gl-5", "gl-15"] },
      { id: "kp-17", name: "API 版本控制", description: "RESTful API 版本控制策略，包括 URL 路径版本、请求头版本和 Content Negotiation", category: "后端开发", code: "KP-017", granularLessons: ["gl-4"] },
      { id: "kp-18", name: "接口文档规范", description: "OpenAPI/Swagger 规范，包括路径定义、参数说明、响应模型和示例编写", category: "后端开发", code: "KP-018", granularLessons: ["gl-4", "gl-14"] },
    ],
    abilityPoints: [
      { id: "ab-3", name: "接口设计能力", description: "设计清晰、规范的 API 接口", category: "设计能力", domain: "系统设计", proficiencyDesc: "L1:能调用现成接口; L2:能编写简单CRUD; L3:能设计RESTful接口; L4:能设计版本兼容策略; L5:能设计高并发接口架构", code: "AB-003", requiredLevel: "精通" },
      { id: "ab-4", name: "数据库建模能力", description: "设计高效、规范的数据库表结构", category: "设计能力", domain: "系统设计", proficiencyDesc: "L1:能写基本SQL; L2:能设计单表结构; L3:能设计多表关联; L4:能优化查询性能; L5:能设计分库分表方案", code: "AB-004", requiredLevel: "熟练" },
      { id: "ab-13", name: "服务端开发能力", description: "使用 Node.js 或其他服务端技术开发后端服务", category: "开发能力", domain: "服务端开发", proficiencyDesc: "L1:能写简单脚本; L2:能开发基础API; L3:能设计服务架构; L4:能优化服务性能; L5:能设计微服务架构", code: "AB-013", requiredLevel: "熟练" },
      { id: "ab-14", name: "DevOps 运维能力", description: "掌握持续集成、持续部署和容器化技术", category: "工程能力", domain: "运维部署", proficiencyDesc: "L1:了解CI/CD概念; L2:能使用GitHub Actions; L3:能配置Docker; L4:能搭建K8s集群; L5:能设计DevOps体系", code: "AB-014", requiredLevel: "理解" },
    ],
    resources: [
      { id: "lr-4", name: "API 设计规范文档.docx", type: "document", description: "RESTful API 设计最佳实践，含 Google/Microsoft API 设计指南翻译", url: "/files/api-spec.docx", size: "1.2MB" },
      { id: "lr-21", name: "Postman API 测试工具", type: "tool", description: "API 接口测试与协作平台，支持自动化测试和团队协作", url: "https://www.postman.com" },
      { id: "lr-5", name: "数据库建模工具", type: "tool", description: "在线数据库设计工具，支持 ER 图绘制和 SQL 导出", url: "https://dbdiagram.io" },
      { id: "lr-19", name: "微服务架构讲解", type: "audio", description: "微服务架构设计原则讲解录音，含拆分策略和通信方式", url: "/audio/microservices.mp3", size: "28MB" },
      { id: "lr-28", name: "HTTP 协议图解.pdf", type: "document", description: "图解 HTTP 协议完整知识体系，从入门到进阶", url: "/files/http-guide.pdf", size: "8.5MB" },
      { id: "lr-29", name: "Swagger UI 演示", type: "link", description: "OpenAPI 规范在线编辑器，可实时预览接口文档", url: "https://editor.swagger.io" },
      { id: "lr-30", name: "SQL 练习平台", type: "tool", description: "在线 SQL 练习和面试题平台，支持多种数据库方言", url: "https://sqlbolt.com" },
      { id: "lr-31", name: "API 设计案例分析", type: "video", description: "GitHub API、Stripe API 等优秀接口设计案例深度解析", url: "/videos/api-case-study.mp4", size: "180MB" },
    ],
    questionBankConfig: {
      duration: 45,
      questionCount: 10,
      totalScore: 100,
    },
  },
  "sim-random-draw": {
    id: "sim-random-draw",
    name: "React 核心技术 — 现场问答",
    description: "教师将从题库中随机抽取题目进行现场提问，考察学生对 React 核心概念的理解深度。",
    detailedDescription: `本环节为现场问答测评，由教师从题库中随机抽取题目进行口头提问。主要考察以下方面：

考察重点

· React 核心概念与生命周期理解
· 状态管理方案的选择与使用
· 性能优化的思路与方法
· 前端工程化实践经验
· 问题分析与表达能力

注意事项

1. 请提前复习相关知识点，做好准备
2. 回答时请条理清晰，分点阐述
3. 遇到追问时请保持冷静，灵活应对
4. 测评主体：指导教师`,
    scenarioName: "企业级前端项目开发实战",
    scenarioId: "scenario-1",
    assessmentForm: "random_draw",
    difficulty: 4,
    estimatedHours: 1,
    background: "现场问答是检验学生理论掌握和表达能力的重要方式。通过随机抽题和口头回答，全面考察学生对 React 核心技术的理解深度。",
    taskType: "assessment",
    knowledgePoints: [
      { id: "kp-1", name: "React Hooks", description: "React 函数组件中的状态和副作用管理，包括 useState、useEffect、useContext、useReducer 等核心 Hook 的使用原理与最佳实践", category: "前端开发", code: "KP-001", granularLessons: ["gl-1", "gl-12"] },
      { id: "kp-3", name: "CSS Flexbox 与 Grid", description: "CSS 现代布局技术，包括 Flexbox 一维布局和 Grid 二维布局的原理、属性及响应式设计实践", category: "前端开发", code: "KP-003", granularLessons: ["gl-3"] },
      { id: "kp-12", name: "React 性能优化", description: "React 应用性能优化策略，包括渲染优化、代码分割、懒加载、虚拟列表和状态管理优化", category: "前端开发", code: "KP-012", granularLessons: ["gl-12", "gl-1"] },
      { id: "kp-13", name: "前端工程化", description: "前端构建工具链配置与优化，包括 Webpack/Vite 配置、Babel 转译、代码规范工具集成", category: "前端开发", code: "KP-013", granularLessons: ["gl-13", "gl-2"] },
      { id: "kp-19", name: "React 设计模式", description: "React 常用设计模式，包括组合模式、 render props、高阶组件、自定义 Hooks 和 Compound Components", category: "前端开发", code: "KP-019", granularLessons: ["gl-1", "gl-12"] },
      { id: "kp-20", name: "前端安全", description: "前端安全攻防知识，包括 XSS、CSRF、点击劫持、CSP 内容安全策略和 HTTPS 原理", category: "安全", code: "KP-020", granularLessons: ["gl-10", "gl-14"] },
    ],
    abilityPoints: [
      { id: "ab-1", name: "组件封装能力", description: "能够将业务逻辑封装为可复用的组件", category: "开发能力", domain: "前端工程化", proficiencyDesc: "L1:能使用现有组件; L2:能修改组件适配需求; L3:能独立封装通用组件; L4:能设计组件库架构; L5:能制定团队组件规范", code: "AB-001", requiredLevel: "精通" },
      { id: "ab-9", name: "问题排查能力", description: "定位和解决技术问题的能力", category: "开发能力", domain: "质量保障", proficiencyDesc: "L1:能根据报错搜索; L2:能使用调试工具; L3:能分析复杂链路; L4:能处理线上故障; L5:能设计容灾方案", code: "AB-009", requiredLevel: "掌握" },
      { id: "ab-6", name: "性能优化能力", description: "识别性能瓶颈并进行优化", category: "优化能力", domain: "质量保障", proficiencyDesc: "L1:能使用性能分析工具; L2:能优化渲染性能; L3:能优化网络请求; L4:能优化构建体积; L5:能设计性能监控体系", code: "AB-006", requiredLevel: "掌握" },
      { id: "ab-15", name: "数据可视化能力", description: "使用图表库实现数据的可视化展示", category: "分析能力", domain: "数据分析", proficiencyDesc: "L1:能使用基础图表; L2:能配置ECharts/D3; L3:能设计可视化方案; L4:能开发交互式大屏; L5:能设计可视化规范", code: "AB-015", requiredLevel: "掌握" },
      { id: "ab-7", name: "团队协作能力", description: "有效沟通、代码审查、文档编写", category: "软技能", domain: "职业素养", proficiencyDesc: "L1:能完成分配任务; L2:能主动沟通问题; L3:能进行代码审查; L4:能指导初级成员; L5:能推动团队协作文化", code: "AB-007", requiredLevel: "理解" },
    ],
    resources: [
      { id: "lr-1", name: "React 官方文档", type: "link", description: "React 框架官方中文文档，包含完整 API 参考和最佳实践指南", url: "https://react.dev" },
      { id: "lr-3", name: "CSS 布局实战视频", type: "video", description: "CSS Flexbox 和 Grid 布局详解，含大量实战案例演示", url: "/videos/css-layout.mp4", size: "156MB" },
      { id: "lr-12", name: "项目需求讲解音频", type: "audio", description: "企业导师对项目需求的详细讲解录音，帮助理解业务背景", url: "/audio/requirements.mp3", size: "12MB" },
      { id: "lr-18", name: "代码审查清单", type: "document", description: "团队代码审查标准检查清单，覆盖代码质量、安全性和性能", url: "/files/code-review.pdf", size: "0.6MB" },
      { id: "lr-24", name: "React 18 新特性视频教程", type: "video", description: "深入讲解 React 18 并发特性和自动批处理，含实战案例", url: "/videos/react18-features.mp4", size: "230MB" },
      { id: "lr-32", name: "前端面试题集锦", type: "document", description: "React 核心技术面试题合集，含详细答案和解析", url: "/files/react-interview.pdf", size: "3.8MB" },
    ],
    evalPoints: [
      { id: "rep-1", name: "理论知识掌握程度", desc: "对前端框架核心概念、生命周期、状态管理等理论知识的理解深度", weight: 40, maxScore: 40 },
      { id: "rep-2", name: "问题分析思路", desc: "面对技术问题时能否条理清晰地分析原因、提出解决方案", weight: 30, maxScore: 30 },
      { id: "rep-3", name: "表达与沟通能力", desc: "回答是否逻辑清晰、表达流畅、能够准确传达技术观点", weight: 20, maxScore: 20 },
      { id: "rep-4", name: "临场应变能力", desc: "面对追问或意外问题时能否沉着应对、灵活调整", weight: 10, maxScore: 10 },
    ],
  },
  "sim-review": {
    id: "sim-review",
    name: "用户认证模块开发 — 代码评审",
    description: "实现用户登录、注册、权限验证等认证相关功能，提交代码仓库和项目文档，由教师进行多维度评审。",
    detailedDescription: `你需要完成用户认证模块的开发。该任务基于企业级管理后台场景，要求你实现完整的登录注册及权限验证功能。

任务目标

· 核心目标：实现安全可靠的用户认证系统
· 目标一：完成用户登录、注册功能的前端实现
· 目标二：实现 JWT Token 的获取、存储和自动刷新
· 目标三：完成路由级别的权限控制与页面守卫
· 成功标准：认证流程完整，无明显安全漏洞

任务结果

请提交以下内容:

· 主交付物：认证模块源代码
格式要求：React 组件 + 自定义 Hooks，TypeScript 类型完整
· 附属说明：安全策略说明、接口对接文档
篇幅要求：核心代码不少于 200 行

测评要求

· 准确性(30%)：功能正确，认证逻辑清晰可靠
· 完整性(25%)：覆盖登录、注册、登出、权限校验等场景
· 清晰度(20%)：代码结构分明，注释简洁清晰
· 实用性(15%)：方案可落地，易于集成到现有项目
· 规范性(10%)：符合代码规范，术语统一，无明显错误

一票否决项：若出现明文存储密码、Token 硬编码等安全问题，视为未通过。`,
    scenarioName: "企业级前端项目开发实战",
    scenarioId: "scenario-1",
    assessmentForm: "review",
    difficulty: 4,
    estimatedHours: 12,
    background: "用户认证是企业级应用的基础安全保障。本任务要求学员从零实现完整的认证系统，涵盖登录、注册、权限控制和安全性设计。",
    taskType: "assessment",
    knowledgePoints: [
      { id: "kp-6", name: "JWT 认证", description: "JSON Web Token 身份验证机制，包括 Token 生成、验证、刷新和安全性最佳实践", category: "安全", code: "KP-006", granularLessons: ["gl-11", "gl-10"] },
      { id: "kp-1", name: "React Hooks", description: "React 函数组件中的状态和副作用管理，包括 useState、useEffect、useContext、useReducer 等核心 Hook 的使用原理与最佳实践", category: "前端开发", code: "KP-001", granularLessons: ["gl-1", "gl-12"] },
      { id: "kp-20", name: "前端安全", description: "前端安全攻防知识，包括 XSS、CSRF、点击劫持、CSP 内容安全策略和 HTTPS 原理", category: "安全", code: "KP-020", granularLessons: ["gl-10", "gl-14"] },
      { id: "kp-21", name: "前端路由", description: "React Router 等前端路由库的使用，包括动态路由、路由守卫、懒加载和权限控制", category: "前端开发", code: "KP-021", granularLessons: ["gl-1", "gl-13"] },
      { id: "kp-22", name: "表单验证", description: "前端表单验证方案，包括同步验证、异步验证、自定义验证规则和错误提示设计", category: "前端开发", code: "KP-022", granularLessons: ["gl-1", "gl-2"] },
      { id: "kp-23", name: "LocalStorage/SessionStorage", description: "浏览器本地存储技术，包括存储容量、生命周期、安全性考虑和最佳实践", category: "前端开发", code: "KP-023", granularLessons: ["gl-1", "gl-11"] },
    ],
    abilityPoints: [
      { id: "ab-5", name: "安全编码能力", description: "编写安全的代码，防范常见安全漏洞", category: "开发能力", domain: "质量保障", proficiencyDesc: "L1:了解常见漏洞概念; L2:能避免XSS/SQL注入; L3:能实施认证授权; L4:能进行安全审计; L5:能设计安全架构", code: "AB-005", requiredLevel: "理解" },
      { id: "ab-7", name: "团队协作能力", description: "有效沟通、代码审查、文档编写", category: "软技能", domain: "职业素养", proficiencyDesc: "L1:能完成分配任务; L2:能主动沟通问题; L3:能进行代码审查; L4:能指导初级成员; L5:能推动团队协作文化", code: "AB-007", requiredLevel: "理解" },
      { id: "ab-9", name: "问题排查能力", description: "定位和解决技术问题的能力", category: "开发能力", domain: "质量保障", proficiencyDesc: "L1:能根据报错搜索; L2:能使用调试工具; L3:能分析复杂链路; L4:能处理线上故障; L5:能设计容灾方案", code: "AB-009", requiredLevel: "掌握" },
      { id: "ab-2", name: "状态管理能力", description: "合理使用状态管理方案管理应用数据", category: "开发能力", domain: "前端工程化", proficiencyDesc: "L1:了解useState/useReducer; L2:能使用Context; L3:能使用Redux/Zustand; L4:能设计状态架构; L5:能优化大规模状态性能", code: "AB-002", requiredLevel: "熟练" },
      { id: "ab-10", name: "项目管理能力", description: "规划、跟踪和交付项目任务", category: "软技能", domain: "职业素养", proficiencyDesc: "L1:能管理个人任务; L2:能协助跟踪进度; L3:能主导小型项目; L4:能管理跨团队项目; L5:能制定项目管理规范", code: "AB-010", requiredLevel: "理解" },
    ],
    resources: [
      { id: "lr-6", name: "JWT 认证流程图.png", type: "image", description: "JWT 认证工作流程图解，直观展示 Token 签发和验证流程", url: "/images/jwt-flow.png", size: "0.5MB" },
      { id: "lr-18", name: "代码审查清单", type: "document", description: "团队代码审查标准检查清单，覆盖代码质量、安全性和性能", url: "/files/code-review.pdf", size: "0.6MB" },
      { id: "lr-14", name: "VS Code 开发环境", type: "tool", description: "推荐使用的代码编辑器及插件配置说明，提升开发效率", url: "https://code.visualstudio.com" },
      { id: "lr-33", name: "OWASP 前端安全指南", type: "document", description: "OWASP 前端安全最佳实践，覆盖 Top 10 安全风险和防御方案", url: "/files/owasp-frontend.pdf", size: "6.2MB" },
      { id: "lr-34", name: "React Router 官方文档", type: "link", description: "React Router v6 完整文档，包含路由守卫和懒加载指南", url: "https://reactrouter.com" },
      { id: "lr-35", name: "前端表单验证实战", type: "video", description: "React Hook Form + Zod 表单验证实战教程", url: "/videos/form-validation.mp4", size: "95MB" },
      { id: "lr-36", name: "用户认证最佳实践", type: "document", description: "现代 Web 应用用户认证方案对比与选型指南", url: "/files/auth-best-practice.pdf", size: "2.1MB" },
      { id: "lr-37", name: "GitHub 代码仓库模板", type: "archive", description: "企业级 React 项目代码仓库模板，含完整目录结构和配置文件", url: "/files/react-project-template.zip", size: "12MB" },
    ],
    reviewConfig: {
      materialTypes: ["项目报告", "代码仓库", "设计文档"],
      deadlineDays: 7,
      allowResubmit: true,
    },
    evalPoints: [
      { id: "rev-1", name: "代码规范性", desc: "代码结构清晰、命名规范、注释完整，符合团队编码规范", weight: 25, maxScore: 25 },
      { id: "rev-2", name: "功能实现完整性", desc: "登录、注册、权限验证等核心功能是否完整实现，边界场景是否考虑", weight: 30, maxScore: 30 },
      { id: "rev-3", name: "安全设计意识", desc: "密码加密、XSS 防护、CSRF 防护、Token 安全等安全措施是否到位", weight: 25, maxScore: 25 },
      { id: "rev-4", name: "方案可维护性", desc: "代码是否易于扩展和维护，错误处理是否完善，日志是否规范", weight: 20, maxScore: 20 },
    ],
  },
}

// ============================================================================
// 试卷题目（固定试卷）
// ============================================================================

export const paperQuestions: ExamQuestion[] = [
  { id: "pq-1", name: "React 18 并发特性", type: "single", content: "React 18 中引入的并发特性主要解决什么问题？", options: ["性能优化", "代码复用", "状态管理", "路由控制"], correctAnswer: "性能优化", score: 5 },
  { id: "pq-2", name: "TypeScript 基础判断", type: "judgment", content: "TypeScript 是 JavaScript 的超集", correctAnswer: "true", score: 5 },
  { id: "pq-3", name: "React 状态管理方案", type: "multiple", content: "以下哪些是常用的 React 状态管理方案？", options: ["Redux", "MobX", "Zustand", "jQuery"], correctAnswer: ["Redux", "MobX", "Zustand"], score: 5 },
  { id: "pq-4", name: "CSS 盒模型", type: "single", content: "在 CSS 标准盒模型中，元素的宽度(width)包含哪些部分？", options: ["仅内容宽度", "内容+内边距", "内容+内边距+边框", "内容+内边距+边框+外边距"], correctAnswer: "仅内容宽度", score: 5 },
  { id: "pq-5", name: "JS 事件循环", type: "single", content: "JavaScript 中，setTimeout 的回调函数会在哪个阶段执行？", options: ["同步执行", "宏任务队列", "微任务队列", "渲染阶段"], correctAnswer: "宏任务队列", score: 5 },
  { id: "pq-6", name: "Promise 基础", type: "judgment", content: "Promise.resolve(1).then(v => console.log(v)) 会立即同步输出 1", correctAnswer: "false", score: 5 },
  { id: "pq-7", name: "HTTP 缓存策略", type: "multiple", content: "以下哪些 HTTP 头部与缓存控制有关？", options: ["Cache-Control", "Expires", "Content-Type", "ETag"], correctAnswer: ["Cache-Control", "Expires", "ETag"], score: 5 },
  { id: "pq-8", name: "React Hooks 规则", type: "single", content: "以下关于 React Hooks 的使用规则，哪项是正确的？", options: ["可以在循环中调用 useState", "可以在条件语句中调用 useEffect", "只能在函数组件顶层调用", "可以在普通函数中调用 useContext"], correctAnswer: "只能在函数组件顶层调用", score: 5 },
  { id: "pq-9", name: "Git 工作流", type: "judgment", content: "git rebase 操作会改写提交历史", correctAnswer: "true", score: 5 },
  { id: "pq-10", name: "前端安全", type: "multiple", content: "以下哪些属于常见的前端安全漏洞？", options: ["XSS", "CSRF", "SQL 注入", "点击劫持"], correctAnswer: ["XSS", "CSRF", "点击劫持"], score: 5 },
  { id: "pq-11", name: "前端性能优化", type: "text", content: "请简述 React 中常用的性能优化方法，至少列举 3 种并说明适用场景。", score: 10 },
  { id: "pq-12", name: "前端工程化实践", type: "text", content: "请结合实际项目经验，阐述前端工程化的核心目标和常用工具链。", score: 10 },
]

// ============================================================================
// 题库题目（题库抽题）
// ============================================================================

export const questionBankQuestions: ExamQuestion[] = [
  { id: "qb-1", name: "HTTP 方法语义", type: "single", content: "RESTful 设计中，PUT 方法的主要语义是什么？", options: ["创建资源", "更新资源", "删除资源", "查询资源"], correctAnswer: "更新资源", score: 10 },
  { id: "qb-2", name: "状态码 401 含义", type: "judgment", content: "HTTP 状态码 401 表示请求参数格式错误", correctAnswer: "false", score: 10 },
  { id: "qb-3", name: "幂等性方法", type: "multiple", content: "以下哪些 HTTP 方法具有幂等性？", options: ["GET", "POST", "PUT", "PATCH"], correctAnswer: ["GET", "PUT"], score: 10 },
  { id: "qb-4", name: "JWT 结构", type: "single", content: "JWT (JSON Web Token) 由哪三部分组成？", options: ["Header.Payload.Signature", "Key.Value.Secret", "Auth.Token.Session", "ID.Data.Hash"], correctAnswer: "Header.Payload.Signature", score: 10 },
  { id: "qb-5", name: "SQL 注入", type: "judgment", content: "使用参数化查询可以有效防止 SQL 注入攻击", correctAnswer: "true", score: 10 },
  { id: "qb-6", name: "数据库事务", type: "multiple", content: "数据库事务的 ACID 特性包括哪些？", options: ["原子性", "一致性", "隔离性", "持久性"], correctAnswer: ["原子性", "一致性", "隔离性", "持久性"], score: 10 },
  { id: "qb-7", name: "OAuth2 角色", type: "single", content: "在 OAuth2.0 授权框架中，负责颁发访问令牌的是？", options: ["资源所有者", "客户端", "授权服务器", "资源服务器"], correctAnswer: "授权服务器", score: 10 },
  { id: "qb-8", name: "索引优化", type: "judgment", content: "数据库表中索引越多越好，不会影响写入性能", correctAnswer: "false", score: 10 },
  { id: "qb-9", name: "API 设计", type: "text", content: "请阐述 RESTful API 设计的核心原则，并结合实例说明 URI 命名规范。", score: 10 },
  { id: "qb-10", name: "微服务通信", type: "text", content: "微服务架构中常见的服务间通信方式有哪些？各自的适用场景是什么？", score: 10 },
]

// ============================================================================
// 现场问答抽题
// ============================================================================

export const randomDrawQuestions = [
  {
    questionId: "rd-1",
    questionName: "React 生命周期理解",
    questionContent: "请简述 React 类组件的生命周期方法及其执行顺序，并说明在函数组件中如何替代这些生命周期方法。",
    questionType: "subjective",
    correctAnswer: "React 类组件生命周期分为三个阶段：挂载阶段（constructor → render → componentDidMount）、更新阶段（shouldComponentUpdate → render → componentDidUpdate）、卸载阶段（componentWillUnmount）。在函数组件中，使用 useEffect Hook 来替代生命周期方法。",
  },
  {
    questionId: "rd-2",
    questionName: "前端性能优化",
    questionContent: "请列举至少 5 种前端性能优化的方法，并说明适用场景。",
    questionType: "subjective",
    correctAnswer: "1. 代码分割（Code Splitting）：使用动态 import 或 React.lazy 按需加载模块；2. 图片优化：使用 WebP 格式、懒加载；3. 缓存策略：合理设置 HTTP 缓存头；4. 减少重排重绘：避免频繁操作 DOM；5. 资源预加载：使用 preload、prefetch 预加载关键资源。",
  },
  {
    questionId: "rd-3",
    questionName: "状态管理方案对比",
    questionContent: "对比 Redux、MobX、Zustand 三种状态管理方案的特点和适用场景。",
    questionType: "subjective",
    correctAnswer: "Redux：单向数据流、可预测的状态更新、适合大型应用；MobX：响应式编程、自动追踪依赖、适合中小型应用；Zustand：轻量级、无样板代码、API 简洁、适合现代 React 应用。",
  },
]
