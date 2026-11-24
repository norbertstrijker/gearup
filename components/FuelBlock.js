'use client'

import { useTranslations } from 'next-intl'
import OptionCard from '@/components/OptionCard'
import { palette } from '@/components/PartChoices'
import { fuelParts } from '@/lib/machine'

const TIERS = ['basis', 'beter', 'best']

// Brandstof voor 2-takt en 4-MIX (besluit 22 nov, Norbert): eerst kant-en-klaar kopen, daaronder
// zelf mengen. Bij zelf mengen staat de mengverhouding bij de olie, in ml per liter, omdat de
// verhouding volgens de handleiding van de olie afhangt. De volledige voorwaarden staan uitklapbaar.
export default function FuelBlock({ items, e10, options = {}, light = false }) {
  const t = useTranslations('bs')
  const c = palette(light)
  const { kantEnKlaar, mengen } = fuelParts(items)
  const kop = `font-headline font-bold text-[12px] tracking-[0.05em] uppercase mb-2 ${c.mute}`

  return (
    <div className="flex flex-col gap-5">
      {kantEnKlaar.length > 0 && (
        <section>
          <h3 className={kop}>{t('kant_kop')}</h3>
          <p className={`text-[13px] mb-2 ${c.sub}`}>{t('kant_uitleg')}</p>
          <ul className="flex flex-col gap-3">
            {kantEnKlaar.map((x) => (
              <li key={x.k.id} className={`border rounded-[10px] px-3 py-3 text-[13px] leading-snug ${c.box}`}>
                <p className={`font-semibold text-[15px] ${c.main}`}>{x.naam}</p>
                {x.nummer && (
                  <p className={c.sub}>
                    <span className={c.mute}>{t('origineel')}</span> {x.nummer}
                  </p>
                )}
                {x.k.onderdeel?.kenmerk && <p className={`mt-1 ${c.sub}`}>{x.k.onderdeel.kenmerk}</p>}
                <Voorwaarden k={x.k} c={c} t={t} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[9px] mt-3">
                  {TIERS.map((tier) => (
                    <OptionCard key={tier} product={(options[x.k.id] || {})[tier] || null} tier={tier} mini />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {mengen.length > 0 && (
        <section>
          <h3 className={kop}>{kantEnKlaar.length ? t('meng_kop') : t('meng_kop_alleen')}</h3>
          <div className={`border rounded-[10px] px-3 py-3 text-[13px] leading-snug ${c.box}`}>
            <p className={`mb-2 ${c.sub}`}>{t('meng_uitleg')}</p>
            <p className={`mb-3 ${c.sub}`}>
              <span className={`font-semibold ${c.main}`}>{t('benzine')}</span>{' '}
              {e10 === true ? t('benzine_e10_ja') : e10 === false ? t('benzine_e10_nee') : t('benzine_e10_onbekend')}
            </p>
            <p className={`font-semibold mb-1 ${c.main}`}>{t('olie')}</p>
            <ul className="flex flex-col gap-2 mb-1">
              {mengen.map((m) => (
                <li key={m.k.id} className={`border rounded-[9px] px-3 py-2 ${c.chip}`}>
                  <span className={`font-semibold ${c.main}`}>
                    {m.ml ? t('ml_per_liter', { ml: m.ml }) : m.verhouding}
                  </span>
                  {m.ml && <span className={c.mute}> ({m.verhouding})</span>}
                  <span className={c.sub}> · {t('olie_' + m.olie)}</span>
                  <Voorwaarden k={m.k} c={c} t={t} />
                </li>
              ))}
            </ul>
            <p className={`text-[12px] mb-3 ${c.mute}`}>{t('olie_let_op')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[9px]">
              {TIERS.map((tier) => (
                <OptionCard key={tier} product={(options['olie'] || {})[tier] || null} tier={tier} mini />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// De volledige voorwaarden uit de bron, ingeklapt: voor wie het precies wil weten.
function Voorwaarden({ k, c, t }) {
  if (!k.geldt_voor) return null
  return (
    <details className="mt-1">
      <summary className={`cursor-pointer text-[12px] underline ${c.mute}`}>{t('alle_voorwaarden')}</summary>
      <p className={`mt-1 text-[12px] ${c.sub}`}>{k.geldt_voor}</p>
      {k.bron_url && (
        <a href={k.bron_url} target="_blank" rel="noopener noreferrer" className={`text-[12px] underline ${c.mute}`}>
          {t('bron')}
        </a>
      )}
    </details>
  )
}
