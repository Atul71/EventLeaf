package handler

import (
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type paymentRequest struct {
	CardNumber  string  `json:"card_number" binding:"required"`
	ExpiryMonth int     `json:"expiry_month" binding:"required"`
	ExpiryYear  int     `json:"expiry_year" binding:"required"`
	CVV         string  `json:"cvv" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
}

type mockCard struct {
	Number      string
	ExpiryMonth int
	ExpiryYear  int
	CVV         string
	Balance     float64
}

type PaymentHandler struct {
	mu    sync.Mutex
	cards map[string]*mockCard
}

func NewPaymentHandler() *PaymentHandler {
	return &PaymentHandler{
		cards: map[string]*mockCard{
			"4242424242424242": {Number: "4242424242424242", ExpiryMonth: 12, ExpiryYear: 2030, CVV: "123", Balance: 5000},
			"5555555555554444": {Number: "5555555555554444", ExpiryMonth: 1, ExpiryYear: 2023, CVV: "999", Balance: 40},
			"4111111111111111": {Number: "4111111111111111", ExpiryMonth: 11, ExpiryYear: 2029, CVV: "111", Balance: 1200},
			"4012888888881881": {Number: "4012888888881881", ExpiryMonth: 10, ExpiryYear: 2028, CVV: "222", Balance: 950},
			"378282246310005":  {Number: "378282246310005", ExpiryMonth: 9, ExpiryYear: 2027, CVV: "321", Balance: 300},
			"6011111111111117": {Number: "6011111111111117", ExpiryMonth: 8, ExpiryYear: 2029, CVV: "456", Balance: 720},
			"3530111333300000": {Number: "3530111333300000", ExpiryMonth: 7, ExpiryYear: 2031, CVV: "654", Balance: 1800},
			"30569309025904":   {Number: "30569309025904", ExpiryMonth: 6, ExpiryYear: 2028, CVV: "777", Balance: 410},
			"4000000000000002": {Number: "4000000000000002", ExpiryMonth: 5, ExpiryYear: 2026, CVV: "100", Balance: 50},
			"5200828282828210": {Number: "5200828282828210", ExpiryMonth: 4, ExpiryYear: 2030, CVV: "888", Balance: 2600},
		},
	}
}

var digitsOnlyPattern = regexp.MustCompile(`\D`)

// ProcessPayment godoc
// @Summary      Validate and process a mock payment
// @Description  Validates test card details against the in-memory mock bank and returns a transaction id on success.
// @Tags         payments
// @Accept       json
// @Produce      json
// @Param        payment  body      paymentRequest  true  "Payment details"
// @Success      200      {object}  map[string]string
// @Failure      400      {object}  map[string]string
// @Failure      402      {object}  map[string]string
// @Router       /payments [post]
func (h *PaymentHandler) ProcessPayment(c *gin.Context) {
	var req paymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	cardNumber := digitsOnlyPattern.ReplaceAllString(strings.TrimSpace(req.CardNumber), "")
	cvv := digitsOnlyPattern.ReplaceAllString(strings.TrimSpace(req.CVV), "")

	if req.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount must be greater than zero"})
		return
	}
	if req.ExpiryMonth < 1 || req.ExpiryMonth > 12 || req.ExpiryYear < 2000 || req.ExpiryYear > 2100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expiry date"})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	card, ok := h.cards[cardNumber]
	if !ok {
		c.JSON(http.StatusPaymentRequired, gin.H{"error": "Card not valid"})
		return
	}
	if cvv != card.CVV {
		c.JSON(http.StatusPaymentRequired, gin.H{"error": "Invalid CVV"})
		return
	}
	if req.ExpiryMonth != card.ExpiryMonth || req.ExpiryYear != card.ExpiryYear {
		c.JSON(http.StatusPaymentRequired, gin.H{"error": "Expiry details do not match card"})
		return
	}

	now := time.Now()
	if req.ExpiryYear < now.Year() || (req.ExpiryYear == now.Year() && req.ExpiryMonth < int(now.Month())) {
		c.JSON(http.StatusPaymentRequired, gin.H{"error": "Card expired"})
		return
	}
	if req.Amount > card.Balance {
		c.JSON(http.StatusPaymentRequired, gin.H{"error": "Insufficient funds"})
		return
	}

	card.Balance -= req.Amount
	c.JSON(http.StatusOK, gin.H{
		"status":         "approved",
		"transaction_id": "txn_" + uuid.NewString(),
	})
}
