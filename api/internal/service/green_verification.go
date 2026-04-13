package service

import (
	"fmt"
	"strings"

	"github.com/Atul71/EventLeaf/api/internal/models"
)

// Green sustainability attribute names (from eco_attributes table)
var greenEcoAttributeNames = map[string]bool{
	"Paperless Ticketing":      true,
	"Digital Check-in":         true,
	"Waste Reduction Program":  true,
	"Carbon Neutral Transport": true,
	"Tree Planting Offset":     true,
}

const MinGreenSustainabilityFlags = 2

type GreenVerificationResult struct {
	IsGreen        bool
	CriteriaMet    []string
	CriteriaNotMet []string
}

// VerifyGreenCriteria determines if an event meets "Green" criteria:
//  1. Venue: If selected, must be eco-certified (is_eco_certified = true)
//  2. Sustainability: At least 2 flags from Paperless Ticketing, Digital Check-in,
//     Waste Reduction Program, Carbon Neutral Transport, Tree Planting Offset
func VerifyGreenCriteria(
	venueIsEcoCertified bool,
	venueIDProvided bool,
	selectedEcoAttributeNames []string,
) GreenVerificationResult {
	result := GreenVerificationResult{
		CriteriaMet:    []string{},
		CriteriaNotMet: []string{},
	}

	if venueIDProvided {
		if venueIsEcoCertified {
			result.CriteriaMet = append(result.CriteriaMet, "Eco-certified venue selected")
		} else {
			result.CriteriaNotMet = append(result.CriteriaNotMet, "Selected venue is not eco-certified")
			result.IsGreen = false
			return result
		}
	} else {
		result.CriteriaMet = append(result.CriteriaMet, "No venue selected (venue criterion N/A)")
	}

	greenCount := 0
	for _, name := range selectedEcoAttributeNames {
		if greenEcoAttributeNames[name] {
			greenCount++
			result.CriteriaMet = append(result.CriteriaMet, "Sustainability: "+name)
		}
	}

	if greenCount >= MinGreenSustainabilityFlags {
		result.CriteriaMet = append(result.CriteriaMet,
			fmt.Sprintf("At least %d sustainability flags selected (%d)", MinGreenSustainabilityFlags, greenCount))
	} else {
		result.CriteriaNotMet = append(result.CriteriaNotMet,
			fmt.Sprintf("Need at least 2 sustainability flags from: Paperless Ticketing, Digital Check-in, Waste Reduction, Carbon Offsets (only %d selected)", greenCount))
	}

	result.IsGreen = len(result.CriteriaNotMet) == 0 && greenCount >= MinGreenSustainabilityFlags
	return result
}

// CalculateGreenMetrics computes a weighted sustainability score (0-100).
// The overall score is an average of energy, waste, and transportation components.
func CalculateGreenMetrics(
	event *models.Event,
	venue *models.Venue,
	selectedEcoAttributeNames []string,
) *models.GreenMetrics {
	metrics := &models.GreenMetrics{
		EventID: event.ID,
		MetricsBreakdown: models.MetricsDetails{
			EventAttendeeCount:    event.TotalCapacity,
			SelectedEcoAttributes: selectedEcoAttributeNames,
		},
	}

	metrics.EnergyEfficiencyScore = calculateEnergyEfficiencyScore(event, venue, &metrics.MetricsBreakdown)
	metrics.WasteReductionPotential = calculateWasteReductionScore(event, selectedEcoAttributeNames)
	metrics.TransportationImpactScore = calculateTransportationScore(venue, selectedEcoAttributeNames, &metrics.MetricsBreakdown)
	metrics.OverallSustainabilityScore = metrics.CalculateOverallScore()
	metrics.CarbonFootprintReduction = calculateCarbonReductionEstimate(metrics.OverallSustainabilityScore, event.TotalCapacity)
	metrics.DetermineEcoFriendly()
	metrics.SustainabilityTips = generateSustainabilityTips(metrics, venue)

	return metrics
}

func calculateEnergyEfficiencyScore(event *models.Event, venue *models.Venue, breakdown *models.MetricsDetails) float64 {
	score := 0.0

	if event.HasDigitalTicketing {
		score += 35
		breakdown.DigitalTicketingSavings = 35
	}
	if event.HasPaperlessCheckin {
		score += 25
		breakdown.PaperlessCheckinSavings = 25
	}
	if venue != nil && venue.IsEcoCertified {
		score += 40
		breakdown.VenueEcoCertificationScore = 40
	}

	return clampScore(score)
}

func calculateWasteReductionScore(event *models.Event, selectedEcoAttributeNames []string) float64 {
	score := 0.0

	if event.HasDigitalTicketing {
		score += 20
	}
	if event.HasPaperlessCheckin {
		score += 20
	}
	if event.EcoSummary != nil && strings.TrimSpace(*event.EcoSummary) != "" {
		score += 10
	}
	for _, name := range selectedEcoAttributeNames {
		switch name {
		case "Waste Reduction Program":
			score += 25
		case "Tree Planting Offset":
			score += 15
		case "Paperless Ticketing", "Digital Check-in":
			score += 5
		default:
			score += 3
		}
	}

	return clampScore(score)
}

func calculateTransportationScore(venue *models.Venue, selectedEcoAttributeNames []string, breakdown *models.MetricsDetails) float64 {
	score := 0.0

	if venue != nil && venue.HasPublicTransit {
		score += 55
		breakdown.PublicTransitAccessScore = 55
	}
	if venue != nil && !venue.HasParking {
		score += 10
	}
	for _, name := range selectedEcoAttributeNames {
		if name == "Carbon Neutral Transport" {
			score += 35
		}
	}

	return clampScore(score)
}

func calculateCarbonReductionEstimate(overallScore float64, attendeeCount int) float64 {
	if attendeeCount < 0 {
		attendeeCount = 0
	}
	reduction := (overallScore / 100.0) * float64(attendeeCount) * 0.35
	return round2(reduction)
}

func generateSustainabilityTips(metrics *models.GreenMetrics, venue *models.Venue) []string {
	tips := []string{}

	if metrics.EnergyEfficiencyScore < 70 {
		tips = append(tips, "Adopt fully digital ticketing and check-in workflows.")
	}
	if metrics.WasteReductionPotential < 70 {
		tips = append(tips, "Add waste reduction practices such as composting or reusable serving options.")
	}
	if metrics.TransportationImpactScore < 70 {
		tips = append(tips, "Encourage public transit, ridesharing, or low-emission transport plans.")
	}
	if venue != nil && !venue.IsEcoCertified {
		tips = append(tips, "Consider partnering with an eco-certified venue.")
	}

	return tips
}

func clampScore(v float64) float64 {
	if v < 0 {
		return 0
	}
	if v > 100 {
		return 100
	}
	return round2(v)
}

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}
