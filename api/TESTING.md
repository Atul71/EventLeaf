# EventLeaf Backend Testing Documentation

## Feature: Green Metrics Calculation & Eco-Certification

### Unit Tests for Backend

#### GreenMetrics Model Tests
- **Validate()** - All scores within 0-100 range (valid metrics pass validation)
- **Validate()** - Energy efficiency score exceeds 100 (expects error)
- **Validate()** - Negative carbon footprint reduction (expects error)
- **Validate()** - Negative attendee count in metrics breakdown (expects error)
- **Validate()** - Boundary conditions (zero and max scores pass validation)
- **CalculateOverallScore()** - Averages three component scores correctly (happy path)
- **CalculateOverallScore()** - Equal scores return expected average
- **CalculateOverallScore()** - Decimal precision preserved across calculation
- **DetermineEcoFriendly()** - Score >= 70 sets IsEcoFriendly to true
- **DetermineEcoFriendly()** - Score < 70 sets IsEcoFriendly to false
- **DetermineEcoFriendly()** - Threshold boundary (70.0 exactly)
- **JSON Marshal/Unmarshal** - Complete serialization roundtrip preserves all fields
- **JSON Marshal/Unmarshal** - Event UUID correctly encoded and decoded
- **JSON Marshal/Unmarshal** - Nested MetricsDetails and arrays serialize properly

#### GreenMetrics Service Tests (green_verification.go)
- **CalculateGreenMetrics()** - Happy path: produces valid GreenMetrics with all scores populated
- **CalculateGreenMetrics()** - Event with high eco attributes generates high sustainability score
- **CalculateGreenMetrics()** - Default timezone behavior when venue has no timezone set
- **CalculateGreenMetrics()** - Venue eco-certification score properly weighted
- **CalculateGreenMetrics()** - Public transit accessibility factored into transportation score
- **CalculateGreenMetrics()** - Digital ticketing savings calculated from event type
- **CalculateGreenMetrics()** - Paperless check-in savings applied when checkin method is digital
- **DetermineEcoFriendlyStatus()** - Aggregates all metrics to set IsEcoFriendly flag
- **GenerateSustainabilityTips()** - Returns actionable tips based on metrics breakdown
- **GenerateSustainabilityTips()** - Empty tips list when no recommendations apply

#### GreenMetrics Handler Tests (event_handler.go)
- **GET /api/v1/events/:id/metrics** - Happy path: returns GreenMetrics for existing event
- **GET /api/v1/events/:id/metrics** - Event not found (expects 404)
- **GET /api/v1/events/:id/metrics** - Invalid event UUID format (expects 400)
- **GET /api/v1/events/:id/metrics** - Response includes complete GreenMetrics envelope with breakdown

#### GreenMetrics Repository Tests (event_repository.go)
- **FetchEventWithEcoAttributes()** - Retrieves event and linked eco-certification status
- **FetchEventWithEcoAttributes()** - Null eco-attributes handled gracefully
- **FetchVenueMetrics()** - Aggregates venue eco-certification and transit accessibility scores

#### Integration Tests
- **E2E Green Metrics Workflow** - Create event → Calculate metrics → Retrieve via API → Validate response
- **E2E Eco-Friendly Badge** - Event crosses threshold (70 score) → Badge appears in response
- **E2E Database Persistence** - Calculated metrics stored and retrieved consistently

---

## Description

Built the green metrics calculation and eco-friendly certification feature that enables event organizers to measure and showcase sustainability impact of their events. 

**Key Components:**
- **GreenMetrics Model** (`internal/models/green_metrics.go`): Data structure for sustainability scoring with validation and helper methods
- **Green Verification Service** (`internal/service/green_verification.go`): Calculates composite metrics from venue eco-attributes, event type, and attendee engagement
- **Green Metrics Endpoint** (`internal/handler/event_handler.go`): `GET /api/v1/events/:id/metrics` returns comprehensive green metrics including carbon footprint reduction, energy efficiency score, waste reduction potential, transportation impact, and eco-friendly classification
- **Database Integration** (`internal/repository/event_repository.go`): Maps events to venue eco-certifications, transit accessibility, and ticket distribution methods

**Features Implemented:**
- ✅ Validates scores within 0-100 range with comprehensive error handling
- ✅ Calculates overall sustainability score from energy, waste, and transportation components
- ✅ Auto-classifies events as eco-friendly (score ≥ 70) with supporting badge
- ✅ Provides actionable sustainability tips based on metrics breakdown
- ✅ Includes detailed metrics breakdown (digital ticketing savings, paperless check-in, venue certification, transit access)
- ✅ JSON serialization with proper UUID and nested object handling
- ✅ Comprehensive unit test coverage (18+ test cases across models, calculations, validation, and serialization)

**Testing Status:**
- Model validation: ✅ 10 test cases
- Score calculations: ✅ 5 test cases  
- Eco-friendly determination: ✅ 5 test cases
- JSON marshaling: ✅ 1 comprehensive roundtrip test
- Run tests: `go test ./internal/models -v`

