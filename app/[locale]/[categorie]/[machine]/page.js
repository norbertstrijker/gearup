import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { supabaseServer } from '@/lib/supabase-server'
import { categoryFromSlug, categoryName, machineHref } from '@/lib/categories'
import { fuelInfo, uitlegKey, fetchUitleg } from '@/lib/advice'
import { isValidUrl } from '@/lib/links'
import { groupParts, fuelFacts } from '@/lib/machine'
import PartFacts from '@/components/PartFacts'
import HouseAd from '@/components/HouseAd'
import OptionCard from '@/components/OptionCard'
import GearAccordion from '@/components/GearAccordion'
import Container from '@/components/Container'
import Icon from '@/components/Icons'

const TIERS = ['basis', 'beter', 'best']

export async function generateMetadata({ params }) {
  const { machine: machineSlug } = await params
  const { data: machine } = await supabaseServer
    .from('gearup_machines')
    .select('merk, modelnummer, uitvoering')
    .eq('slug', machineSlug)
    .maybeSingle()
  if (!machine) return { title: 'Not Found' }
  return {
    title: `${machine.merk} ${machine.modelnummer} — GearUp`,
    description: `Compatibele onderdelen voor ${machine.merk} ${machine.modelnummer}`,
  }
}

function priceLabel(value) {
  if (value == null) return null
  return '€' + Number(value).toFixed(2).replace('.', ',')
}

function AdRail({ side }) {
  return (
    <aside
      className={`${side === 'left' ? 'hidden 2xl:flex' : 'hidden xl:flex'} sticky top-5 flex-col gap-[18px] w-[300px]`}
    >
      <HouseAd kind="rect" variant={side === 'left' ? 0 : 1} />
      <HouseAd kind="half" />
    </aside>
  )
}

