-- Expanded sports catalog: martial arts, combat sports, outdoor, team sports
-- Run this in Supabase SQL Editor
-- Uses ON CONFLICT so it is safe to re-run at any time.

INSERT INTO public.exercises (name, category, met)
VALUES

  -- ── Martial Arts ────────────────────────────────────────────────────────────
  ('Boxing (bag work)',          'Martial Arts', 9.0),
  ('Boxing (sparring)',          'Martial Arts', 11.0),
  ('Muay Thai',                  'Martial Arts', 10.0),
  ('Muay Thai (sparring)',       'Martial Arts', 12.0),
  ('Kickboxing',                 'Martial Arts', 10.3),
  ('Kickboxing (sparring)',      'Martial Arts', 12.0),
  ('Brazilian Jiu-Jitsu (BJJ)', 'Martial Arts', 9.5),
  ('BJJ (sparring / rolling)',   'Martial Arts', 11.5),
  ('Wrestling',                  'Martial Arts', 9.8),
  ('Wrestling (competitive)',    'Martial Arts', 13.0),
  ('Judo',                       'Martial Arts', 10.3),
  ('Judo (randori / sparring)',  'Martial Arts', 12.0),
  ('Karate (kata)',              'Martial Arts', 7.0),
  ('Karate (kumite)',            'Martial Arts', 10.5),
  ('Taekwondo',                  'Martial Arts', 10.3),
  ('Taekwondo (sparring)',       'Martial Arts', 12.5),
  ('Sambo',                      'Martial Arts', 11.0),
  ('MMA Training',               'Martial Arts', 10.5),
  ('MMA (sparring)',             'Martial Arts', 13.0),
  ('Capoeira',                   'Martial Arts', 9.5),
  ('Kung Fu',                    'Martial Arts', 9.5),
  ('Wing Chun',                  'Martial Arts', 7.5),
  ('Tai Chi',                    'Martial Arts', 4.0),
  ('Krav Maga',                  'Martial Arts', 10.0),
  ('Hapkido',                    'Martial Arts', 8.5),
  ('Aikido',                     'Martial Arts', 7.0),
  ('Ninjutsu',                   'Martial Arts', 8.0),
  ('Escrima / Arnis',            'Martial Arts', 7.5),
  ('Pankration',                 'Martial Arts', 12.0),
  ('Lethwei',                    'Martial Arts', 12.5),
  ('Savate',                     'Martial Arts', 10.0),
  ('Sumo',                       'Martial Arts', 8.3),
  ('Grappling (no-gi)',          'Martial Arts', 10.5),

  -- ── Sparring / Combat drills (standalone) ───────────────────────────────────
  ('Sparring (general)',         'Martial Arts', 11.5),
  ('Shadow Boxing',              'Martial Arts', 7.8),
  ('Pad Work',                   'Martial Arts', 9.0),
  ('Heavy Bag Training',         'Martial Arts', 9.0),
  ('Speed Bag Training',         'Martial Arts', 7.5),
  ('Clinch Work',                'Martial Arts', 8.5),
  ('Takedown Drilling',          'Martial Arts', 8.5),

  -- ── Outdoor / Adventure ─────────────────────────────────────────────────────
  ('Mountain Climbing',          'Sports', 11.0),
  ('Rock Climbing (indoor)',     'Sports', 8.0),
  ('Rock Climbing (outdoor)',    'Sports', 9.8),
  ('Trail Running',              'Cardio',  9.0),
  ('Hiking (hills)',             'Cardio',  7.0),
  ('Hiking (flat)',              'Cardio',  5.3),
  ('Trekking (loaded pack)',     'Sports', 8.5),
  ('Bouldering',                 'Sports', 8.0),
  ('Via Ferrata',                'Sports', 7.5),

  -- ── Racket Sports ────────────────────────────────────────────────────────────
  ('Padel (recreational)',       'Sports', 6.0),
  ('Padel (competitive)',        'Sports', 8.0),
  ('Squash',                     'Sports', 12.1),
  ('Badminton (recreational)',   'Sports', 5.5),
  ('Badminton (competitive)',    'Sports', 8.0),
  ('Table Tennis',               'Sports', 4.0),
  ('Pickleball',                 'Sports', 5.5),

  -- ── Football / Soccer ────────────────────────────────────────────────────────
  ('Football (match)',           'Sports', 10.3),
  ('Football (training)',        'Sports', 8.0),
  ('Football (futsal)',          'Sports', 9.0),
  ('Football (5-a-side)',        'Sports', 8.5),
  ('Football (shooting drills)', 'Sports', 6.5),

  -- ── Other Team / Field Sports ────────────────────────────────────────────────
  ('Rugby',                      'Sports', 10.2),
  ('American Football',          'Sports', 8.9),
  ('Cricket (batting/fielding)', 'Sports', 5.0),
  ('Baseball',                   'Sports', 5.0),
  ('Hockey (field)',             'Sports', 8.0),
  ('Ice Hockey',                 'Sports', 10.0),
  ('Lacrosse',                   'Sports', 8.0),
  ('Waterpolo',                  'Sports', 10.0),

  -- ── Water Sports ─────────────────────────────────────────────────────────────
  ('Open Water Swimming',        'Cardio', 9.8),
  ('Surfing',                    'Sports', 5.5),
  ('Kayaking',                   'Sports', 5.0),
  ('Stand-Up Paddleboarding',    'Sports', 6.0),
  ('Sailing',                    'Sports', 3.0),

  -- ── Gymnastics / Calisthenics ────────────────────────────────────────────────
  ('Gymnastics',                 'Strength', 5.5),
  ('Calisthenics (advanced)',    'Strength', 8.0),
  ('Parkour',                    'Cardio',  9.5),
  ('Crossfit',                   'Strength', 8.5)

ON CONFLICT (name) DO UPDATE SET
  category = excluded.category,
  met      = excluded.met;
