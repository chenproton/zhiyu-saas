package router

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	authmw "github.com/zhiyu-saas/backend/internal/middleware"
	"github.com/zhiyu-saas/backend/internal/handler"
)

func New(db *pgxpool.Pool, jwtSecret string) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	authHandler := &handler.AuthHandler{DB: db, JWTSecret: jwtSecret}
	institutionHandler := &handler.InstitutionHandler{DB: db}
	resourceHandler := &handler.ResourceHandler{DB: db}
	orderHandler := &handler.OrderHandler{DB: db}
	bannerHandler := &handler.BannerHandler{DB: db}
	withdrawalHandler := &handler.WithdrawalHandler{DB: db}
	statsHandler := &handler.StatsHandler{DB: db}

	// Phase 3.1: portal management handlers
	tenantHandler := &handler.TenantHandler{DB: db}
	orgHandler := &handler.OrgHandler{DB: db}
	orgTypeHandler := &handler.OrgTypeHandler{DB: db}
	identityTypeHandler := &handler.IdentityTypeHandler{DB: db}
	userManagementHandler := &handler.UserManagementHandler{DB: db}
	roleHandler := &handler.RoleHandler{DB: db}
	majorHandler := &handler.MajorHandler{DB: db}
	industryHandler := &handler.IndustryHandler{DB: db}
	resourceCodeHandler := &handler.ResourceCodeHandler{DB: db}
	logHandler := &handler.LogHandler{DB: db}
	subscriptionHandler := &handler.SubscriptionHandler{DB: db}
	platformLinkHandler := &handler.PlatformLinkHandler{DB: db}
	appModuleHandler := &handler.AppModuleHandler{DB: db}

	// Shared workflow & approval handlers
	workflowHandler := &handler.WorkflowHandler{DB: db}
	approvalHandler := &handler.ApprovalHandler{DB: db}

	// Phase 3.2: job handlers
	positionHandler := &handler.PositionHandler{DB: db}
	abilityHandler := &handler.AbilityHandler{DB: db}
	positionAbilityHandler := &handler.PositionAbilityHandler{DB: db}
	abilityDomainHandler := &handler.AbilityDomainHandler{DB: db}
	jobBatchHandler := &handler.JobBatchHandler{DB: db}
	recommendHandler := &handler.RecommendHandler{DB: db}
	learnRoadHandler := &handler.LearnRoadHandler{DB: db}
	jobBannerHandler := &handler.JobBannerHandler{DB: db}

	// Phase 3.3: scene handlers
	scenarioHandler := &handler.ScenarioHandler{DB: db}
	scenarioTaskHandler := &handler.ScenarioTaskHandler{DB: db}
	taskEvaluationHandler := &handler.TaskEvaluationHandler{DB: db}
	taskResourceHandler := &handler.TaskResourceHandler{DB: db}
	taskKnowledgeAbilityHandler := &handler.TaskKnowledgeAbilityHandler{DB: db}
	scenarioWeightHandler := &handler.ScenarioWeightHandler{DB: db}
	scenarioGradeHandler := &handler.ScenarioGradeHandler{DB: db}
	sceneBatchHandler := &handler.SceneBatchHandler{DB: db}

	// Phase 3.4: lesson handlers
	courseHandler := &handler.CourseHandler{DB: db}
	knowledgePointHandler := &handler.KnowledgePointHandler{DB: db}
	courseNodeHandler := &handler.CourseNodeHandler{DB: db}
	nodeQuizHandler := &handler.NodeQuizHandler{DB: db}
	nodeHomeworkHandler := &handler.NodeHomeworkHandler{DB: db}
	hybridModuleHandler := &handler.HybridModuleHandler{DB: db}
	courseBatchHandler := &handler.CourseBatchHandler{DB: db}

	// Phase 3.5: evaluation handlers
	questionBankHandler := &handler.QuestionBankHandler{DB: db}
	questionHandler := &handler.QuestionHandler{DB: db}
	examHandler := &handler.ExamHandler{DB: db}
	examUsageHandler := &handler.ExamUsageHandler{DB: db}
	evaluationResultHandler := &handler.EvaluationResultHandler{DB: db}
	certificationHandler := &handler.CertificationHandler{DB: db}
	graduationHandler := &handler.GraduationHandler{DB: db}
	studentPortraitHandler := &handler.StudentPortraitHandler{DB: db}
	microCertHandler := &handler.MicroCertHandler{DB: db}
	appealHandler := &handler.AppealHandler{DB: db}
	evaluationMethodHandler := &handler.EvaluationMethodHandler{DB: db}
	evaluationBatchHandler := &handler.EvaluationBatchHandler{DB: db}

	auth := authmw.JWT(jwtSecret)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok"}`))
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/login", authHandler.Login)
		r.Get("/banners", bannerHandler.List)
		r.Get("/resources", resourceHandler.List)
		r.Get("/resources/{id}", resourceHandler.Get)
		r.Post("/resources/{id}/view", resourceHandler.IncrementView)
		r.Get("/platform-links", platformLinkHandler.List)
		r.Get("/app-modules", appModuleHandler.List)

		r.Group(func(r chi.Router) {
			r.Use(auth)

			r.Get("/auth/me", authHandler.Me)
			r.Get("/stats/dashboard", statsHandler.Dashboard)
			r.Get("/stats/me", statsHandler.MyStats)
			r.Get("/config", statsHandler.GetConfig)
			r.Put("/config", statsHandler.UpdateConfig)

			r.Get("/institutions", institutionHandler.List)
			r.Get("/institutions/{id}", institutionHandler.Get)
			r.Post("/institutions", institutionHandler.Create)
			r.Put("/institutions/{id}", institutionHandler.Update)
			r.Post("/institutions/{id}/approve", institutionHandler.Approve)
			r.Post("/institutions/{id}/disable", institutionHandler.Disable)

			r.Post("/resources", resourceHandler.Create)
			r.Put("/resources/{id}", resourceHandler.Update)
			r.Delete("/resources/{id}", resourceHandler.Delete)
			r.Post("/resources/{id}/submit", resourceHandler.SubmitForReview)
			r.Post("/resources/{id}/review", resourceHandler.Review)
			r.Post("/resources/{id}/publish", resourceHandler.Publish)
			r.Post("/resources/{id}/offline", resourceHandler.Offline)

			r.Get("/orders", orderHandler.List)
			r.Get("/orders/{id}", orderHandler.Get)
			r.Post("/orders", orderHandler.Create)
			r.Post("/orders/{id}/pay", orderHandler.Pay)
			r.Get("/authorizations", orderHandler.ListAuthorizations)
			r.Get("/authorizations/{code}", orderHandler.VerifyAuthorization)

			r.Get("/withdrawals", withdrawalHandler.List)
			r.Post("/withdrawals", withdrawalHandler.Create)
			r.Post("/withdrawals/{id}/status", withdrawalHandler.UpdateStatus)

			r.Post("/banners", bannerHandler.Create)
			r.Put("/banners/{id}", bannerHandler.Update)
			r.Delete("/banners/{id}", bannerHandler.Delete)

			// Phase 3.1: portal management routes
			r.Get("/tenants", tenantHandler.List)
			r.Get("/tenants/{id}", tenantHandler.Get)
			r.Post("/tenants", tenantHandler.Create)
			r.Put("/tenants/{id}", tenantHandler.Update)
			r.Post("/tenants/{id}/status", tenantHandler.UpdateStatus)

			r.Get("/organizations", orgHandler.List)
			r.Get("/organizations/tree", orgHandler.Tree)
			r.Get("/organizations/{id}", orgHandler.Get)
			r.Post("/organizations", orgHandler.Create)
			r.Put("/organizations/{id}", orgHandler.Update)
			r.Delete("/organizations/{id}", orgHandler.Delete)

			r.Get("/org-types", orgTypeHandler.List)
			r.Get("/org-types/{id}", orgTypeHandler.Get)
			r.Post("/org-types", orgTypeHandler.Create)
			r.Put("/org-types/{id}", orgTypeHandler.Update)
			r.Delete("/org-types/{id}", orgTypeHandler.Delete)

			r.Get("/identity-types", identityTypeHandler.List)
			r.Get("/identity-types/{id}", identityTypeHandler.Get)
			r.Post("/identity-types", identityTypeHandler.Create)
			r.Put("/identity-types/{id}", identityTypeHandler.Update)
			r.Delete("/identity-types/{id}", identityTypeHandler.Delete)

			r.Get("/users", userManagementHandler.List)
			r.Get("/users/{id}", userManagementHandler.Get)
			r.Post("/users", userManagementHandler.Create)
			r.Put("/users/{id}", userManagementHandler.Update)
			r.Delete("/users/{id}", userManagementHandler.Delete)
			r.Post("/users/{id}/status", userManagementHandler.UpdateStatus)
			r.Post("/users/batch", userManagementHandler.BatchCreate)

			r.Get("/roles", roleHandler.List)
			r.Get("/roles/{id}", roleHandler.Get)
			r.Post("/roles", roleHandler.Create)
			r.Put("/roles/{id}", roleHandler.Update)
			r.Delete("/roles/{id}", roleHandler.Delete)
			r.Post("/roles/{id}/assign", roleHandler.Assign)

			r.Get("/majors", majorHandler.List)
			r.Get("/majors/{id}", majorHandler.Get)
			r.Post("/majors", majorHandler.Create)
			r.Put("/majors/{id}", majorHandler.Update)
			r.Delete("/majors/{id}", majorHandler.Delete)

			r.Get("/industries", industryHandler.List)
			r.Get("/industries/{id}", industryHandler.Get)
			r.Post("/industries", industryHandler.Create)
			r.Put("/industries/{id}", industryHandler.Update)
			r.Delete("/industries/{id}", industryHandler.Delete)

			r.Get("/resource-codes", resourceCodeHandler.List)
			r.Get("/resource-codes/{id}", resourceCodeHandler.Get)
			r.Post("/resource-codes", resourceCodeHandler.Create)
			r.Put("/resource-codes/{id}", resourceCodeHandler.Update)
			r.Delete("/resource-codes/{id}", resourceCodeHandler.Delete)

			r.Get("/logs/login", logHandler.LoginLogs)
			r.Get("/logs/operation", logHandler.OperationLogs)

			r.Get("/subscriptions", subscriptionHandler.Get)
			r.Put("/subscriptions/{id}", subscriptionHandler.Update)

			r.Get("/platform-links/{id}", platformLinkHandler.Get)
			r.Post("/platform-links", platformLinkHandler.Create)
			r.Put("/platform-links/{id}", platformLinkHandler.Update)
			r.Delete("/platform-links/{id}", platformLinkHandler.Delete)

			r.Get("/app-modules/{id}", appModuleHandler.Get)
			r.Post("/app-modules", appModuleHandler.Create)
			r.Put("/app-modules/{id}", appModuleHandler.Update)
			r.Delete("/app-modules/{id}", appModuleHandler.Delete)

			// Shared workflow & approval routes
			r.Get("/workflows", workflowHandler.List)
			r.Post("/workflows", workflowHandler.Create)
			r.Get("/workflows/{id}", workflowHandler.Get)
			r.Put("/workflows/{id}", workflowHandler.Update)
			r.Delete("/workflows/{id}", workflowHandler.Delete)

			r.Get("/approvals", approvalHandler.List)
			r.Post("/approvals", approvalHandler.Create)
			r.Get("/approvals/{id}", approvalHandler.Get)
			r.Post("/approvals/{id}/review", approvalHandler.Review)

			// Phase 3.2: job routes
			r.Get("/job/positions", positionHandler.List)
			r.Get("/job/positions/{id}", positionHandler.Get)
			r.Post("/job/positions", positionHandler.Create)
			r.Put("/job/positions/{id}", positionHandler.Update)
			r.Delete("/job/positions/{id}", positionHandler.Delete)
			r.Post("/job/positions/{id}/submit", positionHandler.Submit)
			r.Post("/job/positions/{id}/review", positionHandler.Review)
			r.Post("/job/positions/{id}/publish", positionHandler.Publish)
			r.Post("/job/positions/{id}/archive", positionHandler.Archive)

			r.Get("/job/abilities", abilityHandler.List)
			r.Get("/job/abilities/{id}", abilityHandler.Get)
			r.Post("/job/abilities", abilityHandler.Create)
			r.Put("/job/abilities/{id}", abilityHandler.Update)
			r.Delete("/job/abilities/{id}", abilityHandler.Delete)

			r.Get("/job/position-abilities", positionAbilityHandler.ListBindings)
			r.Post("/job/position-abilities", positionAbilityHandler.CreateBinding)
			r.Put("/job/position-abilities/{id}", positionAbilityHandler.UpdateBinding)
			r.Delete("/job/position-abilities/{id}", positionAbilityHandler.DeleteBinding)

			r.Get("/job/ability-domains", abilityDomainHandler.List)
			r.Post("/job/ability-domains", abilityDomainHandler.Create)
			r.Put("/job/ability-domains/{id}", abilityDomainHandler.Update)
			r.Delete("/job/ability-domains/{id}", abilityDomainHandler.Delete)

			r.Get("/job/batches", jobBatchHandler.List)
			r.Get("/job/batches/{id}", jobBatchHandler.Get)
			r.Post("/job/batches", jobBatchHandler.Create)
			r.Put("/job/batches/{id}", jobBatchHandler.Update)
			r.Delete("/job/batches/{id}", jobBatchHandler.Delete)
			r.Post("/job/batches/{id}/status", jobBatchHandler.UpdateStatus)

			r.Get("/job/recommendations", recommendHandler.List)
			r.Post("/job/recommendations", recommendHandler.Create)
			r.Put("/job/recommendations/{id}", recommendHandler.Update)
			r.Delete("/job/recommendations/{id}", recommendHandler.Delete)

			r.Get("/job/learn-roads", learnRoadHandler.List)
			r.Get("/job/learn-roads/{id}", learnRoadHandler.Get)
			r.Post("/job/learn-roads", learnRoadHandler.Create)
			r.Put("/job/learn-roads/{id}", learnRoadHandler.Update)
			r.Delete("/job/learn-roads/{id}", learnRoadHandler.Delete)

			r.Get("/job/banners", jobBannerHandler.List)
			r.Get("/job/banners/{id}", jobBannerHandler.Get)
			r.Post("/job/banners", jobBannerHandler.Create)
			r.Put("/job/banners/{id}", jobBannerHandler.Update)
			r.Delete("/job/banners/{id}", jobBannerHandler.Delete)

			// Phase 3.3: scene routes
			r.Get("/scene/scenarios", scenarioHandler.List)
			r.Get("/scene/scenarios/{id}", scenarioHandler.Get)
			r.Post("/scene/scenarios", scenarioHandler.Create)
			r.Put("/scene/scenarios/{id}", scenarioHandler.Update)
			r.Delete("/scene/scenarios/{id}", scenarioHandler.Delete)
			r.Post("/scene/scenarios/{id}/submit", scenarioHandler.Submit)
			r.Post("/scene/scenarios/{id}/review", scenarioHandler.Review)
			r.Post("/scene/scenarios/{id}/publish", scenarioHandler.Publish)
			r.Post("/scene/scenarios/{id}/archive", scenarioHandler.Archive)

			r.Get("/scene/tasks", scenarioTaskHandler.List)
			r.Get("/scene/tasks/{id}", scenarioTaskHandler.Get)
			r.Post("/scene/tasks", scenarioTaskHandler.Create)
			r.Put("/scene/tasks/{id}", scenarioTaskHandler.Update)
			r.Delete("/scene/tasks/{id}", scenarioTaskHandler.Delete)
			r.Post("/scene/tasks/reorder", scenarioTaskHandler.Reorder)

			r.Get("/scene/evaluation", taskEvaluationHandler.ListConfigs)
			r.Post("/scene/evaluation", taskEvaluationHandler.UpsertConfig)
			r.Delete("/scene/evaluation/{id}", taskEvaluationHandler.DeleteConfig)
			r.Get("/scene/evaluation/{id}/points", taskEvaluationHandler.ListEvalPoints)
			r.Post("/scene/evaluation/{id}/points", taskEvaluationHandler.UpsertEvalPoint)
			r.Put("/scene/evaluation/points/{id}", taskEvaluationHandler.UpsertEvalPoint)
			r.Delete("/scene/evaluation/points/{id}", taskEvaluationHandler.DeleteEvalPoint)
			r.Get("/scene/evaluation/{id}/steps", taskEvaluationHandler.ListReviewSteps)
			r.Post("/scene/evaluation/{id}/steps", taskEvaluationHandler.UpsertReviewStep)
			r.Put("/scene/evaluation/steps/{id}", taskEvaluationHandler.UpsertReviewStep)

			r.Get("/scene/task-resources", taskResourceHandler.ListResources)
			r.Post("/scene/task-resources", taskResourceHandler.BindResource)
			r.Delete("/scene/task-resources/{id}", taskResourceHandler.UnbindResource)

			r.Post("/scene/task-bindings/knowledge", taskKnowledgeAbilityHandler.BindKnowledge)
			r.Delete("/scene/task-bindings/knowledge/{id}", taskKnowledgeAbilityHandler.UnbindKnowledge)
			r.Post("/scene/task-bindings/ability", taskKnowledgeAbilityHandler.BindAbility)
			r.Delete("/scene/task-bindings/ability/{id}", taskKnowledgeAbilityHandler.UnbindAbility)

			r.Get("/scene/weights", scenarioWeightHandler.ListWeights)
			r.Post("/scene/weights", scenarioWeightHandler.UpsertWeight)
			r.Put("/scene/weights/{id}", scenarioWeightHandler.UpsertWeight)

			r.Get("/scene/grade-mappings", scenarioGradeHandler.ListGradeMappings)
			r.Post("/scene/grade-mappings", scenarioGradeHandler.UpsertGradeMapping)
			r.Put("/scene/grade-mappings/{id}", scenarioGradeHandler.UpsertGradeMapping)

			r.Get("/scene/batches", sceneBatchHandler.List)
			r.Post("/scene/batches", sceneBatchHandler.Create)
			r.Get("/scene/batches/{id}", sceneBatchHandler.Get)
			r.Put("/scene/batches/{id}", sceneBatchHandler.Update)
			r.Delete("/scene/batches/{id}", sceneBatchHandler.Delete)
			r.Post("/scene/batches/{id}/status", sceneBatchHandler.UpdateStatus)

			// Phase 3.4: lesson routes
			r.Get("/lesson/courses", courseHandler.List)
			r.Get("/lesson/courses/{id}", courseHandler.Get)
			r.Post("/lesson/courses", courseHandler.Create)
			r.Put("/lesson/courses/{id}", courseHandler.Update)
			r.Delete("/lesson/courses/{id}", courseHandler.Delete)
			r.Post("/lesson/courses/{id}/submit", courseHandler.Submit)
			r.Post("/lesson/courses/{id}/review", courseHandler.Review)
			r.Post("/lesson/courses/{id}/publish", courseHandler.Publish)
			r.Post("/lesson/courses/{id}/archive", courseHandler.Archive)

			r.Get("/lesson/knowledge-points", knowledgePointHandler.List)
			r.Get("/lesson/knowledge-points/{id}", knowledgePointHandler.Get)
			r.Post("/lesson/knowledge-points", knowledgePointHandler.Create)
			r.Put("/lesson/knowledge-points/{id}", knowledgePointHandler.Update)
			r.Delete("/lesson/knowledge-points/{id}", knowledgePointHandler.Delete)

			r.Get("/lesson/nodes", courseNodeHandler.List)
			r.Get("/lesson/nodes/{id}", courseNodeHandler.Get)
			r.Post("/lesson/nodes", courseNodeHandler.Create)
			r.Put("/lesson/nodes/{id}", courseNodeHandler.Update)
			r.Delete("/lesson/nodes/{id}", courseNodeHandler.Delete)
			r.Post("/lesson/nodes/reorder", courseNodeHandler.Reorder)

			r.Get("/lesson/quizzes", nodeQuizHandler.ListQuizzes)
			r.Post("/lesson/quizzes", nodeQuizHandler.CreateQuiz)
			r.Get("/lesson/quizzes/{id}", nodeQuizHandler.ListQuestions)
			r.Put("/lesson/quizzes/{id}", nodeQuizHandler.UpdateQuiz)
			r.Delete("/lesson/quizzes/{id}", nodeQuizHandler.DeleteQuiz)
			r.Post("/lesson/quizzes/{id}/questions", nodeQuizHandler.AddQuestion)
			r.Put("/lesson/quizzes/questions/{questionId}", nodeQuizHandler.UpdateQuestion)
			r.Delete("/lesson/quizzes/questions/{questionId}", nodeQuizHandler.DeleteQuestion)

			r.Get("/lesson/homeworks", nodeHomeworkHandler.List)
			r.Get("/lesson/homeworks/{id}", nodeHomeworkHandler.Get)
			r.Post("/lesson/homeworks", nodeHomeworkHandler.Create)
			r.Put("/lesson/homeworks/{id}", nodeHomeworkHandler.Update)
			r.Delete("/lesson/homeworks/{id}", nodeHomeworkHandler.Delete)

			r.Get("/lesson/hybrid-modules", hybridModuleHandler.ListModules)
			r.Post("/lesson/hybrid-modules", hybridModuleHandler.UpsertModule)
			r.Put("/lesson/hybrid-modules/{id}", hybridModuleHandler.UpsertModule)
			r.Delete("/lesson/hybrid-modules/{id}", hybridModuleHandler.DeleteModule)

			r.Get("/lesson/batches", courseBatchHandler.List)
			r.Get("/lesson/batches/{id}", courseBatchHandler.Get)
			r.Post("/lesson/batches", courseBatchHandler.Create)
			r.Put("/lesson/batches/{id}", courseBatchHandler.Update)
			r.Delete("/lesson/batches/{id}", courseBatchHandler.Delete)
			r.Post("/lesson/batches/{id}/status", courseBatchHandler.UpdateStatus)

			// Phase 3.5: evaluation routes
			r.Get("/evaluation/question-banks", questionBankHandler.List)
			r.Get("/evaluation/question-banks/{id}", questionBankHandler.Get)
			r.Post("/evaluation/question-banks", questionBankHandler.Create)
			r.Put("/evaluation/question-banks/{id}", questionBankHandler.Update)
			r.Delete("/evaluation/question-banks/{id}", questionBankHandler.Delete)
			r.Post("/evaluation/question-banks/{id}/submit", questionBankHandler.Submit)
			r.Post("/evaluation/question-banks/{id}/review", questionBankHandler.Review)
			r.Post("/evaluation/question-banks/{id}/publish", questionBankHandler.Publish)
			r.Post("/evaluation/question-banks/{id}/archive", questionBankHandler.Archive)

			r.Get("/evaluation/questions", questionHandler.List)
			r.Get("/evaluation/questions/{id}", questionHandler.Get)
			r.Post("/evaluation/questions", questionHandler.Create)
			r.Put("/evaluation/questions/{id}", questionHandler.Update)
			r.Delete("/evaluation/questions/{id}", questionHandler.Delete)
			r.Post("/evaluation/questions/batch", questionHandler.BatchCreate)

			r.Get("/evaluation/exams", examHandler.List)
			r.Get("/evaluation/exams/{id}", examHandler.Get)
			r.Post("/evaluation/exams", examHandler.Create)
			r.Put("/evaluation/exams/{id}", examHandler.Update)
			r.Delete("/evaluation/exams/{id}", examHandler.Delete)
			r.Post("/evaluation/exams/{id}/submit", examHandler.Submit)
			r.Post("/evaluation/exams/{id}/review", examHandler.Review)
			r.Post("/evaluation/exams/{id}/publish", examHandler.Publish)
			r.Post("/evaluation/exams/{id}/archive", examHandler.Archive)
			r.Post("/evaluation/exams/{id}/questions", examHandler.AddQuestion)
			r.Delete("/evaluation/exams/{id}/questions/{questionId}", examHandler.RemoveQuestion)

			r.Get("/evaluation/exam-usages", examUsageHandler.List)
			r.Get("/evaluation/exam-usages/{id}", examUsageHandler.Get)
			r.Post("/evaluation/exam-usages", examUsageHandler.Create)
			r.Put("/evaluation/exam-usages/{id}", examUsageHandler.Update)
			r.Delete("/evaluation/exam-usages/{id}", examUsageHandler.Delete)
			r.Post("/evaluation/exam-usages/{id}/start", examUsageHandler.Start)
			r.Post("/evaluation/exam-usages/{id}/finish", examUsageHandler.Finish)

			r.Get("/evaluation/results", evaluationResultHandler.List)
			r.Get("/evaluation/results/{id}", evaluationResultHandler.Get)
			r.Post("/evaluation/results/{id}/grade", evaluationResultHandler.Grade)
			r.Post("/evaluation/results/batch-grade", evaluationResultHandler.BatchGrade)

			r.Get("/evaluation/certifications", certificationHandler.ListRules)
			r.Get("/evaluation/certifications/{id}", certificationHandler.GetRule)
			r.Post("/evaluation/certifications", certificationHandler.CreateRule)
			r.Put("/evaluation/certifications/{id}", certificationHandler.UpdateRule)
			r.Delete("/evaluation/certifications/{id}", certificationHandler.DeleteRule)
			r.Get("/evaluation/certifications/{id}/items", certificationHandler.ConfigItems)
			r.Post("/evaluation/certifications/{id}/items", certificationHandler.ConfigItems)
			r.Get("/evaluation/certifications/items/{id}/points", certificationHandler.ConfigPoints)
			r.Post("/evaluation/certifications/items/{id}/points", certificationHandler.ConfigPoints)

			r.Get("/evaluation/graduation/topics", graduationHandler.ListTopics)
			r.Get("/evaluation/graduation/topics/{id}", graduationHandler.GetTopic)
			r.Post("/evaluation/graduation/topics", graduationHandler.CreateTopic)
			r.Put("/evaluation/graduation/topics/{id}", graduationHandler.UpdateTopic)
			r.Delete("/evaluation/graduation/topics/{id}", graduationHandler.DeleteTopic)
			r.Post("/evaluation/graduation/topics/{id}/apply", graduationHandler.ApplyTopic)
			r.Get("/evaluation/graduation/archives", graduationHandler.ArchivesCRUD)
			r.Post("/evaluation/graduation/archives", graduationHandler.ArchivesCRUD)
			r.Get("/evaluation/graduation/evaluations", graduationHandler.EvaluationsCRUD)
			r.Post("/evaluation/graduation/evaluations", graduationHandler.EvaluationsCRUD)
			r.Get("/evaluation/graduation/query", graduationHandler.QueryResults)

			r.Get("/evaluation/portraits", studentPortraitHandler.List)
			r.Get("/evaluation/portraits/{id}", studentPortraitHandler.Get)
			r.Post("/evaluation/portraits/generate", studentPortraitHandler.Generate)
			r.Get("/evaluation/portraits/archives", studentPortraitHandler.ListArchives)
			r.Post("/evaluation/portraits/archives", studentPortraitHandler.CreateArchive)

			r.Get("/evaluation/certificates/templates", microCertHandler.ListTemplates)
			r.Post("/evaluation/certificates/templates", microCertHandler.CreateTemplate)
			r.Get("/evaluation/certificates/templates/{id}", microCertHandler.ListTemplates)
			r.Put("/evaluation/certificates/templates/{id}", microCertHandler.UpdateTemplate)
			r.Delete("/evaluation/certificates/templates/{id}", microCertHandler.DeleteTemplate)
			r.Post("/evaluation/certificates/issue", microCertHandler.IssueCerts)
			r.Get("/evaluation/certificates/history", microCertHandler.ListHistory)

			r.Get("/evaluation/methods/categories", evaluationMethodHandler.ListCategories)
			r.Get("/evaluation/methods", evaluationMethodHandler.ListMethods)
			r.Post("/evaluation/methods/{id}/toggle", evaluationMethodHandler.Toggle)

			r.Get("/evaluation/appeals", appealHandler.List)
			r.Get("/evaluation/appeals/{id}", appealHandler.Get)
			r.Post("/evaluation/appeals", appealHandler.Create)
			r.Post("/evaluation/appeals/{id}/process", appealHandler.Process)

			r.Get("/evaluation/batches", evaluationBatchHandler.List)
			r.Post("/evaluation/batches", evaluationBatchHandler.Create)
			r.Get("/evaluation/batches/{id}", evaluationBatchHandler.Get)
			r.Put("/evaluation/batches/{id}", evaluationBatchHandler.Update)
			r.Delete("/evaluation/batches/{id}", evaluationBatchHandler.Delete)
			r.Post("/evaluation/batches/{id}/status", evaluationBatchHandler.UpdateStatus)
		})
	})

	return r
}
