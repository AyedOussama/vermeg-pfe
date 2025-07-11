CREATE TABLE IF NOT EXISTS calendar_integrations (
                                                     id BIGSERIAL PRIMARY KEY,
                                                     user_id VARCHAR(255) NOT NULL UNIQUE,
                                                     provider VARCHAR(20) NOT NULL DEFAULT 'GOOGLE',
                                                     access_token TEXT,
                                                     refresh_token TEXT,
                                                     token_expiry_date TIMESTAMP,
                                                     calendar_id VARCHAR(255),
                                                     user_email VARCHAR(255),
                                                     settings TEXT,
                                                     is_active BOOLEAN DEFAULT TRUE,
                                                     last_sync_date TIMESTAMP,
                                                     created_at TIMESTAMP NOT NULL,
                                                     created_by VARCHAR(255),
                                                     updated_at TIMESTAMP,
                                                     updated_by VARCHAR(255),
                                                     version INTEGER DEFAULT 0
);

CREATE INDEX idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX idx_calendar_integrations_provider ON calendar_integrations(provider);