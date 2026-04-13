package models

import (
	"fmt"
	"math"

	"github.com/google/uuid"
)

const EcoFriendlyThreshold = 70.0

type MetricsDetails struct {
	DigitalTicketingSavings    float64  `json:"digital_ticketing_savings"`
	PaperlessCheckinSavings    float64  `json:"paperless_checkin_savings"`
	VenueEcoCertificationScore float64  `json:"venue_eco_certification_score"`
	PublicTransitAccessScore   float64  `json:"public_transit_access_score"`
	EventAttendeeCount         int      `json:"event_attendee_count"`
	SelectedEcoAttributes      []string `json:"selected_eco_attributes"`
}

type GreenMetrics struct {
	EventID                    uuid.UUID      `json:"event_id"`
	CarbonFootprintReduction   float64        `json:"carbon_footprint_reduction"`
	EnergyEfficiencyScore      float64        `json:"energy_efficiency_score"`
	WasteReductionPotential    float64        `json:"waste_reduction_potential"`
	TransportationImpactScore  float64        `json:"transportation_impact_score"`
	OverallSustainabilityScore float64        `json:"overall_sustainability_score"`
	IsEcoFriendly              bool           `json:"is_eco_friendly"`
	MetricsBreakdown           MetricsDetails `json:"metrics_breakdown"`
	SustainabilityTips         []string       `json:"sustainability_tips"`
}

func (m *GreenMetrics) Validate() error {
	if err := validateRange("EnergyEfficiencyScore", m.EnergyEfficiencyScore, 0, 100); err != nil {
		return err
	}
	if err := validateRange("WasteReductionPotential", m.WasteReductionPotential, 0, 100); err != nil {
		return err
	}
	if err := validateRange("TransportationImpactScore", m.TransportationImpactScore, 0, 100); err != nil {
		return err
	}
	if err := validateRange("OverallSustainabilityScore", m.OverallSustainabilityScore, 0, 100); err != nil {
		return err
	}
	if m.CarbonFootprintReduction < 0 {
		return fmt.Errorf("CarbonFootprintReduction must be >= 0")
	}
	if m.MetricsBreakdown.EventAttendeeCount < 0 {
		return fmt.Errorf("EventAttendeeCount must be >= 0")
	}
	return nil
}

func (m *GreenMetrics) CalculateOverallScore() float64 {
	score := (m.EnergyEfficiencyScore + m.WasteReductionPotential + m.TransportationImpactScore) / 3
	return math.Round(score*100) / 100
}

func (m *GreenMetrics) DetermineEcoFriendly() {
	m.IsEcoFriendly = m.OverallSustainabilityScore >= EcoFriendlyThreshold
}

func validateRange(field string, value float64, min float64, max float64) error {
	if value < min || value > max {
		return fmt.Errorf("%s must be between %.0f and %.0f", field, min, max)
	}
	return nil
}
