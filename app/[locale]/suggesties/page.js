import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { supabaseServer } from '@/lib/supabase-server'
import SearchBar from '@/components/SearchBar'
import MachineCard from '@/components/MachineCard'
import Icon from '@/components/Icons'
import { CATEGORIES, categoryName } from '@/lib/categories'

async function searchMachines(q) {
  const words = q.toLowerCase().split(/\s+/)
  const { data } = await supabaseServer
    .from('gearup_machines')
    .select('*')
    .or(
      words.length === 1
        ? `merk.ilike.%${words[0]}%,modelnummer.ilike.%${words[0]}%`
        : `and(merk.ilike.%${words[0]}%,modelnummer.ilike.%${words.slice(1).join(' ')}%),and(merk.ilike.%${words[0]}% ${words[1]}%,modelnummer.ilike.%${words.slice(2).join(' ')}%)`
    )
    .order('merk')
    .limit(50)
  return data || []
}

export default async function SuggestiesPage({ params, searchParams }) {
  const { locale } = await params
  setRequestLocale(locale)
  const { q, cat } = await searchParams
  const t = await getTranslations('suggestions')
  const te = await getTranslations('empty')

  // Twee modi: categorie bladeren (cat) of vrije zoekopdracht (q)
  const catMode = cat && CATEGORIES[cat]
  let machines = []
  if (catMode) {
    const { data } = await supabaseServer
      .from('gearup_machines')
      .select('*')
      .eq('categorie', cat)
      .order('merk')
      .limit(100)
    machines = data || []
  } else if (q) {
    machines = await searchMachines(q)
  }

  // Kop-logica: uniform merk+categorie → "Welke {merk} {categorie}", anders generiek
  const merken = [...new Set(machines.map((m) => m.merk))]
  const categorieen = [...new Set(machines.map((m) => m.categorie))]
  let heading = t('title_generic')
  if (catMode) {
    heading = t('title_category', { category: categoryName(cat, locale) })
  } else if (merken.length === 1 && categorieen.length === 1) {
    heading = t('title_brand', { merk: merken[0], category: categoryName(categorieen[0], locale) })
  }

  const ctxLabel = catMode ? categoryName(cat, locale) : q || ''

  return (
    <div className="max-w-[820px] mx-auto px-[18px] pb-12">
      {/* ctx breadcrumb */}
      {ctxLabel && (
        <div className="flex items-center gap-[10px] flex-wrap text-[13.5px] text-mut mt-[6px] mb-[22px]">
          <span className="inline-flex items-center gap-[7px] bg-signal-soft border border-signal-d text-paper px-3 py-[6px] rounded-lg font-medium">
            <span className="w-[6px] h-[6px] rounded-full bg-signal" />
            {ctxLabel}
          </span>
          <Link href={`/${locale}`} className="text-signal font-semibold text-[13px]">
            {te('edit')} →
          </Link>
        </div>
      )}

      {/* compacte zoekbalk */}
      <div className="mb-8 max-w-[440px]">
        <SearchBar defaultValue={catMode ? '' : q || ''} variant="compact" />
      </div>

      {machines.length > 0 ? (
        <>
          <div className="mb-7">
            <div className="font-headline font-bold text-[11.5px] tracking-[0.14em] uppercase text-signal mb-2">
              {catMode ? categoryName(cat, locale) : t('kicker')}
            </div>
            <h1 className="font-headline font-extrabold text-[30px] tracking-[-0.025em] leading-tight mb-2">
              {heading}
            </h1>
            <p className="text-[15px] text-mut leading-relaxed max-w-[580px]">{t('lead')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-[13px]">
            {machines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} locale={locale} />
            ))}
          </div>

          <div className="mt-[26px] text-[13px] text-mut-d text-center border-t border-steel pt-[18px] leading-relaxed">
            {t('help')}{' '}
            <Link href={`/${locale}`} className="text-signal font-semibold">
              {t('help_link')} →
            </Link>
          </div>
        </>
      ) : (
        <EmptyState locale={locale} query={q || ''} te={te} />
      )}
    </div>
  )
}

function EmptyState({ locale, query, te }) {
  return (
    <div className="text-center max-w-[520px] mx-auto mt-[30px]">
      <div className="w-[72px] h-[72px] rounded-[18px] bg-ink-2 border border-steel flex items-center justify-center text-mut mx-auto mb-[22px]">
        <Icon name="notFound" className="w-9 h-9" strokeWidth={1.7} />
      </div>
      <h1 className="font-headline font-extrabold text-[26px] tracking-[-0.02em] mb-3 leading-tight">
        {te('title')}
      </h1>
      <p className="text-[15px] text-mut leading-relaxed mb-2">
        {query ? te('body', { query }) : te('body_noquery')}
      </p>

      <div className="inline-flex items-start gap-[9px] text-left bg-[rgba(63,178,127,0.1)] border border-[rgba(63,178,127,0.3)] text-[#7fd3aa] rounded-[11px] px-[15px] py-[11px] text-[13.5px] leading-snug mt-[18px] max-w-[440px]">
        <span className="text-ok flex-none mt-[1px]"><Icon name="check" className="w-4 h-4" strokeWidth={2.4} /></span>
        <span>{te('noted')}</span>
      </div>

      <div className="bg-paper text-ink rounded-card px-6 py-[22px] text-left my-[26px] border border-line-on-light relative overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-[6px] bg-signal" />
        <div className="font-headline font-bold text-[11px] tracking-[0.12em] uppercase text-signal-d mb-[10px]">
          {te('general_title')}
        </div>
        <div className="text-[15px] leading-relaxed text-[#36383d]">{te('general_text')}</div>
      </div>

      <div className="flex gap-[10px] justify-center flex-wrap mt-[6px]">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-[11px] bg-signal text-white hover:brightness-110 transition"
        >
          {te('try_other')}
        </Link>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-[11px] border border-steel-2 text-paper hover:border-signal hover:text-signal transition"
        >
          {te('browse')}
        </Link>
      </div>
    </div>
  )
}
