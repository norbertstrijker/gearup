import { setRequestLocale, getTranslations } from 'next-intl/server'
import { supabaseServer } from '@/lib/supabase-server'
import SearchBar from '@/components/SearchBar'
import CategoryGrid from '@/components/CategoryGrid'
import Container from '@/components/Container'
import Icon from '@/components/Icons'

const WHY = [
  { key: 'independent', icon: 'shield' },
  { key: 'oneclick', icon: 'target' },
  { key: 'nosearch', icon: 'bolt' },
]

export default async function HomePage({ params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  const { data: machines } = await supabaseServer
    .from('gearup_machines')
    .select('merk, modelnummer, categorie')
    .order('merk')

  const rows = machines || []
  const counts = {}
  for (const m of rows) counts[m.categorie] = (counts[m.categorie] || 0) + 1
  const populated = Object.keys(counts)
  const modelCount = rows.length
  const categoryCount = populated.length
  const chips = rows.slice(0, 4).map((m) => `${m.merk} ${m.modelnummer}`)

  return (
    <Container className="pb-16">
      {/* HERO — scope & belofte */}
      <section className="relative text-center pt-10 pb-2">
        {/* decoratief: zachte gereedschap-iconen op de achtergrond */}
        <div className="pointer-events-none select-none absolute inset-0 -z-10 overflow-hidden opacity-[0.05]">
          <Icon name="grasmaaiers" className="w-40 h-40 absolute -left-6 top-8 text-paper" />
          <Icon name="kettingzagen" className="w-40 h-40 absolute -right-6 top-2 text-paper" />
        </div>

        <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-signal bg-signal-soft border border-signal-d px-[14px] py-[6px] rounded-full mb-[22px]">
          <span className="pulse w-[7px] h-[7px] rounded-full bg-signal" />
          {t('hero.eyebrow')}
        </span>

        <h1 className="font-headline font-extrabold text-[38px] md:text-[44px] leading-[1.08] tracking-[-0.03em] mb-[14px]">
          {t('hero.headline_pre')} <span className="text-signal">{t('hero.headline_hl')}</span>
        </h1>

        <p className="text-[18px] md:text-[19px] font-semibold text-paper max-w-[560px] mx-auto mb-3 inline-flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-[6px] text-mut"><Icon name="leaf" className="w-[18px] h-[18px] text-ok" /> </span>
          {t('hero.scope')}
        </p>
        <p className="text-[16px] leading-relaxed text-mut max-w-[520px] mx-auto mb-[30px]">
          {t('hero.recognise')}
        </p>

        <SearchBar />
        <p className="text-[12.5px] text-mut-d mt-3 max-w-[560px] mx-auto">{t('hero.hint')}</p>

        {chips.length > 0 && (
          <div className="mt-[28px] max-w-[600px] mx-auto">
            <div className="text-[11.5px] tracking-[0.08em] uppercase text-mut font-semibold mb-3">
              {t('popular.label')}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {chips.map((label) => (
                <a
                  key={label}
                  href={`/api/zoek?q=${encodeURIComponent(label)}&locale=${locale}`}
                  className="group inline-flex items-center gap-[7px] bg-ink-2 border border-steel text-paper text-[13px] font-medium px-[14px] py-2 rounded-full hover:border-signal hover:text-signal transition-all"
                >
                  <span className="text-signal flex"><Icon name="search" className="w-[14px] h-[14px]" strokeWidth={2} /></span>
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CATEGORIEKAARTEN */}
      <div className="text-center mt-[50px] mb-1">
        <h2 className="font-headline font-extrabold text-[22px] tracking-[-0.02em]">{t('categories.title')}</h2>
        <p className="text-sm text-mut mt-[6px]">{t('categories.subtitle')}</p>
      </div>
      <div className="mt-[22px]">
        <CategoryGrid locale={locale} counts={counts} />
      </div>

      {/* STATS — na de categorieën */}
      <div className="flex justify-center mt-[40px] max-w-[560px] mx-auto border border-steel rounded-card overflow-hidden bg-[rgba(31,34,41,0.5)]">
        <div className="flex-1 py-[18px] px-[14px] text-center border-r border-steel">
          <div className="font-headline font-extrabold text-2xl text-paper leading-none">{modelCount}</div>
          <div className="text-[11.5px] text-mut mt-[6px]">{t('stats.models')}</div>
        </div>
        <div className="flex-1 py-[18px] px-[14px] text-center border-r border-steel">
          <div className="font-headline font-extrabold text-2xl text-paper leading-none">{categoryCount}</div>
          <div className="text-[11.5px] text-mut mt-[6px]">{t('stats.categories')}</div>
        </div>
        <div className="flex-1 py-[18px] px-[14px] text-center">
          <div className="font-headline font-extrabold text-2xl text-paper leading-none">3</div>
          <div className="text-[11.5px] text-mut mt-[6px]">{t('stats.languages')}</div>
        </div>
      </div>

      {/* WAAROM GEARUP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-[40px]">
        {WHY.map(({ key, icon }) => (
          <div key={key} className="bg-ink-2 border border-steel rounded-card p-5 flex flex-col gap-2">
            <span className="w-10 h-10 rounded-[10px] bg-ink border border-steel flex items-center justify-center text-signal">
              <Icon name={icon} className="w-[22px] h-[22px]" strokeWidth={2} />
            </span>
            <span className="font-headline font-bold text-[14px] text-paper leading-tight mt-1">{t(`why.${key}_t`)}</span>
            <span className="text-[12.5px] text-mut leading-snug">{t(`why.${key}_d`)}</span>
          </div>
        ))}
      </div>
    </Container>
  )
}
