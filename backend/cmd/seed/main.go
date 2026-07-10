package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/zhiyu-saas/backend/internal/config"
	"github.com/zhiyu-saas/backend/internal/db"
	"golang.org/x/crypto/bcrypt"
)

type Institution struct {
	ID                string
	Type              string
	Name              string
	CreditCode        string
	Logo              *string
	Intro             string
	ContactName       string
	ContactPhone      string
	ContactEmail      string
	QualificationFile *string
	ExpertiseTags     []string
	Status            string
	OrgCode           string
	Balance           float64
	TotalSpent        float64
	TotalIncome       float64
	CreatedAt         string
	UpdatedAt         string
}

type Resource struct {
	ID             string
	InstitutionID  string
	Name           string
	Intro          string
	Category       string
	CoverImage     *string
	Attachment     *string
	AttachmentName *string
	Price          float64
	Version        string
	Status         string
	SalesCount     int
	ViewCount      int
	CreatedAt      string
	UpdatedAt      string
	Tags           []ResourceTag
}

type ResourceTag struct {
	ID       string
	TagType  string
	TagValue string
}

type Order struct {
	ID           string
	OrderNo      string
	BuyerID      string
	SellerID     string
	ResourceID   string
	Price        float64
	PlatformFee  float64
	SellerIncome float64
	Status       string
	PaidAt       *string
	CreatedAt    string
}

type Authorization struct {
	ID         string
	OrderID    string
	BuyerID    string
	ResourceID string
	AuthCode   string
	Status     int
	CreatedAt  string
}

type Withdrawal struct {
	ID            string
	InstitutionID string
	Amount        float64
	AccountType   string
	AccountInfo   string
	Status        string
	HandledAt     *string
	CreatedAt     string
}

type Banner struct {
	ID      string
	Title   string
	Image   string
	Link    string
	Sort    int
	Enabled bool
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Println("config error:", err)
		os.Exit(1)
	}

	database, err := db.New(cfg.DatabaseURL)
	if err != nil {
		fmt.Println("db error:", err)
		os.Exit(1)
	}
	defer database.Close()

	ctx := context.Background()
	tx, err := database.Pool.Begin(ctx)
	if err != nil {
		fmt.Println("begin error:", err)
		os.Exit(1)
	}
	defer tx.Rollback(ctx)

	if err := seedUnifiedBase(ctx, tx); err != nil {
		fmt.Println("seed unified base error:", err)
		os.Exit(1)
	}
	if err := seedInstitutions(ctx, tx); err != nil {
		fmt.Println("seed institutions error:", err)
		os.Exit(1)
	}
	if err := seedResources(ctx, tx); err != nil {
		fmt.Println("seed resources error:", err)
		os.Exit(1)
	}
	if err := seedOrders(ctx, tx); err != nil {
		fmt.Println("seed orders error:", err)
		os.Exit(1)
	}
	if err := seedWithdrawals(ctx, tx); err != nil {
		fmt.Println("seed withdrawals error:", err)
		os.Exit(1)
	}
	if err := seedBanners(ctx, tx); err != nil {
		fmt.Println("seed banners error:", err)
		os.Exit(1)
	}
	if err := seedPlatformConfig(ctx, tx); err != nil {
		fmt.Println("seed platform config error:", err)
		os.Exit(1)
	}
	if err := seedUsers(ctx, tx); err != nil {
		fmt.Println("seed users error:", err)
		os.Exit(1)
	}

	if err := tx.Commit(ctx); err != nil {
		fmt.Println("commit error:", err)
		os.Exit(1)
	}

	fmt.Println("seed completed")
}

