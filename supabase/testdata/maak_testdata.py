# Bouwt supabase/testdata/0005_testdata_8_machines.sql uit de diepterecords (handmatig gecureerd).
import json, os
def q(v):
    if v is None: return 'null'
    if isinstance(v,(int,float)): return str(v)
    if isinstance(v,list): return "array[" + ",".join(q(x) for x in v) + "]::text[]" if v else "'{}'::text[]"
    return "'" + str(v).replace("'","''") + "'"
M=[]  # machines
O={}  # onderdelen key -> dict
K=[]  # koppelingen
def mach(key, **kw): kw['key']=key; M.append(kw)
def ond(key, **kw): O[key]=kw
def kop(m,o,status='geverifieerd',**kw): K.append(dict(m=m,o=o,status=status,**kw))
D='2026'
# 1 Stihl MS 261 C en C-M
for u,key in [('MS 261 C','stihl-ms261c'),('MS 261 C-M','stihl-ms261cm')]:
    mach(key,merk='Stihl',modelnummer='MS 261',uitvoering=u,categorie='kettingzaag',motortype='2-takt',mengverhouding='1:50',maker='Andreas Stihl AG & Co. KG',bron_url='https://www.stihl.de/de/p/kettensaegen-motorsaegen-ms-261-105118',bron_datum='2026-09-26')
ond('stihl-bougie',producttype='bougie',naam='bougie',maker='Stihl',fabrieksnummer='0000 400 7000',universeel_type='NGK BPMR7A',soort=1)
ond('stihl-lf-hd2',producttype='filter',naam='luchtfilter HD2',maker='Stihl',fabrieksnummer='1141 140 4400',gelijkwaardig=['1141 120 1604'],soort=1)
ond('stihl-ketting-40',producttype='ketting',naam='zaagketting 40 cm (.325", 1,6 mm, 67 schakels)',maker='Stihl',fabrieksnummer='3686 000 0067',gelijkwaardig=['3639 000 0067 (RS)'],soort=1)
ond('stihl-zwaard',producttype='zaagblad',naam='zwaard 35–45 cm (.325", 1,6 mm)',maker='Stihl',specificatie='steek .325", groef 1,6 mm, lengte 35/37/40/45 cm',soort=1)
ond('spec-2takt-150',producttype='brandstof',naam='mengsmering 2-takt 1:50',specificatie='2-takt, 1:50',soort=1)
ond('spec-kettingolie',producttype='olie',naam='kettingolie',specificatie='kettingsmeerolie, bij voorkeur biologisch afbreekbaar',soort=1)
for m in ['stihl-ms261c','stihl-ms261cm']:
    for o in ['stihl-bougie','stihl-ketting-40','stihl-zwaard','spec-2takt-150','spec-kettingolie']:
        kop(m,o,bron_soort='maker + NGK + handleiding',bron_url='https://www.ngkntk.com/de/produktfinder/saegen/zuendkerze/stihl/ms-261-c-m-41hp-bpmr7a/' if o=='stihl-bougie' else None)
kop('stihl-ms261c','stihl-lf-hd2',bron_soort='winkels met Stihl-nummer (controle) + handleiding')
kop('stihl-ms261cm','stihl-lf-hd2',status='niet geverifieerd',actie='B1: Stihl-dealer vragen (na livegang)')
# 2 Parkside PBRM 51 A1
mach('parkside-pbrm51',merk='Parkside',modelnummer='PBRM 51 A1',uitvoering='LB1/LB5/LB8 (IAN 420301)',categorie='grasmaaier',motortype='4-takt',maker='Scheppach GmbH',olie_spec='SAE 10W-30 of 10W-40, 0,4 l',bron_url='https://shop.scheppach.com/spare-parts',bron_datum='2026-09-26')
ond('sch-mes-510',producttype='maaimes',naam='maaimes 510 mm',maker='Scheppach',fabrieksnummer='7911200644',gelijkwaardig=['7911200628','7911200637'],soort=1)
ond('sch-bougie',producttype='bougie',naam='bougie',maker='Scheppach',fabrieksnummer='3906201048',universeel_type='Torch F6RTC = NGK BPR6ES',soort=1)
ond('sch-lf',producttype='filter',naam='luchtfilter compleet',maker='Scheppach',fabrieksnummer='5911249084',soort=1)
ond('sch-lf-el',producttype='filter',naam='luchtfilterelement (vanaf bouwjaar 2023)',maker='Scheppach',fabrieksnummer='5911249083',soort=1)
ond('spec-4t-1030-1040',producttype='olie',naam='motorolie 4-takt',specificatie='SAE 10W-30 of 10W-40',soort=1)
ond('sch-opvang',producttype='opvangzak',naam='opvangzak compleet',maker='Scheppach',fabrieksnummer='3911250006',soort=3)
for o,g in [('sch-mes-510',None),('sch-bougie',None),('sch-lf','tot bouwjaar 2022'),('sch-lf-el','vanaf bouwjaar 2023'),('spec-4t-1030-1040',None),('sch-opvang',None)]:
    kop('parkside-pbrm51',o,geldt_voor=g,bron_soort='maker-catalogus (lijst 0162) + handleiding',bron_url='https://shop.scheppach.com/spare-parts')
