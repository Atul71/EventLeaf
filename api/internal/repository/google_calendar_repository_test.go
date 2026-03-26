package repository

import "testing"

func TestNullIfEmpty(t *testing.T) {
	if nullIfEmpty("") != nil {
		t.Fatalf("empty string should map to nil interface")
	}
	if v, ok := nullIfEmpty("https://example.com").(string); !ok || v != "https://example.com" {
		t.Fatalf("got %v", v)
	}
}