// seedUnifiedBase seeds tenants, org_types, organizations, identity_types, majors, roles
// required by the unified user system.
func seedUnifiedBase(ctx context.Context, tx pgx.Tx) error {
	tenantID := uuid.MustParse("11111111-1111-1111-1111-111111111111")

	_, err := tx.Exec(ctx, `
		INSERT INTO tenants (id, name, code, logo_url, domain, enterprise_code, contact, phone, address, description, admin_ids, status, created_at, updated_at)
		VALUES ($1, '知与未来演示租户', 'zhiyu-demo', '/placeholder-logo.png', 'demo.zhiyu.com', 'DEMO0001', '管理员', '010-12345678', '北京市', '演示用统一租户', '{}', 'active', NOW(), NOW())
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name, code = EXCLUDED.code, logo_url = EXCLUDED.logo_url, domain = EXCLUDED.domain,
			enterprise_code = EXCLUDED.enterprise_code, contact = EXCLUDED.contact, phone = EXCLUDED.phone,
			address = EXCLUDED.address, description = EXCLUDED.description, admin_ids = EXCLUDED.admin_ids,
			status = EXCLUDED.status, updated_at = NOW()
	`, tenantID)
	if err != nil {
		return fmt.Errorf("seed tenant: %w", err)
	}

	orgTypes := []struct {
		id       uuid.UUID
		name     string
		category string
	}{
		{uuid.MustParse("21111111-1111-1111-1111-111111111111"), "学校", "internal"},
		{uuid.MustParse("21111111-1111-1111-1111-111111111112"), "二级学院", "internal"},
		{uuid.MustParse("21111111-1111-1111-1111-111111111113"), "专业", "internal"},
		{uuid.MustParse("21111111-1111-1111-1111-111111111114"), "班级", "internal"},
		{uuid.MustParse("21111111-1111-1111-1111-111111111115"), "企业", "external"},
		{uuid.MustParse("21111111-1111-1111-1111-111111111116"), "职能部门", "business"},
	}
	for _, ot := range orgTypes {
		_, err := tx.Exec(ctx, `
			INSERT INTO org_types (id, tenant_id, name, category, description, created_at)
			VALUES ($1, $2, $3, $4, '', NOW())
			ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category
		`, ot.id, tenantID, ot.name, ot.category)
		if err != nil {
			return fmt.Errorf("seed org type %s: %w", ot.name, err)
		}
	}

	orgs := []struct {
		id       uuid.UUID
		name     string
		typeID   uuid.UUID
		parentID *uuid.UUID
	}{
		{uuid.MustParse("31111111-1111-1111-1111-111111111111"), "北京信息职业技术学院", uuid.MustParse("21111111-1111-1111-1111-111111111111"), nil},
		{uuid.MustParse("31111111-1111-1111-1111-111111111112"), "信息技术学院", uuid.MustParse("21111111-1111-1111-1111-111111111112"), uuidPtr("31111111-1111-1111-1111-111111111111")},
		{uuid.MustParse("31111111-1111-1111-1111-111111111113"), "信息安全专业", uuid.MustParse("21111111-1111-1111-1111-111111111113"), uuidPtr("31111111-1111-1111-1111-111111111112")},
		{uuid.MustParse("31111111-1111-1111-1111-111111111114"), "信息安全23-1班", uuid.MustParse("21111111-1111-1111-1111-111111111114"), uuidPtr("31111111-1111-1111-1111-111111111113")},
	}
	for _, o := range orgs {
		_, err := tx.Exec(ctx, `
			INSERT INTO organizations (id, tenant_id, name, type_id, parent_id, sort_order, member_count, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, 0, 0, NOW(), NOW())
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name, type_id = EXCLUDED.type_id, parent_id = EXCLUDED.parent_id,
				sort_order = EXCLUDED.sort_order, member_count = EXCLUDED.member_count, updated_at = NOW()
		`, o.id, tenantID, o.name, o.typeID, o.parentID)
		if err != nil {
			return fmt.Errorf("seed organization %s: %w", o.name, err)
		}
	}

	identityTypes := []struct {
		id       uuid.UUID
		code     string
		name     string
		system   bool
	}{
		{uuid.MustParse("41111111-1111-1111-1111-111111111111"), "platform_admin", "平台管理员", true},
		{uuid.MustParse("41111111-1111-1111-1111-111111111112"), "school_admin", "学校管理员", true},
		{uuid.MustParse("41111111-1111-1111-1111-111111111113"), "teacher", "教师", true},
		{uuid.MustParse("41111111-1111-1111-1111-111111111114"), "student", "学生", true},
		{uuid.MustParse("41111111-1111-1111-1111-111111111115"), "enterprise_hr", "企业人事", true},
		{uuid.MustParse("41111111-1111-1111-1111-111111111116"), "enterprise_mentor", "企业导师", true},
	}
	for _, it := range identityTypes {
		_, err := tx.Exec(ctx, `
			INSERT INTO identity_types (id, tenant_id, code, name, description, user_count, is_system, created_at)
			VALUES ($1, $2, $3, $4, '', 0, $5, NOW())
			ON CONFLICT (id) DO UPDATE SET
				code = EXCLUDED.code, name = EXCLUDED.name, is_system = EXCLUDED.is_system
		`, it.id, tenantID, it.code, it.name, it.system)
		if err != nil {
			return fmt.Errorf("seed identity type %s: %w", it.name, err)
		}
	}

	majors := []struct {
		id      uuid.UUID
		orgID   uuid.UUID
		code    string
		name    string
		enabled bool
	}{
		{uuid.MustParse("51111111-1111-1111-1111-111111111111"), uuid.MustParse("31111111-1111-1111-1111-111111111113"), "INFO-SEC", "信息安全技术应用", true},
		{uuid.MustParse("51111111-1111-1111-1111-111111111112"), uuid.MustParse("31111111-1111-1111-1111-111111111113"), "CLOUD-COMP", "云计算技术应用", true},
	}
	for _, m := range majors {
		_, err := tx.Exec(ctx, `
			INSERT INTO majors (id, tenant_id, org_node_id, code, name, enabled, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
			ON CONFLICT (id) DO UPDATE SET
				org_node_id = EXCLUDED.org_node_id, code = EXCLUDED.code, name = EXCLUDED.name, enabled = EXCLUDED.enabled,
				updated_at = NOW()
		`, m.id, tenantID, m.orgID, m.code, m.name, m.enabled)
		if err != nil {
			return fmt.Errorf("seed major %s: %w", m.name, err)
		}
	}

	roles := []struct {
		id          uuid.UUID
		code        string
		name        string
		permissions map[string]interface{}
	}{
		{uuid.MustParse("61111111-1111-1111-1111-111111111111"), "platform_admin", "平台管理员", map[string]interface{}{"admin": true}},
		{uuid.MustParse("61111111-1111-1111-1111-111111111112"), "school_admin", "学校管理员", map[string]interface{}{"schoolAdmin": true}},
		{uuid.MustParse("61111111-1111-1111-1111-111111111113"), "teacher", "教师", map[string]interface{}{"teacher": true}},
		{uuid.MustParse("61111111-1111-1111-1111-111111111114"), "student", "学生", map[string]interface{}{"student": true}},
		{uuid.MustParse("61111111-1111-1111-1111-111111111115"), "enterprise_hr", "企业人事", map[string]interface{}{"enterpriseHR": true}},
		{uuid.MustParse("61111111-1111-1111-1111-111111111116"), "enterprise_mentor", "企业导师", map[string]interface{}{"enterpriseMentor": true}},
	}
	for _, role := range roles {
		_, err := tx.Exec(ctx, `
			INSERT INTO roles (id, tenant_id, code, name, description, permissions, user_count, status, created_at)
			VALUES ($1, $2, $3, $4, '', $5, 0, 'active', NOW())
			ON CONFLICT (id) DO UPDATE SET
				code = EXCLUDED.code, name = EXCLUDED.name, permissions = EXCLUDED.permissions
		`, role.id, tenantID, role.code, role.name, role.permissions)
		if err != nil {
			return fmt.Errorf("seed role %s: %w", role.name, err)
		}
	}

	return nil
}

