# Data Retention and Privacy Policy
## Pink Auto Glass Security Baseline

### Overview
This document establishes comprehensive data retention policies for Pink Auto Glass, covering lead data, media files, personally identifiable information (PII), and system logging. These policies ensure compliance with privacy regulations while supporting business operations and security monitoring.

### Lead Data Retention Policies

#### Lead Lifecycle Management
**Active Lead Retention:**
```sql
-- Lead data retention configuration
CREATE TABLE data_retention_config (
  table_name VARCHAR(50),
  retention_period INTERVAL,
  archive_after INTERVAL,
  delete_after INTERVAL,
  last_updated TIMESTAMP DEFAULT NOW()
);

INSERT INTO data_retention_config VALUES
  ('leads', '18 months', '6 months', '18 months', NOW()),
  ('lead_communications', '18 months', '6 months', '18 months', NOW()),
  ('lead_media', '90 days', '30 days', '18 months', NOW());
```

**Lead Data Classification:**
```yaml
lead_data_types:
  essential_business_data:
    fields: [first_name, last_name, phone, email, address, service_requested, vehicle_info]
    retention: "18 months" # Business record retention
    basis: "legitimate_business_interest"
    
  communication_records:
    fields: [sms_messages, call_logs, email_threads]
    retention: "18 months" # Communication compliance
    basis: "legal_obligation"
    
  marketing_data:
    fields: [source, campaign_id, referrer]
    retention: "18 months" # Marketing analytics
    basis: "consent_or_legitimate_interest"
    
  sensitive_data:
    fields: [payment_info, insurance_details, location_data]
    retention: "18 months" # Minimize exposure
    basis: "explicit_consent"
    
  pii_minimization_fields:
    required_fields: [first_name, last_name, phone, email, address]
    optional_fields: [vehicle_details, service_preferences]
    prohibited_fields: [ssn, license_number, insurance_id, full_address_history]
    retention: "18 months"
    basis: "data_minimization_principle"
```

#### Automated Retention Procedures
**Daily Retention Job:**
```sql
-- Daily data retention enforcement
CREATE OR REPLACE FUNCTION enforce_data_retention()
RETURNS void AS $$
DECLARE
    config RECORD;
BEGIN
    -- Loop through retention configurations
    FOR config IN SELECT * FROM data_retention_config LOOP
        -- Archive old records
        EXECUTE format('
            UPDATE %I SET 
                status = ''archived'',
                archived_at = NOW()
            WHERE created_at < NOW() - %L
              AND status != ''archived''
              AND status != ''deleted''',
            config.table_name, 
            config.archive_after
        );
        
        -- Soft delete very old records
        EXECUTE format('
            UPDATE %I SET 
                status = ''deleted'',
                deleted_at = NOW(),
                data_hash = encode(digest(id::text, ''sha256''), ''hex'')
            WHERE created_at < NOW() - %L
              AND status != ''deleted''',
            config.table_name,
            config.delete_after
        );
        
        -- Hard delete after retention period (with PII redaction)
        EXECUTE format('
            DELETE FROM %I 
            WHERE created_at < NOW() - %L
              AND status = ''deleted''
              AND deleted_at < NOW() - INTERVAL ''30 days''',
            config.table_name,
            config.retention_period
        );
        
        -- Execute scheduled service purge for media files
        IF config.table_name = 'lead_media' THEN
            -- Delete unscheduled media after 90 days
            EXECUTE format('
                DELETE FROM %I 
                WHERE created_at < NOW() - INTERVAL ''90 days''
                  AND lead_id NOT IN (
                    SELECT id FROM leads WHERE status IN (''scheduled'', ''in_progress'', ''completed'')
                  )',
                config.table_name
            );
            
            -- Delete scheduled service media after 18 months
            EXECUTE format('
                DELETE FROM %I 
                WHERE created_at < NOW() - INTERVAL ''18 months''
                  AND lead_id IN (
                    SELECT id FROM leads WHERE status IN (''scheduled'', ''in_progress'', ''completed'')
                  )',
                config.table_name
            );
        END IF;
    END LOOP;
    
    -- Log retention activity
    INSERT INTO audit_log (action, details, created_at)
    VALUES ('data_retention_job', 'Automated retention enforcement completed', NOW());
END;
$$ LANGUAGE plpgsql;
```

