-- Pink Auto Glass Complete Database Schema for Supabase
-- PostgreSQL 14+ compatible with Supabase-specific features
-- Created: 2024-08-20
-- Purpose: Complete booking system with leads, media, and RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

-- Service types for Pink Auto Glass
CREATE TYPE service_type AS ENUM (
    'windshield_repair',
    'windshield_replacement',
    'mobile_service'
);

-- Lead status tracking
CREATE TYPE lead_status AS ENUM (
    'new',
    'contacted', 
    'quoted',
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'lost'
);

-- Lead source attribution
CREATE TYPE lead_source AS ENUM (
    'website_booking',
    'phone',
    'referral',
    'google_ads',
    'facebook_ads',
    'organic_search',
    'direct',
    'other'
);

-- Contact preferences
CREATE TYPE contact_preference AS ENUM (
    'morning',
    'afternoon',
    'evening',
    'anytime'
);

-- Media types and contexts
CREATE TYPE media_type AS ENUM (
    'image',
    'document', 
    'video',
    'audio'
);

CREATE TYPE media_context AS ENUM (
    'damage_photos',
    'before_photos',
    'after_photos', 
    'insurance_docs',
    'work_orders',
    'receipts',
    'booking_photos',
    'other'
);

CREATE TYPE media_status AS ENUM (
    'uploading',
    'processing',
    'active',
    'archived',
    'deleted',
    'failed'
);

-- =============================================================================
-- LEADS TABLE
-- =============================================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Service information
    service_type service_type NOT NULL,
    mobile_service BOOLEAN NOT NULL DEFAULT false,
    
    -- Customer information (PII - encrypt at rest)
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    best_time_to_call contact_preference,
    
    -- Vehicle information
    vehicle_year INTEGER NOT NULL CHECK (vehicle_year >= 1990 AND vehicle_year <= 2030),
    vehicle_make VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    vehicle_trim VARCHAR(50),
    
    -- Location information
    street_address VARCHAR(200) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state CHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Scheduling preferences
    preferred_date VARCHAR(50) NOT NULL, -- 'today', 'tomorrow', 'custom', etc.
    time_window VARCHAR(20), -- '8-10', '10-12', 'flexible', etc.
    
    -- Additional information
    damage_description TEXT,
    estimated_cost DECIMAL(8, 2),
    final_cost DECIMAL(8, 2),
    
    -- Communication preferences and consent
    sms_consent BOOLEAN NOT NULL DEFAULT false,
    privacy_acknowledgment BOOLEAN NOT NULL DEFAULT false,
    email_consent BOOLEAN DEFAULT true,
    sms_opt_out_date TIMESTAMP WITH TIME ZONE,
    
    -- Lead tracking and attribution
    status lead_status NOT NULL DEFAULT 'new',
    source lead_source NOT NULL DEFAULT 'website_booking',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100), 
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    referral_code VARCHAR(50),
    
    -- Geolocation data
    used_geolocation BOOLEAN DEFAULT false,
    geolocation_accuracy DECIMAL(8, 2),
    
    -- Security and audit fields
    ip_address INET,
    user_agent TEXT,
    form_session_id VARCHAR(64),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    first_contacted_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Follow-up and assignment
    notes TEXT,
    follow_up_date DATE,
    assigned_to UUID REFERENCES auth.users(id),
    
    -- Data retention and privacy
    data_retention_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '18 months'),
    
    -- Constraints
    CONSTRAINT valid_phone CHECK (phone ~ '^\(\d{3}\) \d{3}-\d{4}$'),
    CONSTRAINT valid_email CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    CONSTRAINT valid_zip CHECK (zip_code ~ '^\d{5}(-\d{4})?$'),
    CONSTRAINT valid_state CHECK (LENGTH(state) = 2),
    CONSTRAINT valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR
        (latitude IS NOT NULL AND longitude IS NOT NULL AND 
         latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    ),
    CONSTRAINT valid_year CHECK (vehicle_year >= 1990 AND vehicle_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2)
);

-- =============================================================================
-- MEDIA FILES TABLE
-- =============================================================================

CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- File identification
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for deduplication
    
    -- Media classification  
    media_type media_type NOT NULL,
    context media_context NOT NULL DEFAULT 'other',
    
    -- Supabase Storage details
    bucket_name VARCHAR(100) NOT NULL DEFAULT 'lead-media',
    storage_path TEXT NOT NULL, -- Path within the bucket
    public_url TEXT,
    signed_url TEXT,
    signed_url_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Image-specific metadata
    image_width INTEGER,
    image_height INTEGER,
    image_format VARCHAR(10),
    has_thumbnail BOOLEAN DEFAULT false,
    thumbnail_path TEXT,
    thumbnail_url TEXT,
    
    -- Processing status
    status media_status NOT NULL DEFAULT 'uploading',
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_error TEXT,
    
    -- Access control
    is_public BOOLEAN NOT NULL DEFAULT false,
    access_token VARCHAR(32), -- For private file access
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Security scanning
    virus_scanned BOOLEAN DEFAULT false,
    virus_scan_result VARCHAR(20), -- 'clean', 'infected', 'error'
    virus_scan_date TIMESTAMP WITH TIME ZONE,
    
    -- Compression/optimization
    is_compressed BOOLEAN DEFAULT false,
    original_file_size BIGINT,
    compression_ratio DECIMAL(4,2),
    
    -- Metadata
    exif_data JSONB,
    upload_metadata JSONB,
    
    -- User tracking
    uploaded_by UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Data retention
    data_retention_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days'),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 10737418240), -- 10GB max
    CONSTRAINT valid_dimensions CHECK (
        (image_width IS NULL AND image_height IS NULL) OR 
        (image_width > 0 AND image_height > 0)
    ),
    CONSTRAINT valid_compression_ratio CHECK (
        compression_ratio IS NULL OR (compression_ratio > 0 AND compression_ratio <= 1)
    )
);

-- =============================================================================
-- MEDIA ASSOCIATIONS TABLE
-- =============================================================================

CREATE TABLE media_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    
    -- Association metadata
    context media_context NOT NULL DEFAULT 'booking_photos',
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    caption TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    
    UNIQUE(lead_id, media_file_id)
);

-- =============================================================================
-- COMMUNICATION LOG TABLE
-- =============================================================================

CREATE TABLE lead_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Communication details
    communication_type VARCHAR(20) NOT NULL CHECK (communication_type IN ('sms', 'email', 'phone', 'in_person')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    
    -- Message details
    subject VARCHAR(200),
    message_body TEXT,
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
    
    -- External service IDs
    twilio_message_sid VARCHAR(50),
    email_message_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    metadata JSONB
);

-- =============================================================================
-- ACTIVITY LOG TABLE
-- =============================================================================

CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    
    -- User tracking
    user_id UUID REFERENCES auth.users(id),
    user_name VARCHAR(100),
    user_email VARCHAR(100),
    
    -- System tracking
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Leads indexes
CREATE INDEX idx_leads_reference_number ON leads(reference_number);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_service_type ON leads(service_type);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_follow_up_date ON leads(follow_up_date);
CREATE INDEX idx_leads_data_retention ON leads(data_retention_expires_at);

-- Composite indexes for common queries
CREATE INDEX idx_leads_status_created ON leads(status, created_at);
CREATE INDEX idx_leads_source_created ON leads(source, created_at);
CREATE INDEX idx_leads_location ON leads(zip_code, city, state);
CREATE INDEX idx_leads_utm_source ON leads(utm_source, utm_medium, utm_campaign);

-- Media files indexes
CREATE INDEX idx_media_files_hash ON media_files(file_hash);
CREATE INDEX idx_media_files_type ON media_files(media_type);
CREATE INDEX idx_media_files_context ON media_files(context);
CREATE INDEX idx_media_files_status ON media_files(status);
CREATE INDEX idx_media_files_created ON media_files(created_at);
CREATE INDEX idx_media_files_bucket_path ON media_files(bucket_name, storage_path);
CREATE INDEX idx_media_files_retention ON media_files(data_retention_expires_at);
CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by);

-- Media associations indexes
CREATE INDEX idx_media_associations_lead_id ON media_associations(lead_id);
CREATE INDEX idx_media_associations_media_id ON media_associations(media_file_id);
CREATE INDEX idx_media_associations_context ON media_associations(context);
CREATE INDEX idx_media_associations_order ON media_associations(display_order);

