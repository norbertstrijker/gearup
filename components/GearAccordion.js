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
    <div className={`bg-ink-2 rounded-card mb-[10px] overflow-hidden border transition-colors ${open ? 'border-signal' : 'border-steel'}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-[15px] px-4 py-[15px] text-left group"
        aria-expanded={open}
      >
        <span className="w-[50px] h-[50px] flex-none rounded-[10px] bg-ink border border-steel flex items-center justify-center text-signal">
          <Icon name={iconName} className="w-6 h-6" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-headline font-bold text-[11px] tracking-[0.09em] uppercase text-mut mb-[3px]">
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
        <div className="border-t border-steel px-4 py-4 bg-[#191c22]">
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