func seedInstitutions(ctx context.Context, tx pgx.Tx) error {
	institutions := []Institution{
		{
			ID: "inst-001", Type: "enterprise", Name: "网络安全科技股份有限公司",
			CreditCode: "91110108MA01ABCD1X", Logo: str("/placeholder-logo.png"),
			Intro: "专注于网络安全人才培养与教学资源开发的高新技术企业。",
			ContactName: "张明", ContactPhone: "138****1234", ContactEmail: "zhangming@cybersec.com",
			QualificationFile: str("营业执照.pdf"), ExpertiseTags: []string{"信息安全", "网络安全"},
			Status: "approved", OrgCode: "ORG-ENT001", Balance: 12850, TotalIncome: 23500,
			CreatedAt: "2024-01-10", UpdatedAt: "2024-03-15",
		},
		{
			ID: "inst-002", Type: "school", Name: "北京信息职业技术学院",
			CreditCode: "12110000400999999X", Logo: str("/placeholder-logo.png"),
			Intro: "北京市示范性高等职业院校，重点建设信息技术类专业群。",
			ContactName: "李华", ContactPhone: "139****5678", ContactEmail: "lihua@bitc.edu.cn",
			QualificationFile: str("办学许可证.pdf"), ExpertiseTags: []string{"计算机网络", "软件技术"},
			Status: "approved", OrgCode: "ORG-SCH001", TotalSpent: 15800,
			CreatedAt: "2024-02-15", UpdatedAt: "2024-03-20",
		},
		{
			ID: "inst-003", Type: "enterprise", Name: "云智教育科技（深圳）有限公司",
			CreditCode: "91440300MA5E6789CD", Logo: str("/placeholder-logo.png"),
			Intro: "聚焦云计算与大数据领域的职业教育内容服务商。",
			ContactName: "王芳", ContactPhone: "137****9012", ContactEmail: "wangfang@yunzhi.com",
			QualificationFile: str("营业执照.pdf"), ExpertiseTags: []string{"云计算", "大数据技术"},
			Status: "approved", OrgCode: "ORG-ENT002", Balance: 5200, TotalIncome: 9800,
			CreatedAt: "2024-03-05", UpdatedAt: "2024-03-18",
		},
		{
			ID: "inst-004", Type: "school", Name: "上海电子信息职业技术学院",
			CreditCode: "12110000400998888X", Logo: str("/placeholder-logo.png"),
			Intro: "上海市特色高职院校，电子信息类专业优势明显。",
			ContactName: "陈伟", ContactPhone: "136****3456", ContactEmail: "chenwei@shie.edu.cn",
			QualificationFile: str("办学许可证.pdf"), ExpertiseTags: []string{"物联网", "人工智能"},
			Status: "approved", OrgCode: "ORG-SCH002", TotalSpent: 7600,
			CreatedAt: "2024-01-22", UpdatedAt: "2024-03-10",
		},
		{
			ID: "inst-005", Type: "school", Name: "杭州职业技术学院",
			CreditCode: "12330000470088888X", Logo: str("/placeholder-logo.png"),
			Intro: "浙江省示范性高职院校，数字媒体专业为省级特色专业。",
			ContactName: "刘洋", ContactPhone: "135****7890", ContactEmail: "liuyang@hzvtc.edu.cn",
			QualificationFile: str("办学许可证.pdf"), ExpertiseTags: []string{"数字媒体", "电子商务"},
			Status: "pending", OrgCode: "ORG-SCH003",
			CreatedAt: "2024-04-01", UpdatedAt: "2024-04-01",
		},
		{
			ID: "inst-006", Type: "enterprise", Name: "智能制造解决方案有限公司",
			CreditCode: "91330106MA2B3456EF", Logo: str("/placeholder-logo.png"),
			Intro: "面向职业院校提供智能制造实训资源与课程服务。",
			ContactName: "赵静", ContactPhone: "158****2345", ContactEmail: "zhaojing@imfg.com",
			QualificationFile: str("营业执照.pdf"), ExpertiseTags: []string{"智能制造", "物联网"},
			Status: "approved", OrgCode: "ORG-ENT003", Balance: 3200, TotalIncome: 5600,
			CreatedAt: "2024-02-28", UpdatedAt: "2024-03-22",
		},
	}

	for _, i := range institutions {
		_, err := tx.Exec(ctx, `
			INSERT INTO institutions (id, type, name, credit_code, logo, intro, contact_name, contact_phone, contact_email,
				qualification_file, status, org_code, balance, total_spent, total_income, created_at, updated_at, tenant_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name, credit_code = EXCLUDED.credit_code, logo = EXCLUDED.logo, intro = EXCLUDED.intro,
				contact_name = EXCLUDED.contact_name, contact_phone = EXCLUDED.contact_phone, contact_email = EXCLUDED.contact_email,
				qualification_file = EXCLUDED.qualification_file, status = EXCLUDED.status, org_code = EXCLUDED.org_code,
				balance = EXCLUDED.balance, total_spent = EXCLUDED.total_spent, total_income = EXCLUDED.total_income,
				updated_at = EXCLUDED.updated_at, tenant_id = EXCLUDED.tenant_id
		`, i.ID, i.Type, i.Name, i.CreditCode, i.Logo, i.Intro, i.ContactName, i.ContactPhone, i.ContactEmail,
			i.QualificationFile, i.Status, i.OrgCode, i.Balance, i.TotalSpent, i.TotalIncome,
			parseDate(i.CreatedAt), parseDate(i.UpdatedAt), uuid.MustParse("11111111-1111-1111-1111-111111111111"))
		if err != nil {
			return fmt.Errorf("insert institution %s: %w", i.ID, err)
		}

		for _, tag := range i.ExpertiseTags {
			_, err := tx.Exec(ctx, `
				INSERT INTO institution_expertise_tags (id, institution_id, tag_value)
				VALUES ($1, $2, $3) ON CONFLICT (institution_id, tag_value) DO NOTHING
			`, i.ID+"-"+tag, i.ID, tag)
			if err != nil {
				return fmt.Errorf("insert tag %s: %w", tag, err)
			}
		}
	}
	return nil
}

