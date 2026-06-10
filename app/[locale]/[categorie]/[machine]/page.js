import Link from 'next/link'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { supabaseServer } from '@/lib/supabase-server'
import { categoryFromSlug, categoryName, categoryProducttypes } from '@/lib/categories'
import { fuelInfo, uitlegKey, primaryType, fetchUitleg } from '@/lib/advice'
import OptionCard from '@/components/OptionCard'
import GearAccordion from '@/components/GearAccordion'
import Icon from '@/components/Icons'

const TIERS = ['basis', 'beter', 'best']

export async function generateMetadata({ params }) {
  const { machine: machineSlug } = await params
  const { data: machine } = await supabaseServer
    .from('gearup_machines')
    .select('merk, modelnummer')
    .eq('slug', machineSlug)
    .single()

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
      {['rect', 'half'].map((kind) => (
        <div
          key={kind}
          className={`bg-[rgba(31,34,41,0.5)] border border-dashed border-steel-2 rounded-xl flex items-center justify-center text-mut-d text-center ${
            kind === 'rect' ? 'h-[250px]' : 'h-[600px]'
          }`}
        >
          <div>
            <div className="text-[10px] tracking-[0.14em] uppercase text-mut-d mb-2">Advertentie</div>
            <div className="text-[12.5px] text-mut">{kind === 'rect' ? '300 × 250' : '300 × 600'}</div>
          </div>
        </div>
      ))}
    </aside>
  )
}

