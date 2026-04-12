package middleware

import (
	"github.com/Atul71/EventLeaf/api/internal/auth"
	"github.com/gin-gonic/gin"
)

// OptionalAuth parses JWT from cookie when present; does not abort if missing or invalid.
func OptionalAuth(jwtSecret string, cookieName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Request.Cookie(cookieName)
		if err != nil || cookie == nil || cookie.Value == "" {
			c.Next()
			return
		}
		claims, err := auth.ParseToken(jwtSecret, cookie.Value)
		if err != nil {
			c.Next()
			return
		}
		c.Set(ContextUserIDKey, claims.UserID)
		c.Next()
	}
}
