package handler

import (
	"context"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
)

// FavoriteStore is persistence for user ↔ event bookmarks (saved events).
type FavoriteStore interface {
	Add(ctx context.Context, userID, eventID uuid.UUID) error
	Remove(ctx context.Context, userID, eventID uuid.UUID) error
	ListEventIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
}

// EventRepository is the subset of event persistence used by HTTP handlers.
type EventRepository interface {
	Create(ctx context.Context, req *models.CreateEventRequest, isEcoFriendly bool) (*models.Event, error)
	// ListPublished returns public + published events for the Discover UI.
	ListPublished(ctx context.Context, limit, offset int) ([]models.Event, error)
	// ListByOrganizer returns all events for an organizer (any status), newest first.
	ListByOrganizer(ctx context.Context, organizerID uuid.UUID, limit, offset int) ([]models.Event, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Event, error)
	// PublishForOrganizer sets status to published when the event belongs to the organizer.
	PublishForOrganizer(ctx context.Context, eventID, organizerID uuid.UUID) (*models.Event, error)
	// ListSavedByUser returns published public events bookmarked by the user.
	ListSavedByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Event, error)
	GetEcoAttributeNamesByEventID(ctx context.Context, eventID uuid.UUID) ([]string, error)
	BuyTicket(ctx context.Context, eventID, userID uuid.UUID, ticketType string, quantity int) ([]models.Ticket, int, error)
	ListTicketsByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.Ticket, error)
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
