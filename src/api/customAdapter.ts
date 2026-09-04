// Talks to the hand-written Express + Postgres backend in /server.
import type { BackendAdapter } from './backend'
import { AuthError, type Company, type NewShipmentInput, type Shipment, type ShipmentUpdateInput, type User } from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new AuthError(body.error ?? 'Request failed.')
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const customAdapter: BackendAdapter = {
  async getSession() {
    try {
      return await request<User>('/api/auth/me')
    } catch {
      return null
    }
  },

  signUp(input) {
    return request<User>('/api/auth/signup', { method: 'POST', body: JSON.stringify(input) })
  },

  login(input) {
    return request<User>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) })
  },

  async logout() {
    await request('/api/auth/logout', { method: 'POST' })
  },

  listShipments() {
    return request<Shipment[]>('/api/shipments')
  },

  createShipment(input: NewShipmentInput) {
    return request<Shipment>('/api/shipments', { method: 'POST', body: JSON.stringify(input) })
  },

  updateShipment(id: string, input: ShipmentUpdateInput) {
    return request<Shipment>(`/api/shipments/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
  },

  listCompanies() {
    return request<Company[]>('/api/companies')
  },

  inviteStaff(input) {
    return request<User>('/api/staff/invite', { method: 'POST', body: JSON.stringify(input) })
  },
}
