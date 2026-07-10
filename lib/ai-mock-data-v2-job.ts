// AI 辅助 V2 的 mock 数据生成器
// 根据用户输入的岗位名称和行业，生成更贴合的润色与补齐结果

import type { PositionCertificate, PositionResponsibility } from '@/lib/types/job-source'

export interface AiPolishResult {
  name: string
  shortName: string
  industry: string
  majors: string[]
  salaryRange: [number, number]
  description: string
}

export interface AiGeneratedSet {
  polish: AiPolishResult
  responsibilities: PositionResponsibility[]
  requirements: string[]
  careerPathVertical: string
  certificates: PositionCertificate[]
}

const INDUSTRY_SALARY_RANGES: Record<string, [number, number]> = {
  '互联网/IT': [15000, 35000],
  '金融/银行': [18000, 40000],
  '教育/培训': [8000, 20000],
  '医疗/健康': [12000, 28000],
  '制造/工业': [10000, 25000],
  '零售/电商': [10000, 26000],
  '物流/运输': [9000, 22000],
  '房地产/建筑': [12000, 30000],
  '能源/环保': [11000, 26000],
  '文化/传媒': [9000, 24000],
}

const INDUSTRY_MAJORS: Record<string, string[]> = {
  '互联网/IT': ['软件工程', '计算机科学与技术', '人工智能', '数据科学'],
  '金融/银行': ['金融学', '会计学', '经济学', '信息管理与信息系统'],
  '教育/培训': ['教育学', '心理学', '汉语言文学', '英语'],
  '医疗/健康': ['临床医学', '护理学', '药学', '公共卫生'],
  '制造/工业': ['工业工程', '机械工程', '自动化', '材料科学'],
  '零售/电商': ['电子商务', '市场营销', '工商管理', '物流管理'],
  '物流/运输': ['物流管理', '供应链管理', '交通运输', '工业工程'],
  '房地产/建筑': ['土木工程', '建筑学', '工程管理', '工程造价'],
  '能源/环保': ['环境工程', '能源与动力工程', '电气工程', '新能源科学'],
  '文化/传媒': ['新闻传播学', '广告学', '数字媒体', '广播电视编导'],
}

function detectRole(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('产品')) return 'pm'
  if (n.includes('前端') || n.includes('web') || n.includes('h5')) return 'frontend'
  if (n.includes('后端') || n.includes('java') || n.includes('python') || n.includes('go')) return 'backend'
  if (n.includes('测试') || n.includes('qa') || n.includes('质量')) return 'qa'
  if (n.includes('运维') || n.includes('devops') || n.includes('sre')) return 'devops'
  if (n.includes('数据') || n.includes('算法') || n.includes('ai') || n.includes('人工智能')) return 'data'
  if (n.includes('ui') || n.includes('设计') || n.includes('视觉')) return 'design'
  if (n.includes('运营') || n.includes('新媒体')) return 'operation'
  if (n.includes('人力') || n.includes('hr')) return 'hr'
  if (n.includes('销售') || n.includes('商务')) return 'sales'
  if (n.includes('市场') || n.includes('营销')) return 'marketing'
  if (n.includes('财务') || n.includes('会计')) return 'finance'
  if (n.includes('行政') || n.includes('助理')) return 'admin'
  return 'general'
}

