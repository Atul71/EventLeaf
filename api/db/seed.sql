-- EventLeaf Sample Data for Development
-- This file contains sample data for testing and development purposes

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name, is_organizer, is_eco_conscious, bio)
VALUES 
    ('johnorganizer', 'john.organizer@eventleaf.com', '$2b$10$dummyhash1', 'John', 'Organizer', true, true, 'Passionate event organizer focused on sustainability'),
    ('janeattendee', 'jane.attendee@eventleaf.com', '$2b$10$dummyhash2', 'Jane', 'Attendee', false, true, 'Eco-conscious event enthusiast'),
    ('boborganizer', 'bob.organizer@eventleaf.com', '$2b$10$dummyhash3', 'Bob', 'Manager', true, false, 'Professional event manager'),
    ('aliceattendee', 'alice.attendee@eventleaf.com', '$2b$10$dummyhash4', 'Alice', 'Smith', false, true, 'Love attending eco-friendly events'),
    ('charlieadmin', 'charlie.admin@eventleaf.com', '$2b$10$dummyhash5', 'Charlie', 'Admin', true, true, 'Platform administrator')
ON CONFLICT (email) DO NOTHING;

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

-- Demo venues (names align with frontend BE-102 mocks + many extras for search/browse)
WITH admin AS (
    SELECT id AS created_by FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1
),
v(name, description, address, city, state, zip_code, capacity, contact_email, is_eco_certified, eco_certifications, has_public_transit, has_parking, has_accessible_facilities) AS (
    VALUES
        ('The Solar Atrium', 'Modern glass atrium with on-site solar and lush indoor plantings.', '100 Market St', 'San Francisco', 'CA', '94105', 500, 'bookings@solar-atrium.mock', true, ARRAY['LEED Gold','Green Auditorium','100% Renewable Energy']::text[], true, false, true),
        ('Green Canopy Hall', 'Industrial-chic hall with hanging plants, daylighting, and zero-waste program.', '2200 NW Industrial Way', 'Portland', 'OR', '97210', 1200, 'events@greencanopy.mock', true, ARRAY['LEED Gold','Zero Waste Program','Green Auditorium']::text[], true, true, true),
        ('Eco-Vista Center', 'Wood-and-glass conference center with rainwater harvesting and bio gardens.', '4100 Aurora Ave N', 'Seattle', 'WA', '98103', 350, 'hello@ecovista.mock', true, ARRAY['LEED Platinum','Rainwater harvesting','Green Auditorium']::text[], true, false, true),
        ('Renewable Roots Pavilion', 'Reclaimed wood, vertical gardens, and renewable grid + offsets.', '88 E Cesar Chavez St', 'Austin', 'TX', '78701', 200, 'rent@renewableroots.mock', true, ARRAY['100% Renewable Energy','Low-energy lighting retrofit']::text[], true, true, true),
        ('Earth-First Ballroom', 'Grand ballroom with carbon-neutral operations and wind PPA.', '200 N Michigan Ave', 'Chicago', 'IL', '60601', 2500, 'sales@earthfirst-ballroom.mock', true, ARRAY['Carbon-neutral operations','Wind power PPA']::text[], true, true, true),
        ('Sustainable Skies Lounge', 'Rooftop lounge with solar array and organic F&B partners.', '350 5th Ave', 'New York', 'NY', '10118', 150, 'events@sustainable-skies.mock', true, ARRAY['LEED Silver','Solar roof array','Organic F&B partners']::text[], true, false, true),
        ('Metro Grand Hall', 'Large conventional event hall; standard operations baseline.', '400 W Grand Ave', 'Chicago', 'IL', '60654', 3000, 'bookings@metro-grand.mock', false, ARRAY[]::text[], true, true, true),
        ('Riverside Warehouse', 'Industrial warehouse rental on the riverfront.', '1800 SE Water Ave', 'Portland', 'OR', '97214', 800, 'lease@riverside-wh.mock', false, ARRAY[]::text[], true, true, false),
        ('City Center Ballroom', 'Hotel-partner ballroom in the central business district.', '1776 Broadway', 'Denver', 'CO', '80202', 600, 'catering@citycenter-ballroom.mock', false, ARRAY[]::text[], true, true, true),
        ('Bayview Bio-Lab Atrium', 'Biophilic atrium tied to a cleantech campus.', '2500 3rd St', 'Oakland', 'CA', '94607', 420, 'events@bayview-biolab.mock', true, ARRAY['Living Building Challenge pilot','Composting program']::text[], true, false, true),
        ('Cascadia Commons', 'Community hall with aggressive waste diversion and bike valet.', '800 Main St', 'Vancouver', 'WA', '98660', 280, 'rent@cascadia-commons.mock', true, ARRAY['TRUE Zero Waste aligned','Bike valet']::text[], true, true, true),
        ('Great Lakes Expo Hall', 'Large expo floor; partial LED retrofit and transit links.', '1 Washington Blvd', 'Detroit', 'MI', '48226', 4000, 'expo@greatlakes-hall.mock', false, ARRAY[]::text[], true, true, true),
        ('Sunbelt Arena', 'Indoor arena with water-efficient landscaping outside.', '201 E Jefferson St', 'Phoenix', 'AZ', '85004', 12000, 'booking@sunbelt-arena.mock', false, ARRAY['Water-efficient landscaping']::text[], true, true, true),
        ('Atlantic Pier Pavilion', 'Waterfront pavilion; sea-level resilience upgrades.', '200 Atlantic Ave', 'Boston', 'MA', '02210', 650, 'events@atlantic-pier.mock', true, ARRAY['Coastal resilience upgrades','Public transit access']::text[], true, false, true),
        ('Music Row Studio Hall', 'Recording-studio-adjacent event space with LED stage lighting.', '1200 16th Ave S', 'Nashville', 'TN', '37212', 180, 'studio@musicrow-hall.mock', true, ARRAY['LED stage lighting','Local vendor preference']::text[], true, true, true),
        ('Redwood Retreat Lodge', 'Forest-adjacent lodge; low-impact build materials.', '44800 CA-1', 'Mendocino', 'CA', '95460', 120, 'gather@redwood-retreat.mock', true, ARRAY['Low-impact materials','Dark-sky lighting']::text[], false, true, false),
        ('Prairie Wind Barn', 'Repurposed barn venue with geothermal HVAC.', '8900 County Rd 12', 'Minneapolis', 'MN', '55432', 220, 'events@prairie-wind.mock', true, ARRAY['Geothermal HVAC','Renewable Energy']::text[], false, true, true),
        ('Desert Bloom Gardens', 'Outdoor garden venue with xeriscaping and shade sails.', '5400 E Speedway Blvd', 'Tucson', 'AZ', '85712', 400, 'weddings@desertbloom.mock', true, ARRAY['Xeriscaping','Shade sails','Water Conservation']::text[], false, true, true),
        ('Capitol Green Terrace', 'Rooftop terrace blocks from the Capitol with green roof.', '300 New Jersey Ave NW', 'Washington', 'DC', '20001', 200, 'terrace@capitol-green.mock', true, ARRAY['Green roof','LEED Gold']::text[], true, false, true),
        ('Piedmont Park North Meadow', 'Tented meadow space inside a major urban park.', '400 Park Dr NE', 'Atlanta', 'GA', '30309', 1500, 'events@piedmont-north.mock', true, ARRAY['Park stewardship fund','Public Transit Access']::text[], true, false, true),
        ('Miami Beach Solar Deck', 'Ocean-view deck with battery-backed solar canopy.', '1001 Ocean Dr', 'Miami Beach', 'FL', '33139', 260, 'deck@miami-solar.mock', true, ARRAY['Battery-backed solar','LEED Silver']::text[], true, false, true),
        ('Lakeshore Loft', 'Brick loft on the lakefront; basic recycling program.', '1750 N Lincoln Memorial Dr', 'Milwaukee', 'WI', '53202', 320, 'loft@lakeshore-mke.mock', false, ARRAY[]::text[], true, true, true),
        ('Silicon Rotunda', 'Circular event space on a tech campus with EV charging.', '2200 Innovation Way', 'Cupertino', 'CA', '95014', 800, 'events@silicon-rotunda.mock', true, ARRAY['EV charging fleet','Renewable Energy']::text[], true, true, true),
        ('Highland Eco Lodge', 'Mountain-view lodge; composting and local food policy.', '3500 E 17th Ave', 'Denver', 'CO', '80206', 190, 'stay@highland-eco.mock', true, ARRAY['Composting kitchen','Local Vendors']::text[], true, true, true),
        ('Stumptown Foundry East', 'East-side industrial venue; minimal green certs.', '4800 NE Sandy Blvd', 'Portland', 'OR', '97213', 450, 'book@stumptown-foundry.mock', false, ARRAY[]::text[], true, true, true),
        ('River North Gallery Hall', 'White-box gallery for receptions and launches.', '750 N Franklin St', 'Chicago', 'IL', '60654', 275, 'events@rivernorth-gallery.mock', false, ARRAY[]::text[], true, false, true),
        ('Charlotte Rail Yard Hall', 'Historic rail-shed conversion; mixed transit access.', '115 E Park Ave', 'Charlotte', 'NC', '28204', 1100, 'events@clt-railyard.mock', false, ARRAY['Public Transit Access']::text[], true, true, true),
        ('Kendall Square Lab Atrium', 'Atrium between lab buildings; strict waste sorting.', '300 Main St', 'Cambridge', 'MA', '02142', 340, 'atrium@kendall-labs.mock', true, ARRAY['Waste Reduction Program','Digital Check-in ready']::text[], true, false, true),
        ('Pearl District Brickworks', 'Exposed brick event hall in the Pearl.', '1400 NW Everett St', 'Portland', 'OR', '97209', 380, 'events@pearl-brickworks.mock', false, ARRAY[]::text[], true, true, true),
        ('Willamette River Boathouse', 'Waterfront boathouse venue; solar dock lights.', '1515 SE Water Ave', 'Portland', 'OR', '97214', 160, 'paddle@willamette-boathouse.mock', true, ARRAY['Solar dock lighting','Public Transit Access']::text[], true, false, false),
        ('SoMa Flex Hall', 'Flexible black-box hall with efficient HVAC.', '123 4th St', 'San Francisco', 'CA', '94103', 600, 'flex@soma-hall.mock', false, ARRAY[]::text[], true, true, true),
        ('Green Park Amphitheater (Annex)', 'Smaller annex stage next to the main amphitheater lawn.', '125 Oak Street', 'Gainesville', 'FL', '32601', 800, 'annex@greenpark.mock', true, ARRAY['Eco-Certified Venue','Public Transit Access']::text[], true, true, true)
)
INSERT INTO venues (
    name, description, address, city, state, zip_code, capacity,
    contact_email, is_eco_certified, eco_certifications,
    has_public_transit, has_parking, has_accessible_facilities, created_by
)
SELECT
    v.name, v.description, v.address, v.city, v.state, v.zip_code, v.capacity,
    v.contact_email, v.is_eco_certified, v.eco_certifications,
    v.has_public_transit, v.has_parking, v.has_accessible_facilities,
    admin.created_by
