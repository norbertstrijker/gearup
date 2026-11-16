-- GearUp — basis: de bestaande tabellen zoals ze op 2 nov 2026 in productie staan
-- (vastgelegd met supabase/stand_vastleggen.sql → supabase/stand_2026-11-02.csv).
-- ALLEEN VOOR DE TESTDATABASE. In productie bestaan deze tabellen al (met de hand gemaakt);
-- dit bestand legt ze voor het eerst vast als migratie (afvinklijst 5.3).
-- Niet vastgelegd (niet in de stand-query): unieke sleutels en indexen buiten de primaire sleutel.

create table if not exists public.gearup_machines (
  id uuid primary key default gen_random_uuid(),
  merk text not null,
  modelnummer text not null,
  categorie text not null,
  motortype text not null,
  mengverhouding text,
  e10_geschikt boolean,
  slug text not null,
  afbeelding_url text,
  bouwjaar_van integer,
  bouwjaar_tot integer,
  handleiding_url text,
  created_at timestamptz default now()
);

create table if not exists public.gearup_producten (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid,
  categorie text not null,
  motortype text not null,
  markt text not null,
  producttype text not null,
  kwaliteit text not null,
  product_naam text not null,
  beschrijving text,
  prijs_indicatie numeric,
  affiliate_url text not null,
  afbeelding_url text,
  winkel text,
  created_at timestamptz default now()
);

create table if not exists public.gearup_zoekopdrachten (
  id uuid primary key default gen_random_uuid(),
  invoer text not null,
  gevonden boolean not null,
  taal text not null,
  created_at timestamptz default now()
);

alter table public.gearup_machines enable row level security;
alter table public.gearup_producten enable row level security;
alter table public.gearup_zoekopdrachten enable row level security;

drop policy if exists "Public read gearup_machines" on public.gearup_machines;
create policy "Public read gearup_machines" on public.gearup_machines for select using (true);
drop policy if exists "Public read gearup_producten" on public.gearup_producten;
create policy "Public read gearup_producten" on public.gearup_producten for select using (true);
drop policy if exists "Public insert gearup_zoekopdrachten" on public.gearup_zoekopdrachten;
create policy "Public insert gearup_zoekopdrachten" on public.gearup_zoekopdrachten for insert with check (true);

-- gearup_uitleg: zie 0001 en 0002.
