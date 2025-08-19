-- Pink Auto Glass Leads Database Schema
-- PostgreSQL 14+ compatible
-- Created: 2024-01-19
-- Purpose: Store customer leads from booking flow

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE service_type AS ENUM (
    'windshield_repair',
    'windshield_replacement'
);

CREATE TYPE lead_status AS ENUM (
    'new',
    'contacted', 
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'lost'
);

CREATE TYPE lead_source AS ENUM (
    'website_booking',
    'phone',
    'referral',
    'google_ads',
    'facebook_ads',
    'organic_search',
    'other'
);

CREATE TYPE appointment_status AS ENUM (
    'pending',
    'confirmed',
    'in_progress', 
    'completed',
    'cancelled',
    'rescheduled'
);

CREATE TYPE contact_preference AS ENUM (
    'morning',
    'afternoon',
    'evening',
    'anytime'
);

-- Main leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Service information
    service_type service_type NOT NULL,
    mobile_service BOOLEAN NOT NULL DEFAULT false,
    
    -- Customer information
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    best_time_to_call contact_preference,
    
    -- Vehicle information
    vehicle_year INTEGER NOT NULL CHECK (vehicle_year >= 1990 AND vehicle_year <= 2030),
    vehicle_make VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    
    -- Location information
    street_address VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state CHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Scheduling preferences
    preferred_date DATE,
    preferred_time_start TIME,
    preferred_time_end TIME,
    flexible_scheduling BOOLEAN DEFAULT false,
    
    -- Additional information
    damage_description TEXT,
    estimated_cost DECIMAL(8, 2),
    final_cost DECIMAL(8, 2),
    
    -- Communication preferences
    sms_consent BOOLEAN NOT NULL DEFAULT false,
    email_consent BOOLEAN DEFAULT true,
    sms_opt_out_date TIMESTAMP WITH TIME ZONE,
    
    -- Lead tracking
    status lead_status NOT NULL DEFAULT 'new',
    source lead_source NOT NULL DEFAULT 'website_booking',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100), 
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    first_contacted_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes and follow-up
    notes TEXT,
    follow_up_date DATE,
    assigned_to VARCHAR(50),
    
    -- Insurance information
    insurance_company VARCHAR(100),
    claim_number VARCHAR(50),
    deductible DECIMAL(6, 2),
    
    CONSTRAINT valid_phone CHECK (phone ~ '^\(\d{3}\) \d{3}-\d{4}$'),
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    CONSTRAINT valid_zip CHECK (zip_code ~ '^\d{5}(-\d{4})?$'),
    CONSTRAINT valid_state CHECK (LENGTH(state) = 2),
    CONSTRAINT valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR
        (latitude IS NOT NULL AND longitude IS NOT NULL AND 
         latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- Appointments table (one-to-many with leads)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Appointment details
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    
    -- Technician assignment
    technician_name VARCHAR(100),
    technician_phone VARCHAR(20),
    technician_email VARCHAR(100),
    
    -- Address (can override lead address)
    service_address TEXT,
    service_city VARCHAR(50),
    service_state CHAR(2),
    service_zip VARCHAR(10),
    service_latitude DECIMAL(10, 8),
    service_longitude DECIMAL(11, 8),
    
    -- Status tracking
    status appointment_status NOT NULL DEFAULT 'pending',
    confirmed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Service details
    actual_service_type service_type,
    work_description TEXT,
    materials_used TEXT,
    warranty_months INTEGER DEFAULT 12,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Notes
    notes TEXT,
    cancellation_reason TEXT,
    reschedule_reason TEXT,
    
    CONSTRAINT valid_appointment_time CHECK (end_time > start_time),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 480),
    CONSTRAINT future_appointment CHECK (appointment_date >= CURRENT_DATE)
);

-- Communication log table
CREATE TABLE lead_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Communication details
    communication_type VARCHAR(20) NOT NULL CHECK (communication_type IN ('sms', 'email', 'phone', 'in_person')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    
    -- Message details
    subject VARCHAR(200),
    message TEXT,
    template_name VARCHAR(100),
    
    -- Contact information
    from_number VARCHAR(20),
    to_number VARCHAR(20), 
    from_email VARCHAR(100),
    to_email VARCHAR(100),
    
    -- Status tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    
    -- External IDs
    twilio_message_sid VARCHAR(50),
    email_message_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    metadata JSONB
);

-- Lead activities table (audit trail)
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    
    -- User tracking
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    user_email VARCHAR(100),
    
    -- System tracking
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_leads_reference_number ON leads(reference_number);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_service_type ON leads(service_type);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_follow_up_date ON leads(follow_up_date);

-- Composite indexes for common queries
CREATE INDEX idx_leads_status_created ON leads(status, created_at);
CREATE INDEX idx_leads_source_created ON leads(source, created_at);
CREATE INDEX idx_leads_location ON leads(zip_code, city, state);

-- Appointments indexes
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_technician ON appointments(technician_name);
CREATE INDEX idx_appointments_date_status ON appointments(appointment_date, status);

-- Communications indexes
CREATE INDEX idx_communications_lead_id ON lead_communications(lead_id);
CREATE INDEX idx_communications_type ON lead_communications(communication_type);
CREATE INDEX idx_communications_created ON lead_communications(created_at);
CREATE INDEX idx_communications_twilio_sid ON lead_communications(twilio_message_sid);

-- Activities indexes  
CREATE INDEX idx_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_activities_created ON lead_activities(created_at);

