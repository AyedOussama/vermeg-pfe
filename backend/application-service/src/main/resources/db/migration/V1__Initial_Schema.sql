-- Create base tables for application service

-- Applications table
CREATE TABLE applications (
                              id BIGSERIAL PRIMARY KEY,
                              reference VARCHAR(50) NOT NULL UNIQUE,
                              candidate_id VARCHAR(255) NOT NULL,
                              job_posting_id BIGINT NOT NULL,
                              resume_document_id BIGINT,
                              cover_letter_document_id BIGINT,
                              status VARCHAR(50) NOT NULL,
                              recruiter_notes TEXT,
                              candidate_message TEXT,
                              job_title VARCHAR(255),
                              job_department VARCHAR(255),
                              candidate_name VARCHAR(255),
                              ai_processed BOOLEAN DEFAULT FALSE,
                              ai_score DOUBLE PRECISION,
                              auto_decision BOOLEAN DEFAULT FALSE,
                              is_shortlisted BOOLEAN DEFAULT FALSE,
                              interview_id BIGINT,
                              interview_requested_at TIMESTAMP,
                              submitted_at TIMESTAMP,
                              processed_at TIMESTAMP,
                              last_status_changed_at TIMESTAMP,
                              last_status_changed_by VARCHAR(255),
                              deleted BOOLEAN DEFAULT FALSE,
                              created_at TIMESTAMP,
                              created_by VARCHAR(255),
                              updated_at TIMESTAMP,
                              updated_by VARCHAR(255),
                              version INTEGER DEFAULT 0
);

-- AI Settings table (the missing table causing your error)
CREATE TABLE ai_settings (
                             id BIGSERIAL PRIMARY KEY,
                             department VARCHAR(255) NOT NULL,
                             job_type VARCHAR(255),
                             auto_accept_threshold DOUBLE PRECISION,
                             auto_reject_threshold DOUBLE PRECISION,
                             review_threshold DOUBLE PRECISION,
                             automation_level VARCHAR(50),
                             ai_base_configuration TEXT,
                             last_calibration_date TIMESTAMP,
                             is_self_calibrating BOOLEAN DEFAULT FALSE,
                             is_active BOOLEAN DEFAULT TRUE,
                             created_at TIMESTAMP,
                             created_by VARCHAR(255),
                             updated_at TIMESTAMP,
                             updated_by VARCHAR(255),
                             version INTEGER DEFAULT 0
);

-- Application status history table
CREATE TABLE application_status_history (
                                            id BIGSERIAL PRIMARY KEY,
                                            application_id BIGINT NOT NULL REFERENCES applications(id),
                                            previous_status VARCHAR(50),
                                            new_status VARCHAR(50) NOT NULL,
                                            changed_by VARCHAR(255) NOT NULL,
                                            reason TEXT,
                                            changed_at TIMESTAMP NOT NULL,
                                            is_system_change BOOLEAN,
                                            is_automatic_decision BOOLEAN,
                                            created_at TIMESTAMP,
                                            created_by VARCHAR(255),
                                            updated_at TIMESTAMP,
                                            updated_by VARCHAR(255),
                                            version INTEGER DEFAULT 0
);

-- Evaluations table
CREATE TABLE evaluations (
                             id BIGSERIAL PRIMARY KEY,
                             application_id BIGINT NOT NULL REFERENCES applications(id),
                             overall_score DOUBLE PRECISION,
                             justification TEXT,
                             technical_skill_score DOUBLE PRECISION,
                             experience_score DOUBLE PRECISION,
                             education_score DOUBLE PRECISION,
                             soft_skill_score DOUBLE PRECISION,
                             strengths TEXT,
                             weaknesses TEXT,
                             recommendation VARCHAR(50),
                             model_used VARCHAR(255),
                             exceeded_auto_threshold BOOLEAN,
                             category_scores TEXT,
                             raw_response TEXT,
                             created_at TIMESTAMP,
                             created_by VARCHAR(255),
                             updated_at TIMESTAMP,
                             updated_by VARCHAR(255),
                             version INTEGER DEFAULT 0
);

-- Metrics table
CREATE TABLE metrics (
                         id BIGSERIAL PRIMARY KEY,
                         metrics_date DATE NOT NULL,
                         total_applications INTEGER,
                         new_applications INTEGER,
                         reviewed_applications INTEGER,
                         shortlisted_applications INTEGER,
                         rejected_applications INTEGER,
                         auto_accepted_applications INTEGER,
                         auto_rejected_applications INTEGER,
                         department VARCHAR(255),
                         average_processing_time_minutes DOUBLE PRECISION,
                         average_evaluation_score DOUBLE PRECISION,
                         created_at TIMESTAMP,
                         created_by VARCHAR(255),
                         updated_at TIMESTAMP,
                         updated_by VARCHAR(255),
                         version INTEGER DEFAULT 0
);

-- Reports table
CREATE TABLE reports (
                         id BIGSERIAL PRIMARY KEY,
                         title VARCHAR(255) NOT NULL,
                         description TEXT,
                         report_type VARCHAR(50) NOT NULL,
                         parameters TEXT,
                         result_data TEXT,
                         format VARCHAR(20),
                         generated_file_path VARCHAR(255),
                         created_by VARCHAR(255) NOT NULL,
                         start_date DATE,
                         end_date DATE,
                         job_posting_id BIGINT,
                         department VARCHAR(255),
                         download_count INTEGER DEFAULT 0,
                         last_downloaded_at TIMESTAMP,
                         last_downloaded_by VARCHAR(255),
                         is_scheduled BOOLEAN DEFAULT FALSE,
                         schedule_cron VARCHAR(100),
                         last_generated_at TIMESTAMP,
                         generation_status VARCHAR(20),
                         error_message TEXT,
                         created_at TIMESTAMP,
                         updated_at TIMESTAMP,
                         updated_by VARCHAR(255),
                         version INTEGER DEFAULT 0
);

-- Outbox Events table (for reliable event publishing)
CREATE TABLE outbox_events (
                               id BIGSERIAL PRIMARY KEY,
                               aggregate_type VARCHAR(255) NOT NULL,
                               aggregate_id BIGINT NOT NULL,
                               event_type VARCHAR(255) NOT NULL,
                               payload TEXT NOT NULL,
                               processed BOOLEAN NOT NULL DEFAULT FALSE,
                               processed_at TIMESTAMP,
                               retry_count INTEGER DEFAULT 0,
                               error_message TEXT,
                               creation_time TIMESTAMP NOT NULL,
                               created_at TIMESTAMP,
                               created_by VARCHAR(255),
                               updated_at TIMESTAMP,
                               updated_by VARCHAR(255),
                               version INTEGER DEFAULT 0
);