FROM v CROSS JOIN admin
WHERE NOT EXISTS (SELECT 1 FROM venues vn WHERE vn.name = v.name);

-- Insert sample events
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

-- Additional published demo events (Discover / API listing)
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Solar Atrium Jazz Night', 'Acoustic jazz under the glass canopy; LED lighting and plant-forward bar.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'The Solar Atrium' LIMIT 1), CURRENT_DATE + INTERVAL '8 days', '19:00:00', '22:30:00', true, 'Paperless tickets; venue solar offsets evening load.', 35.00, 450, 450, 'published', 'public', 'music', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Solar Atrium Jazz Night');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Portland Zero-Waste Food Fair', 'Sample low-waste catering from 40 vendors; composting on site.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Green Canopy Hall' LIMIT 1), CURRENT_DATE + INTERVAL '11 days', '11:00:00', '16:00:00', true, 'Zero-waste serviceware; digital menus only.', 12.00, 1000, 1000, 'published', 'public', 'food', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Portland Zero-Waste Food Fair');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Seattle Climate Tech Meetup', 'Lightning talks on grid storage, EV fleets, and green buildings.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Eco-Vista Center' LIMIT 1), CURRENT_DATE + INTERVAL '13 days', '18:00:00', '21:00:00', true, 'Rainwater-fed restrooms; transit pass raffle.', 0.00, 300, 300, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Seattle Climate Tech Meetup');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Austin Roots Reggae Sunset', 'Outdoor stage with local food trucks and refill stations.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Renewable Roots Pavilion' LIMIT 1), CURRENT_DATE + INTERVAL '16 days', '17:00:00', '23:00:00', true, 'Reusable cups deposit program.', 28.00, 180, 180, 'published', 'public', 'music', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Austin Roots Reggae Sunset');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Chicago Green Jobs Expo', 'Employers hiring in solar install, retrofit, and circular economy roles.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Earth-First Ballroom' LIMIT 1), CURRENT_DATE + INTERVAL '19 days', '09:00:00', '15:00:00', true, 'Wind-powered venue; digital resumes only.', 0.00, 2200, 2200, 'published', 'public', 'conference', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Chicago Green Jobs Expo');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'NYC Rooftop Solar Social', 'Networking for community solar subscribers and installers.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Sustainable Skies Lounge' LIMIT 1), CURRENT_DATE + INTERVAL '21 days', '17:30:00', '20:30:00', true, 'Solar-powered sound; organic wine tasting.', 45.00, 130, 130, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'NYC Rooftop Solar Social');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Metro Grand Trade Show', 'B2B equipment expo; standard hall operations.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Metro Grand Hall' LIMIT 1), CURRENT_DATE + INTERVAL '24 days', '08:00:00', '18:00:00', false, NULL, 0.00, 2800, 2800, 'published', 'public', 'conference', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Metro Grand Trade Show');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'PDX Warehouse Indie Market', 'Vintage and makers market in industrial space.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Riverside Warehouse' LIMIT 1), CURRENT_DATE + INTERVAL '26 days', '10:00:00', '17:00:00', false, NULL, 5.00, 700, 700, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'PDX Warehouse Indie Market');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Denver Startup Pitch Night', 'Ten startups, five minutes each, investor Q&A.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'City Center Ballroom' LIMIT 1), CURRENT_DATE + INTERVAL '29 days', '18:00:00', '21:30:00', false, NULL, 20.00, 550, 550, 'published', 'public', 'conference', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Denver Startup Pitch Night');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Oakland Cleantech Showcase', 'Demos from battery startups and heat-pump installers.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Bayview Bio-Lab Atrium' LIMIT 1), CURRENT_DATE + INTERVAL '31 days', '13:00:00', '18:00:00', true, 'Composting stations; bike valet.', 0.00, 400, 400, 'published', 'public', 'conference', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Oakland Cleantech Showcase');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Vancouver WA Bike Summit', 'Advocacy day for safe streets and e-bike incentives.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Cascadia Commons' LIMIT 1), CURRENT_DATE + INTERVAL '34 days', '09:30:00', '16:00:00', true, 'Bike valet; paperless agenda.', 15.00, 260, 260, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Vancouver WA Bike Summit');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Detroit EV Test Drive Day', 'Try latest EVs; talks on charging equity.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Great Lakes Expo Hall' LIMIT 1), CURRENT_DATE + INTERVAL '37 days', '10:00:00', '16:00:00', false, NULL, 0.00, 3500, 3500, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Detroit EV Test Drive Day');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Phoenix Water-Wise Landscaping Tour', 'Guided tour of xeriscape demos at arena grounds.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Sunbelt Arena' LIMIT 1), CURRENT_DATE + INTERVAL '40 days', '07:00:00', '11:00:00', false, NULL, 8.00, 2000, 2000, 'published', 'public', 'workshop', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Phoenix Water-Wise Landscaping Tour');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Boston Harbor Blue Economy Forum', 'Fisheries, offshore wind, and coastal resilience.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Atlantic Pier Pavilion' LIMIT 1), CURRENT_DATE + INTERVAL '43 days', '08:30:00', '17:00:00', true, 'Sea-level resilience theme; digital proceedings.', 120.00, 600, 600, 'published', 'public', 'conference', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Boston Harbor Blue Economy Forum');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Nashville Green Room Sessions', 'Songwriters circle with plant-based green room catering.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Music Row Studio Hall' LIMIT 1), CURRENT_DATE + INTERVAL '46 days', '20:00:00', '23:00:00', true, 'LED stage; local organic riders.', 55.00, 160, 160, 'published', 'public', 'music', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Nashville Green Room Sessions');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Mendocino Forest Sound Bath', 'Guided meditation and acoustic instruments among redwoods.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Redwood Retreat Lodge' LIMIT 1), CURRENT_DATE + INTERVAL '49 days', '16:00:00', '19:00:00', true, 'Dark-sky policy; carpool encouraged.', 40.00, 100, 100, 'published', 'public', 'workshop', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Mendocino Forest Sound Bath');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Minneapolis Barn Winter Market', 'Local crafts and hot cider in a geothermal-heated barn.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Prairie Wind Barn' LIMIT 1), CURRENT_DATE + INTERVAL '52 days', '12:00:00', '18:00:00', true, 'Geothermal venue; reusables deposit.', 0.00, 200, 200, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Minneapolis Barn Winter Market');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Tucson Desert Bloom Wedding Expo', 'Sustainable vendors for desert ceremonies.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Desert Bloom Gardens' LIMIT 1), CURRENT_DATE + INTERVAL '55 days', '10:00:00', '15:00:00', true, 'Xeriscape florals; shade sail demos.', 22.00, 380, 380, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Tucson Desert Bloom Wedding Expo');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'DC Green Roof Policy Breakfast', 'Briefings for staffers on incentives and stormwater credits.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Capitol Green Terrace' LIMIT 1), CURRENT_DATE + INTERVAL '58 days', '07:30:00', '09:30:00', true, 'Green roof host site; digital briefing book.', 0.00, 180, 180, 'published', 'public', 'conference', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'DC Green Roof Policy Breakfast');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Atlanta Park 5K and Festival', 'Chip-timed run and family festival; leave-no-trace pledge.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Piedmont Park North Meadow' LIMIT 1), CURRENT_DATE + INTERVAL '61 days', '07:00:00', '14:00:00', true, 'Park fund donation included; transit discount.', 35.00, 1400, 1400, 'published', 'public', 'sports', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Atlanta Park 5K and Festival');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Miami Solar Deck Sunrise Yoga', 'Morning flow with ocean breeze; mats provided.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Miami Beach Solar Deck' LIMIT 1), CURRENT_DATE + INTERVAL '64 days', '06:30:00', '08:00:00', true, 'Battery-backed sound; reef-safe sunscreen partner.', 25.00, 240, 240, 'published', 'public', 'workshop', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Miami Solar Deck Sunrise Yoga');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Milwaukee Loft Film Fest Shorts', 'Independent shorts; cash bar.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Lakeshore Loft' LIMIT 1), CURRENT_DATE + INTERVAL '67 days', '19:00:00', '23:00:00', false, NULL, 18.00, 300, 300, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Milwaukee Loft Film Fest Shorts');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Cupertino Climate Hackathon', '48-hour build with mentors from hardware and software.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Silicon Rotunda' LIMIT 1), CURRENT_DATE + INTERVAL '70 days', '09:00:00', '18:00:00', true, 'EV shuttle from transit; vegan meals.', 0.00, 750, 750, 'published', 'public', 'workshop', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Cupertino Climate Hackathon');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Denver Highland Farm Dinner', 'Long-table dinner with composting kitchen partners.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Highland Eco Lodge' LIMIT 1), CURRENT_DATE + INTERVAL '73 days', '17:00:00', '21:00:00', true, 'Local sourcing disclosure QR on each course.', 95.00, 180, 180, 'published', 'public', 'food', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Denver Highland Farm Dinner');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Portland Foundry Craft Fair', 'Weekend makers fair; industrial vibe.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Stumptown Foundry East' LIMIT 1), CURRENT_DATE + INTERVAL '76 days', '10:00:00', '18:00:00', false, NULL, 6.00, 420, 420, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Portland Foundry Craft Fair');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Chicago Gallery Gala', 'Silent auction benefiting urban tree planting.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'River North Gallery Hall' LIMIT 1), CURRENT_DATE + INTERVAL '79 days', '19:00:00', '23:30:00', false, NULL, 85.00, 260, 260, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Chicago Gallery Gala');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Charlotte Rail Jam Concert', 'Outdoor-adjacent hall; regional bands.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Charlotte Rail Yard Hall' LIMIT 1), CURRENT_DATE + INTERVAL '82 days', '18:00:00', '23:00:00', false, NULL, 32.00, 1050, 1050, 'published', 'public', 'music', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Charlotte Rail Jam Concert');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Cambridge Lab Open House', 'Public tours of cleantech labs; strict waste sorting demo.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Kendall Square Lab Atrium' LIMIT 1), CURRENT_DATE + INTERVAL '85 days', '10:00:00', '15:00:00', true, 'Waste sort stations; digital waivers.', 0.00, 320, 320, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Cambridge Lab Open House');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Pearl District Pop-Up Runway', 'Sustainable fashion pop-up and short runway.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Pearl District Brickworks' LIMIT 1), CURRENT_DATE + INTERVAL '88 days', '14:00:00', '19:00:00', false, NULL, 15.00, 360, 360, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Pearl District Pop-Up Runway');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Willamette Paddle Film Night', 'Short films on river conservation; boathouse venue.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Willamette River Boathouse' LIMIT 1), CURRENT_DATE + INTERVAL '91 days', '19:30:00', '22:00:00', true, 'Solar dock lights; digital program.', 12.00, 150, 150, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Willamette Paddle Film Night');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'SoMa Tech Meetup: AI and Energy', 'Evening talks; pizza sponsor.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'SoMa Flex Hall' LIMIT 1), CURRENT_DATE + INTERVAL '94 days', '18:00:00', '21:00:00', false, NULL, 0.00, 580, 580, 'published', 'public', 'conference', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'SoMa Tech Meetup: AI and Energy');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Gainesville Annex Acoustic Brunch', 'Sunday brunch sets on the annex stage.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Green Park Amphitheater (Annex)' LIMIT 1), CURRENT_DATE + INTERVAL '97 days', '11:00:00', '14:00:00', true, 'Eco-certified annex; reusables.', 20.00, 750, 750, 'published', 'public', 'music', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Gainesville Annex Acoustic Brunch');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Gainesville Amphitheater Folk Fest', 'Two-day folk and roots on the main lawn.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Green Park Amphitheater' LIMIT 1), CURRENT_DATE + INTERVAL '100 days', '12:00:00', '22:00:00', true, 'Paperless; recycling crew; local beer.', 55.00, 4800, 4800, 'published', 'public', 'music', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Gainesville Amphitheater Folk Fest');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Eco Convention Center Wellness Summit', 'Keynotes on workplace wellbeing and green offices.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Eco Convention Center' LIMIT 1), CURRENT_DATE + INTERVAL '103 days', '08:00:00', '17:00:00', true, 'LEED venue; digital badge.', 199.00, 1900, 1900, 'published', 'public', 'conference', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Eco Convention Center Wellness Summit');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Community Hall Open Mic', 'All-ages open mic; small donation at door.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Downtown Community Hall' LIMIT 1), CURRENT_DATE + INTERVAL '106 days', '18:00:00', '21:00:00', false, NULL, 5.00, 480, 480, 'published', 'public', 'music', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Community Hall Open Mic');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Circular Economy Workshop Tour', 'Hands-on repair and swap stations across two halls.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Green Canopy Hall' LIMIT 1), CURRENT_DATE + INTERVAL '109 days', '13:00:00', '17:00:00', true, 'Repair cafe; digital check-in.', 0.00, 900, 900, 'published', 'public', 'workshop', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Circular Economy Workshop Tour');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Seattle Youth Climate Strike Rally', 'Youth speakers and march staging; permits included.', (SELECT id FROM users WHERE email = 'bob.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Eco-Vista Center' LIMIT 1), CURRENT_DATE + INTERVAL '112 days', '15:00:00', '19:00:00', true, 'Sign-making with recycled cardboard; hydration stations.', 0.00, 340, 340, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Seattle Youth Climate Strike Rally');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Austin Plant Swap Saturday', 'Bring cuttings; take new plants; experts on native species.', (SELECT id FROM users WHERE email = 'john.organizer@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Renewable Roots Pavilion' LIMIT 1), CURRENT_DATE + INTERVAL '115 days', '09:00:00', '13:00:00', true, 'No single-use pots; digital plant list.', 0.00, 190, 190, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Austin Plant Swap Saturday');
INSERT INTO events (title, description, organizer_id, venue_id, event_date, event_start_time, event_end_time, is_eco_friendly, eco_summary, ticket_price, total_capacity, available_tickets, status, visibility, category, has_digital_ticketing, has_paperless_checkin) SELECT 'Chicago Winter Ball (Fundraiser)', 'Black-tie optional; proceeds to urban farms.', (SELECT id FROM users WHERE email = 'charlie.admin@eventleaf.com' LIMIT 1), (SELECT id FROM venues WHERE name = 'Earth-First Ballroom' LIMIT 1), CURRENT_DATE + INTERVAL '118 days', '18:00:00', '23:59:00', true, 'Carbon-neutral ops; digital auction paddles.', 250.00, 2000, 2000, 'published', 'public', 'community', true, true WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Chicago Winter Ball (Fundraiser)');

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

