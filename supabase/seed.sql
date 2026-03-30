-- ============================================================
-- JULIES ART — Seed Data
-- ============================================================
-- Run AFTER schema.sql
-- Creates sample categories, products, and personalization config

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active) VALUES
  ('cat-001-0000-0000-0000-000000000001', 'Tandendoosjes', 'tandendoosjes', 'Lieve tandendoosjes voor het bewaren van het eerste melktandje. Gepersonaliseerd met de naam van jouw kind.', 1, true),
  ('cat-002-0000-0000-0000-000000000002', 'Houten koffertjes', 'houten-koffertjes', 'Houten koffertjes als bijzonder kraamcadeau of verjaarscadeau, gepersonaliseerd met naam of initialen.', 2, true),
  ('cat-003-0000-0000-0000-000000000003', 'Siliconen slabbers', 'siliconen-slabbers', 'Zachte, duurzame siliconen slabbers in prachtige pasteltinten — met de naam van jouw kleintje erop.', 3, true),
  ('cat-004-0000-0000-0000-000000000004', 'Kraamcadeaus', 'kraamcadeaus', 'De mooiste gepersonaliseerde kraamcadeaus voor het nieuwe kindje en de trotse ouders.', 4, true);

-- ============================================================
-- PRODUCTS
-- ============================================================

-- Product 1: Tandendoosje
INSERT INTO public.products (id, name, slug, description, short_description, price, compare_at_price, category_id, is_active, is_featured, meta_title, meta_description) VALUES
(
  'prod-001-0000-0000-0000-000000000001',
  'Gepersonaliseerd Tandendoosje',
  'gepersonaliseerd-tandendoosje',
  '<p>Dit lieve tandendoosje is het perfecte aandenken voor het eerste verloren melktandje van jouw kind. Gemaakt van duurzaam hout, voorzien van een zachte binnenbekleding en de naam van jouw kind.</p><p>Het doosje past gemakkelijk in een kistje of plakboek en is een bijzonder klein cadeau dat een groot hart vertegenwoordigt.</p><ul><li>Materiaal: duurzaam berkenhout</li><li>Afmetingen: ca. 5 × 4 × 2,5 cm</li><li>Binnenbekleding van zacht fluweel</li><li>Inclusief cadeauverpakking</li></ul>',
  'Bewaar het eerste melktandje op een bijzondere manier — met de naam van jouw kleintje.',
  14.95,
  NULL,
  'cat-001-0000-0000-0000-000000000001',
  true,
  true,
  'Gepersonaliseerd Tandendoosje | Julies Art',
  'Bestel een gepersonaliseerd houten tandendoosje met de naam van jouw kind. Duurzaam en een prachtig aandenken.'
),
-- Product 2: Siliconen Slabber
(
  'prod-002-0000-0000-0000-000000000002',
  'Siliconen Slabber met Naam',
  'siliconen-slabber-met-naam',
  '<p>Onze gepersonaliseerde siliconen slabbers zijn zacht, makkelijk schoon te maken en oogstrelend mooi. Gemaakt van 100% voedingsveilig silicoon zonder BPA, ftalaten of latex.</p><p>De naam van jouw kleintje wordt er met zorg op aangebracht. Verkrijgbaar in prachtige pasteltinten die perfect aansluiten bij een kinderkamer.</p><ul><li>Materiaal: 100% BPA-vrij voedingsveilig silicoon</li><li>Afmetingen: ca. 28 × 22 cm (met bochtje voor kruimels)</li><li>Verstelbare gesp, geschikt voor baby''s van 4 tot 24 maanden</li><li>Vaatwasserbestendig</li></ul>',
  'Zachte siliconen slabber in pasteltinten, gepersonaliseerd met de naam van jouw baby.',
  12.95,
  NULL,
  'cat-003-0000-0000-0000-000000000003',
  true,
  true,
  'Siliconen Slabber met Naam | Julies Art',
  'Gepersonaliseerde siliconen slabber in prachtige pasteltinten. BPA-vrij, vaatwasserbestendig en voorzien van de naam van jouw kleintje.'
),
-- Product 3: Houten Koffertje
(
  'prod-003-0000-0000-0000-000000000003',
  'Houten Herinneringskoffertje',
  'houten-herinneringskoffertje',
  '<p>Dit prachtige houten herinneringskoffertje is het ultieme kraamcadeau. Het is de perfecte plek om de mooiste herinneringen van de eerste levensjaren in te bewaren: de eerste schoen, een haarlokje, een fotoatje.</p><p>Gemaakt van massief berkenhout en met liefde voorzien van naam, geboortedatum of een persoonlijk icoon. Een cadeau dat een leven lang meegaat.</p><ul><li>Materiaal: massief berkenhout</li><li>Afmetingen: ca. 20 × 12 × 8 cm</li><li>Sluitring van metaal</li><li>Optioneel: naam, datum en icoon gegraveerd</li></ul>',
  'Een bijzonder houten koffertje voor de mooiste herinneringen — met naam, datum of icoon.',
  34.95,
  39.95,
  'cat-002-0000-0000-0000-000000000002',
  true,
  true,
  'Houten Herinneringskoffertje | Julies Art',
  'Bestel een gepersonaliseerd houten herinneringskoffertje als kraamcadeau. Met naam, geboortedatum en icoon. Uniek en persoonlijk.'
),
-- Product 4: Set tandendoosje + slabber
(
  'prod-004-0000-0000-0000-000000000004',
  'Kraamcadeau Set — Tandendoosje & Slabber',
  'kraamcadeau-set-tandendoosje-slabber',
  '<p>De perfecte kraamcadeauset, samengesteld met liefde. Inclusief een gepersonaliseerd tandendoosje én een siliconen slabber, beide voorzien van de naam van het nieuwe kindje.</p><p>Verpakt in een mooie geschenkdoos, klaar om cadeau te geven. Een cadeautje dat de ouders altijd zullen onthouden.</p>',
  'Het perfecte kraamcadeau: een gepersonaliseerd tandendoosje + slabber in een mooie geschenkdoos.',
  24.95,
  27.90,
  'cat-004-0000-0000-0000-000000000004',
  true,
  true,
  'Kraamcadeau Set | Julies Art',
  'Bestel een gepersonaliseerde kraamcadeauset met tandendoosje en siliconen slabber. Verpakt in een mooie geschenkdoos.'
);