func seedResources(ctx context.Context, tx pgx.Tx) error {
	resources := []Resource{
		{
			ID: "res-001", InstitutionID: "inst-001", Name: "网络安全运维岗位能力包",
			Intro: "本资源包面向高职信息安全专业，包含网络安全运维岗位能力模型、胜任标准、典型工作任务及评价量规。配套课件、实训指导书及考核题库，支持院校开展岗位导向教学。",
			Category: "post", CoverImage: str("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80&auto=format&fit=crop"), Attachment: str("#"),
			AttachmentName: str("网络安全运维岗位能力包_v1.0.zip"), Price: 5800, Version: "v1.0",
			Status: "published", SalesCount: 12, ViewCount: 356,
			CreatedAt: "2024-02-10", UpdatedAt: "2024-03-15",
			Tags: []ResourceTag{
				{ID: "rt-001", TagType: "major", TagValue: "信息安全"},
				{ID: "rt-002", TagType: "industry", TagValue: "网络安全"},
				{ID: "rt-003", TagType: "level", TagValue: "高职"},
				{ID: "rt-004", TagType: "difficulty", TagValue: "中级"},
			},
		},
		{
			ID: "res-002", InstitutionID: "inst-003", Name: "云计算平台搭建与运维课程包",
			Intro: "涵盖 OpenStack、Docker、Kubernetes 等主流云平台的搭建与运维内容。包含完整课程大纲、PPT课件、实验手册、视频微课及期末试卷，适合高职云计算专业核心课程使用。",
			Category: "course", CoverImage: str("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80&auto=format&fit=crop"), Attachment: str("#"),
			AttachmentName: str("云计算课程包_v1.0.zip"), Price: 4200, Version: "v1.0",
			Status: "published", SalesCount: 8, ViewCount: 218,
			CreatedAt: "2024-02-18", UpdatedAt: "2024-03-12",
			Tags: []ResourceTag{
				{ID: "rt-005", TagType: "major", TagValue: "云计算"},
				{ID: "rt-006", TagType: "industry", TagValue: "云计算服务"},
				{ID: "rt-007", TagType: "level", TagValue: "高职"},
				{ID: "rt-008", TagType: "difficulty", TagValue: "中级"},
			},
		},
		{
			ID: "res-003", InstitutionID: "inst-001", Name: "渗透测试实战场景包",
			Intro: "基于真实企业网络安全事件改编的渗透测试实战场景，包含任务链、漏洞利用说明、防御方案及评价标准。适用于信息安全专业高年级学生综合实训。",
			Category: "scene", CoverImage: str("https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80&auto=format&fit=crop"), Attachment: str("#"),
			AttachmentName: str("渗透测试场景包_v1.0.zip"), Price: 3600, Version: "v1.0",
			Status: "published", SalesCount: 5, ViewCount: 189,
			CreatedAt: "2024-03-01", UpdatedAt: "2024-03-18",
			Tags: []ResourceTag{
				{ID: "rt-009", TagType: "major", TagValue: "信息安全"},
				{ID: "rt-010", TagType: "industry", TagValue: "网络安全"},
				{ID: "rt-011", TagType: "level", TagValue: "高职"},
				{ID: "rt-012", TagType: "difficulty", TagValue: "高级"},
			},
		},
		{
			ID: "res-004", InstitutionID: "inst-006", Name: "工业互联网安全测评包",
			Intro: "针对工业互联网安全领域的测评资源包，包含风险评估量规、测试用例库、安全检查表及报告模板。可用于课程考核、技能竞赛训练等场景。",
			Category: "assessment", CoverImage: str("https://images.unsplash.com/photo-1581092919535-7146ff1a590b?w=800&q=80&auto=format&fit=crop"), Attachment: str("#"),
			AttachmentName: str("工控安全测评包_v1.0.zip"), Price: 2800, Version: "v1.0",
			Status: "published", SalesCount: 3, ViewCount: 96,
			CreatedAt: "2024-03-05", UpdatedAt: "2024-03-20",
			Tags: []ResourceTag{
				{ID: "rt-013", TagType: "major", TagValue: "智能制造"},
				{ID: "rt-014", TagType: "industry", TagValue: "智能硬件"},
				{ID: "rt-015", TagType: "level", TagValue: "高职"},
				{ID: "rt-016", TagType: "difficulty", TagValue: "高级"},
			},
		},
		{
			ID: "res-005", InstitutionID: "inst-003", Name: "Python 数据分析素材包",
			Intro: "包含数据分析典型案例数据集、Jupyter Notebook 源码、可视化模板及教学视频。适用于大数据技术专业课程辅助教学。",
			Category: "material", CoverImage: str("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop"), Attachment: str("#"),
			AttachmentName: str("Python数据分析素材包_v1.0.zip"), Price: 1500, Version: "v1.0",
			Status: "published", SalesCount: 15, ViewCount: 412,
			CreatedAt: "2024-03-08", UpdatedAt: "2024-03-22",
			Tags: []ResourceTag{
				{ID: "rt-017", TagType: "major", TagValue: "大数据技术"},
				{ID: "rt-018", TagType: "industry", TagValue: "数据分析"},
				{ID: "rt-019", TagType: "level", TagValue: "高职"},
				{ID: "rt-020", TagType: "difficulty", TagValue: "初级"},
			},
		},
		{
			ID: "res-006", InstitutionID: "inst-001", Name: "Web 应用安全开发课程包",
			Intro: "覆盖 OWASP Top 10、安全编码规范、代码审计方法等内容。包含课程课件、案例源码、实验环境配置指南及考核试卷。",
			Category: "course", CoverImage: str("https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80&auto=format&fit=crop"), Attachment: str("#"),
			AttachmentName: str("Web安全开发课程包_v1.0.zip"), Price: 4800, Version: "v1.0",
			Status: "reviewing",
			CreatedAt: "2024-03-25", UpdatedAt: "2024-03-25",
			Tags: []ResourceTag{
				{ID: "rt-021", TagType: "major", TagValue: "信息安全"},
				{ID: "rt-022", TagType: "industry", TagValue: "软件开发"},
				{ID: "rt-023", TagType: "level", TagValue: "高职"},
				{ID: "rt-024", TagType: "difficulty", TagValue: "中级"},
			},
		},
		{
			ID: "res-007", InstitutionID: "inst-006", Name: "智能制造数字孪生场景包",
			Intro: "基于数字孪生技术的智能制造实训场景，包含产线建模、虚拟调试、数据分析等任务模块及评价标准。",
			Category: "scene", CoverImage: str("https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80&auto=format&fit=crop"), Attachment: str("#"),
			AttachmentName: str("数字孪生场景包_v1.0.zip"), Price: 6500, Version: "v1.0",
			Status: "pending_publish",
			CreatedAt: "2024-03-20", UpdatedAt: "2024-03-28",
			Tags: []ResourceTag{
				{ID: "rt-025", TagType: "major", TagValue: "智能制造"},
				{ID: "rt-026", TagType: "industry", TagValue: "智能制造"},
				{ID: "rt-027", TagType: "level", TagValue: "高职"},
				{ID: "rt-028", TagType: "difficulty", TagValue: "高级"},
			},
		},
		{
			ID: "res-008", InstitutionID: "inst-003", Name: "人工智能基础岗位包",
			Intro: "面向人工智能应用开发岗位的能力模型与教学资源，包含机器学习基础、深度学习入门、模型部署等内容。",
			Category: "post", CoverImage: str("https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80&auto=format&fit=crop"), Attachment: str("#"),
			AttachmentName: str("AI基础岗位包_v1.0.zip"), Price: 5200, Version: "v1.0",
			Status: "draft",
			CreatedAt: "2024-03-28", UpdatedAt: "2024-03-28",
			Tags: []ResourceTag{
				{ID: "rt-029", TagType: "major", TagValue: "人工智能"},
				{ID: "rt-030", TagType: "industry", TagValue: "数据分析"},
				{ID: "rt-031", TagType: "level", TagValue: "高职"},
				{ID: "rt-032", TagType: "difficulty", TagValue: "初级"},
			},
		},
	}

	for _, r := range resources {
		_, err := tx.Exec(ctx, `
			INSERT INTO resources (id, institution_id, name, intro, category, cover_image, attachment, attachment_name,
				price, version, status, sales_count, view_count, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
			ON CONFLICT (id) DO UPDATE SET
				institution_id = EXCLUDED.institution_id, name = EXCLUDED.name, intro = EXCLUDED.intro,
				category = EXCLUDED.category, cover_image = EXCLUDED.cover_image, attachment = EXCLUDED.attachment,
				attachment_name = EXCLUDED.attachment_name, price = EXCLUDED.price, version = EXCLUDED.version,
				status = EXCLUDED.status, sales_count = EXCLUDED.sales_count, view_count = EXCLUDED.view_count,
				updated_at = EXCLUDED.updated_at
		`, r.ID, r.InstitutionID, r.Name, r.Intro, r.Category, r.CoverImage, r.Attachment, r.AttachmentName,
			r.Price, r.Version, r.Status, r.SalesCount, r.ViewCount, parseDate(r.CreatedAt), parseDate(r.UpdatedAt))
		if err != nil {
			return fmt.Errorf("insert resource %s: %w", r.ID, err)
		}

		for _, t := range r.Tags {
			_, err := tx.Exec(ctx, `
				INSERT INTO resource_tags (id, resource_id, tag_type, tag_value)
				VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET tag_type = EXCLUDED.tag_type, tag_value = EXCLUDED.tag_value
			`, t.ID, r.ID, t.TagType, t.TagValue)
			if err != nil {
				return fmt.Errorf("insert resource tag %s: %w", t.ID, err)
			}
		}
	}
	return nil
}