function buildRoleTitle(role: string, industry: string): string {
  const industryShort = industry.replace(/\/.*$/g, '')
  const titles: Record<string, string[]> = {
    pm: [`${industryShort}产品经理`, `B 端产品经理（${industryShort}方向）`, `${industryShort}产品专员`],
    frontend: [`${industryShort}前端开发工程师`, `Web 前端工程师（${industryShort}方向）`, `H5/小程序开发工程师`],
    backend: [`${industryShort}后端开发工程师`, `Java 后端工程师（${industryShort}方向）`, `服务端开发工程师`],
    qa: [`${industryShort}测试工程师`, `软件测试工程师（${industryShort}方向）`, `质量保障工程师`],
    devops: [`${industryShort}运维工程师`, `DevOps 工程师（${industryShort}方向）`, `SRE 站点可靠性工程师`],
    data: [`${industryShort}数据分析师`, `数据开发工程师（${industryShort}方向）`, `算法工程师（${industryShort}方向）`],
    design: [`${industryShort}UI 设计师`, `视觉设计师（${industryShort}方向）`, `交互设计师`],
    operation: [`${industryShort}运营专员`, `新媒体运营（${industryShort}方向）`, `用户运营`],
    hr: [`${industryShort}HRBP`, `人力资源专员（${industryShort}方向）`, `招聘经理`],
    sales: [`${industryShort}销售经理`, `大客户销售（${industryShort}方向）`, `商务拓展经理`],
    marketing: [`${industryShort}市场专员`, `品牌营销经理（${industryShort}方向）`, `数字营销专员`],
    finance: [`${industryShort}财务主管`, `会计师（${industryShort}方向）`, `财务分析师`],
    admin: [`${industryShort}行政主管`, `行政专员（${industryShort}方向）`, `办公室经理`],
    general: [`${industryShort}业务专员`, `综合业务岗（${industryShort}方向）`],
  }
  const list = titles[role] || titles.general
  // 用字符和作为简单哈希，保证同一岗位名称+行业得到固定结果
  const hash = role.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return list[hash % list.length]
}