-- Full text search indexes
CREATE INDEX idx_leads_search ON leads USING gin(
    to_tsvector('english', 
        COALESCE(first_name, '') || ' ' ||
        COALESCE(last_name, '') || ' ' ||
        COALESCE(vehicle_make, '') || ' ' ||
        COALESCE(vehicle_model, '') || ' ' ||
        COALESCE(damage_description, '')
    )
);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    reference TEXT;
    counter INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get next sequence number for the year
    SELECT COUNT(*) + 1 
    INTO counter 
    FROM leads 
    WHERE reference_number LIKE 'QT-' || year_part || '-%';
    
    sequence_part := LPAD(counter::TEXT, 4, '0');
    reference := 'QT-' || year_part || '-' || sequence_part;
    
    RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference numbers
CREATE OR REPLACE FUNCTION set_reference_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
        NEW.reference_number := generate_reference_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leads_reference_number
    BEFORE INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION set_reference_number();

-- Lead activity logging trigger
CREATE OR REPLACE FUNCTION log_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO lead_activities (lead_id, activity_type, description, old_value, new_value)
        VALUES (NEW.id, 'status_change', 'Lead status changed', OLD.status, NEW.status);
    END IF;
    
    -- Log assignment changes
    IF TG_OP = 'UPDATE' AND (OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL) THEN
        INSERT INTO lead_activities (lead_id, activity_type, description, new_value)
        VALUES (NEW.id, 'assigned', 'Lead assigned to team member', NEW.assigned_to);
    END IF;
    
    -- Log first contact
    IF TG_OP = 'UPDATE' AND OLD.first_contacted_at IS NULL AND NEW.first_contacted_at IS NOT NULL THEN
        INSERT INTO lead_activities (lead_id, activity_type, description)
        VALUES (NEW.id, 'first_contact', 'First contact made with customer');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_leads_activity
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_activity();

-- Views for common queries

-- Active leads view
CREATE VIEW active_leads AS
SELECT 
    l.*,
    a.appointment_date,
    a.start_time,
    a.technician_name
FROM leads l
LEFT JOIN appointments a ON l.id = a.lead_id AND a.status = 'confirmed'
WHERE l.status IN ('new', 'contacted', 'scheduled', 'in_progress');

-- Lead summary view
CREATE VIEW lead_summary AS
SELECT 
    l.id,
    l.reference_number,
    l.first_name || ' ' || l.last_name AS customer_name,
    l.phone,
    l.service_type,
    l.vehicle_year || ' ' || l.vehicle_make || ' ' || l.vehicle_model AS vehicle,
    l.status,
    l.created_at,
    l.estimated_cost,
    COUNT(a.id) AS appointment_count
FROM leads l
LEFT JOIN appointments a ON l.id = a.lead_id
GROUP BY l.id, l.reference_number, l.first_name, l.last_name, 
         l.phone, l.service_type, l.vehicle_year, l.vehicle_make, 
         l.vehicle_model, l.status, l.created_at, l.estimated_cost;

-- Daily appointments view
CREATE VIEW daily_appointments AS
SELECT 
    a.*,
    l.first_name || ' ' || l.last_name AS customer_name,
    l.phone AS customer_phone,
    l.service_type,
    l.vehicle_year || ' ' || l.vehicle_make || ' ' || l.vehicle_model AS vehicle
FROM appointments a
JOIN leads l ON a.lead_id = l.id
WHERE a.appointment_date >= CURRENT_DATE
ORDER BY a.appointment_date, a.start_time;

-- Performance metrics view
CREATE VIEW lead_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS total_leads,
    COUNT(*) FILTER (WHERE status = 'converted') AS converted_leads,
    COUNT(*) FILTER (WHERE source = 'website_booking') AS website_leads,
    COUNT(*) FILTER (WHERE service_type = 'windshield_repair') AS repair_leads,
    COUNT(*) FILTER (WHERE service_type = 'windshield_replacement') AS replacement_leads,
    AVG(estimated_cost) FILTER (WHERE estimated_cost IS NOT NULL) AS avg_estimated_cost
FROM leads
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;

-- Grant permissions (adjust role names as needed)
-- GRANT SELECT, INSERT, UPDATE ON leads TO booking_app;
-- GRANT SELECT, INSERT, UPDATE ON appointments TO booking_app;
-- GRANT SELECT, INSERT ON lead_communications TO booking_app;
-- GRANT SELECT, INSERT ON lead_activities TO booking_app;
-- GRANT SELECT ON active_leads, lead_summary, daily_appointments TO booking_app;

-- Sample data (for development/testing)
-- INSERT INTO leads (
--     reference_number, service_type, mobile_service,
--     first_name, last_name, phone, email,
--     vehicle_year, vehicle_make, vehicle_model,
--     street_address, city, state, zip_code,
--     sms_consent, status, source
-- ) VALUES (
--     'QT-2024-0001', 'windshield_repair', true,
--     'John', 'Smith', '(555) 123-4567', 'john@example.com',
--     2019, 'Honda', 'Civic',
--     '123 Main Street', 'Anytown', 'CA', '90210',
--     true, 'new', 'website_booking'
-- );

-- Database maintenance procedures

-- Procedure to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_leads(retention_months INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM leads 
    WHERE status IN ('lost', 'cancelled') 
    AND created_at < CURRENT_TIMESTAMP - INTERVAL '1 month' * retention_months;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Procedure to archive completed leads
CREATE OR REPLACE FUNCTION archive_completed_leads(archive_after_months INTEGER DEFAULT 12)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- This would typically move data to an archive table
    -- For now, just update a flag or extend retention
    UPDATE leads 
    SET notes = COALESCE(notes, '') || ' [ARCHIVED ' || CURRENT_DATE || ']'
    WHERE status = 'completed' 
    AND updated_at < CURRENT_TIMESTAMP - INTERVAL '1 month' * archive_after_months
    AND notes NOT LIKE '%[ARCHIVED%';
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;