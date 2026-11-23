'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'
import { PartRow, palette } from '@/components/PartChoices'
import { groupBarChain, partNumber, soortVan } from '@/lib/machine'

// Zwaard en ketting in één blok (besluiten 19 en 23 nov, Norbert).
// Eén model kan zwaarden van meerdere lengtes hebben, ook af fabriek. Daarom eerst de lengte
// (en de groefbreedte als die bij dezelfde lengte verschilt). Pas daarna de ketting: per lengte is er
// hooguit één standaardset, dus "zat dit zwaard er al op?" geeft dan één antwoord.
export default function BarChainBlock({ items, locale, manualUrl, options = {}, light = false }) {
  const t = useTranslations('zk')
  const tm = useTranslations('machine')
  const c = palette(light)
  const groups = groupBarChain(items)
  const lengtes = [...new Set(groups.map((g) => g.lengte))]
  // Besluit 23 nov (Norbert): komt het model af fabriek met één zwaardlengte, dan eerst die standaardset
  // ("nooit vervangen?") en daarna de vraag voor een ander zwaard. Meerdere standaardlengtes of geen
  // standaard: alleen de vraag "voor welke maat zwaard zoek je een ketting?".
  const stdLengtes = [...new Set(groups.filter((x) => x.standaard).map((x) => x.lengte))]
  const eenStandaard = stdLengtes.length === 1 ? stdLengtes[0] : null
  const [lengte, setLengte] = useState(lengtes.length === 1 ? lengtes[0] : eenStandaard)
  const opLengte = groups.filter((g) => g.lengte === lengte)
  // Bij de standaardlengte staat de standaardvariant (steek, groefbreedte) voorgekozen.
  const stdIndex = Math.max(0, groups.filter((x) => x.lengte === eenStandaard).findIndex((x) => x.standaard))
  const [variant, setVariant] = useState(lengte === eenStandaard ? stdIndex : 0)
  const g = opLengte.length === 1 ? opLengte[0] : opLengte.length > 1 ? opLengte[Math.min(variant, opLengte.length - 1)] : null
  const kiesVariant = opLengte.length > 1

  const naam = (k) => {
    const sv = soortVan(k.onderdeel)
    return sv ? sv.merknaam : k.onderdeel.naam.replace(/^(zwaard|zaagketting) /, '')
  }
  const nummer = (k) => partNumber(k.onderdeel)?.value
  const chip = (on) => `border rounded-[9px] px-3 py-[7px] text-[13px] font-semibold transition ${on ? c.chipOn : c.chip}`
  const variantLabel = (x) => [x.steek, x.dikte ? x.dikte + ' mm' : ''].filter(Boolean).join(' · ')

  const stdGroep = eenStandaard !== null ? groups.find((x) => x.standaard && x.lengte === eenStandaard) : null
  const stdKetting = stdGroep ? stdGroep.kettingen.find((k) => k.standaard === true) : null
  const stdZwaard = stdGroep ? stdGroep.zwaarden.find((k) => k.standaard === true) : null

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex items-start gap-[8px] text-[13.5px] border px-3 py-[10px] rounded-[9px] leading-snug ${c.warn}`}>
        <span className="flex-none mt-[1px]"><Icon name="warning" className="w-4 h-4" strokeWidth={2.2} /></span>
        <span>
          <strong>{tm('letop')}</strong> {tm('maten_letop_kort')}
        </span>
      </div>

      {stdKetting && (
        <div className={`border rounded-[10px] px-3 py-3 text-[13.5px] leading-snug ${c.box}`}>
          <p className={`font-semibold mb-1 ${c.main}`}>{t('standaard_vraag', { maat: stdGroep.lengte + ' cm' })}</p>
          <p className={c.sub}>
            {t('ketting')} <span className={`font-semibold ${c.main}`}>{naam(stdKetting)}</span>
            {nummer(stdKetting) && <> ({nummer(stdKetting)})</>}
            {stdZwaard && (
              <>
                {' · '}
                {t('zwaard')} {naam(stdZwaard)}
                {nummer(stdZwaard) && <> ({nummer(stdZwaard)})</>}
              </>
            )}
          </p>
        </div>
      )}

      {lengtes.length > 1 && (
        <div>
          <p className={`font-semibold text-[14px] mb-1 ${c.main}`}>{stdKetting ? t('lengte_vraag_ander') : t('lengte_vraag')}</p>
          <p className={`text-[12.5px] mb-2 ${c.mute}`}>{t('waar_staat')}</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={tm('maat_kiezen')}>
            {lengtes.map((l) => (
              <button key={l} type="button" role="radio" aria-checked={l === lengte} onClick={() => { setLengte(l); setVariant(l === eenStandaard ? stdIndex : 0) }} className={chip(l === lengte)}>
                {l ? l + ' cm' : '?'}
              </button>
            ))}
          </div>
        </div>
      )}

      {kiesVariant && (
        <div>
          <p className={`font-semibold text-[14px] mb-2 ${c.main}`}>{t('variant_vraag')}</p>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {opLengte.map((x, i) => (
              <button key={x.key} type="button" role="radio" aria-checked={i === variant} onClick={() => setVariant(i)} className={chip(i === variant)}>
                {variantLabel(x)}
              </button>
            ))}
          </div>
        </div>
      )}

      {!g && <p className={`text-[13px] ${c.sub}`}>{t('kies_eerst')}</p>}

      {g && (
        <>
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
        </>
      )}
    </div>
  )
}
