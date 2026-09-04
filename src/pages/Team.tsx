import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { useAuth } from '../auth/AuthContext'
import { getApi } from '../api'
import {
  OPERATION_TYPE_LABELS,
  STATUS_LABELS,
  type Company,
  type NewShipmentInput,
  type OperationType,
  type Shipment,
  type ShipmentStatus,
} from '../api/types'
import { Reveal } from '../components/motion/Reveal'

const OPERATION_TYPES = Object.keys(OPERATION_TYPE_LABELS) as OperationType[]
const STATUSES = Object.keys(STATUS_LABELS) as ShipmentStatus[]

const emptyForm = {
  companyId: '',
  vesselName: '',
  port: '',
  operationType: 'port_captain' as OperationType,
  cargoDescription: '',
  status: 'scheduled' as ShipmentStatus,
  operationDate: '',
  notes: '',
}

export function Team() {
  useSceneVisibility()
  useDocumentMeta({ title: 'Operations Board', description: 'Manage GSS shipments and staff accounts.', path: '/team', noindex: true })
  const { user, logout } = useAuth()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [form, setForm] = useState<NewShipmentInput>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteStatus, setInviteStatus] = useState<string | null>(null)

  const companyNameById = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies])

  const refresh = () => {
    getApi().then((api) => {
      Promise.all([api.listShipments().then(setShipments), api.listCompanies().then(setCompanies)]).finally(() =>
        setLoadingData(false),
      )
    })
  }

  useEffect(refresh, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!form.companyId) {
      setFormError('Select a client company.')
      return
    }
    setSubmitting(true)
    try {
      const api = await getApi()
      await api.createShipment(form)
      setForm(emptyForm)
      refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create shipment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: ShipmentStatus) => {
    const api = await getApi()
    await api.updateShipment(id, { status })
    refresh()
  }

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
    setInviteStatus(null)
    try {
      const api = await getApi()
      await api.inviteStaff({ email: inviteEmail, password: invitePassword })
      setInviteStatus(`${inviteEmail} added as staff.`)
      setInviteEmail('')
      setInvitePassword('')
    } catch (err) {
      setInviteStatus(err instanceof Error ? err.message : 'Could not add staff account.')
    }
  }

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl text-ink sm:text-4xl">Operations board</h1>
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

        <Reveal as="section" className="mt-10 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg text-ink">New shipment</h2>
          {loadingData ? (
            <p className="mt-2 text-sm text-muted">Loading…</p>
          ) : companies.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              No client companies yet. A client needs to sign up before you can assign them a shipment.
            </p>
          ) : (
            <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-ink">
                <span className="font-mono text-xs uppercase tracking-wide2 text-muted">Client</span>
                <select
                  required
                  value={form.companyId}
                  onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-cream px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-ink">
                <span className="font-mono text-xs uppercase tracking-wide2 text-muted">Vessel</span>
                <input
                  required
                  value={form.vesselName}
                  onChange={(e) => setForm((f) => ({ ...f, vesselName: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-cream px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink">
                <span className="font-mono text-xs uppercase tracking-wide2 text-muted">Port</span>
                <input
                  required
                  value={form.port}
                  onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-cream px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink">
                <span className="font-mono text-xs uppercase tracking-wide2 text-muted">Service</span>
                <select
                  value={form.operationType}
                  onChange={(e) => setForm((f) => ({ ...f, operationType: e.target.value as OperationType }))}
                  className="mt-1 w-full rounded-md border border-border bg-cream px-3 py-2 text-sm"
                >
                  {OPERATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {OPERATION_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-ink">
                <span className="font-mono text-xs uppercase tracking-wide2 text-muted">Cargo</span>
                <input
                  required
                  value={form.cargoDescription}
                  onChange={(e) => setForm((f) => ({ ...f, cargoDescription: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-cream px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink">
                <span className="font-mono text-xs uppercase tracking-wide2 text-muted">Operation date</span>
                <input
                  required
                  type="date"
                  value={form.operationDate}
                  onChange={(e) => setForm((f) => ({ ...f, operationDate: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-cream px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink sm:col-span-2">
                <span className="font-mono text-xs uppercase tracking-wide2 text-muted">Notes (visible to client)</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-cream px-3 py-2 text-sm"
                />
              </label>
              {formError ? (
                <p role="alert" className="rounded-md border border-border bg-yellow/60 px-3 py-2 text-sm font-medium text-ink sm:col-span-2">
                  {formError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="press mt-1 w-fit rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach disabled:opacity-60 sm:col-span-2"
              >
                {submitting ? 'Creating…' : 'Create shipment'}
              </button>
            </form>
          )}
        </Reveal>

        <Reveal as="section" className="mt-10">
          <h2 className="text-lg text-ink">All shipments</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="particulars-table">
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Client</th>
                  <th scope="col">Vessel</th>
                  <th scope="col">Port</th>
                  <th scope="col">Service</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      Loading shipments…
                    </td>
                  </tr>
                ) : shipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      No shipments yet.
                    </td>
                  </tr>
                ) : (
                  shipments.map((s) => (
                    <tr key={s.id}>
                      <td className="figure">{s.referenceCode}</td>
                      <td>{companyNameById.get(s.companyId) ?? 'N/A'}</td>
                      <td>{s.vesselName}</td>
                      <td>{s.port}</td>
                      <td>{OPERATION_TYPE_LABELS[s.operationType]}</td>
                      <td className="figure">{s.operationDate}</td>
                      <td>
                        <select
                          value={s.status}
                          onChange={(e) => handleStatusChange(s.id, e.target.value as ShipmentStatus)}
                          className="rounded border border-border bg-card px-2 py-1 text-xs"
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {STATUS_LABELS[st]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal as="section" className="mt-10 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg text-ink">Add a staff account</h2>
          <form onSubmit={handleInvite} className="mt-4 flex flex-wrap items-end gap-4">
            <label className="text-sm text-ink">
              <span className="font-mono text-xs uppercase tracking-wide2 text-muted">Email</span>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="mt-1 w-64 rounded-md border border-border bg-cream px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-ink">
              <span className="font-mono text-xs uppercase tracking-wide2 text-muted">Temporary password</span>
              <input
                type="password"
                required
                minLength={8}
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="mt-1 w-64 rounded-md border border-border bg-cream px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="press rounded-md border border-ink/25 px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink hover:bg-peach2/50"
            >
              Add staff
            </button>
          </form>
          {inviteStatus ? (
            <p role="status" className="mt-3 text-sm text-ink">
              {inviteStatus}
            </p>
          ) : null}
        </Reveal>
      </div>
    </div>
  )
}
