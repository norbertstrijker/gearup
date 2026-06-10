import { setRequestLocale, getTranslations } from 'next-intl/server'
import { supabaseServer } from '@/lib/supabase-server'
import SearchBar from '@/components/SearchBar'
import CategoryGrid from '@/components/CategoryGrid'
import Icon from '@/components/Icons'

export default async function HomePage({ params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  // Echte data: welke categorieën zijn gevuld, hoeveel modellen, welke modellen
  const { data: machines } = await supabaseServer
    .from('gearup_machines')
    .select('merk, modelnummer, categorie')
    .order('merk')

  const rows = machines || []
  const populated = [...new Set(rows.map((m) => m.categorie))]
  const modelCount = rows.length
  const categoryCount = populated.length

  // "Meest gezocht": echte modellen uit de database (later afleidbaar uit gearup_zoekopdrachten)
  const chips = rows.slice(0, 4).map((m) => `${m.merk} ${m.modelnummer}`)

  return (
    <div className="max-w-[760px] mx-auto px-[18px] pb-16">
      {/* HERO */}
      <section className="text-center pt-10 pb-2">
        <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-signal bg-signal-soft border border-signal-d px-[14px] py-[6px] rounded-full mb-[22px]">
          <span className="pulse w-[7px] h-[7px] rounded-full bg-signal" />
          {t('hero.eyebrow')}
        </span>

        <h1 className="font-headline font-extrabold text-[38px] md:text-[44px] leading-[1.08] tracking-[-0.03em] mb-[14px]">
          {t('hero.headline_pre')} <span className="text-signal">{t('hero.headline_hl')}</span>
        </h1>
        <p className="text-[17px] leading-relaxed text-mut max-w-[520px] mx-auto mb-[30px]">
          {t('hero.lead')}
        </p>

        <SearchBar />
        <p className="text-[12.5px] text-mut-d mt-3 max-w-[560px] mx-auto">{t('hero.hint')}</p>

        {/* MEEST GEZOCHT */}
        {chips.length > 0 && (
          <div className="mt-[30px] max-w-[600px] mx-auto">
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

        {/* STATS — echte cijfers */}
        <div className="flex justify-center mt-10 max-w-[560px] mx-auto border border-steel rounded-card overflow-hidden bg-[rgba(31,34,41,0.5)]">
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
      </section>

      {/* CATEGORIEKAARTEN */}
      <div className="text-center mt-[54px] mb-1">
        <h2 className="font-headline font-extrabold text-[22px] tracking-[-0.02em]">{t('categories.title')}</h2>
        <p className="text-sm text-mut mt-[6px]">{t('categories.subtitle')}</p>
      </div>
      <div className="mt-[22px]">
        <CategoryGrid locale={locale} populated={populated} />
      </div>

      {/* TRUST */}
      <div className="mt-[46px] max-w-[600px] mx-auto text-[12.5px] text-mut-d flex gap-3 items-center justify-center flex-wrap">
        {['checked', 'independent', 'noaccount'].map((k) => (
          <span key={k} className="inline-flex items-center gap-[6px]">
            <span className="text-ok flex"><Icon name="check" className="w-[15px] h-[15px]" strokeWidth={2.5} /></span>
            {t(`trust.${k}`)}
          </span>
        ))}
      </div>
    </div>
  )
}
