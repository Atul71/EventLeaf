package service

import (
	"math"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/google/uuid"
)

// Carbon footprint calculation constants (kg CO2)
const (
	// Base carbon footprint per attendee (average event impact)
	BaseCarboFootprintPerAttendee = 2.5

	// Digital ticketing savings (vs paper)
	DigitalTicketingSavingsPerAttendee = 0.15

	// Paperless check-in savings (vs paper wristbands/tags)
	PaperlessCheckinSavingsPerAttendee = 0.08

	// Waste reduction program savings
	WasteReductionSavingsPerAttendee = 0.3
)

// CalculateGreenMetrics computes sustainability metrics for an event
func CalculateGreenMetrics(
	eventID uuid.UUID,
	event *models.Event,
	venue *models.Venue,
	ecoAttributeNames []string,
) *models.GreenMetrics {
	metrics := &models.GreenMetrics{
		EventID:            eventID,
		IsEcoFriendly:      event.IsEcoFriendly,
		MetricsBreakdown:   models.MetricsDetails{},
		SustainabilityTips: []string{},
	}

	// Get event attendee count (total capacity is used as proxy for expected attendance)
	attendeeCount := event.TotalCapacity

	// Calculate digital ticketing savings
	digitalTicketingSavings := 0.0
	if event.HasDigitalTicketing {
		digitalTicketingSavings = DigitalTicketingSavingsPerAttendee * float64(attendeeCount)
	} else {
		metrics.SustainabilityTips = append(metrics.SustainabilityTips,
			"Enable digital ticketing to reduce paper waste by ~15% per attendee",
		)
	}

	// Calculate paperless check-in savings
	paperlessCheckinSavings := 0.0
	if event.HasPaperlessCheckin {
		paperlessCheckinSavings = PaperlessCheckinSavingsPerAttendee * float64(attendeeCount)
	} else {
		metrics.SustainabilityTips = append(metrics.SustainabilityTips,
			"Implement paperless check-in to reduce physical materials by ~8% per attendee",
		)
	}

	// Initialize venue eco scores
	venuEcoCertificationScore := 0.0
	publicTransitAccessScore := 0.0
	if venue != nil {
		if venue.IsEcoCertified {
			venuEcoCertificationScore = 100.0
		} else {
			venuEcoCertificationScore = 30.0
			metrics.SustainabilityTips = append(metrics.SustainabilityTips,
				"Partner with an eco-certified venue to reduce overall environmental impact",
			)
		}

		if venue.HasPublicTransit {
			publicTransitAccessScore = 100.0
		} else {
			publicTransitAccessScore = 40.0
			metrics.SustainabilityTips = append(metrics.SustainabilityTips,
				"Choose a venue with public transit access to encourage sustainable transportation",
			)
		}
	} else {
		venuEcoCertificationScore = 20.0
		publicTransitAccessScore = 20.0
		metrics.SustainabilityTips = append(metrics.SustainabilityTips,
			"Select an eco-certified venue to significantly improve your event's sustainability profile",
		)
	}

	// Calculate eco attribute contributions
	wasteReductionBonus := 0.0
	carbonNeutralBonus := 0.0
	treePlantingBonus := 0.0
	selectedAttributes := []string{}

	for _, attrName := range ecoAttributeNames {
		selectedAttributes = append(selectedAttributes, attrName)
		switch attrName {
		case "Waste Reduction Program":
			wasteReductionBonus = WasteReductionSavingsPerAttendee * float64(attendeeCount)
		case "Carbon Neutral Transport":
			carbonNeutralBonus = 0.5 * float64(attendeeCount) // 0.5 kg CO2 offset per attendee
		case "Tree Planting Offset":
			treePlantingBonus = 0.3 * float64(attendeeCount) // 0.3 kg CO2 per tree planted per attendee
		}
	}

	// Calculate total carbon footprint reduction
	totalCarbonReduction := digitalTicketingSavings + paperlessCheckinSavings +
		wasteReductionBonus + carbonNeutralBonus + treePlantingBonus

	// Energy efficiency score (0-100)
	// Based on eco attributes and venue selection
	energyScore := 30.0 // base score
	if event.HasDigitalTicketing {
		energyScore += 15
	}
	if event.HasPaperlessCheckin {
		energyScore += 15
	}
	if venue != nil && venue.IsEcoCertified {
		energyScore += 20
	}
	if venue != nil && venue.HasPublicTransit {
		energyScore += 15
	}
	if len(selectedAttributes) >= 2 {
		energyScore += 10
	}
	energyScore = math.Min(energyScore, 100.0)

	// Waste reduction potential (percentage)
	wastePotential := 20.0 // base potential
	if event.HasPaperlessCheckin {
		wastePotential += 15
	}
	if event.HasDigitalTicketing {
		wastePotential += 15
	}
	for _, attr := range selectedAttributes {
		if attr == "Waste Reduction Program" {
			wastePotential += 30
			break
		}
	}
	wastePotential = math.Min(wastePotential, 100.0)

	// Transportation impact score
	transportScore := 20.0 // base score
	if venue != nil {
		transportScore += publicTransitAccessScore * 0.3 // 30% weight to transit access
	}
	for _, attr := range selectedAttributes {
		if attr == "Carbon Neutral Transport" {
			transportScore += 40
			break
		}
	}
	transportScore = math.Min(transportScore, 100.0)

	// Overall sustainability score (weighted average)
	overallScore := (energyScore*0.3 + wastePotential*0.25 + transportScore*0.25 + venuEcoCertificationScore*0.2)

	// Boost score if event is eco-friendly
	if event.IsEcoFriendly {
		overallScore = math.Min(overallScore*1.1, 100.0)
	}

	// Add recommendations for top eco attributes
	if len(selectedAttributes) == 0 {
		metrics.SustainabilityTips = append(metrics.SustainabilityTips,
			"Select at least 2 sustainability practices to reach Green status",
		)
	}

	// Populate metrics
	metrics.CarbonFootprintReduction = totalCarbonReduction
	metrics.EnergyEfficiencyScore = math.Round(energyScore*100) / 100
	metrics.WasteReductionPotential = math.Round(wastePotential*100) / 100
	metrics.TransportationImpactScore = math.Round(transportScore*100) / 100
	metrics.OverallSustainabilityScore = math.Round(overallScore*100) / 100

	// Populate metrics breakdown
	metrics.MetricsBreakdown.DigitalTicketingSavings = digitalTicketingSavings
	metrics.MetricsBreakdown.PaperlessCheckinSavings = paperlessCheckinSavings
	metrics.MetricsBreakdown.VenueEcoCertificationScore = venuEcoCertificationScore
	metrics.MetricsBreakdown.PublicTransitAccessScore = publicTransitAccessScore
	metrics.MetricsBreakdown.EventAttendeeCount = attendeeCount
	metrics.MetricsBreakdown.SelectedEcoAttributes = selectedAttributes

	return metrics
}