function buildShortName(title: string): string {
  return title
    .replace(/工程师/g, '')
    .replace(/经理/g, '')
    .replace(/专员/g, '')
    .replace(/主管/g, '')
    .replace(/助理/g, '')
    .replace(/师/g, '')
    .replace(/方向/g, '')
    .replace(/\（[^）]+\）/g, '')
    .replace(/\([^)]+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim() || title.slice(0, 6)
}

function buildDescription(role: string, name: string, industry: string): string {
  switch (role) {
    case 'pm':
      return `负责本岗位在${industry}领域的产品规划与落地，深入理解业务场景与用户需求，撰写产品需求文档并推动研发、设计、运营等团队高效协作，持续迭代产品功能以提升用户体验与商业价值。`
    case 'frontend':
      return `负责${industry}业务的前端系统开发与维护，熟练使用主流前端框架完成高性能、高可用页面构建，协同产品经理与设计师还原交互细节，持续优化前端工程化与用户体验。`
    case 'backend':
      return `负责${industry}业务后端服务的设计与开发，完成系统架构设计、接口开发、性能优化及技术难点攻关，保障服务高可用、高并发与数据安全，推动后端工程规范落地。`
    case 'qa':
      return `负责${industry}业务产品的质量保障工作，制定测试策略与测试计划，设计并执行功能、接口、自动化及性能测试，推动缺陷闭环与质量体系建设。`
    case 'devops':
      return `负责${industry}业务的系统运维与稳定性保障，构建 CI/CD 流水线、容器化部署及监控告警体系，保障线上服务 7×24 小时稳定运行并持续优化运维效率。`
    case 'data':
      return `负责${industry}业务的数据分析、数据建模或算法研发工作，挖掘数据价值并输出业务洞察，构建数据指标体系与智能算法方案，驱动业务决策与产品智能化升级。`
    case 'design':
      return `负责${industry}业务的视觉设计与交互设计工作，深入理解品牌调性与用户场景，输出高质量设计稿并跟进落地，持续提升产品视觉体验与品牌一致性。`
    case 'operation':
      return `负责${industry}业务的日常运营与增长工作，制定运营策略并落地执行，通过内容、活动、用户分层等手段提升用户活跃度与关键业务指标。`
    case 'hr':
      return `负责${industry}企业的人力资源全模块或专业模块工作，包括招聘配置、培训发展、绩效薪酬、员工关系等，支撑业务快速发展与组织能力提升。`
    case 'sales':
      return `负责${industry}业务的客户拓展与销售目标达成，挖掘客户需求并输出解决方案，维护客户关系，推动商务谈判与合同签订，完成销售业绩指标。`
    case 'marketing':
      return `负责${industry}业务的市场推广与品牌建设，制定营销策略并整合线上线下资源，策划市场活动并监控投放效果，持续提升品牌知名度与市场占有率。`
    case 'finance':
      return `负责${industry}企业的财务核算、预算管理、税务筹划或财务分析工作，保障财务合规，输出经营分析建议，支撑管理层决策与业务健康发展。`
    case 'admin':
      return `负责${industry}企业的行政事务与日常运营管理，优化行政流程与办公体验，协调内外部资源，为公司业务运转提供高效后勤保障。`
    default:
      return `负责本岗位在${industry}领域的核心工作，参与业务目标制定与执行，协同团队完成关键任务，持续提升专业能力并推动工作成果落地。`
  }
}

function buildResponsibilities(role: string, name: string, industry: string): PositionResponsibility[] {
  const base: Record<string, string[]> = {
    pm: [
      `负责${industry}相关产品的需求调研、竞品分析与用户研究`,
      `撰写 PRD、绘制原型图并推动需求评审与迭代落地`,
      `协同研发、设计、运营团队推进项目按时高质量交付`,
      `跟踪产品上线数据与用户反馈，持续优化产品体验`,
      `建立产品指标体系，用数据驱动产品决策与增长`,
    ],
    frontend: [
      `负责${industry}业务前端页面与组件的开发、调试及性能优化`,
      `参与前端技术选型与工程化建设，提升团队研发效率`,
      `与产品经理、设计师紧密配合，高保真还原交互视觉方案`,
      `编写前端单元测试，保障代码质量与可维护性`,
      `持续关注前端前沿技术，推动技术在业务中的落地应用`,
    ],
    backend: [
      `负责${industry}业务服务端架构设计、核心模块开发与代码评审`,
      `完成高并发、高可用接口设计，保障系统稳定性与数据安全`,
      `参与数据库设计与优化，解决线上性能瓶颈与疑难问题`,
      `推动后端工程规范、DevOps 流程及微服务化落地`,
      `编写技术文档，沉淀方案并推动团队技术能力提升`,
    ],
    qa: [
      `负责${industry}业务的功能测试、接口测试及自动化测试用例设计`,
      `制定测试计划，推进缺陷闭环并输出质量报告`,
      `搭建并维护自动化测试框架与 CI/CD 质量门禁`,
      `参与需求评审，从可测性角度提出改进建议`,
      `推动质量文化建设，提升全员质量意识`,
    ],
    devops: [
      `负责${industry}业务系统的部署、监控、故障排查与应急响应`,
      `构建并维护 CI/CD 流水线、容器化及云原生基础设施`,
      `优化系统监控告警体系，提升故障发现与恢复效率`,
      `制定运维规范与应急预案，保障服务 SLA 达成`,
      `推动 SRE 实践落地，持续提升系统稳定性与运维自动化水平`,
    ],
    data: [
      `负责${industry}业务的数据采集、清洗、建模与分析工作`,
      `构建数据指标体系与可视化报表，输出业务洞察报告`,
      `参与算法模型设计与调优，推动智能化场景落地`,
      `协同产品、运营团队，用数据支持业务决策与增长策略`,
      `维护数据仓库与数据治理规范，保障数据质量与安全`,
    ],
    design: [
      `负责${industry}业务线的视觉设计、交互设计及品牌创意输出`,
      `深入理解业务场景与用户需求，制定设计规范与组件库`,
      `跟进设计方案落地，保障最终效果与设计稿一致`,
      `参与用户研究与可用性测试，持续优化设计体验`,
      `关注设计趋势与前沿技术，推动设计创新与效率提升`,
    ],
    operation: [
      `负责${industry}业务的用户运营、内容运营或活动运营策划与执行`,
      `制定运营策略并落地，提升用户活跃度、留存与转化`,
      `分析运营数据，输出复盘报告并持续优化运营方案`,
      `协同产品、市场团队，推动增长项目落地`,
      `建立并维护用户社群，收集用户反馈并推动产品改进`,
    ],
    hr: [
      `负责${industry}企业的招聘、培训、绩效或员工关系等模块工作`,
      `根据业务战略制定人力资源规划，保障人才供给`,
      `完善 HR 制度与流程，提升组织能力与员工体验`,
      `推动企业文化建设与人才发展项目落地`,
      `输出人力数据分析报告，支撑管理决策`,
    ],
    sales: [
      `负责${industry}业务的客户开拓、商机跟进与销售目标达成`,
      `挖掘客户需求，输出定制化解决方案并完成商务谈判`,
      `维护重点客户关系，提升客户满意度与续约率`,
      `收集市场信息与竞品动态，反馈至产品与运营团队`,
      `完成销售过程管理，确保销售漏斗健康运转`,
    ],
    marketing: [
      `负责${industry}业务的市场调研、品牌定位与营销策略制定`,
      `策划并执行线上线下市场活动，提升品牌曝光与线索转化`,
      `管理市场预算与投放渠道，优化投放 ROI`,
      `协同销售、产品团队，打造标杆案例与市场物料`,
      `监测市场动态与竞品动作，及时调整营销策略`,
    ],
    finance: [
      `负责${industry}企业的财务核算、报表编制与税务申报`,
      `参与预算编制与执行监控，输出经营分析建议`,
      `完善财务内控流程，保障资金安全与合规经营`,
      `对接审计、税务等外部机构，完成年审与专项审计`,
      `支持投融资、成本管控等重大财务事项`,
    ],
    admin: [
      `负责${industry}企业日常行政事务管理与办公环境维护`,
      `统筹会议、接待、差旅等行政支持工作`,
      `管理办公资产与供应商，控制行政成本`,
      `推动行政制度与流程优化，提升员工办公体验`,
      `协助组织企业文化活动，增强团队凝聚力`,
    ],
    general: [
      `负责${industry}业务相关核心工作的计划制定与执行落地`,
      `协同内外部资源，推动项目按时保质完成`,
      `持续优化工作流程与方法论，提升工作效率`,
      `完成业务数据分析与复盘，提出改进建议`,
      `主动学习行业知识，持续提升专业能力与业务理解`,
    ],
  }

  return base[role].map((text, i) => ({
    id: `resp-ai-v2-${i + 1}`,
    name: text,
    description: '',
  }))
}

function buildRequirements(role: string, name: string, industry: string): string[] {
  const base: Record<string, string[]> = {
    pm: [
      '本科及以上学历，计算机、设计、市场营销等相关专业优先',
      '2 年以上 B 端或 C 端产品经理经验，有完整产品生命周期管理经验',
      '熟练使用 Axure、Figma、Visio 等原型与流程设计工具',
      '具备优秀的逻辑思维能力、沟通协调能力与项目管理能力',
      '对数据敏感，能通过数据驱动产品迭代与决策',
      '具备较强的用户同理心与业务洞察力',
    ],
    frontend: [
      '本科及以上学历，计算机相关专业优先',
      '熟练掌握 HTML5、CSS3、JavaScript/TypeScript',
      '精通 React/Vue/Angular 中至少一种主流前端框架',
      '熟悉前端工程化、性能优化及跨端开发方案',
      '具备良好的代码规范意识与团队协作能力',
      '对新技术保持热情，有较强的学习能力',
    ],
    backend: [
      '本科及以上学历，计算机相关专业优先',
      '熟练掌握 Java/Python/Go 中至少一门主流后端语言',
      '熟悉常用数据库（MySQL、Redis、MongoDB）及优化方法',
      '了解分布式系统、微服务架构及常见中间件',
      '具备良好的系统设计能力与问题排查能力',
      '有较强的责任心、抗压能力与团队协作精神',
    ],
    qa: [
      '本科及以上学历，计算机相关专业优先',
      '2 年以上软件测试经验，熟悉功能、接口、自动化测试',
      '熟练掌握至少一种自动化测试框架（Selenium/Playwright/Cypress 等）',
      '熟悉 Linux、SQL 及常见接口测试工具',
      '具备较强的问题分析与沟通能力',
      '对质量保障有热情，能推动团队质量文化建设',
    ],
    devops: [
      '本科及以上学历，计算机相关专业优先',
      '熟悉 Linux 系统、网络、容器化（Docker/Kubernetes）技术',
      '熟悉 CI/CD 工具链（Jenkins/GitLab CI/GitHub Actions）',
      '具备云原生、监控告警、日志分析等实践经验',
      '具备较强的故障排查能力与应急响应意识',
      '有良好的自动化思维与脚本开发能力',
    ],
    data: [
      '本科及以上学历，统计学、数学、计算机等相关专业优先',
      '熟练掌握 SQL、Python 及常用数据分析工具',
      '熟悉数据仓库、ETL 流程及数据可视化方案',
      '具备机器学习/深度学习基础者优先',
      '具备良好的业务理解与数据敏感度',
      '有较强的逻辑思维、沟通表达与报告输出能力',
    ],
    design: [
      '本科及以上学历，设计、艺术、人机交互等相关专业优先',
      '熟练使用 Figma、Sketch、Photoshop、Illustrator 等设计工具',
      '具备优秀的视觉表现力与交互设计思维',
      '有设计系统或组件库建设经验者优先',
      '善于沟通，能够平衡用户体验与业务目标',
      '对设计趋势敏感，持续追求设计品质与创新',
    ],
    operation: [
      '本科及以上学历，专业不限',
      '1-3 年互联网或相关行业运营经验',
      '对数据敏感，具备基础的数据分析能力',
      '文案能力强，有活动策划与执行经验',
      '具备良好的沟通协调与用户服务意识',
      '结果导向，能在快节奏环境中推动项目落地',
    ],
    hr: [
      '本科及以上学历，人力资源管理、心理学等相关专业优先',
      '2 年以上 HR 相关模块工作经验',
      '熟悉劳动法及相关人力资源政策法规',
      '具备良好的沟通协调能力与服务意识',
      '逻辑思维清晰，有较强的数据敏感度',
      '抗压能力强，能适应多任务并行处理',
    ],
    sales: [
      '本科及以上学历，专业不限',
      '2 年以上 B 端或行业销售经验',
      '具备较强的商务谈判与客户关系管理能力',
      '目标导向，有强烈的成就动机与抗压能力',
      '具备良好的学习能力与行业理解力',
      '有行业客户资源者优先考虑',
    ],
    marketing: [
      '本科及以上学历，市场营销、新闻传播等相关专业优先',
      '2 年以上市场营销或品牌推广经验',
      '熟悉线上线下市场活动策划与执行',
      '具备较强的文案能力、创意能力与数据分析能力',
      '善于整合资源，具备优秀的项目管理能力',
      '对行业趋势与市场动态保持敏感',
    ],
    finance: [
      '本科及以上学历，财务、会计、审计等相关专业',
      '2 年以上财务相关工作经验，熟悉企业会计准则',
      '熟练使用财务软件及 Excel 高级函数',
      '具备较强的数据分析与风险识别能力',
      '工作细致严谨，有良好的职业操守',
      '有 CPA/中级会计职称者优先',
    ],
    admin: [
      '本科及以上学历，行政管理、工商管理等相关专业优先',
      '2 年以上行政工作经验',
      '具备良好的沟通协调能力与服务意识',
      '熟练使用 Office 办公软件',
      '工作细致、有条理，能妥善处理多任务',
      '有亲和力，具备较强的执行力与应变能力',
    ],
    general: [
      '本科及以上学历，专业不限',
      '1-3 年相关工作经验',
      '具备良好的学习能力与执行力',
      '熟练使用 Office 办公软件及常用办公工具',
      '工作认真负责，有较强的沟通协调能力',
      '具备团队合作精神，能承受一定工作压力',
    ],
  }
  return base[role]
}

function buildCareerPath(role: string): string {
  const paths: Record<string, string[]> = {
    pm: ['产品专员', '产品经理', '高级产品经理', '产品负责人', '产品总监', 'VP 产品'],
    frontend: ['初级前端工程师', '前端工程师', '高级前端工程师', '前端专家', '前端架构师', '技术总监'],
    backend: ['初级后端工程师', '后端工程师', '高级后端工程师', '后端专家', '系统架构师', '技术总监'],
    qa: ['初级测试工程师', '测试工程师', '高级测试工程师', '测试开发工程师', '质量负责人', '质量总监'],
    devops: ['运维工程师', '高级运维工程师', 'SRE 工程师', '运维架构师', '基础架构负责人', '运维总监'],
    data: ['数据分析师', '高级数据分析师', '数据科学家', '算法工程师', '数据负责人', '首席数据官'],
    design: ['初级设计师', '设计师', '高级设计师', '设计专家', '设计总监', '创意总监'],
    operation: ['运营专员', '运营经理', '高级运营经理', '运营总监', '业务负责人', 'COO'],
    hr: ['HR 专员', 'HRBP', 'HR 经理', 'HRD', 'HRVP', 'CHO'],
    sales: ['销售代表', '销售经理', '高级销售经理', '销售总监', '区域负责人', '销售 VP'],
    marketing: ['市场专员', '市场经理', '高级市场经理', '市场总监', 'CMO 助理', 'CMO'],
    finance: ['会计', '高级会计', '财务主管', '财务经理', '财务总监', 'CFO'],
    admin: ['行政专员', '行政主管', '行政经理', '高级行政经理', '行政总监', '运营支持 VP'],
    general: ['助理', '专员', '主管', '经理', '高级经理', '总监'],
  }
  const items = paths[role] || paths.general
  return '纵向晋升：' + items.join(' → ')
}

function buildCertificates(role: string): PositionCertificate[] {
  const base: Record<string, PositionCertificate[]> = {
    pm: [
      { id: 'cert-v2-pmp', name: 'PMP 项目管理专业人士认证', description: '由美国项目管理协会 PMI 颁发，全球认可的项目管理权威认证', url: 'https://www.pmi.org' },
      { id: 'cert-v2-npdp', name: 'NPDP 产品经理国际资格认证', description: '产品开发与管理协会 PDMA 颁发，产品管理领域国际认证', url: 'https://www.pdma.org' },
      { id: 'cert-v2-acp', name: 'ACP 敏捷管理专业人士认证', description: 'PMI 敏捷项目管理认证，适用于敏捷团队管理与交付', url: 'https://www.pmi.org' },
    ],
    frontend: [
      { id: 'cert-v2-web', name: 'Web 前端开发高级工程师', description: '工信部教育与考试中心颁发，面向前端开发岗位的职业技能认证', url: 'https://www.miiteec.org.cn' },
      { id: 'cert-v2-aws', name: 'AWS 云从业者认证', description: 'Amazon Web Services 入门级云计算认证', url: 'https://aws.amazon.com/certification' },
    ],
    backend: [
      { id: 'cert-v2-ruankao', name: '软件设计师（中级）', description: '国家计算机技术与软件专业技术资格考试，程序员进阶必备', url: 'https://www.ruankao.org.cn' },
      { id: 'cert-v2-cka', name: 'CKA Kubernetes 管理员认证', description: 'Cloud Native Computing Foundation 颁发，云原生领域核心认证', url: 'https://www.cncf.io' },
      { id: 'cert-v2-ocp', name: 'Oracle/MySQL 数据库认证', description: '数据库管理方向权威认证，提升数据架构设计能力', url: 'https://education.oracle.com' },
    ],
    qa: [
      { id: 'cert-v2-istqb', name: 'ISTQB 国际软件测试认证', description: '国际软件测试认证委员会颁发，软件测试领域国际通用认证', url: 'https://www.istqb.org' },
      { id: 'cert-v2-ruankao-qa', name: '软件评测师（中级）', description: '国家软考软件评测师资格，软件质量保障方向权威认证', url: 'https://www.ruankao.org.cn' },
    ],
    devops: [
      { id: 'cert-v2-cka-devops', name: 'CKA Kubernetes 管理员认证', description: 'CNCF 颁发，容器编排与云原生运维核心认证', url: 'https://www.cncf.io' },
      { id: 'cert-v2-rhca', name: 'Red Hat 认证架构师', description: '红帽 Linux、自动化与云计算方向高级认证', url: 'https://www.redhat.com' },
    ],
    data: [
      { id: 'cert-v2-cda', name: 'CDA 数据分析师认证', description: '面向商业数据分析的国内权威认证，覆盖数据清洗、建模与可视化', url: 'https://www.cdaglobal.com' },
      { id: 'cert-v2-aws-data', name: 'AWS 数据分析专项认证', description: 'AWS 数据分析服务与架构设计认证', url: 'https://aws.amazon.com/certification' },
    ],
    design: [
      { id: 'cert-v2-ux', name: 'NN/g UX 大师认证', description: 'Nielsen Norman Group 颁发的用户体验领域国际认证', url: 'https://www.nngroup.com' },
      { id: 'cert-v2-adobe', name: 'Adobe 认证专家（ACE）', description: 'Adobe 官方设计工具认证，覆盖 Photoshop、Illustrator 等', url: 'https://www.adobe.com' },
    ],
    operation: [
      { id: 'cert-v2-pmp-op', name: 'PMP 项目管理专业人士认证', description: 'PMI 颁发，提升运营项目规划与交付能力', url: 'https://www.pmi.org' },
      { id: 'cert-v2-growth', name: '增长黑客认证', description: '聚焦用户增长、数据驱动运营的系统化能力提升认证', url: 'https://www.growthhackers.com' },
    ],
    hr: [
      { id: 'cert-v2-shrm', name: 'SHRM 国际人力资源管理认证', description: '美国人力资源管理协会颁发，HR 领域国际权威认证', url: 'https://www.shrm.org' },
      { id: 'cert-v2-chrp', name: '企业人力资源管理师', description: '国家人社部门备案的人力资源管理职业技能等级认证', url: 'http://www.mohrss.gov.cn' },
    ],
    sales: [
      { id: 'cert-v2-spin', name: 'SPIN 销售认证', description: '顾问式销售方法论认证，提升大客户销售能力', url: 'https://www.huthwaiteinternational.com' },
      { id: 'cert-v2-dale', name: '戴尔·卡耐基销售口才训练', description: '提升商务演讲、谈判与客户关系管理能力', url: 'https://www.dalecarnegie.com' },
    ],
    marketing: [
      { id: 'cert-v2-google', name: 'Google Analytics 个人资格认证', description: '谷歌官方数字营销与网站分析认证', url: 'https://skillshop.withgoogle.com' },
      { id: 'cert-v2-dmt', name: '数字营销师认证', description: '覆盖 SEM、信息流、社媒运营等数字营销核心技能', url: 'https://www.miiteec.org.cn' },
    ],
    finance: [
      { id: 'cert-v2-cpa', name: 'CPA 注册会计师', description: '中国注册会计师协会颁发，财会领域顶级执业资格', url: 'https://www.cicpa.org.cn' },
      { id: 'cert-v2-cma', name: 'CMA 美国注册管理会计师', description: 'IMA 颁发，面向管理会计与财务决策的国际认证', url: 'https://www.imanet.org' },
    ],
    admin: [
      { id: 'cert-v2-pmp-admin', name: 'PMP 项目管理专业人士认证', description: '提升行政项目管理与跨部门协作效率', url: 'https://www.pmi.org' },
      { id: 'cert-v2-secretary', name: '秘书职业资格证书', description: '商务秘书、行政助理方向职业技能认证', url: 'https://www.miiteec.org.cn' },
    ],
    general: [
      { id: 'cert-v2-office', name: 'Microsoft Office 专家认证', description: '提升办公软件应用效率与专业文档处理能力', url: 'https://www.microsoft.com' },
      { id: 'cert-v2-pmp-gen', name: 'PMP 项目管理专业人士认证', description: '系统提升项目管理思维与执行能力', url: 'https://www.pmi.org' },
    ],
  }
  return base[role]
}

export function generateAiResults(name: string, industry: string, existingMajors: string[]): AiGeneratedSet {
  const role = detectRole(name)
  const salaryRange = INDUSTRY_SALARY_RANGES[industry] || [10000, 25000]
  const majors = existingMajors.length > 0 ? existingMajors : (INDUSTRY_MAJORS[industry] || ['相关专业'])

  // AI 润色后的名称与简称完全由系统根据岗位类型和行业生成，不直接使用用户原输入
  const polishedName = buildRoleTitle(role, industry)
  const shortName = buildShortName(polishedName)

  return {
    polish: {
      name: polishedName,
      shortName,
      industry,
      majors,
      salaryRange,
      description: buildDescription(role, polishedName, industry),
    },
    responsibilities: buildResponsibilities(role, polishedName, industry),
    requirements: buildRequirements(role, polishedName, industry),
    careerPathVertical: buildCareerPath(role),
    certificates: buildCertificates(role),
  }
}
