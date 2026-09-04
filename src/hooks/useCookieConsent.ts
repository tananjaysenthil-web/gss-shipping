import { useCallback, useEffect, useState } from 'react'

export type ConsentChoice = 'all' | 'necessary'

const STORAGE_KEY = 'gss-cookie-consent'

function readStoredConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'all' || value === 'necessary' ? value : null
  } catch {
    // Private browsing / storage blocked — treat as undecided every visit
    // rather than crashing.
    return null
  }
}

/** Whether non-essential cookies (e.g. future analytics) are allowed.
 * Strictly-necessary cookies (the auth session) are never gated by this —
 * they're required for the site's core function and exempt under
 * GDPR/ePrivacy's "strictly necessary" carve-out. */
export function hasAnalyticsConsent(): boolean {
  return readStoredConsent() === 'all'
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentChoice | null>(() => readStoredConsent())

  useEffect(() => {
    if (consent === null) return
    try {
      window.localStorage.setItem(STORAGE_KEY, consent)
    } catch {
      // Ignore — the banner will just reappear next visit, which is safe.
    }
  }, [consent])

  const acceptAll = useCallback(() => setConsent('all'), [])
  const acceptNecessaryOnly = useCallback(() => setConsent('necessary'), [])

  return { consent, acceptAll, acceptNecessaryOnly }
}
