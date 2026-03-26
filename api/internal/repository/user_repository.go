package repository

import (
	"context"

	"github.com/Atul71/EventLeaf/api/internal/db"
	"github.com/google/uuid"
)

type UserRepository struct {
	db *db.DB
}

func NewUserRepository(db *db.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FirstOrganizerID returns the oldest organizer user (for local dev when auth is not wired).
func (r *UserRepository) FirstOrganizerID(ctx context.Context) (uuid.UUID, error) {
	var id uuid.UUID
	err := r.db.Pool.QueryRow(ctx,
		`SELECT id FROM users WHERE is_organizer = true ORDER BY created_at ASC LIMIT 1`,
	).Scan(&id)
	return id, err
}
