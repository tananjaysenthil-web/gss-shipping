import { flushSync } from 'react-dom'
import { prefersReducedMotion } from './motion'

type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void) => void
}

/** Wraps a route change in the native View Transitions API when available,
 * falling back to a plain call (the `.route-fade` CSS animation still runs). */
export function navigateWithTransition(go: () => void) {
  const doc = document as DocumentWithViewTransitions
  if (!doc.startViewTransition || prefersReducedMotion()) {
    go()
    return
  }
  doc.startViewTransition(() => {
    flushSync(go)
  })
}
