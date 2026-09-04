import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { company } from '../content/gss'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { navigateWithTransition } from '../lib/viewTransition'
import { useAuth } from '../auth/AuthContext'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/fleet', label: 'Fleet' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const accountHref = user ? (user.role === 'staff' ? '/team' : '/portal') : '/login'
  const accountLabel = user ? (user.role === 'staff' ? 'Team' : 'Portal') : 'Log in'

  const handleNavClick = (to: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    setOpen(false)
    navigateWithTransition(() => navigate(to))
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    drawerRef.current?.querySelector<HTMLElement>('a')?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      toggleRef.current?.focus()
    }
  }, [open])

  useGSAP(
    () => {
      if (!drawerRef.current || !backdropRef.current) return
      if (prefersReducedMotion()) {
        gsap.set(drawerRef.current, { x: open ? 0 : '100%' })
        gsap.set(backdropRef.current, { opacity: open ? 1 : 0 })
        return
      }
      if (open) {
        gsap.to(backdropRef.current, { opacity: 1, duration: 0.2, ease: 'power1.out' })
        gsap.to(drawerRef.current, { x: '0%', duration: 0.4, ease: 'power3.out' })
      } else {
        gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, ease: 'power1.in' })
        gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power2.in' })
      }
    },
    { dependencies: [open] },
  )

  return (
    <header className="glass pointer-events-auto sticky top-0 z-20 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex flex-col leading-none" onClick={handleNavClick('/')}>
          <span className="font-heading text-lg tracking-wide2 text-ink">{company.shortName}</span>
          <span className="font-mono text-[10px] uppercase tracking-wide2 text-muted">Global Sea Service</span>
        </NavLink>

        <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={handleNavClick(link.to)}
              className={({ isActive }) =>
                `nav-link press text-sm uppercase tracking-wide2 transition-colors ${
                  isActive ? 'nav-link--active text-ink' : 'text-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <NavLink
            to={accountHref}
            onClick={handleNavClick(accountHref)}
            className={({ isActive }) =>
              `nav-link press text-sm uppercase tracking-wide2 transition-colors ${
                isActive ? 'nav-link--active text-ink' : 'text-muted hover:text-ink'
              }`
            }
          >
            {accountLabel}
          </NavLink>
          {user ? (
            <button
              type="button"
              onClick={() => logout()}
              className="press text-sm uppercase tracking-wide2 text-muted hover:text-ink"
            >
              Log out
            </button>
          ) : null}
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="press rounded border border-border px-3 py-2 text-xs uppercase tracking-wide2 text-ink sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-30 bg-ink/40 opacity-0 sm:hidden"
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Primary navigation"
        className="glass-heavy fixed inset-y-0 right-0 z-40 flex w-72 translate-x-full flex-col gap-1 p-6 sm:hidden"
      >
        <button
          type="button"
          className="press mb-4 self-end text-xs uppercase tracking-wide2 text-muted"
          onClick={() => setOpen(false)}
        >
          Close ✕
        </button>
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={handleNavClick(link.to)}
            className={({ isActive }) =>
              `press rounded px-3 py-3 text-base uppercase tracking-wide2 transition-colors ${
                isActive ? 'bg-coral text-ink' : 'text-ink hover:bg-peach2'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <NavLink
          to={accountHref}
          onClick={handleNavClick(accountHref)}
          className={({ isActive }) =>
            `press rounded px-3 py-3 text-base uppercase tracking-wide2 transition-colors ${
              isActive ? 'bg-coral text-ink' : 'text-ink hover:bg-peach2'
            }`
          }
        >
          {accountLabel}
        </NavLink>
        {user ? (
          <button
            type="button"
            onClick={() => {
              logout()
              setOpen(false)
            }}
            className="press rounded px-3 py-3 text-left text-base uppercase tracking-wide2 text-ink hover:bg-peach2"
          >
            Log out
          </button>
        ) : null}
      </div>
    </header>
  )
}
