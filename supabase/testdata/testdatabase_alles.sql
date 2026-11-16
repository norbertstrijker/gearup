-- GearUp testdatabase in één keer: 0000 + 0001 + 0002 + 0004 + testdata 0005 + toetsvragen T1–T8.
-- ALLEEN in het aparte testproject draaien, NIET in productie. Uitkomst: tabel met 8 toetsen, kolom 'geslaagd' moet overal 'true' zijn.

-- ===== 0000_basis_bestaande_tabellen.sql =====
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

-- ===== 0001_gearup_uitleg_en_winkel.sql =====
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

-- ===== 0002_plaatsing_advies.sql =====
-- GearUp — twee-delige uitleg op de resultaatpagina (fase-1 finetuning, punt F)
-- Draai dit in de Supabase SQL-editor.
--
-- gearup_uitleg krijgt een tweede tekstlaag:
--   * uitleg_tekst   = KEUZE-advies  ("waar let je op bij het kiezen van dit onderdeel")
--   * plaatsing_advies = PLAATSINGS-advies ("waar let je op bij het monteren",
--                        veilig/algemeen; de app toont er automatisch de zin
--                        "raadpleeg voor de exacte procedure de handleiding" bij)
--   * waarschuwing   = blijft de korte rode waarschuwing
--
-- Additief en idempotent. Teksten lever je later aan; leeg = blok wordt niet getoond.

alter table public.gearup_uitleg
  add column if not exists plaatsing_advies text;

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

