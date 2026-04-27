package handler

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/Atul71/EventLeaf/api/internal/middleware"
	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/Atul71/EventLeaf/api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type EventHandler struct {
	eventRepo        EventRepository
	venueRepo        VenueRepository
	ecoAttrRepo      EcoAttributeRepository
	googleCalendar   CalendarPublisher
	calendarTimeZone string
}

func NewEventHandler(
	eventRepo EventRepository,
	venueRepo VenueRepository,
	ecoAttrRepo EcoAttributeRepository,
	googleCalendar CalendarPublisher,
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

func isEventPubliclyListed(e *models.Event) bool {
	return e.Status == "published" && e.Visibility == "public"
}

func authUserID(c *gin.Context) (uuid.UUID, bool) {
	v, ok := c.Get(middleware.ContextUserIDKey)
	if !ok || v == nil {
		return uuid.Nil, false
	}
	s, ok := v.(string)
	if !ok || s == "" {
		return uuid.Nil, false
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.Nil, false
	}
	return id, true
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

	sessUID, ok := authUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing auth"})
		return
	}
	if req.OrganizerID != sessUID {
		c.JSON(http.StatusForbidden, gin.H{"error": "organizer_id must match signed-in user"})
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
	preCreateEvent := &models.Event{
		OrganizerID:         req.OrganizerID,
		TotalCapacity:       req.TotalCapacity,
		HasDigitalTicketing: containsEcoName(ecoNames, "Paperless Ticketing"),
		HasPaperlessCheckin: containsEcoName(ecoNames, "Digital Check-in"),
	}
	if req.EcoSummary != "" {
		preCreateEvent.EcoSummary = &req.EcoSummary
	}
	metrics := service.CalculateGreenMetrics(preCreateEvent, selectedVenue, ecoNames)

	event, err := h.eventRepo.Create(ctx, &req, metrics.IsEcoFriendly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event: " + err.Error()})
		return
	}
	metrics.EventID = event.ID

	resp := models.CreateEventResponse{
		Event:               *event,
		IsGreen:             metrics.IsEcoFriendly,
		SustainabilityScore: metrics.OverallSustainabilityScore,
		Metrics:             metrics,
		GreenCriteria: append(greenResult.CriteriaMet,
			fmt.Sprintf("Overall sustainability score: %.2f/100", metrics.OverallSustainabilityScore)),
		NotGreenReasons: append(greenResult.CriteriaNotMet, func() []string {
			if metrics.IsEcoFriendly {
				return nil
			}
			return []string{fmt.Sprintf("Overall score %.2f is below eco-friendly threshold %.0f", metrics.OverallSustainabilityScore, models.EcoFriendlyThreshold)}
		}()...),
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
	if !isEventPubliclyListed(event) {
		uid, ok := authUserID(c)
		if !ok || event.OrganizerID != uid {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
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
	if !isEventPubliclyListed(event) {
		uid, ok := authUserID(c)
		if !ok || event.OrganizerID != uid {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
	}
	c.JSON(http.StatusOK, event)
}

// ListMyEvents returns all events for the signed-in organizer (drafts and published).
func (h *EventHandler) ListMyEvents(c *gin.Context) {
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
	events, err := h.eventRepo.ListByOrganizer(c.Request.Context(), uid, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events: " + err.Error()})
		return
	}
	if events == nil {
		events = []models.Event{}
	}
	c.JSON(http.StatusOK, events)
}

// PublishEvent sets a draft (or existing) event to published so it appears in Discover.
func (h *EventHandler) PublishEvent(c *gin.Context) {
	uid, ok := authUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing auth"})
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}
	ctx := c.Request.Context()
	event, err := h.eventRepo.PublishForOrganizer(ctx, id, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to publish event: " + err.Error()})
		return
	}

	var selectedVenue *models.Venue
	if event.VenueID != nil {
		v, err := h.venueRepo.GetByID(ctx, *event.VenueID)
		if err == nil {
			selectedVenue = v
		}
	}
	resp := models.CreateEventResponse{
		Event:           *event,
		CalendarICSPath: "/api/v1/events/" + event.ID.String() + "/calendar.ics",
	}
	if h.googleCalendar != nil {
		if err := h.googleCalendar.SyncPublishedEvent(ctx, event, selectedVenue); err != nil {
			resp.CalendarSyncError = err.Error()
		}
	}
	c.JSON(http.StatusOK, resp)
}

// BuyTicket creates one ticket for the signed-in user (no payment flow yet).
func (h *EventHandler) BuyTicket(c *gin.Context) {
	uid, ok := authUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing auth"})
		return
	}

	eventID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var req models.BuyTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}
	req.TicketType = strings.TrimSpace(req.TicketType)
	if req.Quantity <= 0 {
		req.Quantity = 1
	}
	if req.Quantity > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity cannot exceed 100 per purchase"})
		return
	}
	if len(req.TicketType) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ticket_type must be 50 characters or fewer"})
		return
	}

	tickets, remaining, err := h.eventRepo.BuyTicket(c.Request.Context(), eventID, uid, req.TicketType, req.Quantity)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Event is not purchasable (sold out, unpublished, past date, or quantity exceeds available seats)"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to buy ticket: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.BuyTicketResponse{
		Tickets:          tickets,
		RemainingTickets: remaining,
	})
}

// ListMyTickets returns tickets purchased by the signed-in user.
func (h *EventHandler) ListMyTickets(c *gin.Context) {
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

	tickets, err := h.eventRepo.ListTicketsByUser(c.Request.Context(), uid, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tickets: " + err.Error()})
		return
	}
	if tickets == nil {
		tickets = []models.Ticket{}
	}
	c.JSON(http.StatusOK, tickets)
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

func (h *EventHandler) GetEventGreenMetrics(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load event"})
		return
	}
	if !isEventPubliclyListed(event) {
		uid, ok := authUserID(c)
		if !ok || event.OrganizerID != uid {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
	}

	var venue *models.Venue
	if event.VenueID != nil {
		if v, err := h.venueRepo.GetByID(ctx, *event.VenueID); err == nil {
			venue = v
		}
	}
	ecoNames, err := h.eventRepo.GetEcoAttributeNamesByEventID(ctx, event.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch eco attributes"})
		return
	}
	metrics := service.CalculateGreenMetrics(event, venue, ecoNames)
	if err := metrics.Validate(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Metrics validation failed: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, metrics)
}

func containsEcoName(names []string, target string) bool {
	for _, name := range names {
		if name == target {
			return true
		}
	}
	return false
}
