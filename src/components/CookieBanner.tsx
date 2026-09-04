import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { useCookieConsent } from '../hooks/useCookieConsent'
import { useShowStickyCTA } from './StickyMobileCTA'
import { gsap, prefersReducedMotion } from '../lib/motion'

export function CookieBanner() {
  const { consent, acceptAll, acceptNecessaryOnly } = useCookieConsent()
  const ref = useRef<HTMLDivElement>(null)
  // Sit above the sticky mobile enquiry bar on the pages that show one,
  // instead of overlapping it.
  const stickyCtaShowing = useShowStickyCTA()

  useGSAP(() => {
    if (!ref.current || consent !== null) return
    if (prefersReducedMotion()) {
      gsap.set(ref.current, { y: 0, opacity: 1 })
      return
    }
    gsap.from(ref.current, { y: 40, opacity: 0, duration: 0.5, delay: 0.4, ease: 'power2.out' })
  }, [consent])

  if (consent !== null) return null

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Cookie notice"
      className={`glass pointer-events-auto fixed inset-x-4 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-lg p-5 sm:flex-row sm:items-center sm:justify-between sm:bottom-4 ${
        stickyCtaShowing ? 'bottom-[92px]' : 'bottom-4'
      }`}
    >
      <p className="text-sm text-ink">
        We use a strictly-necessary cookie to keep you signed in. No analytics or advertising cookies are
        active. If that changes, it'll only run if you accept. See our{' '}
        <Link to="/privacy" className="underline hover:text-coral">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="flex flex-shrink-0 gap-2">
        <button
          type="button"
          onClick={acceptNecessaryOnly}
          className="press rounded-md border border-ink/30 px-4 py-2 font-mono text-xs uppercase tracking-wide2 text-ink transition-colors hover:bg-peach2/50"
        >
          Necessary only
        </button>
        <button
          type="button"
          onClick={acceptAll}
          className="press rounded-md bg-coral px-4 py-2 font-mono text-xs uppercase tracking-wide2 text-ink transition-colors hover:bg-peach"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
