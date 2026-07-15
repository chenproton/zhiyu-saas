package middleware

import (
	"net/http"

	"github.com/zhiyu-saas/backend/internal/domain"
)

// RequirePlatform 校验当前 JWT 是否来自指定平台。
func RequirePlatform(platform domain.UserPlatform) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims := CurrentUser(r)
			if claims == nil {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}
			if claims.Platform != platform {
				http.Error(w, `{"error":"invalid platform"}`, http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
