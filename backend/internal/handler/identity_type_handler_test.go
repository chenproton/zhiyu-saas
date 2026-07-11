package handler_test

import (
	"context"
	"net/http"
	"testing"

	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/handler/testhelper"
)

func TestIdentityType_Create(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	w := env.Do("POST", "/api/v1/identity-types", map[string]string{
		"tenantId": testhelper.TestTenantID,
		"code":     "test-identity-type",
		"name":     "Test Identity Type",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	it, err := testhelper.Unmarshal[domain.IdentityType](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if it.Code != "test-identity-type" {
		t.Fatalf("expected code 'test-identity-type', got %s", it.Code)
	}
	defer env.DB.Exec(ctx, "DELETE FROM identity_types WHERE id = $1", it.ID)
}

func TestIdentityType_Create_MissingCode(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()

	w := env.Do("POST", "/api/v1/identity-types", map[string]string{
		"tenantId": testhelper.TestTenantID,
		"name":     "No Code",
	})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestIdentityType_List(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	wc := env.Do("POST", "/api/v1/identity-types", map[string]string{
		"tenantId": testhelper.TestTenantID,
		"code":     "list-it-type",
		"name":     "List IT",
	})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	it, _ := testhelper.Unmarshal[domain.IdentityType](wc)
	defer env.DB.Exec(ctx, "DELETE FROM identity_types WHERE id = $1", it.ID)

	w := env.Do("GET", "/api/v1/identity-types?tenantId="+testhelper.TestTenantID, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	items, _, err := testhelper.UnmarshalList[domain.IdentityType](w)
	if err != nil {
		t.Fatalf("unmarshal list: %v", err)
	}
	if len(items) == 0 {
		t.Fatal("expected items > 0")
	}
}

func TestIdentityType_Get(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	wc := env.Do("POST", "/api/v1/identity-types", map[string]string{
		"tenantId": testhelper.TestTenantID,
		"code":     "get-it-type",
		"name":     "Get IT",
	})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	created, _ := testhelper.Unmarshal[domain.IdentityType](wc)
	defer env.DB.Exec(ctx, "DELETE FROM identity_types WHERE id = $1", created.ID)

	w := env.Do("GET", "/api/v1/identity-types/"+created.ID, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	it, err := testhelper.Unmarshal[domain.IdentityType](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if it.ID != created.ID {
		t.Fatalf("expected id %s, got %s", created.ID, it.ID)
	}
}

func TestIdentityType_Update(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	wc := env.Do("POST", "/api/v1/identity-types", map[string]string{
		"tenantId": testhelper.TestTenantID,
		"code":     "update-it-type",
		"name":     "Old IT",
	})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	created, _ := testhelper.Unmarshal[domain.IdentityType](wc)
	defer env.DB.Exec(ctx, "DELETE FROM identity_types WHERE id = $1", created.ID)

	w := env.Do("PUT", "/api/v1/identity-types/"+created.ID, map[string]string{
		"name": "Updated IT",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	it, err := testhelper.Unmarshal[domain.IdentityType](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if it.Name != "Updated IT" {
		t.Fatalf("expected name 'Updated IT', got %s", it.Name)
	}
}

func TestIdentityType_Delete(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	wc := env.Do("POST", "/api/v1/identity-types", map[string]string{
		"tenantId": testhelper.TestTenantID,
		"code":     "delete-it-type",
		"name":     "Delete IT",
	})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	created, _ := testhelper.Unmarshal[domain.IdentityType](wc)

	w := env.Do("DELETE", "/api/v1/identity-types/"+created.ID, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}

	_ = ctx
	wg := env.Do("GET", "/api/v1/identity-types/"+created.ID, nil)
	if wg.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after delete, got %d", wg.Code)
	}
}
