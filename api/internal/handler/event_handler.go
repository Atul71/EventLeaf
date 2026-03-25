package handler

import (
	"net/http"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/Atul71/EventLeaf/api/internal/repository"
	"github.com/Atul71/EventLeaf/api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type EventHandler struct {
	eventRepo   *repository.EventRepository
	venueRepo   *repository.VenueRepository
	ecoAttrRepo *repository.EcoAttributeRepository
}

func NewEventHandler(
	eventRepo *repository.EventRepository,
	venueRepo *repository.VenueRepository,
	ecoAttrRepo *repository.EcoAttributeRepository,
) *EventHandler {
	return &EventHandler{
		eventRepo:   eventRepo,
		venueRepo:   venueRepo,
		ecoAttrRepo: ecoAttrRepo,
	}
}

// CreateEvent godoc
// @Summary      Create a new event
// @Description  Creates an event and verifies if it meets Green criteria (eco-certified venue + at least 2 sustainability flags)
// @Tags         events
// @Accept       json
// @Produce      json
// @Param        event  body  models.CreateEventRequest  true  "Event details"
// @Success      201   {object}  models.CreateEventResponse
// @Failure      400   {object}  map[string]string  "Invalid request"
// @Failure      404   {object}  map[string]string  "Venue not found"
// @Failure      500   {object}  map[string]string  "Server error"
// @Router       /events [post]
func (h *EventHandler) CreateEvent(c *gin.Context) {
	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	ctx := c.Request.Context()

	venueIsEcoCertified := true
	venueIDProvided := req.VenueID != nil

	if venueIDProvided {
		venue, err := h.venueRepo.GetByID(ctx, *req.VenueID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Venue not found"})
			return
		}
		venueIsEcoCertified = venue.IsEcoCertified
	}

	var ecoNames []string
	if len(req.EcoAttributeIDs) > 0 {
		names, err := h.ecoAttrRepo.GetNamesByIDs(ctx, req.EcoAttributeIDs)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch eco attributes"})
			return
		}
		ecoNames = names
	}

	greenResult := service.VerifyGreenCriteria(venueIsEcoCertified, venueIDProvided, ecoNames)

	event, err := h.eventRepo.Create(ctx, &req, greenResult.IsGreen)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.CreateEventResponse{
		Event:           *event,
		IsGreen:         greenResult.IsGreen,
		GreenCriteria:   greenResult.CriteriaMet,
		NotGreenReasons: greenResult.CriteriaNotMet,
	})
}

// ListEcoAttributes godoc
// @Summary      List eco attributes
// @Description  Returns all eco attributes (use IDs when creating events)
// @Tags         eco-attributes
// @Produce      json
// @Success      200   {array}   models.EcoAttribute
// @Failure      500   {object}  map[string]string  "Server error"
// @Router       /eco-attributes [get]
func (h *EventHandler) ListEcoAttributes(c *gin.Context) {
	attrs, err := h.ecoAttrRepo.ListAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch eco attributes"})
		return
	}
	c.JSON(http.StatusOK, attrs)
}

// GetEventGreenMetrics godoc
// @Summary      Get green metrics for an event
// @Description  Calculates and returns sustainability metrics including carbon footprint reduction, energy efficiency, and waste reduction potential
// @Tags         events
// @Produce      json
// @Param        id   path      string                     true  "Event ID"
// @Success      200  {object}  models.GreenMetricsResponse
// @Failure      400  {object}  map[string]string  "Invalid event ID"
// @Failure      404  {object}  map[string]string  "Event not found"
// @Failure      500  {object}  map[string]string  "Server error"
// @Router       /events/{id}/green-metrics [get]
func (h *EventHandler) GetEventGreenMetrics(c *gin.Context) {
	eventIDStr := c.Param("id")
	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID format"})
		return
	}

	ctx := c.Request.Context()

	// Fetch the event
	event, err := h.eventRepo.GetByID(ctx, eventID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Fetch venue information if event has a venue
	var venue *models.Venue
	if event.VenueID != nil {
		venue, err = h.venueRepo.GetByID(ctx, *event.VenueID)
		if err != nil {
			// Log but don't fail - venue might be deleted
			venue = nil
		}
	}

	// Fetch eco attributes for the event
	ecoAttributeNames, err := h.eventRepo.GetEcoAttributesForEvent(ctx, eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch eco attributes"})
		return
	}

	// Calculate green metrics
	greenMetrics := service.CalculateGreenMetrics(eventID, event, venue, ecoAttributeNames)

	c.JSON(http.StatusOK, models.GreenMetricsResponse{
		Event:        *event,
		GreenMetrics: *greenMetrics,
	})
}
