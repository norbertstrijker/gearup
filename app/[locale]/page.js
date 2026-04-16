import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import SearchBar from '@/components/SearchBar'
import CategoryGrid from '@/components/CategoryGrid'

const QUICK_SEARCHES = ['Honda HRG 416', 'Husqvarna 135', 'Stihl MS 250']

export default function HomePage({ params }) {
  const { locale } = params
  setRequestLocale(locale)
  const t = useTranslations()

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-primary-container px-6 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute right-[-10%] top-[10%] opacity-10 select-none pointer-events-none">
          <span className="material-symbols-outlined text-[240px] text-white">settings</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-white leading-none uppercase mb-4 tracking-tight">
            {t('hero.headline')}
          </h1>
          <p className="text-on-primary-container text-lg mb-8 max-w-md">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col gap-4 mb-8">
            <SearchBar />
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((label) => (
                <a
                  key={label}
                  href={`/api/zoek?q=${encodeURIComponent(label)}&locale=${locale}`}
                  className="bg-primary text-white px-4 py-2 rounded-sm text-sm font-label font-bold uppercase transition-all hover:bg-secondary-container"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Floating How-To Card */}
      <section className="px-6 -mt-16 relative z-20">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-2xl shadow-primary/10 border border-outline-variant/10">
          <div className="flex flex-col md:flex-row gap-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-start gap-4">
                <div className="bg-secondary-container/10 p-3 rounded-lg flex items-center justify-center">
                  <span className="text-secondary-container font-headline font-black text-xl">{step}</span>
                </div>
                <p className="text-on-surface font-headline font-bold text-sm uppercase tracking-tight">
                  {t(`howto.step${step}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="px-6 py-16">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-headline font-bold text-primary uppercase tracking-tighter italic">
            {t('categories.title')}
          </h2>
          <div className="h-[2px] flex-grow mx-4 bg-outline-variant/20 mb-2" />
        </div>
        <CategoryGrid locale={locale} />
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-8">
        <div className="bg-primary-container rounded-xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-8xl text-secondary-container">bolt</span>
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-secondary-container font-headline font-black text-sm tracking-[0.2em] uppercase">
              {t('cta.status')}
            </span>
            <h3 className="text-3xl font-headline font-bold text-white uppercase leading-none mb-4 whitespace-pre-line">
              {t('cta.headline')}
            </h3>
            <p className="text-on-primary-container mb-6 max-w-xs">
              {t('cta.description')}
            </p>
            <button className="bg-cta hover:bg-secondary text-white px-8 py-3 rounded-md font-headline font-bold tracking-widest w-fit transition-all active:scale-95">
              {t('cta.button')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
