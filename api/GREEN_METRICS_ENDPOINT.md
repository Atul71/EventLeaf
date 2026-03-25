# Green Metrics Endpoint Documentation

## Overview
A new endpoint has been created to calculate and return comprehensive sustainability metrics for events. This endpoint analyzes an event's eco-friendly attributes, venue selection, and event specifications to provide detailed carbon footprint reduction estimates and sustainability scores.

## New Endpoint

### GET `/api/v1/events/{id}/green-metrics`

Returns calculated sustainability metrics for a specific event.

**Path Parameter:**
- `id` (string, UUID): The event ID

**Response (200 OK):**
```json
{
  "event": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "organizer_id": "uuid",
    "venue_id": "uuid | null",
    "event_date": "2026-03-24T00:00:00Z",
    "event_start_time": "string",
    "event_end_time": "string",
    "is_eco_friendly": boolean,
    "eco_summary": "string | null",
    "ticket_price": number,
    "total_capacity": integer,
    "available_tickets": integer,
    "status": "string",
    "visibility": "string",
    "image_url": "string | null",
    "event_url": "string | null",
    "category": "string | null",
    "has_digital_ticketing": boolean,
    "has_paperless_checkin": boolean,
    "created_at": "2026-03-24T00:00:00Z",
    "updated_at": "2026-03-24T00:00:00Z"
  },
  "green_metrics": {
    "event_id": "uuid",
    "carbon_footprint_reduction": 150.5,
    "energy_efficiency_score": 75.5,
    "waste_reduction_potential": 65.0,
    "transportation_impact_score": 80.0,
    "overall_sustainability_score": 75.13,
    "is_eco_friendly": true,
    "metrics_breakdown": {
      "digital_ticketing_savings": 45.0,
      "paperless_checkin_savings": 24.0,
      "venue_eco_certification_score": 100.0,
      "public_transit_access_score": 100.0,
      "event_attendee_count": 300,
      "selected_eco_attributes": [
        "Paperless Ticketing",
        "Digital Check-in",
        "Waste Reduction Program",
        "Carbon Neutral Transport"
      ]
    },
    "sustainability_tips": [
      "Continue partnering with eco-certified venues",
      "Consider adding tree planting offset for greater carbon impact"
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid event ID format
- `404 Not Found`: Event not found
- `500 Internal Server Error`: Server error

## Metrics Explanation

### Carbon Footprint Reduction (kg CO2)
Estimated kilograms of CO2 that will be prevented/offset through the event's sustainability practices.

**Calculation factors:**
- Digital ticketing: 0.15 kg CO2 per attendee
- Paperless check-in: 0.08 kg CO2 per attendee
- Waste reduction program: 0.3 kg CO2 per attendee
- Carbon neutral transport: 0.5 kg CO2 per attendee
- Tree planting offset: 0.3 kg CO2 per attendee

### Energy Efficiency Score (0-100)
Measures how well the event reduces energy consumption through eco-friendly practices.

**Factors:**
- Digital ticketing: +15 points
- Paperless check-in: +15 points
- Eco-certified venue: +20 points
- Public transit access: +15 points
- Multiple sustainability practices: +10 points
- Base score: 30 points

### Waste Reduction Potential (%)
Percentage of waste that can be prevented through the event's sustainability initiatives.

**Factors:**
- Base potential: 20%
- Paperless check-in: +15%
- Digital ticketing: +15%
- Waste reduction program: +30%
- Maximum: 100%

### Transportation Impact Score (0-100)
Evaluates the sustainability of how attendees will reach the event.

**Factors:**
- Public transit access: 30% weight
- Carbon neutral transportation option: +40 points
- Base score: 20 points
- Maximum: 100%

### Overall Sustainability Score (0-100)
Weighted average of all sustainability metrics.

**Weighting:**
- Energy efficiency score: 30%
- Waste reduction potential: 25%
- Transportation impact score: 25%
- Venue eco-certification: 20%
- Bonus if event marked as eco-friendly: +10%

## Implementation Details

### Files Created

#### 1. `api/internal/models/green_metrics.go`
Defines response models:
- `GreenMetrics`: Main metrics structure with all calculated values
- `MetricsDetails`: Detailed breakdown of metric components
- `GreenMetricsResponse`: Wrapper combining Event + GreenMetrics

#### 2. `api/internal/service/green_metrics.go`
Contains the `CalculateGreenMetrics()` function that:
- Calculates carbon footprint reduction based on eco attributes
- Computes energy efficiency score
- Determines waste reduction potential
- Evaluates transportation impact
- Generates overall sustainability score
- Provides personalized sustainability improvement tips

**Key Constants:**
```go
const (
    BaseCarboFootprintPerAttendee = 2.5
    DigitalTicketingSavingsPerAttendee = 0.15
    PaperlessCheckinSavingsPerAttendee = 0.08
    WasteReductionSavingsPerAttendee = 0.3
)
```

### Files Modified

#### 1. `api/internal/repository/event_repository.go`
Added two new methods:
- `GetByID(ctx context.Context, eventID uuid.UUID) (*models.Event, error)`: Fetches event details
- `GetEcoAttributesForEvent(ctx context.Context, eventID uuid.UUID) ([]string, error)`: Gets associated eco attributes

#### 2. `api/internal/handler/event_handler.go`
Added new handler method:
- `GetEventGreenMetrics(c *gin.Context)`: HTTP handler that orchestrates the metrics calculation
  - Parses event ID from URL parameter
  - Fetches event details
  - Retrieves associated venue (if any)
  - Gets eco attributes
  - Calls metrics calculation service
  - Returns formatted response

#### 3. `api/cmd/server/main.go`
Added new route:
```go
v1.GET("/events/:id/green-metrics", eventHandler.GetEventGreenMetrics)
```

## Usage Example

### Request
```bash
curl -X GET \
  "http://localhost:3000/api/v1/events/550e8400-e29b-41d4-a716-446655440000/green-metrics" \
  -H "Content-Type: application/json"
