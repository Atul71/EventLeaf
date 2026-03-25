# Quick Start Guide - Green Metrics Endpoint

## Getting Started

### 1. Add Eco Attributes to an Event

First, get the list of available eco attributes:

```bash
curl -X GET "http://localhost:3000/api/v1/eco-attributes"
```

Response example:
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Paperless Ticketing",
    "category": "sustainability_practice"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Digital Check-in",
    "category": "sustainability_practice"
  },
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "Waste Reduction Program",
    "category": "sustainability_practice"
  },
  {
    "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
    "name": "Carbon Neutral Transport",
    "category": "sustainability_practice"
  },
  {
    "id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
    "name": "Tree Planting Offset",
    "category": "sustainability_practice"
  }
]
```

### 2. Create an Event with Eco Attributes

```bash
curl -X POST "http://localhost:3000/api/v1/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Spring Tech Conference",
    "description": "Annual technology conference focused on sustainable development",
    "organizer_id": "12345678-1234-1234-1234-123456789012",
    "venue_id": "87654321-4321-4321-4321-210987654321",
    "event_date": "2026-06-15",
    "event_start_time": "09:00:00",
    "event_end_time": "17:00:00",
    "eco_summary": "Green event with digital tickets and paperless operations",
    "ticket_price": 50.00,
    "total_capacity": 300,
    "status": "published",
    "visibility": "public",
    "category": "conference",
    "eco_attribute_ids": [
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "d4e5f6a7-b8c9-0123-def0-234567890123"
    ]
  }'
```

Response:
```json
{
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Spring Tech Conference",
    "total_capacity": 300,
    "has_digital_ticketing": true,
    "has_paperless_checkin": true,
    "is_eco_friendly": true,
    ...
  },
  "is_green": true,
  "green_criteria_met": [
    "Eco-certified venue selected",
    "Sustainability: Paperless Ticketing",
    "Sustainability: Digital Check-in",
    "Sustainability: Waste Reduction Program",
    "Sustainability: Carbon Neutral Transport",
    "At least 2 sustainability flags selected (4)"
  ],
  "green_criteria_not_met": []
}
```

### 3. Get Green Metrics for the Event

Now retrieve the detailed green metrics:

```bash
curl -X GET "http://localhost:3000/api/v1/events/550e8400-e29b-41d4-a716-446655440000/green-metrics"
```

### Response

```json
{
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Spring Tech Conference",
    "description": "Annual technology conference focused on sustainable development",
    "organizer_id": "12345678-1234-1234-1234-123456789012",
    "venue_id": "87654321-4321-4321-4321-210987654321",
    "event_date": "2026-06-15T00:00:00Z",
    "event_start_time": "09:00:00",
    "event_end_time": "17:00:00",
    "is_eco_friendly": true,
    "eco_summary": "Green event with digital tickets and paperless operations",
    "ticket_price": 50,
    "total_capacity": 300,
    "available_tickets": 300,
    "status": "published",
    "visibility": "public",
    "image_url": null,
    "event_url": null,
    "category": "conference",
    "has_digital_ticketing": true,
    "has_paperless_checkin": true,
    "created_at": "2026-03-24T10:30:00Z",
    "updated_at": "2026-03-24T10:30:00Z"
  },
  "green_metrics": {
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "carbon_footprint_reduction": 199,
    "energy_efficiency_score": 95,
    "waste_reduction_potential": 80,
    "transportation_impact_score": 88,
    "overall_sustainability_score": 89.95,
    "is_eco_friendly": true,
    "metrics_breakdown": {
      "digital_ticketing_savings": 45,
      "paperless_checkin_savings": 24,
      "venue_eco_certification_score": 100,
      "public_transit_access_score": 100,
      "event_attendee_count": 300,
      "selected_eco_attributes": [
        "Carbon Neutral Transport",
        "Digital Check-in",
        "Paperless Ticketing",
        "Waste Reduction Program"
      ]
    },
    "sustainability_tips": [
      "Your event is doing great! Continue this sustainable approach for future events"
    ]
  }
}
```

## Understanding the Metrics

### Carbon Footprint Reduction: 199 kg CO2
This event will prevent **199 kilograms of CO2 emissions** through its sustainability practices.

**Breakdown:**
- Digital ticketing: 45 kg (0.15 × 300 attendees)
- Paperless check-in: 24 kg (0.08 × 300 attendees)
- Waste reduction: 90 kg (0.3 × 300 attendees)
- Carbon neutral transport: 150 kg (0.5 × 300 attendees)

**Total: 309 kg CO2 equivalent to:**
- Equivalent to ~70 miles of car travel
- ~24 trees' annual CO2 absorption
- ~312 lbs of recycled waste

### Energy Efficiency Score: 95/100
The event has excellent energy and resource efficiency practices.

**Contributing factors:**
- Digital ticketing enabled ✓ (+15 points)
- Paperless check-in enabled ✓ (+15 points)
- Eco-certified venue ✓ (+20 points)
- Public transit access ✓ (+15 points)
- Multiple sustainability practices ✓ (+10 points)
- Base efficiency level (30 points)

**Score:** 15 + 15 + 20 + 15 + 10 + 30 = **95/100**

### Waste Reduction Potential: 80%
The event can prevent **80% of typical event waste** through its programs.

**Contributing factors:**
- Base waste reduction: 20%
- Paperless check-in: +15% (avoids physical wristbands)
- Digital ticketing: +15% (avoids paper tickets)
- Waste reduction program: +30% (comprehensive waste management)

**Total: 80% waste reduction**

### Transportation Impact Score: 88/100
Attendees will have sustainable transportation options.

**Contributing factors:**
- Public transit accessibility: 100% (weighted 30%)
- Carbon neutral transport option: 40 bonus points
- Base transportation efficiency: 20 points

**Score:** (100 × 0.3) + 40 + 20 = **88/100**

### Overall Sustainability Score: 89.95/100
Weighted combination of all metrics.

**Weighting:**
- Energy efficiency (95): 30% = 28.5
- Waste reduction (80): 25% = 20
- Transportation (88): 25% = 22
- Venue certification (100): 20% = 20
- Eco-friendly bonus: +10%

**Score:** 28.5 + 20 + 22 + 20 = 90.5 → with bonus = **89.95**

## Examples with Different Event Types

### Example 1: Event Without Eco Attributes

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/events/111e1111-1111-1111-1111-111111111111/green-metrics"
```