-- ===== 0005_testdata_8_machines.sql =====
-- GearUp testdata (ALLEEN testdatabase): 8 machinedossiers + Echo zonder koppelingen, gegenereerd uit docs/sensor/diepte_*.json
-- Gegenereerd door maak_testdata.py op 2 nov 2026. Niet in productie draaien.
begin;
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('stihl-ms261c','Stihl','MS 261','MS 261 C',null,null,null,null,'kettingzaag','2-takt','1:50','Andreas Stihl AG & Co. KG',null,null,'https://www.stihl.de/de/p/kettensaegen-motorsaegen-ms-261-105118','2026-09-26');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('stihl-ms261cm','Stihl','MS 261','MS 261 C-M',null,null,null,null,'kettingzaag','2-takt','1:50','Andreas Stihl AG & Co. KG',null,null,'https://www.stihl.de/de/p/kettensaegen-motorsaegen-ms-261-105118','2026-09-26');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('parkside-pbrm51','Parkside','PBRM 51 A1','LB1/LB5/LB8 (IAN 420301)',null,null,null,null,'grasmaaier','4-takt',null,'Scheppach GmbH',null,'SAE 10W-30 of 10W-40, 0,4 l','https://shop.scheppach.com/spare-parts','2026-09-26');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('kibani-bm41','Kibani','Bosmaaier 4-in-1 52 cc','KBM41',null,'GTB5212U',null,null,'bosmaaier','2-takt','1:25','Kibani Europe (OEM *aangenomen* Chinese fabriek)',null,null,'https://kibani.nl/voor-de-tuin/kibani-bosmaaier-4-in-1','2026-10-03');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('karcher-k4pc','Kärcher','K 4 Power Control','*EU','1.324-030.0',null,null,null,'hogedrukreiniger','elektrisch',null,'Alfred Kärcher SE & Co. KG',null,null,'https://www.karcher.com/nl/nl/reserveonderdelen','2026-10-24');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('honda-hrx476c2-vkeh','Honda','HRX 476','HRX476C2 VKEH',null,'VKEH','MBYF-1062819','MBYF-9999999','grasmaaier','4-takt',null,'Honda Motor Co.',null,'SAE 10W-30','https://www.honda.co.jp/ownersmanual/HondaNederland/power/','2026-10-24');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('honda-hrx476c2-qyeh','Honda','HRX 476','HRX476C2 QYEH',null,'QYEH','MBYF-1062819','MBYF-9999999','grasmaaier','4-takt',null,'Honda Motor Co.',null,'SAE 10W-30','https://www.honda.co.jp/ownersmanual/HondaNederland/power/','2026-10-24');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('jd-stx38-zwart','John Deere','STX38','zwart maaidek (PC2399)',null,null,null,null,'zitmaaier','4-takt',null,'Deere & Company',null,null,'https://partscatalog.deere.com/jdrc/','2026-10-29');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('dolmar-ms43004u','Dolmar','MS-4300.4U',null,null,null,null,null,'bosmaaier','4-takt',null,'Makita (Makita Engineering Germany)','Makita EM4351UH (*aangenomen*)','SAE 10W-30, API SF+','https://www.makita.nl/onderdelentekeningen.html','2026-10-30');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('bosch-arm32','Bosch','ARM 32','3 600 H85 B09','3 600 H85 B09',null,null,null,'grasmaaier','elektrisch',null,'Robert Bosch GmbH',null,null,'https://www.boschtoolservice.com','2026-10-15');
insert into public.gearup_machines (slug,merk,modelnummer,uitvoering,typenummer,typecode,serienummer_van,serienummer_tot,categorie,motortype,mengverhouding,maker,zustermachine,olie_spec,bron_url,bron_datum) values ('echo-cs2511pn','Echo','CS-2511PN',null,null,null,null,null,'kettingzaag','2-takt',null,'Yamabiko Corporation',null,null,'https://www.echo-usa.com','2026-10-30');
create temp table _o (key text primary key, id uuid);
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('bougie','bougie','Stihl','0000 400 7000','{}'::text[],'NGK BPMR7A',null,1) returning id) insert into _o select 'stihl-bougie', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','luchtfilter HD2','Stihl','1141 140 4400',array['1141 120 1604']::text[],null,null,1) returning id) insert into _o select 'stihl-lf-hd2', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('ketting','zaagketting 40 cm (.325", 1,6 mm, 67 schakels)','Stihl','3686 000 0067',array['3639 000 0067 (RS)']::text[],null,null,1) returning id) insert into _o select 'stihl-ketting-40', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('zaagblad','zwaard 35–45 cm (.325", 1,6 mm)','Stihl',null,'{}'::text[],null,'steek .325", groef 1,6 mm, lengte 35/37/40/45 cm',1) returning id) insert into _o select 'stihl-zwaard', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('brandstof','mengsmering 2-takt 1:50',null,null,'{}'::text[],null,'2-takt, 1:50',1) returning id) insert into _o select 'spec-2takt-150', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('olie','kettingolie',null,null,'{}'::text[],null,'kettingsmeerolie, bij voorkeur biologisch afbreekbaar',1) returning id) insert into _o select 'spec-kettingolie', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaimes','maaimes 510 mm','Scheppach','7911200644',array['7911200628','7911200637']::text[],null,null,1) returning id) insert into _o select 'sch-mes-510', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('bougie','bougie','Scheppach','3906201048','{}'::text[],'Torch F6RTC = NGK BPR6ES',null,1) returning id) insert into _o select 'sch-bougie', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','luchtfilter compleet','Scheppach','5911249084','{}'::text[],null,null,1) returning id) insert into _o select 'sch-lf', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','luchtfilterelement (vanaf bouwjaar 2023)','Scheppach','5911249083','{}'::text[],null,null,1) returning id) insert into _o select 'sch-lf-el', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('olie','motorolie 4-takt',null,null,'{}'::text[],null,'SAE 10W-30 of 10W-40',1) returning id) insert into _o select 'spec-4t-1030-1040', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('opvangzak','opvangzak compleet','Scheppach','3911250006','{}'::text[],null,null,3) returning id) insert into _o select 'sch-opvang', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('brandstof','mengsmering 2-takt 1:25',null,null,'{}'::text[],null,'2-takt, 1:25',1) returning id) insert into _o select 'spec-2takt-125', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaidraad','maaidraad rond 2,5 mm + draadkop Tap & Go','Kibani','EAN 8719632281610 (draadkop)','{}'::text[],null,'nylon rond Ø2,5 mm (handleiding); shop verkoopt 2,4 mm',1) returning id) insert into _o select 'kib-draad', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaimes','snijblad 3-tands',null,null,'{}'::text[],null,'Ø255 mm, asgat 25,4 mm',1) returning id) insert into _o select 'kib-blad', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('bougie','bougie (type onbekend)','Kibani',null,'{}'::text[],null,null,1) returning id) insert into _o select 'kib-bougie', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','luchtfilter compleet','Kibani',null,'{}'::text[],null,null,1) returning id) insert into _o select 'kib-lf', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('accessoire','hogedrukslang H 9 Q','Kärcher','2.641-721.0','{}'::text[],null,null,3) returning id) insert into _o select 'kar-slang', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('accessoire','lans VP 160 Vario Power','Kärcher','2.644-430.0','{}'::text[],null,null,3) returning id) insert into _o select 'kar-lans', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('accessoire','vuilfrees DB 145','Kärcher','2.642-728.0','{}'::text[],null,null,3) returning id) insert into _o select 'kar-frees', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('accessoire','pistool G 160 Q','Kärcher','2.644-327.0','{}'::text[],null,null,3) returning id) insert into _o select 'kar-pistool', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('bougie','bougie','Honda','98079-55846','{}'::text[],'NGK BPR5ES',null,1) returning id) insert into _o select 'honda-bougie', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','luchtfilter (papier)','Honda','17211-Z8B-901','{}'::text[],null,null,1) returning id) insert into _o select 'honda-lf', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaimes','maaimes onder','Honda','72511-VK8-J50','{}'::text[],null,null,1) returning id) insert into _o select 'honda-mes-j50', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaimes','maaimes boven','Honda','72531-VK8-J50','{}'::text[],null,null,1) returning id) insert into _o select 'honda-mes2-j50', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaimes','maaimes','Honda','72511-VK8-000','{}'::text[],null,null,1) returning id) insert into _o select 'honda-mes-000', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('opvangzak','opvangzak','Honda','81320-VK8-J50','{}'::text[],null,null,3) returning id) insert into _o select 'honda-zak-j50', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('opvangzak','opvangzak zonder frame','Honda','81320-VK8-003','{}'::text[],null,null,3) returning id) insert into _o select 'honda-zak-003', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('olie','motorolie 4-takt',null,null,'{}'::text[],null,'SAE 10W-30',1) returning id) insert into _o select 'spec-4t-1030', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('bougie','bougie','John Deere','M78543','{}'::text[],null,null,1) returning id) insert into _o select 'jd-bougie', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','luchtfilter (met voorfilter)','John Deere','GY20574','{}'::text[],null,null,1) returning id) insert into _o select 'jd-lf', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','oliefilter','John Deere','AM125424','{}'::text[],null,null,1) returning id) insert into _o select 'jd-of-1', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','oliefilter','John Deere','AM101207','{}'::text[],null,null,1) returning id) insert into _o select 'jd-of-2', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaimes','maaimes 38" standaard (medium lift)','John Deere','AM137324','{}'::text[],null,null,1) returning id) insert into _o select 'jd-mes-std', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaimes','maaimes 38" opvangen (high lift)','John Deere','AM137326','{}'::text[],null,null,1) returning id) insert into _o select 'jd-mes-hl', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('accu','startaccu 12 V (Europa)','John Deere','MCYP340PF','{}'::text[],null,null,1) returning id) insert into _o select 'jd-accu', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('olie','motorolie 4-takt','John Deere',null,'{}'::text[],null,'4-takt, viscositeit niet vastgesteld',1) returning id) insert into _o select 'jd-olie', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('bougie','bougie','Makita','168401-9','{}'::text[],'NGK CMR6A',null,1) returning id) insert into _o select 'dol-bougie', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','luchtfilterelement','Makita','442181-8','{}'::text[],null,null,1) returning id) insert into _o select 'dol-lf', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('beschermkap','beschermkap mes','Makita','452259-9','{}'::text[],null,null,3) returning id) insert into _o select 'dol-kap', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('filter','luchtfilter pos. 220 (rol onduidelijk)','Makita','443173-0','{}'::text[],null,null,1) returning id) insert into _o select 'dol-lf2', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaimes','metaalmes / draadkop',null,null,'{}'::text[],null,'metaalmes max. 300 mm; draadkop dubbele draad',1) returning id) insert into _o select 'dol-snij', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('maaimes','maaimes 32 cm','Bosch','F 016 L64 191','{}'::text[],null,null,1) returning id) insert into _o select 'bosch-mes', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('opvangzak','opvangbak bovenstuk','Bosch','F 016 104 032','{}'::text[],null,null,3) returning id) insert into _o select 'bosch-bak-boven', id from i;
with i as (insert into public.gearup_onderdelen (producttype,naam,maker,fabrieksnummer,gelijkwaardig,universeel_type,specificatie,soort) values ('opvangzak','opvangbak onderstuk','Bosch','F 016 L66 683','{}'::text[],null,null,3) returning id) insert into _o select 'bosch-bak-onder', id from i;
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://www.ngkntk.com/de/produktfinder/saegen/zuendkerze/stihl/ms-261-c-m-41hp-bpmr7a/','maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261c' and o.key='stihl-bougie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261c' and o.key='stihl-ketting-40';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261c' and o.key='stihl-zwaard';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261c' and o.key='spec-2takt-150';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261c' and o.key='spec-kettingolie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://www.ngkntk.com/de/produktfinder/saegen/zuendkerze/stihl/ms-261-c-m-41hp-bpmr7a/','maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261cm' and o.key='stihl-bougie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261cm' and o.key='stihl-ketting-40';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261cm' and o.key='stihl-zwaard';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261cm' and o.key='spec-2takt-150';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker + NGK + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261cm' and o.key='spec-kettingolie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'winkels met Stihl-nummer (controle) + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='stihl-ms261c' and o.key='stihl-lf-hd2';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'niet geverifieerd',null,null,'2026-11-02','B1: Stihl-dealer vragen (na livegang)' from public.gearup_machines m, _o o where m.slug='stihl-ms261cm' and o.key='stihl-lf-hd2';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://shop.scheppach.com/spare-parts','maker-catalogus (lijst 0162) + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='parkside-pbrm51' and o.key='sch-mes-510';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://shop.scheppach.com/spare-parts','maker-catalogus (lijst 0162) + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='parkside-pbrm51' and o.key='sch-bougie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,'tot bouwjaar 2022',1,'geverifieerd','https://shop.scheppach.com/spare-parts','maker-catalogus (lijst 0162) + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='parkside-pbrm51' and o.key='sch-lf';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,'vanaf bouwjaar 2023',1,'geverifieerd','https://shop.scheppach.com/spare-parts','maker-catalogus (lijst 0162) + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='parkside-pbrm51' and o.key='sch-lf-el';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://shop.scheppach.com/spare-parts','maker-catalogus (lijst 0162) + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='parkside-pbrm51' and o.key='spec-4t-1030-1040';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://shop.scheppach.com/spare-parts','maker-catalogus (lijst 0162) + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='parkside-pbrm51' and o.key='sch-opvang';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'handleiding (bol.com) + Kibani-shop','2026-11-02',null from public.gearup_machines m, _o o where m.slug='kibani-bm41' and o.key='spec-2takt-125';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'handleiding (bol.com) + Kibani-shop','2026-11-02',null from public.gearup_machines m, _o o where m.slug='kibani-bm41' and o.key='kib-draad';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'handleiding (bol.com) + Kibani-shop','2026-11-02',null from public.gearup_machines m, _o o where m.slug='kibani-bm41' and o.key='kib-blad';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'niet geverifieerd',null,null,'2026-11-02','B2: mail Kibani (na livegang)' from public.gearup_machines m, _o o where m.slug='kibani-bm41' and o.key='kib-bougie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'niet geverifieerd',null,null,'2026-11-02','B3: mail Kibani (na livegang)' from public.gearup_machines m, _o o where m.slug='kibani-bm41' and o.key='kib-lf';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://www.karcher.com/nl/nl/reserveonderdelen','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='karcher-k4pc' and o.key='kar-slang';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://www.karcher.com/nl/nl/reserveonderdelen','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='karcher-k4pc' and o.key='kar-lans';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://www.karcher.com/nl/nl/reserveonderdelen','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='karcher-k4pc' and o.key='kar-frees';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://www.karcher.com/nl/nl/reserveonderdelen','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='karcher-k4pc' and o.key='kar-pistool';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-vkeh' and o.key='honda-bougie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-vkeh' and o.key='honda-lf';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-vkeh' and o.key='spec-4t-1030';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-vkeh' and o.key='honda-mes-j50';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-vkeh' and o.key='honda-mes2-j50';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-vkeh' and o.key='honda-zak-j50';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-qyeh' and o.key='honda-bougie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-qyeh' and o.key='honda-lf';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-qyeh' and o.key='spec-4t-1030';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-qyeh' and o.key='honda-mes-000';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-handleiding (tabel Current parts)','2026-11-02',null from public.gearup_machines m, _o o where m.slug='honda-hrx476c2-qyeh' and o.key='honda-zak-003';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://partscatalog.deere.com/jdrc/','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='jd-stx38-zwart' and o.key='jd-bougie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://partscatalog.deere.com/jdrc/','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='jd-stx38-zwart' and o.key='jd-lf';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,'serienummer tot 290000',1,'geverifieerd','https://partscatalog.deere.com/jdrc/','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='jd-stx38-zwart' and o.key='jd-of-1';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,'serienummer vanaf 290001',1,'geverifieerd','https://partscatalog.deere.com/jdrc/','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='jd-stx38-zwart' and o.key='jd-of-2';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,2,'geverifieerd','https://partscatalog.deere.com/jdrc/','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='jd-stx38-zwart' and o.key='jd-mes-std';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,2,'geverifieerd','https://partscatalog.deere.com/jdrc/','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='jd-stx38-zwart' and o.key='jd-mes-hl';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd','https://partscatalog.deere.com/jdrc/','maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='jd-stx38-zwart' and o.key='jd-accu';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'niet geverifieerd',null,null,'2026-11-02','B5: viscositeit uit Deere-handleiding (techpubs)' from public.gearup_machines m, _o o where m.slug='jd-stx38-zwart' and o.key='jd-olie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-onderdelentekening + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='dolmar-ms43004u' and o.key='dol-bougie';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-onderdelentekening + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='dolmar-ms43004u' and o.key='dol-lf';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-onderdelentekening + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='dolmar-ms43004u' and o.key='dol-kap';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-onderdelentekening + handleiding','2026-11-02',null from public.gearup_machines m, _o o where m.slug='dolmar-ms43004u' and o.key='spec-4t-1030';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'niet geverifieerd',null,null,'2026-11-02','B6: rol pos. 220 nagaan' from public.gearup_machines m, _o o where m.slug='dolmar-ms43004u' and o.key='dol-lf2';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'niet geverifieerd',null,null,'2026-11-02','B7: Makita-accessoires voor MS-4300.4U' from public.gearup_machines m, _o o where m.slug='dolmar-ms43004u' and o.key='dol-snij';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='bosch-arm32' and o.key='bosch-mes';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='bosch-arm32' and o.key='bosch-bak-boven';
insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) select m.id,o.id,null,1,'geverifieerd',null,'maker-catalogus','2026-11-02',null from public.gearup_machines m, _o o where m.slug='bosch-arm32' and o.key='bosch-bak-onder';
insert into public.gearup_producten (machine_id,categorie,motortype,markt,producttype,kwaliteit,product_naam,affiliate_url) values (null,'kettingzaag','2-takt','nl','ketting','goed','generieke ketting (zoals productie)','https://example.com/ketting');
insert into public.gearup_producten (onderdeel_id,categorie,motortype,markt,producttype,kwaliteit,product_naam,affiliate_url,winkel) select o.id,'grasmaaier','4-takt','nl','bougie','goed','NGK BPR5ES','https://example.com/bpr5es','test' from _o x join public.gearup_onderdelen o on o.id=x.id where x.key='honda-bougie';
insert into public.gearup_merk_aliassen values ('Wolf','Wolf-Garten') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('hayter harrier','Hayter') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Automower','Husqvarna') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Zoef','Zoef Robot') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Robin','Makita') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Bleubird','Bluebird') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Mammotion Luba','Mammotion') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Duro','Duro Pro') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Pattfield','Einhell') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Brill','AL-KO') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Bolens','MTD') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Alto','Nilfisk') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Torr','Toro') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('handstart Torros','Torros') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Sthil','Stihl') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Peugeot','Peugeot Outillage') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('H-ster','Zoef') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Negri-Bio','Negri') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Kraffter hydraulische','Kraffter') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Rhodus','Rhodos') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Oregon zwaard','Oregon') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Stella vc','Stella') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Stilh','Stihl') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Skorpion','Teknamotor') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('kraftmuller pro-line','Kraftmuller') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('luba','Mammotion') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Agri-Fab getrokken','Agri-Fab') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Elu','Black+Decker') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('TUP','TüR') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Rienties Product','Boxer') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Jensen-Angeln hovenier','Jensen') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('MB grondfrees','Benassi') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Tornado','STIGA') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('massey','Massey Ferguson') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Vondoc','VONROC') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('blac& decker','Black+Decker') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Pellenc Excelion','Pellenc') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Alpine','Alpina') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('wacker','Wacker Neuson') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('GARDENPRO POWERPLUS','Powerplus') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Hookii Neomow','Hookii') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Antonio','Antonio Carraro') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Husquvarna','Husqvarna') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Kracher','Kärcher') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Sthalwerk','Stahlwerk') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Sagway','Segway') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('WIPER KXLS','Wiper') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Twin-Cat','Castelgarden') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Alphina','Alpina') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Ma-Tra','BCS') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Steinmax haksel','Steinmax') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Forest','Forest Master') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('HSA','Stihl') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Workx','Worx') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Navimow','Segway') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Procomas Aanbouw','Procomas') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('yardman','MTD') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Twin cut','Castelgarden') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Maktec','Makita') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('GRT','Bosch') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('ELIEF major','Eliet') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Terminator','Mus-Max') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Wheel','Wheel Horse') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Dolmar','Makita') on conflict do nothing;
insert into public.gearup_merk_aliassen values ('Automower','Husqvarna') on conflict do nothing;
commit;