**Retention Job Scheduling:**
```sql
-- Create scheduled job for retention enforcement
SELECT cron.schedule('data-retention-job', '0 2 * * *', 'SELECT enforce_data_retention();');
```

#### Lead Data Export and Portability
**Customer Data Export Procedure:**
```javascript
// Customer data export for GDPR/CCPA compliance
const exportCustomerData = async (customerId, requestType = 'full') => {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      customerId: customerId,
      requestType: requestType,
      dataController: 'Pink Auto Glass LLC'
    },
    
    personalData: {
      basic: await getCustomerBasicInfo(customerId),
      contact: await getCustomerContactInfo(customerId),
      preferences: await getCustomerPreferences(customerId)
    },
    
    serviceData: {
      leads: await getCustomerLeads(customerId),
      appointments: await getCustomerAppointments(customerId),
      serviceHistory: await getServiceHistory(customerId)
    },
    
    communicationData: {
      smsMessages: await getSMSHistory(customerId),
      emailCommunications: await getEmailHistory(customerId),
      callLogs: await getCallLogs(customerId)
    },
    
    technicalData: {
      ipAddresses: await getIPHistory(customerId),
      deviceInfo: await getDeviceHistory(customerId),
      sessionData: await getSessionHistory(customerId)
    }
  };
  
  // Audit the export
  await logDataExport(customerId, requestType, exportData);
  
  return exportData;
};
```

### Media File Retention and Cleanup

#### Media Classification and Retention
**Media File Categories:**
```yaml
media_categories:
  damage_photos:
    retention_period: "18 months" # Insurance/legal requirements (if scheduled)
    default_retention: "90 days" # If not scheduled for service
    storage_tier: "standard"
    compression: "high_quality"
    encryption: "required"
    
  before_after_photos:
    retention_period: "18 months" # Marketing/portfolio use (if scheduled)
    default_retention: "90 days" # If not scheduled for service
    storage_tier: "standard" 
    compression: "web_optimized"
    encryption: "required"
    
  vehicle_identification:
    retention_period: "18 months" # Service records (if scheduled)
    default_retention: "90 days" # If not scheduled for service
    storage_tier: "cold"
    compression: "standard"
    encryption: "required"
    
  temporary_uploads:
    retention_period: "30 days" # Processing cleanup
    storage_tier: "hot"
    compression: "none"
    encryption: "required"
```

#### Automated Media Cleanup
**Daily Media Cleanup Job:**
```javascript
// Automated media file cleanup
const mediaCleanupJob = async () => {
  try {
    // Get cleanup configuration
    const cleanupConfig = await getMediaRetentionConfig();
    
    for (const category of cleanupConfig) {
      // Find expired media files
      const expiredMedia = await findExpiredMedia(category);
      
      // Process each expired file
      for (const mediaFile of expiredMedia) {
        if (mediaFile.retentionStatus === 'archive_ready') {
          await archiveMediaFile(mediaFile);
        } else if (mediaFile.retentionStatus === 'delete_ready') {
          await secureDeleteMediaFile(mediaFile);
        }
      }
      
      // Update retention status
      await updateMediaRetentionStatus(category);
    }
    
    // Clean up temporary files
    await cleanupTemporaryFiles();
    
    // Log cleanup activity
    await logMediaCleanup(cleanupConfig);
    
  } catch (error) {
    await logError('media_cleanup_failed', error);
    throw error;
  }
};

// Schedule cleanup job
cron.schedule('0 3 * * *', mediaCleanupJob);
```

