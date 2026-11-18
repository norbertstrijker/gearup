-- 0009: soorten van een onderdeel onder elkaar (besluit Norbert, 18 november 2026)
-- kenmerk: kort kenmerk van deze soort uit de bron van de maker (bv. "zacht snijgedrag, terugslag- en trillingsarm")
-- standaard: deze soort zit volgens de bron van de maker standaard op deze machine (bovenaan op de site)
-- Twee keer draaien kan geen kwaad. Het laadbestand van een portie bevat deze regels ook.
alter table public.gearup_onderdelen add column if not exists kenmerk text;
alter table public.gearup_koppelingen add column if not exists standaard boolean;