# 3 Kibani
mach('kibani-bm41',merk='Kibani',modelnummer='Bosmaaier 4-in-1 52 cc',uitvoering='KBM41',typecode='GTB5212U',categorie='bosmaaier',motortype='2-takt',mengverhouding='1:25',maker='Kibani Europe (OEM *aangenomen* Chinese fabriek)',bron_url='https://kibani.nl/voor-de-tuin/kibani-bosmaaier-4-in-1',bron_datum='2026-10-03')
ond('spec-2takt-125',producttype='brandstof',naam='mengsmering 2-takt 1:25',specificatie='2-takt, 1:25',soort=1)
ond('kib-draad',producttype='maaidraad',naam='maaidraad rond 2,5 mm + draadkop Tap & Go',maker='Kibani',fabrieksnummer='EAN 8719632281610 (draadkop)',specificatie='nylon rond Ø2,5 mm (handleiding); shop verkoopt 2,4 mm',soort=1)
ond('kib-blad',producttype='maaimes',naam='snijblad 3-tands',specificatie='Ø255 mm, asgat 25,4 mm',soort=1)
ond('kib-bougie',producttype='bougie',naam='bougie (type onbekend)',maker='Kibani',soort=1)
ond('kib-lf',producttype='filter',naam='luchtfilter compleet',maker='Kibani',soort=1)
for o in ['spec-2takt-125','kib-draad','kib-blad']: kop('kibani-bm41',o,bron_soort='handleiding (bol.com) + Kibani-shop')
kop('kibani-bm41','kib-bougie',status='niet geverifieerd',actie='B2: mail Kibani (na livegang)')
kop('kibani-bm41','kib-lf',status='niet geverifieerd',actie='B3: mail Kibani (na livegang)')
# 4 Kärcher K4 PC
mach('karcher-k4pc',merk='Kärcher',modelnummer='K 4 Power Control',uitvoering='*EU',typenummer='1.324-030.0',categorie='hogedrukreiniger',motortype='elektrisch',maker='Alfred Kärcher SE & Co. KG',bron_url='https://www.karcher.com/nl/nl/reserveonderdelen',bron_datum='2026-10-24')
for k,n,nr in [('kar-slang','hogedrukslang H 9 Q','2.641-721.0'),('kar-lans','lans VP 160 Vario Power','2.644-430.0'),('kar-frees','vuilfrees DB 145','2.642-728.0'),('kar-pistool','pistool G 160 Q','2.644-327.0')]:
    ond(k,producttype='accessoire',naam=n,maker='Kärcher',fabrieksnummer=nr,soort=3); kop('karcher-k4pc',k,bron_soort='maker-catalogus',bron_url='https://www.karcher.com/nl/nl/reserveonderdelen')
# 5/6 Honda
for tc in ['VKEH','QYEH']:
    mach('honda-hrx476c2-'+tc.lower(),merk='Honda',modelnummer='HRX 476',uitvoering='HRX476C2 '+tc,typecode=tc,serienummer_van='MBYF-1062819',serienummer_tot='MBYF-9999999',categorie='grasmaaier',motortype='4-takt',maker='Honda Motor Co.',olie_spec='SAE 10W-30',bron_url='https://www.honda.co.jp/ownersmanual/HondaNederland/power/',bron_datum='2026-10-24')