**Secure Media Deletion:**
```javascript
// Secure file deletion with verification
const secureDeleteMediaFile = async (mediaFile) => {
  try {
    // Create deletion record before removing file
    await createDeletionRecord(mediaFile);
    
    // Remove from cloud storage
    await cloudStorage.delete(mediaFile.path);
    
    // Remove from CDN cache
    await cdn.purge(mediaFile.url);
    
    // Update database record
    await updateMediaRecord(mediaFile.id, {
      status: 'deleted',
      deleted_at: new Date(),
      deletion_method: 'secure_delete',
      verification_hash: await generateDeletionHash(mediaFile)
    });
    
    // Verify deletion
    const verifyDeleted = await cloudStorage.exists(mediaFile.path);
    if (verifyDeleted) {
      throw new Error('File deletion verification failed');
    }
    
    return { success: true, mediaId: mediaFile.id };
    
  } catch (error) {
    await logDeletionError(mediaFile.id, error);
    throw error;
  }
};
```

#### Media Archive Management
**Cold Storage Archival:**
```javascript
// Archive old media to cold storage
const archiveMediaToCloud = async (mediaFile) => {
  const archiveConfig = {
    storageClass: 'COLD',
    lifecycle: {
      deleteAfter: '7 years',
      transitionToColdest: '2 years'
    },
    encryption: {
      algorithm: 'AES-256',
      keyManagement: 'customer_managed'
    },
    metadata: {
      originalPath: mediaFile.path,
      archiveDate: new Date().toISOString(),
      retention: mediaFile.category.retention_period,
      legalHold: mediaFile.legalHold || false
    }
  };
  
  // Move to archive storage
  const archivePath = `archive/${mediaFile.category}/${mediaFile.id}`;
  await cloudStorage.copy(mediaFile.path, archivePath, archiveConfig);
  
  // Verify archive integrity
  const archiveHash = await cloudStorage.getHash(archivePath);
  const originalHash = mediaFile.checksum;
  
  if (archiveHash !== originalHash) {
    throw new Error('Archive integrity verification failed');
  }
  
  // Update media record
  await updateMediaRecord(mediaFile.id, {
    status: 'archived',
    archive_path: archivePath,
    archived_at: new Date(),
    archive_hash: archiveHash
  });
  
  return { success: true, archivePath };
};
```

### PII Minimization Strategies

#### Data Minimization Principles
**PII Collection Standards:**
```yaml
pii_collection_standards:
  lead_intake:
    required_fields: [first_name, last_name, phone, service_type]
    optional_fields: [email, address, vehicle_details]
    prohibited_fields: [ssn, license_number, insurance_id]
    
  service_delivery:
    required_fields: [first_name, last_name, phone, email, address, vehicle_identification]
    optional_fields: [payment_preferences, communication_preferences]
    prohibited_fields: [financial_account_details, health_information]
    
  marketing_communications:
    required_fields: [contact_preference]
    optional_fields: [first_name, last_name, email, communication_history]
    prohibited_fields: [detailed_personal_data, sensitive_attributes]
    
  pii_minimization_enforcement:
    core_pii_fields: [first_name, last_name, phone, email, address]
    collection_basis: "explicit_consent_and_legitimate_interest"
    retention_period: "18_months"
    purge_policy: "automatic_deletion_after_retention_period"
    anonymization_after: "6_months_if_no_service_scheduled"
```

#### PII Anonymization Procedures
**Data Anonymization Functions:**
```sql
-- PII anonymization for analytics and reporting
CREATE OR REPLACE FUNCTION anonymize_lead_data()
RETURNS void AS $$
BEGIN
    -- Anonymize old lead data while preserving business analytics
    UPDATE leads SET
        customer_name = 'Customer-' || encode(digest(customer_name, 'sha256'), 'hex')[:8],
        phone = 'XXX-XXX-' || RIGHT(phone, 4),
        email = 'user' || id || '@anonymized.local',
        address = NULL,
        notes = 'Data anonymized per retention policy'
    WHERE created_at < NOW() - INTERVAL '2 years'
      AND status = 'closed'
      AND anonymized = false;
    
    -- Mark as anonymized
    UPDATE leads SET anonymized = true
    WHERE created_at < NOW() - INTERVAL '2 years'
      AND status = 'closed';
      
    -- Log anonymization
    INSERT INTO audit_log (action, details, created_at)
    VALUES ('pii_anonymization', 'Bulk anonymization of old lead data', NOW());
END;
$$ LANGUAGE plpgsql;
```

