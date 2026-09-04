import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getApi } from '../api'
import type { User } from '../api/types'

type AuthContextValue = {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (input: { email: string; password: string; companyName: string }) => Promise<User>
  login: (input: { email: string; password: string }) => Promise<User>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined

    getApi().then((api) => {
      api
        .getSession()
        .then((u) => {
          if (!cancelled) setUser(u)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })

      // Backends that can report session changes outside a direct
      // login()/logout() call (Supabase: background token refresh, another
      // tab signing out, returning from an email-confirmation link) do so
      // here. mock/custom don't implement this, so they rely solely on the
      // getSession() call above and the explicit setUser() in signUp/login/logout.
      if (!cancelled) {
        unsubscribe = api.onAuthStateChange?.((u) => {
          if (!cancelled) setUser(u)
        })
      }
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const signUp = useCallback(async (input: { email: string; password: string; companyName: string }) => {
    setError(null)
    try {
      const api = await getApi()
      const u = await api.signUp(input)
      setUser(u)
      return u
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed.')
      throw e
    }
  }, [])

  const login = useCallback(async (input: { email: string; password: string }) => {
    setError(null)
    try {
      const api = await getApi()
      const u = await api.login(input)
      setUser(u)
      return u
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.')
      throw e
    }
  }, [])

  const logout = useCallback(async () => {
    const api = await getApi()
    await api.logout()
    setUser(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({ user, loading, error, signUp, login, logout, clearError }),
    [user, loading, error, signUp, login, logout, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
