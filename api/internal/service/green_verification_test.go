package service

import "testing"

func TestVerifyGreenCriteria(t *testing.T) {
	t.Run("no venue two green flags is green", func(t *testing.T) {
		r := VerifyGreenCriteria(true, false, []string{"Paperless Ticketing", "Digital Check-in"})
		if !r.IsGreen {
			t.Fatalf("IsGreen = false, want true: %+v", r)
		}
		if len(r.CriteriaNotMet) != 0 {
			t.Fatalf("CriteriaNotMet: %v", r.CriteriaNotMet)
		}
	})

	t.Run("eco venue not certified is not green", func(t *testing.T) {
		r := VerifyGreenCriteria(false, true, []string{"Paperless Ticketing", "Digital Check-in"})
		if r.IsGreen {
			t.Fatalf("IsGreen = true, want false")
		}
	})

	t.Run("eco venue certified but only one flag is not green", func(t *testing.T) {
		r := VerifyGreenCriteria(true, true, []string{"Paperless Ticketing"})
		if r.IsGreen {
			t.Fatalf("IsGreen = true, want false")
		}
	})

	t.Run("eco venue certified and two flags is green", func(t *testing.T) {
		r := VerifyGreenCriteria(true, true, []string{"Paperless Ticketing", "Waste Reduction Program"})
		if !r.IsGreen {
			t.Fatalf("IsGreen = false, want true: %+v", r)
		}
	})

	t.Run("non green attribute names do not count", func(t *testing.T) {
		r := VerifyGreenCriteria(true, false, []string{"Local Vendors", "Local Vendors"})
		if r.IsGreen {
			t.Fatalf("IsGreen = true, want false")
		}
	})
}
