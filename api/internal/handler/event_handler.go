package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/Atul71/EventLeaf/api/internal/repository"
	"github.com/Atul71/EventLeaf/api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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

// ListEvents godoc
// @Summary      List published public events
// @Tags         events
// @Produce      json
// @Param        limit   query  int  false  "Limit (default 50, max 100)"
// @Param        offset  query  int  false  "Offset (default 0)"
// @Success      200  {array}   models.Event
// @Failure      500  {object}  map[string]string
// @Router       /events [get]
func (h *EventHandler) ListEvents(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if limit < 1 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	events, err := h.eventRepo.ListPublished(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events: " + err.Error()})
		return
	}
	if events == nil {
		events = []models.Event{}
	}
	c.JSON(http.StatusOK, events)
}

// GetEvent godoc
// @Summary      Get event by id
// @Tags         events
// @Produce      json
// @Param        id   path  string  true  "Event UUID"
// @Success      200  {object}  models.Event
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /events/{id} [get]
func (h *EventHandler) GetEvent(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event id"})
		return
	}
	event, err := h.eventRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event"})
		return
	}
	c.JSON(http.StatusOK, event)
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