func seedOrders(ctx context.Context, tx pgx.Tx) error {
	orders := []Order{
		{ID: "order-001", OrderNo: "ORD-20240315-1001", BuyerID: "inst-002", SellerID: "inst-001", ResourceID: "res-001", Price: 5800, PlatformFee: 870, SellerIncome: 4930, Status: "paid", PaidAt: str("2024-03-15 10:30:00"), CreatedAt: "2024-03-15 10:28:00"},
		{ID: "order-002", OrderNo: "ORD-20240318-1002", BuyerID: "inst-004", SellerID: "inst-001", ResourceID: "res-001", Price: 5800, PlatformFee: 870, SellerIncome: 4930, Status: "paid", PaidAt: str("2024-03-18 14:20:00"), CreatedAt: "2024-03-18 14:18:00"},
		{ID: "order-003", OrderNo: "ORD-20240320-1003", BuyerID: "inst-002", SellerID: "inst-003", ResourceID: "res-002", Price: 4200, PlatformFee: 630, SellerIncome: 3570, Status: "paid", PaidAt: str("2024-03-20 09:15:00"), CreatedAt: "2024-03-20 09:12:00"},
		{ID: "order-004", OrderNo: "ORD-20240322-1004", BuyerID: "inst-004", SellerID: "inst-003", ResourceID: "res-005", Price: 1500, PlatformFee: 225, SellerIncome: 1275, Status: "paid", PaidAt: str("2024-03-22 16:45:00"), CreatedAt: "2024-03-22 16:42:00"},
		{ID: "order-005", OrderNo: "ORD-20240325-1005", BuyerID: "inst-002", SellerID: "inst-001", ResourceID: "res-003", Price: 3600, PlatformFee: 540, SellerIncome: 3060, Status: "paid", PaidAt: str("2024-03-25 11:00:00"), CreatedAt: "2024-03-25 10:58:00"},
		{ID: "order-006", OrderNo: "ORD-20240328-1006", BuyerID: "inst-004", SellerID: "inst-006", ResourceID: "res-004", Price: 2800, PlatformFee: 420, SellerIncome: 2380, Status: "paid", PaidAt: str("2024-03-28 13:30:00"), CreatedAt: "2024-03-28 13:28:00"},
	}

	auths := []Authorization{
		{ID: "auth-001", OrderID: "order-001", BuyerID: "inst-002", ResourceID: "res-001", AuthCode: "AUTH-A3B7-C9D2-E4F1", Status: 1, CreatedAt: "2024-03-15 10:30:00"},
		{ID: "auth-002", OrderID: "order-002", BuyerID: "inst-004", ResourceID: "res-001", AuthCode: "AUTH-B5C1-D7E3-F9A2", Status: 1, CreatedAt: "2024-03-18 14:20:00"},
		{ID: "auth-003", OrderID: "order-003", BuyerID: "inst-002", ResourceID: "res-002", AuthCode: "AUTH-C2D8-E1F4-A6B3", Status: 1, CreatedAt: "2024-03-20 09:15:00"},
		{ID: "auth-004", OrderID: "order-004", BuyerID: "inst-004", ResourceID: "res-005", AuthCode: "AUTH-D9E2-F5A1-B7C4", Status: 1, CreatedAt: "2024-03-22 16:45:00"},
		{ID: "auth-005", OrderID: "order-005", BuyerID: "inst-002", ResourceID: "res-003", AuthCode: "AUTH-E4F9-A2B6-C8D1", Status: 1, CreatedAt: "2024-03-25 11:00:00"},
		{ID: "auth-006", OrderID: "order-006", BuyerID: "inst-004", ResourceID: "res-004", AuthCode: "AUTH-F1A5-B9C3-D7E2", Status: 1, CreatedAt: "2024-03-28 13:30:00"},
	}

	for _, o := range orders {
		_, err := tx.Exec(ctx, `
			INSERT INTO orders (id, order_no, buyer_id, seller_id, resource_id, price, platform_fee, seller_income, status, paid_at, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			ON CONFLICT (id) DO UPDATE SET
				order_no = EXCLUDED.order_no, buyer_id = EXCLUDED.buyer_id, seller_id = EXCLUDED.seller_id,
				resource_id = EXCLUDED.resource_id, price = EXCLUDED.price, platform_fee = EXCLUDED.platform_fee,
				seller_income = EXCLUDED.seller_income, status = EXCLUDED.status, paid_at = EXCLUDED.paid_at,
				created_at = EXCLUDED.created_at
		`, o.ID, o.OrderNo, o.BuyerID, o.SellerID, o.ResourceID, o.Price, o.PlatformFee, o.SellerIncome,
			o.Status, parseOptionalDateTime(o.PaidAt), parseDateTime(o.CreatedAt))
		if err != nil {
			return fmt.Errorf("insert order %s: %w", o.ID, err)
		}
	}

	for _, a := range auths {
		_, err := tx.Exec(ctx, `
			INSERT INTO authorizations (id, order_id, buyer_id, resource_id, auth_code, status, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (id) DO UPDATE SET
				order_id = EXCLUDED.order_id, buyer_id = EXCLUDED.buyer_id, resource_id = EXCLUDED.resource_id,
				auth_code = EXCLUDED.auth_code, status = EXCLUDED.status, created_at = EXCLUDED.created_at
		`, a.ID, a.OrderID, a.BuyerID, a.ResourceID, a.AuthCode, a.Status, parseDateTime(a.CreatedAt))
		if err != nil {
			return fmt.Errorf("insert auth %s: %w", a.ID, err)
		}
	}
	return nil
}

