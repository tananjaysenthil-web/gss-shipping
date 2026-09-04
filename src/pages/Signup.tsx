import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { useAuth } from '../auth/AuthContext'
import { Reveal } from '../components/motion/Reveal'

export function Signup() {
  useSceneVisibility()
  useDocumentMeta({ title: 'Create Account', description: 'Create a GSS client account to track your shipments.', path: '/signup', noindex: true })
  const { signUp, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signUp({ email, password, companyName })
      navigate('/portal')
    } catch {
      // error already surfaced via useAuth().error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-surface page-surface--opaque flex-1">
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <Reveal>
          <h1 className="text-3xl text-ink sm:text-4xl">Create your account</h1>
          <p className="mt-3 text-sm text-muted">
            For clients tracking shipments with GSS. Your account starts with an empty portal. Your Port
            Captain contact will add shipments as operations are scheduled.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="companyName" className="font-mono text-xs uppercase tracking-wide2 text-muted">
                Company name
              </label>
              <input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value)
                  clearError()
                }}
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-ink focus-visible:border-coral"
              />
            </div>
            <div>
              <label htmlFor="email" className="font-mono text-xs uppercase tracking-wide2 text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  clearError()
                }}
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-ink focus-visible:border-coral"
              />
            </div>
            <div>
              <label htmlFor="password" className="font-mono text-xs uppercase tracking-wide2 text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearError()
                }}
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-ink focus-visible:border-coral"
              />
              <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
            </div>

            {error ? (
              <p role="alert" className="rounded-md border border-border bg-yellow/60 px-3 py-2 text-sm font-medium text-ink">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="press w-full rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-ink underline hover:text-coral">
              Log in
            </Link>
          </p>
        </Reveal>
      </div>
    </div>
  )
}
