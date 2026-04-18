import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { supabaseServer } from '@/lib/supabase-server'
import { categoryFromSlug, categoryEmoji, categoryProducttypes } from '@/lib/categories'
import ProductCarousel from '@/components/ProductCarousel'

export async function generateMetadata({ params }) {
  const { locale, machine: machineSlug } = await params
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

export default async function ResultPage({ params }) {
  const { locale, categorie: catSlug, machine: machineSlug } = await params
  setRequestLocale(locale)
  const t = await getTranslations('result')

  const categoryKey = categoryFromSlug(catSlug, locale)
  if (!categoryKey) notFound()

  const { data: machine } = await supabaseServer
    .from('gearup_machines')
    .select('*')
    .eq('slug', machineSlug)
    .single()

  if (!machine) notFound()

  // Fetch products: machine-specific first, then generic fallback
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

  // Merge: machine-specific products take priority per producttype+kwaliteit
  const allProducts = [...(specificProducts || []), ...(genericProducts || [])]
  const seen = new Set()
  const deduped = allProducts.filter((p) => {
    const key = `${p.producttype}-${p.kwaliteit}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Group by producttype, only show types relevant to this category
  const relevantTypes = categoryProducttypes(categoryKey)
  const grouped = {}
  for (const type of relevantTypes) {
    grouped[type] = deduped.filter((p) => p.producttype === type)
  }

  const emoji = categoryEmoji(categoryKey)
  const motorLabel = machine.motortype === 'accu'
    ? 'Accu'
    : machine.mengverhouding
      ? `${machine.motortype} · mengverhouding ${machine.mengverhouding}`
      : machine.motortype

  const manualUrl = machine.handleiding_url
    || `https://www.manualslib.com/search/?q=${encodeURIComponent(machine.merk + ' ' + machine.modelnummer)}`

  return (
    <div className="pt-20 pb-20 px-4 max-w-2xl mx-auto w-full">
      {/* Machine card */}
      <section
        className="mb-10 p-6 flex items-center gap-6"
        style={{ backgroundColor: '#E0E0FC', borderLeft: '8px solid #E8620A' }}
      >
        <div
          className="w-20 h-20 flex items-center justify-center flex-shrink-0 text-4xl"
          style={{ backgroundColor: '#C7C5CD' }}
        >
          {machine.afbeelding_url ? (
            <img src={machine.afbeelding_url} alt={`${machine.merk} ${machine.modelnummer}`} className="w-full h-full object-contain" />
          ) : emoji}
        </div>
        <div className="flex-grow">
          <h1
            className="text-2xl tracking-tighter mb-2 uppercase"
            style={{ color: '#16182C', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
          >
            {machine.merk} {machine.modelnummer}
          </h1>
          <div className="flex flex-wrap gap-3 items-center">
            <span
              className="px-3 py-1 text-xs"
              style={{ backgroundColor: '#E8620A', color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}
            >
              {motorLabel}
            </span>
            <span
              className="text-xs uppercase tracking-tight"
              style={{ color: '#15803d', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}
            >
              ✅ {t('found_in_db')}
            </span>
          </div>
        </div>
      </section>

      {/* Compatible products */}
      <section>
        <h2
          className="text-3xl tracking-tighter uppercase mb-2"
          style={{ color: '#16182C', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900 }}
        >
          {t('compatible_products')}
        </h2>
        <div className="h-1 w-24 mb-10" style={{ backgroundColor: '#E8620A' }} />

        <div className="space-y-16">
          {relevantTypes.map((type) => (
            <ProductCarousel
              key={type}
              producttype={type}
              products={grouped[type] || []}
            />
          ))}
        </div>
      </section>

      {/* Manual section */}
      <section className="mt-16">
        <div className="rounded-xl p-8 relative overflow-hidden group" style={{ backgroundColor: '#2B2D42' }}>
          <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-8xl" style={{ color: '#9394AE' }}>menu_book</span>
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <h3
              className="text-3xl uppercase leading-none mb-4"
              style={{ color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}
            >
              {t('manual_title')}
            </h3>
            <p className="mb-6 max-w-xs" style={{ color: '#9394AE' }}>
              {t('manual_description')}
            </p>
            <a
              href={manualUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-md tracking-widest w-fit transition-all active:scale-95"
              style={{ backgroundColor: '#E8620A', color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}
            >
              {t('manual_button')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
