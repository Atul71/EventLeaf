package repository

import (
	"context"

	"github.com/Atul71/EventLeaf/api/internal/db"
	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
)

type EcoAttributeRepository struct {
	db *db.DB
}

func NewEcoAttributeRepository(db *db.DB) *EcoAttributeRepository {
	return &EcoAttributeRepository{db: db}
}

func (r *EcoAttributeRepository) GetNamesByIDs(ctx context.Context, ids []uuid.UUID) ([]string, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	rows, err := r.db.Pool.Query(ctx,
		`SELECT name FROM eco_attributes WHERE id = ANY($1)`,
		ids,
	)
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

func (r *EcoAttributeRepository) ListAll(ctx context.Context) ([]models.EcoAttribute, error) {
	rows, err := r.db.Pool.Query(ctx,
		`SELECT id, name, category FROM eco_attributes ORDER BY category, name`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attrs []models.EcoAttribute
	for rows.Next() {
		var a models.EcoAttribute
		if err := rows.Scan(&a.ID, &a.Name, &a.Category); err != nil {
			return nil, err
		}
		attrs = append(attrs, a)
	}
	return attrs, rows.Err()
}
