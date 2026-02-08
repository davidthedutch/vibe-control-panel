-- Seed data: Demo project
INSERT INTO projects (id, name, description, status, tech_stack, urls) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Website',
  'Een voorbeeld website om het Control Panel te demonstreren',
  'in_development',
  '{"framework": "Next.js 15", "styling": "Tailwind CSS 4", "ui": "shadcn/ui", "database": "Supabase"}',
  '{"development": "http://localhost:3001", "production": "", "staging": ""}'
);

-- Demo componenten
INSERT INTO components (id, project_id, name, type, category, file_path, status, description) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Header', 'layout', 'layout', 'src/components/layout/Header.tsx', 'working', 'Hoofdnavigatie met logo en menu'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Footer', 'layout', 'layout', 'src/components/layout/Footer.tsx', 'working', 'Footer met links en copyright'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'HeroSection', 'feature', 'sections', 'src/components/features/HeroSection.tsx', 'working', 'Hero sectie met titel, subtitel en CTA'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'PricingCard', 'ui', 'cards', 'src/components/ui/PricingCard.tsx', 'broken', 'Pricing kaart met prijs en features lijst'),
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'ContactForm', 'feature', 'forms', 'src/components/features/ContactForm.tsx', 'working', 'Contact formulier met validatie'),
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001', 'Navigation', 'ui', 'navigation', 'src/components/ui/Navigation.tsx', 'working', 'Navigatie menu component'),
  ('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000001', 'ThemeToggle', 'ui', 'controls', 'src/components/ui/ThemeToggle.tsx', 'broken', 'Dark/light mode toggle');

-- Demo dependencies
INSERT INTO component_dependencies (source_id, target_id, type) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0001-000000000006', 'renders'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0001-000000000007', 'renders'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0001-000000000001', 'imports');

-- Demo features
INSERT INTO features (id, project_id, name, description, status, priority, actions, user_flows) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'Navigatie', 'Hoofdmenu navigatie met responsive hamburger menu', 'working', 'high',
   '[{"id":"act-1","trigger":"Klik op menu item","behavior":"Navigeert naar de juiste pagina","status":"working"},{"id":"act-2","trigger":"Klik hamburger icon (mobile)","behavior":"Opent/sluit mobile menu","status":"working"}]',
   '[{"name":"Desktop navigatie","steps":["Gebruiker ziet menu bovenaan","Klikt op menu item","Wordt naar pagina gestuurd"],"happyPath":true,"edgeCases":[]}]'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'Contact Formulier', 'Formulier voor bezoekers om contact op te nemen', 'working', 'medium',
   '[{"id":"act-3","trigger":"Klik op Verstuur","behavior":"Valideert input en stuurt email","status":"working"},{"id":"act-4","trigger":"Ongeldige input","behavior":"Toont foutmeldingen per veld","status":"working"}]',
   '[{"name":"Succesvol contact","steps":["Gebruiker vult naam in","Vult email in","Schrijft bericht","Klikt verstuur","Ziet bevestiging"],"happyPath":true,"edgeCases":["Ongeldig email adres","Leeg bericht"]}]'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'Dark Mode', 'Wisselen tussen licht en donker thema', 'broken', 'low',
   '[{"id":"act-5","trigger":"Klik op toggle","behavior":"Wisselt kleurthema","status":"broken"}]',
   '[]');

-- Feature-component koppelingen
INSERT INTO feature_components (feature_id, component_id) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000006'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000005'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000007');

-- Demo prompts
INSERT INTO prompts (project_id, prompt_text, prompt_type, ai_model, session_tool, result, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Maak een responsive header met logo links en navigatie rechts', 'new-component', 'Claude Opus 4.6', 'Claude Code', 'Header component aangemaakt met responsive design', 'success'),
  ('00000000-0000-0000-0000-000000000001', 'Voeg een hero sectie toe met grote titel, subtitel en blauwe CTA knop', 'new-component', 'Claude Opus 4.6', 'Claude Code', 'HeroSection aangemaakt met design tokens', 'success'),
  ('00000000-0000-0000-0000-000000000001', 'Maak een contact formulier met naam, email en bericht velden plus validatie', 'feature', 'Claude Opus 4.6', 'Claude Code', 'ContactForm met Zod validatie aangemaakt', 'success');

-- Demo site users
INSERT INTO site_users (id, project_id, email, name, segment, total_sessions, external_id, first_seen, last_seen) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'jan@example.com', 'Jan de Vries', 'premium', 24, 'user_jan', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 minutes'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 'maria@example.com', 'Maria Jansen', 'user', 8, 'user_maria', NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 minutes'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', NULL, NULL, 'visitor', 1, 'anon_visitor1', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '3 minutes'),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', 'pieter@example.com', 'Pieter van Dam', 'user', 12, 'user_pieter', NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 minute'),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', NULL, NULL, 'visitor', 1, 'anon_visitor2', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '2 minutes'),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000001', 'lisa@example.com', 'Lisa Bakker', 'trial', 3, 'user_lisa', NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 minutes');

-- Demo active sessions
INSERT INTO site_sessions (id, user_id, project_id, started_at, is_online, device, browser, current_page, last_activity_at) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '12 minutes', true, 'desktop', 'Chrome', '/dashboard', NOW() - INTERVAL '5 minutes'),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 minutes', true, 'mobile', 'Safari', '/pricing', NOW() - INTERVAL '2 minutes'),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '8 minutes', true, 'desktop', 'Firefox', '/checkout', NOW() - INTERVAL '3 minutes'),
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 minute', true, 'desktop', 'Chrome', '/', NOW() - INTERVAL '1 minute'),
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 minutes', true, 'mobile', 'Chrome', '/features', NOW() - INTERVAL '2 minutes');

-- Demo user events
INSERT INTO user_events (session_id, user_id, project_id, event_type, page_url, created_at) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'page_view', '/dashboard', NOW() - INTERVAL '12 minutes'),
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'page_view', '/analytics', NOW() - INTERVAL '7 minutes'),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 'page_view', '/pricing', NOW() - INTERVAL '3 minutes'),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 'page_view', '/checkout', NOW() - INTERVAL '8 minutes'),
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', 'page_view', '/', NOW() - INTERVAL '1 minute');

-- Demo health checks
INSERT INTO health_checks (project_id, check_type, status, details, score) VALUES
  ('00000000-0000-0000-0000-000000000001', 'tokens-consistency', 'warn', '{"hardcoded_colors": 3, "files": ["PricingCard.tsx"]}', 75),
  ('00000000-0000-0000-0000-000000000001', 'manifest-sync', 'pass', '{"matched": 7, "missing": 0}', 100),
  ('00000000-0000-0000-0000-000000000001', 'broken-imports', 'pass', '{"checked": 42, "broken": 0}', 100),
  ('00000000-0000-0000-0000-000000000001', 'console-errors', 'fail', '{"errors": ["TypeError: Cannot read property of undefined at ThemeToggle.tsx:23"]}', 0),
  ('00000000-0000-0000-0000-000000000001', 'accessibility', 'warn', '{"missing_alt": 2, "missing_aria": 1}', 60);