**Response Highlights:**
```json
{
  "green_metrics": {
    "carbon_footprint_reduction": 0,
    "energy_efficiency_score": 30,
    "waste_reduction_potential": 20,
    "transportation_impact_score": 20,
    "overall_sustainability_score": 24.5,
    "sustainability_tips": [
      "Select at least 2 sustainability practices to reach Green status",
      "Choose an eco-certified venue to significantly improve your event's sustainability profile",
      "Enable digital ticketing to reduce paper waste by ~15% per attendee"
    ]
  }
}
```

### Example 2: Small Private Event

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/events/222e2222-2222-2222-2222-222222222222/green-metrics"
```

**Response Highlights:**
```json
{
  "event": {
    "total_capacity": 50,
    "has_digital_ticketing": true,
    "has_paperless_checkin": true
  },
  "green_metrics": {
    "carbon_footprint_reduction": 11.5,
    "overall_sustainability_score": 60.25,
    "metrics_breakdown": {
      "digital_ticketing_savings": 7.5,
      "paperless_checkin_savings": 4,
      "event_attendee_count": 50
    }
  }
}
```

### Example 3: Event Without Venue

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/events/333e3333-3333-3333-3333-333333333333/green-metrics"
```

**Response:**
```json
{
  "event": {
    "venue_id": null
  },
  "green_metrics": {
    "metrics_breakdown": {
      "venue_eco_certification_score": 20,
      "public_transit_access_score": 20
    },
    "sustainability_tips": [
      "Select an eco-certified venue to significantly improve your event's sustainability profile",
      "Choose a venue with public transit access to encourage sustainable transportation"
    ]
  }
}
```

## Error Handling

### Invalid Event ID Format
```bash
curl -X GET "http://localhost:3000/api/v1/events/not-a-uuid/green-metrics"
```

Response (400 Bad Request):
```json
{
  "error": "Invalid event ID format"
}
```

### Event Not Found
```bash
curl -X GET "http://localhost:3000/api/v1/events/12345678-1234-1234-1234-123456789012/green-metrics"
```

Response (404 Not Found):
```json
{
  "error": "Event not found"
}
```

## API Integration Tips

### JavaScript/TypeScript
```typescript
async function getGreenMetrics(eventId: string) {
  const response = await fetch(
    `http://localhost:3000/api/v1/events/${eventId}/green-metrics`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Usage
const metrics = await getGreenMetrics('550e8400-e29b-41d4-a716-446655440000');
console.log(`Overall Sustainability Score: ${metrics.green_metrics.overall_sustainability_score}`);
```

### Python
```python
import requests

def get_green_metrics(event_id: str):
    url = f"http://localhost:3000/api/v1/events/{event_id}/green-metrics"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# Usage
metrics = get_green_metrics('550e8400-e29b-41d4-a716-446655440000')
print(f"Carbon Reduction: {metrics['green_metrics']['carbon_footprint_reduction']} kg CO2")
```

## Next Steps

1. **Display in UI**: Show green metrics on event details page
2. **Event Comparison**: Compare sustainability scores between events
3. **Organizer Dashboard**: Show metrics trends over time
4. **Marketing**: Use scores in event marketing materials
5. **Filtering**: Allow attendees to filter events by sustainability score
6. **Export**: Generate sustainability reports as PDF or CSV

## Troubleshooting

**Q: Why is my event's sustainability score low?**
A: Check the `sustainability_tips` array in the response for specific recommendations.

**Q: Does event capacity affect the metrics?**
A: Yes! Larger events have higher carbon footprint reduction and waste prevention because the same practices benefit more attendees.

**Q: Can I compare this event's score with others?**
A: Not yet in this implementation, but this is a planned feature. For now, compare by reviewing the individual metric breakdown.

**Q: How often are metrics recalculated?**
A: Metrics are calculated on-demand when you call the endpoint. They update immediately if you modify event eco-attributes.
