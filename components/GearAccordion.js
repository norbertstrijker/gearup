'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Icon, { hasIcon } from '@/components/Icons'
import OptionCard from '@/components/OptionCard'

const TIERS = ['basis', 'beter', 'best']

function AccordionItem({ item }) {
  const [open, setOpen] = useState(false)
  const t = useTranslations()
  const tp = useTranslations('producttypes')
  const iconName = hasIcon(item.producttype) ? item.producttype : 'search'

  return (
    <div
      className={`rounded-card mb-[10px] overflow-hidden border transition-colors ${
        open ? 'border-signal bg-anthracite' : 'border-steel-2 bg-[#272b34] hover:border-mut-d'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-[15px] px-4 py-[15px] text-left group"
        aria-expanded={open}
      >
        <span className="w-[50px] h-[50px] flex-none rounded-[10px] bg-ink border border-steel-2 flex items-center justify-center text-signal">
          <Icon name={iconName} className="w-6 h-6" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-headline font-bold text-[11px] tracking-[0.09em] uppercase text-signal mb-[3px]">
            {tp(item.producttype)}
          </span>
          <span className="block text-[15px] font-semibold text-paper leading-tight group-hover:text-signal transition-colors">
            {item.titel || item.fallbackName}
          </span>
          {item.from && <span className="block text-[12.5px] text-mut mt-[2px]">{item.from}</span>}
        </span>
        <span className={`flex-none text-mut transition-transform ${open ? 'rotate-180 text-signal' : ''}`}>
          <Icon name="chevronDown" className="w-5 h-5" strokeWidth={2.2} />
        </span>
      </button>

      {open && (
        <div className="border-t border-steel-2 px-4 py-4 bg-[#1d2026]">
          {/* keuze-advies */}
          {item.keuze && <p className="text-[14px] leading-relaxed text-mut mb-4">{item.keuze}</p>}

          {/* feitelijke specs (brandstof) */}
          {item.specCells && (
            <div className="flex flex-wrap border border-steel-2 rounded-[10px] overflow-hidden bg-ink mb-4">
              {item.specCells.map((c, i) => (
                <div key={i} className="flex-1 min-w-[110px] px-3 py-[10px] border-r border-steel-2 last:border-r-0">
                  <div className="text-[10px] tracking-[0.05em] uppercase text-mut-d font-semibold mb-[2px]">{c.l}</div>
                  <div className={`font-headline font-bold text-[14px] ${c.go ? 'text-ok' : 'text-paper'}`}>{c.v}</div>
                </div>
              ))}
            </div>
          )}

          {/* plaatsings-advies */}
          {item.plaatsing && (
            <div className="bg-ink border border-steel-2 rounded-[10px] px-3 py-[11px] mb-4">
              <div className="font-headline font-bold text-[10px] tracking-[0.06em] uppercase text-mut mb-[5px]">
                {t('result.placement_title')}
              </div>
              <p className="text-[13px] leading-relaxed text-mut">{item.plaatsing}</p>
              {item.manualNote && <p className="text-[12px] text-mut-d mt-2 italic">{item.manualNote}</p>}
            </div>
          )}

          {/* waarschuwing */}
          {item.waarschuwing && (
            <div className="flex items-start gap-[8px] text-[13px] text-[#f0b692] bg-[#2a1c12] border border-[#5a3a23] px-3 py-[10px] rounded-[9px] leading-snug mb-4">
              <span className="flex-none mt-[1px]"><Icon name="warning" className="w-4 h-4" strokeWidth={2.2} /></span>
              <span>{item.waarschuwing}</span>
            </div>
          )}

          <div className="font-headline font-bold text-[11px] tracking-wide uppercase text-mut mb-[11px]">
            {t('result.options_label')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[9px]">
            {TIERS.map((tier) => (
              <OptionCard key={tier} product={item.optionsByTier[tier]} tier={tier} mini />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function GearAccordion({ items }) {
  return (
    <div>
      {items.map((item) => (
        <AccordionItem key={item.producttype} item={item} />
      ))}
    </div>
  )
}
