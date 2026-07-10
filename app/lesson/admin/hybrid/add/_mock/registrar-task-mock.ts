import type { TaskPrepContent, TaskResource, TaskEvaluationConfig } from "../_types/registrar-adapted"

export const MOCK_PREP_CONTENT: TaskPrepContent = {
  pre: {
    objectives: `1. 了解 Web 前端开发的基本概念与岗位能力要求
2. 掌握 HTML、CSS、JavaScript 的基础语法
3. 能够使用 Vue 框架完成简单的组件开发`,
    guidePlan: `一、课前导学
1. 观看《Web 前端开发概述》微课
2. 阅读电子讲义《前端技术栈简介》
3. 完成课前预习测验

二、课中重点
1. HTML 语义化标签
2. CSS 盒模型与选择器
3. JavaScript DOM 操作

三、课后巩固
1. 完成个人主页布局作业
2. 参与讨论区答疑`,
    previewQuestions: [
      "什么是 HTML 语义化？为什么要使用语义化标签？",
      "CSS 选择器有哪些优先级规则？",
      "JavaScript 中 var、let、const 的区别是什么？",
    ],
  },
  in: {
    coursewareResources: [
      {
        id: "r-1",
        taskId: "task-001",
        name: "Web前端开发-第1章课件.pptx",
        type: "ppt",
        isVisibleToStudents: true,
        uploadBy: "周老师",
        uploadedAt: "2026-09-01",
        sortOrder: 1,
      },
      {
        id: "r-2",
        taskId: "task-001",
        name: "HTML5 新特性讲解视频.mp4",
        type: "video",
        isVisibleToStudents: true,
        uploadBy: "周老师",
        uploadedAt: "2026-09-02",
        sortOrder: 2,
      },
      {
        id: "r-3",
        taskId: "task-001",
        name: "CSS 布局实战案例.zip",
        type: "document",
        isVisibleToStudents: false,
        uploadBy: "周老师",
        uploadedAt: "2026-09-03",
        sortOrder: 3,
      },
    ],
    quizQuestions: [
      "下列哪个标签用于定义页面的主要导航链接？",
      "Flexbox 中 justify-content: center 的作用是什么？",
      "JavaScript 中如何阻止事件冒泡？",
    ],
    discussionTopics: [
      "响应式布局在实际项目中的应用",
      "前端组件化开发的优缺点讨论",
    ],
  },
  post: {
    homework: `完成《个人主页布局作业》：
1. 使用 HTML + CSS 实现一个个人主页
2. 要求包含头部、导航、内容区、底部
3. 使用 Flexbox 或 Grid 完成布局
4. 提交截止日期：2026-09-10`,
    quizQuestions: [
      "HTML5 新增的表单类型有哪些？",
      "CSS 中 position 属性有哪些取值？",
      "Vue 中 v-if 和 v-show 的区别是什么？",
    ],
    extensionResources: [
      "MDN Web Docs 前端入门教程",
      "Vue 官方文档",
      "前端工程化实践指南",
    ],
  },
}

export const MOCK_RESOURCES: TaskResource[] = [
  {
    id: "res-1",
    taskId: "task-001",
    name: "Web前端开发-课程大纲.pdf",
    type: "document",
    isVisibleToStudents: true,
    uploadBy: "周老师",
    uploadedAt: "2026-08-25",
    sortOrder: 1,
  },
  {
    id: "res-2",
    taskId: "task-001",
    name: "前端开发环境搭建指南.docx",
    type: "document",
    isVisibleToStudents: true,
    uploadBy: "周老师",
    uploadedAt: "2026-08-26",
    sortOrder: 2,
  },
  {
    id: "res-3",
    taskId: "task-001",
    name: "Vue3 快速上手视频.mp4",
    type: "video",
    isVisibleToStudents: true,
    uploadBy: "周老师",
    uploadedAt: "2026-08-28",
    sortOrder: 3,
  },
]

export const MOCK_EVALUATION_CONFIG: TaskEvaluationConfig = {
  enabledMethods: ["random_draw", "question_bank", "quiz", "homework"],
  randomDrawQuestions: [
    { id: "rdq-1", name: "简述面向对象的三大特性", description: "请简述封装、继承、多态的概念", answer: "封装：将数据和操作数据的方法绑定在一起...", major: "通用" },
    { id: "rdq-2", name: "Java 异常处理机制", description: "请说明 try-catch-finally 的使用场景", answer: "try 块包含可能抛出异常的代码...", major: "后端开发" },
    { id: "rdq-3", name: "CSS 盒模型组成", description: "请说明 content、padding、border、margin 的关系", answer: "盒模型由内容区、内边距、边框和外边距组成...", major: "前端开发" },
  ],
  reviewSteps: [
    { id: "rs-1", label: "教师评分", desc: "教师根据学生课堂表现评分", enabled: true, subjectType: "teacher", weight: 60 },
    { id: "rs-2", label: "企业导师评分", desc: "企业导师根据实践能力评分", enabled: true, subjectType: "enterprise_mentor", weight: 30 },
    { id: "rs-3", label: "学生自评", desc: "学生对自己的学习过程进行评价", enabled: true, subjectType: "self", weight: 10 },
  ],
  paperConfig: {
    duration: 60,
    allowRetake: false,
    maxRetakeCount: 1,
    shuffleQuestions: true,
    showScoreAfterSubmit: true,
    activationType: "manual",
  },
  questionBankConfig: {
    questionIds: [],
    randomCount: 10,
    difficultyDistribution: "简单40% / 中等40% / 困难20%",
    timeLimit: 30,
    allowRepeat: false,
    shuffleQuestions: true,
    showScoreAfterSubmit: true,
  },
  quizConfig: {
    questionIds: [],
    randomCount: 5,
    difficultyDistribution: "简单50% / 中等30% / 困难20%",
    timeLimit: 15,
    allowRepeat: false,
    shuffleQuestions: true,
    showScoreAfterSubmit: true,
  },
  homeworkMaterial: {
    requiresMaterial: true,
    estimatedDays: 3,
    formatRequirements: "提交源代码压缩包及运行截图",
    allowResubmit: true,
  },
  outcomeMaterial: {
    requiresMaterial: true,
    estimatedDays: 7,
    formatRequirements: "提交项目演示视频及成果说明文档",
    allowResubmit: false,
  },
}
