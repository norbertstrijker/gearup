// Geen kapotte of placeholder-links tonen (fase-1, punt A).
// Een link/knop verschijnt alleen als er een geldige bestemming is.

const PLACEHOLDER_HOSTS = ['example.com', 'example.org', 'placeholder']

export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false
  const u = url.trim()
  if (!/^https?:\/\//i.test(u)) return false
  const lower = u.toLowerCase()
  if (PLACEHOLDER_HOSTS.some((h) => lower.includes(h))) return false
  return true
}
