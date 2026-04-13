package models

import (
	"encoding/json"
	"testing"

	"github.com/google/uuid"
)

func TestGreenMetricsValidate(t *testing.T) {
	eventID := uuid.New()

	tests := []struct {
		name      string
		metrics   *GreenMetrics
		wantError bool
		errMsg    string
	}{
		{
			name: "valid metrics all scores in range",
			metrics: &GreenMetrics{
				EventID:                    eventID,
				CarbonFootprintReduction:   50.0,
				EnergyEfficiencyScore:      85.0,
				WasteReductionPotential:    70.0,
				TransportationImpactScore:  75.0,
				OverallSustainabilityScore: 76.67,
				IsEcoFriendly:              true,
				MetricsBreakdown: MetricsDetails{
					EventAttendeeCount: 500,
				},
			},
			wantError: false,
		},
		{
			name: "invalid energy efficiency score too high",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore: 150.0,
			},
			wantError: true,
			errMsg:    "EnergyEfficiencyScore",
		},
		{
			name: "invalid energy efficiency score negative",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore: -10.0,
			},
			wantError: true,
			errMsg:    "EnergyEfficiencyScore",
		},
		{
			name: "invalid waste reduction negative",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:   50.0,
				WasteReductionPotential: -5.0,
			},
			wantError: true,
			errMsg:    "WasteReductionPotential",
		},
		{
			name: "invalid transportation impact over 100",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:     50.0,
				WasteReductionPotential:   50.0,
				TransportationImpactScore: 101.0,
			},
			wantError: true,
			errMsg:    "TransportationImpactScore",
		},
		{
			name: "invalid overall sustainability score",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:      50.0,
				WasteReductionPotential:    50.0,
				TransportationImpactScore:  50.0,
				OverallSustainabilityScore: 150.0,
			},
			wantError: true,
			errMsg:    "OverallSustainabilityScore",
		},
		{
			name: "invalid negative carbon footprint",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:      50.0,
				WasteReductionPotential:    50.0,
				TransportationImpactScore:  50.0,
				OverallSustainabilityScore: 50.0,
				CarbonFootprintReduction:   -10.0,
			},
			wantError: true,
			errMsg:    "CarbonFootprintReduction",
		},
		{
			name: "invalid negative attendee count",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:      50.0,
				WasteReductionPotential:    50.0,
				TransportationImpactScore:  50.0,
				OverallSustainabilityScore: 50.0,
				CarbonFootprintReduction:   20.0,
				MetricsBreakdown: MetricsDetails{
					EventAttendeeCount: -100,
				},
			},
			wantError: true,
			errMsg:    "EventAttendeeCount",
		},
		{
			name: "boundary test zero scores",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:      0.0,
				WasteReductionPotential:    0.0,
				TransportationImpactScore:  0.0,
				OverallSustainabilityScore: 0.0,
				CarbonFootprintReduction:   0.0,
				MetricsBreakdown: MetricsDetails{
					EventAttendeeCount: 0,
				},
			},
			wantError: false,
		},
		{
			name: "boundary test max scores",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:      100.0,
				WasteReductionPotential:    100.0,
				TransportationImpactScore:  100.0,
				OverallSustainabilityScore: 100.0,
				CarbonFootprintReduction:   1000.0,
				MetricsBreakdown: MetricsDetails{
					EventAttendeeCount: 100000,
				},
			},
			wantError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.metrics.Validate()
			if (err != nil) != tt.wantError {
				t.Errorf("Validate() error = %v, wantError %v", err, tt.wantError)
			}
			if tt.wantError && err != nil && tt.errMsg != "" {
				if !contains(err.Error(), tt.errMsg) {
					t.Errorf("error message should contain %q, got %v", tt.errMsg, err)
				}
			}
		})
	}
}

