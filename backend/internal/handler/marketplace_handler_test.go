package handler_test

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/google/uuid"
	"github.com/zhiyu-saas/backend/internal/domain"
	"github.com/zhiyu-saas/backend/internal/handler/testhelper"
)

func TestBanner_CRUD(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	var bannerID string

	t.Run("Create", func(t *testing.T) {
		w := env.Do("POST", "/api/v1/banners", map[string]interface{}{
			"title":   "Test Banner",
			"image":   "https://example.com/img.png",
			"link":    "https://example.com",
			"sort":    1,
			"enabled": true,
		})
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		b, err := testhelper.Unmarshal[domain.Banner](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if b.Title != "Test Banner" {
			t.Errorf("title = %q, want %q", b.Title, "Test Banner")
		}
		if b.Sort != 1 {
			t.Errorf("sort = %d, want 1", b.Sort)
		}
		bannerID = b.ID
	})
	defer func() {
		if bannerID != "" {
			env.DB.Exec(ctx, "DELETE FROM banners WHERE id = $1", bannerID)
		}
	}()

	if bannerID == "" {
		t.Fatal("no created banner ID")
	}

	t.Run("List_Public", func(t *testing.T) {
		w := env.DoNoAuth("GET", "/api/v1/banners", nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
	})

	t.Run("Update", func(t *testing.T) {
		w := env.Do("PUT", fmt.Sprintf("/api/v1/banners/%s", bannerID), map[string]interface{}{
			"title":   "Updated Banner",
			"image":   "https://example.com/img2.png",
			"link":    "https://example.com/updated",
			"sort":    2,
			"enabled": false,
		})
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		b, err := testhelper.Unmarshal[domain.Banner](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if b.Title != "Updated Banner" {
			t.Errorf("title = %q, want %q", b.Title, "Updated Banner")
		}
	})

	t.Run("Delete", func(t *testing.T) {
		w := env.Do("DELETE", fmt.Sprintf("/api/v1/banners/%s", bannerID), nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		bannerID = ""
	})
}

func TestInstitution_CRUD(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	orgCode := fmt.Sprintf("ORG-%s", uuid.NewString()[:8])
	creditCode := uuid.NewString()

	var instID string

	t.Run("Create", func(t *testing.T) {
		w := env.Do("POST", "/api/v1/institutions", map[string]interface{}{
			"type":          "school",
			"name":          "Test Institution",
			"creditCode":    creditCode,
			"orgCode":       orgCode,
			"contactName":   "Contact Person",
			"contactPhone":  "13800138000",
			"contactEmail":  "test@example.com",
			"intro":         "Test intro",
			"expertiseTags": []string{"tag1", "tag2"},
		})
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		inst, err := testhelper.Unmarshal[domain.Institution](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if inst.Name != "Test Institution" {
			t.Errorf("name = %q, want %q", inst.Name, "Test Institution")
		}
		if len(inst.ExpertiseTags) != 2 {
			t.Errorf("tags length = %d, want 2", len(inst.ExpertiseTags))
		}
		instID = inst.ID
	})
	defer func() {
		if instID != "" {
			env.DB.Exec(ctx, "DELETE FROM institution_expertise_tags WHERE institution_id = $1", instID)
			env.DB.Exec(ctx, "DELETE FROM institutions WHERE id = $1", instID)
		}
	}()

	if instID == "" {
		t.Fatal("no created institution ID")
	}

	t.Run("List", func(t *testing.T) {
		w := env.Do("GET", "/api/v1/institutions", nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		items, total, err := testhelper.UnmarshalList[domain.Institution](w)
		if err != nil {
			t.Fatalf("unmarshal list: %v", err)
		}
		if total < 1 {
			t.Errorf("total = %d, want >= 1", total)
		}
		_ = items
	})

	t.Run("Get", func(t *testing.T) {
		w := env.Do("GET", fmt.Sprintf("/api/v1/institutions/%s", instID), nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		inst, err := testhelper.Unmarshal[domain.Institution](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if inst.ID != instID {
			t.Errorf("ID = %q, want %q", inst.ID, instID)
		}
	})

	t.Run("Update", func(t *testing.T) {
		w := env.Do("PUT", fmt.Sprintf("/api/v1/institutions/%s", instID), map[string]interface{}{
			"name":          "Updated Institution",
			"intro":         "Updated intro",
			"contactName":   "New Contact",
			"contactPhone":  "13900139000",
			"contactEmail":  "updated@example.com",
			"expertiseTags": []string{"tag3"},
		})
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		inst, err := testhelper.Unmarshal[domain.Institution](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if inst.Name != "Updated Institution" {
			t.Errorf("name = %q, want %q", inst.Name, "Updated Institution")
		}
	})
}

func TestResource_CRUD(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	orgCode := fmt.Sprintf("RES-ORG-%s", uuid.NewString()[:8])
	creditCode := uuid.NewString()

	w := env.Do("POST", "/api/v1/institutions", map[string]interface{}{
		"type":         "enterprise",
		"name":         "Resource Test Institution",
		"creditCode":   creditCode,
		"orgCode":      orgCode,
		"contactName":  "Contact",
		"contactPhone": "13800138001",
		"contactEmail": "res@example.com",
		"intro":        "Resource test intro",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("create institution: expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	inst, _ := testhelper.Unmarshal[domain.Institution](w)
	instID := inst.ID
	defer env.DB.Exec(ctx, "DELETE FROM institution_expertise_tags WHERE institution_id = $1", instID)
	defer env.DB.Exec(ctx, "DELETE FROM institutions WHERE id = $1", instID)

	userID := uuid.NewString()
	token := env.NewTokenWithIdentity(userID, testhelper.TestTenantID, domain.UserRoleEnterprise, &instID, "enterprise_hr")
	_, err := env.DB.Exec(ctx,
		`INSERT INTO users (id, tenant_id, role, institution_id, username, login_name, password_hash, name, status, title_ids) VALUES ($1, $2, 'enterprise', $3, $4, $4, $5, 'Test Enterprise User', 'active', '{}')`,
		userID, testhelper.TestTenantID, instID, userID[:8], "$2a$10$placeholderhash")
	if err != nil {
		t.Fatalf("create test user: %v", err)
	}
	defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", userID)

	var resID string

	t.Run("Create", func(t *testing.T) {
		w := env.DoWithToken("POST", "/api/v1/resources", map[string]interface{}{
			"name":     "Test Resource",
			"intro":    "A test resource",
			"category": "course",
			"price":    199.99,
			"version":  "v1.0",
		}, token)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		res, err := testhelper.Unmarshal[domain.Resource](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if res.Name != "Test Resource" {
			t.Errorf("name = %q, want %q", res.Name, "Test Resource")
		}
		resID = res.ID
	})
	defer func() {
		if resID != "" {
			env.DB.Exec(ctx, "DELETE FROM resource_tags WHERE resource_id = $1", resID)
			env.DB.Exec(ctx, "DELETE FROM resources WHERE id = $1", resID)
		}
	}()

	if resID == "" {
		t.Fatal("no created resource ID")
	}

	t.Run("List", func(t *testing.T) {
		w := env.DoNoAuth("GET", "/api/v1/resources", nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		_, _, err := testhelper.UnmarshalList[domain.Resource](w)
		if err != nil {
			t.Fatalf("unmarshal list: %v", err)
		}
	})

	t.Run("Get", func(t *testing.T) {
		w := env.Do("GET", fmt.Sprintf("/api/v1/resources/%s", resID), nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		res, err := testhelper.Unmarshal[domain.Resource](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if res.ID != resID {
			t.Errorf("ID = %q, want %q", res.ID, resID)
		}
	})

	t.Run("Update", func(t *testing.T) {
		w := env.DoWithToken("PUT", fmt.Sprintf("/api/v1/resources/%s", resID), map[string]interface{}{
			"name":     "Updated Resource",
			"intro":    "Updated intro",
			"category": "tool",
			"price":    299.99,
			"version":  "v2.0",
		}, token)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		res, err := testhelper.Unmarshal[domain.Resource](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if res.Name != "Updated Resource" {
			t.Errorf("name = %q, want %q", res.Name, "Updated Resource")
		}
	})

	t.Run("SubmitForReview", func(t *testing.T) {
		w := env.DoWithToken("POST", fmt.Sprintf("/api/v1/resources/%s/submit", resID), nil, token)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		res, err := testhelper.Unmarshal[domain.Resource](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if string(res.Status) != "reviewing" {
			t.Errorf("status = %q, want reviewing", res.Status)
		}
	})

	t.Run("Delete", func(t *testing.T) {
		deletedID := resID
		w := env.DoWithToken("DELETE", fmt.Sprintf("/api/v1/resources/%s", deletedID), nil, token)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		resID = ""

		w = env.Do("GET", fmt.Sprintf("/api/v1/resources/%s", deletedID), nil)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected 404 after delete, got %d", w.Code)
		}
	})
}

func TestOrder_CRUD(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	sellerOrgCode := fmt.Sprintf("SELLER-%s", uuid.NewString()[:8])
	sellerCredit := uuid.NewString()

	w := env.Do("POST", "/api/v1/institutions", map[string]interface{}{
		"type":         "enterprise",
		"name":         "Seller Institution",
		"creditCode":   sellerCredit,
		"orgCode":      sellerOrgCode,
		"contactName":  "Seller",
		"contactPhone": "13800138002",
		"contactEmail": "seller@example.com",
		"intro":        "Seller intro",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("create seller institution: expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	sellerInst, _ := testhelper.Unmarshal[domain.Institution](w)
	defer env.DB.Exec(ctx, "DELETE FROM institution_expertise_tags WHERE institution_id = $1", sellerInst.ID)
	defer env.DB.Exec(ctx, "DELETE FROM institutions WHERE id = $1", sellerInst.ID)

	sellerUserID := uuid.NewString()
	sellerToken := env.NewTokenWithIdentity(sellerUserID, testhelper.TestTenantID, domain.UserRoleEnterprise, &sellerInst.ID, "enterprise_hr")
	_, err := env.DB.Exec(ctx,
		`INSERT INTO users (id, tenant_id, role, institution_id, username, login_name, password_hash, name, status, title_ids) VALUES ($1, $2, 'enterprise', $3, $4, $4, $5, 'Seller User', 'active', '{}')`,
		sellerUserID, testhelper.TestTenantID, sellerInst.ID, sellerUserID[:8], "$2a$10$placeholderhash")
	if err != nil {
		t.Fatalf("create seller user: %v", err)
	}
	defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", sellerUserID)

	w = env.DoWithToken("POST", "/api/v1/resources", map[string]interface{}{
		"name":     "Orderable Resource",
		"intro":    "A resource to order",
		"category": "course",
		"price":    99.99,
		"version":  "v1.0",
	}, sellerToken)
	if w.Code != http.StatusCreated {
		t.Fatalf("create resource: expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	res, _ := testhelper.Unmarshal[domain.Resource](w)
	resID := res.ID
	defer env.DB.Exec(ctx, "DELETE FROM resource_tags WHERE resource_id = $1", resID)
	defer env.DB.Exec(ctx, "DELETE FROM resources WHERE id = $1", resID)

	w = env.DoWithToken("POST", fmt.Sprintf("/api/v1/resources/%s/submit", resID), nil, sellerToken)
	if w.Code != http.StatusOK {
		t.Fatalf("submit resource: expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}

	w = env.Do("POST", fmt.Sprintf("/api/v1/resources/%s/review", resID), map[string]interface{}{
		"status": "pending_publish",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("review resource: expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}

	w = env.Do("POST", fmt.Sprintf("/api/v1/resources/%s/publish", resID), nil)
	if w.Code != http.StatusOK {
		t.Fatalf("publish resource: expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}

	buyerOrgCode := fmt.Sprintf("BUYER-%s", uuid.NewString()[:8])
	buyerCredit := uuid.NewString()

	w = env.Do("POST", "/api/v1/institutions", map[string]interface{}{
		"type":         "school",
		"name":         "Buyer Institution",
		"creditCode":   buyerCredit,
		"orgCode":      buyerOrgCode,
		"contactName":  "Buyer",
		"contactPhone": "13800138003",
		"contactEmail": "buyer@example.com",
		"intro":        "Buyer intro",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("create buyer institution: expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	buyerInst, _ := testhelper.Unmarshal[domain.Institution](w)
	defer env.DB.Exec(ctx, "DELETE FROM institution_expertise_tags WHERE institution_id = $1", buyerInst.ID)
	defer env.DB.Exec(ctx, "DELETE FROM institutions WHERE id = $1", buyerInst.ID)

	buyerUserID := uuid.NewString()
	buyerToken := env.NewTokenWithIdentity(buyerUserID, testhelper.TestTenantID, domain.UserRoleSchool, &buyerInst.ID, "teacher")
	_, err = env.DB.Exec(ctx,
		`INSERT INTO users (id, tenant_id, role, institution_id, username, login_name, password_hash, name, status, title_ids) VALUES ($1, $2, 'school', $3, $4, $4, $5, 'Buyer User', 'active', '{}')`,
		buyerUserID, testhelper.TestTenantID, buyerInst.ID, buyerUserID[:8], "$2a$10$placeholderhash")
	if err != nil {
		t.Fatalf("create buyer user: %v", err)
	}
	defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", buyerUserID)

	var orderID string

	t.Run("Create", func(t *testing.T) {
		w := env.DoWithToken("POST", "/api/v1/orders", map[string]interface{}{
			"resourceId": resID,
		}, buyerToken)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		resp, err := testhelper.Unmarshal[map[string]interface{}](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		_ = resp
		if order, ok := resp["order"].(map[string]interface{}); ok {
			if id, ok := order["id"].(string); ok {
				orderID = id
			}
		}
	})
	defer func() {
		if orderID != "" {
			env.DB.Exec(ctx, "DELETE FROM orders WHERE id = $1", orderID)
		}
	}()

	if orderID == "" {
		t.Fatal("no created order ID")
	}

	t.Run("List", func(t *testing.T) {
		w := env.Do("GET", "/api/v1/orders", nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		_, _, err := testhelper.UnmarshalList[domain.Order](w)
		if err != nil {
			t.Fatalf("unmarshal list: %v", err)
		}
	})

	t.Run("Get", func(t *testing.T) {
		w := env.Do("GET", fmt.Sprintf("/api/v1/orders/%s", orderID), nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
	})
}

func TestWithdrawal_CRUD(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()
	ctx := context.Background()

	orgCode := fmt.Sprintf("WD-ORG-%s", uuid.NewString()[:8])
	creditCode := uuid.NewString()

	w := env.Do("POST", "/api/v1/institutions", map[string]interface{}{
		"type":         "enterprise",
		"name":         "Withdrawal Test Institution",
		"creditCode":   creditCode,
		"orgCode":      orgCode,
		"contactName":  "Contact",
		"contactPhone": "13800138004",
		"contactEmail": "wd@example.com",
		"intro":        "Withdrawal test intro",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("create institution: expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	inst, _ := testhelper.Unmarshal[domain.Institution](w)
	instID := inst.ID
	defer env.DB.Exec(ctx, "DELETE FROM institution_expertise_tags WHERE institution_id = $1", instID)
	defer env.DB.Exec(ctx, "DELETE FROM institutions WHERE id = $1", instID)

	env.DB.Exec(ctx, "UPDATE institutions SET balance = 500 WHERE id = $1", instID)

	userID := uuid.NewString()
	token := env.NewTokenWithIdentity(userID, testhelper.TestTenantID, domain.UserRoleEnterprise, &instID, "enterprise_hr")
	_, err := env.DB.Exec(ctx,
		`INSERT INTO users (id, tenant_id, role, institution_id, username, login_name, password_hash, name, status, title_ids) VALUES ($1, $2, 'enterprise', $3, $4, $4, $5, 'WD User', 'active', '{}')`,
		userID, testhelper.TestTenantID, instID, userID[:8], "$2a$10$placeholderhash")
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	defer env.DB.Exec(ctx, "DELETE FROM users WHERE id = $1", userID)

	var withdrawalID string

	t.Run("Create", func(t *testing.T) {
		w := env.DoWithToken("POST", "/api/v1/withdrawals", map[string]interface{}{
			"amount":      200,
			"accountType": "bank",
			"accountInfo": "Bank Account 12345",
		}, token)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		wd, err := testhelper.Unmarshal[domain.Withdrawal](w)
		if err != nil {
			t.Fatalf("unmarshal: %v", err)
		}
		if wd.Amount != 200 {
			t.Errorf("amount = %f, want 200", wd.Amount)
		}
		withdrawalID = wd.ID
	})
	defer func() {
		if withdrawalID != "" {
			env.DB.Exec(ctx, "DELETE FROM withdrawals WHERE id = $1", withdrawalID)
		}
	}()

	if withdrawalID == "" {
		t.Fatal("no created withdrawal ID")
	}

	t.Run("List", func(t *testing.T) {
		w := env.Do("GET", "/api/v1/withdrawals", nil)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
		}
		_, _, err := testhelper.UnmarshalList[domain.Withdrawal](w)
		if err != nil {
			t.Fatalf("unmarshal list: %v", err)
		}
	})
}

func TestStats_Dashboard(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()

	w := env.Do("GET", "/api/v1/stats/dashboard", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	resp, err := testhelper.Unmarshal[map[string]interface{}](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if _, ok := resp["totalInstitutions"]; !ok {
		t.Error("missing totalInstitutions in dashboard response")
	}
}

func TestStats_MyStats(t *testing.T) {
	env := testhelper.SetupTestEnv(t)
	defer env.Cleanup()

	w := env.Do("GET", "/api/v1/stats/me", nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, testhelper.ErrMsg(w))
	}
	resp, err := testhelper.Unmarshal[map[string]interface{}](w)
	if err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if _, ok := resp["balance"]; !ok {
		t.Error("missing balance in my stats response")
	}
}
