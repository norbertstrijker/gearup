-- GearUp — echte database omzetten naar de nieuwe structuur (7 nov 2026).
-- Besluit Norbert 7 nov 2026: er is één database (de echte); geen testdatabase zolang er geen bezoekers zijn.
-- Dit bestand bundelt drie bestaande migraties in één keer, alles-of-niets:
--   0004 onderdelen en koppelingen · 0006 de 40 oude machines en 13 oude producten verwijderen · 0007 toevoegsysteem.
-- VOORAF: back-up. Supabase → Table Editor → gearup_machines en gearup_producten → Export to CSV
--         → bewaren in C:\Users\sdkom\gearup\supabase\backup\.
-- Gaat er iets mis (bijvoorbeeld de aantallen kloppen niet), dan verandert er niets.
-- Na afloop toont de laatste regel: OMGEZET ...
begin;

-- ===== 0004_onderdelen_koppelingen.sql =====
-- GearUp — database-aanpassing (afvinklijst 5.1), 2 nov 2026
-- Ontwerp: docs/GearUp_Vulformaat.md §4 (versie 2). EERST op de testdatabase; pas na toetsvragen T1–T8 in productie.
-- Additief: bestaande kolommen en gedrag blijven; de app werkt ongewijzigd (T8).

-- 1) Machines: één rij per uitvoering, met sleutels, maker en bron
alter table public.gearup_machines
  add column if not exists uitvoering text,
  add column if not exists typenummer text,
  add column if not exists typecode text,
  add column if not exists serienummer_van text,
  add column if not exists serienummer_tot text,
  add column if not exists maker text,
  add column if not exists zustermachine text,
  add column if not exists olie_spec text,
  add column if not exists bron_url text,
  add column if not exists bron_datum date,
  add column if not exists scope text not null default 'binnen';

-- 2) Onderdelen: los van machines
create table if not exists public.gearup_onderdelen (
  id uuid primary key default gen_random_uuid(),
  producttype text not null,
  naam text not null,
  maker text,
  fabrieksnummer text,
  gelijkwaardig text[] not null default '{}',
  universeel_type text,
  specificatie text,
  soort smallint check (soort in (1, 2, 3)),
  created_at timestamptz not null default now()
);
create unique index if not exists gearup_onderdelen_maker_nummer
  on public.gearup_onderdelen (maker, fabrieksnummer) where fabrieksnummer is not null;

-- 3) Koppelingen: "past op", met bron en status (beslisregel 5)
create table if not exists public.gearup_koppelingen (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.gearup_machines (id) on delete cascade,
  onderdeel_id uuid not null references public.gearup_onderdelen (id) on delete restrict,
  geldt_voor text,
  aantal smallint not null default 1,
  status text not null check (status in ('geverifieerd', 'niet geverifieerd')),
  bron_url text,
  bron_soort text,
  bron_datum date,
  actie text,
  created_at timestamptz not null default now()
);
create index if not exists gearup_koppelingen_machine on public.gearup_koppelingen (machine_id);
create index if not exists gearup_koppelingen_onderdeel on public.gearup_koppelingen (onderdeel_id);

-- 4) Kooplink hoort bij het onderdeel (één kooplink voor alle passende machines)
alter table public.gearup_producten
  add column if not exists onderdeel_id uuid references public.gearup_onderdelen (id) on delete set null;

-- 5) Merk-aliassen voor zoeken (Automower → Husqvarna, Sthil → Stihl)
create table if not exists public.gearup_merk_aliassen (
  alias text primary key,
  merk text not null
);

-- 6) Weergave voor de site: per machine de onderdelen met status
create or replace view public.gearup_machine_onderdelen
with (security_invoker = true) as
select k.machine_id, m.merk, m.modelnummer, m.uitvoering,
       o.id as onderdeel_id, o.producttype, o.naam, o.fabrieksnummer, o.universeel_type,
       o.specificatie, o.soort, k.geldt_voor, k.aantal, k.status, k.bron_url, k.bron_soort
from public.gearup_koppelingen k
join public.gearup_machines m on m.id = k.machine_id
join public.gearup_onderdelen o on o.id = k.onderdeel_id;

-- 7) Openbaar leesbaar, zoals de bestaande tabellen
alter table public.gearup_onderdelen enable row level security;
alter table public.gearup_koppelingen enable row level security;
alter table public.gearup_merk_aliassen enable row level security;
drop policy if exists "Public read gearup_onderdelen" on public.gearup_onderdelen;
create policy "Public read gearup_onderdelen" on public.gearup_onderdelen for select using (true);
drop policy if exists "Public read gearup_koppelingen" on public.gearup_koppelingen;
create policy "Public read gearup_koppelingen" on public.gearup_koppelingen for select using (true);
drop policy if exists "Public read gearup_merk_aliassen" on public.gearup_merk_aliassen;
create policy "Public read gearup_merk_aliassen" on public.gearup_merk_aliassen for select using (true);

