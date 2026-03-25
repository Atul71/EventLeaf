package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/Atul71/EventLeaf/api/internal/repository"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	calendar "google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type GoogleCalendarService struct {
	repo      *repository.GoogleCalendarRepository
	calendar  *calendar.Service
	calendarID string
	timezone  string
	enabled   bool
}

func NewGoogleCalendarService(
	ctx context.Context,
	repo *repository.GoogleCalendarRepository,
	clientID, clientSecret, refreshToken, calendarID, timezone string,
) (*GoogleCalendarService, error) {
	svc := &GoogleCalendarService{
		repo:       repo,
		calendarID: calendarID,
		timezone:   timezone,
	}

	if clientID == "" || clientSecret == "" || refreshToken == "" || calendarID == "" || timezone == "" {
		svc.enabled = false
		return svc, nil
	}

	conf := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     google.Endpoint,
		Scopes:       []string{calendar.CalendarEventsScope},
	}

	token := &oauth2.Token{RefreshToken: refreshToken}
	client := conf.Client(ctx, token)
	calendarClient, err := calendar.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return nil, err
	}

	svc.calendar = calendarClient
	svc.enabled = true
	return svc, nil
}

func (s *GoogleCalendarService) IsEnabled() bool {
	return s.enabled
}

func (s *GoogleCalendarService) SyncPublishedEvent(ctx context.Context, event *models.Event, venue *models.Venue) error {
	if !s.enabled {
		return fmt.Errorf("google calendar service is not configured")
	}

	startRFC3339, endRFC3339, err := s.eventDateTimes(event)
	if err != nil {
		return err
	}

	location := ""
	if venue != nil {
		location = strings.TrimSpace(strings.Join([]string{venue.Name, venue.Address, venue.City}, ", "))
	}

	googleEvent := &calendar.Event{
		Summary:     event.Title,
		Description: event.Description,
		Location:    location,
		Start: &calendar.EventDateTime{
			DateTime: startRFC3339,
			TimeZone: s.timezone,
		},
		End: &calendar.EventDateTime{
			DateTime: endRFC3339,
			TimeZone: s.timezone,
		},
	}

	existingID, exists, err := s.repo.GetMappingByEventID(ctx, event.ID)
	if err != nil {
		return err
	}

	var createdOrUpdated *calendar.Event
	if exists {
		createdOrUpdated, err = s.calendar.Events.Update(s.calendarID, existingID, googleEvent).Context(ctx).Do()
	} else {
		createdOrUpdated, err = s.calendar.Events.Insert(s.calendarID, googleEvent).Context(ctx).Do()
	}
	if err != nil {
		return err
	}

	return s.repo.UpsertMapping(ctx, event.ID, createdOrUpdated.Id, s.calendarID, createdOrUpdated.HtmlLink)
}

func (s *GoogleCalendarService) eventDateTimes(event *models.Event) (string, string, error) {
	loc, err := time.LoadLocation(s.timezone)
	if err != nil {
		return "", "", err
	}

	date := event.EventDate.Format("2006-01-02")
	start, err := time.ParseInLocation("2006-01-02 15:04:05", date+" "+event.EventStartTime, loc)
	if err != nil {
		return "", "", err
	}
	end, err := time.ParseInLocation("2006-01-02 15:04:05", date+" "+event.EventEndTime, loc)
	if err != nil {
		return "", "", err
	}
	return start.Format(time.RFC3339), end.Format(time.RFC3339), nil
}