ond('honda-bougie',producttype='bougie',naam='bougie',maker='Honda',fabrieksnummer='98079-55846',universeel_type='NGK BPR5ES',soort=1)
ond('honda-lf',producttype='filter',naam='luchtfilter (papier)',maker='Honda',fabrieksnummer='17211-Z8B-901',soort=1)
ond('honda-mes-j50',producttype='maaimes',naam='maaimes onder',maker='Honda',fabrieksnummer='72511-VK8-J50',soort=1)
ond('honda-mes2-j50',producttype='maaimes',naam='maaimes boven',maker='Honda',fabrieksnummer='72531-VK8-J50',soort=1)
ond('honda-mes-000',producttype='maaimes',naam='maaimes',maker='Honda',fabrieksnummer='72511-VK8-000',soort=1)
ond('honda-zak-j50',producttype='opvangzak',naam='opvangzak',maker='Honda',fabrieksnummer='81320-VK8-J50',soort=3)
ond('honda-zak-003',producttype='opvangzak',naam='opvangzak zonder frame',maker='Honda',fabrieksnummer='81320-VK8-003',soort=3)
ond('spec-4t-1030',producttype='olie',naam='motorolie 4-takt',specificatie='SAE 10W-30',soort=1)
for tc,extra in [('vkeh',['honda-mes-j50','honda-mes2-j50','honda-zak-j50']),('qyeh',['honda-mes-000','honda-zak-003'])]:
    for o in ['honda-bougie','honda-lf','spec-4t-1030']+extra: kop('honda-hrx476c2-'+tc,o,bron_soort='maker-handleiding (tabel Current parts)')
# 7 John Deere STX38
mach('jd-stx38-zwart',merk='John Deere',modelnummer='STX38',uitvoering='zwart maaidek (PC2399)',categorie='zitmaaier',motortype='4-takt',maker='Deere & Company',bron_url='https://partscatalog.deere.com/jdrc/',bron_datum='2026-10-29')
for k,t,n,nr,s in [('jd-bougie','bougie','bougie','M78543',1),('jd-lf','filter','luchtfilter (met voorfilter)','GY20574',1),('jd-of-1','filter','oliefilter','AM125424',1),('jd-of-2','filter','oliefilter','AM101207',1),('jd-mes-std','maaimes','maaimes 38" standaard (medium lift)','AM137324',1),('jd-mes-hl','maaimes','maaimes 38" opvangen (high lift)','AM137326',1),('jd-accu','accu','startaccu 12 V (Europa)','MCYP340PF',1),('jd-olie','olie','motorolie 4-takt',None,1)]:
    ond(k,producttype=t,naam=n,maker='John Deere',fabrieksnummer=nr,soort=s,specificatie='4-takt, viscositeit niet vastgesteld' if k=='jd-olie' else None)
    if k=='jd-olie': kop('jd-stx38-zwart',k,status='niet geverifieerd',actie='B5: viscositeit uit Deere-handleiding (techpubs)')
    else: kop('jd-stx38-zwart',k,geldt_voor={'jd-of-1':'serienummer tot 290000','jd-of-2':'serienummer vanaf 290001'}.get(k),aantal=2 if k.startswith('jd-mes') else 1,bron_soort='maker-catalogus',bron_url='https://partscatalog.deere.com/jdrc/')
# 8 Dolmar
mach('dolmar-ms43004u',merk='Dolmar',modelnummer='MS-4300.4U',categorie='bosmaaier',motortype='4-takt',maker='Makita (Makita Engineering Germany)',zustermachine='Makita EM4351UH (*aangenomen*)',olie_spec='SAE 10W-30, API SF+',bron_url='https://www.makita.nl/onderdelentekeningen.html',bron_datum='2026-10-30')
ond('dol-bougie',producttype='bougie',naam='bougie',maker='Makita',fabrieksnummer='168401-9',universeel_type='NGK CMR6A',soort=1)
ond('dol-lf',producttype='filter',naam='luchtfilterelement',maker='Makita',fabrieksnummer='442181-8',soort=1)
ond('dol-kap',producttype='beschermkap',naam='beschermkap mes',maker='Makita',fabrieksnummer='452259-9',soort=3)
ond('dol-lf2',producttype='filter',naam='luchtfilter pos. 220 (rol onduidelijk)',maker='Makita',fabrieksnummer='443173-0',soort=1)
ond('dol-snij',producttype='maaimes',naam='metaalmes / draadkop',specificatie='metaalmes max. 300 mm; draadkop dubbele draad',soort=1)
for o in ['dol-bougie','dol-lf','dol-kap','spec-4t-1030']: kop('dolmar-ms43004u',o,bron_soort='maker-onderdelentekening + handleiding')
kop('dolmar-ms43004u','dol-lf2',status='niet geverifieerd',actie='B6: rol pos. 220 nagaan')
kop('dolmar-ms43004u','dol-snij',status='niet geverifieerd',actie='B7: Makita-accessoires voor MS-4300.4U')
# 9 Bosch ARM 32
mach('bosch-arm32',merk='Bosch',modelnummer='ARM 32',uitvoering='3 600 H85 B09',typenummer='3 600 H85 B09',categorie='grasmaaier',motortype='elektrisch',maker='Robert Bosch GmbH',bron_url='https://www.boschtoolservice.com',bron_datum='2026-10-15')
ond('bosch-mes',producttype='maaimes',naam='maaimes 32 cm',maker='Bosch',fabrieksnummer='F 016 L64 191',soort=1)
ond('bosch-bak-boven',producttype='opvangzak',naam='opvangbak bovenstuk',maker='Bosch',fabrieksnummer='F 016 104 032',soort=3)
ond('bosch-bak-onder',producttype='opvangzak',naam='opvangbak onderstuk',maker='Bosch',fabrieksnummer='F 016 L66 683',soort=3)
for o in ['bosch-mes','bosch-bak-boven','bosch-bak-onder']: kop('bosch-arm32',o,bron_soort='maker-catalogus')
# 10 Echo CS-2511PN zonder koppelingen (T3)
mach('echo-cs2511pn',merk='Echo',modelnummer='CS-2511PN',categorie='kettingzaag',motortype='2-takt',maker='Yamabiko Corporation',bron_url='https://www.echo-usa.com',bron_datum='2026-10-30')

