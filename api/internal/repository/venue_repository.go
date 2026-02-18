package repository

import (
	"context"
	"fmt"
	"strings"

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

const venueFields = `id, name, description, address, city, state, zip_code, country,
	latitude, longitude, capacity, contact_email, contact_phone, website_url,
	is_eco_certified, eco_certifications, has_public_transit, has_parking,
	has_accessible_facilities, created_by, created_at, updated_at`

func (r *VenueRepository) scanVenue(row interface {
	Scan(dest ...interface{}) error
}) (*models.Venue, error) {
	var venue models.Venue
	err := row.Scan(
		&venue.ID, &venue.Name, &venue.Description, &venue.Address, &venue.City,
		&venue.State, &venue.ZipCode, &venue.Country, &venue.Latitude, &venue.Longitude,
		&venue.Capacity, &venue.ContactEmail, &venue.ContactPhone, &venue.WebsiteURL,
		&venue.IsEcoCertified, &venue.EcoCertifications, &venue.HasPublicTransit,
		&venue.HasParking, &venue.HasAccessibleFacilities, &venue.CreatedBy,
		&venue.CreatedAt, &venue.UpdatedAt,
	)
	return &venue, err
}

func (r *VenueRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Venue, error) {
	return r.scanVenue(r.db.Pool.QueryRow(ctx, `SELECT `+venueFields+` FROM venues WHERE id = $1`, id))
}

func (r *VenueRepository) Create(ctx context.Context, req *models.CreateVenueRequest) (*models.Venue, error) {
	country := req.Country
	if country == "" {
		country = "USA"
	}

	return r.scanVenue(r.db.Pool.QueryRow(ctx,
		`INSERT INTO venues (name, description, address, city, state, zip_code, country,
			latitude, longitude, capacity, contact_email, contact_phone, website_url,
			is_eco_certified, eco_certifications, has_public_transit, has_parking,
			has_accessible_facilities, created_by)
		VALUES ($1, NULLIF($2,''), $3, $4, NULLIF($5,''), NULLIF($6,''), $7, $8, $9, $10,
			NULLIF($11,''), NULLIF($12,''), NULLIF($13,''), $14, $15, $16, $17, $18, $19)
		RETURNING `+venueFields,
		req.Name, req.Description, req.Address, req.City, req.State, req.ZipCode, country,
		req.Latitude, req.Longitude, req.Capacity, req.ContactEmail, req.ContactPhone,
		req.WebsiteURL, req.IsEcoCertified, req.EcoCertifications,
		req.HasPublicTransit, req.HasParking, req.HasAccessibleFacilities, req.CreatedBy,
	))
}

func (r *VenueRepository) List(ctx context.Context, limit, offset int) ([]models.Venue, error) {
	rows, err := r.db.Pool.Query(ctx,
		`SELECT `+venueFields+` FROM venues ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
		limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var venues []models.Venue
	for rows.Next() {
		venue, err := r.scanVenue(rows)
		if err != nil {
			return nil, err
		}
		venues = append(venues, *venue)
	}
	return venues, rows.Err()
}

func (r *VenueRepository) Update(ctx context.Context, id uuid.UUID, req *models.UpdateVenueRequest) (*models.Venue, error) {
	sets, args := []string{"updated_at = CURRENT_TIMESTAMP"}, []interface{}{}
	argIndex := 1

	updateField := func(field string, value interface{}, nullable bool) {
		if value == nil {
			if nullable {
				sets = append(sets, field+" = NULL")
			}
			return
		}
		if nullable {
			if s, ok := value.(string); ok && s == "" {
				sets = append(sets, field+" = NULL")
				return
			}
		}
		sets = append(sets, fmt.Sprintf("%s = $%d", field, argIndex))
		args = append(args, value)
		argIndex++
	}

	updateField("name", req.Name, false)
	updateField("description", req.Description, true)
	updateField("address", req.Address, false)
	updateField("city", req.City, false)
	updateField("state", req.State, true)
	updateField("zip_code", req.ZipCode, true)
	updateField("country", req.Country, false)
	updateField("latitude", req.Latitude, true)
	updateField("longitude", req.Longitude, true)
	updateField("capacity", req.Capacity, false)
	updateField("contact_email", req.ContactEmail, true)
	updateField("contact_phone", req.ContactPhone, true)
	updateField("website_url", req.WebsiteURL, true)
	updateField("is_eco_certified", req.IsEcoCertified, false)
	if req.EcoCertifications != nil {
		sets = append(sets, fmt.Sprintf("eco_certifications = $%d", argIndex))
		args = append(args, req.EcoCertifications)
		argIndex++
	}
	updateField("has_public_transit", req.HasPublicTransit, false)
	updateField("has_parking", req.HasParking, false)
	updateField("has_accessible_facilities", req.HasAccessibleFacilities, false)

	if len(sets) == 1 {
		return r.GetByID(ctx, id)
	}

	args = append(args, id)
	query := fmt.Sprintf(`UPDATE venues SET %s WHERE id = $%d RETURNING `+venueFields,
		strings.Join(sets, ", "), argIndex)

	return r.scanVenue(r.db.Pool.QueryRow(ctx, query, args...))
}

func (r *VenueRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result, err := r.db.Pool.Exec(ctx, `DELETE FROM venues WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("venue not found")
	}
	return nil
}
