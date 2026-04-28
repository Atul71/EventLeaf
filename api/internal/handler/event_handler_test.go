package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/Atul71/EventLeaf/api/internal/middleware"
	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type fakeEventRepo struct {
	createFn      func(ctx context.Context, req *models.CreateEventRequest, green bool) (*models.Event, error)
	getFn         func(ctx context.Context, id uuid.UUID) (*models.Event, error)
	listFn        func(ctx context.Context, limit, offset int) ([]models.Event, error)
	listSavedFn   func(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Event, error)
	buyFn         func(ctx context.Context, eventID, userID uuid.UUID, ticketType string, quantity int) ([]models.Ticket, int, error)
	listTicketsFn func(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Ticket, error)
}

func (f *fakeEventRepo) Create(ctx context.Context, req *models.CreateEventRequest, isEcoFriendly bool) (*models.Event, error) {
	if f.createFn != nil {
		return f.createFn(ctx, req, isEcoFriendly)
	}
	return nil, nil
}

func (f *fakeEventRepo) GetByID(ctx context.Context, id uuid.UUID) (*models.Event, error) {
	if f.getFn != nil {
		return f.getFn(ctx, id)
	}
	return nil, pgx.ErrNoRows
}

func (f *fakeEventRepo) ListPublished(ctx context.Context, limit, offset int) ([]models.Event, error) {
	if f.listFn != nil {
		return f.listFn(ctx, limit, offset)
	}
	return []models.Event{}, nil
}

func (f *fakeEventRepo) ListByOrganizer(ctx context.Context, organizerID uuid.UUID, limit, offset int) ([]models.Event, error) {
	return nil, nil
}

func (f *fakeEventRepo) PublishForOrganizer(ctx context.Context, eventID, organizerID uuid.UUID) (*models.Event, error) {
	return nil, pgx.ErrNoRows
}

func (f *fakeEventRepo) UpdateDraftForOrganizer(
	ctx context.Context,
	eventID, organizerID uuid.UUID,
	req *models.UpdateEventRequest,
	isEcoFriendly bool,
) (*models.Event, error) {
	return nil, pgx.ErrNoRows
}

func (f *fakeEventRepo) ListSavedByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Event, error) {
	if f.listSavedFn != nil {
		return f.listSavedFn(ctx, userID, limit, offset)
	}
	return []models.Event{}, nil
}

func (f *fakeEventRepo) ListOrganizerAnalytics(
	ctx context.Context,
	organizerID uuid.UUID,
	limit, offset int,
) ([]models.OrganizerEventAnalytics, error) {
	return []models.OrganizerEventAnalytics{}, nil
}

func (f *fakeEventRepo) GetEcoAttributeNamesByEventID(ctx context.Context, eventID uuid.UUID) ([]string, error) {
	return []string{}, nil
}

func (f *fakeEventRepo) BuyTicket(ctx context.Context, eventID, userID uuid.UUID, ticketType string, quantity int) ([]models.Ticket, int, error) {
	if f.buyFn != nil {
		return f.buyFn(ctx, eventID, userID, ticketType, quantity)
	}
	return nil, 0, pgx.ErrNoRows
}

func (f *fakeEventRepo) ListTicketsByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Ticket, error) {
	if f.listTicketsFn != nil {
		return f.listTicketsFn(ctx, userID, limit, offset)
	}
	return []models.Ticket{}, nil
}

type fakeVenueRepo struct {
	getFn func(ctx context.Context, id uuid.UUID) (*models.Venue, error)
}

func (f *fakeVenueRepo) Create(ctx context.Context, req *models.CreateVenueRequest) (*models.Venue, error) {
	return nil, nil
}
func (f *fakeVenueRepo) GetByID(ctx context.Context, id uuid.UUID) (*models.Venue, error) {
	if f.getFn != nil {
		return f.getFn(ctx, id)
	}
	return nil, pgx.ErrNoRows
}
func (f *fakeVenueRepo) List(ctx context.Context, limit, offset int) ([]models.Venue, error) {
	return nil, nil
}
func (f *fakeVenueRepo) Update(ctx context.Context, id uuid.UUID, req *models.UpdateVenueRequest) (*models.Venue, error) {
	return nil, nil
}
func (f *fakeVenueRepo) Delete(ctx context.Context, id uuid.UUID) error { return nil }

