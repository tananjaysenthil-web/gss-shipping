import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { office } from '../content/gss'
import { Reveal } from '../components/motion/Reveal'
import { DimensionDivider } from '../components/DimensionDivider'

export function Terms() {
  useDocumentMeta({
    title: 'Terms of Service',
    description: 'Terms of service for the Global Sea Service website and client portal.',
    path: '/terms',
  })

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Reveal>
          <h1 className="text-3xl text-ink sm:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted">Last updated: draft, not yet published</p>
          <p className="mt-4 rounded-md border border-border bg-yellow/60 px-4 py-3 text-sm text-ink">
            TODO: legal review required before this page is treated as binding. Liability limits, governing
            law, and dispute resolution below are marked explicitly and need GSS's counsel to confirm.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">Acceptance</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            By using this website or the client portal, you agree to these terms. If you don't agree, please
            don't use the site; you can still reach us directly at{' '}
            <a className="text-ink underline hover:text-coral" href={`mailto:${office.email}`}>
              {office.email}
            </a>
            .
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">The services</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            Global Sea Service provides Port Captain services, survey and inspection services, and logistics
            services for project cargo and heavy-lift operations, as described on the{' '}
            <a className="text-ink underline hover:text-coral" href="/services">
              Services
            </a>{' '}
            page. Actual scope, pricing, and terms for any specific operation are agreed separately with your
            Port Captain contact. Nothing on this website constitutes a quote or binding offer.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">The 3D vessel model</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            The interactive model on the{' '}
            <a className="text-ink underline hover:text-coral" href="/fleet">
              Fleet
            </a>{' '}
            page illustrates a representative project-carrier class of vessel and is provided for illustration
            only. It is not a representation that GSS owns, charters, or will assign this specific hull to
            your cargo.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">Your account</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            If you create a client portal account, you're responsible for keeping your login credentials
            confidential and for the accuracy of the company details you provide at signup.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">Liability</h2>
          <p className="mt-3 rounded-md border border-border bg-yellow/60 px-4 py-3 text-sm text-ink">
            TODO: GSS's counsel to confirm the specific liability limitations, indemnities, and insurance
            terms that apply. These are standard and material in the marine/heavy-lift industry and shouldn't
            be drafted generically.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">Governing law</h2>
          <p className="mt-3 rounded-md border border-border bg-yellow/60 px-4 py-3 text-sm text-ink">
            TODO: confirm governing law and jurisdiction (GSS's registered office is in Tamil Nadu, India, but
            operations span Asia-Pacific, the Middle East, and North & East Africa; confirm before publishing
            a specific claim here).
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">Changes to these terms</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            If these terms change, we'll update the date at the top of this page.
          </p>
        </Reveal>
      </div>
    </div>
  )
}
