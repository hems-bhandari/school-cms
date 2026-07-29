export function getSafeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) return null

  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function getSafeHref(value: string | null | undefined): string | null {
  if (!value) return null
  if (/^\/(?!\/)/.test(value)) return value
  return getSafeHttpsUrl(value)
}

export function openExternalUrl(value: string | null | undefined): boolean {
  const url = getSafeHttpsUrl(value)
  if (!url) return false

  const openedWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (openedWindow) openedWindow.opener = null
  return true
}
