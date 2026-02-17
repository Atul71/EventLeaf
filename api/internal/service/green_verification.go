package service

import "fmt"

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
// 1. Venue: If selected, must be eco-certified (is_eco_certified = true)
// 2. Sustainability: At least 2 flags from Paperless Ticketing, Digital Check-in,
//    Waste Reduction Program, Carbon Neutral Transport, Tree Planting Offset
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
