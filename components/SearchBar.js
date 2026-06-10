'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icons'

export default function SearchBar({ defaultValue = '', variant = 'hero' }) {
  const [query, setQuery] = useState(defaultValue)
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('hero')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/api/zoek?q=${encodeURIComponent(trimmed)}&locale=${locale}`)
  }

  if (variant === 'compact') {
    return (
      <form
        onSubmit={handleSubmit}
        className="bg-paper rounded-[12px] border border-line-on-light p-[6px] flex items-stretch gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-0 bg-transparent outline-none px-3 text-[15px] font-medium text-ink placeholder:text-[#a8a399] placeholder:font-normal"
          placeholder={t('search_placeholder')}
          aria-label={t('search_placeholder')}
        />
        <button
          type="submit"
          className="flex-none w-[46px] bg-signal text-white rounded-[9px] flex items-center justify-center hover:brightness-110 transition"
          aria-label={t('search_button')}
        >
          <Icon name="search" className="w-5 h-5" strokeWidth={2.4} />
        </button>
      </form>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper rounded-[16px] border border-line-on-light p-2 flex items-stretch gap-2 max-w-[640px] mx-auto shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]"
    >
      <div className="flex-1 min-w-0 flex flex-col justify-center px-[14px] py-1 text-left">
        <label htmlFor="gearup-search" className="text-[10.5px] tracking-[0.06em] uppercase text-mut-d font-semibold">
          {t('search_label')}
        </label>
        <input
          id="gearup-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent outline-none text-[15.5px] font-medium text-ink w-full placeholder:text-[#a8a399] placeholder:font-normal"
          placeholder={t('search_placeholder')}
        />
      </div>
      <button
        type="submit"
        className="flex-none w-[54px] bg-signal text-white rounded-[11px] flex items-center justify-center hover:brightness-110 transition"
        aria-label={t('search_button')}
      >
        <Icon name="search" className="w-[22px] h-[22px]" strokeWidth={2.4} />
      </button>
    </form>
  )
}
