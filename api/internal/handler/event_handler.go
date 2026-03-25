package handler

import (
	"errors"
	"net/http"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/Atul71/EventLeaf/api/internal/repository"
	"github.com/Atul71/EventLeaf/api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type EventHandler struct {
	eventRepo         *repository.EventRepository
	venueRepo         *repository.VenueRepository
	ecoAttrRepo       *repository.EcoAttributeRepository
	googleCalendar    *service.GoogleCalendarService
	calendarTimeZone  string
}

func NewEventHandler(
	eventRepo *repository.EventRepository,
	venueRepo *repository.VenueRepository,
	ecoAttrRepo *repository.EcoAttributeRepository,
	googleCalendar *service.GoogleCalendarService,
	calendarTimeZone string,
) *EventHandler {
	return &EventHandler{
		eventRepo:        eventRepo,
		venueRepo:        venueRepo,
		ecoAttrRepo:      ecoAttrRepo,
		googleCalendar:   googleCalendar,
		calendarTimeZone: calendarTimeZone,
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
	var selectedVenue *models.Venue

	if venueIDProvided {
		venue, err := h.venueRepo.GetByID(ctx, *req.VenueID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Venue not found"})
			return
		}
		selectedVenue = venue
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

	resp := models.CreateEventResponse{
		Event:           *event,
		IsGreen:         greenResult.IsGreen,
		GreenCriteria:   greenResult.CriteriaMet,
		NotGreenReasons: greenResult.CriteriaNotMet,
		CalendarICSPath: "/api/v1/events/" + event.ID.String() + "/calendar.ics",
	}

	// Only published events are synced to Google Calendar.
	if event.Status == "published" && h.googleCalendar != nil {
		if err := h.googleCalendar.SyncPublishedEvent(ctx, event, selectedVenue); err != nil {
			resp.CalendarSyncError = err.Error()
		}
	}

	c.JSON(http.StatusCreated, resp)
}

// GetEventCalendarICS godoc
// @Summary      Download event as iCalendar (.ics)
// @Description  Returns an RFC 5545 ICS file for adding the event to Apple, Google, Outlook, etc.
// @Tags         events
// @Produce      text/calendar
// @Param        id   path      string  true  "Event ID"
// @Success      200  {string}  string  "ICS file"
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /events/{id}/calendar.ics [get]
func (h *EventHandler) GetEventCalendarICS(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	ctx := c.Request.Context()
	event, err := h.eventRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load event: " + err.Error()})
		return
	}

	var venue *models.Venue
	if event.VenueID != nil {
		v, err := h.venueRepo.GetByID(ctx, *event.VenueID)
		if err == nil {
			venue = v
		}
	}

	body, err := service.BuildEventICS(event, venue, h.calendarTimeZone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to build calendar file: " + err.Error()})
		return
	}

	filename := "event-" + id.String() + ".ics"
	c.Header("Content-Type", "text/calendar; charset=utf-8")
	c.Header("Content-Disposition", `attachment; filename="`+filename+`"`)
	c.Data(http.StatusOK, "text/calendar; charset=utf-8", body)
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
