package handler

import (
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/Atul71/EventLeaf/api/internal/auth"
	"github.com/Atul71/EventLeaf/api/internal/middleware"
	"github.com/Atul71/EventLeaf/api/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	users        *repository.UserRepository
	jwtSecret    string
	cookieName   string
	cookieSecure bool
}

func NewAuthHandler(users *repository.UserRepository, jwtSecret string, cookieName string, cookieSecure bool) *AuthHandler {
	return &AuthHandler{
		users:        users,
		jwtSecret:    jwtSecret,
		cookieName:   cookieName,
		cookieSecure: cookieSecure,
	}
}

type loginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type signupRequest struct {
	Username      string `json:"username" binding:"required"`
	Email         string `json:"email" binding:"required"`
	Password      string `json:"password" binding:"required"`
	IsOrganizer   bool   `json:"is_organizer"`
	IsEcoConscious bool  `json:"is_eco_conscious"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	email := strings.TrimSpace(strings.ToLower(req.Email))
	if email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}

	u, err := h.users.GetAuthUserByEmail(c.Request.Context(), email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate user"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	ttl := 7 * 24 * time.Hour
	token, err := auth.NewToken(h.jwtSecret, u.ID, u.Email, ttl)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// HttpOnly cookie session (JWT)
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		h.cookieName,
		token,
		int(ttl.Seconds()),
		"/",
		"",
		h.cookieSecure,
		true, // HttpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"ok":            true,
		"email":         u.Email,
		"is_organizer":  u.IsOrganizer,
		"redirect_path": organizerRedirectPath(u.IsOrganizer),
	})
}

func organizerRedirectPath(isOrganizer bool) string {
	if isOrganizer {
		return "/organizer"
	}
	return "/profile"
}

func (h *AuthHandler) Signup(c *gin.Context) {
	var req signupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	email := strings.TrimSpace(strings.ToLower(req.Email))
	username := strings.TrimSpace(strings.ToLower(req.Username))
	password := strings.TrimSpace(req.Password)
	if email == "" || username == "" || password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username, email, and password are required"})
		return
	}
	if len(username) < 3 || len(username) > 30 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username must be 3-30 characters"})
		return
	}
	validUsername := regexp.MustCompile(`^[a-z0-9_]+$`)
	if !validUsername.MatchString(username) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username can only contain lowercase letters, numbers, and underscores"})
		return
	}
	if len(password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 8 characters"})
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to secure password"})
		return
	}

	u, err := h.users.CreateUser(c.Request.Context(), repository.CreateUserInput{
		Username:       username,
		Email:          email,
		PasswordHash:   string(passwordHash),
		FirstName:      username,
		LastName:       "User",
		IsOrganizer:    req.IsOrganizer,
		IsEcoConscious: req.IsEcoConscious,
	})
	if err != nil {
		errText := strings.ToLower(err.Error())
		if strings.Contains(errText, "users_username_key") {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
			return
		}
		if strings.Contains(errText, "users_email_key") || strings.Contains(errText, "duplicate key") {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account"})
		return
	}

	ttl := 7 * 24 * time.Hour
	token, err := auth.NewToken(h.jwtSecret, u.ID, u.Email, ttl)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(h.cookieName, token, int(ttl.Seconds()), "/", "", h.cookieSecure, true)

	c.JSON(http.StatusCreated, gin.H{
		"ok":            true,
		"email":         u.Email,
		"is_organizer":  u.IsOrganizer,
		"redirect_path": organizerRedirectPath(u.IsOrganizer),
	})
}


func (h *AuthHandler) Me(c *gin.Context) {
	uid, _ := c.Get(middleware.ContextUserIDKey)
	emailRaw, _ := c.Get(middleware.ContextUserEmailKey)
	email, _ := emailRaw.(string)

	username := ""
	isOrganizer := false
	if email != "" {
		if u, err := h.users.GetAuthUserByEmail(c.Request.Context(), email); err == nil && u != nil {
			username = u.Username
			isOrganizer = u.IsOrganizer
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"user_id":      uid,
		"email":        email,
		"username":     username,
		"is_organizer": isOrganizer,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie(h.cookieName, "", -1, "/", "", h.cookieSecure, true)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

