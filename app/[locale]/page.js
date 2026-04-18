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
      <section
        className="px-6 pt-12 pb-24 relative overflow-hidden"
        style={{ backgroundColor: '#2B2D42' }}
      >
        <div className="absolute right-[-10%] top-[10%] opacity-10 select-none pointer-events-none">
          <span
            className="material-symbols-outlined text-[240px]"
            style={{ color: '#FFFFFF' }}
          >
            settings
          </span>
        </div>
        <div className="relative z-10">
          <h1
            className="text-4xl md:text-6xl font-bold leading-none uppercase mb-4 tracking-tight"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#FFFFFF',
            }}
          >
            {t('hero.headline')}
          </h1>
          <p
            className="text-lg mb-8 max-w-md"
            style={{ color: '#9394AE' }}
          >
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col gap-4 mb-8">
            <SearchBar />
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((label) => (
                <a
                  key={label}
                  href={`/api/zoek?q=${encodeURIComponent(label)}&locale=${locale}`}
                  className="px-4 py-2 rounded-sm text-sm font-bold uppercase transition-all"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    backgroundColor: '#16182C',
                    color: '#FFFFFF',
                  }}
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
        <div
          className="rounded-xl p-6 shadow-2xl"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(199, 197, 205, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(22, 24, 44, 0.1)',
          }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(253, 113, 31, 0.1)' }}
                >
                  <span
                    className="font-black text-xl"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: '#FD711F',
                    }}
                  >
                    {step}
                  </span>
                </div>
                <p
                  className="font-bold text-sm uppercase tracking-tight"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: '#181A2E',
                  }}
                >
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
          <h2
            className="text-2xl font-bold uppercase tracking-tighter italic"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#16182C',
            }}
          >
            {t('categories.title')}
          </h2>
          <div
            className="h-[2px] flex-grow mx-4 mb-2"
            style={{ backgroundColor: 'rgba(199, 197, 205, 0.2)' }}
          />
        </div>
        <CategoryGrid locale={locale} />
      </section>

      {/* Manual Section */}
      <section className="px-6 py-8">
        <div
          className="rounded-xl p-8 relative overflow-hidden group"
          style={{ backgroundColor: '#2B2D42' }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110">
            <span
              className="material-symbols-outlined text-8xl"
              style={{ color: '#FD711F' }}
            >
              menu_book
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <h3
              className="text-3xl font-bold uppercase leading-none mb-4"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#FFFFFF',
              }}
            >
              {t('manual.title')}
            </h3>
            <p
              className="mb-6 max-w-xs"
              style={{ color: '#9394AE' }}
            >
              {t('manual.description')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