type fakeEcoRepo struct {
	namesFn func(ctx context.Context, ids []uuid.UUID) ([]string, error)
	listFn  func(ctx context.Context) ([]models.EcoAttribute, error)
}

func (f *fakeEcoRepo) GetNamesByIDs(ctx context.Context, ids []uuid.UUID) ([]string, error) {
	if f.namesFn != nil {
		return f.namesFn(ctx, ids)
	}
	return nil, nil
}
func (f *fakeEcoRepo) ListAll(ctx context.Context) ([]models.EcoAttribute, error) {
	if f.listFn != nil {
		return f.listFn(ctx)
	}
	return nil, nil
}

func TestCreateEvent_BadJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewEventHandler(&fakeEventRepo{}, &fakeVenueRepo{}, &fakeEcoRepo{}, nil, "America/New_York")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/events", bytes.NewBufferString(`{`))
	c.Request.Header.Set("Content-Type", "application/json")
	h.CreateEvent(c)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("code %d", w.Code)
	}
}

func TestGetEventCalendarICS_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewEventHandler(&fakeEventRepo{}, &fakeVenueRepo{}, &fakeEcoRepo{}, nil, "America/New_York")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/events/bad/calendar.ics", nil)
	c.Params = gin.Params{{Key: "id", Value: "not-a-uuid"}}
	h.GetEventCalendarICS(c)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("code %d", w.Code)
	}
}

func TestGetEventCalendarICS_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	id := uuid.New()
	events := &fakeEventRepo{
		getFn: func(ctx context.Context, eid uuid.UUID) (*models.Event, error) {
			return nil, pgx.ErrNoRows
		},
	}
	h := NewEventHandler(events, &fakeVenueRepo{}, &fakeEcoRepo{}, nil, "America/New_York")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/events/"+id.String()+"/calendar.ics", nil)
	c.Params = gin.Params{{Key: "id", Value: id.String()}}
	h.GetEventCalendarICS(c)
	if w.Code != http.StatusNotFound {
		t.Fatalf("code %d", w.Code)
	}
}

func TestGetEventCalendarICS_OK(t *testing.T) {
	gin.SetMode(gin.TestMode)
	id := uuid.MustParse("33333333-3333-3333-3333-333333333333")
	ev := &models.Event{
		ID:             id,
		Title:          "Hi",
		Description:    "Desc",
		EventDate:      time.Date(2026, 8, 1, 0, 0, 0, 0, time.UTC),
		EventStartTime: "12:00:00",
		EventEndTime:   "13:00:00",
		Status:         "published",
		Visibility:     "public",
	}
	events := &fakeEventRepo{
		getFn: func(ctx context.Context, eid uuid.UUID) (*models.Event, error) {
			return ev, nil
		},
	}
	h := NewEventHandler(events, &fakeVenueRepo{}, &fakeEcoRepo{}, nil, "America/New_York")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/events/"+id.String()+"/calendar.ics", nil)
	c.Params = gin.Params{{Key: "id", Value: id.String()}}
	h.GetEventCalendarICS(c)
	if w.Code != http.StatusOK {
		t.Fatalf("code %d body %s", w.Code, w.Body.String())
	}
	if ct := w.Header().Get("Content-Type"); ct != "text/calendar; charset=utf-8" {
		t.Fatalf("Content-Type: %s", ct)
	}
	if !bytes.Contains(w.Body.Bytes(), []byte("BEGIN:VCALENDAR")) {
		t.Fatalf("not ics: %s", w.Body.Bytes())
	}
}

