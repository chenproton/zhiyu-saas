package handler_test

import (
	"context"
	"net/http"
	"testing"

	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/handler/testhelper"
)

type createTenantResp struct {
	Tenant    domain.Tenant `json:"tenant"`
}

func cleanupTenant(ctx context.Context, t *testing.T, env *testhelper.TestEnv, tenantID string) {
	t.Helper()
	env.DB.Exec(ctx, "DELETE FROM users WHERE login_name = $1", "admin-test-create")
	env.DB.Exec(ctx, "DELETE FROM users WHERE login_name = $1", "admin-list-a")
	env.DB.Exec(ctx, "DELETE FROM users WHERE login_name = $1", "admin-list-b")
	env.DB.Exec(ctx, "DELETE FROM users WHERE login_name = $1", "admin-get-test")
	env.DB.Exec(ctx, "DELETE FROM users WHERE login_name = $1", "admin-update-test")
	env.DB.Exec(ctx, "DELETE FROM users WHERE login_name = $1", "admin-status-test")
	env.DB.Exec(ctx, "DELETE FROM users WHERE login_name = $1", "admin-status-inv-test")
	env.DB.Exec(ctx, "DELETE FROM users WHERE login_name = $1", "admin-admin-sub-test")
	env.DB.Exec(ctx, "DELETE FROM users WHERE tenant_id = $1", tenantID)
	env.DB.Exec(ctx, "DELETE FROM identity_types WHERE tenant_id = $1", tenantID)
	env.DB.Exec(ctx, "DELETE FROM subscription_packages WHERE tenant_id = $1", tenantID)
	env.DB.Exec(ctx, "DELETE FROM org_types WHERE tenant_id = $1", tenantID)
	env.DB.Exec(ctx, "DELETE FROM tenants WHERE id = $1", tenantID)
}

