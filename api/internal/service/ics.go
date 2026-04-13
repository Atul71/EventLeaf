package service

import (
	"fmt"
	"strings"
	"time"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
)

// BuildEventICS returns an iCalendar (RFC 5545) document for the event.
// Times use TZID in the VEVENT (no VTIMEZONE block; most clients infer zone by name).
func BuildEventICS(event *models.Event, venue *models.Venue, timeZone string) ([]byte, error) {
	if event == nil {
		return nil, fmt.Errorf("event is required")
	}
	if timeZone == "" {
		timeZone = "America/New_York"
	}
	loc, err := time.LoadLocation(timeZone)
	if err != nil {
		return nil, err
	}

	start, end, err := eventStartEndInZone(event, loc)
	if err != nil {
		return nil, err
	}

	uid := eventUID(event.ID)
	dtstamp := time.Now().UTC().Format("20060102T150405Z")
	dtstart := start.Format("20060102T150405")
	dtend := end.Format("20060102T150405")

	summary := escapeICSText(event.Title)
	desc := escapeICSText(event.Description)
	if event.EcoSummary != nil && strings.TrimSpace(*event.EcoSummary) != "" {
		desc = escapeICSText(event.Description + "\n\n" + *event.EcoSummary)
	}

	location := ""
	if venue != nil {
		parts := []string{venue.Name, venue.Address, venue.City}
		if venue.State != nil && *venue.State != "" {
			parts = append(parts, *venue.State)
		}
		if venue.ZipCode != nil && *venue.ZipCode != "" {
			parts = append(parts, *venue.ZipCode)
		}
		location = strings.Join(parts, ", ")
		location = strings.TrimSpace(strings.ReplaceAll(location, ", ,", ","))
	}
	location = escapeICSText(location)

	var b strings.Builder
	b.WriteString("BEGIN:VCALENDAR\r\n")
	b.WriteString("VERSION:2.0\r\n")
	b.WriteString("PRODID:-//EventLeaf//EN\r\n")
	b.WriteString("CALSCALE:GREGORIAN\r\n")
	b.WriteString("METHOD:PUBLISH\r\n")
	b.WriteString("BEGIN:VEVENT\r\n")
	fmt.Fprintf(&b, "UID:%s\r\n", uid)
	fmt.Fprintf(&b, "DTSTAMP:%s\r\n", dtstamp)
	fmt.Fprintf(&b, "DTSTART;TZID=%s:%s\r\n", escapeICSText(timeZone), dtstart)
	fmt.Fprintf(&b, "DTEND;TZID=%s:%s\r\n", escapeICSText(timeZone), dtend)
	fmt.Fprintf(&b, "SUMMARY:%s\r\n", summary)
	if desc != "" {
		writeFolded(&b, "DESCRIPTION", desc)
	}
	if location != "" {
		fmt.Fprintf(&b, "LOCATION:%s\r\n", location)
	}
	b.WriteString("END:VEVENT\r\n")
	b.WriteString("END:VCALENDAR\r\n")
	return []byte(b.String()), nil
}

func eventUID(id uuid.UUID) string {
	return id.String() + "@eventleaf"
}

func eventStartEndInZone(event *models.Event, loc *time.Location) (time.Time, time.Time, error) {
	date := event.EventDate.Format("2006-01-02")
	start, err := time.ParseInLocation("2006-01-02 15:04:05", date+" "+strings.TrimSpace(event.EventStartTime), loc)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}
	end, err := time.ParseInLocation("2006-01-02 15:04:05", date+" "+strings.TrimSpace(event.EventEndTime), loc)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}
	return start, end, nil
}

func escapeICSText(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, ";", "\\;")
	s = strings.ReplaceAll(s, ",", "\\,")
	s = strings.ReplaceAll(s, "\r\n", "\n")
	s = strings.ReplaceAll(s, "\r", "\n")
	s = strings.ReplaceAll(s, "\n", "\\n")
	return s
}

// writeFolded writes a property value with RFC 5545 line folding (75 octets per line).
func writeFolded(b *strings.Builder, name, value string) {
	line := name + ":" + value
	for len(line) > 0 {
		chunk := line
		if len(chunk) > 75 {
			chunk = line[:75]
		}
		b.WriteString(chunk)
		b.WriteString("\r\n")
		line = line[len(chunk):]
		if len(line) > 0 {
			line = " " + line
		}
	}
}
