import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { supabaseServer } from '@/lib/supabase-server'
import { categoryFromSlug, categoryName, machineHref } from '@/lib/categories'
import { isValidUrl } from '@/lib/links'
import { groupParts, partNumber, pageForLocale, fuelFacts } from '@/lib/machine'
import Container from '@/components/Container'
import Icon from '@/components/Icons'

function title(machine) {
  const model = machine.uitvoering && machine.uitvoering !== machine.modelnummer ? machine.uitvoering : machine.modelnummer
  return `${machine.merk} ${model}`
}

export async function generateMetadata({ params }) {
  const { machine: machineSlug } = await params
  const { data: machine } = await supabaseServer
    .from('gearup_machines')
    .select('merk, modelnummer, uitvoering')
    .eq('slug', machineSlug)
    .maybeSingle()
  if (!machine) return { title: 'Not Found' }
  return {
    title: `${title(machine)} — GearUp`,
    description: `Onderdelen die passen op de ${title(machine)}, met bron.`,
  }
}

export default async function MachinePage({ params, searchParams }) {
  const { locale, categorie: catSlug, machine: machineSlug } = await params
  const { onderdeel: onderdeelParam } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('machine')
  const tp = await getTranslations('producttypes')

  const categoryKey = categoryFromSlug(catSlug, locale)
  if (!categoryKey) notFound()

  const { data: machine } = await supabaseServer
    .from('gearup_machines')
    .select('*')
    .eq('slug', machineSlug)
    .maybeSingle()
  if (!machine) notFound()

  // Verkeerde categorie in de URL: doorsturen naar de juiste in plaats van een foutpagina.
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

  const groups = groupParts(koppelingen || [], onderdeelParam)
  const fuel = fuelFacts(machine)
  const manualUrl = isValidUrl(machine.handleiding_url) ? machine.handleiding_url : null
  const notVerifiedCount = (koppelingen || []).filter((k) => k.status !== 'geverifieerd').length

  return (
    <Container className="pb-14">
      {/* KOP */}
      <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start mt-1 mb-8">
        <div className="relative h-[170px] rounded-card bg-gradient-to-br from-paper to-paper-2 flex items-center justify-center text-[#9a958a] overflow-hidden">
          {machine.afbeelding_url ? (
            <img src={machine.afbeelding_url} alt={title(machine)} className="h-full w-full object-contain" />
          ) : (
            <>
              <Icon name={machine.categorie} className="w-20 h-20" strokeWidth={1.4} />
              <span className="absolute bottom-2 right-3 text-[10px] tracking-[0.08em] uppercase text-[#b0a99c] font-semibold">
                {t('photo_soon')}
              </span>
            </>
          )}
        </div>

        <div>
          <div className="font-headline font-bold text-[11.5px] tracking-[0.14em] uppercase text-signal mb-2">
            {categoryName(machine.categorie, locale)}
          </div>
          <h1 className="font-headline font-extrabold text-[30px] tracking-[-0.025em] leading-tight mb-3">
            {title(machine)}
          </h1>

          <div className="flex flex-wrap gap-2 text-[13px] mb-4">
            {machine.typenummer && <Chip label={t('typenummer')} value={machine.typenummer} />}
            {machine.motortype && <Chip label={t('motortype')} value={machine.motortype} />}
            {fuel.meng && <Chip label={t('mengverhouding')} value={fuel.meng} />}
            {fuel.e10 && <Chip label={t('e10')} value={t(`e10_${fuel.e10}`)} />}
            {machine.olie_spec && <Chip label={t('motorolie')} value={machine.olie_spec} />}
          </div>

          {fuel.fourMix && (
            <Notice tone="warn" icon="warning">
              <strong>{t('letop')}</strong> {t('fourmix')}
            </Notice>
          )}

          {uitvoeringen && uitvoeringen.length > 0 && (
            <div className="mt-4 bg-ink-2 border border-steel rounded-[11px] px-4 py-3">
              <div className="text-[13px] text-paper font-semibold mb-1">
                {t('other_versions', { model: machine.modelnummer })}
              </div>
              <p className="text-[12.5px] text-mut mb-2">{t('check_plate')}</p>
              <ul className="flex flex-wrap gap-2">
                {uitvoeringen.map((u) => {
                  const href = machineHref(u, locale)
                  if (!href) return null
                  return (
                    <li key={u.id}>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 text-[13px] border border-steel-2 rounded-lg px-3 py-[6px] hover:border-signal hover:text-signal"
                      >
                        {u.uitvoering || u.modelnummer}
                        {u.typenummer && <span className="text-mut-d">· {t('typenummer')} {u.typenummer}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ONDERDELEN */}
      <h2 className="font-headline font-extrabold text-[21px] tracking-[-0.02em] mb-1">
        {t('parts_title', { model: title(machine) })}
      </h2>
      <p className="text-sm text-mut mb-5 leading-relaxed">
        {groups.length > 0 ? t('parts_sub') : t('parts_none')}
        {notVerifiedCount > 0 && <> {t('parts_not_verified_count', { count: notVerifiedCount })}</>}
      </p>

      <div className="flex flex-col gap-[10px]">
        {groups.map((g) => (
          <details
            key={g.producttype}
            open={g.highlight || groups.length <= 3}
            className="group rounded-card border border-steel-2 bg-[#272b34] open:border-signal open:bg-anthracite overflow-hidden"
          >
            <summary className="cursor-pointer list-none flex items-center gap-[15px] px-4 py-[14px]">
              <span className="w-[46px] h-[46px] flex-none rounded-[10px] bg-ink border border-steel-2 flex items-center justify-center text-signal">
                <Icon name={g.producttype} className="w-6 h-6" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-headline font-bold text-[11px] tracking-[0.09em] uppercase text-signal mb-[2px]">
                  {tp(g.producttype)}
                </span>
                <span className="block text-[14.5px] font-semibold text-paper leading-tight">
                  {g.items.length === 1 ? g.items[0].onderdeel.naam : t('options', { count: g.items.length })}
                </span>
              </span>
              <span className="flex-none text-mut group-open:rotate-180 group-open:text-signal transition-transform">
                <Icon name="chevronDown" className="w-5 h-5" strokeWidth={2.2} />
              </span>
            </summary>

            <ul className="border-t border-steel-2 bg-[#1d2026] divide-y divide-steel-2">
              {g.items.map((k) => (
                <PartRow key={k.id} k={k} t={t} locale={locale} manualUrl={manualUrl} showName={g.items.length > 1} />
              ))}
            </ul>
          </details>
        ))}
      </div>

      {manualUrl && (
        <p className="mt-8 text-[13.5px] text-mut">
          {t('manual_lead')}{' '}
          <a href={manualUrl} target="_blank" rel="noopener noreferrer" className="text-signal underline">
            {t('manual_link')}
          </a>
        </p>
      )}

      <div className="mt-8 text-[12px] text-mut-d leading-relaxed border-t border-steel pt-4 flex gap-[9px] items-start">
        <span className="flex-none mt-[1px] text-mut">
          <Icon name="shield" className="w-[15px] h-[15px]" strokeWidth={2} />
        </span>
        <span>{t('disclaimer')}</span>
      </div>
    </Container>
  )
}

function Chip({ label, value }) {
  return (
    <span className="inline-flex items-center gap-[6px] bg-ink-2 border border-steel px-3 py-[5px] rounded-lg">
      <span className="text-mut-d">{label}</span>
      <span className="text-paper font-semibold">{value}</span>
    </span>
  )
}

function Notice({ tone, icon, children }) {
  const cls =
    tone === 'warn'
      ? 'text-[#f0b692] bg-[#2a1c12] border-[#5a3a23]'
      : 'text-mut bg-ink-2 border-steel-2'
  return (
    <div className={`flex items-start gap-[8px] text-[13.5px] border px-3 py-[10px] rounded-[9px] leading-snug ${cls}`}>
      <span className="flex-none mt-[1px]">
        <Icon name={icon} className="w-4 h-4" strokeWidth={2.2} />
      </span>
      <span>{children}</span>
    </div>
  )
}

function PartRow({ k, t, locale, manualUrl, showName }) {
  const o = k.onderdeel
  const nr = partNumber(o)
  const page = pageForLocale(k.vervang_pagina, locale)
  const procUrl = page ? `${(isValidUrl(k.bron_url) && k.bron_url) || manualUrl || ''}#page=${page.page}` : null
  const showSpec = o.specificatie && o.specificatie.trim() && !o.naam.includes(o.specificatie.trim())

  return (
    <li className="px-4 py-[13px]">
      {showName && <div className="text-[14.5px] text-paper font-semibold leading-snug mb-1">{o.naam}</div>}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
        {nr ? (
          <span>
            <span className="text-mut-d">{t(nr.kind)}</span> <span className="text-paper font-semibold">{nr.value}</span>
          </span>
        ) : (
          <span className="text-mut-d">{t('no_number')}</span>
        )}
        {k.aantal > 1 && (
          <span>
            <span className="text-mut-d">{t('aantal')}</span> <span className="text-paper">{k.aantal}</span>
          </span>
        )}
      </div>

      {showSpec && <div className="mt-1 text-[13px] text-mut">{o.specificatie}</div>}
      {k.geldt_voor && (
        <div className="mt-1 text-[13px] text-mut">
          <span className="text-mut-d">{t('geldt_voor')}</span> {k.geldt_voor}
        </div>
      )}

      {k.status !== 'geverifieerd' && (
        <div className="mt-2">
          <Notice tone="warn" icon="warning">
            {t('not_verified')}
          </Notice>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
        {isValidUrl(k.bron_url) && (
          <a href={k.bron_url} target="_blank" rel="noopener noreferrer" className="text-mut underline hover:text-signal">
            {t('bron')}
          </a>
        )}
        {procUrl && procUrl.startsWith('http') && (
          <a href={procUrl} target="_blank" rel="noopener noreferrer" className="text-mut underline hover:text-signal">
            {t('procedure', { page: page.page })}
          </a>
        )}
      </div>
    </li>
  )
}
