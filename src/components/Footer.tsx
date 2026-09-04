import { Link } from 'react-router-dom'
import { company, office } from '../content/gss'

const mapsQuery = encodeURIComponent(`${office.name}, ${office.addressLines.join(', ')}`)
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

export function Footer() {
  return (
    <footer className="pointer-events-auto bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg tracking-wide2">{company.shortName}</p>
          <p className="mt-1 max-w-xs text-sm text-peach2">{company.tagline}</p>
        </div>
        <div>
          <p className="data-label mb-2 text-peach2">Registered Office</p>
          <address className="not-italic text-sm leading-relaxed text-peach2">
            {office.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <a
            className="press mt-2 inline-block font-mono text-xs uppercase tracking-wide2 text-peach2 underline hover:text-coral"
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions
          </a>
        </div>
        <div>
          <p className="data-label mb-2 text-peach2">Contact</p>
          <ul className="space-y-1 text-sm text-peach2">
            <li>
              Tel:{' '}
              <a className="press inline-block hover:text-coral" href={`tel:${office.tel.replace(/\s+/g, '')}`}>
                {office.tel}
              </a>
            </li>
            <li>
              Mobile:{' '}
              <a className="press inline-block hover:text-coral" href={`tel:${office.mobile.replace(/\s+/g, '')}`}>
                {office.mobile}
              </a>
            </li>
            <li>
              Email:{' '}
              <a className="press inline-block hover:text-coral" href={`mailto:${office.email}`}>
                {office.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 border-t border-cream/10 px-4 py-4 text-center font-mono text-xs uppercase tracking-wide2 text-peach2/70 sm:flex-row sm:justify-between sm:px-6">
        <span>
          &copy; {new Date().getFullYear()} {company.name}
        </span>
        <span className="flex gap-4">
          <Link className="press hover:text-coral" to="/privacy">
            Privacy
          </Link>
          <Link className="press hover:text-coral" to="/terms">
            Terms
          </Link>
        </span>
      </div>
    </footer>
  )
}
