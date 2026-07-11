package handler_test

import (
	"context"
	"net/http"
	"testing"

	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/handler/testhelper"
)

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

	tenant, err := testhelper.Unmarshal[domain.Tenant](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if tenant.Name != "Test Tenant Create" {
		t.Fatalf("expected name 'Test Tenant Create', got %s", tenant.Name)
	}
	defer env.DB.Exec(ctx, "DELETE FROM tenants WHERE id = $1", tenant.ID)
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

func TestTenant_List(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	w1 := env.Do("POST", "/api/v1/tenants", map[string]string{"name": "ListTenantA", "code": "list-a"})
	if w1.Code != http.StatusCreated {
		t.Fatalf("create tenant 1: %d %s", w1.Code, testhelper.ErrMsg(w1))
	}
	t1, _ := testhelper.Unmarshal[domain.Tenant](w1)
	defer env.DB.Exec(ctx, "DELETE FROM tenants WHERE id = $1", t1.ID)

	w2 := env.Do("POST", "/api/v1/tenants", map[string]string{"name": "ListTenantB", "code": "list-b"})
	if w2.Code != http.StatusCreated {
		t.Fatalf("create tenant 2: %d %s", w2.Code, testhelper.ErrMsg(w2))
	}
	t2, _ := testhelper.Unmarshal[domain.Tenant](w2)
	defer env.DB.Exec(ctx, "DELETE FROM tenants WHERE id = $1", t2.ID)

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
	created, _ := testhelper.Unmarshal[domain.Tenant](wc)
	defer env.DB.Exec(ctx, "DELETE FROM tenants WHERE id = $1", created.ID)

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
	created, _ := testhelper.Unmarshal[domain.Tenant](wc)
	defer env.DB.Exec(ctx, "DELETE FROM tenants WHERE id = $1", created.ID)

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
	created, _ := testhelper.Unmarshal[domain.Tenant](wc)
	defer env.DB.Exec(ctx, "DELETE FROM tenants WHERE id = $1", created.ID)

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
	created, _ := testhelper.Unmarshal[domain.Tenant](wc)
	defer env.DB.Exec(ctx, "DELETE FROM tenants WHERE id = $1", created.ID)

	w := env.Do("POST", "/api/v1/tenants/"+created.ID+"/status", map[string]string{"status": "bogus"})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}
