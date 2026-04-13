package service

import (
	"context"
	"testing"
	"time"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
)

func TestNewGoogleCalendarService_DisabledWithoutCredentials(t *testing.T) {
	svc, err := NewGoogleCalendarService(
		context.Background(),
		nil,
		"", "", "", "", "",
	)
	if err != nil {
		t.Fatal(err)
	}
	if svc.IsEnabled() {
		t.Fatal("expected disabled")
	}
}

func TestGoogleCalendarService_SyncPublishedEvent_NotConfigured(t *testing.T) {
	svc, _ := NewGoogleCalendarService(context.Background(), nil, "", "", "", "", "")
	ev := &models.Event{ID: uuid.New(), Title: "x", Description: "y", EventStartTime: "10:00:00", EventEndTime: "11:00:00"}
	ev.EventDate = time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	err := svc.SyncPublishedEvent(context.Background(), ev, nil)
	if err == nil {
		t.Fatal("expected error when not configured")
	}
}

func TestGoogleCalendarService_eventDateTimes(t *testing.T) {
	s := &GoogleCalendarService{timezone: "America/New_York"}
	ev := &models.Event{
		EventDate:      time.Date(2026, 3, 10, 0, 0, 0, 0, time.UTC),
		EventStartTime: "09:30:00",
		EventEndTime:   "10:45:00",
	}
	start, end, err := s.eventDateTimes(ev)
	if err != nil {
		t.Fatal(err)
	}
	if start == "" || end == "" {
		t.Fatalf("empty RFC3339: %q %q", start, end)
	}
	if start >= end {
		t.Fatalf("start should be before end: %q %q", start, end)
	}
}
