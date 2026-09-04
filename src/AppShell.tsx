import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { StickyMobileCTA, useShowStickyCTA } from './components/StickyMobileCTA'
import { AppRoutes } from './AppRoutes'

/** Split out from App so it can sit inside BrowserRouter and read the route
 * — needed to only reserve bottom padding for the sticky CTA on the pages
 * that actually show it, instead of padding every page unconditionally. */
export function AppShell() {
  const showStickyCta = useShowStickyCTA()

  return (
    <>
      <div
        className={`relative z-[1] flex min-h-screen flex-col pointer-events-none ${showStickyCta ? 'pb-[76px] sm:pb-0' : ''}`}
      >
        <Nav />
        <main id="main-content" className="flex flex-1 flex-col">
          <AppRoutes />
        </main>
        <Footer />
      </div>
      <StickyMobileCTA />
    </>
  )
}
