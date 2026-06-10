-- GearUp — uitlegteksten per onderdeel-categorie + winkel/bron op producten
-- Draai dit in de Supabase SQL-editor (Project → SQL → New query).
-- De applicatie leest gearup_uitleg defensief in: zolang deze tabel niet bestaat
-- of leeg is, tonen de onderdeel-blokken alleen de koopopties (geen prozatekst).

-- 1) Uitlegteksten op categorie-niveau (niet per individueel model), per taal.
--    onderdeel_categorie gebruikt deze sleutels:
--      brandstof-4takt, brandstof-2takt, maaimes, ketting, bougie, filter,
--      olie, maaidraad, accu, lader, zaagblad, boren
--    De brandstof-uitleg is bewust gesplitst in 4-takt en 2-takt.
create table if not exists public.gearup_uitleg (
  id uuid primary key default gen_random_uuid(),
  onderdeel_categorie text not null,
  taal text not null check (taal in ('nl', 'de', 'en')),
  titel text,
  uitleg_tekst text,
  waarschuwing text,
  created_at timestamptz not null default now(),
  unique (onderdeel_categorie, taal)
);

-- Openbaar leesbaar (zelfde leesmodel als de overige gearup_-tabellen).
alter table public.gearup_uitleg enable row level security;

drop policy if exists "gearup_uitleg public read" on public.gearup_uitleg;
create policy "gearup_uitleg public read"
  on public.gearup_uitleg
  for select
  using (true);

-- 2) Winkel/bron op producten, voor het label "Bekijk · bol.com".
--    Leeg laten = geen winkel-label tonen.
alter table public.gearup_producten
  add column if not exists winkel text;

-- ───────────────────────────────────────────────────────────────────────────
-- Lege voorbeeldrijen (taal NL) — vul titel/uitleg_tekst/waarschuwing later met
-- GEVERIFIEERDE teksten. Verwijder deze sectie als je liever vanaf nul invult.
-- Uncomment om de structuur alvast aan te maken:
--
-- insert into public.gearup_uitleg (onderdeel_categorie, taal) values
--   ('brandstof-4takt','nl'), ('brandstof-2takt','nl'),
--   ('maaimes','nl'), ('ketting','nl'), ('bougie','nl'),
--   ('filter','nl'), ('olie','nl'), ('maaidraad','nl')
-- on conflict (onderdeel_categorie, taal) do nothing;
