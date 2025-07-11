CREATE TABLE IF NOT EXISTS interviews (
                                          id BIGSERIAL PRIMARY KEY,
                                          application_id BIGINT NOT NULL,
                                          application_reference VARCHAR(50) NOT NULL,
                                          candidate_id VARCHAR(255) NOT NULL,
                                          candidate_name VARCHAR(255) NOT NULL,
                                          job_posting_id BIGINT NOT NULL,
                                          job_title VARCHAR(255),
                                          job_department VARCHAR(255),
                                          status VARCHAR(20) NOT NULL,
                                          type VARCHAR(20) NOT NULL,
                                          description TEXT,
                                          selected_slot_id BIGINT,
                                          scheduled_at TIMESTAMP,
                                          format VARCHAR(20),
                                          location VARCHAR(255),
                                          meeting_link VARCHAR(255),
                                          google_calendar_event_id VARCHAR(255),
                                          overall_score DOUBLE PRECISION,
                                          feedback_summary TEXT,
                                          is_recommended BOOLEAN,
                                          completed_at TIMESTAMP,
                                          canceled_at TIMESTAMP,
                                          cancellation_reason TEXT,
                                          canceled_by VARCHAR(255),
                                          deleted BOOLEAN DEFAULT FALSE,
                                          created_at TIMESTAMP NOT NULL,
                                          created_by VARCHAR(255),
                                          updated_at TIMESTAMP,
                                          updated_by VARCHAR(255),
                                          version INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS interview_slots (
                                               id BIGSERIAL PRIMARY KEY,
                                               interview_id BIGINT NOT NULL,
                                               start_date_time TIMESTAMP NOT NULL,
                                               end_date_time TIMESTAMP NOT NULL,
                                               format VARCHAR(20) NOT NULL,
                                               location VARCHAR(255),
                                               meeting_link VARCHAR(255),
                                               status VARCHAR(20) NOT NULL,
                                               google_calendar_event_id VARCHAR(255),
                                               participants TEXT,
                                               cancellation_reason TEXT,
                                               canceled_at TIMESTAMP,
                                               canceled_by VARCHAR(255),
                                               created_at TIMESTAMP NOT NULL,
                                               created_by VARCHAR(255),
                                               updated_at TIMESTAMP,
                                               updated_by VARCHAR(255),
                                               version INTEGER DEFAULT 0,
                                               CONSTRAINT fk_slot_interview FOREIGN KEY (interview_id) REFERENCES interviews(id)
);

CREATE TABLE IF NOT EXISTS interview_participants (
                                                      id BIGSERIAL PRIMARY KEY,
                                                      interview_id BIGINT NOT NULL,
                                                      slot_id BIGINT,
                                                      user_id VARCHAR(255) NOT NULL,
                                                      user_email VARCHAR(255) NOT NULL,
                                                      user_name VARCHAR(255) NOT NULL,
                                                      role VARCHAR(20) NOT NULL,
                                                      status VARCHAR(20) NOT NULL,
                                                      is_organizer BOOLEAN DEFAULT FALSE,
                                                      is_required BOOLEAN DEFAULT TRUE,
                                                      notes TEXT,
                                                      created_at TIMESTAMP NOT NULL,
                                                      created_by VARCHAR(255),
                                                      updated_at TIMESTAMP,
                                                      updated_by VARCHAR(255),
                                                      version INTEGER DEFAULT 0,
                                                      CONSTRAINT fk_participant_interview FOREIGN KEY (interview_id) REFERENCES interviews(id),
                                                      CONSTRAINT fk_participant_slot FOREIGN KEY (slot_id) REFERENCES interview_slots(id)
);

CREATE TABLE IF NOT EXISTS interview_feedbacks (
                                                   id BIGSERIAL PRIMARY KEY,
                                                   interview_id BIGINT NOT NULL,
                                                   evaluator_id VARCHAR(255) NOT NULL,
                                                   evaluator_name VARCHAR(255) NOT NULL,
                                                   technical_score INTEGER NOT NULL,
                                                   cultural_score INTEGER NOT NULL,
                                                   communication_score INTEGER NOT NULL,
                                                   technical_comments TEXT,
                                                   cultural_comments TEXT,
                                                   communication_comments TEXT,
                                                   general_comments TEXT,
                                                   recommendation VARCHAR(30) NOT NULL,
                                                   recommendation_reason TEXT,
                                                   has_submitted BOOLEAN DEFAULT TRUE,
                                                   created_at TIMESTAMP NOT NULL,
                                                   created_by VARCHAR(255),
                                                   updated_at TIMESTAMP,
                                                   updated_by VARCHAR(255),
                                                   version INTEGER DEFAULT 0,
                                                   CONSTRAINT fk_feedback_interview FOREIGN KEY (interview_id) REFERENCES interviews(id)
);

CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_slots_interview_id ON interview_slots(interview_id);
CREATE INDEX idx_slots_status ON interview_slots(status);
CREATE INDEX idx_participants_interview_id ON interview_participants(interview_id);
CREATE INDEX idx_feedbacks_interview_id ON interview_feedbacks(interview_id);