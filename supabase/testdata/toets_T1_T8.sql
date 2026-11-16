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