**Selective PII Redaction:**
```javascript
// Redact PII from logs and exports
const redactPII = (data, redactionLevel = 'standard') => {
  const redactionRules = {
    standard: {
      email: (email) => email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      phone: (phone) => phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-XXX-$3'),
      name: (name) => name.charAt(0) + '***',
      address: () => '[REDACTED]'
    },
    
    high: {
      email: () => '[EMAIL_REDACTED]',
      phone: () => '[PHONE_REDACTED]', 
      name: () => '[NAME_REDACTED]',
      address: () => '[ADDRESS_REDACTED]'
    },
    
    analytics: {
      email: (email) => generateHash(email, 'email'),
      phone: (phone) => generateHash(phone, 'phone'),
      name: (name) => generateHash(name, 'name'),
      address: (addr) => addr ? 'PROVIDED' : 'NOT_PROVIDED'
    }
  };
  
  const rules = redactionRules[redactionLevel];
  
  return Object.keys(data).reduce((redacted, key) => {
    if (rules[key]) {
      redacted[key] = rules[key](data[key]);
    } else {
      redacted[key] = data[key];
    }
    return redacted;
  }, {});
};
```

### Logging Policies with Redaction

#### Log Classification and Retention
**Log Categories:**
```yaml
log_categories:
  application_logs:
    retention: "1 year"
    pii_redaction: "automatic"
    storage: "elasticsearch"
    access: "developers_and_support"
    
  security_logs:
    retention: "3 years"
    pii_redaction: "selective"
    storage: "secure_siem"
    access: "security_team_only"
    
  audit_logs:
    retention: "7 years"
    pii_redaction: "minimal"
    storage: "immutable_storage"
    access: "compliance_team"
    
  performance_logs:
    retention: "90 days"
    pii_redaction: "complete"
    storage: "metrics_db"
    access: "operations_team"
```

#### Automated Log Redaction
**Real-time Log Processing:**
```javascript
// Log processor with automatic PII redaction
class LogProcessor {
  constructor() {
    this.piiPatterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g
    };
    
    this.redactionTokens = {
      email: '[EMAIL_REDACTED]',
      phone: '[PHONE_REDACTED]', 
      ssn: '[SSN_REDACTED]',
      creditCard: '[CARD_REDACTED]',
      ipAddress: '[IP_REDACTED]'
    };
  }
  
  processLog(logEntry) {
    let message = logEntry.message;
    let metadata = { ...logEntry.metadata };
    
    // Apply PII redaction based on log level
    if (logEntry.level !== 'debug') {
      for (const [type, pattern] of Object.entries(this.piiPatterns)) {
        message = message.replace(pattern, this.redactionTokens[type]);
        
        // Also redact metadata
        Object.keys(metadata).forEach(key => {
          if (typeof metadata[key] === 'string') {
            metadata[key] = metadata[key].replace(pattern, this.redactionTokens[type]);
          }
        });
      }
    }
    
    return {
      ...logEntry,
      message,
      metadata,
      redacted: true,
      original_hash: this.generateHash(logEntry.message)
    };
  }
  
  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
  }
}
```

**Log Retention Enforcement:**
```javascript
// Automated log cleanup and archival
const logRetentionJob = async () => {
  const retentionPolicies = await getLogRetentionPolicies();
  
  for (const policy of retentionPolicies) {
    try {
      // Archive logs approaching retention limit
      const archiveQuery = {
        index: policy.index,
        body: {
          query: {
            range: {
              '@timestamp': {
                lt: `now-${policy.archiveAfter}`
              }
            }
          }
        }
      };
      
      const archiveLogs = await elasticsearch.search(archiveQuery);
      
      if (archiveLogs.hits.total.value > 0) {
        await archiveLogsToStorage(archiveLogs.hits.hits, policy);
      }
      
      // Delete logs beyond retention period
      const deleteQuery = {
        index: policy.index,
        body: {
          query: {
            range: {
              '@timestamp': {
                lt: `now-${policy.retention}`
              }
            }
          }
        }
      };
      
      await elasticsearch.deleteByQuery(deleteQuery);
      
      // Log retention activity
      await auditLogger.info('log_retention_completed', {
        policy: policy.name,
        archived: archiveLogs.hits.total.value,
        retention_date: new Date()
      });
      
    } catch (error) {
      await auditLogger.error('log_retention_failed', {
        policy: policy.name,
        error: error.message
      });
    }
  }
};
```