func seedWithdrawals(ctx context.Context, tx pgx.Tx) error {
	withdrawals := []Withdrawal{
		{ID: "wd-001", InstitutionID: "inst-001", Amount: 5000, AccountType: "bank", AccountInfo: "中国工商银行 6222************8888", Status: "paid", HandledAt: str("2024-03-10 15:00:00"), CreatedAt: "2024-03-05 09:00:00"},
		{ID: "wd-002", InstitutionID: "inst-003", Amount: 3000, AccountType: "alipay", AccountInfo: "wangfang@yunzhi.com", Status: "approved", HandledAt: str("2024-03-20 10:00:00"), CreatedAt: "2024-03-18 14:00:00"},
		{ID: "wd-003", InstitutionID: "inst-006", Amount: 2000, AccountType: "bank", AccountInfo: "招商银行 6225************6666", Status: "pending", CreatedAt: "2024-03-28 11:00:00"},
	}

	for _, w := range withdrawals {
		_, err := tx.Exec(ctx, `
			INSERT INTO withdrawals (id, institution_id, amount, account_type, account_info, status, handled_at, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (id) DO UPDATE SET
				institution_id = EXCLUDED.institution_id, amount = EXCLUDED.amount, account_type = EXCLUDED.account_type,
				account_info = EXCLUDED.account_info, status = EXCLUDED.status, handled_at = EXCLUDED.handled_at,
				created_at = EXCLUDED.created_at
		`, w.ID, w.InstitutionID, w.Amount, w.AccountType, w.AccountInfo, w.Status, parseOptionalDateTime(w.HandledAt), parseDateTime(w.CreatedAt))
		if err != nil {
			return fmt.Errorf("insert withdrawal %s: %w", w.ID, err)
		}
	}
	return nil
}