func TestTenant_Create(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	w := env.Do("POST", "/api/v1/tenants", map[string]string{
		"name": "Test Tenant Create",
		"code": "test-create",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}

	resp, err := testhelper.Unmarshal[createTenantResp](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	tenant := resp.Tenant
	if tenant.Name != "Test Tenant Create" {
		t.Fatalf("expected name 'Test Tenant Create', got %s", tenant.Name)
	}
	defer cleanupTenant(ctx, t, env, tenant.ID)
}

func TestTenant_Create_MissingFields(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()

	w := env.Do("POST", "/api/v1/tenants", map[string]string{
		"code": "no-name",
	})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestTenant_Create_DuplicateCode(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	w1 := env.Do("POST", "/api/v1/tenants", map[string]string{
		"name": "Dup Code A",
		"code": "dup-code-test",
	})
	if w1.Code != http.StatusCreated {
		t.Fatalf("create 1: %d %s", w1.Code, testhelper.ErrMsg(w1))
	}
	r1, _ := testhelper.Unmarshal[createTenantResp](w1)
	defer cleanupTenant(ctx, t, env, r1.Tenant.ID)

	w2 := env.Do("POST", "/api/v1/tenants", map[string]string{
		"name": "Dup Code B",
		"code": "dup-code-test",
	})
	if w2.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", w2.Code, testhelper.ErrMsg(w2))
	}
}

func TestTenant_List(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	w1 := env.Do("POST", "/api/v1/tenants", map[string]string{"name": "ListTenantA", "code": "list-a"})
	if w1.Code != http.StatusCreated {
		t.Fatalf("create tenant 1: %d %s", w1.Code, testhelper.ErrMsg(w1))
	}
	r1, _ := testhelper.Unmarshal[createTenantResp](w1)
	t1 := r1.Tenant
	defer cleanupTenant(ctx, t, env, t1.ID)

	w2 := env.Do("POST", "/api/v1/tenants", map[string]string{"name": "ListTenantB", "code": "list-b"})
	if w2.Code != http.StatusCreated {
		t.Fatalf("create tenant 2: %d %s", w2.Code, testhelper.ErrMsg(w2))
	}
	r2, _ := testhelper.Unmarshal[createTenantResp](w2)
	t2 := r2.Tenant
	defer cleanupTenant(ctx, t, env, t2.ID)

	w := env.Do("GET", "/api/v1/tenants", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	items, total, err := testhelper.UnmarshalList[domain.Tenant](w)
	if err != nil {
		t.Fatalf("unmarshal list: %v", err)
	}
	if total < 2 {
		t.Fatalf("expected total >= 2, got %d", total)
	}
	if len(items) == 0 {
		t.Fatal("expected items > 0")
	}
}

func TestTenant_Get(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	wc := env.Do("POST", "/api/v1/tenants", map[string]string{"name": "Get Test Tenant", "code": "get-test"})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	cr, _ := testhelper.Unmarshal[createTenantResp](wc)
	created := cr.Tenant
	defer cleanupTenant(ctx, t, env, created.ID)

	w := env.Do("GET", "/api/v1/tenants/"+created.ID, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	tenant, err := testhelper.Unmarshal[domain.Tenant](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if tenant.ID != created.ID {
		t.Fatalf("expected id %s, got %s", created.ID, tenant.ID)
	}
}

func TestTenant_Get_NotFound(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()

	w := env.Do("GET", "/api/v1/tenants/nonexistent-id", nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}

func TestTenant_Update(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	wc := env.Do("POST", "/api/v1/tenants", map[string]string{"name": "Old Name", "code": "update-test"})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	cr, _ := testhelper.Unmarshal[createTenantResp](wc)
	created := cr.Tenant
	defer cleanupTenant(ctx, t, env, created.ID)

	w := env.Do("PUT", "/api/v1/tenants/"+created.ID, map[string]string{"name": "Updated Name"})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	tenant, err := testhelper.Unmarshal[domain.Tenant](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if tenant.Name != "Updated Name" {
		t.Fatalf("expected name 'Updated Name', got %s", tenant.Name)
	}
}

func TestTenant_Update_NotFound(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()

	w := env.Do("PUT", "/api/v1/tenants/nonexistent-id", map[string]string{"name": "X"})
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}

func TestTenant_UpdateStatus(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	wc := env.Do("POST", "/api/v1/tenants", map[string]string{"name": "Status Tenant", "code": "status-test"})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	cr, _ := testhelper.Unmarshal[createTenantResp](wc)
	created := cr.Tenant
	defer cleanupTenant(ctx, t, env, created.ID)

	w := env.Do("POST", "/api/v1/tenants/"+created.ID+"/status", map[string]string{"status": "inactive"})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	tenant, err := testhelper.Unmarshal[domain.Tenant](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if tenant.Status != "inactive" {
		t.Fatalf("expected status 'inactive', got %s", tenant.Status)
	}
}

func TestTenant_UpdateStatus_Invalid(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	wc := env.Do("POST", "/api/v1/tenants", map[string]string{"name": "StatusInv Tenant", "code": "status-inv-test"})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	cr, _ := testhelper.Unmarshal[createTenantResp](wc)
	created := cr.Tenant
	defer cleanupTenant(ctx, t, env, created.ID)

	w := env.Do("POST", "/api/v1/tenants/"+created.ID+"/status", map[string]string{"status": "bogus"})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestTenant_AdminCreate_CreatesSubscription(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	w := env.DoNoAuth("POST", "/api/v1/admin/tenants", map[string]string{
		"name": "Admin Tenant Sub",
		"code": "admin-sub-test",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}

	resp, err := testhelper.Unmarshal[createTenantResp](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	tenant := resp.Tenant
	defer cleanupTenant(ctx, t, env, tenant.ID)

	var subID string
	err = env.DB.QueryRow(ctx,
		`SELECT id FROM subscription_packages WHERE tenant_id = $1`, tenant.ID,
	).Scan(&subID)
	if err != nil {
		t.Fatalf("subscription not found for admin-created tenant: %v", err)
	}
}