### Compliance and Audit Requirements

#### Data Protection Impact Assessment (DPIA)
**Automated DPIA Monitoring:**
```javascript
// Monitor data processing activities for DPIA triggers
const monitorDataProcessing = async () => {
  const activities = await getDataProcessingActivities();
  
  const dpiaRequired = activities.filter(activity => {
    return activity.riskScore > 7 ||
           activity.sensitiveData ||
           activity.largescaleProcessing ||
           activity.newTechnology;
  });
  
  if (dpiaRequired.length > 0) {
    await triggerDPIAReview(dpiaRequired);
  }
  
  return dpiaRequired;
};
```

#### Regular Compliance Checks
**Monthly Data Retention Compliance:**
```yaml
monthly_compliance_checks:
  data_inventory_update:
    frequency: "monthly"
    responsible: "data_protection_officer"
    deliverable: "updated_data_inventory"
    
  retention_policy_compliance:
    frequency: "monthly"
    responsible: "technical_lead"
    deliverable: "retention_compliance_report"
    
  pii_minimization_review:
    frequency: "monthly" 
    responsible: "product_owner"
    deliverable: "pii_usage_analysis"
    
  log_redaction_effectiveness:
    frequency: "monthly"
    responsible: "security_team"
    deliverable: "redaction_audit_report"
```

### Comprehensive Purge Policy Implementation

#### Automated Data Purge Procedures
**Lead Data Purge Schedule:**
```sql
-- Comprehensive purge policy for lead data
CREATE OR REPLACE FUNCTION execute_purge_policy()
RETURNS void AS $$
BEGIN
    -- Purge unscheduled leads after 18 months
    DELETE FROM leads 
    WHERE created_at < NOW() - INTERVAL '18 months'
      AND status NOT IN ('scheduled', 'in_progress', 'completed');
    
    -- Purge completed service leads after 18 months
    DELETE FROM leads 
    WHERE created_at < NOW() - INTERVAL '18 months'
      AND status = 'completed'
      AND service_completed_at < NOW() - INTERVAL '18 months';
    
    -- Purge associated PII fields while retaining analytics data
    UPDATE leads SET
        first_name = NULL,
        last_name = NULL,
        phone = NULL,
        email = NULL,
        address = NULL,
        notes = 'PII purged per retention policy',
        pii_purged = true,
        pii_purged_at = NOW()
    WHERE created_at < NOW() - INTERVAL '18 months'
      AND pii_purged = false;
    
    -- Log purge activity
    INSERT INTO audit_log (action, details, created_at)
    VALUES ('data_purge_completed', 
            'Automated purge of expired lead data and PII', 
            NOW());
END;
$$ LANGUAGE plpgsql;

-- Schedule daily purge job
SELECT cron.schedule('lead-data-purge', '0 3 * * *', 'SELECT execute_purge_policy();');
```

