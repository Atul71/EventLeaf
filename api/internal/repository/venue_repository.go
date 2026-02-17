package repository

import (
	"context"

	"github.com/Atul71/EventLeaf/api/internal/db"
	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
)

type VenueRepository struct {
	db *db.DB
}

func NewVenueRepository(db *db.DB) *VenueRepository {
	return &VenueRepository{db: db}
}

func (r *VenueRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Venue, error) {
	var venue models.Venue
	err := r.db.Pool.QueryRow(ctx,
		`SELECT id, is_eco_certified FROM venues WHERE id = $1`,
		id,
	).Scan(&venue.ID, &venue.IsEcoCertified)
	if err != nil {
		return nil, err
	}
	return &venue, nil
}