-- ===== toets_T1_T8.sql =====
-- GearUp toetsvragen T1–T8 (database-aanpassing 5.1). Alleen lezen. Draaien na 0000–0005 op de testdatabase.
with
t1 as (select count(*) filter (where status='geverifieerd') g, count(*) filter (where status<>'geverifieerd') n
       from gearup_machine_onderdelen v join gearup_machines m on m.id=v.machine_id where m.slug='stihl-ms261cm'),
t2 as (select count(*) filter (where status='geverifieerd') g, count(*) filter (where status<>'geverifieerd') n
       from gearup_machine_onderdelen v join gearup_machines m on m.id=v.machine_id where m.slug='kibani-bm41'),
t3 as (select count(*) c from gearup_machine_onderdelen v join gearup_machines m on m.id=v.machine_id
       where m.slug='echo-cs2511pn' and v.producttype='ketting'),
t4 as (select count(distinct k.machine_id) c from gearup_producten p join gearup_koppelingen k on k.onderdeel_id=p.onderdeel_id
       where p.product_naam='NGK BPR5ES' and k.status='geverifieerd'),
t5 as (select string_agg(distinct v.fabrieksnummer, ',' order by v.fabrieksnummer) filter (where m.slug='honda-hrx476c2-vkeh') vk,
              string_agg(distinct v.fabrieksnummer, ',' order by v.fabrieksnummer) filter (where m.slug='honda-hrx476c2-qyeh') qy
       from gearup_machine_onderdelen v join gearup_machines m on m.id=v.machine_id where v.producttype='maaimes'),