-- ===== 0006_verwijder_oude_machines.sql =====
-- GearUp — de 40 oude machines en 13 oude producten verwijderen (besluit Norbert, 2 nov 2026:
-- "de huidige 40 machines zijn niet goed, deze data moet verwijderd worden").
-- ALLEEN IN PRODUCTIE, en alleen in deze volgorde:
--   1. back-up: in Supabase Table Editor gearup_machines en gearup_producten → "Export to CSV" (bewaren in supabase\backup\)
--   2. 0004_onderdelen_koppelingen.sql
--   3. dit bestand (0006)
--   4. direct daarna de geverifieerde data laden (dan is de site zo kort mogelijk leeg)
-- Herkenning oud: aangemaakt vóór de aanpassing, zonder bron (bron_url leeg) en zonder koppeling naar een onderdeel.
-- Veiligheid: stopt zonder iets te verwijderen als de aantallen niet 40 en 13 zijn (stand 2 nov 2026).
-- gearup_zoekopdrachten (zoeklog) en gearup_uitleg blijven staan.

do $$
declare
  n_m int; n_p int;
begin
  select count(*) into n_m from public.gearup_machines where bron_url is null;
  select count(*) into n_p from public.gearup_producten where onderdeel_id is null;
  if n_m <> 40 or n_p <> 13 then
    raise exception 'Gestopt: % oude machines en % oude producten gevonden, verwacht 40 en 13. Niets verwijderd.', n_m, n_p;
  end if;
  delete from public.gearup_producten where onderdeel_id is null;
  delete from public.gearup_machines where bron_url is null;
  raise notice 'Verwijderd: % machines en % producten.', n_m, n_p;
end $$;

-- ===== 0007_toevoegsysteem.sql =====
-- GearUp — toevoegsysteem (afvinklijst taak 10), 7 nov 2026
-- Eisen: GearUp_Eisen_Toevoegsysteem.md (versie 1). Werkwijze: GearUp_Werkwijze_Toevoegen.md.
-- Additief en idempotent: twee keer draaien geeft geen fout. Bestaande kolommen en gedrag blijven.
-- Volgorde in productie: na 0004 en 0006 (de oude machines zijn dan weg, dus de slug is uniek).
-- EERST op de testdatabase.

-- 1) Sleutels waarop het laden samenvoegt (eisen §5)
--    Machine: slug = merk + model + uitvoering (al aanwezig, nu uniek).
create unique index if not exists gearup_machines_slug_uniek
  on public.gearup_machines (slug);

--    Onderdeel: sleutel volgens eisen §5 (fabrieksnummer, universeel type of maat), gemaakt door het script.
alter table public.gearup_onderdelen
  add column if not exists sleutel text;
create unique index if not exists gearup_onderdelen_sleutel_uniek
  on public.gearup_onderdelen (sleutel) where sleutel is not null;

--    Koppeling: één per machine + onderdeel + "geldt voor".
create unique index if not exists gearup_koppelingen_uniek
  on public.gearup_koppelingen (machine_id, onderdeel_id, (coalesce(geldt_voor, '')));

-- 2) Herkomst per portie (logboek, terugdraaien, risico R7 en R8)
alter table public.gearup_machines
  add column if not exists portie text,
  add column if not exists bijgewerkt_portie text;
alter table public.gearup_onderdelen
  add column if not exists portie text,
  add column if not exists bijgewerkt_portie text;
alter table public.gearup_koppelingen
  add column if not exists portie text,
  add column if not exists bijgewerkt_portie text;

-- 3) Tweede bron voor dezelfde koppeling (eisen §3: via beide routes binnen = één koppeling, met beide bronnen)
alter table public.gearup_koppelingen
  add column if not exists extra_bronnen jsonb not null default '[]'::jsonb;

commit;

select 'OMGEZET: ' || (select count(*) from public.gearup_machines) || ' machines, '
  || (select count(*) from public.gearup_producten) || ' producten, '
  || (select count(*) from public.gearup_zoekopdrachten) || ' zoekopdrachten bewaard; nieuwe tabellen: '
  || (select count(*) from information_schema.tables where table_schema = 'public' and table_name in ('gearup_onderdelen','gearup_koppelingen','gearup_merk_aliassen'))
  || ' van 3' as uitkomst;
