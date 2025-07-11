-- Create indexes for performance optimization

-- Applications indexes
CREATE INDEX idx_application_candidate ON applications(candidate_id);
CREATE INDEX idx_application_job ON applications(job_posting_id);
CREATE INDEX idx_application_status ON applications(status);
CREATE INDEX idx_application_submitted_at ON applications(submitted_at);

-- AI Settings indexes
CREATE UNIQUE INDEX idx_ai_settings_department_job_type ON ai_settings(department, job_type)
    WHERE job_type IS NOT NULL;
CREATE UNIQUE INDEX idx_ai_settings_department ON ai_settings(department)
    WHERE job_type IS NULL;

-- Status history indexes
CREATE INDEX idx_status_history_application ON application_status_history(application_id);
CREATE INDEX idx_status_history_changed_at ON application_status_history(changed_at);

-- Evaluations indexes
CREATE INDEX idx_evaluation_application ON evaluations(application_id);
CREATE INDEX idx_evaluation_score ON evaluations(overall_score);

-- Metrics indexes
CREATE INDEX idx_metrics_date ON metrics(metrics_date);
CREATE INDEX idx_metrics_department ON metrics(department);
CREATE UNIQUE INDEX idx_metrics_date_department ON metrics(metrics_date, department)
    WHERE department IS NOT NULL;

-- Reports indexes
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_job_posting ON reports(job_posting_id);
CREATE INDEX idx_reports_department ON reports(department);
CREATE INDEX idx_reports_report_type ON reports(report_type);

-- Outbox events indexes
CREATE INDEX idx_outbox_processed ON outbox_events(processed);
CREATE INDEX idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);
CREATE INDEX idx_outbox_creation_time ON outbox_events(creation_time);