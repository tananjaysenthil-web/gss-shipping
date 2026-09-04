import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { office } from '../content/gss'
import { Reveal } from '../components/motion/Reveal'

export function ThankYou() {
  useSceneVisibility()
  useDocumentMeta({
    title: 'Thank You',
    description: 'Your enquiry has been received.',
    path: '/thank-you',
    noindex: true,
  })

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto flex max-w-2xl flex-col items-start px-4 py-24 sm:px-6">
        <Reveal>
          <p className="data-label-muted">Enquiry received</p>
          <h1 className="mt-1 text-3xl text-ink sm:text-4xl">Thank you</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            We've received your enquiry and will respond with next steps. For anything urgent, call{' '}
            <a className="text-ink underline hover:text-coral" href={`tel:${office.tel.replace(/\s+/g, '')}`}>
              {office.tel}
            </a>{' '}
            directly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="press rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach"
            >
              Back to home
            </Link>
            <Link
              to="/fleet"
              className="press rounded-md border border-ink/30 px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              View the vessel
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