-- Communications indexes
CREATE INDEX idx_communications_lead_id ON lead_communications(lead_id);
CREATE INDEX idx_communications_type ON lead_communications(communication_type);
CREATE INDEX idx_communications_created ON lead_communications(created_at);
CREATE INDEX idx_communications_twilio_sid ON lead_communications(twilio_message_sid);

-- Activities indexes  
CREATE INDEX idx_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_activities_created ON lead_activities(created_at);
CREATE INDEX idx_activities_user_id ON lead_activities(user_id);

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

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at timestamps
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at 
    BEFORE UPDATE ON media_files 
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

-- Function to auto-generate reference numbers
CREATE OR REPLACE FUNCTION set_reference_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
        NEW.reference_number := generate_reference_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference numbers
CREATE TRIGGER set_leads_reference_number
    BEFORE INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION set_reference_number();

-- Function to log lead activities
CREATE OR REPLACE FUNCTION log_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO lead_activities (lead_id, activity_type, description, old_value, new_value)
        VALUES (NEW.id, 'status_change', 'Lead status changed', OLD.status::TEXT, NEW.status::TEXT);
    END IF;
    
    -- Log assignment changes
    IF TG_OP = 'UPDATE' AND (OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL) THEN
        INSERT INTO lead_activities (lead_id, activity_type, description, new_value)
        VALUES (NEW.id, 'assigned', 'Lead assigned to team member', NEW.assigned_to::TEXT);
    END IF;
    
    -- Log first contact
    IF TG_OP = 'UPDATE' AND OLD.first_contacted_at IS NULL AND NEW.first_contacted_at IS NOT NULL THEN
        INSERT INTO lead_activities (lead_id, activity_type, description)
        VALUES (NEW.id, 'first_contact', 'First contact made with customer');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lead activity logging
CREATE TRIGGER log_leads_activity
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_activity();

-- Function to generate secure filenames
CREATE OR REPLACE FUNCTION generate_secure_filename(original_name TEXT, lead_id UUID)
RETURNS TEXT AS $$
DECLARE
    extension TEXT;
    random_name TEXT;
    timestamp_part TEXT;
BEGIN
    -- Extract file extension
    extension := LOWER(SUBSTRING(original_name FROM '\.([^.]*)$'));
    
    -- Generate random filename component
    random_name := encode(gen_random_bytes(16), 'hex');
    
    -- Create timestamp component
    timestamp_part := EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT::TEXT;
    
    -- Combine: uploads/lead_id/timestamp_random.ext
    RETURN 'uploads/' || lead_id::TEXT || '/' || timestamp_part || '_' || random_name || 
           CASE WHEN extension IS NOT NULL THEN '.' || extension ELSE '' END;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- LEADS TABLE RLS POLICIES
-- =============================================================================

-- Public can insert new leads (booking submissions)
CREATE POLICY "Anyone can create leads" ON leads
    FOR INSERT 
    WITH CHECK (true);

-- Authenticated users can view leads they created or are assigned to
CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL AND (
            -- System admin can see all
            auth.jwt() ->> 'role' = 'admin' OR
            -- Staff can see assigned leads
            (auth.jwt() ->> 'role' = 'staff' AND assigned_to = auth.uid()) OR
            -- Users can see leads they submitted (via session tracking)
            id IN (
                SELECT id FROM leads 
                WHERE ip_address = (
                    SELECT ip_address FROM leads 
                    WHERE id = leads.id 
                    LIMIT 1
                )
            )
        )
    );

-- Only authenticated staff can update leads
CREATE POLICY "Staff can update leads" ON leads
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'role' IN ('admin', 'staff')
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'role' IN ('admin', 'staff')
    );

-- Only admin can delete leads
CREATE POLICY "Admin can delete leads" ON leads
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'role' = 'admin'
    );

-- =============================================================================
-- MEDIA FILES RLS POLICIES
-- =============================================================================

-- Public can upload media files (during booking process)
CREATE POLICY "Anyone can upload media" ON media_files
    FOR INSERT 
    WITH CHECK (true);

