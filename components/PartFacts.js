import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'
import { isValidUrl } from '@/lib/links'
import { partNumber, pageForLocale } from '@/lib/machine'

// Feiten uit de bron per onderdeel: welk onderdeel precies, het nummer waarmee je het koopt,
// de voorwaarden en waar het in de handleiding staat. Staat in het uitgeklapte deel.
// light: lichte kaart (hero) of donkere (lijst).
export default function PartFacts({ items, locale, manualUrl, light = false }) {
  const t = useTranslations('machine')
  const c = light
    ? { box: 'bg-white border-line-on-light', main: 'text-ink', sub: 'text-[#55575c]', mute: 'text-mut-d', div: 'divide-line-on-light' }
    : { box: 'bg-ink border-steel-2', main: 'text-paper', sub: 'text-mut', mute: 'text-mut-d', div: 'divide-steel-2' }

  return (
    <ul className={`border rounded-[10px] divide-y ${c.box} ${c.div}`}>
      {items.map((k) => {
        const o = k.onderdeel
        const nr = partNumber(o)
        const page = pageForLocale(k.vervang_pagina, locale)
        const docUrl = (isValidUrl(k.bron_url) && k.bron_url) || manualUrl
        return (
          <li key={k.id} className="px-3 py-[11px] text-[13px] leading-snug">
            {items.length > 1 && <div className={`font-semibold mb-1 ${c.main}`}>{o.naam}</div>}
            <div className={c.sub}>
              {nr ? (
                <>
                  <span className={c.mute}>{t(nr.kind)}:</span> <span className={`font-semibold ${c.main}`}>{nr.value}</span>
                </>
              ) : (
                <span className={c.mute}>{t('no_number')}</span>
              )}
              {k.aantal > 1 && (
                <>
                  {' · '}
                  <span className={c.mute}>{t('aantal')}:</span> {k.aantal}
                </>
              )}
            </div>
            {k.geldt_voor && (
              <div className={`mt-1 ${c.sub}`}>
                <span className={c.mute}>{t('geldt_voor')}</span> {k.geldt_voor}
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
                  <a
                    href={`${docUrl}#page=${page.page}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline ${c.mute} hover:text-signal`}
                  >
                    {t('procedure', { page: page.page })}
                  </a>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
