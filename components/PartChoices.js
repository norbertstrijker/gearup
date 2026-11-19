import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'
import OptionCard from '@/components/OptionCard'
import { isValidUrl } from '@/lib/links'
import { procedureDoc, partNumber, pageForLocale, groupByCondition } from '@/lib/machine'

const TIERS = ['basis', 'beter', 'best']

// Meerdere soorten van één onderdeel (besluit Norbert 18 nov): de soorten staan onder elkaar,
// elk met het kenmerk uit de bron van de maker, het nummer en eigen koopopties.
// Gegroepeerd op de voorwaarde (bv. "zwaard 35 cm"), de standaardsoort van de maker bovenaan.
// light: lichte kaart (hero) of donkere (lijst).
export default function PartChoices({ items, locale, manualUrl, optionsFor, light = false }) {
  const t = useTranslations('machine')
  const c = light
    ? { box: 'bg-white border-line-on-light', main: 'text-ink', sub: 'text-[#55575c]', mute: 'text-mut-d', head: 'text-ink', div: 'divide-line-on-light' }
    : { box: 'bg-ink border-steel-2', main: 'text-paper', sub: 'text-mut', mute: 'text-mut-d', head: 'text-paper', div: 'divide-steel-2' }
  const groups = groupByCondition(items)

  return (
    <div className="flex flex-col gap-3">
      {groups.map((g, gi) => (
        <details key={g.key || gi} open={groups.length === 1 || gi === 0} className={`border rounded-[10px] ${c.box}`}>
          <summary className={`cursor-pointer select-none px-3 py-[11px] flex items-center justify-between gap-3 ${c.head}`}>
            <span className="font-semibold text-[14px]">{g.key || t('all_versions')}</span>
            <span className={`text-[12px] ${c.mute}`}>{t('types_count', { count: g.items.length })}</span>
          </summary>
          <ul className={`divide-y border-t ${c.div} ${light ? 'border-line-on-light' : 'border-steel-2'}`}>
            {g.items.map((k) => {
              const o = k.onderdeel
              const nr = partNumber(o)
              const page = pageForLocale(k.vervang_pagina, locale)
              const docUrl = procedureDoc(k, manualUrl, isValidUrl)
              const opts = optionsFor(k)
              return (
                <li key={k.id} className="px-3 py-[13px] text-[13px] leading-snug">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`font-semibold text-[14px] ${c.main}`}>{o.naam}</span>
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
                      <OptionCard key={tier} product={opts[tier]} tier={tier} mini />
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        </details>
      ))}
    </div>
  )
}
