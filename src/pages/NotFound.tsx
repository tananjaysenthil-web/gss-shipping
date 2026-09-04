import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { Reveal } from '../components/motion/Reveal'

export function NotFound() {
  useDocumentMeta({
    title: 'Page Not Found',
    description: 'The page you were looking for could not be found.',
    path: '/404',
    noindex: true,
  })

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto flex max-w-2xl flex-col items-start px-4 py-24 sm:px-6">
        <Reveal>
          <p className="data-label-muted">404</p>
          <h1 className="mt-1 text-3xl text-ink sm:text-4xl">Page not found</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            The page you're looking for doesn't exist, or the link may be out of date.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="press rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach"
            >
              Back to home
            </Link>
            <Link
              to="/contact"
              className="press rounded-md border border-ink/30 px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              Contact us
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
