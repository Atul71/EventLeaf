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
	"github.com/google/uuid"
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
	Username       string `json:"username" binding:"required"`
	Email          string `json:"email" binding:"required"`
	Password       string `json:"password" binding:"required"`
	IsOrganizer    bool   `json:"is_organizer"`
	IsEcoConscious bool   `json:"is_eco_conscious"`
}

type updateMeRequest struct {
	FirstName       *string `json:"first_name"`
	LastName        *string `json:"last_name"`
	Phone           *string `json:"phone"`
	Bio             *string `json:"bio"`
	ProfileImageURL *string `json:"profile_image_url"`
	IsEcoConscious  *bool   `json:"is_eco_conscious"`
}

func authUserIDFromContext(c *gin.Context) (uuid.UUID, bool) {
	uidRaw, ok := c.Get(middleware.ContextUserIDKey)
	if !ok {
		return uuid.Nil, false
	}
	switch v := uidRaw.(type) {
	case uuid.UUID:
		return v, true
	case string:
		parsed, err := uuid.Parse(v)
		if err != nil {
			return uuid.Nil, false
		}
		return parsed, true
	default:
		return uuid.Nil, false
	}
}

func (h *AuthHandler) resolveAuthUserID(c *gin.Context) (uuid.UUID, error) {
	if id, ok := authUserIDFromContext(c); ok {
		return id, nil
	}
	emailRaw, ok := c.Get(middleware.ContextUserEmailKey)
	if !ok {
		return uuid.Nil, errors.New("missing auth context")
	}
	email, ok := emailRaw.(string)
	if !ok || strings.TrimSpace(email) == "" {
		return uuid.Nil, errors.New("invalid auth context")
	}
	u, err := h.users.GetAuthUserByEmail(c.Request.Context(), strings.TrimSpace(email))
	if err != nil {
		// Fall through to raw-cookie parse fallback below.
	} else {
		return u.ID, nil
	}

	// Last-resort fallback for legacy session cookies where middleware context is incomplete.
	cookie, cookieErr := c.Request.Cookie(h.cookieName)
	if cookieErr != nil || cookie == nil || cookie.Value == "" {
		return uuid.Nil, errors.New("invalid auth context")
	}
	claims, parseErr := auth.ParseToken(h.jwtSecret, cookie.Value)
	if parseErr != nil {
		return uuid.Nil, parseErr
	}
	if claims.UserID != "" {
		if parsed, parseUUIDErr := uuid.Parse(claims.UserID); parseUUIDErr == nil {
			return parsed, nil
		}
	}
	if strings.TrimSpace(claims.Subject) != "" {
		if parsed, parseUUIDErr := uuid.Parse(strings.TrimSpace(claims.Subject)); parseUUIDErr == nil {
			return parsed, nil
		}
	}
	if strings.TrimSpace(claims.Email) != "" {
		if byEmail, byEmailErr := h.users.GetAuthUserByEmail(c.Request.Context(), strings.TrimSpace(claims.Email)); byEmailErr == nil {
			return byEmail.ID, nil
		}
	}
	return uuid.Nil, errors.New("invalid auth context")
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
	userID, err := h.resolveAuthUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid auth context"})
		return
	}

	profile, err := h.users.GetProfileByID(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":           profile.ID,
		"email":             profile.Email,
		"username":          profile.Username,
		"first_name":        profile.FirstName,
		"last_name":         profile.LastName,
		"phone":             profile.Phone,
		"bio":               profile.Bio,
		"profile_image_url": profile.ProfileImageURL,
		"is_organizer":      profile.IsOrganizer,
		"is_eco_conscious":  profile.IsEcoConscious,
	})
}

func (h *AuthHandler) UpdateMe(c *gin.Context) {
	var req updateMeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	userID, err := h.resolveAuthUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid auth context"})
		return
	}

	current, err := h.users.GetProfileByID(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load profile"})
		return
	}

	firstName := current.FirstName
	lastName := current.LastName
	phone := current.Phone
	bio := current.Bio
	profileImageURL := current.ProfileImageURL
	isEcoConscious := current.IsEcoConscious

	if req.FirstName != nil {
		firstName = strings.TrimSpace(*req.FirstName)
		if firstName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "first_name cannot be empty"})
			return
		}
		if len(firstName) > 100 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "first_name must be 100 characters or fewer"})
			return
		}
	}
	if req.LastName != nil {
		lastName = strings.TrimSpace(*req.LastName)
		if lastName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "last_name cannot be empty"})
			return
		}
		if len(lastName) > 100 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "last_name must be 100 characters or fewer"})
			return
		}
	}
	if req.Phone != nil {
		trimmed := strings.TrimSpace(*req.Phone)
		if trimmed == "" {
			phone = nil
		} else {
			validPhone := regexp.MustCompile(`^\d{10}$`)
			if !validPhone.MatchString(trimmed) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "phone must be exactly 10 digits"})
				return
			}
			phone = &trimmed
		}
	}
	if req.Bio != nil {
		trimmed := strings.TrimSpace(*req.Bio)
		if trimmed == "" {
			bio = nil
		} else {
			bio = &trimmed
		}
	}
	if req.ProfileImageURL != nil {
		trimmed := strings.TrimSpace(*req.ProfileImageURL)
		if trimmed == "" {
			profileImageURL = nil
		} else {
			if len(trimmed) > 500 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "profile_image_url must be 500 characters or fewer"})
				return
			}
			profileImageURL = &trimmed
		}
	}
	if req.IsEcoConscious != nil {
		isEcoConscious = *req.IsEcoConscious
	}

	updated, err := h.users.UpdateProfileByID(c.Request.Context(), userID, repository.UpdateUserProfileInput{
		FirstName:       firstName,
		LastName:        lastName,
		Phone:           phone,
		Bio:             bio,
		ProfileImageURL: profileImageURL,
		IsEcoConscious:  isEcoConscious,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":           updated.ID,
		"username":          updated.Username,
		"email":             updated.Email,
		"first_name":        updated.FirstName,
		"last_name":         updated.LastName,
		"phone":             updated.Phone,
		"bio":               updated.Bio,
		"profile_image_url": updated.ProfileImageURL,
		"is_organizer":      updated.IsOrganizer,
		"is_eco_conscious":  updated.IsEcoConscious,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie(h.cookieName, "", -1, "/", "", h.cookieSecure, true)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
