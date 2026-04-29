package repository

import (
	"context"
	"database/sql"
	"fmt"

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

func (r *EventRepository) UpdateDraftForOrganizer(
	ctx context.Context,
	eventID, organizerID uuid.UUID,
	req *models.UpdateEventRequest,
	isEcoFriendly bool,
) (*models.Event, error) {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

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
		`UPDATE events
		 SET title = $1,
		     description = $2,
		     venue_id = $3,
		     event_date = $4::date,
		     event_start_time = $5::time,
		     event_end_time = $6::time,
		     is_eco_friendly = $7,
		     eco_summary = $8,
		     ticket_price = $9,
		     total_capacity = $10,
		     available_tickets = $10,
		     visibility = $11,
		     category = NULLIF($12,''),
		     has_digital_ticketing = $13,
		     has_paperless_checkin = $14,
		     updated_at = NOW()
		 WHERE id = $15 AND organizer_id = $16 AND status = 'draft'
		 RETURNING id, title, description, organizer_id, venue_id, event_date, event_start_time::text, event_end_time::text,
		   is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets,
		   status, visibility, image_url, event_url, category, has_digital_ticketing, has_paperless_checkin,
		   created_at, updated_at`,
		req.Title, req.Description, venueID,
		req.EventDate, req.EventStartTime, req.EventEndTime,
		isEcoFriendly, ecoSummary, req.TicketPrice, req.TotalCapacity,
		visibility, emptyToNull(req.Category), hasDigitalTicketing, hasPaperlessCheckin,
		eventID, organizerID,
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

	if _, err := tx.Exec(ctx, `DELETE FROM event_eco_attributes WHERE event_id = $1`, eventID); err != nil {
		return nil, err
	}
	for _, attrID := range req.EcoAttributeIDs {
		if _, err := tx.Exec(ctx, `INSERT INTO event_eco_attributes (event_id, eco_attribute_id) VALUES ($1, $2)`, eventID, attrID); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return r.GetByID(ctx, eventID)
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

func (r *EventRepository) ListOrganizerAnalytics(
	ctx context.Context,
	organizerID uuid.UUID,
	limit, offset int,
) ([]models.OrganizerEventAnalytics, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT
			e.id,
			e.title,
			e.event_date,
			e.status,
			e.is_eco_friendly,
			e.total_capacity,
			e.available_tickets,
			COUNT(DISTINCT t.id)::int AS tickets_sold,
			COUNT(DISTINCT ci.ticket_id)::int AS checked_in_count,
			COALESCE(SUM(CASE WHEN t.status IN ('active', 'used') THEN t.price_paid ELSE 0 END), 0)::float8 AS revenue
		FROM events e
		LEFT JOIN tickets t ON t.event_id = e.id
		LEFT JOIN check_ins ci ON ci.event_id = e.id
		WHERE e.organizer_id = $1
		GROUP BY e.id, e.title, e.event_date, e.status, e.is_eco_friendly, e.total_capacity, e.available_tickets
		ORDER BY e.event_date DESC, e.created_at DESC
		LIMIT $2 OFFSET $3
	`, organizerID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]models.OrganizerEventAnalytics, 0)
	for rows.Next() {
		var a models.OrganizerEventAnalytics
		if err := rows.Scan(
			&a.EventID,
			&a.Title,
			&a.EventDate,
			&a.Status,
			&a.IsEcoFriendly,
			&a.TotalCapacity,
			&a.AvailableTickets,
			&a.TicketsSold,
			&a.CheckedInCount,
			&a.Revenue,
		); err != nil {
			return nil, err
		}
		out = append(out, a)
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

func (r *EventRepository) GetEcoAttributeNamesByEventID(ctx context.Context, eventID uuid.UUID) ([]string, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT ea.name
		FROM event_eco_attributes eea
		JOIN eco_attributes ea ON ea.id = eea.eco_attribute_id
		WHERE eea.event_id = $1
		ORDER BY ea.name
	`, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var names []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		names = append(names, name)
	}
	return names, rows.Err()
}

func (r *EventRepository) BuyTicket(ctx context.Context, eventID, userID uuid.UUID, ticketType string, quantity int) ([]models.Ticket, int, error) {
	if ticketType == "" {
		ticketType = "general"
	}
	if quantity < 1 {
		quantity = 1
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return nil, 0, err
	}
	defer tx.Rollback(ctx)

	var pricePaid float64
	var remaining int
	err = tx.QueryRow(ctx, `
		UPDATE events
		SET available_tickets = available_tickets - $2,
			updated_at = NOW()
		WHERE id = $1
		  AND status = 'published'
		  AND event_date >= CURRENT_DATE
		  AND available_tickets >= $2
		RETURNING ticket_price, available_tickets
	`, eventID, quantity).Scan(&pricePaid, &remaining)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, 0, pgx.ErrNoRows
		}
		return nil, 0, err
	}

	tickets := make([]models.Ticket, 0, quantity)
	for i := 0; i < quantity; i++ {
		ticketUUID := uuid.New()
		ticketNumber := fmt.Sprintf("EL-%s", ticketUUID.String())
		qrValue := fmt.Sprintf("eventleaf:ticket:%s", ticketUUID.String())

		var t models.Ticket
		err = tx.QueryRow(ctx, `
			INSERT INTO tickets (
				id, user_id, event_id, ticket_number, ticket_type, status, price_paid
			) VALUES ($1, $2, $3, $4, $5, 'active', $6)
			RETURNING id, user_id, event_id, ticket_number, ticket_type, status, price_paid, purchase_date, created_at, updated_at
		`, ticketUUID, userID, eventID, ticketNumber, ticketType, pricePaid).Scan(
			&t.ID, &t.UserID, &t.EventID, &t.TicketNumber, &t.TicketType, &t.Status, &t.PricePaid, &t.PurchaseDate, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		t.QRCodeValue = qrValue
		tickets = append(tickets, t)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, 0, err
	}
	return tickets, remaining, nil
}

func (r *EventRepository) ListTicketsByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Ticket, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT
			t.id, t.user_id, t.event_id, t.ticket_number, t.ticket_type, t.status, t.price_paid,
			t.purchase_date, t.created_at, t.updated_at,
			e.title, e.event_date::text, v.name
		FROM tickets t
		INNER JOIN events e ON e.id = t.event_id
		LEFT JOIN venues v ON v.id = e.venue_id
		WHERE t.user_id = $1
		ORDER BY t.purchase_date DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]models.Ticket, 0)
	for rows.Next() {
		var t models.Ticket
		if err := rows.Scan(
			&t.ID, &t.UserID, &t.EventID, &t.TicketNumber, &t.TicketType, &t.Status, &t.PricePaid,
			&t.PurchaseDate, &t.CreatedAt, &t.UpdatedAt,
			&t.EventTitle, &t.EventDate, &t.VenueName,
		); err != nil {
			return nil, err
		}
		t.QRCodeValue = fmt.Sprintf("eventleaf:ticket:%s", t.ID.String())
		out = append(out, t)
	}
	return out, rows.Err()
}

func emptyToNull(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
