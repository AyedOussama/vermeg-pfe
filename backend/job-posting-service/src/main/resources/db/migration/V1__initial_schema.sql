-- V1__initial_schema.sql
-- Schéma initial pour le service de gestion des offres d'emploi

-- Table des offres d'emploi
CREATE TABLE job_postings (
                              id BIGSERIAL PRIMARY KEY,
                              title VARCHAR(255) NOT NULL,
                              requisition_id BIGINT,
                              department VARCHAR(100) NOT NULL,
                              location VARCHAR(255),
                              employment_type VARCHAR(50) NOT NULL,
                              description TEXT NOT NULL,
                              responsibilities TEXT,
                              qualifications TEXT,
                              benefits TEXT,
                              min_experience INTEGER,
                              salary_range_min DECIMAL(12, 2),
                              salary_range_max DECIMAL(12, 2),
                              display_salary BOOLEAN DEFAULT FALSE,
                              status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                              publication_level VARCHAR(20),
                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              published_at TIMESTAMP,
                              expires_at TIMESTAMP,
                              closed_at TIMESTAMP,
                              created_by VARCHAR(255) NOT NULL,
                              last_modified_by VARCHAR(255),
                              last_modified_at TIMESTAMP,
                              template_id BIGINT,
                              version INTEGER DEFAULT 0
);

-- Index pour la table job_postings
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_department ON job_postings(department);
CREATE INDEX idx_job_postings_requisition_id ON job_postings(requisition_id);
CREATE INDEX idx_job_postings_created_at ON job_postings(created_at);
CREATE INDEX idx_job_postings_published_at ON job_postings(published_at);

-- Table des compétences requises pour les offres
CREATE TABLE job_posting_skills (
                                    id BIGSERIAL PRIMARY KEY,
                                    job_post_id BIGINT NOT NULL,
                                    name VARCHAR(100) NOT NULL,
                                    is_required BOOLEAN DEFAULT FALSE,
                                    description VARCHAR(500),
                                    level VARCHAR(50),
                                    CONSTRAINT fk_skill_job_post FOREIGN KEY (job_post_id) REFERENCES job_postings(id) ON DELETE CASCADE,
                                    CONSTRAINT uq_skill_job_post UNIQUE (job_post_id, name)
);

-- Table des métriques des offres
CREATE TABLE posting_metrics (
                                 id BIGSERIAL PRIMARY KEY,
                                 job_post_id BIGINT NOT NULL,
                                 total_view_count INTEGER NOT NULL DEFAULT 0,
                                 unique_view_count INTEGER NOT NULL DEFAULT 0,
                                 total_application_count INTEGER NOT NULL DEFAULT 0,
                                 conversion_rate DOUBLE PRECISION,
                                 last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 CONSTRAINT fk_metrics_job_post FOREIGN KEY (job_post_id) REFERENCES job_postings(id) ON DELETE CASCADE,
                                 CONSTRAINT uq_metrics_job_post UNIQUE (job_post_id)
);

-- Table des snapshots quotidiens des métriques
CREATE TABLE metrics_daily_snapshots (
                                         id BIGSERIAL PRIMARY KEY,
                                         metrics_id BIGINT NOT NULL,
                                         date DATE NOT NULL,
                                         daily_view_count INTEGER NOT NULL DEFAULT 0,
                                         daily_unique_view_count INTEGER NOT NULL DEFAULT 0,
                                         daily_application_count INTEGER NOT NULL DEFAULT 0,
                                         CONSTRAINT fk_snapshot_metrics FOREIGN KEY (metrics_id) REFERENCES posting_metrics(id) ON DELETE CASCADE,
                                         CONSTRAINT uq_snapshot_date UNIQUE (metrics_id, date)
);

-- Table des modèles d'offres
CREATE TABLE posting_templates (
                                   id BIGSERIAL PRIMARY KEY,
                                   name VARCHAR(100) NOT NULL,
                                   description VARCHAR(500),
                                   department VARCHAR(100),
                                   structure JSONB,
                                   is_active BOOLEAN NOT NULL DEFAULT TRUE,
                                   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   created_by VARCHAR(255) NOT NULL,
                                   last_modified_at TIMESTAMP,
                                   version INTEGER DEFAULT 0,
                                   CONSTRAINT uq_template_name UNIQUE (name)
);

-- Table des fragments de contenu réutilisables
CREATE TABLE content_fragments (
                                   id BIGSERIAL PRIMARY KEY,
                                   fragment_key VARCHAR(100) NOT NULL,
                                   content TEXT NOT NULL,
                                   type VARCHAR(50) NOT NULL,
                                   language VARCHAR(10),
                                   is_active BOOLEAN NOT NULL DEFAULT TRUE,
                                   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   created_by VARCHAR(255) NOT NULL,
                                   last_modified_at TIMESTAMP,
                                   last_modified_by VARCHAR(255),
                                   CONSTRAINT uq_fragment_key UNIQUE (fragment_key)
);

-- Table du journal d'activité
CREATE TABLE activity_logs (
                               id BIGSERIAL PRIMARY KEY,
                               job_post_id BIGINT NOT NULL,
                               user_id VARCHAR(255) NOT NULL,
                               user_name VARCHAR(255),
                               action VARCHAR(50) NOT NULL,
                               details TEXT,
                               timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               CONSTRAINT fk_log_job_post FOREIGN KEY (job_post_id) REFERENCES job_postings(id) ON DELETE CASCADE
);

-- Index pour la table activity_logs
CREATE INDEX idx_activity_logs_job_post_id ON activity_logs(job_post_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);