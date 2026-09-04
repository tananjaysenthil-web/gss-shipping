import { Link } from 'react-router-dom'
import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { company, completedProjects, certifications, team } from '../content/gss'
import { DimensionDivider } from '../components/DimensionDivider'
import { EnquiryCTA } from '../components/EnquiryCTA'
import { Reveal } from '../components/motion/Reveal'
import { RevealGroup } from '../components/motion/RevealGroup'
import { CompassIcon, HelmWheelIcon, ClipboardCheckIcon } from '../components/icons'

export function About() {
  useSceneVisibility()
  useDocumentMeta({
    title: 'About',
    description:
      'Established in 2003, Global Sea Service provides Port Captain, Survey & Inspection, and Logistics services across Asia-Pacific, the Middle East, and North & East Africa.',
    path: '/about',
  })

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Reveal>
          <h1 className="text-3xl text-ink sm:text-4xl">{company.name}</h1>
          <p className="mt-4 text-base leading-relaxed text-ink/80">{company.positioning}</p>
          <p className="mt-3 text-base leading-relaxed text-ink/80">{company.aboutLong}</p>
          <p className="mt-3 text-base leading-relaxed text-ink/80">{company.network}</p>
          <Link
            to="/contact"
            className="press mt-5 inline-block rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach"
          >
            Send an enquiry
          </Link>
        </Reveal>

        <section className="mt-12 pt-8">
          <DimensionDivider className="mb-8" />
          <div className="flex items-center gap-3">
            <CompassIcon className="h-6 w-6 text-coral" aria-hidden="true" />
            <h2 className="text-2xl text-ink">Operating regions</h2>
          </div>
          <RevealGroup as="ul" each={0.06} className="mt-4 flex flex-wrap gap-2">
            {company.regions.map((r) => (
              <li
                key={r}
                className="press rounded-full border border-ink/25 px-4 py-1.5 font-mono text-xs uppercase tracking-wide2 text-ink transition-colors hover:border-coral hover:bg-peach2/50"
              >
                {r}
              </li>
            ))}
          </RevealGroup>
          <p className="mt-4 text-sm text-muted">
            Time zones referenced on GSS's network listing: {company.networkCities.join(', ')}.
          </p>
        </section>

        <Reveal as="section" className="mt-12 pt-8">
          <DimensionDivider className="mb-8" />
          <div className="flex items-center gap-3">
            <HelmWheelIcon className="h-6 w-6 text-coral" aria-hidden="true" />
            <h2 className="text-2xl text-ink">Team</h2>
          </div>
          {team.length === 0 ? (
            <p className="mt-4 text-base leading-relaxed text-ink/80">
              GSS operations are run by a skilled team of Master Mariners providing Port Captain, Survey &
              Inspection services.{' '}
              <span className="rounded bg-yellow px-1 text-ink">
                TODO: add named team members, roles and photos. Not published on the source site.
              </span>
            </p>
          ) : null}
        </Reveal>

        <Reveal as="section" className="mt-12 pt-8">
          <DimensionDivider className="mb-8" />
          <div className="flex items-center gap-3">
            <ClipboardCheckIcon className="h-6 w-6 text-coral" aria-hidden="true" />
            <h2 className="text-2xl text-ink">Certifications & memberships</h2>
          </div>
          {certifications.length === 0 ? (
            <p className="mt-4 rounded-md border border-border bg-yellow/60 px-4 py-3 text-sm text-ink">
              TODO: no certifications or memberships are published on the source site. Request from GSS
              before publishing any claim here.
            </p>
          ) : null}
        </Reveal>

        <Reveal as="section" className="mt-12 pt-8">
          <DimensionDivider className="mb-8" />
          <h2 className="text-2xl text-ink">Recent operations</h2>
          <p className="mt-2 text-sm text-muted">As recorded on the previous GSS site.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="particulars-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Country</th>
                  <th scope="col">Operation</th>
                  <th scope="col">Port</th>
                </tr>
              </thead>
              <tbody>
                {completedProjects.map((p) => (
                  <tr key={`${p.date}-${p.port}`} className="transition-colors hover:bg-peach2/40">
                    <td>{p.date}</td>
                    <td>{p.country}</td>
                    <td>{p.operation}</td>
                    <td>{p.port}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <EnquiryCTA heading="Have a cargo or port operation to plan?" />
        </Reveal>
      </div>
    </div>
  )
}
