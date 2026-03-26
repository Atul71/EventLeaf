package models

import (
	"time"

	"github.com/google/uuid"
)

type CreateEventRequest struct {
	Title           string     `json:"title" binding:"required,max=255"`
	Description     string     `json:"description" binding:"required"`
	OrganizerID     uuid.UUID  `json:"organizer_id" binding:"required"`
	VenueID         *uuid.UUID `json:"venue_id"`
	EventDate       string     `json:"event_date" binding:"required"`
	EventStartTime  string     `json:"event_start_time" binding:"required"`
	EventEndTime    string     `json:"event_end_time" binding:"required"`
	EcoSummary      string     `json:"eco_summary"`
	TicketPrice     float64    `json:"ticket_price" binding:"gte=0"`
	TotalCapacity   int        `json:"total_capacity" binding:"gt=0"`
	Status          string     `json:"status"`
	Visibility      string     `json:"visibility"`
	Category        string     `json:"category"`
	EcoAttributeIDs []uuid.UUID `json:"eco_attribute_ids"`
}

type Event struct {
	ID                  uuid.UUID  `json:"id"`
	Title               string     `json:"title"`
	Description         string     `json:"description"`
	OrganizerID         uuid.UUID  `json:"organizer_id"`
	VenueID             *uuid.UUID `json:"venue_id"`
	EventDate           time.Time  `json:"event_date"`
	EventStartTime      string     `json:"event_start_time"`
	EventEndTime        string     `json:"event_end_time"`
	IsEcoFriendly       bool       `json:"is_eco_friendly"`
	EcoSummary          *string    `json:"eco_summary"`
	TicketPrice         float64    `json:"ticket_price"`
	TotalCapacity       int        `json:"total_capacity"`
	AvailableTickets    int        `json:"available_tickets"`
	Status              string     `json:"status"`
	Visibility          string     `json:"visibility"`
	ImageURL            *string    `json:"image_url"`
	EventURL            *string    `json:"event_url"`
	Category            *string    `json:"category"`
	HasDigitalTicketing bool       `json:"has_digital_ticketing"`
	HasPaperlessCheckin bool       `json:"has_paperless_checkin"`
	// Populated for list/detail responses with a venue join (defaults false when venue is missing).
	HasPublicTransit bool `json:"has_public_transit"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
	// Populated for list/detail responses with a venue join (omitted when empty).
	VenueName *string `json:"venue_name,omitempty"`
	VenueCity *string `json:"venue_city,omitempty"`
	// VenueEcoCertifications from venues.eco_certifications (TEXT[]).
	VenueEcoCertifications []string `json:"venue_eco_certifications,omitempty"`
	// EcoAttributeNames from event_eco_attributes → eco_attributes names.
	EcoAttributeNames []string `json:"eco_attribute_names,omitempty"`
}

type CreateEventResponse struct {
	Event           Event    `json:"event"`
	IsGreen         bool     `json:"is_green"`
	GreenCriteria   []string `json:"green_criteria_met,omitempty"`
	NotGreenReasons []string `json:"green_criteria_not_met,omitempty"`
}