func seedBanners(ctx context.Context, tx pgx.Tx) error {
	banners := []Banner{
		{ID: "bn-001", Title: "春季教学资源采购节", Image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80&auto=format&fit=crop", Link: "/", Sort: 1, Enabled: true},
		{ID: "bn-002", Title: "网络安全精品资源推荐", Image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80&auto=format&fit=crop", Link: "/", Sort: 2, Enabled: true},
		{ID: "bn-003", Title: "新入驻企业资源上线", Image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80&auto=format&fit=crop", Link: "/", Sort: 3, Enabled: true},
	}

	for _, b := range banners {
		_, err := tx.Exec(ctx, `
			INSERT INTO banners (id, title, image, link, sort, enabled)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title, image = EXCLUDED.image, link = EXCLUDED.link,
				sort = EXCLUDED.sort, enabled = EXCLUDED.enabled
		`, b.ID, b.Title, b.Image, b.Link, b.Sort, b.Enabled)
		if err != nil {
			return fmt.Errorf("insert banner %s: %w", b.ID, err)
		}
	}
	return nil
}

func seedPlatformConfig(ctx context.Context, tx pgx.Tx) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO platform_configs (key, value) VALUES
			('platform_fee_rate', '0.15'),
			('min_withdrawal_amount', '100')
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
	`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO platform_links (platform, url, enabled) VALUES
			('alliance', '/portal', true),
			('career', '/job/positions', true),
			('scene', '/scene/', true),
			('course', '/lesson/admin/system', true),
			('ability', '/evaluation/question-banks', true),
			('ai', '/portal', false),
			('resource', '/', true),
			('opc', '/portal', false),
			('decision', '/portal', false),
			('research', '/portal', false),
			('affairs', '/portal', false),
			('mall', '/', true)
		ON CONFLICT (platform) DO UPDATE SET url = EXCLUDED.url, enabled = EXCLUDED.enabled
	`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO app_modules (id, platform, title, description, href, sort_order) VALUES
			('aaaaaaaa-1111-1111-1111-111111111111', 'system', '租户信息管理', '管理租户基本信息与配置', '/portal/apps/system/tenant', 1),
			('aaaaaaaa-1111-1111-1111-111111111112', 'system', '系统资源管理', '套餐、编码、行业、专业', '/portal/apps/system/resource/package', 2),
			('aaaaaaaa-1111-1111-1111-111111111113', 'system', '日志管理', '登录日志、操作日志查看', '/portal/apps/system/logs/login', 3),
			('aaaaaaaa-1111-1111-1111-111111111114', 'system', '组织用户管理', '组织架构、用户账户管理', '/portal/apps/system/org-user/org-structure', 4),
			('aaaaaaaa-1111-1111-1111-111111111115', 'system', '审批流程管理', '审批流配置与管理', '/portal/apps/system/approval', 5),
			('aaaaaaaa-1111-1111-1111-111111111121', 'career', '岗位管理', '产业岗位与学习路径', '/job/positions', 1),
			('aaaaaaaa-1111-1111-1111-111111111122', 'career', '批次管理', '岗位批次与推荐', '/job/batches', 2),
			('aaaaaaaa-1111-1111-1111-111111111131', 'scene', '场景管理', '实践场景与任务设计', '/scene/', 1),
			('aaaaaaaa-1111-1111-1111-111111111132', 'scene', '场景归档', '历史场景档案库', '/scene/archive', 2),
			('aaaaaaaa-1111-1111-1111-111111111141', 'course', '体系课管理', '体系课程资源建设', '/lesson/admin/system', 1),
			('aaaaaaaa-1111-1111-1111-111111111142', 'course', '颗粒课管理', '颗粒化课程资源', '/lesson/admin/granular', 2),
			('aaaaaaaa-1111-1111-1111-111111111143', 'course', '混合课管理', '混合课模板与档案', '/lesson/admin/hybrid', 3),
			('aaaaaaaa-1111-1111-1111-111111111151', 'ability', '题库管理', '测评题库与试卷', '/evaluation/question-banks', 1),
			('aaaaaaaa-1111-1111-1111-111111111152', 'ability', '考试管理', '考试场次与结果', '/evaluation/exam-usage', 2),
			('aaaaaaaa-1111-1111-1111-111111111153', 'ability', '微证书', '认证规则与颁发', '/evaluation/certificates/templates', 3),
			('aaaaaaaa-1111-1111-1111-111111111161', 'resource', '资源商城', '教学资源交易', '/', 1)
		ON CONFLICT (id) DO UPDATE SET
			platform = EXCLUDED.platform, title = EXCLUDED.title,
			description = EXCLUDED.description, href = EXCLUDED.href, sort_order = EXCLUDED.sort_order
	`)
	return err
}

func seedUsers(ctx context.Context, tx pgx.Tx) error {
	tenantID := uuid.MustParse("11111111-1111-1111-1111-111111111111")

	users := []struct {
		ID             uuid.UUID
		InstitutionID  *string
		IdentityTypeID uuid.UUID
		OrgNodeID      *uuid.UUID
		MajorID        *uuid.UUID
		Role           string
		Username       string
		Password       string
		Name           string
		Email          string
		Phone          string
		StudentNo      *string
	}{
		{
			ID:             uuid.MustParse("71111111-1111-1111-1111-111111111111"),
			IdentityTypeID: uuid.MustParse("41111111-1111-1111-1111-111111111111"),
			Role:           "operator", Username: "operator", Password: "operator123",
			Name: "平台管理员", Email: "admin@zhiyu.com", Phone: "13800000001",
		},
		{
			ID:             uuid.MustParse("71111111-1111-1111-1111-111111111112"),
			InstitutionID:  str("inst-002"),
			IdentityTypeID: uuid.MustParse("41111111-1111-1111-1111-111111111112"),
			OrgNodeID:      uuidPtr("31111111-1111-1111-1111-111111111111"),
			Role:           "school", Username: "school", Password: "school123",
			Name: "李华", Email: "lihua@bitc.edu.cn", Phone: "13900000002",
		},
		{
			ID:             uuid.MustParse("71111111-1111-1111-1111-111111111113"),
			InstitutionID:  str("inst-001"),
			IdentityTypeID: uuid.MustParse("41111111-1111-1111-1111-111111111115"),
			OrgNodeID:      nil,
			Role:           "enterprise", Username: "enterprise", Password: "enterprise123",
			Name: "张明", Email: "zhangming@cybersec.com", Phone: "13800000003",
		},
		{
			ID:             uuid.MustParse("71111111-1111-1111-1111-111111111114"),
			InstitutionID:  str("inst-002"),
			IdentityTypeID: uuid.MustParse("41111111-1111-1111-1111-111111111113"),
			OrgNodeID:      uuidPtr("31111111-1111-1111-1111-111111111112"),
			MajorID:        uuidPtr("51111111-1111-1111-1111-111111111111"),
			Role:           "school", Username: "teacher", Password: "teacher123",
			Name: "王老师", Email: "teacher@bitc.edu.cn", Phone: "13900000004",
		},
		{
			ID:             uuid.MustParse("71111111-1111-1111-1111-111111111115"),
			InstitutionID:  str("inst-002"),
			IdentityTypeID: uuid.MustParse("41111111-1111-1111-1111-111111111114"),
			OrgNodeID:      uuidPtr("31111111-1111-1111-1111-111111111114"),
			MajorID:        uuidPtr("51111111-1111-1111-1111-111111111111"),
			Role:           "school", Username: "student", Password: "student123",
			Name: "张学生", Email: "student@bitc.edu.cn", Phone: "13900000005", StudentNo: str("20230101"),
		},
	}

	for _, u := range users {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("hash password for %s: %w", u.Username, err)
		}

		var orgNodeID, majorID *uuid.UUID
		if u.OrgNodeID != nil {
			orgNodeID = u.OrgNodeID
		}
		if u.MajorID != nil {
			majorID = u.MajorID
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO users (id, tenant_id, institution_id, identity_type_id, org_node_id, major_id,
				role, login_name, username, password_hash, name, email, phone, avatar_url, student_no,
				status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'active', NOW(), NOW())
			ON CONFLICT (id) DO UPDATE SET
				tenant_id = EXCLUDED.tenant_id, institution_id = EXCLUDED.institution_id,
				identity_type_id = EXCLUDED.identity_type_id, org_node_id = EXCLUDED.org_node_id,
				major_id = EXCLUDED.major_id, role = EXCLUDED.role, login_name = EXCLUDED.login_name,
				username = EXCLUDED.username, password_hash = EXCLUDED.password_hash, name = EXCLUDED.name,
				email = EXCLUDED.email, phone = EXCLUDED.phone, avatar_url = EXCLUDED.avatar_url,
				student_no = EXCLUDED.student_no, status = EXCLUDED.status, updated_at = NOW()
		`, u.ID, tenantID, u.InstitutionID, u.IdentityTypeID, orgNodeID, majorID,
			u.Role, u.Username, u.Username, string(hash), u.Name, u.Email, u.Phone, nil, u.StudentNo)
		if err != nil {
			return fmt.Errorf("insert user %s: %w", u.Username, err)
		}

		// Assign default role by identity type
		_, err = tx.Exec(ctx, `
			INSERT INTO user_roles (id, user_id, role_id)
			VALUES ($1, $2, (SELECT id FROM roles WHERE tenant_id = $3 AND code = $4 LIMIT 1))
			ON CONFLICT (user_id, role_id) DO NOTHING
		`, uuid.NewString(), u.ID, tenantID, identityTypeIDToRoleCode(u.IdentityTypeID))
		if err != nil {
			return fmt.Errorf("assign role for user %s: %w", u.Username, err)
		}
	}

	// Seed platform admin as tenant admin
	_, err := tx.Exec(ctx, `
		UPDATE tenants SET admin_ids = ARRAY[$1::UUID] WHERE id = $2
	`, uuid.MustParse("71111111-1111-1111-1111-111111111111"), tenantID)
	if err != nil {
		return fmt.Errorf("update tenant admin_ids: %w", err)
	}

	return nil
}

