-- GearUp — drie foutieve records verwijderen (fase-1 finetuning, punt H)
-- Draai dit in de Supabase SQL-editor.
--
-- Dit zijn elektrische/accu-machines die ten onrechte als benzine in de database
-- staan (geverifieerd), wat tot gevaarlijk verkeerd brandstofadvies leidt.
-- Verwijderen op exact-id, zodat gegarandeerd alleen de juiste rij wordt geraakt:
--   * Bosch "Benzin 32"  → is de elektrische Rotak 32
--   * Makita UC3041A     → elektrische kettingzaag (1800W netstroom)
--   * Flymo XL500        → vermoedelijk elektrisch

delete from public.gearup_machines
where id in (
  '5ed2d3a3-6b26-4cca-8e11-94c71a7264d6',  -- Bosch Benzin 32
  'eba154b2-4405-42b6-8317-3bee3fe6ee9c',  -- Makita UC3041A
  'ca473cf1-c95a-4f3b-87f9-65e4f1157db0'   -- Flymo XL500
);