export default async function ResultPage({ params }) {
  const { locale, categorie: catSlug, machine: machineSlug } = await params
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
    .single()
  if (!machine) notFound()

  // Producten: machine-specifiek eerst, dan generieke fallback per categorie/motortype
  const { data: specificProducts } = await supabaseServer
    .from('gearup_producten')
    .select('*')
    .eq('machine_id', machine.id)
    .eq('markt', locale)

  const { data: genericProducts } = await supabaseServer
    .from('gearup_producten')
    .select('*')
    .is('machine_id', null)
    .eq('categorie', machine.categorie)
    .eq('motortype', machine.motortype)
    .eq('markt', locale)

  const allProducts = [...(specificProducts || []), ...(genericProducts || [])]
  const seen = new Set()
  const deduped = allProducts.filter((p) => {
    const key = `${p.producttype}-${p.kwaliteit}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const relevantTypes = categoryProducttypes(categoryKey)
  const grouped = {}
  for (const type of relevantTypes) {
    const byTier = {}
    for (const tier of TIERS) {
      byTier[tier] = deduped.find((p) => p.producttype === type && p.kwaliteit === tier) || null
    }
    grouped[type] = byTier
  }

  const uitlegMap = await fetchUitleg(locale)
  const primary = primaryType(relevantTypes, machine)
  const fuel = fuelInfo(machine)

  // Hero (primair onderdeel)
  const primaryKey = primary ? uitlegKey(primary, machine) : null
  const primaryUitleg = (primaryKey && uitlegMap[primaryKey]) || {}
  const primaryOptions = primary ? grouped[primary] : null

  // "Meer gear": overige onderdelen als accordion
  const gearItems = relevantTypes
    .filter((type) => type !== primary)
    .map((type) => {
      const byTier = grouped[type]
      const available = TIERS.map((tier) => byTier[tier]).filter(Boolean)
      const minPrice = available.reduce((min, p) => {
        const v = p.prijs_indicatie
        return v != null && (min == null || v < min) ? v : min
      }, null)
      const u = uitlegMap[uitlegKey(type, machine)] || {}
      const from =
        available.length > 0
          ? `${t('from')} ${priceLabel(minPrice)} · ${t('options_count', { count: available.length })}`
          : t('coming_soon')
      return {
        producttype: type,
        titel: u.titel || null,
        fallbackName: t('fits_model', { model: machine.modelnummer }),
        from,
        optionsByTier: byTier,
      }
    })

  const manualUrl =
    machine.handleiding_url ||
    `https://www.manualslib.com/search/?q=${encodeURIComponent(machine.merk + ' ' + machine.modelnummer)}`

  // Brandstof-specbalk uit bestaande machinevelden
  const specCells =
    primary === 'brandstof' && fuel.applies
      ? [
          { l: ts('motortype'), v: machine.motortype, go: false },
          { l: ts('brandstof'), v: tf(fuel.brandstofKey), go: false },
          { l: ts('mengverhouding'), v: fuel.meng || ts('none'), go: false },
          {
            l: ts('e10'),
            v: fuel.e10 === true ? tcommon('yes') : fuel.e10 === false ? tcommon('no') : '—',
            go: fuel.e10 === true,
          },
        ]
      : null

  return (
    <div className="w-full px-[18px] pb-12">
      {/* header-context (breedte van de content) */}
      <div className="max-w-[760px] mx-auto pt-1">
        <div className="flex items-center gap-[10px] flex-wrap text-[13.5px] text-mut mb-[22px]">
          <span className="text-mut">{t('result_for')}</span>
          {[categoryName(categoryKey, locale), machine.merk, machine.modelnummer].map((label, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-[7px] bg-ink-2 border border-steel text-paper px-3 py-[6px] rounded-lg font-medium"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-mut" />
              {label}
            </span>
          ))}
          <Link href={`/${locale}`} className="text-signal font-semibold text-[13px]">
            {t('edit')} →
          </Link>
        </div>
      </div>

      {/* 3-koloms grid: advertentie | content | advertentie */}
      <div className="grid gap-7 justify-center items-start grid-cols-1 xl:grid-cols-[760px_300px] 2xl:grid-cols-[300px_760px_300px]">
        <AdRail side="left" />

        <div className="w-full max-w-[760px]">
          {/* HERO — primair onderdeel */}
          {primary && (
            <section className="bg-paper text-ink rounded-card p-[26px] relative overflow-hidden border border-line-on-light">
              <span className="absolute left-0 top-0 bottom-0 w-[6px] bg-signal" />
              <span className="inline-flex items-center gap-[7px] font-headline font-bold text-[11.5px] tracking-[0.14em] uppercase text-signal-d bg-white border border-[#f0c9b8] px-[10px] py-[5px] rounded-[7px] mb-[14px]">
                <Icon name={primary} className="w-[13px] h-[13px]" strokeWidth={2.2} />
                {tp(primary)}
              </span>
              <h1 className="font-headline font-extrabold text-2xl leading-tight tracking-[-0.02em] text-ink mb-3">
                {primaryUitleg.titel || t('hero_fallback', { type: tp(primary), merk: machine.merk, model: machine.modelnummer })}
              </h1>

              {primaryUitleg.uitleg && (
                <p className="text-[16px] leading-relaxed text-[#36383d] mb-5">{primaryUitleg.uitleg}</p>
              )}

              {specCells && (
                <div className="flex flex-wrap border border-line-on-light rounded-[11px] overflow-hidden bg-white mb-5">
                  {specCells.map((c, i) => (
                    <div key={i} className="flex-1 min-w-[120px] px-4 py-[13px] border-r border-line-on-light last:border-r-0">
                      <div className="text-[11px] tracking-[0.05em] uppercase text-mut-d font-semibold mb-[3px]">{c.l}</div>
                      <div className={`font-headline font-bold text-[17px] ${c.go ? 'text-ok' : 'text-ink'}`}>{c.v}</div>
                    </div>
                  ))}
                </div>
              )}

              {primaryUitleg.waarschuwing && (
                <div className="flex items-start gap-[9px] text-[13.5px] text-[#8a3d12] bg-[#fbeee4] border border-[#f3d4c2] px-[13px] py-[11px] rounded-[9px] leading-snug mb-6">
                  <span className="flex-none mt-[1px]"><Icon name="warning" className="w-[17px] h-[17px]" strokeWidth={2.2} /></span>
                  <span>{primaryUitleg.waarschuwing}</span>
                </div>
              )}

              <div className="font-headline font-bold text-[13px] tracking-[0.04em] uppercase text-mut-d mb-3">
                {t('options_lead')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[11px]">
                {TIERS.map((tier) => (
                  <OptionCard key={tier} product={primaryOptions?.[tier]} tier={tier} />
                ))}
              </div>
            </section>
          )}

          {/* MEER GEAR */}
          {gearItems.length > 0 && (
            <>
              <div className="mt-[38px] mb-[6px] mx-[2px]">
                <h2 className="font-headline font-extrabold text-[21px] tracking-[-0.02em] text-paper leading-tight">
                  {t('more_gear_title', { model: machine.modelnummer })}
                </h2>
              </div>
              <p className="text-sm text-mut mx-[2px] mb-[18px] leading-relaxed">{t('more_gear_sub')}</p>
              <GearAccordion items={gearItems} />
            </>
          )}

          {/* HANDLEIDING */}
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
