import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { machineHref } from '@/lib/categories'
import { parseQuery } from '@/lib/search'

async function getMerken() {
  const { data } = await supabaseServer.from('gearup_machines').select('merk')
  if (!data) return []
  return [...new Set(data.map((r) => r.merk))]
}

// Andere schrijfwijzen van een merk (gearup_merk_aliassen). Bestaat de tabel niet
// of is hij leeg, dan zoekt de site gewoon zonder aliassen.
async function getAliassen() {
  const { data, error } = await supabaseServer.from('gearup_merk_aliassen').select('alias, merk')
  if (error || !data) return {}
  const map = {}
  for (const r of data) map[r.alias] = r.merk
  return map
}

function machineUrl(m, locale, onderdeel, base) {
  const path = machineHref(m, locale)
  if (!path) return null
  const url = new URL(path, base)
  if (onderdeel) url.searchParams.set('onderdeel', onderdeel)
  return url
}

function suggestUrl(base, locale, { merk, categorie, onderdeel, q, model }) {
  const params = new URLSearchParams()
  if (categorie) params.set('cat', categorie)
  if (merk) params.set('merk', merk)
  if (model) params.set('model', model)
  if (onderdeel) params.set('onderdeel', onderdeel)
  if (q) params.set('q', q)
  return new URL(`/${locale}/suggesties?${params.toString()}`, base)
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const locale = searchParams.get('locale') || 'nl'

  if (!q) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  const [merken, aliassen] = await Promise.all([getMerken(), getAliassen()])
  const parsed = parseQuery(q, merken, aliassen)
  const merk = parsed.merken[0] || null
  const categorie = parsed.categorieen[0] || null
  const onderdeel = parsed.onderdelen[0] || null
  const hasModel = parsed.modelTokens.length > 0

  let gevonden = false
  let redirectUrl = null

  // 1) Eén machine identificeren als er modelnummer-tokens zijn
  if (hasModel) {
    let qy = supabaseServer.from('gearup_machines').select('*')
    if (merk) qy = qy.eq('merk', merk)
    if (categorie) qy = qy.eq('categorie', categorie)
    for (const tok of parsed.modelTokens) qy = qy.ilike('modelnummer', `%${tok}%`)
    const { data: matches } = await qy.order('merk').limit(50)

    if (matches && matches.length === 1) {
      // Zeker één model → direct naar resultaat (onderdeel meedragen)
      gevonden = true
      redirectUrl =
        machineUrl(matches[0], locale, onderdeel, request.url) ||
        suggestUrl(request.url, locale, { merk, categorie, onderdeel, q })
    } else if (matches && matches.length > 1) {
      // Meerdere mogelijke matches → keuzelijst i.p.v. gokken
      // Meerdere uitvoeringen of modellen: keuzelijst met alleen deze treffers
      gevonden = true
      redirectUrl = suggestUrl(request.url, locale, { merk, categorie, onderdeel, q, model: parsed.modelTokens.join(' ') })
    }
    // 0 matches → val hieronder terug op merk/categorie of vrije zoekopdracht
  }

  // 2) Geen zeker model → suggestielijst op basis van merk/categorie
  if (!redirectUrl && (merk || categorie)) {
    let cy = supabaseServer.from('gearup_machines').select('id', { count: 'exact', head: true })
    if (merk) cy = cy.eq('merk', merk)
    if (categorie) cy = cy.eq('categorie', categorie)
    const { count } = await cy
    gevonden = (count || 0) > 0
    redirectUrl = suggestUrl(request.url, locale, { merk, categorie, onderdeel, q })
  }

  // 3) Niets herkend → vrije-tekst fallback (oud gedrag)
  if (!redirectUrl) {
    const words = q.toLowerCase().split(/\s+/)
    const { data: free } = await supabaseServer
      .from('gearup_machines')
      .select('*')
      .or(`merk.ilike.%${words[0]}%,modelnummer.ilike.%${words[0]}%`)
      .order('merk')
      .limit(50)

    if (free && free.length === 1) {
      gevonden = true
      redirectUrl =
        machineUrl(free[0], locale, onderdeel, request.url) || suggestUrl(request.url, locale, { onderdeel, q })
    } else {
      gevonden = Boolean(free && free.length > 0)
      redirectUrl = suggestUrl(request.url, locale, { onderdeel, q })
    }
  }

  // Zoekopdracht loggen
  await supabaseServer.from('gearup_zoekopdrachten').insert({
    invoer: q,
    gevonden,
    taal: locale,
  })

  return NextResponse.redirect(redirectUrl)
}
