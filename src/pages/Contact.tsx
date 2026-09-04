import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { office } from '../content/gss'
import { ContactForm } from '../components/ContactForm'
import { Reveal } from '../components/motion/Reveal'
import { MapPinIcon } from '../components/icons'

export function Contact() {
  useSceneVisibility()
  useDocumentMeta({
    title: 'Contact',
    description: 'Reach Global Sea Service for a Port Captain, survey/inspection, or logistics enquiry in Chennai, Tamil Nadu, India.',
    path: '/contact',
  })

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <h1 className="text-3xl text-ink sm:text-4xl">Reach us</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Send your Port Captain, survey/inspection or logistics enquiry and we'll respond with next steps.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-6 w-6 text-coral" aria-hidden="true" />
            <h2 className="text-lg text-ink">{office.name}</h2>
          </div>
          <address className="mt-3 space-y-1 not-italic text-sm leading-relaxed text-ink/80">
            {office.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <dl className="mt-5 space-y-2 font-mono text-sm">
            <div>
              <dt className="inline text-muted">Tel: </dt>
              <dd className="inline">
                <a className="press inline-block hover:text-ink hover:underline" href={`tel:${office.tel.replace(/\s+/g, '')}`}>
                  {office.tel}
                </a>
              </dd>
            </div>
            <div>
              <dt className="inline text-muted">Mobile: </dt>
              <dd className="inline">
                <a
                  className="press inline-block hover:text-ink hover:underline"
                  href={`tel:${office.mobile.replace(/\s+/g, '')}`}
                >
                  {office.mobile}
                </a>
              </dd>
            </div>
            <div>
              <dt className="inline text-muted">Email: </dt>
              <dd className="inline">
                <a className="press inline-block hover:text-ink hover:underline" href={`mailto:${office.email}`}>
                  {office.email}
                </a>
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </div>
  )
}
