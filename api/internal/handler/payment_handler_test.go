package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestProcessPayment_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewPaymentHandler()

	body := `{
		"card_number":"4242 4242 4242 4242",
		"expiry_month":12,
		"expiry_year":2030,
		"cvv":"123",
		"amount":25
	}`

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/payments", bytes.NewBufferString(body))
	c.Request.Header.Set("Content-Type", "application/json")

	h.ProcessPayment(c)

	if w.Code != http.StatusOK {
		t.Fatalf("code %d body %s", w.Code, w.Body.String())
	}

	var out map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil {
		t.Fatalf("unmarshal body: %v", err)
	}
	if out["status"] != "approved" {
		t.Fatalf("status = %q, want approved", out["status"])
	}
	if !strings.HasPrefix(out["transaction_id"], "txn_") {
		t.Fatalf("transaction_id = %q, want txn_*", out["transaction_id"])
	}
}

func TestProcessPayment_Errors(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		body       string
		wantCode   int
		wantErrMsg string
	}{
		{
			name:       "invalid card",
			body:       `{"card_number":"9999 9999 9999 9999","expiry_month":12,"expiry_year":2030,"cvv":"123","amount":25}`,
			wantCode:   http.StatusPaymentRequired,
			wantErrMsg: "Card not valid",
		},
		{
			name:       "invalid cvv",
			body:       `{"card_number":"4242 4242 4242 4242","expiry_month":12,"expiry_year":2030,"cvv":"999","amount":25}`,
			wantCode:   http.StatusPaymentRequired,
			wantErrMsg: "Invalid CVV",
		},
		{
			name:       "expiry mismatch",
			body:       `{"card_number":"4242 4242 4242 4242","expiry_month":10,"expiry_year":2030,"cvv":"123","amount":25}`,
			wantCode:   http.StatusPaymentRequired,
			wantErrMsg: "Expiry details do not match card",
		},
		{
			name:       "card expired",
			body:       `{"card_number":"5555 5555 5555 4444","expiry_month":1,"expiry_year":2023,"cvv":"999","amount":25}`,
			wantCode:   http.StatusPaymentRequired,
			wantErrMsg: "Card expired",
		},
		{
			name:       "insufficient funds",
			body:       `{"card_number":"4111 1111 1111 1111","expiry_month":11,"expiry_year":2029,"cvv":"111","amount":1300}`,
			wantCode:   http.StatusPaymentRequired,
			wantErrMsg: "Insufficient funds",
		},
		{
			name:       "invalid amount",
			body:       `{"card_number":"4242 4242 4242 4242","expiry_month":12,"expiry_year":2030,"cvv":"123","amount":-1}`,
			wantCode:   http.StatusBadRequest,
			wantErrMsg: "Amount must be greater than zero",
		},
		{
			name:       "invalid expiry",
			body:       `{"card_number":"4242 4242 4242 4242","expiry_month":13,"expiry_year":2030,"cvv":"123","amount":25}`,
			wantCode:   http.StatusBadRequest,
			wantErrMsg: "Invalid expiry date",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			h := NewPaymentHandler()
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request = httptest.NewRequest(http.MethodPost, "/payments", bytes.NewBufferString(tc.body))
			c.Request.Header.Set("Content-Type", "application/json")

			h.ProcessPayment(c)

			if w.Code != tc.wantCode {
				t.Fatalf("code %d body %s", w.Code, w.Body.String())
			}
			var out map[string]string
			if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil {
				t.Fatalf("unmarshal body: %v", err)
			}
			if out["error"] != tc.wantErrMsg {
				t.Fatalf("error = %q, want %q", out["error"], tc.wantErrMsg)
			}
		})
	}
}

