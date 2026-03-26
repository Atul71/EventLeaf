package handler

import (
	"context"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
)

// EventRepository is the subset of event persistence used by HTTP handlers.
type EventRepository interface {
	Create(ctx context.Context, req *models.CreateEventRequest, isEcoFriendly bool) (*models.Event, error)
	// ListPublished returns public + published events for the Discover UI.
	ListPublished(ctx context.Context, limit, offset int) ([]models.Event, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Event, error)
}

// VenueRepository is the subset of venue persistence used by HTTP handlers.
type VenueRepository interface {
	Create(ctx context.Context, req *models.CreateVenueRequest) (*models.Venue, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Venue, error)
	List(ctx context.Context, limit, offset int) ([]models.Venue, error)
	Update(ctx context.Context, id uuid.UUID, req *models.UpdateVenueRequest) (*models.Venue, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

// EcoAttributeRepository is the subset of eco-attribute reads used by HTTP handlers.
type EcoAttributeRepository interface {
	GetNamesByIDs(ctx context.Context, ids []uuid.UUID) ([]string, error)
	ListAll(ctx context.Context) ([]models.EcoAttribute, error)
}

// CalendarPublisher syncs published events to an external calendar (e.g. Google).
type CalendarPublisher interface {
	SyncPublishedEvent(ctx context.Context, event *models.Event, venue *models.Venue) error
}
