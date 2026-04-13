package repository

import (
	"context"

	"github.com/Atul71/EventLeaf/api/internal/db"
	"github.com/google/uuid"
)

type FavoriteRepository struct {
	db *db.DB
}

func NewFavoriteRepository(db *db.DB) *FavoriteRepository {
	return &FavoriteRepository{db: db}
}

// Add inserts a favorite row; duplicate (user_id, event_id) is ignored.
func (r *FavoriteRepository) Add(ctx context.Context, userID, eventID uuid.UUID) error {
	_, err := r.db.Pool.Exec(ctx,
		`INSERT INTO user_favorites (user_id, event_id) VALUES ($1, $2)
		 ON CONFLICT (user_id, event_id) DO NOTHING`,
		userID, eventID,
	)
	return err
}

// Remove deletes a favorite row if present.
func (r *FavoriteRepository) Remove(ctx context.Context, userID, eventID uuid.UUID) error {
	_, err := r.db.Pool.Exec(ctx,
		`DELETE FROM user_favorites WHERE user_id = $1 AND event_id = $2`,
		userID, eventID,
	)
	return err
}

// ListEventIDs returns favorited event IDs for the user (newest first).
func (r *FavoriteRepository) ListEventIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	rows, err := r.db.Pool.Query(ctx,
		`SELECT event_id FROM user_favorites WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		out = append(out, id)
	}
	return out, rows.Err()
}
