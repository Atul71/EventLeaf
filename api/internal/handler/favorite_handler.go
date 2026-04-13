package handler

import (
	"net/http"
	"strconv"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FavoriteHandler struct {
	favorites FavoriteStore
	events    EventRepository
}

func NewFavoriteHandler(favorites FavoriteStore, events EventRepository) *FavoriteHandler {
	return &FavoriteHandler{favorites: favorites, events: events}
}

func isPublishedPublicEvent(e *models.Event) bool {
	return e.Status == "published" && e.Visibility == "public"
}

// ListSavedEvents returns bookmarked published events for the signed-in user.
func (h *FavoriteHandler) ListSavedEvents(c *gin.Context) {
	uid, ok := authUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing auth"})
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if limit < 1 || limit > 500 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}
	events, err := h.events.ListSavedByUser(c.Request.Context(), uid, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load saved events"})
		return
	}
	if events == nil {
		events = []models.Event{}
	}
	c.JSON(http.StatusOK, events)
}

// ListSavedEventIDs returns event UUIDs the user has saved (newest first).
func (h *FavoriteHandler) ListSavedEventIDs(c *gin.Context) {
	uid, ok := authUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing auth"})
		return
	}
	ids, err := h.favorites.ListEventIDs(c.Request.Context(), uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load saved event ids"})
		return
	}
	out := make([]string, 0, len(ids))
	for _, id := range ids {
		out = append(out, id.String())
	}
	c.JSON(http.StatusOK, gin.H{"event_ids": out})
}

// AddSavedEvent bookmarks a published public event.
func (h *FavoriteHandler) AddSavedEvent(c *gin.Context) {
	uid, ok := authUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing auth"})
		return
	}
	eventID, err := uuid.Parse(c.Param("eventId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event id"})
		return
	}
	ev, err := h.events.GetByID(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}
	if !isPublishedPublicEvent(ev) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}
	if err := h.favorites.Add(c.Request.Context(), uid, eventID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save event"})
		return
	}
	c.AbortWithStatus(http.StatusNoContent)
}

// RemoveSavedEvent removes a bookmark.
func (h *FavoriteHandler) RemoveSavedEvent(c *gin.Context) {
	uid, ok := authUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing auth"})
		return
	}
	eventID, err := uuid.Parse(c.Param("eventId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event id"})
		return
	}
	if err := h.favorites.Remove(c.Request.Context(), uid, eventID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove save"})
		return
	}
	c.AbortWithStatus(http.StatusNoContent)
}
