package models

import (
	"time"

	"github.com/google/uuid"
)

// BuyTicketRequest is payment-free for now; one call buys one ticket.
type BuyTicketRequest struct {
	TicketType string `json:"ticket_type"`
	Quantity   int    `json:"quantity"`
}

type BuyTicketResponse struct {
	Tickets          []Ticket `json:"tickets"`
	RemainingTickets int      `json:"remaining_tickets"`
}

type Ticket struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	EventID      uuid.UUID `json:"event_id"`
	TicketNumber string    `json:"ticket_number"`
	TicketType   string    `json:"ticket_type"`
	Status       string    `json:"status"`
	PricePaid    float64   `json:"price_paid"`
	PurchaseDate time.Time `json:"purchase_date"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	// QRCodeValue is the content scanners read from the QR image.
	QRCodeValue string `json:"qr_code_value"`
	// Optional event metadata for profile/list responses.
	EventTitle *string `json:"event_title,omitempty"`
	EventDate  *string `json:"event_date,omitempty"`
	VenueName  *string `json:"venue_name,omitempty"`
}
