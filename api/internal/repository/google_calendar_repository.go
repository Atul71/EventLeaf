package repository

import (
	"context"

	"github.com/Atul71/EventLeaf/api/internal/db"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type GoogleCalendarRepository struct {
	db *db.DB
}

func NewGoogleCalendarRepository(db *db.DB) *GoogleCalendarRepository {
	return &GoogleCalendarRepository{db: db}
}

func (r *GoogleCalendarRepository) GetMappingByEventID(ctx context.Context, eventID uuid.UUID) (string, bool, error) {
	var googleEventID string
	err := r.db.Pool.QueryRow(ctx,
		`SELECT google_event_id FROM google_calendar_event_mappings WHERE event_id = $1`,
		eventID,
	).Scan(&googleEventID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", false, nil
		}
		return "", false, err
	}
	return googleEventID, true, nil
}

func (r *GoogleCalendarRepository) UpsertMapping(
	ctx context.Context,
	eventID uuid.UUID,
	googleEventID string,
	calendarID string,
	htmlLink string,
) error {
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO google_calendar_event_mappings (event_id, google_event_id, calendar_id, html_link, last_synced_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (event_id) DO UPDATE
		SET google_event_id = EXCLUDED.google_event_id,
		    calendar_id = EXCLUDED.calendar_id,
		    html_link = EXCLUDED.html_link,
		    last_synced_at = NOW()
	`, eventID, googleEventID, calendarID, nullIfEmpty(htmlLink))
	return err
}

func nullIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
