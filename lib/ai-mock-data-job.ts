// AI 功能演示用 Mock 数据
// 所有 AI 生成功能均返回此文件中的固定数据，用于演示交互流程

export interface AiGeneratedContent {
  content: string
  confidence: "high" | "medium" | "low"
  reasoning?: string
}

// ==========================================
// 功能1：岗位介绍智能生成
// ==========================================
export const mockPositionDescriptionGeneration = (keywords: {
  positionName?: string
  industry?: string
  majors?: string[]
}): AiGeneratedContent => {
  return {
    content: `【岗位概述】

本岗位面向${keywords.industry || "互联网"}行业，负责${keywords.positionName || "软件开发"}相关核心工作。岗位需要具备扎实的专业技术功底，良好的业务理解能力，以及优秀的团队协作精神。

【核心职责】
· 负责业务需求的分析与系统设计
· 完成核心模块的开发、测试与维护
· 参与技术方案评审与架构优化
· 编写技术文档，保障知识传承

【任职要求】
· ${keywords.majors?.[0] || "计算机"}相关专业本科及以上学历
· 具备2年以上相关工作经验
· 熟练掌握主流开发框架与工具链
· 具备良好的沟通能力和学习能力`,
    confidence: "high",
    reasoning: `基于岗位名称「${keywords.positionName || "未命名"}」和行业「${keywords.industry || "未指定"}」，结合适用专业特征生成的标准化岗位描述`,
  }
}

// ==========================================
// 功能2：工作职责智能生成
// ==========================================
export interface AiResponsibility {
  id: string
  name: string
  description: string
}

export const mockPositionResponsibilitiesGeneration = (positionName?: string, industry?: string): AiResponsibility[] => {
  return [
    { id: `ai-resp-1`, name: `负责${positionName || "本岗位"}核心业务模块的设计与开发`, description: "承担核心功能模块的编码、测试及维护工作，确保代码质量" },
    { id: `ai-resp-2`, name: "参与系统架构设计和技术选型决策", description: "参与技术方案评审，协助架构师完成系统设计方案" },
    { id: `ai-resp-3`, name: "编写高质量的技术文档和项目文档", description: "确保文档规范、完整，便于团队协作与知识传承" },
    { id: `ai-resp-4`, name: "进行代码评审，保障团队代码质量", description: "参与团队代码评审活动，发现并指出潜在问题" },
    { id: `ai-resp-5`, name: `解决技术难题，持续优化${industry || "业务"}系统性能`, description: "排查线上问题，进行性能调优和技术债务清理" },
  ]
}

// ==========================================
// 功能3：任职要求智能生成
// ==========================================
export const mockPositionRequirementsGeneration = (positionName?: string): string[] => {
  return [
    "本科及以上学历，计算机或相关专业",
    "2年以上相关领域工作经验",
    "熟练掌握至少一门主流编程语言及对应技术栈",
    "熟悉常见设计模式与架构模式",
    "具备良好的沟通表达能力和团队协作精神",
    "有较强的学习能力和技术钻研精神",
    `有${positionName || "相关岗位"}项目经验者优先`,
  ]
}

// ==========================================
// 功能4：发展路径智能生成
// ==========================================
export const mockPositionCareerPathGeneration = (positionName?: string): string => {
  return '横向发展：技术专家、产品经理、项目经理、技术顾问、解决方案架构师\n纵向晋升：初级工程师 → 中级工程师 → 高级工程师 → 技术主管 → 架构师 → 技术总监'
}

// ==========================================
// 功能5：能力点智能推荐（基于职责）
// ==========================================
export interface AiAbilityRecommendation {
  id: string
  name: string
  category: string
  level: "understand" | "comprehend" | "master" | "proficient" | "expert"
  rubricDescription: string
  confidence: "high" | "medium" | "low"
  reason: string
}

export const mockAbilityRecommendations = (responsibilityName?: string): AiAbilityRecommendation[] => {
  return [
    {
      id: `ai-ab-1`,
      name: "编程开发能力",
      category: "专业技能",
      level: "proficient",
      rubricDescription: "能够独立完成复杂业务模块的编码实现，代码质量达到团队规范要求，熟悉代码重构技巧",
      confidence: "high",
      reason: "核心职责要求具备扎实的编码能力",
    },
    {
      id: `ai-ab-2`,
      name: "系统架构设计",
      category: "专业技能",
      level: "master",
      rubricDescription: "能够进行模块级架构设计，理解并能灵活运用常见设计模式和架构模式",
      confidence: "high",
      reason: "涉及系统架构设计和技术选型决策",
    },
    {
      id: `ai-ab-3`,
      name: "技术文档编写",
      category: "通用能力",
      level: "comprehend",
      rubricDescription: "能够编写清晰、完整的技术文档，表达准确，结构合理",
      confidence: "medium",
      reason: "职责中包含技术文档编写要求",
    },
    {
      id: `ai-ab-4`,
      name: "代码审查能力",
      category: "专业技能",
      level: "master",
      rubricDescription: "能够发现代码中的潜在缺陷和性能问题，提出有效的改进建议",
      confidence: "high",
      reason: "明确涉及代码评审职责",
    },
    {
      id: `ai-ab-5`,
      name: "问题排查与性能优化",
      category: "专业技能",
      level: "proficient",
      rubricDescription: "具备系统性能分析能力，能够定位瓶颈并实施有效优化方案",
      confidence: "medium",
      reason: "职责中包含技术难题解决和性能优化",
    },
  ]
}