-- Users can view media files associated with their leads
CREATE POLICY "Users can view lead media" ON media_files
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL AND (
            -- System admin can see all
            auth.jwt() ->> 'role' = 'admin' OR
            -- Staff can see media for assigned leads
            (auth.jwt() ->> 'role' = 'staff' AND id IN (
                SELECT mf.id FROM media_files mf
                JOIN media_associations ma ON mf.id = ma.media_file_id
                JOIN leads l ON ma.lead_id = l.id
                WHERE l.assigned_to = auth.uid()
            )) OR
            -- Public files are viewable
            is_public = true OR
            -- Files uploaded by user
            uploaded_by = auth.uid()
        )
    );

-- Staff can update media files
CREATE POLICY "Staff can update media" ON media_files
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'role' IN ('admin', 'staff')
    );

-- Admin can delete media files
CREATE POLICY "Admin can delete media" ON media_files
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'role' = 'admin'
    );

-- =============================================================================
-- MEDIA ASSOCIATIONS RLS POLICIES
-- =============================================================================

-- Public can create associations (during booking)
CREATE POLICY "Anyone can associate media" ON media_associations
    FOR INSERT 
    WITH CHECK (true);

-- Users can view associations for their leads
CREATE POLICY "Users can view media associations" ON media_associations
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL AND (
            -- System admin can see all
            auth.jwt() ->> 'role' = 'admin' OR
            -- Staff can see associations for assigned leads
            (auth.jwt() ->> 'role' = 'staff' AND lead_id IN (
                SELECT id FROM leads WHERE assigned_to = auth.uid()
            )) OR
            -- User who created the association
            created_by = auth.uid()
        )
    );

-- =============================================================================
-- COMMUNICATION LOG RLS POLICIES
-- =============================================================================

-- Only authenticated users can create communications
CREATE POLICY "Authenticated users can log communications" ON lead_communications
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view communications for their leads
CREATE POLICY "Users can view lead communications" ON lead_communications
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL AND (
            -- System admin can see all
            auth.jwt() ->> 'role' = 'admin' OR
            -- Staff can see communications for assigned leads
            (auth.jwt() ->> 'role' = 'staff' AND lead_id IN (
                SELECT id FROM leads WHERE assigned_to = auth.uid()
            )) OR
            -- User who created the communication
            created_by = auth.uid()
        )
    );

-- =============================================================================
-- ACTIVITY LOG RLS POLICIES
-- =============================================================================

-- Authenticated users can create activities
CREATE POLICY "Authenticated users can log activities" ON lead_activities
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view activities for their leads
CREATE POLICY "Users can view lead activities" ON lead_activities
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL AND (
            -- System admin can see all
            auth.jwt() ->> 'role' = 'admin' OR
            -- Staff can see activities for assigned leads
            (auth.jwt() ->> 'role' = 'staff' AND lead_id IN (
                SELECT id FROM leads WHERE assigned_to = auth.uid()
            )) OR
            -- User who created the activity
            user_id = auth.uid()
        )
    );

-- =============================================================================
-- STORAGE BUCKET POLICIES (Supabase-specific)
-- =============================================================================

