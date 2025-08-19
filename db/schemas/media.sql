-- Pink Auto Glass Media Database Schema  
-- PostgreSQL 14+ compatible
-- Created: 2024-01-19
-- Purpose: Store uploaded media files (photos, documents) with CDN integration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE media_type AS ENUM (
    'image',
    'document', 
    'video',
    'audio'
);

CREATE TYPE media_status AS ENUM (
    'uploading',
    'processing',
    'active',
    'archived',
    'deleted',
    'failed'
);

CREATE TYPE media_context AS ENUM (
    'damage_photos',
    'before_photos',
    'after_photos', 
    'insurance_docs',
    'work_orders',
    'receipts',
    'other'
);

CREATE TYPE storage_provider AS ENUM (
    'aws_s3',
    'cloudflare_r2',
    'local_storage'
);

-- Main media files table
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
    
    -- Storage details
    storage_provider storage_provider NOT NULL DEFAULT 'aws_s3',
    bucket_name VARCHAR(100),
    object_key TEXT,
    cdn_url TEXT,
    
    -- Image-specific metadata
    image_width INTEGER,
    image_height INTEGER,
    image_format VARCHAR(10),
    has_thumbnail BOOLEAN DEFAULT false,
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
    
    -- Virus scanning (if implemented)
    virus_scanned BOOLEAN DEFAULT false,
    virus_scan_result VARCHAR(20), -- 'clean', 'infected', 'error'
    virus_scan_date TIMESTAMP WITH TIME ZONE,
    
    -- Compression/optimization
    is_compressed BOOLEAN DEFAULT false,
    original_file_size BIGINT,
    compression_ratio DECIMAL(4,2),
    
    -- Metadata
    exif_data JSONB,
    custom_metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
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

-- Media associations table (many-to-many with leads/appointments)
CREATE TABLE media_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    
    -- Associated entity (polymorphic)
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('lead', 'appointment', 'customer')),
    entity_id UUID NOT NULL,
    
    -- Association metadata
    association_context media_context,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    caption TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    UNIQUE(media_file_id, entity_type, entity_id)
);

-- Media upload sessions (track multi-file uploads)
CREATE TABLE upload_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(64) UNIQUE NOT NULL,
    
    -- Session details
    entity_type VARCHAR(20),
    entity_id UUID,
    context media_context NOT NULL,
    
    -- Upload progress
    total_files INTEGER NOT NULL DEFAULT 0,
    completed_files INTEGER NOT NULL DEFAULT 0,
    failed_files INTEGER NOT NULL DEFAULT 0,
    total_size BIGINT NOT NULL DEFAULT 0,
    uploaded_size BIGINT NOT NULL DEFAULT 0,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'expired')),
    
    -- Client info
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    
    CONSTRAINT valid_file_counts CHECK (
        completed_files >= 0 AND failed_files >= 0 AND 
        completed_files + failed_files <= total_files
    )
);

-- Media processing jobs queue
CREATE TABLE media_processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    
    -- Job details
    job_type VARCHAR(50) NOT NULL, -- 'thumbnail', 'compress', 'virus_scan', 'metadata_extract'
    priority INTEGER NOT NULL DEFAULT 5, -- 1-10, lower = higher priority
    
    -- Processing details
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    
    -- Job configuration
    job_config JSONB,
    
    -- Results
    result_data JSONB,
    error_message TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media access logs (for analytics and security)
CREATE TABLE media_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
    
    -- Access details
    access_method VARCHAR(20) NOT NULL, -- 'direct', 'thumbnail', 'download'
    referer TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Authentication (if applicable)
    user_id VARCHAR(50),
    access_token_used VARCHAR(32),
    
    -- Response details
    http_status INTEGER,
    bytes_served BIGINT,
    response_time_ms INTEGER,
    
    -- Timestamp
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Geographic data (if GeoIP enabled)
    country CHAR(2),
    region VARCHAR(50),
    city VARCHAR(100)
);

-- Indexes for performance
CREATE INDEX idx_media_files_hash ON media_files(file_hash);
CREATE INDEX idx_media_files_type ON media_files(media_type);
CREATE INDEX idx_media_files_context ON media_files(context);
CREATE INDEX idx_media_files_status ON media_files(status);
CREATE INDEX idx_media_files_created ON media_files(created_at);
CREATE INDEX idx_media_files_size ON media_files(file_size);
CREATE INDEX idx_media_files_cdn_url ON media_files(cdn_url);

-- Composite indexes
CREATE INDEX idx_media_files_type_status ON media_files(media_type, status);
CREATE INDEX idx_media_files_context_created ON media_files(context, created_at);
CREATE INDEX idx_media_files_active ON media_files(status) WHERE status = 'active';

