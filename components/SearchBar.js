'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

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

  function handleClear() {
    setQuery('')
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 bg-white border border-outline-variant rounded-lg font-medium text-primary focus:ring-2 focus:ring-secondary-container"
          placeholder={t('search_placeholder')}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-surface-container-lowest border-none py-4 px-6 rounded-lg text-primary focus:ring-2 focus:ring-secondary-container transition-all font-body"
        placeholder={t('search_placeholder')}
      />
      <button
        type="submit"
        className="absolute right-2 bg-cta text-white px-6 py-2 rounded-md font-headline font-bold tracking-wider hover:bg-secondary transition-colors"
      >
        {t('search_button')}
      </button>
    </form>
  )
}
