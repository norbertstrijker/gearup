-- Vullen van gearup_merk_aliassen (andere schrijfwijzen van een merk), 16 november 2026.
-- Bron: sensor/merkaliassen.json uit de metingen (162 regels), opgeschoond voor de zoekfunctie:
-- geen merk + modelnaam, geen gewone woorden of namen die ook iets anders betekenen.
-- Opgenomen: 106. Weggelaten: 59 (lijst onderaan).
-- Draai in de Supabase SQL-editor. Bestaande aliassen blijven ongewijzigd (on conflict do nothing).

insert into public.gearup_merk_aliassen (alias, merk) values
  ('alphina', 'Alpina'),
  ('alpine', 'Alpina'),
  ('alto', 'Nilfisk'),
  ('anthboth', 'Anthbot'),
  ('automower', 'Husqvarna'),
  ('b&d', 'Black&Decker'),
  ('bd', 'Black&Decker'),
  ('bgh', 'Budget'),
  ('blac& decker', 'Black&Decker'),
  ('bleubird', 'Bluebird'),
  ('bolens', 'MTD'),
  ('bosh', 'Bosch'),
  ('briggs', 'Briggs & Stratton'),
  ('brill', 'AL-KO'),
  ('chalange', 'Challenge'),
  ('clerke', 'Clarke'),
  ('dekopro', 'DEKO'),
  ('dewault', 'DeWalt'),
  ('elu', 'Black&Decker'),
  ('evho', 'Echo'),
  ('fj', 'FJ Dynamics'),
  ('fleurelle', 'MTD'),
  ('gardenbruk', 'Gardebruk'),
  ('gardoi', 'Gardol'),
  ('gc-es', 'Einhell'),
  ('geb.metabo', 'Metabo'),
  ('gebr.stihl', 'Stihl'),
  ('giraffe', 'Giraffe Tools'),
  ('h-ster', 'Zoef Robot'),
  ('hayterette', 'Hayter'),
  ('heyter', 'Hayter'),
  ('hondamotor', 'Honda'),
  ('huqvarna', 'Husqvarna'),
  ('husquarna', 'Husqvarna'),
  ('husquvana', 'Husqvarna'),
  ('husquvarna', 'Husqvarna'),
  ('husqvana', 'Husqvarna'),
  ('imow', 'Stihl'),
  ('kaercher', 'Kärcher'),
  ('karacher', 'Kärcher'),
  ('karcher', 'Kärcher'),
  ('komatsu zenoah', 'Zenoah'),
  ('kracher', 'Kärcher'),
  ('lawnflite', 'MTD'),
  ('lidax', 'MOVA'),
  ('lidl performance', 'Parkside'),
  ('ma-tra', 'BCS'),
  ('maktec', 'Makita'),
  ('massey', 'Massey Ferguson'),
  ('mastercut', 'MTD'),
  ('mcallister', 'Mac Allister'),
  ('mcculloch', 'McCulloch'),
  ('mccullogh', 'McCulloch'),
  ('mcculoch', 'McCulloch'),
  ('mls', 'Herkules'),
  ('mountfeild', 'Mountfield'),
  ('mova', 'MOVA'),
  ('mower&bosch', 'Bosch'),
  ('mtb', 'MTD'),
  ('mtd..lawnflite', 'MTD'),
  ('mähroboter&ecovacs', 'Ecovacs'),
  ('navimov', 'Segway'),
  ('navimow', 'Segway'),
  ('negri-bio', 'Negri'),
  ('ole mac', 'Oleo-Mac'),
  ('oleo mac', 'Oleo-Mac'),
  ('oleomac', 'Oleo-Mac'),
  ('parsiide', 'Parkside'),
  ('pattfield', 'Einhell'),
  ('peugeot', 'Peugeot Outillage'),
  ('rhodus', 'Rhodos'),
  ('rte', 'Greatbull'),
  ('sabre', 'John Deere'),
  ('sachs dolmer', 'Sachs Dolmar'),
  ('sagway', 'Segway'),
  ('sherpa', 'AS-Motor'),
  ('sif', 'Suffolk'),
  ('skorpion', 'Teknamotor'),
  ('sthalwerk', 'Stahlwerk'),
  ('sthil', 'Stihl'),
  ('stihl-gartenhäcksler', 'Stihl'),
  ('stilh', 'Stihl'),
  ('tbgarden', 'TB Garden'),
  ('tegal', 'Teagle'),
  ('torr', 'Toro'),
  ('tup', 'TüR'),
  ('twin-cat', 'Castelgarden'),
  ('varo', 'Powerplus'),
  ('vemmer', 'Vermeer'),
  ('vondoc', 'Vonroc'),
  ('vtuf', 'V-TUF'),
  ('wacker', 'Wacker Neuson'),
  ('wap', 'Nilfisk'),
  ('weed eater', 'Husqvarna'),
  ('wiking', 'Viking'),
  ('wilkes', 'Wilks USA'),
  ('wilks-usa', 'Wilks USA'),
  ('wolf', 'Wolf-Garten'),
  ('wolf-gerate', 'Wolf-Garten'),
  ('wolfgarten', 'Wolf-Garten'),
  ('wolfscooter', 'Wolf-Garten'),
  ('works', 'Worx'),
  ('workx', 'Worx'),
  ('worxx', 'Worx'),
  ('yardman', 'MTD'),
  ('zoef', 'Zoef Robot')