-- ============================================================
-- PRODUCT IMAGES (placeholder URLs — replace with real Supabase storage URLs)
-- ============================================================
INSERT INTO public.product_images (product_id, url, alt, sort_order, is_primary) VALUES
  ('prod-001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', 'Gepersonaliseerd tandendoosje van hout', 0, true),
  ('prod-001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80', 'Tandendoosje open met fluwelen binnenkant', 1, false),
  ('prod-002-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', 'Siliconen slabber met naam in roze', 0, true),
  ('prod-002-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80', 'Siliconen slabber met naam in blauw', 1, false),
  ('prod-003-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', 'Houten herinneringskoffertje', 0, true),
  ('prod-003-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80', 'Koffertje open met inhoud', 1, false),
  ('prod-004-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', 'Kraamcadeau set in geschenkdoos', 0, true);

-- ============================================================
-- PERSONALIZATION FIELDS
-- ============================================================

-- Product 1: Tandendoosje — name + font
INSERT INTO public.personalization_fields (id, product_id, type, key, label, placeholder, help_text, is_required, max_length, sort_order) VALUES
  ('pf-001-0001-0000-0000-000000000001', 'prod-001-0000-0000-0000-000000000001', 'text', 'naam', 'Naam kind', 'bijv. Sophie', 'Vul hier de naam in zoals die op het doosje moet komen.', true, 20, 0),
  ('pf-001-0002-0000-0000-000000000002', 'prod-001-0000-0000-0000-000000000001', 'font', 'lettertype', 'Lettertype', NULL, 'Kies het lettertype voor de naam op het doosje.', true, NULL, 1);

-- Product 1 font options
INSERT INTO public.personalization_options (field_id, value, label, font_preview, sort_order) VALUES
  ('pf-001-0002-0000-0000-000000000002', 'speels', 'Speels', 'Pacifico', 0),
  ('pf-001-0002-0000-0000-000000000002', 'sierlijk', 'Sierlijk', 'Great Vibes', 1),
  ('pf-001-0002-0000-0000-000000000002', 'modern', 'Modern', 'Nunito', 2);

-- Product 2: Siliconen slabber — name + color
INSERT INTO public.personalization_fields (id, product_id, type, key, label, placeholder, help_text, is_required, max_length, sort_order) VALUES
  ('pf-002-0001-0000-0000-000000000001', 'prod-002-0000-0000-0000-000000000002', 'text', 'naam', 'Naam kind', 'bijv. Lotte', 'Vul hier de naam in voor op de slabber (max. 12 tekens).', true, 12, 0),
  ('pf-002-0002-0000-0000-000000000002', 'prod-002-0000-0000-0000-000000000002', 'color', 'kleur', 'Kleur slabber', NULL, 'Kies de kleur van de slabber.', true, NULL, 1);

-- Product 2 color options
INSERT INTO public.personalization_options (field_id, value, label, color_hex, sort_order) VALUES
  ('pf-002-0002-0000-0000-000000000002', 'roze', 'Roze', '#f9a8d4', 0),
  ('pf-002-0002-0000-0000-000000000002', 'beige', 'Beige', '#e5d5c0', 1),
  ('pf-002-0002-0000-0000-000000000002', 'blauw', 'Zacht blauw', '#93c5fd', 2),
  ('pf-002-0002-0000-0000-000000000002', 'mint', 'Mintgroen', '#6ee7b7', 3),
  ('pf-002-0002-0000-0000-000000000002', 'lila', 'Lila', '#c4b5fd', 4);

