'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'
import OptionCard from '@/components/OptionCard'
import { isValidUrl } from '@/lib/links'
import { procedureDoc, partNumber, pageForLocale, groupByCondition, soortVan } from '@/lib/machine'

const TIERS = ['basis', 'beter', 'best']

// Meerdere soorten van één onderdeel (besluit Norbert 18 en 19 nov).
// Passen er op dit model meerdere maten (bv. zwaard 30, 35 en 40 cm), dan staat bovenaan een LET OP
// en één regel om de maat te kiezen; anders niet. Daaronder de soorten als categorieën in gewone
// taal (afgeleid van het kenmerk van de maker), elk met eigen koopopties.
// options: { [koppeling-id]: { basis, beter, best } } — komt later uit de kooplinks.
export default function PartChoices({ items, locale, manualUrl, options = {}, light = false }) {
  const t = useTranslations('machine')
  const ts = useTranslations('soorten')
  const groups = groupByCondition(items)
  const [sel, setSel] = useState(0)
  const g = groups[Math.min(sel, groups.length - 1)]
  const c = light
    ? { box: 'bg-white border-line-on-light', main: 'text-ink', sub: 'text-[#55575c]', mute: 'text-mut-d', div: 'divide-line-on-light',
        chip: 'border-line-on-light text-ink bg-white', chipOn: 'bg-ink text-white border-ink', warn: 'text-[#8a3d12] bg-[#fbeee4] border-[#f3d4c2]' }
    : { box: 'bg-ink border-steel-2', main: 'text-paper', sub: 'text-mut', mute: 'text-mut-d', div: 'divide-steel-2',
        chip: 'border-steel-2 text-paper', chipOn: 'bg-signal text-white border-signal', warn: 'text-[#f0b692] bg-[#2a1c12] border-[#5a3a23]' }

  const lengtes = [...new Set(groups.map((x) => x.lengte).filter(Boolean))]
  const diktes = [...new Set(groups.map((x) => x.dikte).filter(Boolean))]
  const lijst = (xs) => new Intl.ListFormat(locale, { type: 'conjunction' }).format(xs)
  const matenTekst = lijst(lengtes.map((x) => x.replace(' cm', ''))) + ' cm'

  return (
    <div className="flex flex-col gap-3">
      {(groups.length > 1 || items[0]?.onderdeel?.producttype === 'ketting') && (
        <div className={`flex items-start gap-[8px] text-[13.5px] border px-3 py-[10px] rounded-[9px] leading-snug ${c.warn}`}>
            <span className="flex-none mt-[1px]"><Icon name="warning" className="w-4 h-4" strokeWidth={2.2} /></span>
            <span>
              <strong>{t('letop')}</strong>{' '}
              {lengtes.length > 1 && groups.length > 1 ? t('maten_letop', { maten: matenTekst }) : t('maten_letop_kort')}
              {diktes.length > 1 && ' ' + t('diktes_letop', { diktes: lijst(diktes.map((x) => x.replace(' mm', ''))) + ' mm' })}
            </span>
        </div>
      )}
      {groups.length > 1 && (
        <>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('maat_kiezen')}>
            {groups.map((x, i) => (
              <button
                key={x.key || i}
                type="button"
                role="radio"
                aria-checked={i === sel}
                onClick={() => setSel(i)}
                className={`border rounded-[9px] px-3 py-[7px] text-[13px] font-semibold transition ${i === sel ? c.chipOn : c.chip}`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </>
      )}

      <ul className={`border rounded-[10px] divide-y ${c.box} ${c.div}`}>
        {g.items.map((k) => {
          const o = k.onderdeel
          const nr = partNumber(o)
          const page = pageForLocale(k.vervang_pagina, locale)
          const docUrl = procedureDoc(k, manualUrl, isValidUrl)
          const soort = soortVan(o)
          const opts = options[k.id] || {}
          return (
            <li key={k.id} className="px-3 py-[13px] text-[13px] leading-snug">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                <span className={`font-semibold text-[15px] ${c.main}`}>{soort ? ts(soort.key) : o.naam}</span>
                {soort && <span className={`text-[12px] ${c.mute}`}>{soort.merknaam}</span>}
                {k.standaard === true && (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ok border border-ok rounded px-[6px] py-[1px]">
                    {t('standaard')}
                  </span>
                )}
              </div>
              {o.kenmerk && <div className={`mb-1 ${c.sub}`}>{o.kenmerk}</div>}
              <div className={c.sub}>
                {nr ? (
                  <>
                    <span className={c.mute}>{t(nr.kind)}:</span> <span className={`font-semibold ${c.main}`}>{nr.value}</span>
                  </>
                ) : (
                  <span className={c.mute}>{t('no_number')}</span>
                )}
                {o.specificatie && <span className={c.mute}> · {o.specificatie}</span>}
              </div>
              {k.rest && (
                <div className={`mt-1 ${c.sub}`}>
                  <span className={c.mute}>{t('geldt_voor')}</span> {k.rest}
                </div>
              )}
              {k.status !== 'geverifieerd' && (
                <div className="mt-2 inline-flex items-start gap-[6px] text-[12.5px] text-[#c2560f]">
                  <Icon name="warning" className="w-[14px] h-[14px] mt-[1px] flex-none" strokeWidth={2.2} />
                  {t('not_verified')}
                </div>
              )}
              {(isValidUrl(k.bron_url) || (page && docUrl)) && (
                <div className="mt-1 flex flex-wrap gap-x-4 text-[12px]">
                  {isValidUrl(k.bron_url) && (
                    <a href={k.bron_url} target="_blank" rel="noopener noreferrer" className={`underline ${c.mute} hover:text-signal`}>
                      {t('bron')}
                    </a>
                  )}
                  {page && docUrl && (
                    <a href={`${docUrl}#page=${page.page}`} target="_blank" rel="noopener noreferrer" className={`underline ${c.mute} hover:text-signal`}>
                      {t('procedure', { page: page.page })}
                    </a>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[9px] mt-3">
                {TIERS.map((tier) => (
                  <OptionCard key={tier} product={opts[tier] || null} tier={tier} mini />
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