func TestListEcoAttributes_OK(t *testing.T) {
	gin.SetMode(gin.TestMode)
	eco := &fakeEcoRepo{
		listFn: func(ctx context.Context) ([]models.EcoAttribute, error) {
			return []models.EcoAttribute{{Name: "Paperless Ticketing", Category: "x"}}, nil
		},
	}
	h := NewEventHandler(&fakeEventRepo{}, &fakeVenueRepo{}, eco, nil, "America/New_York")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/eco-attributes", nil)
	h.ListEcoAttributes(c)
	if w.Code != http.StatusOK {
		t.Fatalf("code %d", w.Code)
	}
	var out []models.EcoAttribute
	if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil || len(out) != 1 {
		t.Fatalf("body %s err %v", w.Body.String(), err)
	}
}

func TestBuyTicket_InvalidEventID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewEventHandler(&fakeEventRepo{}, &fakeVenueRepo{}, &fakeEcoRepo{}, nil, "America/New_York")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set(middleware.ContextUserIDKey, uuid.New().String())
	c.Request = httptest.NewRequest(http.MethodPost, "/events/bad/tickets", bytes.NewBufferString(`{"ticket_type":"general"}`))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Params = gin.Params{{Key: "id", Value: "bad-id"}}

	h.BuyTicket(c)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("code %d body %s", w.Code, w.Body.String())
	}
}

func TestBuyTicket_OK(t *testing.T) {
	gin.SetMode(gin.TestMode)
	eventID := uuid.New()
	userID := uuid.New()
	repo := &fakeEventRepo{
		buyFn: func(ctx context.Context, eid, uid uuid.UUID, ticketType string, quantity int) ([]models.Ticket, int, error) {
			if eid != eventID || uid != userID {
				t.Fatalf("wrong ids eid=%s uid=%s", eid, uid)
			}
			if quantity != 1 {
				t.Fatalf("expected quantity 1 got %d", quantity)
			}
			return []models.Ticket{{
				ID:           uuid.New(),
				UserID:       uid,
				EventID:      eid,
				TicketNumber: "EL-123",
				TicketType:   "general",
				Status:       "active",
				PricePaid:    0,
				QRCodeValue:  "eventleaf:ticket:123",
			}}, 9, nil
		},
	}
	h := NewEventHandler(repo, &fakeVenueRepo{}, &fakeEcoRepo{}, nil, "America/New_York")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set(middleware.ContextUserIDKey, userID.String())
	c.Request = httptest.NewRequest(http.MethodPost, "/events/"+eventID.String()+"/tickets", bytes.NewBufferString(`{"ticket_type":"general"}`))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Params = gin.Params{{Key: "id", Value: eventID.String()}}

	h.BuyTicket(c)
	if w.Code != http.StatusCreated {
		t.Fatalf("code %d body %s", w.Code, w.Body.String())
	}
}

func TestListMyTickets_OK(t *testing.T) {
	gin.SetMode(gin.TestMode)
	userID := uuid.New()
	eventTitle := "Green Night"
	eventDate := "2026-07-01"
	repo := &fakeEventRepo{
		listTicketsFn: func(ctx context.Context, uid uuid.UUID, limit, offset int) ([]models.Ticket, error) {
			if uid != userID {
				t.Fatalf("unexpected user id %s", uid)
			}
			return []models.Ticket{
				{
					ID:           uuid.New(),
					UserID:       uid,
					EventID:      uuid.New(),
					TicketNumber: "EL-1",
					TicketType:   "general",
					Status:       "active",
					EventTitle:   &eventTitle,
					EventDate:    &eventDate,
				},
			}, nil
		},
	}
	h := NewEventHandler(repo, &fakeVenueRepo{}, &fakeEcoRepo{}, nil, "America/New_York")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set(middleware.ContextUserIDKey, userID.String())
	c.Request = httptest.NewRequest(http.MethodGet, "/me/tickets", nil)

	h.ListMyTickets(c)
	if w.Code != http.StatusOK {
		t.Fatalf("code %d body %s", w.Code, w.Body.String())
	}
}
