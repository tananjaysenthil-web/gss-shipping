import { useEffect, useState } from 'react'
import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { useAuth } from '../auth/AuthContext'
import { getApi } from '../api'
import { OPERATION_TYPE_LABELS, STATUS_LABELS, type Shipment } from '../api/types'
import { Reveal } from '../components/motion/Reveal'
import { RevealGroup } from '../components/motion/RevealGroup'

function StatusBadge({ status }: { status: Shipment['status'] }) {
  const tone =
    status === 'completed'
      ? 'bg-peach2 text-ink'
      : status === 'in_progress'
        ? 'bg-coral text-ink'
        : status === 'on_hold'
          ? 'bg-yellow text-ink'
          : 'bg-card border border-border text-muted'
  return (
    <span className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wide2 ${tone}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function Portal() {
  useSceneVisibility()
  useDocumentMeta({ title: 'Your Shipments', description: 'Track your shipments with Global Sea Service.', path: '/portal', noindex: true })
  const { user, logout } = useAuth()
  const [shipments, setShipments] = useState<Shipment[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    getApi()
      .then((api) => api.listShipments())
      .then(setShipments)
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Could not load shipments.'))
  }, [])

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl text-ink sm:text-4xl">Your shipments</h1>
            <p className="mt-2 text-sm text-muted">Signed in as {user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="press whitespace-nowrap rounded-md border border-ink/25 px-4 py-2 font-mono text-xs uppercase tracking-wide2 text-ink hover:bg-peach2/50"
          >
            Log out
          </button>
        </Reveal>

        <div className="mt-10">
          {loadError ? <p className="text-sm text-ink">{loadError}</p> : null}
          {!loadError && shipments === null ? <p className="text-sm text-muted">Loading…</p> : null}
          {shipments && shipments.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-ink">No shipments yet.</p>
              <p className="mt-2 text-sm text-muted">
                Your Port Captain contact will add operations here once they're scheduled.
              </p>
            </div>
          ) : null}
          {shipments && shipments.length > 0 ? (
            <RevealGroup as="div" each={0.06} className="space-y-4">
              {shipments.map((s) => (
                <div key={s.id} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wide2 text-muted">{s.referenceCode}</p>
                      <h2 className="mt-1 text-lg text-ink">{s.vesselName}</h2>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted">Port</dt>
                      <dd className="text-ink">{s.port}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Service</dt>
                      <dd className="text-ink">{OPERATION_TYPE_LABELS[s.operationType]}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Cargo</dt>
                      <dd className="text-ink">{s.cargoDescription}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Operation date</dt>
                      <dd className="figure text-ink">{s.operationDate}</dd>
                    </div>
                  </dl>
                  {s.notes ? <p className="mt-4 text-sm text-ink/80">{s.notes}</p> : null}
                </div>
              ))}
            </RevealGroup>
          ) : null}
        </div>
      </div>
    </div>
  )
}
