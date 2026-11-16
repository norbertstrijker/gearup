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
