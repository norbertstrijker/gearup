import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { supabaseServer } from '@/lib/supabase-server'
import SearchBar from '@/components/SearchBar'
import MachineCard from '@/components/MachineCard'

export default async function SuggestiesPage({ params, searchParams }) {
  const { locale } = await params
  setRequestLocale(locale)
  const { q } = await searchParams
  const t = await getTranslations('suggestions')

  let machines = []
  if (q) {
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

    machines = data || []
  }

  return (
    <div className="pt-20 pb-12 px-6 max-w-2xl mx-auto w-full">
      {/* Search bar */}
      <div className="mb-8">
        <SearchBar defaultValue={q || ''} variant="compact" />
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1
          className="text-3xl tracking-tighter uppercase mb-2"
          style={{ color: '#16182C', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900 }}
        >
          {t('title')}
        </h1>
        {machines.length > 0 ? (
          <p className="font-medium" style={{ color: '#46464D' }}>
            {t('count', { count: machines.length })}
          </p>
        ) : (
          <p className="font-medium" style={{ color: '#46464D' }}>
            {t('not_found', { query: q || '' })}
          </p>
        )}
      </div>

      {/* Model grid */}
      {machines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