t6 as (select string_agg(v.fabrieksnummer||' ('||v.geldt_voor||')', '; ' order by v.fabrieksnummer) s
       from gearup_machine_onderdelen v join gearup_machines m on m.id=v.machine_id where m.slug='jd-stx38-zwart' and v.naam='oliefilter'),
t7 as (select (select merk from gearup_merk_aliassen where lower(alias)='automower') a, (select merk from gearup_merk_aliassen where lower(alias)='sthil') b),
t8 as (select (select count(*) from gearup_machines where slug='honda-hrx476c2-vkeh') a,
              (select count(*) from gearup_producten where machine_id is null and categorie='kettingzaag' and motortype='2-takt' and markt='nl') b,
              (select count(*) from (select merk, modelnummer, categorie from gearup_machines order by merk) x) c)
select 'T1 Stihl MS 261 C-M: 6 onderdelen, 1 met melding' toets, g||' geverifieerd + '||n||' met melding' uitkomst, (g=5 and n=1) geslaagd from t1
union all select 'T2 Kibani: 3 live, 2 met melding', g||' + '||n, (g=3 and n=2) from t2
union all select 'T3 Echo krijgt niet automatisch een ketting', c||' ketting(en) via koppeling', c=0 from t3
union all select 'T4 één kooplink geldt voor alle machines met dat onderdeel', c||' machines', c=2 from t4
union all select 'T5 Honda VKEH en QYEH eigen maaimes', 'VKEH: '||vk||' | QYEH: '||qy, vk<>qy from t5
union all select 'T6 STX38 oliefilter per serienummer', s, s like '%AM101207 (serienummer vanaf 290001)%AM125424 (serienummer tot 290000)%' from t6
union all select 'T7 aliassen Automower en Sthil', coalesce(a,'?')||' / '||coalesce(b,'?'), (a='Husqvarna' and b='Stihl') from t7
union all select 'T8 queries van de app werken (slug, generieke producten, homepage)', a||' / '||b||' / '||c, (a=1 and b=1 and c>0) from t8;
