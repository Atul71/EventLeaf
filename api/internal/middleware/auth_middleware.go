package middleware

import (
	"net/http"

	"github.com/Atul71/EventLeaf/api/internal/auth"
	"github.com/gin-gonic/gin"
)

const ContextUserIDKey = "auth_user_id"
const ContextUserEmailKey = "auth_user_email"

func RequireAuth(jwtSecret string, cookieName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Request.Cookie(cookieName)
		if err != nil || cookie == nil || cookie.Value == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing auth cookie"})
			return
		}
		claims, err := auth.ParseToken(jwtSecret, cookie.Value)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
			return
		}
		c.Set(ContextUserIDKey, claims.UserID)
		c.Set(ContextUserEmailKey, claims.Email)
		c.Next()
	}
}

