-- Run this ONCE if your database already existed before the google_calendar table was added.
-- Safe to run again if the table already exists (uses IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS google_calendar_event_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    google_event_id VARCHAR(255) NOT NULL,
    calendar_id VARCHAR(255) NOT NULL,
    html_link VARCHAR(500),
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_google_calendar_mappings_event_id ON google_calendar_event_mappings(event_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_mappings_google_event_id ON google_calendar_event_mappings(google_event_id);

DROP TRIGGER IF EXISTS update_google_calendar_event_mappings_updated_at ON google_calendar_event_mappings;
CREATE TRIGGER update_google_calendar_event_mappings_updated_at
    BEFORE UPDATE ON google_calendar_event_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