func identityTypeIDToRoleCode(id uuid.UUID) string {
	switch id.String() {
	case "41111111-1111-1111-1111-111111111111":
		return "platform_admin"
	case "41111111-1111-1111-1111-111111111112":
		return "school_admin"
	case "41111111-1111-1111-1111-111111111113":
		return "teacher"
	case "41111111-1111-1111-1111-111111111114":
		return "student"
	case "41111111-1111-1111-1111-111111111115":
		return "enterprise_hr"
	case "41111111-1111-1111-1111-111111111116":
		return "enterprise_mentor"
	default:
		return "student"
	}
}

func mapRoleToRoleCode(role string, identityTypeCode ...string) string {
	if len(identityTypeCode) > 0 {
		switch identityTypeCode[0] {
		case "platform_admin":
			return "platform_admin"
		case "school_admin":
			return "school_admin"
		case "teacher":
			return "teacher"
		case "student":
			return "student"
		case "enterprise_hr":
			return "enterprise_hr"
		case "enterprise_mentor":
			return "enterprise_mentor"
		}
	}
	switch role {
	case "operator":
		return "platform_admin"
	case "school":
		return "school_admin"
	case "enterprise":
		return "enterprise_hr"
	default:
		return "student"
	}
}

func str(s string) *string {
	return &s
}

func uuidPtr(s string) *uuid.UUID {
	id, err := uuid.Parse(s)
	if err != nil {
		return nil
	}
	return &id
}

func parseDate(s string) time.Time {
	t, _ := time.Parse("2006-01-02", s)
	return t
}

func parseDateTime(s string) time.Time {
	t, _ := time.Parse("2006-01-02 15:04:05", s)
	return t
}

func parseOptionalDateTime(s *string) *time.Time {
	if s == nil {
		return nil
	}
	t := parseDateTime(*s)
	return &t
}
