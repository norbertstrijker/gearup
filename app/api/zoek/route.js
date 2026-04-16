import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { categorySlug } from '@/lib/categories'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const locale = searchParams.get('locale') || 'nl'

  if (!q) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  // Split query into words for matching
  const words = q.toLowerCase().split(/\s+/)

  // Try exact match on merk + modelnummer combination
  const { data: machines, error } = await supabaseServer
    .from('gearup_machines')
    .select('*')
    .or(
      words.length === 1
        ? `merk.ilike.%${words[0]}%,modelnummer.ilike.%${words[0]}%`
        : `and(merk.ilike.%${words[0]}%,modelnummer.ilike.%${words.slice(1).join(' ')}%),and(merk.ilike.%${words[0]}% ${words[1]}%,modelnummer.ilike.%${words.slice(2).join(' ')}%)`
    )
    .order('merk')
    .limit(50)

  // Log the search
  await supabaseServer.from('gearup_zoekopdrachten').insert({
    invoer: q,
    gevonden: machines && machines.length > 0,
    taal: locale,
  })

  if (error || !machines || machines.length === 0) {
    return NextResponse.redirect(
      new URL(`/${locale}/suggesties?q=${encodeURIComponent(q)}`, request.url)
    )
  }

  if (machines.length === 1) {
    const machine = machines[0]
    const catSlug = categorySlug(machine.categorie, locale)
    return NextResponse.redirect(
      new URL(`/${locale}/${catSlug}/${machine.slug}`, request.url)
    )
  }

  return NextResponse.redirect(
    new URL(`/${locale}/suggesties?q=${encodeURIComponent(q)}`, request.url)
  )
}
