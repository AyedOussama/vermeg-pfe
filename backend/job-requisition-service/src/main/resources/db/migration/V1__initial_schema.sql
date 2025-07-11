-- V1__initial_schema.sql
-- Initial schema creation for the job requisition service



-- Create job_requisitions table
CREATE TABLE job_requisitions (
                                  id BIGSERIAL PRIMARY KEY,
                                  title VARCHAR(255) NOT NULL,
                                  description TEXT NOT NULL,
                                  department VARCHAR(255) NOT NULL,
                                  project_name VARCHAR(255),
                                  project_leader_id VARCHAR(255) NOT NULL,
                                  project_leader_name VARCHAR(255),
                                  required_level VARCHAR NOT NULL,
                                  min_experience INTEGER,
                                  expected_start_date DATE,
                                  is_urgent BOOLEAN DEFAULT FALSE,
                                  needed_headcount INTEGER NOT NULL,
                                  status VARCHAR NOT NULL DEFAULT 'DRAFT',
                                  ceo_id VARCHAR(255),
                                  ceo_response_date TIMESTAMP,
                                  rejection_reason TEXT,
                                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP
);

-- Create requisition_status_history table
CREATE TABLE requisition_status_history (
                                            id BIGSERIAL PRIMARY KEY,
                                            requisition_id BIGINT NOT NULL REFERENCES job_requisitions(id) ON DELETE CASCADE,
                                            old_status VARCHAR,
                                            new_status VARCHAR NOT NULL,
                                            changed_by VARCHAR(255) NOT NULL,
                                            changed_by_name VARCHAR(255),
                                            comments TEXT,
                                            changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                            CONSTRAINT fk_requisition FOREIGN KEY (requisition_id) REFERENCES job_requisitions(id)
);

-- Create job_requisition_skills table (many-to-many relationship)
CREATE TABLE job_requisition_skills (
                                        requisition_id BIGINT NOT NULL,
                                        skill VARCHAR(100) NOT NULL,
                                        PRIMARY KEY (requisition_id, skill),
                                        CONSTRAINT fk_requisition_skills FOREIGN KEY (requisition_id) REFERENCES job_requisitions(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_requisition_status ON job_requisitions(status);
CREATE INDEX idx_requisition_department ON job_requisitions(department);
CREATE INDEX idx_requisition_project_leader ON job_requisitions(project_leader_id);
CREATE INDEX idx_requisition_created_at ON job_requisitions(created_at);
CREATE INDEX idx_history_requisition_id ON requisition_status_history(requisition_id);
CREATE INDEX idx_history_changed_at ON requisition_status_history(changed_at);