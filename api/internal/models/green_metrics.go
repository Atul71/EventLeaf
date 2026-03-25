package models

import "github.com/google/uuid"

// GreenMetrics represents the calculated sustainability metrics for an event
type GreenMetrics struct {
	EventID                    uuid.UUID   `json:"event_id"`
	CarbonFootprintReduction   float64     `json:"carbon_footprint_reduction"` // kg CO2 saved
	EnergyEfficiencyScore      float64     `json:"energy_efficiency_score"`    // 0-100
	WasteReductionPotential    float64     `json:"waste_reduction_potential"`  // percentage
	TransportationImpactScore  float64     `json:"transportation_impact_score"`// 0-100
	OverallSustainabilityScore float64     `json:"overall_sustainability_score"` // 0-100
	IsEcoFriendly              bool        `json:"is_eco_friendly"`
	MetricsBreakdown           MetricsDetails `json:"metrics_breakdown"`
	SustainabilityTips         []string    `json:"sustainability_tips"`
}

type MetricsDetails struct {
	DigitalTicketingSavings   float64  `json:"digital_ticketing_savings"` // kg CO2
	PaperlessCheckinSavings   float64  `json:"paperless_checkin_savings"` // kg CO2
	VenueEcoCertificationScore float64  `json:"venue_eco_certification_score"` // 0-100
	PublicTransitAccessScore  float64  `json:"public_transit_access_score"` // 0-100
	EventAttendeeCount        int      `json:"event_attendee_count"`
	SelectedEcoAttributes     []string `json:"selected_eco_attributes"`
}

// GreenMetricsResponse wraps the event details with metrics
type GreenMetricsResponse struct {
	Event       Event        `json:"event"`
	GreenMetrics GreenMetrics `json:"green_metrics"`
}
