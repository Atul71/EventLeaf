package models

import (
	"time"

	"github.com/google/uuid"
)

type Venue struct {
	ID                      uuid.UUID `json:"id"`
	Name                    string    `json:"name"`
	Description             *string   `json:"description,omitempty"`
	Address                 string    `json:"address"`
	City                    string    `json:"city"`
	State                   *string   `json:"state,omitempty"`
	ZipCode                 *string   `json:"zip_code,omitempty"`
	Country                 string    `json:"country"`
	Latitude                *float64  `json:"latitude,omitempty"`
	Longitude               *float64  `json:"longitude,omitempty"`
	Capacity                int       `json:"capacity"`
	ContactEmail            *string   `json:"contact_email,omitempty"`
	ContactPhone            *string   `json:"contact_phone,omitempty"`
	WebsiteURL              *string   `json:"website_url,omitempty"`
	IsEcoCertified          bool      `json:"is_eco_certified"`
	EcoCertifications       []string  `json:"eco_certifications,omitempty"`
	HasPublicTransit        bool      `json:"has_public_transit"`
	HasParking              bool      `json:"has_parking"`
	HasAccessibleFacilities bool      `json:"has_accessible_facilities"`
	CreatedBy               uuid.UUID `json:"created_by"`
	CreatedAt               time.Time `json:"created_at"`
	UpdatedAt               time.Time `json:"updated_at"`
}

type CreateVenueRequest struct {
	Name                    string    `json:"name" binding:"required,max=255"`
	Description             string    `json:"description"`
	Address                 string    `json:"address" binding:"required,max=500"`
	City                    string    `json:"city" binding:"required,max=100"`
	State                   string    `json:"state" binding:"max=2"`
	ZipCode                 string    `json:"zip_code" binding:"max=10"`
	Country                 string    `json:"country" binding:"max=100"`
	Latitude                *float64  `json:"latitude"`
	Longitude               *float64  `json:"longitude"`
	Capacity                int       `json:"capacity" binding:"required,gt=0"`
	ContactEmail            string    `json:"contact_email" binding:"omitempty,email"`
	ContactPhone            string    `json:"contact_phone" binding:"max=20"`
	WebsiteURL              string    `json:"website_url" binding:"omitempty,url"`
	IsEcoCertified          bool      `json:"is_eco_certified"`
	EcoCertifications       []string  `json:"eco_certifications"`
	HasPublicTransit        bool      `json:"has_public_transit"`
	HasParking              bool      `json:"has_parking"`
	HasAccessibleFacilities bool      `json:"has_accessible_facilities"`
	CreatedBy               uuid.UUID `json:"created_by" binding:"required"`
}

type UpdateVenueRequest struct {
	Name                    *string   `json:"name" binding:"omitempty,max=255"`
	Description             *string   `json:"description"`
	Address                 *string   `json:"address" binding:"omitempty,max=500"`
	City                    *string   `json:"city" binding:"omitempty,max=100"`
	State                   *string   `json:"state" binding:"omitempty,max=2"`
	ZipCode                 *string   `json:"zip_code" binding:"omitempty,max=10"`
	Country                 *string   `json:"country" binding:"omitempty,max=100"`
	Latitude                *float64  `json:"latitude"`
	Longitude               *float64  `json:"longitude"`
	Capacity                *int      `json:"capacity" binding:"omitempty,gt=0"`
	ContactEmail            *string   `json:"contact_email" binding:"omitempty,email"`
	ContactPhone            *string   `json:"contact_phone" binding:"omitempty,max=20"`
	WebsiteURL              *string   `json:"website_url" binding:"omitempty,url"`
	IsEcoCertified          *bool     `json:"is_eco_certified"`
	EcoCertifications       []string  `json:"eco_certifications"`
	HasPublicTransit        *bool     `json:"has_public_transit"`
	HasParking              *bool     `json:"has_parking"`
	HasAccessibleFacilities *bool     `json:"has_accessible_facilities"`
}
