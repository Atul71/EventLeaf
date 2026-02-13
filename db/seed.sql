-- EventLeaf Sample Data for Development
-- This file contains sample data for testing and development purposes

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, is_organizer, is_eco_conscious, bio)
VALUES 
    ('john.organizer@eventleaf.com', '$2b$10$dummyhash1', 'John', 'Organizer', true, true, 'Passionate event organizer focused on sustainability'),
    ('jane.attendee@eventleaf.com', '$2b$10$dummyhash2', 'Jane', 'Attendee', false, true, 'Eco-conscious event enthusiast'),
    ('bob.organizer@eventleaf.com', '$2b$10$dummyhash3', 'Bob', 'Manager', true, false, 'Professional event manager'),
    ('alice.attendee@eventleaf.com', '$2b$10$dummyhash4', 'Alice', 'Smith', false, true, 'Love attending eco-friendly events'),
    ('charlie.admin@eventleaf.com', '$2b$10$dummyhash5', 'Charlie', 'Admin', true, true, 'Platform administrator')
ON CONFLICT (email) DO NOTHING;

-- Get the IDs of created users for reference
WITH user_ids AS (
    SELECT id, email FROM users WHERE email IN (
        'john.organizer@eventleaf.com',
        'jane.attendee@eventleaf.com',
        'bob.organizer@eventleaf.com',
        'alice.attendee@eventleaf.com'
    ) LIMIT 4
)

-- Insert sample venues
INSERT INTO venues (
    name, description, address, city, state, zip_code, capacity,
    contact_email, is_eco_certified, has_public_transit, has_accessible_facilities, created_by
)
SELECT 
    'Green Park Amphitheater', 
    'Beautiful outdoor venue with sustainable practices',
    '123 Oak Street',
    'Gainesville',
    'FL',
    '32601',
    5000,
    'park@eventleaf.com',
    true,
    true,
    true,
    (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Green Park Amphitheater');

INSERT INTO venues (
    name, description, address, city, state, zip_code, capacity,
    contact_email, is_eco_certified, has_public_transit, has_accessible_facilities, created_by
)
SELECT 
    'Eco Convention Center',
    'Modern convention center with LEED certification',
    '456 Green Avenue',
    'Gainesville',
    'FL',
    '32602',
    2000,
    'events@ecoconv.com',
    true,
    true,
    true,
    (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Eco Convention Center');

INSERT INTO venues (
    name, description, address, city, state, zip_code, capacity,
    contact_email, is_eco_certified, has_public_transit, has_accessible_facilities, created_by
)
SELECT 
    'Downtown Community Hall',
    'Local community venue with basic amenities',
    '789 Main Street',
    'Gainesville',
    'FL',
    '32603',
    500,
    'hall@eventleaf.com',
    false,
    true,
    true,
    (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Downtown Community Hall');

-- Insert sample events
SELECT * FROM events WHERE title = 'Earth Day 2024 Celebration' LIMIT 1
INTO event_check;

INSERT INTO events (
    title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time,
    is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, 
    status, visibility, category, has_digital_ticketing, has_paperless_checkin
)
SELECT
    'Earth Day 2024 Celebration',
    'Join us for a celebration of environmental sustainability with zero-waste practices. Features eco-friendly vendors, sustainable music performances, and educational workshops.',
    (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1),
    (SELECT id FROM venues WHERE name = 'Green Park Amphitheater' LIMIT 1),
    CURRENT_DATE + INTERVAL '30 days',
    '10:00:00',
    '18:00:00',
    true,
    'This event features paperless ticketing, digital check-ins, local vendors, and zero single-use plastics.',
    15.00,
    5000,
    5000,
    'published',
    'public',
    'environmental',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Earth Day 2024 Celebration');

INSERT INTO events (
    title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time,
    is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, 
    status, visibility, category, has_digital_ticketing, has_paperless_checkin
)
SELECT
    'Tech Conference 2024',
    'Annual technology conference with keynote speakers, panels, and networking opportunities. Includes eco-conscious practices throughout the event.',
    (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1),
    (SELECT id FROM venues WHERE name = 'Eco Convention Center' LIMIT 1),
    CURRENT_DATE + INTERVAL '45 days',
    '09:00:00',
    '17:00:00',
    true,
    'Digital materials only, public transit encouraged, renewable energy powered venue.',
    75.00,
    2000,
    2000,
    'published',
    'public',
    'conference',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Tech Conference 2024');

INSERT INTO events (
    title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time,
    is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, 
    status, visibility, category, has_digital_ticketing, has_paperless_checkin
)
SELECT
    'Local Music Night',
    'Enjoy live music from local artists in an intimate venue setting.',
    (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1),
    (SELECT id FROM venues WHERE name = 'Downtown Community Hall' LIMIT 1),
    CURRENT_DATE + INTERVAL '14 days',
    '19:00:00',
    '23:00:00',
    false,
    NULL,
    10.00,
    500,
    500,
    'published',
    'public',
    'music',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Local Music Night');

-- Link eco attributes to events
INSERT INTO event_eco_attributes (event_id, eco_attribute_id)
SELECT 
    (SELECT id FROM events WHERE title = 'Earth Day 2024 Celebration' LIMIT 1),
    id
FROM eco_attributes
WHERE name IN ('Paperless Ticketing', 'Digital Check-in', 'Zero Single-Use Plastics', 'Local Vendors', 'Public Transit Access')
ON CONFLICT DO NOTHING;

INSERT INTO event_eco_attributes (event_id, eco_attribute_id)
SELECT 
    (SELECT id FROM events WHERE title = 'Tech Conference 2024' LIMIT 1),
    id
FROM eco_attributes
WHERE name IN ('Paperless Ticketing', 'Digital Check-in', 'Eco-Certified Venue', 'Public Transit Access', 'Renewable Energy')
ON CONFLICT DO NOTHING;

-- Insert sample tickets
INSERT INTO tickets (user_id, event_id, ticket_number, ticket_type, purchase_date, status, price_paid)
SELECT
    (SELECT id FROM users WHERE email = 'jane.attendee@eventleaf.com' LIMIT 1),
    (SELECT id FROM events WHERE title = 'Earth Day 2024 Celebration' LIMIT 1),
    'TICKET-' || gen_random_uuid()::text,
    'general',
    NOW() - INTERVAL '5 days',
    'active',
    15.00
WHERE NOT EXISTS (
    SELECT 1 FROM tickets t
    JOIN users u ON t.user_id = u.id
    WHERE u.email = 'jane.attendee@eventleaf.com'
    AND t.status = 'active'
    LIMIT 1
);

INSERT INTO tickets (user_id, event_id, ticket_number, ticket_type, purchase_date, status, price_paid)
SELECT
    (SELECT id FROM users WHERE email = 'alice.attendee@eventleaf.com' LIMIT 1),
    (SELECT id FROM events WHERE title = 'Tech Conference 2024' LIMIT 1),
    'TICKET-' || gen_random_uuid()::text,
    'early_bird',
    NOW() - INTERVAL '10 days',
    'active',
    60.00
WHERE NOT EXISTS (
    SELECT 1 FROM tickets t
    JOIN users u ON t.user_id = u.id
    WHERE u.email = 'alice.attendee@eventleaf.com'
    AND t.status = 'active'
    LIMIT 1
);
