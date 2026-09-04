import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { office } from '../content/gss'
import { Reveal } from '../components/motion/Reveal'
import { DimensionDivider } from '../components/DimensionDivider'

export function Privacy() {
  useDocumentMeta({
    title: 'Privacy Policy',
    description: 'How Global Sea Service collects, uses, and protects your data.',
    path: '/privacy',
  })

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Reveal>
          <h1 className="text-3xl text-ink sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted">Last updated: draft, not yet published</p>
          <p className="mt-4 rounded-md border border-border bg-yellow/60 px-4 py-3 text-sm text-ink">
            TODO: legal review required. This is a draft written from the site's actual technical behaviour
            (what data the contact form, signup, and cookies actually collect), not a substitute for a lawyer.
            Confirm data-retention periods, third-party processor names, and the governing law/jurisdiction
            below before this page is treated as binding.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">Who we are</h2>
          <address className="mt-3 space-y-1 not-italic text-sm leading-relaxed text-ink/80">
            <span className="block">{office.name}</span>
            {office.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block">
              Email:{' '}
              <a className="text-ink underline hover:text-coral" href={`mailto:${office.email}`}>
                {office.email}
              </a>
            </span>
          </address>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">What we collect</h2>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ink/80">
            <li>
              <strong className="text-ink">Contact form:</strong> name, email, phone, company, port/cargo
              details, and your message. Currently sent to a placeholder endpoint pending a real destination;
              see the TODO in <code className="font-mono text-xs">src/components/ContactForm.tsx</code>.
            </li>
            <li>
              <strong className="text-ink">Client portal account:</strong> your email, a hashed password (we
              never store your password itself), your company name, and the shipment records associated with
              your account.
            </li>
            <li>
              <strong className="text-ink">Cookies / local storage:</strong> a strictly-necessary session
              cookie or token that keeps you signed in. See the cookie banner for the current, accurate list;
              no analytics or advertising cookies are active on this site at this time.
            </li>
          </ul>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">How we use it</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            To respond to your enquiry, to operate your client portal account and show you your own shipments,
            and to run the Port Captain, survey/inspection, and logistics services you've asked us for. We
            don't sell your data.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">Who else sees it</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            Depending on which backend is deployed, account and shipment data is hosted either on our own
            server and database, or on Supabase's infrastructure acting as our data processor. Client company
            data is only ever visible to that client's own account and to GSS staff, never to other clients.
          </p>
          <p className="mt-3 rounded-md border border-border bg-yellow/60 px-4 py-3 text-sm text-ink">
            TODO: name the actual hosting provider(s) and any other processors (email delivery, backups) once
            the deployment is final.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">Your rights</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            You can ask us what data we hold about you, ask us to correct it, or ask us to delete your account
            and associated data, by emailing{' '}
            <a className="text-ink underline hover:text-coral" href={`mailto:${office.email}`}>
              {office.email}
            </a>
            .
          </p>
          <p className="mt-3 rounded-md border border-border bg-yellow/60 px-4 py-3 text-sm text-ink">
            TODO: confirm which specific data-protection law applies (e.g. India's DPDP Act, given the
            registered office; GDPR for EU-based clients) and state exact retention periods and response
            timeframes.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-10">
          <DimensionDivider className="mb-6" />
          <h2 className="text-xl text-ink">Changes to this policy</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            If this policy changes, we'll update the date at the top of this page.
          </p>
        </Reveal>
      </div>
    </div>
  )
}
