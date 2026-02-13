-- EventLeaf Database Schema
-- PostgreSQL database schema for the EventLeaf eco-focused event management platform

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
-- Stores user account information for both organizers and attendees
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_organizer BOOLEAN DEFAULT false,
    is_eco_conscious BOOLEAN DEFAULT false,
    bio TEXT,
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_organizer ON users(is_organizer);

-- Venues Table
-- Stores venue information for events with eco-certification tracking
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2),
    zip_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website_url VARCHAR(500),
    is_eco_certified BOOLEAN DEFAULT false,
    eco_certifications TEXT[],
    has_public_transit BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_accessible_facilities BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_is_eco_certified ON venues(is_eco_certified);

-- Eco Attributes Table
-- Predefined sustainability practices and eco-friendly features
CREATE TABLE eco_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- 'sustainability_practice', 'venue_feature', 'transportation'
    description TEXT,
    icon_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eco_attributes_category ON eco_attributes(category);

-- Events Table
-- Stores event information with eco-friendly attributes
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    event_start_time TIME NOT NULL,
    event_end_time TIME NOT NULL,
    is_eco_friendly BOOLEAN DEFAULT false,
    eco_summary TEXT,
    ticket_price DECIMAL(10, 2) NOT NULL CHECK (ticket_price >= 0),
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    available_tickets INTEGER NOT NULL CHECK (available_tickets >= 0),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'cancelled', 'completed'
    visibility VARCHAR(50) DEFAULT 'public', -- 'public', 'private', 'invite_only'
    image_url VARCHAR(500),
    event_url VARCHAR(500),
    category VARCHAR(100), -- 'music', 'sports', 'conference', 'food', etc.
    has_digital_ticketing BOOLEAN DEFAULT true,
    has_paperless_checkin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_times CHECK (event_end_time > event_start_time),
    CONSTRAINT valid_date CHECK (event_date >= CURRENT_DATE)
);

CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_is_eco_friendly ON events(is_eco_friendly);
CREATE INDEX idx_events_status ON events(status);

-- Event Eco Attributes Junction Table
-- Links events with multiple eco-friendly attributes
CREATE TABLE event_eco_attributes (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    eco_attribute_id UUID NOT NULL REFERENCES eco_attributes(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, eco_attribute_id)
);

-- Tickets Table
-- Represents individual tickets purchased for events
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    ticket_number VARCHAR(100) UNIQUE NOT NULL, -- QR code identifier
    ticket_type VARCHAR(50) DEFAULT 'general', -- 'general', 'vip', 'early_bird'
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'used', 'refunded', 'cancelled'
    price_paid DECIMAL(10, 2) NOT NULL CHECK (price_paid >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Check-ins Table
-- Tracks attendance through QR code scans and manual check-ins
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_in_method VARCHAR(50) NOT NULL, -- 'qr_scan', 'manual'
    checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

CREATE INDEX idx_check_ins_ticket_id ON check_ins(ticket_id);
CREATE INDEX idx_check_ins_event_id ON check_ins(event_id);
CREATE INDEX idx_check_ins_checked_in_at ON check_ins(checked_in_at);

-- Event Reviews Table
-- Allows attendees to review events and provide sustainability feedback
CREATE TABLE event_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    eco_rating INTEGER CHECK (eco_rating >= 1 AND eco_rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, event_id)
);

CREATE INDEX idx_event_reviews_user_id ON event_reviews(user_id);
CREATE INDEX idx_event_reviews_event_id ON event_reviews(event_id);

-- Event Attendees List (for tracking who attended)
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance_status VARCHAR(50) DEFAULT 'registered', -- 'registered', 'attended', 'no_show'
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON event_attendees(user_id);

-- User Favorites Table
-- Allows users to save favorite events for later
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, event_id)
);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_event_id ON user_favorites(event_id);

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_reviews_updated_at BEFORE UPDATE ON event_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for eco attributes
INSERT INTO eco_attributes (name, category, description) VALUES
    ('Paperless Ticketing', 'sustainability_practice', 'Digital tickets only, no printed passes'),
    ('Digital Check-in', 'sustainability_practice', 'QR code based attendance tracking'),
    ('Waste Reduction Program', 'sustainability_practice', 'Organized recycling and composting during event'),
    ('Carbon Neutral Transport', 'transportation', 'Event supports carpooling or public transit'),
    ('Local Vendors', 'sustainability_practice', 'Food and beverages from local sustainable sources'),
    ('Eco-Certified Venue', 'venue_feature', 'Venue holds environmental certifications'),
    ('Public Transit Access', 'venue_feature', 'Venue accessible via public transportation'),
    ('Renewable Energy', 'venue_feature', 'Venue powered by renewable energy sources'),
    ('Water Conservation', 'sustainability_practice', 'Water-efficient practices at venue'),
    ('Zero Single-Use Plastics', 'sustainability_practice', 'No single-use plastic items at event'),
    ('Tree Planting Offset', 'sustainability_practice', 'Event contributes to tree planting initiatives'),
    ('Accessibility Features', 'venue_feature', 'ADA compliant facilities and services');
