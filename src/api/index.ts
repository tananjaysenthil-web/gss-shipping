import type { BackendAdapter } from './backend'

type BackendName = 'mock' | 'custom' | 'supabase'

// VITE_BACKEND picks which implementation powers auth + shipments.
// Defaults to the in-memory mock so `npm run dev` works with zero setup.
export const activeBackendName: BackendName = (import.meta.env.VITE_BACKEND as BackendName | undefined) ?? 'mock'

// Dynamic imports so the ~40KB supabase-js bundle (and the custom-backend
// adapter) never ship to visitors who are only using the marketing site or
// a different backend — each is its own chunk, fetched only when selected.
let cached: Promise<BackendAdapter> | null = null

export function getApi(): Promise<BackendAdapter> {
  if (cached) return cached
  cached = (async () => {
    switch (activeBackendName) {
      case 'custom':
        return (await import('./customAdapter')).customAdapter
      case 'supabase':
        return (await import('./supabaseAdapter')).supabaseAdapter
      default:
        return (await import('./mockAdapter')).mockAdapter
    }
  })()
  return cached
}
