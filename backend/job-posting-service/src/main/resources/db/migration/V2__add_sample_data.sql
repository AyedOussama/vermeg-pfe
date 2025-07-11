-- V2__add_sample_data.sql
-- Données d'exemple pour le développement et les tests

-- Insérer des modèles d'offres
INSERT INTO posting_templates (name, description, department, structure, is_active, created_by)
VALUES
    ('Modèle Développeur IT', 'Modèle standard pour les postes de développement', 'IT',
     '{"sections":[{"id":"description","title":"Description du poste","required":true},{"id":"responsibilities","title":"Responsabilités","required":true},{"id":"qualifications","title":"Qualifications","required":true},{"id":"benefits","title":"Avantages","required":false}]}',
     TRUE, 'system'),
    ('Modèle Finance', 'Modèle pour les postes financiers', 'Finance',
     '{"sections":[{"id":"description","title":"Description du poste","required":true},{"id":"responsibilities","title":"Responsabilités","required":true},{"id":"qualifications","title":"Qualifications","required":true},{"id":"benefits","title":"Avantages","required":false}]}',
     TRUE, 'system'),
    ('Modèle Marketing', 'Modèle pour les postes marketing', 'Marketing',
     '{"sections":[{"id":"description","title":"Description du poste","required":true},{"id":"responsibilities","title":"Responsabilités","required":true},{"id":"qualifications","title":"Qualifications","required":true},{"id":"benefits","title":"Avantages","required":false}]}',
     TRUE, 'system');

-- Insérer des fragments de contenu
INSERT INTO content_fragments (fragment_key, content, type, language, is_active, created_by)
VALUES
    ('benefits.std.fr', 'Avantages sociaux compétitifs, horaires flexibles, environnement de travail stimulant, possibilités de développement professionnel.', 'BENEFIT', 'fr', TRUE, 'system'),
    ('benefits.std.en', 'Competitive benefits package, flexible hours, stimulating work environment, professional development opportunities.', 'BENEFIT', 'en', TRUE, 'system'),
    ('desc.it.java', 'Nous recherchons un développeur Java expérimenté pour rejoindre notre équipe dynamique. Vous travaillerez sur des projets innovants utilisant les dernières technologies.', 'DESCRIPTION', 'fr', TRUE, 'system'),
    ('desc.finance.analyst', 'Nous recherchons un analyste financier pour soutenir nos opérations. Vous serez responsable de l''analyse des données financières et de la production de rapports.', 'DESCRIPTION', 'fr', TRUE, 'system');

-- Insérer des offres d'emploi
INSERT INTO job_postings (title, department, location, employment_type, description, responsibilities, qualifications, benefits, min_experience, status, created_by, template_id)
VALUES
    ('Développeur Java Senior', 'IT', 'Paris, France', 'FULL_TIME',
     'Nous recherchons un développeur Java expérimenté pour rejoindre notre équipe dynamique.',
     'Développement d''applications, code review, mentoring.',
     'Au moins 5 ans d''expérience en Java, Spring Boot, connaissances en architecture microservices.',
     'Horaires flexibles, télétravail partiel, plan d''épargne entreprise.',
     5, 'DRAFT', 'admin', 1),
    ('Analyste Financier', 'Finance', 'Lyon, France', 'FULL_TIME',
     'Nous recherchons un analyste financier pour soutenir nos opérations.',
     'Analyse des données financières, production de rapports, support aux décisions stratégiques.',
     'Formation en finance, maîtrise d''Excel, expérience en analyse financière.',
     'Package compétitif, bonus annuel, formation continue.',
     3, 'PUBLISHED', 'admin', 2);

-- Ajouter des compétences aux offres
INSERT INTO job_posting_skills (job_post_id, name, is_required, level)
VALUES
    (1, 'Java', TRUE, 'Avancé'),
    (1, 'Spring Boot', TRUE, 'Avancé'),
    (1, 'Microservices', TRUE, 'Intermédiaire'),
    (1, 'SQL', FALSE, 'Intermédiaire'),
    (2, 'Excel', TRUE, 'Avancé'),
    (2, 'Analyse financière', TRUE, 'Avancé'),
    (2, 'Reporting', TRUE, 'Intermédiaire');

-- Initialiser les métriques pour l'offre publiée
INSERT INTO posting_metrics (job_post_id, total_view_count, unique_view_count, total_application_count, conversion_rate)
VALUES (2, 150, 120, 15, 12.5);

-- Ajouter des snapshots de métriques
-- Ajouter des snapshots de métriques
INSERT INTO metrics_daily_snapshots (metrics_id, date, daily_view_count, daily_unique_view_count, daily_application_count)
VALUES
    (1, CURRENT_DATE - INTERVAL '3 days', 45, 40, 3),
    (1, CURRENT_DATE - INTERVAL '2 days', 55, 45, 5),
    (1, CURRENT_DATE - INTERVAL '1 day', 50, 35, 7);

-- Ajouter des entrées de journal d'activité
INSERT INTO activity_logs (job_post_id, user_id, user_name, action, details)
VALUES
    (1, 'admin', 'Admin User', 'CREATED', 'Création initiale de l''offre'),
    (2, 'admin', 'Admin User', 'CREATED', 'Création initiale de l''offre'),
    (2, 'admin', 'Admin User', 'PUBLISHED', 'Publication de l''offre');