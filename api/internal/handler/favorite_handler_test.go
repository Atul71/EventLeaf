package handler

import (
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

type fakeFavoriteStore struct {
	addErr     error
	removeErr  error
	listErr    error
	listIDs    []uuid.UUID
	addCalls   int
	lastUserID uuid.UUID
	lastEvent  uuid.UUID
}

func (f *fakeFavoriteStore) Add(ctx context.Context, userID, eventID uuid.UUID) error {
	f.addCalls++
	f.lastUserID = userID
	f.lastEvent = eventID
	return f.addErr
}

func (f *fakeFavoriteStore) Remove(ctx context.Context, userID, eventID uuid.UUID) error {
	return f.removeErr
}

func (f *fakeFavoriteStore) ListEventIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	if f.listErr != nil {
		return nil, f.listErr
	}
	return f.listIDs, nil
}

func TestAddSavedEvent_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewFavoriteHandler(&fakeFavoriteStore{}, &fakeEventRepo{})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/me/saved-events/"+uuid.New().String(), nil)
	c.Params = gin.Params{{Key: "eventId", Value: uuid.New().String()}}
	h.AddSavedEvent(c)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("want 401 got %d body %s", w.Code, w.Body.String())
	}
}

func TestAddSavedEvent_InvalidEventID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	uid := uuid.New()
	h := NewFavoriteHandler(&fakeFavoriteStore{}, &fakeEventRepo{})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set(middleware.ContextUserIDKey, uid.String())
	c.Request = httptest.NewRequest(http.MethodPost, "/me/saved-events/not-uuid", nil)
	c.Params = gin.Params{{Key: "eventId", Value: "not-uuid"}}
	h.AddSavedEvent(c)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("want 400 got %d", w.Code)
	}
}

func TestAddSavedEvent_NotPublished(t *testing.T) {
	gin.SetMode(gin.TestMode)
	uid := uuid.New()
	eid := uuid.New()
	ev := &models.Event{
		ID:             eid,
		Title:          "Draft",
		Description:    "x",
		EventDate:      time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC),
		EventStartTime: "10:00:00",
		EventEndTime:   "11:00:00",
		Status:         "draft",
		Visibility:     "public",
	}
	events := &fakeEventRepo{
		getFn: func(ctx context.Context, id uuid.UUID) (*models.Event, error) {
			return ev, nil
		},
	}
	fav := &fakeFavoriteStore{}
	h := NewFavoriteHandler(fav, events)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set(middleware.ContextUserIDKey, uid.String())
	c.Request = httptest.NewRequest(http.MethodPost, "/me/saved-events/"+eid.String(), nil)
	c.Params = gin.Params{{Key: "eventId", Value: eid.String()}}
	h.AddSavedEvent(c)
	if w.Code != http.StatusNotFound {
		t.Fatalf("want 404 got %d", w.Code)
	}
	if fav.addCalls != 0 {
		t.Fatalf("Add should not run for draft event")
	}
}

func TestAddSavedEvent_OK(t *testing.T) {
	gin.SetMode(gin.TestMode)
	uid := uuid.New()
	eid := uuid.New()
	ev := &models.Event{
		ID:             eid,
		Title:        "Pub",
		Description:  "x",
		EventDate:    time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC),
		EventStartTime: "10:00:00",
		EventEndTime:   "11:00:00",
		Status:         "published",
		Visibility:     "public",
	}
	events := &fakeEventRepo{
		getFn: func(ctx context.Context, id uuid.UUID) (*models.Event, error) {
			return ev, nil
		},
	}
	fav := &fakeFavoriteStore{}
	h := NewFavoriteHandler(fav, events)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set(middleware.ContextUserIDKey, uid.String())
	c.Request = httptest.NewRequest(http.MethodPost, "/me/saved-events/"+eid.String(), nil)
	c.Params = gin.Params{{Key: "eventId", Value: eid.String()}}
	h.AddSavedEvent(c)
	if w.Code != http.StatusNoContent {
		t.Fatalf("want 204 got %d body %s", w.Code, w.Body.String())
	}
	if fav.addCalls != 1 || fav.lastUserID != uid || fav.lastEvent != eid {
		t.Fatalf("Add not called correctly: calls=%d user=%v event=%v", fav.addCalls, fav.lastUserID, fav.lastEvent)
	}
}

func TestListSavedEventIDs_OK(t *testing.T) {
	gin.SetMode(gin.TestMode)
	uid := uuid.New()
	id1 := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	id2 := uuid.MustParse("22222222-2222-2222-2222-222222222222")
	fav := &fakeFavoriteStore{listIDs: []uuid.UUID{id1, id2}}
	h := NewFavoriteHandler(fav, &fakeEventRepo{})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set(middleware.ContextUserIDKey, uid.String())
	c.Request = httptest.NewRequest(http.MethodGet, "/me/saved-event-ids", nil)
	h.ListSavedEventIDs(c)
	if w.Code != http.StatusOK {
		t.Fatalf("want 200 got %d", w.Code)
	}
	var body struct {
		EventIDs []string `json:"event_ids"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if len(body.EventIDs) != 2 || body.EventIDs[0] != id1.String() || body.EventIDs[1] != id2.String() {
		t.Fatalf("unexpected body %s", w.Body.String())
	}
}

func TestListSavedEvents_RepoError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	uid := uuid.New()
	events := &fakeEventRepo{
		listSavedFn: func(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Event, error) {
			return nil, pgx.ErrNoRows // any error
		},
	}
	h := NewFavoriteHandler(&fakeFavoriteStore{}, events)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Set(middleware.ContextUserIDKey, uid.String())
	c.Request = httptest.NewRequest(http.MethodGet, "/me/saved-events", nil)
	h.ListSavedEvents(c)
	if w.Code != http.StatusInternalServerError {
		t.Fatalf("want 500 got %d", w.Code)
	}
}