export default async function ResultPage({ params, searchParams }) {
  const { locale, categorie: catSlug, machine: machineSlug } = await params
  const { onderdeel: onderdeelParam } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('result')
  const tp = await getTranslations('producttypes')
  const ts = await getTranslations('spec')
  const tf = await getTranslations('fuel')
  const tcommon = await getTranslations('common')

  const categoryKey = categoryFromSlug(catSlug, locale)
  if (!categoryKey) notFound()

  const { data: machine } = await supabaseServer
    .from('gearup_machines')
    .select('*')
    .eq('slug', machineSlug)
    .maybeSingle()
  if (!machine) notFound()

  // Verkeerde categorie in de URL: doorsturen naar de juiste.
  if (machine.categorie !== categoryKey) {
    const href = machineHref(machine, locale)
    if (!href) notFound()
    redirect(href)
  }

  const [{ data: koppelingen }, { data: uitvoeringen }] = await Promise.all([
    supabaseServer
      .from('gearup_koppelingen')
      .select(
        'id, geldt_voor, aantal, status, bron_url, bron_soort, vervang_pagina, onderdeel:gearup_onderdelen(id, producttype, naam, maker, fabrieksnummer, universeel_type, specificatie, soort)'
      )
      .eq('machine_id', machine.id),
    supabaseServer
      .from('gearup_machines')
      .select('id, slug, categorie, merk, modelnummer, uitvoering, typenummer')
      .eq('merk', machine.merk)
      .eq('modelnummer', machine.modelnummer)
      .neq('id', machine.id),
  ])

  // Per producttype de koppelingen uit de database. Koopopties (basis/beter/best) komen
  // later uit de kooplinks; tot die er zijn, blijven de drie vakken leeg ("binnenkort").
  const groups = groupParts(koppelingen || [], onderdeelParam)
  const relevantTypes = groups.map((g) => g.producttype)
  const byType = Object.fromEntries(groups.map((g) => [g.producttype, g.items]))
  const grouped = {}
  for (const type of relevantTypes) grouped[type] = { basis: null, beter: null, best: null }
  const fuel4 = fuelFacts(machine)
  const modelLabel =
    machine.uitvoering && machine.uitvoering !== machine.modelnummer ? machine.uitvoering : machine.modelnummer

  const uitlegMap = await fetchUitleg(locale)
  const fuel = fuelInfo(machine)

  function specCellsFor(type) {
    if (type !== 'brandstof' || !fuel.applies) return null
    return [
      { l: ts('motortype'), v: machine.motortype, go: false },
      { l: ts('brandstof'), v: tf(fuel.brandstofKey), go: false },
      { l: ts('mengverhouding'), v: fuel.meng || ts('none'), go: false },
      {
        l: ts('e10'),
        v: fuel.e10 === true ? tcommon('yes') : fuel.e10 === false ? tcommon('no') : '—',
        go: fuel.e10 === true,
      },
    ]
  }

  function buildItem(type, light = false) {
    const byTier = grouped[type]
    const available = TIERS.map((tier) => byTier[tier]).filter(Boolean)
    const minPrice = available.reduce(
      (min, p) => (p.prijs_indicatie != null && (min == null || p.prijs_indicatie < min) ? p.prijs_indicatie : min),
      null
    )
    const u = uitlegMap[uitlegKey(type, machine)] || {}
    const from =
      available.length > 0
        ? `${t('from')} ${priceLabel(minPrice)} · ${t('options_count', { count: available.length })}`
        : null
    return {
      producttype: type,
      titel: u.titel || null,
      fallbackName:
        byType[type].length === 1 ? byType[type][0].onderdeel.naam : t('fits_model', { model: modelLabel }),
      facts: <PartFacts items={byType[type]} locale={locale} manualUrl={manualUrlFor()} light={light} />,
      keuze: u.keuze || null,
      plaatsing: u.plaatsing || null,
      waarschuwing: u.waarschuwing || null,
      specCells: specCellsFor(type),
      manualNote: t('manual_note'),
      from,
      optionsByTier: byTier,
    }
  }

  // Onderdeel-bewust: gezocht onderdeel groot; anders model-overzicht (alles gelijkwaardig)
  const heroType =
    onderdeelParam && relevantTypes.includes(onderdeelParam) ? onderdeelParam : null
  function manualUrlFor() {
    return isValidUrl(machine.handleiding_url) ? machine.handleiding_url : null
  }
  const accordionTypes = heroType ? relevantTypes.filter((x) => x !== heroType) : relevantTypes
  const heroItem = heroType ? buildItem(heroType, true) : null
  const accordionItems = accordionTypes.map(buildItem)

  const manualUrl = isValidUrl(machine.handleiding_url) ? machine.handleiding_url : null

  return (
    <div className="w-full pb-12">
      {/* context */}
      <Container className="pt-1">
        <div className="flex items-center gap-[10px] flex-wrap text-[13.5px] text-mut mb-[22px]">
          <span className="text-mut-d">{t('result_for')}</span>
          {[categoryName(categoryKey, locale), machine.merk, modelLabel].map((label, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-[7px] bg-ink-2 border border-steel text-paper px-3 py-[6px] rounded-lg font-medium"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-mut" />
              {label}
            </span>
          ))}
        </div>
        <MachineNotes machine={machine} fuel={fuel4} uitvoeringen={uitvoeringen || []} locale={locale} />
      </Container>

      {/* 3-koloms grid: advertentie | content | advertentie */}
      <div className="grid gap-7 justify-center items-start grid-cols-1 xl:grid-cols-[768px_300px] 2xl:grid-cols-[300px_768px_300px] px-[18px]">
        <AdRail side="left" />

        <div className="w-full max-w-[768px] mx-auto">
          {/* HERO — gezocht onderdeel groot */}
          {heroItem && (
            <section className="bg-paper text-ink rounded-card p-[26px] relative overflow-hidden border border-line-on-light">
              <span className="absolute left-0 top-0 bottom-0 w-[6px] bg-signal" />
              <span className="inline-flex items-center gap-[7px] font-headline font-bold text-[11.5px] tracking-[0.14em] uppercase text-signal-d bg-white border border-[#f0c9b8] px-[10px] py-[5px] rounded-[7px] mb-[14px]">
                <Icon name={heroItem.producttype} className="w-[13px] h-[13px]" strokeWidth={2.2} />
                {tp(heroItem.producttype)}
              </span>
              <h1 className="font-headline font-extrabold text-2xl leading-tight tracking-[-0.02em] text-ink mb-3">
                {heroItem.titel ||
                  t('hero_fallback', { type: tp(heroItem.producttype), merk: machine.merk, model: modelLabel })}
              </h1>

              {heroItem.keuze && <p className="text-[16px] leading-relaxed text-[#36383d] mb-5">{heroItem.keuze}</p>}

              {heroItem.specCells && (
                <div className="flex flex-wrap border border-line-on-light rounded-[11px] overflow-hidden bg-white mb-5">
                  {heroItem.specCells.map((c, i) => (
                    <div key={i} className="flex-1 min-w-[120px] px-4 py-[13px] border-r border-line-on-light last:border-r-0">
                      <div className="text-[11px] tracking-[0.05em] uppercase text-mut-d font-semibold mb-[3px]">{c.l}</div>
                      <div className={`font-headline font-bold text-[17px] ${c.go ? 'text-ok' : 'text-ink'}`}>{c.v}</div>
                    </div>
                  ))}
                </div>
              )}

              {heroItem.plaatsing && (
                <div className="bg-[#faf8f3] border border-line-on-light rounded-[11px] px-4 py-[13px] mb-5">
                  <div className="font-headline font-bold text-[11px] tracking-[0.06em] uppercase text-mut-d mb-[6px]">
                    {t('placement_title')}
                  </div>
                  <p className="text-[14px] leading-relaxed text-[#36383d]">{heroItem.plaatsing}</p>
                  <p className="text-[12.5px] text-mut-d mt-2 italic">{heroItem.manualNote}</p>
                </div>
              )}

              {heroItem.waarschuwing && (
                <div className="flex items-start gap-[9px] text-[13.5px] text-[#8a3d12] bg-[#fbeee4] border border-[#f3d4c2] px-[13px] py-[11px] rounded-[9px] leading-snug mb-6">
                  <span className="flex-none mt-[1px]"><Icon name="warning" className="w-[17px] h-[17px]" strokeWidth={2.2} /></span>
                  <span>{heroItem.waarschuwing}</span>
                </div>
              )}

              {heroItem.facts && <div className="mb-5">{heroItem.facts}</div>}

              <div className="font-headline font-bold text-[13px] tracking-[0.04em] uppercase text-mut-d mb-3">
                {t('options_lead')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[11px]">
                {TIERS.map((tier) => (
                  <OptionCard key={tier} product={heroItem.optionsByTier[tier]} tier={tier} />
                ))}
              </div>
            </section>
          )}

          {/* Titel boven de onderdelenlijst */}
          {accordionItems.length > 0 && (
            <>
              <div className={`${heroItem ? 'mt-[38px]' : 'mt-1'} mb-[6px] mx-[2px]`}>
                <h2 className="font-headline font-extrabold text-[21px] tracking-[-0.02em] text-paper leading-tight">
                  {heroItem
                    ? t('more_gear_title', { model: modelLabel })
                    : t('overview_title', { model: modelLabel })}
                </h2>
              </div>
              <p className="text-sm text-mut mx-[2px] mb-[18px] leading-relaxed">
                {heroItem ? t('more_gear_sub') : t('overview_sub')}
              </p>
              <GearAccordion items={accordionItems} />
            </>
          )}

          {/* HANDLEIDING — alleen bij geldige URL */}
          {manualUrl && (
            <section className="mt-12">
              <div className="bg-anthracite rounded-card p-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-2">
                  <h3 className="font-headline font-bold text-2xl text-white uppercase leading-none mb-3">{t('manual_title')}</h3>
                  <p className="text-mut mb-5 max-w-xs">{t('manual_description')}</p>
                  <a
                    href={manualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-signal hover:brightness-110 text-white px-7 py-3 rounded-md font-headline font-bold tracking-widest w-fit transition"
                  >
                    {t('manual_button')}
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* TRUST */}
          <div className="mt-8 text-[12px] text-mut-d leading-relaxed border-t border-steel pt-4 flex gap-[9px] items-start">
            <span className="flex-none mt-[1px] text-mut"><Icon name="shield" className="w-[15px] h-[15px]" strokeWidth={2} /></span>
            <span>{t('disclaimer')}</span>
          </div>
        </div>

        <AdRail side="right" />
      </div>
    </div>
  )
}

async function MachineNotes({ machine, fuel, uitvoeringen, locale }) {
  const t = await getTranslations('machine')
  const links = uitvoeringen.map((u) => ({ u, href: machineHref(u, locale) })).filter((x) => x.href)
  if (!fuel.fourMix && links.length === 0) return null
  return (
    <div className="flex flex-col gap-3 mb-[22px] max-w-[768px]">
      {fuel.fourMix && (
        <div className="flex items-start gap-[8px] text-[13.5px] text-[#f0b692] bg-[#2a1c12] border border-[#5a3a23] px-3 py-[10px] rounded-[9px] leading-snug">
          <span className="flex-none mt-[1px]"><Icon name="warning" className="w-4 h-4" strokeWidth={2.2} /></span>
          <span><strong>{t('letop')}</strong> {t('fourmix')}</span>
        </div>
      )}
      {links.length > 0 && (
        <div className="text-[13px] text-mut">
          {t('other_versions', { model: machine.modelnummer })}{' '}
          {links.map(({ u, href }, i) => (
            <span key={u.id}>
              {i > 0 && ', '}
              <Link href={href} className="text-paper underline hover:text-signal">
                {u.uitvoering || u.modelnummer}
              </Link>
            </span>
          ))}
          . {t('check_plate')}
        </div>
      )}
    </div>
  )
}
