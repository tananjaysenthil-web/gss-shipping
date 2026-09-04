import { Link } from 'react-router-dom'

export function EnquiryCTA({ heading = 'Discuss an operation' }: { heading?: string }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg bg-ink px-6 py-8 text-cream sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-heading text-xl tracking-wide2">{heading}</p>
        <p className="mt-1 max-w-md text-sm text-peach2">
          Send us your cargo and port details for a Port Captain, survey or logistics enquiry.
        </p>
      </div>
      <Link
        to="/contact"
        className="press inline-block whitespace-nowrap rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach"
      >
        Send an enquiry
      </Link>
    </div>
  )
}