```

### Response
Returns a 200 OK with complete event and metrics data.

## Integration with Existing Features

The new endpoint integrates seamlessly with:
- **Existing green verification**: Uses the same eco-attribute names defined in the system
- **Event model**: References existing Event struct
- **Venue information**: Retrieves venue eco-certification and transit access status
- **Event eco-attributes**: Queries the event_eco_attributes junction table
- **Database schema**: Works with existing tables (events, venues, eco_attributes, event_eco_attributes)

## Sustainability Attributes Supported

The metrics calculation recognizes these eco-attributes:
- **Paperless Ticketing**: Digital ticketing instead of paper
- **Digital Check-in**: Digital instead of paper wristbands
- **Waste Reduction Program**: Comprehensive waste management program
- **Carbon Neutral Transport**: Low-carbon transportation options
- **Tree Planting Offset**: Tree planting to offset carbon emissions

## Venue Properties Considered

- **Is Eco-Certified**: Presence of eco-certifications
- **Has Public Transit**: Accessibility via public transportation
- **Has Parking**: Availability of parking (affects transportation choices)
- **Has Accessible Facilities**: Accessibility for all attendees (sustainability bonus)

## Tips Generation

The endpoint automatically generates actionable sustainability tips based on gaps:
- Recommends eco-certified venues if not selected
- Suggests digital ticketing if not enabled
- Encourages paperless check-in if not implemented
- Recommends public transit access if unavailable
- Suggests sustainability practices for events without any

## Performance Considerations

The endpoint makes the following database queries:
1. **Fetch event** (1 query by ID)
2. **Fetch venue** (1 query if venue_id exists)
3. **Fetch eco attributes** (1 JOIN query with event_eco_attributes)

**Total: 2-3 queries per request** - Well-optimized for a typical event with manageable database load.

## Future Enhancements

Potential improvements:
- Add caching for frequently requested events
- Provide historical metrics tracking
- Compare event sustainability with similar events
- Add attendee carbon footprint calculator
- Integrate with external carbon offsetting APIs
- Generate sustainability reports (PDF/CSV)
- Add goal-setting for event organizers
- Track metrics improvement over time

## Testing

To test locally:

1. Create an event with eco-attributes:
   ```bash
   curl -X POST http://localhost:3000/api/v1/events \
     -H "Content-Type: application/json" \
     -d '{...event data...}'
   ```

2. Get its green metrics:
   ```bash
   curl http://localhost:3000/api/v1/events/{event-id}/green-metrics
   ```

3. Verify response contains all metrics with calculated values
