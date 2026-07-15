package handler_test

import (
	"context"
	"net/http"
	"testing"

	"github.com/google/uuid"
	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/handler/testhelper"
)

func createTestIdentityType(t *testing.T, env *testhelper.TestEnv) string {
	t.Helper()
	ctx := context.Background()
	id := uuid.NewString()
	code := "test-it-" + id[:8]
	_, err := env.DB.Exec(ctx,
		`INSERT INTO identity_types (id, tenant_id, code, name, user_count, is_system) VALUES ($1, $2, $3, $4, 0, FALSE)`,
		id, testhelper.TestTenantID, code, "Test IT",
	)
	if err != nil {
		t.Fatalf("create identity type: %v", err)
	}
	t.Cleanup(func() {
		env.DB.Exec(context.Background(), "DELETE FROM identity_types WHERE id = $1", id)
	})
	return id
}

func TestUser_Create(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	itID := createTestIdentityType(t, env)

	w := env.Do("POST", "/api/v1/users", map[string]interface{}{
		"tenantId":       testhelper.TestTenantID,
		"username":       "newtestuser",
		"password":       "testpass",
		"name":           "Test User",
		"identityTypeId": itID,
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	user, err := testhelper.Unmarshal[domain.User](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if user.Username != "newtestuser" {
		t.Fatalf("expected username 'newtestuser', got %s", user.Username)
	}
	defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", user.ID)
}

func TestUser_List(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	itID := createTestIdentityType(t, env)

	wc := env.Do("POST", "/api/v1/users", map[string]interface{}{
		"tenantId":       testhelper.TestTenantID,
		"username":       "listuser",
		"password":       "testpass",
		"name":           "List User",
		"identityTypeId": itID,
	})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	user, _ := testhelper.Unmarshal[domain.User](wc)
	defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", user.ID)

	w := env.Do("GET", "/api/v1/users?tenantId="+testhelper.TestTenantID, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	items, _, err := testhelper.UnmarshalList[domain.User](w)
	if err != nil {
		t.Fatalf("unmarshal list: %v", err)
	}
	if len(items) == 0 {
		t.Fatal("expected items > 0")
	}
}

func TestUser_Get(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	itID := createTestIdentityType(t, env)

	wc := env.Do("POST", "/api/v1/users", map[string]interface{}{
		"tenantId":       testhelper.TestTenantID,
		"username":       "getuser",
		"password":       "testpass",
		"name":           "Get User",
		"identityTypeId": itID,
	})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	created, _ := testhelper.Unmarshal[domain.User](wc)
	defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", created.ID)

	w := env.Do("GET", "/api/v1/users/"+created.ID, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	user, err := testhelper.Unmarshal[domain.User](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if user.ID != created.ID {
		t.Fatalf("expected id %s, got %s", created.ID, user.ID)
	}
}

func TestUser_Update(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	itID := createTestIdentityType(t, env)

	wc := env.Do("POST", "/api/v1/users", map[string]interface{}{
		"tenantId":       testhelper.TestTenantID,
		"username":       "updateuser",
		"password":       "testpass",
		"name":           "Old Name",
		"identityTypeId": itID,
	})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	created, _ := testhelper.Unmarshal[domain.User](wc)
	defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", created.ID)

	w := env.Do("PUT", "/api/v1/users/"+created.ID, map[string]interface{}{
		"username": "updateuser",
		"name":     "Updated Name",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	user, err := testhelper.Unmarshal[domain.User](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if user.Name != "Updated Name" {
		t.Fatalf("expected name 'Updated Name', got %s", user.Name)
	}
}

func TestUser_Delete(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	itID := createTestIdentityType(t, env)

	wc := env.Do("POST", "/api/v1/users", map[string]interface{}{
		"tenantId":       testhelper.TestTenantID,
		"username":       "deleteuser",
		"password":       "testpass",
		"name":           "Delete User",
		"identityTypeId": itID,
	})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	created, _ := testhelper.Unmarshal[domain.User](wc)

	w := env.Do("DELETE", "/api/v1/users/"+created.ID, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}

	wg := env.Do("GET", "/api/v1/users/"+created.ID, nil)
	if wg.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after delete, got %d", wg.Code)
	}

	_ = ctx
}

func TestUser_UpdateStatus(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	itID := createTestIdentityType(t, env)

	wc := env.Do("POST", "/api/v1/users", map[string]interface{}{
		"tenantId":       testhelper.TestTenantID,
		"username":       "statususer",
		"password":       "testpass",
		"name":           "Status User",
		"identityTypeId": itID,
	})
	if wc.Code != http.StatusCreated {
		t.Fatalf("create: %d %s", wc.Code, testhelper.ErrMsg(wc))
	}
	created, _ := testhelper.Unmarshal[domain.User](wc)
	defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", created.ID)

	w := env.Do("POST", "/api/v1/users/"+created.ID+"/status", map[string]string{
		"status": "inactive",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	user, err := testhelper.Unmarshal[domain.User](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if user.Status != "inactive" {
		t.Fatalf("expected status 'inactive', got %s", user.Status)
	}
}

func TestUser_BatchCreate(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	itID := createTestIdentityType(t, env)

	w := env.Do("POST", "/api/v1/users/batch", map[string]interface{}{
		"users": []map[string]interface{}{
			{
				"tenantId":       testhelper.TestTenantID,
				"username":       "batchuser1",
				"password":       "testpass",
				"name":           "Batch User 1",
				"identityTypeId": itID,
			},
			{
				"tenantId":       testhelper.TestTenantID,
				"username":       "batchuser2",
				"password":       "testpass",
				"name":           "Batch User 2",
				"identityTypeId": itID,
			},
		},
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	items, total, err := testhelper.UnmarshalList[domain.User](w)
	if err != nil {
		t.Fatalf("unmarshal list: %v", err)
	}
	if total != 2 {
		t.Fatalf("expected total 2, got %d", total)
	}
	for _, u := range items {
		defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", u.ID)
	}
}
