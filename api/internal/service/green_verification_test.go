package service

import (
	"testing"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
)

func TestCalculateGreenMetrics_HighSustainabilityScenario(t *testing.T) {
	summary := "Zero-waste operations and reusable materials."
	event := &models.Event{
		ID:                  uuid.New(),
		TotalCapacity:       500,
		HasDigitalTicketing: true,
		HasPaperlessCheckin: true,
		EcoSummary:          &summary,
	}
	venue := &models.Venue{
		IsEcoCertified:   true,
		HasPublicTransit: true,
		HasParking:       false,
	}
	attributes := []string{
		"Waste Reduction Program",
		"Tree Planting Offset",
		"Carbon Neutral Transport",
	}

	metrics := CalculateGreenMetrics(event, venue, attributes)

	if metrics.EnergyEfficiencyScore != 100 {
		t.Fatalf("EnergyEfficiencyScore = %v, want 100", metrics.EnergyEfficiencyScore)
	}
	if metrics.WasteReductionPotential != 93 {
		t.Fatalf("WasteReductionPotential = %v, want 93", metrics.WasteReductionPotential)
	}
	if metrics.TransportationImpactScore != 100 {
		t.Fatalf("TransportationImpactScore = %v, want 100", metrics.TransportationImpactScore)
	}
	if !almostEqual(metrics.OverallSustainabilityScore, 97.67, 0.01) {
		t.Fatalf("OverallSustainabilityScore = %v, want 97.67", metrics.OverallSustainabilityScore)
	}
	if !metrics.IsEcoFriendly {
		t.Fatalf("IsEcoFriendly = false, want true")
	}
	if !almostEqual(metrics.CarbonFootprintReduction, 170.92, 0.01) {
		t.Fatalf("CarbonFootprintReduction = %v, want 170.92", metrics.CarbonFootprintReduction)
	}
	if len(metrics.SustainabilityTips) != 0 {
		t.Fatalf("SustainabilityTips should be empty for high-score scenario, got %v", metrics.SustainabilityTips)
	}
}

func TestCalculateGreenMetrics_LowSustainabilityScenario(t *testing.T) {
	event := &models.Event{
		ID:            uuid.New(),
		TotalCapacity: 100,
	}
	venue := &models.Venue{
		IsEcoCertified:   false,
		HasPublicTransit: false,
		HasParking:       true,
	}

	metrics := CalculateGreenMetrics(event, venue, nil)

	if metrics.EnergyEfficiencyScore != 0 {
		t.Fatalf("EnergyEfficiencyScore = %v, want 0", metrics.EnergyEfficiencyScore)
	}
	if metrics.WasteReductionPotential != 0 {
		t.Fatalf("WasteReductionPotential = %v, want 0", metrics.WasteReductionPotential)
	}
	if metrics.TransportationImpactScore != 0 {
		t.Fatalf("TransportationImpactScore = %v, want 0", metrics.TransportationImpactScore)
	}
	if metrics.OverallSustainabilityScore != 0 {
		t.Fatalf("OverallSustainabilityScore = %v, want 0", metrics.OverallSustainabilityScore)
	}
	if metrics.IsEcoFriendly {
		t.Fatalf("IsEcoFriendly = true, want false")
	}
	if metrics.CarbonFootprintReduction != 0 {
		t.Fatalf("CarbonFootprintReduction = %v, want 0", metrics.CarbonFootprintReduction)
	}
	if len(metrics.SustainabilityTips) != 4 {
		t.Fatalf("SustainabilityTips count = %d, want 4", len(metrics.SustainabilityTips))
	}
}

func TestCalculateGreenMetrics_MidrangeScenario(t *testing.T) {
	event := &models.Event{
		ID:                  uuid.New(),
		TotalCapacity:       200,
		HasDigitalTicketing: true,
	}
	venue := &models.Venue{
		HasPublicTransit: true,
		HasParking:       true,
	}
	attributes := []string{"Carbon Neutral Transport"}

	metrics := CalculateGreenMetrics(event, venue, attributes)

	if metrics.EnergyEfficiencyScore != 35 {
		t.Fatalf("EnergyEfficiencyScore = %v, want 35", metrics.EnergyEfficiencyScore)
	}
	if metrics.WasteReductionPotential != 23 {
		t.Fatalf("WasteReductionPotential = %v, want 23", metrics.WasteReductionPotential)
	}
	if metrics.TransportationImpactScore != 90 {
		t.Fatalf("TransportationImpactScore = %v, want 90", metrics.TransportationImpactScore)
	}
	if !almostEqual(metrics.OverallSustainabilityScore, 49.33, 0.01) {
		t.Fatalf("OverallSustainabilityScore = %v, want 49.33", metrics.OverallSustainabilityScore)
	}
	if metrics.IsEcoFriendly {
		t.Fatalf("IsEcoFriendly = true, want false")
	}
	if !almostEqual(metrics.CarbonFootprintReduction, 34.53, 0.01) {
		t.Fatalf("CarbonFootprintReduction = %v, want 34.53", metrics.CarbonFootprintReduction)
	}
}

func TestCalculateGreenMetrics_PreservesEventIDAndBreakdown(t *testing.T) {
	eventID := uuid.New()
	event := &models.Event{
		ID:                  eventID,
		TotalCapacity:       50,
		HasDigitalTicketing: true,
		HasPaperlessCheckin: true,
	}
	venue := &models.Venue{
		IsEcoCertified:   true,
		HasPublicTransit: true,
	}
	attributes := []string{"Digital Check-in", "Paperless Ticketing"}

	metrics := CalculateGreenMetrics(event, venue, attributes)

	if metrics.EventID != eventID {
		t.Fatalf("EventID = %v, want %v", metrics.EventID, eventID)
	}
	if metrics.MetricsBreakdown.EventAttendeeCount != 50 {
		t.Fatalf("EventAttendeeCount = %d, want 50", metrics.MetricsBreakdown.EventAttendeeCount)
	}
	if len(metrics.MetricsBreakdown.SelectedEcoAttributes) != 2 {
		t.Fatalf("SelectedEcoAttributes length = %d, want 2", len(metrics.MetricsBreakdown.SelectedEcoAttributes))
	}
	if metrics.MetricsBreakdown.DigitalTicketingSavings != 35 {
		t.Fatalf("DigitalTicketingSavings = %v, want 35", metrics.MetricsBreakdown.DigitalTicketingSavings)
	}
	if metrics.MetricsBreakdown.PaperlessCheckinSavings != 25 {
		t.Fatalf("PaperlessCheckinSavings = %v, want 25", metrics.MetricsBreakdown.PaperlessCheckinSavings)
	}
	if metrics.MetricsBreakdown.VenueEcoCertificationScore != 40 {
		t.Fatalf("VenueEcoCertificationScore = %v, want 40", metrics.MetricsBreakdown.VenueEcoCertificationScore)
	}
	if metrics.MetricsBreakdown.PublicTransitAccessScore != 55 {
		t.Fatalf("PublicTransitAccessScore = %v, want 55", metrics.MetricsBreakdown.PublicTransitAccessScore)
	}
}

func almostEqual(a, b, tolerance float64) bool {
	if a > b {
		return (a - b) <= tolerance
	}
	return (b - a) <= tolerance
}
