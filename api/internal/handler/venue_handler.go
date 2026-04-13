package handler

import (
	"net/http"
	"strconv"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type VenueHandler struct {
	venueRepo VenueRepository
}

func NewVenueHandler(venueRepo VenueRepository) *VenueHandler {
	return &VenueHandler{venueRepo: venueRepo}
}

// CreateVenue godoc
// @Summary      Create a new venue
// @Description  Creates a new venue with eco-certification information
// @Tags         venues
// @Accept       json
// @Produce      json
// @Param        venue  body  models.CreateVenueRequest  true  "Venue details"
// @Success      201   {object}  models.Venue
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /venues [post]
func (h *VenueHandler) CreateVenue(c *gin.Context) {
	var req models.CreateVenueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	venue, err := h.venueRepo.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create venue: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, venue)
}

// GetVenue godoc
// @Summary      Get venue by ID
// @Tags         venues
// @Produce      json
// @Param        id   path      string  true  "Venue ID"
// @Success      200   {object}  models.Venue
// @Failure      400   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Router       /venues/{id} [get]
func (h *VenueHandler) GetVenue(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid venue ID"})
		return
	}

	venue, err := h.venueRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Venue not found"})
		return
	}
	c.JSON(http.StatusOK, venue)
}

// ListVenues godoc
// @Summary      List venues
// @Tags         venues
// @Produce      json
// @Param        limit   query     int  false  "Limit (default: 20)"
// @Param        offset  query     int  false  "Offset (default: 0)"
// @Success      200   {array}   models.Venue
// @Router       /venues [get]
func (h *VenueHandler) ListVenues(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if limit < 1 || limit > 500 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	venues, err := h.venueRepo.List(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch venues: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, venues)
}

// UpdateVenue godoc
// @Summary      Update venue
// @Tags         venues
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Venue ID"
// @Param        venue  body  models.UpdateVenueRequest  true  "Venue update"
// @Success      200   {object}  models.Venue
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /venues/{id} [put]
func (h *VenueHandler) UpdateVenue(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid venue ID"})
		return
	}

	var req models.UpdateVenueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	venue, err := h.venueRepo.Update(c.Request.Context(), id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update venue: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, venue)
}

// DeleteVenue godoc
// @Summary      Delete venue
// @Tags         venues
// @Param        id   path      string  true  "Venue ID"
// @Success      204   "No Content"
// @Failure      400   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Router       /venues/{id} [delete]
func (h *VenueHandler) DeleteVenue(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid venue ID"})
		return
	}

	if err := h.venueRepo.Delete(c.Request.Context(), id); err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "venue not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.AbortWithStatus(http.StatusNoContent)
}
