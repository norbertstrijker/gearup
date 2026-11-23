'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'
import { PartRow, palette } from '@/components/PartChoices'
import { groupBarChain, partNumber, soortVan } from '@/lib/machine'

// Zwaard en ketting in één blok (besluiten 19 nov, Norbert):
// 1. Heeft de maker een standaardset (zwaard + ketting af fabriek), dan eerst de vraag
//    "Is het zwaard op je zaag nooit vervangen?" met die sets.
// 2. Daaronder: andere zwaarden en kettingen, te kiezen op lengte (en groefbreedte/steek als die
//    bij dezelfde lengte verschillen).
// 3. Per gekozen maat: de kettingen (los te koop, elk met eigen koopopties) en de zwaarden.
export default function BarChainBlock({ items, locale, manualUrl, options = {}, light = false }) {
  const t = useTranslations('zk')
  const tm = useTranslations('machine')
  const ts = useTranslations('soorten')
  const c = palette(light)
  const groups = groupBarChain(items)
  const sets = groups.map((g, i) => ({ g, i })).filter((x) => x.g.standaard)
  const [sel, setSel] = useState(sets.length ? sets[0].i : 0)
  const g = groups[Math.min(sel, groups.length - 1)]
  if (!g) return null

  const naam = (k) => {
    const sv = soortVan(k.onderdeel)
    return sv ? sv.merknaam : k.onderdeel.naam.replace(/^(zwaard|zaagketting) /, '')
  }
  const nummer = (k) => partNumber(k.onderdeel)?.value

  return (
    <div className="flex flex-col gap-4">
      {sets.length > 0 && (
        <div className={`border rounded-[10px] px-3 py-3 ${c.box}`}>
          <p className={`font-semibold text-[14px] mb-2 ${c.main}`}>{t('standaard_vraag')}</p>
          <ul className="flex flex-col gap-2">
            {sets.map(({ g: s, i }) => {
              const z = s.zwaarden.find((k) => k.standaard === true)
              const ks = s.kettingen.filter((k) => k.standaard === true)
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => setSel(i)}
                    className={`w-full text-left border rounded-[9px] px-3 py-[9px] text-[13px] leading-snug transition ${
                      i === sel ? c.chipOn : c.chip
                    }`}
                  >
                    <span className="font-semibold">{s.label}</span>
                    {z && (
                      <span>
                        {' · '}
                        {t('zwaard')} {naam(z)}
                        {nummer(z) && <> ({nummer(z)})</>}
                      </span>
                    )}
                    {ks.map((k) => (
                      <span key={k.id}>
                        {' · '}
                        {t('ketting')} {naam(k)}
                        {nummer(k) && <> ({nummer(k)})</>}
                      </span>
                    ))}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {groups.length > 1 && (
        <div>
          <p className={`text-[14px] mb-1 ${c.main}`}>{sets.length ? t('andere') : t('andere_zonder_standaard')}</p>
          <p className={`text-[12.5px] mb-2 ${c.mute}`}>{t('waar_staat')}</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={tm('maat_kiezen')}>
            {groups.map((x, i) => (
              <button
                key={x.key}
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
        </div>
      )}

      <div className={`flex items-start gap-[8px] text-[13.5px] border px-3 py-[10px] rounded-[9px] leading-snug ${c.warn}`}>
        <span className="flex-none mt-[1px]"><Icon name="warning" className="w-4 h-4" strokeWidth={2.2} /></span>
        <span>
          <strong>{tm('letop')}</strong> {tm('maten_letop_kort')}
        </span>
      </div>

      <div>
        <h3 className={`font-headline font-bold text-[12px] tracking-[0.05em] uppercase mb-2 ${c.mute}`}>
          {t('kettingen_kop', { maat: g.label })}
        </h3>
        {g.kettingen.length ? (
          <ul className={`border rounded-[10px] divide-y ${c.box} ${c.div}`}>
            {g.kettingen.map((k) => (
              <PartRow key={k.id + '-' + g.key} k={k} locale={locale} manualUrl={manualUrl} c={c} opts={options[k.id] || {}} />
            ))}
          </ul>
        ) : (
          <p className={`text-[13px] ${c.sub}`}>{t('geen_ketting')}</p>
        )}
      </div>

      <div>
        <h3 className={`font-headline font-bold text-[12px] tracking-[0.05em] uppercase mb-2 ${c.mute}`}>
          {t('zwaarden_kop', { maat: g.label })}
        </h3>
        {g.zwaarden.length ? (
          <ul className={`border rounded-[10px] divide-y ${c.box} ${c.div}`}>
            {g.zwaarden.map((k) => (
              <PartRow key={k.id} k={k} locale={locale} manualUrl={manualUrl} c={c} opts={options[k.id] || {}} />
            ))}
          </ul>
        ) : (
          <p className={`text-[13px] ${c.sub}`}>{t('geen_zwaard')}</p>
        )}
      </div>
    </div>
  )
}
