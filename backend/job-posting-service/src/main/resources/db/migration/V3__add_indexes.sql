-- V3__add_indexes.sql
-- Ajout d'index supplémentaires pour optimiser les performances

-- Index pour la recherche par mot-clé
CREATE INDEX idx_job_postings_title_text ON job_postings USING gin(to_tsvector('french', title));
CREATE INDEX idx_job_postings_description_text ON job_postings USING gin(to_tsvector('french', description));

-- Index pour les métriques
CREATE INDEX idx_posting_metrics_application_count ON posting_metrics(total_application_count);
CREATE INDEX idx_metrics_daily_snapshots_date ON metrics_daily_snapshots(date);

-- Index pour les templates actifs
CREATE INDEX idx_posting_templates_active ON posting_templates(is_active);

-- Index pour les fragments de contenu
CREATE INDEX idx_content_fragments_type ON content_fragments(type);
CREATE INDEX idx_content_fragments_language ON content_fragments(language);
CREATE INDEX idx_content_fragments_active ON content_fragments(is_active);