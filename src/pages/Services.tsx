import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { Link } from 'react-router-dom'
import { company, services } from '../content/gss'
import { ServiceSection } from '../components/ServiceSection'
import { EnquiryCTA } from '../components/EnquiryCTA'
import { Reveal } from '../components/motion/Reveal'

export function Services() {
  useSceneVisibility()
  useDocumentMeta({
    title: 'Services',
    description:
      'Port Captain Services, Survey & Inspection, and Logistics: the three core services Global Sea Service provides for project cargo and heavy-lift port operations.',
    path: '/services',
  })

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Reveal>
          <h1 className="text-3xl text-ink sm:text-4xl">Project cargo, port to port</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/80">{company.positioning}</p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/80">{company.network}</p>
          <Link
            to="/contact"
            className="press mt-5 inline-block rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach"
          >
            Send an enquiry
          </Link>
        </Reveal>

        <div className="mt-10">
          {services.map((section, index) => (
            <ServiceSection key={section.id} section={section} index={index} />
          ))}
        </div>

        <Reveal className="mt-14">
          <EnquiryCTA heading="Have a cargo or port operation to plan?" />
        </Reveal>
      </div>
    </div>
  )
}
