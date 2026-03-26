package service

import (
	"strings"
	"testing"
	"time"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
)

func TestBuildEventICS(t *testing.T) {
	id := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	eventDate := time.Date(2026, 6, 15, 0, 0, 0, 0, time.UTC)
	ev := &models.Event{
		ID:             id,
		Title:          "Summer Fest",
		Description:    "A test event with; special, chars",
		EventDate:      eventDate,
		EventStartTime: "10:00:00",
		EventEndTime:   "11:30:00",
		Status:         "published",
	}
	venue := &models.Venue{
		Name:    "Park",
		Address: "123 Main St",
		City:    "Gainesville",
	}
	out, err := BuildEventICS(ev, venue, "America/New_York")
	if err != nil {
		t.Fatal(err)
	}
	s := string(out)
	if !strings.Contains(s, "BEGIN:VCALENDAR") || !strings.Contains(s, "END:VCALENDAR") {
		t.Fatalf("missing calendar envelope: %s", s)
	}
	if !strings.Contains(s, "SUMMER FEST") && !strings.Contains(s, "Summer Fest") {
		t.Fatalf("expected title in output: %s", s)
	}
	if !strings.Contains(s, id.String()+"@eventleaf") {
		t.Fatalf("expected UID: %s", s)
	}
	if !strings.Contains(s, "Park") || !strings.Contains(s, "Gainesville") {
		t.Fatalf("expected location: %s", s)
	}
}

func TestBuildEventICS_nilEvent(t *testing.T) {
	_, err := BuildEventICS(nil, nil, "UTC")
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestBuildEventICS_defaultTimeZone(t *testing.T) {
	id := uuid.MustParse("22222222-2222-2222-2222-222222222222")
	ev := &models.Event{
		ID:             id,
		Title:          "T",
		Description:    "D",
		EventDate:      time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC),
		EventStartTime: "09:00:00",
		EventEndTime:   "10:00:00",
	}
	out, err := BuildEventICS(ev, nil, "")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(out), "America/New_York") {
		t.Fatalf("expected default TZ in output: %s", out)
	}
}

func TestEventStartEndInZone(t *testing.T) {
	loc, _ := time.LoadLocation("America/New_York")
	ev := &models.Event{
		EventDate:      time.Date(2026, 7, 4, 0, 0, 0, 0, time.UTC),
		EventStartTime: "14:00:00",
		EventEndTime:   "15:00:00",
	}
	start, end, err := eventStartEndInZone(ev, loc)
	if err != nil {
		t.Fatal(err)
	}
	if start.Hour() != 14 || end.Hour() != 15 {
		t.Fatalf("start=%v end=%v", start, end)
	}
}

func TestEscapeICSText(t *testing.T) {
	if got := escapeICSText("a;b,c"); got != `a\;b\,c` {
		t.Fatalf("got %q", got)
	}
	if got := escapeICSText("line1\nline2"); !strings.Contains(got, `\n`) {
		t.Fatalf("got %q", got)
	}
}

func TestWriteFolded(t *testing.T) {
	var b strings.Builder
	long := strings.Repeat("x", 100)
	writeFolded(&b, "DESCRIPTION", long)
	out := b.String()
	lines := strings.Split(strings.TrimSpace(out), "\r\n")
	if len(lines) < 2 {
		t.Fatalf("expected folded lines, got: %q", out)
	}
	if !strings.HasPrefix(lines[1], " ") {
		t.Fatalf("continuation should start with space: %q", lines[1])
	}
}
