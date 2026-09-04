import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { company, services } from '../content/gss'
import { serviceIcons } from '../content/serviceIcons'
import { CredibilityStrip } from '../components/CredibilityStrip'
import { EnquiryCTA } from '../components/EnquiryCTA'
import { VesselParticulars } from '../components/VesselParticulars'
import { DimensionDivider } from '../components/DimensionDivider'
import { Reveal } from '../components/motion/Reveal'
import { RevealGroup } from '../components/motion/RevealGroup'
import { gsap, prefersReducedMotion } from '../lib/motion'

function ManifestRow({ id, title, summary }: { id: string; summary: string; title: string }) {
  const Icon = serviceIcons[id]
  return (
    <Link
      to={`/services#${id}`}
      className="group flex items-center gap-4 border-b border-border py-5 transition-colors last:border-0 hover:bg-peach2/40 sm:gap-6"
    >
      {Icon ? <Icon className="h-7 w-7 flex-shrink-0 text-coral" aria-hidden="true" /> : null}
      <div className="min-w-0 flex-1">
        <h3 className="text-lg text-ink">{title}</h3>
        <p className="mt-1 truncate text-sm text-muted sm:overflow-visible sm:whitespace-normal sm:text-clip">
          {summary}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="flex-shrink-0 font-mono text-lg text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink"
      >
        →
      </span>
    </Link>
  )
}

export function Home() {
  useSceneVisibility()
  useDocumentMeta({
    title: 'Global Sea Service',
    description:
      "Port Captain, Survey & Inspection, and Logistics services for project cargo and heavy-lift shipping across Asia-Pacific, the Middle East, and North & East Africa. Established 2003.",
    path: '/',
  })
  const heroRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !heroRef.current) return
      gsap.from(heroRef.current.querySelectorAll('[data-hero-item]'), {
        opacity: 0,
        y: 22,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.15,
      })
    },
    { scope: heroRef },
  )

  return (
    <>
      <section className="viewer-slot flex min-h-[78vh] flex-col justify-end px-4 pb-12 sm:px-6">
        <div ref={heroRef} className="glass glass-heavy glass-sweep mx-auto w-full max-w-6xl rounded-2xl p-6 sm:p-10">
          <h1 data-hero-item className="max-w-2xl text-3xl text-ink sm:text-5xl">
            <span className="inline bg-coral px-1.5 text-ink">Lifting cargo</span> with spirit
          </h1>
          <p data-hero-item className="mt-4 max-w-2xl text-base leading-relaxed text-ink/85 sm:text-lg">
            {company.positioning}
          </p>
          <div data-hero-item className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="press rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach"
            >
              Send an enquiry
            </Link>
            <Link
              to="/fleet"
              className="press rounded-md border border-ink/30 px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              View the vessel
            </Link>
          </div>
        </div>
      </section>

      <section className="page-surface page-surface--opaque flex-1">
        <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <Reveal>
            <CredibilityStrip />
          </Reveal>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <DimensionDivider className="mb-8" />
          <h2 className="text-2xl text-ink sm:text-3xl">Service summary</h2>
          <RevealGroup as="div" each={0.08} className="mt-4">
            {services.map((s) => (
              <ManifestRow key={s.id} id={s.id} title={s.title} summary={s.summary} />
            ))}
          </RevealGroup>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
          <Reveal>
            <VesselParticulars compact caption="Representative project-carrier: vessel particulars" />
          </Reveal>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <Reveal>
            <EnquiryCTA />
          </Reveal>
        </div>
      </section>
    </>
  )
}
