package handler

import (
	"errors"
	"net/http"

	"github.com/Atul71/EventLeaf/api/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type BootstrapHandler struct {
	users *repository.UserRepository
}

func NewBootstrapHandler(users *repository.UserRepository) *BootstrapHandler {
	return &BootstrapHandler{users: users}
}

// DemoOrganizerID godoc
// @Summary      Demo organizer UUID
// @Description  Returns the first organizer user id from the database (for dev UI before auth).
// @Tags         bootstrap
// @Produce      json
// @Success      200  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /bootstrap/organizer-id [get]
func (h *BootstrapHandler) DemoOrganizerID(c *gin.Context) {
	id, err := h.users.FirstOrganizerID(c.Request.Context())
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "No organizer user found. Seed the database (api/db/seed.sql)."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resolve organizer"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"organizer_id": id.String()})
}