-- Product 3: Koffertje — name + date + icon + font
INSERT INTO public.personalization_fields (id, product_id, type, key, label, placeholder, help_text, is_required, max_length, sort_order) VALUES
  ('pf-003-0001-0000-0000-000000000001', 'prod-003-0000-0000-0000-000000000003', 'text', 'naam', 'Naam kind', 'bijv. Emma', 'Vul de naam in voor op het koffertje.', true, 20, 0),
  ('pf-003-0002-0000-0000-000000000002', 'prod-003-0000-0000-0000-000000000003', 'text', 'geboortedatum', 'Geboortedatum', 'bijv. 14-03-2024', 'Vul de geboortedatum in (optioneel). Wordt onder de naam gegraveerd.', false, 15, 1),
  ('pf-003-0003-0000-0000-000000000003', 'prod-003-0000-0000-0000-000000000003', 'icon', 'icoon', 'Icoon / Ontwerp', NULL, 'Kies een icoon dat bij jouw kind past.', true, NULL, 2),
  ('pf-003-0004-0000-0000-000000000004', 'prod-003-0000-0000-0000-000000000003', 'font', 'lettertype', 'Lettertype', NULL, 'Kies het lettertype voor de naam.', true, NULL, 3);

-- Product 3 icon options
INSERT INTO public.personalization_options (field_id, value, label, sort_order) VALUES
  ('pf-003-0003-0000-0000-000000000003', 'ster', 'Ster ⭐', 0),
  ('pf-003-0003-0000-0000-000000000003', 'maan', 'Maan 🌙', 1),
  ('pf-003-0003-0000-0000-000000000003', 'konijn', 'Konijntje 🐰', 2),
  ('pf-003-0003-0000-0000-000000000003', 'bloem', 'Bloem 🌸', 3),
  ('pf-003-0003-0000-0000-000000000003', 'hart', 'Hartje ❤️', 4),
  ('pf-003-0003-0000-0000-000000000003', 'vlinder', 'Vlinder 🦋', 5);

-- Product 3 font options (same as product 1)
INSERT INTO public.personalization_options (field_id, value, label, font_preview, sort_order) VALUES
  ('pf-003-0004-0000-0000-000000000004', 'speels', 'Speels', 'Pacifico', 0),
  ('pf-003-0004-0000-0000-000000000004', 'sierlijk', 'Sierlijk', 'Great Vibes', 1),
  ('pf-003-0004-0000-0000-000000000004', 'modern', 'Modern', 'Nunito', 2);

-- Product 4: Kraamcadeau set — name only
INSERT INTO public.personalization_fields (id, product_id, type, key, label, placeholder, help_text, is_required, max_length, sort_order) VALUES
  ('pf-004-0001-0000-0000-000000000001', 'prod-004-0000-0000-0000-000000000004', 'text', 'naam', 'Naam van het kindje', 'bijv. Finn', 'Deze naam komt op zowel het tandendoosje als de slabber.', true, 12, 0),
  ('pf-004-0002-0000-0000-000000000002', 'prod-004-0000-0000-0000-000000000004', 'color', 'kleur_slabber', 'Kleur slabber', NULL, 'Kies de kleur voor de siliconen slabber.', true, NULL, 1);

-- Product 4 color options
INSERT INTO public.personalization_options (field_id, value, label, color_hex, sort_order) VALUES
  ('pf-004-0002-0000-0000-000000000002', 'roze', 'Roze', '#f9a8d4', 0),
  ('pf-004-0002-0000-0000-000000000002', 'beige', 'Beige', '#e5d5c0', 1),
  ('pf-004-0002-0000-0000-000000000002', 'blauw', 'Zacht blauw', '#93c5fd', 2),
  ('pf-004-0002-0000-0000-000000000002', 'mint', 'Mintgroen', '#6ee7b7', 3),
  ('pf-004-0002-0000-0000-000000000002', 'lila', 'Lila', '#c4b5fd', 4);

-- ============================================================
-- DISCOUNT CODE (sample)
-- ============================================================
INSERT INTO public.discount_codes (code, type, value, description, min_order_amount, is_active, valid_until) VALUES
  ('WELKOM10', 'percentage', 10, 'Welkomstkorting 10% voor nieuwe klanten', 15.00, true, now() + interval '1 year');

-- ============================================================
-- ADMIN USER
-- ============================================================
-- After running this seed, create an admin user in the Supabase
-- Auth dashboard, then run this to grant admin role:
--
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