**Media File Purge with Service Status Logic:**
```javascript
// Enhanced media purge with service scheduling awareness
const executeMediaPurge = async () => {
  try {
    // Get all media files eligible for purge
    const mediaFiles = await db.query(`
      SELECT m.*, l.status as lead_status, l.service_scheduled_at
      FROM lead_media m
      LEFT JOIN leads l ON m.lead_id = l.id
      WHERE (
        -- Unscheduled leads: 90-day retention
        (l.status NOT IN ('scheduled', 'in_progress', 'completed') 
         AND m.created_at < NOW() - INTERVAL '90 days')
        OR
        -- Scheduled/completed leads: 18-month retention
        (l.status IN ('scheduled', 'in_progress', 'completed') 
         AND m.created_at < NOW() - INTERVAL '18 months')
      )
    `);
    
    let purgedCount = 0;
    
    for (const mediaFile of mediaFiles) {
      try {
        // Secure deletion from cloud storage
        await cloudStorage.delete(mediaFile.file_path);
        await cloudStorage.delete(mediaFile.thumbnail_path);
        
        // Remove from CDN cache
        await cdn.purge([mediaFile.file_url, mediaFile.thumbnail_url]);
        
        // Delete database record
        await db.query('DELETE FROM lead_media WHERE id = ?', [mediaFile.id]);
        
        purgedCount++;
        
        // Log individual file purge
        await auditLogger.info('media_file_purged', {
          file_id: mediaFile.id,
          lead_id: mediaFile.lead_id,
          lead_status: mediaFile.lead_status,
          file_age_days: Math.floor((Date.now() - new Date(mediaFile.created_at)) / (1000 * 60 * 60 * 24))
        });
        
      } catch (error) {
        await auditLogger.error('media_purge_failed', {
          file_id: mediaFile.id,
          error: error.message
        });
      }
    }
    
    // Summary logging
    await auditLogger.info('media_purge_completed', {
      total_files_purged: purgedCount,
      purge_date: new Date().toISOString()
    });
    
  } catch (error) {
    await auditLogger.error('media_purge_job_failed', {
      error: error.message
    });
    throw error;
  }
};
```

#### Enhanced Log Redaction Implementation
**Comprehensive Log Processing with PII Redaction:**
```javascript
// Advanced log redaction system with PII detection
class AdvancedLogProcessor {
  constructor() {
    this.piiPatterns = {
      // Enhanced PII detection patterns
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      phone: /\b(?:\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
      ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
      creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
      ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
      firstName: /\b(first_name|firstName)["':\s]*["']?([A-Za-z]{2,})["']?/gi,
      lastName: /\b(last_name|lastName)["':\s]*["']?([A-Za-z]{2,})["']?/gi,
      address: /\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi
    };
    
    this.redactionTokens = {
      email: '[EMAIL_REDACTED]',
      phone: '[PHONE_REDACTED]',
      ssn: '[SSN_REDACTED]',
      creditCard: '[CARD_REDACTED]',
      ipAddress: '[IP_REDACTED]',
      firstName: '$1[NAME_REDACTED]',
      lastName: '$1[NAME_REDACTED]',
      address: '[ADDRESS_REDACTED]'
    };
  }
  
  processLogEntry(logEntry, logLevel = 'info') {
    let processedMessage = logEntry.message;
    let processedMetadata = { ...logEntry.metadata };
    let redactionCount = 0;
    
    // Apply PII redaction based on log level and type
    for (const [piiType, pattern] of Object.entries(this.piiPatterns)) {
      const token = this.redactionTokens[piiType];
      
      // Redact message content
      const messageMatches = processedMessage.match(pattern);
      if (messageMatches) {
        processedMessage = processedMessage.replace(pattern, token);
        redactionCount += messageMatches.length;
      }
      
      // Redact metadata
      Object.keys(processedMetadata).forEach(key => {
        if (typeof processedMetadata[key] === 'string') {
          const metadataMatches = processedMetadata[key].match(pattern);
          if (metadataMatches) {
            processedMetadata[key] = processedMetadata[key].replace(pattern, token);
            redactionCount += metadataMatches.length;
          }
        }
      });
    }
    
    return {
      ...logEntry,
      message: processedMessage,
      metadata: {
        ...processedMetadata,
        redaction_applied: redactionCount > 0,
        redaction_count: redactionCount,
        original_hash: this.generateHash(logEntry.message)
      },
      processed_at: new Date().toISOString()
    };
  }
  
  generateHash(content) {
    return crypto.createHash('sha256')
      .update(content)
      .digest('hex')
      .slice(0, 16);
  }
}
```

This comprehensive data retention policy ensures Pink Auto Glass maintains appropriate data governance while meeting all legal, regulatory, and business requirements for data protection and privacy.