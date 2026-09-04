import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { navigateWithTransition } from '../lib/viewTransition'

// TODO: replace with GSS's real form-handling endpoint (e.g. their inbox
// automation, CRM webhook, or a service like Web3Forms) before launch.
const PLACEHOLDER_ENDPOINT = 'https://example.com/api/gss-enquiries'

type FormState = {
  name: string
  email: string
  phone: string
  companyName: string
  operationDetails: string
  message: string
  website: string // honeypot
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  operationDetails: '',
  message: '',
  website: '',
}

type Status = 'idle' | 'submitting'

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const formId = useId()
  const navigate = useNavigate()

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'Enter your name.'
    if (!form.email.trim()) next.email = 'Enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.message.trim()) next.message = 'Describe your enquiry.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (form.website) return // honeypot tripped, silently drop
    if (!validate()) return

    setStatus('submitting')
    // Placeholder endpoint (see TODO above) — it has no real backend yet, so
    // this can't meaningfully fail. Once it's wired to a real destination,
    // check `res.ok` here and show an inline error instead of navigating.
    await fetch(PLACEHOLDER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null)
    navigateWithTransition(() => navigate('/thank-you'))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Leave this field blank</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={update('website')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={`${formId}-name`}
          label="Name"
          required
          value={form.name}
          onChange={update('name')}
          error={errors.name}
        />
        <Field
          id={`${formId}-email`}
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />
        <Field id={`${formId}-phone`} label="Phone" type="tel" value={form.phone} onChange={update('phone')} />
        <Field
          id={`${formId}-company`}
          label="Company"
          value={form.companyName}
          onChange={update('companyName')}
        />
      </div>

      <Field
        id={`${formId}-operation`}
        label="Port / cargo details"
        value={form.operationDetails}
        onChange={update('operationDetails')}
        placeholder="Port, cargo type, dimensions, dates"
      />

      <Field
        id={`${formId}-message`}
        label="Message"
        as="textarea"
        rows={5}
        required
        value={form.message}
        onChange={update('message')}
        error={errors.message}
      />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="press rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  )
}

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  type?: string
  required?: boolean
  error?: string
  as?: 'input' | 'textarea'
  rows?: number
  placeholder?: string
}

function Field({ id, label, value, onChange, type = 'text', required, error, as = 'input', rows, placeholder }: FieldProps) {
  const describedBy = error ? `${id}-error` : undefined
  const sharedClass =
    'mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-ink focus-visible:border-coral'

  return (
    <div>
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-wide2 text-muted">
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          placeholder={placeholder}
          className={sharedClass}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          placeholder={placeholder}
          className={sharedClass}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-ink">
          {error}
        </p>
      ) : null}
    </div>
  )
}