func TestCalculateOverallScore(t *testing.T) {
	tests := []struct {
		name     string
		metrics  *GreenMetrics
		expected float64
		delta    float64 // tolerance for floating point comparison
	}{
		{
			name: "average of equal scores",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:     60.0,
				WasteReductionPotential:   60.0,
				TransportationImpactScore: 60.0,
			},
			expected: 60.0,
			delta:    0.01,
		},
		{
			name: "average of different scores",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:     90.0,
				WasteReductionPotential:   60.0,
				TransportationImpactScore: 30.0,
			},
			expected: 60.0,
			delta:    0.01,
		},
		{
			name: "average with decimal values",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:     85.5,
				WasteReductionPotential:   74.3,
				TransportationImpactScore: 92.1,
			},
			expected: 83.97,
			delta:    0.01,
		},
		{
			name: "zero scores",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:     0.0,
				WasteReductionPotential:   0.0,
				TransportationImpactScore: 0.0,
			},
			expected: 0.0,
			delta:    0.01,
		},
		{
			name: "max scores",
			metrics: &GreenMetrics{
				EnergyEfficiencyScore:     100.0,
				WasteReductionPotential:   100.0,
				TransportationImpactScore: 100.0,
			},
			expected: 100.0,
			delta:    0.01,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.metrics.CalculateOverallScore()
			if !almostEqual(result, tt.expected, tt.delta) {
				t.Errorf("CalculateOverallScore() = %f, want %f", result, tt.expected)
			}
		})
	}
}

func TestDetermineEcoFriendly(t *testing.T) {
	tests := []struct {
		name                string
		score               float64
		expectedEcoFriendly bool
	}{
		{
			name:                "score above threshold",
			score:               75.0,
			expectedEcoFriendly: true,
		},
		{
			name:                "score at threshold",
			score:               70.0,
			expectedEcoFriendly: true,
		},
		{
			name:                "score below threshold",
			score:               69.9,
			expectedEcoFriendly: false,
		},
		{
			name:                "zero score",
			score:               0.0,
			expectedEcoFriendly: false,
		},
		{
			name:                "max score",
			score:               100.0,
			expectedEcoFriendly: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			metrics := &GreenMetrics{
				OverallSustainabilityScore: tt.score,
			}
			metrics.DetermineEcoFriendly()
			if metrics.IsEcoFriendly != tt.expectedEcoFriendly {
				t.Errorf("DetermineEcoFriendly() set IsEcoFriendly = %v, want %v", metrics.IsEcoFriendly, tt.expectedEcoFriendly)
			}
		})
	}
}

func TestGreenMetricsJSONMarshalUnmarshal(t *testing.T) {
	eventID := uuid.New()

	original := &GreenMetrics{
		EventID:                    eventID,
		CarbonFootprintReduction:   50.5,
		EnergyEfficiencyScore:      85.0,
		WasteReductionPotential:    70.0,
		TransportationImpactScore:  75.0,
		OverallSustainabilityScore: 76.67,
		IsEcoFriendly:              true,
		MetricsBreakdown: MetricsDetails{
			DigitalTicketingSavings:    15.0,
			PaperlessCheckinSavings:    20.0,
			VenueEcoCertificationScore: 90.0,
			PublicTransitAccessScore:   80.0,
			EventAttendeeCount:         500,
			SelectedEcoAttributes:      []string{"renewable", "zero-waste"},
		},
		SustainabilityTips: []string{"Use public transit", "Go digital", "Reduce paper"},
	}

	// Marshal to JSON
	data, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("failed to marshal: %v", err)
	}

	// Unmarshal back
	var result GreenMetrics
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}

	// Verify key fields match
	if result.EventID != eventID {
		t.Errorf("EventID mismatch: got %v, want %v", result.EventID, eventID)
	}
	if result.CarbonFootprintReduction != original.CarbonFootprintReduction {
		t.Errorf("CarbonFootprintReduction mismatch: got %f, want %f", result.CarbonFootprintReduction, original.CarbonFootprintReduction)
	}
	if result.IsEcoFriendly != original.IsEcoFriendly {
		t.Errorf("IsEcoFriendly mismatch: got %v, want %v", result.IsEcoFriendly, original.IsEcoFriendly)
	}
	if len(result.SustainabilityTips) != len(original.SustainabilityTips) {
		t.Errorf("SustainabilityTips length mismatch: got %d, want %d", len(result.SustainabilityTips), len(original.SustainabilityTips))
	}
	if len(result.MetricsBreakdown.SelectedEcoAttributes) != len(original.MetricsBreakdown.SelectedEcoAttributes) {
		t.Errorf("SelectedEcoAttributes length mismatch: got %d, want %d", len(result.MetricsBreakdown.SelectedEcoAttributes), len(original.MetricsBreakdown.SelectedEcoAttributes))
	}
}

// Helper functions
func almostEqual(a, b, tolerance float64) bool {
	if a > b {
		return (a - b) <= tolerance
	}
	return (b - a) <= tolerance
}

func contains(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