sql=["-- GearUp testdata (ALLEEN testdatabase): 8 machinedossiers + Echo zonder koppelingen, gegenereerd uit docs/sensor/diepte_*.json",
     "-- Gegenereerd door maak_testdata.py op 2 nov 2026. Niet in productie draaien.","begin;"]
mcols=['merk','modelnummer','uitvoering','typenummer','typecode','serienummer_van','serienummer_tot','categorie','motortype','mengverhouding','maker','zustermachine','olie_spec','bron_url','bron_datum']
for m in M:
    slug=m['key']
    vals=[m.get(c) for c in mcols]
    sql.append(f"insert into public.gearup_machines (slug,{','.join(mcols)}) values ({q(slug)},{','.join(q(v) for v in vals)});")
ocols=['producttype','naam','maker','fabrieksnummer','gelijkwaardig','universeel_type','specificatie','soort']
sql.append("create temp table _o (key text primary key, id uuid);")
for k,o in O.items():
    vals=[o.get(c) if c!='gelijkwaardig' else o.get(c,[]) for c in ocols]
    sql.append(f"with i as (insert into public.gearup_onderdelen ({','.join(ocols)}) values ({','.join(q(v) for v in vals)}) returning id) insert into _o select {q(k)}, id from i;")
for kk in K:
    sql.append("insert into public.gearup_koppelingen (machine_id,onderdeel_id,geldt_voor,aantal,status,bron_url,bron_soort,bron_datum,actie) "
               f"select m.id,o.id,{q(kk.get('geldt_voor'))},{kk.get('aantal',1)},{q(kk['status'])},{q(kk.get('bron_url'))},{q(kk.get('bron_soort'))},'2026-11-02',{q(kk.get('actie'))} "
               f"from public.gearup_machines m, _o o where m.slug={q(kk['m'])} and o.key={q(kk['o'])};")
# generieke kooplink zoals in productie (kettingzaag 2-takt) + kooplink op onderdeel (T4)
sql.append("insert into public.gearup_producten (machine_id,categorie,motortype,markt,producttype,kwaliteit,product_naam,affiliate_url) values (null,'kettingzaag','2-takt','nl','ketting','goed','generieke ketting (zoals productie)','https://example.com/ketting');")
sql.append("insert into public.gearup_producten (onderdeel_id,categorie,motortype,markt,producttype,kwaliteit,product_naam,affiliate_url,winkel) select o.id,'grasmaaier','4-takt','nl','bougie','goed','NGK BPR5ES','https://example.com/bpr5es','test' from _o x join public.gearup_onderdelen o on o.id=x.id where x.key='honda-bougie';")
# aliassen uit het merkenbestand
h=json.load(open('docs/sensor/merken_herkomst_NL.json',encoding='utf-8'))
seen=set()
for x in h:
    z=x.get('zelfde_als') or (x.get('reeks_1_2') or {}).get('zelfde_als')
    if z and '*' not in z and '(' not in z and x['merk'].lower()!=z.lower() and x['merk'].lower() not in seen:
        seen.add(x['merk'].lower()); sql.append(f"insert into public.gearup_merk_aliassen values ({q(x['merk'])},{q(z)}) on conflict do nothing;")
for a,b in [('Dolmar','Makita'),('Automower','Husqvarna')]:
    sql.append(f"insert into public.gearup_merk_aliassen values ({q(a)},{q(b)}) on conflict do nothing;")
sql.append("commit;")
os.makedirs('out',exist_ok=True)
open('out/0005_testdata_8_machines.sql','w',encoding='utf-8').write("\n".join(sql)+"\n")
print(len(M),'machines',len(O),'onderdelen',len(K),'koppelingen', len(seen)+2,'aliassen')
