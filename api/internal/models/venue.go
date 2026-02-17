package models

import "github.com/google/uuid"

type Venue struct {
	ID             uuid.UUID `json:"id"`
	IsEcoCertified bool      `json:"is_eco_certified"`
}