-- Associations indexes
CREATE INDEX idx_media_associations_media_id ON media_associations(media_file_id);
CREATE INDEX idx_media_associations_entity ON media_associations(entity_type, entity_id);
CREATE INDEX idx_media_associations_context ON media_associations(association_context);
CREATE INDEX idx_media_associations_order ON media_associations(display_order);

-- Upload sessions indexes
CREATE INDEX idx_upload_sessions_token ON upload_sessions(session_token);
CREATE INDEX idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX idx_upload_sessions_expires ON upload_sessions(expires_at);
CREATE INDEX idx_upload_sessions_entity ON upload_sessions(entity_type, entity_id);

-- Processing jobs indexes
CREATE INDEX idx_processing_jobs_media_id ON media_processing_jobs(media_file_id);
CREATE INDEX idx_processing_jobs_status ON media_processing_jobs(status);
CREATE INDEX idx_processing_jobs_priority ON media_processing_jobs(priority);
CREATE INDEX idx_processing_jobs_scheduled ON media_processing_jobs(scheduled_at);
CREATE INDEX idx_processing_jobs_queue ON media_processing_jobs(status, priority, scheduled_at) 
    WHERE status = 'pending';

-- Access logs indexes
CREATE INDEX idx_access_logs_media_id ON media_access_logs(media_file_id);
CREATE INDEX idx_access_logs_accessed ON media_access_logs(accessed_at);
CREATE INDEX idx_access_logs_ip ON media_access_logs(ip_address);

-- Partial indexes for common queries
CREATE INDEX idx_media_files_images ON media_files(created_at) 
    WHERE media_type = 'image' AND status = 'active';
CREATE INDEX idx_media_files_damage_photos ON media_files(created_at) 
    WHERE context = 'damage_photos' AND status = 'active';

-- Triggers for updated_at timestamps
CREATE TRIGGER update_media_files_updated_at 
    BEFORE UPDATE ON media_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upload_sessions_updated_at 
    BEFORE UPDATE ON upload_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_jobs_updated_at 
    BEFORE UPDATE ON media_processing_jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate access tokens
CREATE OR REPLACE FUNCTION generate_access_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure filename
CREATE OR REPLACE FUNCTION generate_secure_filename(original_name TEXT)
RETURNS TEXT AS $$
DECLARE
    extension TEXT;
    random_name TEXT;
BEGIN
    -- Extract file extension
    extension := LOWER(SUBSTRING(original_name FROM '\.([^.]*)$'));
    
    -- Generate random filename
    random_name := encode(gen_random_bytes(16), 'hex');
    
    -- Combine with timestamp for uniqueness
    RETURN EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT || '_' || random_name || 
           CASE WHEN extension IS NOT NULL THEN '.' || extension ELSE '' END;
END;
$$ LANGUAGE plpgsql;

