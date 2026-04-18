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
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: '#77767D' }}
        >
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 rounded-lg font-medium"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #C7C5CD',
            color: '#16182C',
          }}
          placeholder={t('search_placeholder')}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            style={{ color: '#77767D' }}
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
        className="w-full border-none py-4 px-6 rounded-lg transition-all"
        style={{
          backgroundColor: '#FFFFFF',
          color: '#16182C',
          fontFamily: "'Inter', sans-serif",
        }}
        placeholder={t('search_placeholder')}
      />
      <button
        type="submit"
        className="absolute right-2 px-6 py-2 rounded-md font-bold tracking-wider transition-colors"
        style={{
          backgroundColor: '#E8620A',
          color: '#FFFFFF',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {t('search_button')}
      </button>
    </form>
  )
}
