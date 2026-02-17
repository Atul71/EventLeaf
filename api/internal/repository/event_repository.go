package repository

import (
	"context"

	"github.com/Atul71/EventLeaf/api/internal/db"
	"github.com/Atul71/EventLeaf/api/internal/models"
)

type EventRepository struct {
	db *db.DB
}

func NewEventRepository(db *db.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) Create(ctx context.Context, req *models.CreateEventRequest, isEcoFriendly bool) (*models.Event, error) {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var venueID interface{}
	if req.VenueID != nil {
		venueID = *req.VenueID
	}

	status := req.Status
	if status == "" {
		status = "draft"
	}
	visibility := req.Visibility
	if visibility == "" {
		visibility = "public"
	}

	var ecoSummary *string
	if req.EcoSummary != "" {
		ecoSummary = &req.EcoSummary
	}

	var event models.Event
	err = tx.QueryRow(ctx,
		`INSERT INTO events (
			title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time,
			is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets,
			status, visibility, category, has_digital_ticketing, has_paperless_checkin
		) VALUES ($1, $2, $3, $4, $5::date, $6::time, $7::time, $8, $9, $10, $11, $12, $13, $14, NULLIF($15,''), true, true)
		RETURNING id, title, description, organizer_id, venue_id, event_date, event_start_time::text, event_end_time::text,
			is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets,
			status, visibility, image_url, event_url, category, has_digital_ticketing, has_paperless_checkin,
			created_at, updated_at`,
		req.Title, req.Description, req.OrganizerID, venueID,
		req.EventDate, req.EventStartTime, req.EventEndTime,
		isEcoFriendly, ecoSummary, req.TicketPrice, req.TotalCapacity, req.TotalCapacity,
		status, visibility, emptyToNull(req.Category),
	).Scan(
		&event.ID, &event.Title, &event.Description, &event.OrganizerID, &event.VenueID,
		&event.EventDate, &event.EventStartTime, &event.EventEndTime,
		&event.IsEcoFriendly, &event.EcoSummary, &event.TicketPrice, &event.TotalCapacity, &event.AvailableTickets,
		&event.Status, &event.Visibility, &event.ImageURL, &event.EventURL, &event.Category,
		&event.HasDigitalTicketing, &event.HasPaperlessCheckin,
		&event.CreatedAt, &event.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	for _, attrID := range req.EcoAttributeIDs {
		_, err = tx.Exec(ctx,
			`INSERT INTO event_eco_attributes (event_id, eco_attribute_id) VALUES ($1, $2)`,
			event.ID, attrID,
		)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &event, nil
}

func emptyToNull(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