-- Baseline eco flags for other published eco-friendly events (Discover cards / API richness)
INSERT INTO event_eco_attributes (event_id, eco_attribute_id)
SELECT e.id, ea.id
FROM events e
CROSS JOIN eco_attributes ea
WHERE e.status = 'published'
  AND e.visibility = 'public'
  AND e.is_eco_friendly = true
  AND ea.name IN ('Paperless Ticketing', 'Digital Check-in')
  AND NOT EXISTS (
    SELECT 1 FROM event_eco_attributes x
    WHERE x.event_id = e.id AND x.eco_attribute_id = ea.id
  )
ON CONFLICT DO NOTHING;

-- Keep event ticketing/check-in booleans aligned with selected eco attributes.
-- This makes "Get Event" flags reflect what was chosen in the Create Event wizard.
UPDATE events e
SET
  has_digital_ticketing = EXISTS (
    SELECT 1
    FROM event_eco_attributes eea
    JOIN eco_attributes ea ON ea.id = eea.eco_attribute_id
    WHERE eea.event_id = e.id AND ea.name = 'Paperless Ticketing'
  ),
  has_paperless_checkin = EXISTS (
    SELECT 1
    FROM event_eco_attributes eea
    JOIN eco_attributes ea ON ea.id = eea.eco_attribute_id
    WHERE eea.event_id = e.id AND ea.name = 'Digital Check-in'
  )
WHERE e.status IN ('published', 'draft');

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

-- Demo login for JWT cookie auth (plaintext password: "password").
-- Hash generated with: go run ./cmd/hashpassword password
-- Re-applies hash on conflict so re-seeding fixes a bad manual INSERT.
INSERT INTO users (username, email, password_hash, first_name, last_name, is_organizer, is_eco_conscious, bio)
VALUES (
    'demouser',
    'demo@login.com',
    '$2a$10$AGYEHdFAFySltJc6l5QcsenFWHkSUW0C/ZC/idD2TXaEJucoEy/By',
    'Demo',
    'User',
    true,
    true,
    'Local dev login — password is "password" (see seed comment).'
)
ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