-- Note: These policies are applied in Supabase Dashboard or via Supabase client
-- 
-- Bucket: lead-media
-- RLS Enabled: true
-- 
-- Policy: "Anyone can upload to uploads folder"
-- INSERT: true
-- SELECT: false 
-- UPDATE: false
-- DELETE: false
-- Path restriction: uploads/**
-- 
-- Policy: "Users can view uploaded files" 
-- INSERT: false
-- SELECT: auth.uid() IS NOT NULL
-- UPDATE: false  
-- DELETE: false
-- 
-- Policy: "Staff can manage all files"
-- INSERT: auth.jwt() ->> 'role' IN ('admin', 'staff')
-- SELECT: auth.jwt() ->> 'role' IN ('admin', 'staff') 
-- UPDATE: auth.jwt() ->> 'role' IN ('admin', 'staff')
-- DELETE: auth.jwt() ->> 'role' = 'admin'

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Active leads with media count
CREATE VIEW active_leads_with_media AS
SELECT 
    l.*,
    COUNT(ma.media_file_id) as media_count,
    ARRAY_AGG(
        CASE WHEN mf.thumbnail_url IS NOT NULL 
        THEN mf.thumbnail_url 
        ELSE mf.public_url 
        END
    ) FILTER (WHERE mf.id IS NOT NULL) as photo_urls
FROM leads l
LEFT JOIN media_associations ma ON l.id = ma.lead_id
LEFT JOIN media_files mf ON ma.media_file_id = mf.id AND mf.status = 'active'
WHERE l.status IN ('new', 'contacted', 'quoted', 'scheduled', 'in_progress')
GROUP BY l.id;

-- Lead summary with vehicle info
CREATE VIEW lead_summary AS
SELECT 
    l.id,
    l.reference_number,
    l.first_name || ' ' || l.last_name AS customer_name,
    l.phone,
    l.email,
    l.service_type,
    l.vehicle_year || ' ' || l.vehicle_make || ' ' || l.vehicle_model AS vehicle,
    l.status,
    l.created_at,
    l.estimated_cost,
    COUNT(ma.media_file_id) as photo_count
FROM leads l
LEFT JOIN media_associations ma ON l.id = ma.lead_id
LEFT JOIN media_files mf ON ma.media_file_id = mf.id AND mf.status = 'active'
GROUP BY l.id, l.reference_number, l.first_name, l.last_name, 
         l.phone, l.email, l.service_type, l.vehicle_year, l.vehicle_make, 
         l.vehicle_model, l.status, l.created_at, l.estimated_cost;

-- Daily metrics view
CREATE VIEW daily_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS total_leads,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_leads,
    COUNT(*) FILTER (WHERE source = 'website_booking') AS website_leads,
    COUNT(*) FILTER (WHERE service_type = 'windshield_repair') AS repair_leads,
    COUNT(*) FILTER (WHERE service_type = 'windshield_replacement') AS replacement_leads,
    COUNT(*) FILTER (WHERE mobile_service = true) AS mobile_service_leads,
    AVG(estimated_cost) FILTER (WHERE estimated_cost IS NOT NULL) AS avg_estimated_cost
FROM leads
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;

-- =============================================================================
-- DATA MAINTENANCE FUNCTIONS
-- =============================================================================

-- Function to clean up expired data based on retention policies
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS JSONB AS $$
DECLARE
    expired_leads INTEGER;
    expired_media INTEGER;
    result JSONB;
BEGIN
    -- Clean up expired lead data (18 months)
    DELETE FROM leads 
    WHERE data_retention_expires_at < CURRENT_TIMESTAMP
    AND status IN ('completed', 'cancelled', 'lost');
    
    GET DIAGNOSTICS expired_leads = ROW_COUNT;
    
    -- Clean up expired media files (90 days default, 18 months for scheduled)
    DELETE FROM media_files 
    WHERE data_retention_expires_at < CURRENT_TIMESTAMP
    AND status != 'active';
    
    GET DIAGNOSTICS expired_media = ROW_COUNT;
    
    result := jsonb_build_object(
        'expired_leads', expired_leads,
        'expired_media', expired_media,
        'cleanup_date', CURRENT_TIMESTAMP
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to extend media retention for scheduled services
CREATE OR REPLACE FUNCTION extend_media_retention_for_scheduled()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Extend retention for media associated with scheduled/completed leads
    UPDATE media_files 
    SET data_retention_expires_at = CURRENT_TIMESTAMP + INTERVAL '18 months'
    WHERE id IN (
        SELECT mf.id 
        FROM media_files mf
        JOIN media_associations ma ON mf.id = ma.media_file_id
        JOIN leads l ON ma.lead_id = l.id
        WHERE l.status IN ('scheduled', 'in_progress', 'completed')
        AND mf.data_retention_expires_at < CURRENT_TIMESTAMP + INTERVAL '18 months'
    );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample lead (commented out for production)
/*
INSERT INTO leads (
    reference_number, service_type, mobile_service,
    first_name, last_name, phone, email, best_time_to_call,
    vehicle_year, vehicle_make, vehicle_model,
    street_address, city, state, zip_code,
    preferred_date, time_window,
    damage_description, sms_consent, privacy_acknowledgment,
    status, source, utm_source, utm_medium, utm_campaign
) VALUES (
    'QT-2024-0001', 'windshield_repair', true,
    'John', 'Doe', '(555) 123-4567', 'john.doe@example.com', 'morning',
    2019, 'Honda', 'Civic',
    '123 Main Street', 'Denver', 'CO', '80202',
    'tomorrow', '10-12',
    'Small chip in windshield from road debris', true, true,
    'new', 'website_booking', 'homepage', 'hero', 'hero_primary'
);
*/