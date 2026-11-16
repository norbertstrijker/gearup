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