-- Function to update upload session progress
CREATE OR REPLACE FUNCTION update_upload_progress(
    session_id UUID,
    file_completed BOOLEAN DEFAULT FALSE,
    file_failed BOOLEAN DEFAULT FALSE,
    bytes_uploaded BIGINT DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    UPDATE upload_sessions 
    SET 
        completed_files = completed_files + CASE WHEN file_completed THEN 1 ELSE 0 END,
        failed_files = failed_files + CASE WHEN file_failed THEN 1 ELSE 0 END,
        uploaded_size = uploaded_size + bytes_uploaded,
        status = CASE 
            WHEN (completed_files + failed_files + 
                  CASE WHEN file_completed THEN 1 ELSE 0 END + 
                  CASE WHEN file_failed THEN 1 ELSE 0 END) >= total_files 
            THEN 'completed'
            ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired upload sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired sessions and orphaned files
    DELETE FROM media_files 
    WHERE id IN (
        SELECT mf.id 
        FROM media_files mf
        JOIN upload_sessions us ON mf.custom_metadata->>'session_id' = us.id::TEXT
        WHERE us.expires_at < CURRENT_TIMESTAMP 
        AND us.status != 'completed'
    );
    
    DELETE FROM upload_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP 
    AND status != 'completed';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get media statistics
CREATE OR REPLACE FUNCTION get_media_statistics()
RETURNS TABLE (
    total_files BIGINT,
    total_size BIGINT,
    total_images BIGINT,
    total_documents BIGINT,
    active_files BIGINT,
    processing_files BIGINT,
    storage_by_provider JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_files,
        SUM(file_size) as total_size,
        COUNT(*) FILTER (WHERE media_type = 'image') as total_images,
        COUNT(*) FILTER (WHERE media_type = 'document') as total_documents,
        COUNT(*) FILTER (WHERE status = 'active') as active_files,
        COUNT(*) FILTER (WHERE status = 'processing') as processing_files,
        jsonb_object_agg(
            storage_provider::TEXT, 
            jsonb_build_object(
                'count', provider_count,
                'size', provider_size
            )
        ) as storage_by_provider
    FROM media_files
    CROSS JOIN LATERAL (
        SELECT 
            storage_provider,
            COUNT(*) as provider_count,
            SUM(file_size) as provider_size
        FROM media_files
        GROUP BY storage_provider
    ) provider_stats;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries

-- Active media files view
CREATE VIEW active_media AS
SELECT 
    mf.*,
    CASE 
        WHEN mf.cdn_url IS NOT NULL THEN mf.cdn_url
        ELSE '/api/media/' || mf.id
    END as public_url
FROM media_files mf
WHERE mf.status = 'active' 
AND mf.deleted_at IS NULL;

-- Media with associations view
CREATE VIEW media_with_associations AS
SELECT 
    mf.*,
    ma.entity_type,
    ma.entity_id,
    ma.association_context,
    ma.display_order,
    ma.is_primary,
    ma.caption
FROM media_files mf
JOIN media_associations ma ON mf.id = ma.media_file_id
WHERE mf.status = 'active' 
AND mf.deleted_at IS NULL;

-- Upload session progress view  
CREATE VIEW upload_session_progress AS
SELECT 
    us.*,
    CASE 
        WHEN us.total_files > 0 
        THEN ROUND((us.completed_files::DECIMAL / us.total_files) * 100, 2)
        ELSE 0 
    END as completion_percentage,
    CASE 
        WHEN us.total_size > 0 
        THEN ROUND((us.uploaded_size::DECIMAL / us.total_size) * 100, 2)
        ELSE 0 
    END as upload_percentage
FROM upload_sessions us;

-- Processing queue view
CREATE VIEW processing_queue AS
SELECT 
    mpj.*,
    mf.filename,
    mf.file_size,
    mf.media_type
FROM media_processing_jobs mpj
JOIN media_files mf ON mpj.media_file_id = mf.id
WHERE mpj.status = 'pending'
ORDER BY mpj.priority, mpj.scheduled_at;

-- Media usage statistics view
CREATE VIEW media_usage_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    media_type,
    context,
    COUNT(*) as files_uploaded,
    SUM(file_size) as total_size,
    AVG(file_size) as avg_file_size,
    COUNT(*) FILTER (WHERE status = 'active') as active_files,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_files
FROM media_files
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at), media_type, context
ORDER BY date DESC;

-- Grant permissions (adjust role names as needed)
-- GRANT SELECT, INSERT, UPDATE ON media_files TO media_app;
-- GRANT SELECT, INSERT, UPDATE ON media_associations TO media_app;  
-- GRANT SELECT, INSERT, UPDATE, DELETE ON upload_sessions TO media_app;
-- GRANT SELECT, INSERT, UPDATE ON media_processing_jobs TO media_app;
-- GRANT SELECT, INSERT ON media_access_logs TO media_app;

-- Sample data (for development/testing)
-- INSERT INTO media_files (
--     filename, original_filename, file_path, file_size, mime_type, file_hash,
--     media_type, context, cdn_url, image_width, image_height, status
-- ) VALUES (
--     '1642608000_abc123def456.jpg', 
--     'windshield_damage.jpg',
--     '/uploads/2024/01/1642608000_abc123def456.jpg',
--     245760,
--     'image/jpeg',
--     'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
--     'image',
--     'damage_photos',
--     'https://cdn.pinkautoglass.com/uploads/2024/01/1642608000_abc123def456.jpg',
--     1920,
--     1080,
--     'active'
-- );

-- Maintenance procedures

-- Procedure to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_media()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mark files as deleted if they have no associations
    UPDATE media_files 
    SET status = 'archived', deleted_at = CURRENT_TIMESTAMP
    WHERE id NOT IN (
        SELECT DISTINCT media_file_id 
        FROM media_associations
    )
    AND status = 'active'
    AND created_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Procedure to archive old media files
CREATE OR REPLACE FUNCTION archive_old_media(archive_after_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    UPDATE media_files 
    SET status = 'archived'
    WHERE status = 'active'
    AND accessed_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * archive_after_days;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Procedure to process pending jobs
CREATE OR REPLACE FUNCTION process_media_jobs(job_limit INTEGER DEFAULT 10)
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
    job_record RECORD;
BEGIN
    FOR job_record IN 
        SELECT * FROM media_processing_jobs 
        WHERE status = 'pending' 
        AND scheduled_at <= CURRENT_TIMESTAMP
        ORDER BY priority, scheduled_at
        LIMIT job_limit
    LOOP
        -- Update job status to processing
        UPDATE media_processing_jobs 
        SET status = 'processing', 
            started_at = CURRENT_TIMESTAMP,
            attempts = attempts + 1
        WHERE id = job_record.id;
        
        processed_count := processed_count + 1;
        
        -- Job processing would happen in application code
        -- This function just queues jobs for processing
    END LOOP;
    
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to clean up expired sessions (run hourly)
-- This would typically be handled by a cron job or application scheduler
-- SELECT cleanup_expired_sessions();