package repository

import (
	"context"
	"database/sql"

	"github.com/Atul71/EventLeaf/api/internal/db"
	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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

	// Ticketing / check-in booleans are derived from which eco attributes were selected.
	// Frontend passes `eco_attribute_ids` that correspond to:
	// - "Paperless Ticketing"
	// - "Digital Check-in"
	hasDigitalTicketing := false
	hasPaperlessCheckin := false

	if len(req.EcoAttributeIDs) > 0 {
		rows, qerr := tx.Query(ctx,
			`SELECT name
			 FROM eco_attributes
			 WHERE id = ANY($1)`,
			req.EcoAttributeIDs,
		)
		if qerr != nil {
			return nil, qerr
		}
		defer rows.Close()

		for rows.Next() {
			var name string
			if err := rows.Scan(&name); err != nil {
				return nil, err
			}
			switch name {
			case "Paperless Ticketing":
				hasDigitalTicketing = true
			case "Digital Check-in":
				hasPaperlessCheckin = true
			}
		}
		if err := rows.Err(); err != nil {
			return nil, err
		}
	}

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
		) VALUES ($1, $2, $3, $4, $5::date, $6::time, $7::time, $8, $9, $10, $11, $12, $13, $14, NULLIF($15,''), $16, $17)
		RETURNING id, title, description, organizer_id, venue_id, event_date, event_start_time::text, event_end_time::text,
			is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets,
			status, visibility, image_url, event_url, category, has_digital_ticketing, has_paperless_checkin,
			created_at, updated_at`,
		req.Title, req.Description, req.OrganizerID, venueID,
		req.EventDate, req.EventStartTime, req.EventEndTime,
		isEcoFriendly, ecoSummary, req.TicketPrice, req.TotalCapacity, req.TotalCapacity,
		status, visibility, emptyToNull(req.Category),
		hasDigitalTicketing, hasPaperlessCheckin,
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

const eventJoinSelect = `e.id, e.title, e.description, e.organizer_id, e.venue_id, e.event_date,
	e.event_start_time::text, e.event_end_time::text, e.is_eco_friendly, e.eco_summary,
	e.ticket_price, e.total_capacity, e.available_tickets, e.status, e.visibility,
	e.image_url, e.event_url, e.category, e.has_digital_ticketing, e.has_paperless_checkin,
	e.created_at, e.updated_at, v.name, v.city, v.eco_certifications,
	v.has_public_transit,
	COALESCE((
		SELECT array_agg(ea.name ORDER BY ea.name)
		FROM event_eco_attributes eea
		JOIN eco_attributes ea ON ea.id = eea.eco_attribute_id
		WHERE eea.event_id = e.id
	), ARRAY[]::text[])`

func scanEventJoined(row pgx.Row) (*models.Event, error) {
	var e models.Event
	var vName, vCity sql.NullString
	var venueCerts []string
	var ecoNames []string
	var hasPublicTransit sql.NullBool
	err := row.Scan(
		&e.ID, &e.Title, &e.Description, &e.OrganizerID, &e.VenueID,
		&e.EventDate, &e.EventStartTime, &e.EventEndTime,
		&e.IsEcoFriendly, &e.EcoSummary, &e.TicketPrice, &e.TotalCapacity, &e.AvailableTickets,
		&e.Status, &e.Visibility, &e.ImageURL, &e.EventURL, &e.Category,
		&e.HasDigitalTicketing, &e.HasPaperlessCheckin,
		&e.CreatedAt, &e.UpdatedAt,
		&vName, &vCity,
		&venueCerts,
		&hasPublicTransit,
		&ecoNames,
	)
	if err != nil {
		return nil, err
	}
	if vName.Valid {
		s := vName.String
		e.VenueName = &s
	}
	if vCity.Valid {
		s := vCity.String
		e.VenueCity = &s
	}
	if len(venueCerts) > 0 {
		e.VenueEcoCertifications = venueCerts
	}
	if len(ecoNames) > 0 {
		e.EcoAttributeNames = ecoNames
	}
	// venues.has_public_transit is safe to default to false when the join misses (NULL → false).
	if hasPublicTransit.Valid {
		e.HasPublicTransit = hasPublicTransit.Bool
	}
	return &e, nil
}

// ListPublished returns public published events with optional venue name/city (newest first by date).
func (r *EventRepository) ListPublished(ctx context.Context, limit, offset int) ([]models.Event, error) {
	rows, err := r.db.Pool.Query(ctx,
		`SELECT `+eventJoinSelect+`
		FROM events e
		LEFT JOIN venues v ON v.id = e.venue_id
		WHERE e.status = 'published' AND e.visibility = 'public'
		ORDER BY e.event_date ASC, e.event_start_time ASC NULLS LAST
		LIMIT $1 OFFSET $2`,
		limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Event
	for rows.Next() {
		ev, err := scanEventJoined(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *ev)
	}
	return out, rows.Err()
}

// ListByOrganizer returns events for one organizer (draft, published, etc.), newest first.
func (r *EventRepository) ListByOrganizer(ctx context.Context, organizerID uuid.UUID, limit, offset int) ([]models.Event, error) {
	rows, err := r.db.Pool.Query(ctx,
		`SELECT `+eventJoinSelect+`
		FROM events e
		LEFT JOIN venues v ON v.id = e.venue_id
		WHERE e.organizer_id = $1
		ORDER BY e.updated_at DESC NULLS LAST, e.created_at DESC
		LIMIT $2 OFFSET $3`,
		organizerID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Event
	for rows.Next() {
		ev, err := scanEventJoined(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *ev)
	}
	return out, rows.Err()
}

// ListSavedByUser returns published public events the user bookmarked (newest save first).
func (r *EventRepository) ListSavedByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Event, error) {
	rows, err := r.db.Pool.Query(ctx,
		`SELECT `+eventJoinSelect+`
		FROM user_favorites uf
		INNER JOIN events e ON e.id = uf.event_id
		LEFT JOIN venues v ON v.id = e.venue_id
		WHERE uf.user_id = $1 AND e.status = 'published' AND e.visibility = 'public'
		ORDER BY uf.created_at DESC
		LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Event
	for rows.Next() {
		ev, err := scanEventJoined(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *ev)
	}
	return out, rows.Err()
}

// PublishForOrganizer sets status to published for the organizer's event (idempotent if already published).
func (r *EventRepository) PublishForOrganizer(ctx context.Context, eventID, organizerID uuid.UUID) (*models.Event, error) {
	cmd, err := r.db.Pool.Exec(ctx,
		`UPDATE events SET status = 'published', updated_at = NOW() WHERE id = $1 AND organizer_id = $2`,
		eventID, organizerID,
	)
	if err != nil {
		return nil, err
	}
	if cmd.RowsAffected() == 0 {
		return nil, pgx.ErrNoRows
	}
	return r.GetByID(ctx, eventID)
}

// GetByID returns one event with optional venue name/city.
func (r *EventRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Event, error) {
	ev, err := scanEventJoined(r.db.Pool.QueryRow(ctx,
		`SELECT `+eventJoinSelect+`
		FROM events e
		LEFT JOIN venues v ON v.id = e.venue_id
		WHERE e.id = $1`,
		id,
	))
	if err != nil {
		return nil, err
	}
	return ev, nil
}

func emptyToNull(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
