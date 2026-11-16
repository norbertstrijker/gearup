import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { supabaseServer } from '@/lib/supabase-server'
import SearchBar from '@/components/SearchBar'
import MachineCard from '@/components/MachineCard'
import Container from '@/components/Container'
import Icon from '@/components/Icons'
import { CATEGORIES, categoryName } from '@/lib/categories'

async function searchMachines(q) {
  const words = q.toLowerCase().split(/\s+/)
  const { data } = await supabaseServer
    .from('gearup_machines')
    .select('*')
    .or(`merk.ilike.%${words[0]}%,modelnummer.ilike.%${words[0]}%`)
    .order('merk')
    .limit(50)
  return data || []
}

export default async function SuggestiesPage({ params, searchParams }) {
  const { locale } = await params
  setRequestLocale(locale)
  const { q, cat, merk, onderdeel, model } = await searchParams
  const t = await getTranslations('suggestions')
  const te = await getTranslations('empty')
  const tp = await getTranslations('producttypes')

  const validCat = cat && CATEGORIES[cat] ? cat : null

  // Machines ophalen op basis van de herkende intentie
  let machines = []
  if (merk || validCat) {
    let qy = supabaseServer.from('gearup_machines').select('*')
    if (merk) qy = qy.eq('merk', merk)
    if (validCat) qy = qy.eq('categorie', validCat)
    // Modelnummer uit de zoekopdracht (bv. "ms 170"): alleen die uitvoeringen tonen
    for (const tok of (model || '').split(/\s+/).filter(Boolean)) qy = qy.ilike('modelnummer', `%${tok}%`)
    const { data } = await qy.order('merk').order('modelnummer').limit(100)
    machines = data || []
  } else if (q) {
    machines = await searchMachines(q)
  }

  const categorieen = [...new Set(machines.map((m) => m.categorie))]
  const merken = [...new Set(machines.map((m) => m.merk))]

  // Kop bepalen
  let heading = t('title_generic')
  let subhead = t('lead')
  if (merk && validCat) {
    heading = t('title_brand', { merk, category: categoryName(validCat, locale) })
  } else if (merk) {
    if (categorieen.length > 1) {
      heading = t('title_generic')
      subhead = t('merk_multi', { merk })
    } else if (categorieen.length === 1) {
      heading = t('title_brand', { merk, category: categoryName(categorieen[0], locale) })
    }
  } else if (validCat) {
    heading = t('title_category', { category: categoryName(validCat, locale) })
    subhead = onderdeel ? t('pick_for_part', { part: tp(onderdeel) }) : t('pick_model')
  } else if (merken.length === 1 && categorieen.length === 1) {
    heading = t('title_brand', { merk: merken[0], category: categoryName(categorieen[0], locale) })
  }

  // Context-chips (alleen lezen) van wat we begrepen hebben
  const ctxChips = []
  if (validCat) ctxChips.push(categoryName(validCat, locale))
  if (merk) ctxChips.push(merk)
  if (onderdeel) ctxChips.push(tp(onderdeel))
  if (!ctxChips.length && q) ctxChips.push(q)

  return (
    <Container className="pb-12">
      {/* Begrepen zoekopdracht */}
      {ctxChips.length > 0 && (
        <div className="flex items-center gap-[10px] flex-wrap text-[13.5px] text-mut mt-1 mb-4">
          <span className="text-mut-d">{t('understood')}</span>
          {ctxChips.map((label, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-[7px] bg-ink-2 border border-steel text-paper px-3 py-[6px] rounded-lg font-medium"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-signal" />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Pas je zoekopdracht aan — één duidelijke plek */}
      <div className="mb-8 max-w-[440px]">
        <label className="block text-[11px] tracking-[0.06em] uppercase text-mut-d font-semibold mb-2">
          {t('adjust_search')}
        </label>
        <SearchBar defaultValue={!validCat && !merk ? q || '' : ''} variant="compact" />
      </div>

      {machines.length > 0 ? (
        <>
          <div className="mb-7">
            <div className="font-headline font-bold text-[11.5px] tracking-[0.14em] uppercase text-signal mb-2">
              {t('kicker')}
            </div>
            <h1 className="font-headline font-extrabold text-[30px] tracking-[-0.025em] leading-tight mb-2">
              {heading}
            </h1>
            <p className="text-[15px] text-mut leading-relaxed max-w-[580px]">{subhead}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-[13px]">
            {machines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} locale={locale} onderdeel={onderdeel || null} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState locale={locale} te={te} />
      )}
    </Container>
  )
}

function EmptyState({ locale, te }) {
  return (
    <div className="text-center max-w-[520px] mx-auto mt-[10px]">
      <div className="w-[72px] h-[72px] rounded-[18px] bg-ink-2 border border-steel flex items-center justify-center text-mut mx-auto mb-[22px]">
        <Icon name="notFound" className="w-9 h-9" strokeWidth={1.7} />
      </div>
      <h1 className="font-headline font-extrabold text-[26px] tracking-[-0.02em] mb-3 leading-tight">
        {te('title')}
      </h1>
      <p className="text-[15px] text-mut leading-relaxed mb-2">{te('lead')}</p>

      <div className="inline-flex items-start gap-[9px] text-left bg-[rgba(63,178,127,0.1)] border border-[rgba(63,178,127,0.3)] text-[#7fd3aa] rounded-[11px] px-[15px] py-[11px] text-[13.5px] leading-snug mt-[18px] max-w-[440px]">
        <span className="text-ok flex-none mt-[1px]"><Icon name="check" className="w-4 h-4" strokeWidth={2.4} /></span>
        <span>{te('noted')}</span>
      </div>

      <div className="mt-7">
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