on conflict (alias) do nothing;

-- Controle: aantal regels in de tabel
select count(*) as aantal_aliassen from public.gearup_merk_aliassen;

-- Weggelaten:
--   ACTO QuiteShredder -> Atco: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   APACHE VT -> Apache: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   AS -> AS-Motor: gewoon woord (as, voor)
--   Agri-Fab getrokken -> Agri-Fab: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Antonio -> Antonio Carraro: voornaam
--   Becx Heckenschneider -> Becx: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Black -> Black&Decker: gewoon woord; zou elke zoekopdracht met "black" naar Black&Decker sturen
--   Briggs Vanguard -> Briggs & Stratton: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Canon -> Camon: ander bestaand merk (camera)
--   Circa Yanmar -> Yanmar: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Duro -> Duro Pro: ook kettingtype (Stihl Duro)
--   ELIEF major -> Eliet: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Erbauer Corded -> Erbauer: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Ering Kombi -> Ering: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Ferrero -> Ferrex: ander bestaand merk
--   Forest -> Forest Master: gewoon woord
--   GARDENPRO POWERPLUS -> Powerplus: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Gardene Minimo -> Gardena: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Gear Combo -> Garden Gear: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Grandma Shark -> Shark: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Hako Rasentrac -> Hako: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Hookii Neomow -> Hookii: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Hustler Super -> Hustler: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   ISC GmbH -> Einhell: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Jensen-Angeln hovenier -> Jensen: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Kioti Zero-Turn-Aufsitzmäher -> Kioti: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Kraffter hydraulische -> Kraffter: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Lescha Zak -> Lescha: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   MB grondfrees -> Benassi: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Mammotion Luba -> Mammotion: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Marke Lescha -> Lescha: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Mova Lidax -> MOVA: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Mr. -> Mr. Gardener: geen merknaam op zich
--   Netta Electronic -> Netta: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Pellenc Excelion -> Pellenc: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Picco -> Wolf-Garten: ook kettingtype (Stihl Picco)
--   Procomas Aanbouw -> Procomas: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Pump- Mac -> Mac Allister: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   RAC Cold -> RAC: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Ramix Astfresser -> Ramix: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Red Dragon -> RemetCNC: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Robin -> Makita: ook een ander motormerk (Robin/Subaru)
--   SIP Tempest -> SIP: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Secura Düngerstreuer -> Secura: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Steinmax haksel -> Steinmax: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Stella vc -> Stella: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Terminator -> Mus-Max: gewoon woord
--   Timbertech Tarus -> Timbertech: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Tornado -> Stiga: gewoon woord
--   Tracmaster Camon -> Camon: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Twenty -> Ambrogio: gewoon woord
--   Vax PowerWash -> Vax: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Vevor Flächenreiniger -> Vevor: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   WIPER KXLS -> Wiper: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   Wheel -> Wheel Horse: gewoon woord (wiel)
--   handstart Torros -> Torros: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   hayter harrier -> Hayter: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   kraftmuller pro-line -> Kraftmuller: merk met modelnaam of productwoord, geen schrijfwijze van het merk
--   miller -> Miller & Mason: achternaam