// ==========================================
// 功能6：能力领域智能归类建议
// ==========================================
export interface AiDomainClassification {
  domainId: string
  domainName: string
  bindingIds: string[]
  reasoning: string
}

export const mockDomainClassification = (): AiDomainClassification[] => {
  return [
    { domainId: "domain-business", domainName: "业务洞察", bindingIds: [], reasoning: "本岗位偏技术执行，业务洞察类能力占比较低" },
    { domainId: "domain-tools", domainName: "专业工具", bindingIds: ["ai-ab-1", "ai-ab-2", "ai-ab-4", "ai-ab-5"], reasoning: "编程开发、架构设计、代码审查、性能优化均属专业技能范畴" },
    { domainId: "domain-quality", domainName: "通用素质", bindingIds: ["ai-ab-3"], reasoning: "技术文档编写属于通用职业素养" },
    { domainId: "domain-team", domainName: "团队协作", bindingIds: [], reasoning: "可在能力建模阶段补充团队协作类能力点" },
    { domainId: "domain-innovation", domainName: "创新思维", bindingIds: [], reasoning: "可在能力建模阶段补充创新思维类能力点" },
  ]
}

// ==========================================
// 功能7：岗位信息一键生成（AI 辅助完善）
// ==========================================
export interface AiPositionPreview {
  name: string
  shortName: string
  industry: string
  majors: string[]
  salaryRange: [number, number]
  description: string
  responsibilities: AiResponsibility[]
  requirements: string[]
  careerPath: string
  coverImage: string
  certificates: { id: string; name: string; description?: string }[]
}

// WMS 产品经理真实数据
const WMS_PRODUCT_MANAGER: AiPositionPreview = {
  name: "WMS 仓储管理系统产品经理",
  shortName: "WMS产品经理",
  industry: "互联网/IT",
  majors: ["物流管理", "供应链管理", "工业工程", "信息管理与信息系统"],
  salaryRange: [18000, 35000],
  description: `负责 WMS（仓储管理系统）产品的全生命周期管理，包括需求调研、产品规划、功能设计、项目推进及上线迭代。深入理解仓储物流业务场景，结合客户实际业务痛点，设计高效、可落地的仓储管理解决方案。协同技术、实施、运营团队，确保产品功能按时高质量交付，并持续优化产品体验与运营效率。`,
  responsibilities: [
    {
      id: "wms-resp-1",
      name: "WMS 产品需求调研与分析",
      description: "深入仓库现场调研收货、上架、拣货、盘点、出库等全流程业务，收集并梳理客户痛点与业务需求，输出需求调研报告与产品需求文档（PRD）"
    },
    {
      id: "wms-resp-2",
      name: "仓储管理产品功能规划与设计",
      description: "基于业务需求完成 WMS 核心模块（入库管理、库存管理、出库管理、波次管理、任务调度等）的产品功能设计，绘制原型图并撰写详细 PRD"
    },
    {
      id: "wms-resp-3",
      name: "跨部门项目推进与交付管理",
      description: "协调研发、测试、实施、客户成功等多团队资源，制定项目计划，跟踪开发进度，组织需求评审与验收，推动产品功能按期上线"
    },
    {
      id: "wms-resp-4",
      name: "仓储系统集成方案设计",
      description: "负责 WMS 与 ERP、OMS、TMS、自动化设备（AGV、分拣线、电子标签等）的系统对接方案设计，确保数据流转与业务协同"
    },
    {
      id: "wms-resp-5",
      name: "产品数据监控与持续优化",
      description: "建立产品核心指标监控体系（入库效率、拣货准确率、库存周转率等），基于数据分析驱动产品迭代优化"
    }
  ],
  requirements: [
    "本科及以上学历，物流管理、供应链管理、工业工程、信息管理等相关专业优先",
    "3年以上 B 端产品经理经验，有 WMS、OMS、ERP 或供应链相关产品经验者优先",
    "深入理解仓储物流业务，熟悉入库、上架、拣货、盘点、出库等核心作业流程",
    "具备优秀的需求分析能力与逻辑思维能力，能够独立完成复杂业务场景的产品设计",
    "熟练使用 Axure、Figma、Visio 等原型及流程设计工具",
    "具备良好的跨部门沟通协调能力与项目管理能力",
    "有电商仓、第三方物流仓、制造业仓库等项目经验者优先",
    "了解自动化仓储设备（AGV、分拣线、立体库等）者优先"
  ],
  careerPath: '横向发展：供应链产品经理、OMS 产品经理、TMS 产品经理、ERP 产品经理、SaaS 产品专家\n纵向晋升：产品专员 → 产品经理 → 高级产品经理 → 产品负责人 → 产品总监 → VP 产品',
  coverImage: "/cover-wms-1.png",
  certificates: [
    { id: "cert-1", name: "PMP 项目管理专业人士认证", description: "由美国项目管理协会（PMI）颁发，证明具备专业项目管理能力" },
    { id: "cert-2", name: "NPDP 产品经理国际资格认证", description: "产品开发与管理协会（PDMA）颁发，国际认可的产品管理专业认证" },
    { id: "cert-3", name: "CPPM 注册职业采购经理", description: "美国采购协会颁发，适用于供应链与采购管理领域" },
    { id: "cert-4", name: "物流师职业资格证书", description: "中国物流与采购联合会颁发，物流行业从业资格认证" },
  ]
}

export const mockAiPositionGeneration = (_positionName: string, _direction?: string): AiPositionPreview => {
  return WMS_PRODUCT_MANAGER
}
