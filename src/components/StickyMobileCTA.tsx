import { useLocation, useNavigate } from 'react-router-dom'
import { navigateWithTransition } from '../lib/viewTransition'

// Only on the marketing pages — an "enquire" prompt is redundant on the
// contact page itself, and irrelevant on auth/utility/legal pages.
export const STICKY_CTA_ROUTES = ['/', '/services', '/fleet', '/about']

export function useShowStickyCTA(): boolean {
  const { pathname } = useLocation()
  return STICKY_CTA_ROUTES.includes(pathname)
}

export function StickyMobileCTA() {
  const navigate = useNavigate()
  if (!useShowStickyCTA()) return null

  return (
    <div
      className="glass pointer-events-auto fixed inset-x-0 bottom-0 z-30 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden"
      role="complementary"
      aria-label="Enquiry shortcut"
    >
      <button
        type="button"
        onClick={() => navigateWithTransition(() => navigate('/contact'))}
        className="press block w-full rounded-md bg-coral py-3 text-center font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach"
      >
        Send an enquiry
      </button>
    </div>
  )
}
