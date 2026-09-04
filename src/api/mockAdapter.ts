import type { BackendAdapter } from './backend'
import { AuthError, type Company, type Shipment, type User } from './types'

// In-memory only — resets on reload. Lets the portal/team UI be built and
// clicked through before either real backend exists. Never used in a real
// deployment (see src/api/index.ts).

type StoredUser = User & { password: string }

let idCounter = 1
const nextId = () => String(idCounter++)

// Seeded so the mock backend is clickable without a real signup first — the
// stand-in for each real backend's "one-time first staff account" step.
const users: StoredUser[] = [
  { id: nextId(), email: 'staff@gss-shipping.com', password: 'staffpass123', role: 'staff', companyId: null },
]
const companies: Company[] = []
const shipments: Shipment[] = []
let currentUserId: string | null = null

function requireUser(): StoredUser {
  const user = users.find((u) => u.id === currentUserId)
  if (!user) throw new AuthError('Not signed in.')
  return user
}

export const mockAdapter: BackendAdapter = {
  async getSession() {
    const user = users.find((u) => u.id === currentUserId)
    return user ? { id: user.id, email: user.email, role: user.role, companyId: user.companyId } : null
  },

  async signUp({ email, password, companyName }) {
    if (users.some((u) => u.email === email)) throw new AuthError('An account with that email already exists.')
    const company: Company = { id: nextId(), name: companyName }
    companies.push(company)
    const user: StoredUser = { id: nextId(), email, password, role: 'client', companyId: company.id }
    users.push(user)
    currentUserId = user.id
    return { id: user.id, email: user.email, role: user.role, companyId: user.companyId }
  },

  async login({ email, password }) {
    const user = users.find((u) => u.email === email)
    if (!user || user.password !== password) throw new AuthError('Incorrect email or password.')
    currentUserId = user.id
    return { id: user.id, email: user.email, role: user.role, companyId: user.companyId }
  },

  async logout() {
    currentUserId = null
  },

  async listShipments() {
    const user = requireUser()
    if (user.role === 'staff') return [...shipments]
    return shipments.filter((s) => s.companyId === user.companyId)
  },

  async createShipment(input) {
    const user = requireUser()
    if (user.role !== 'staff') throw new AuthError('Only staff can create shipments.')
    const now = new Date().toISOString()
    const shipment: Shipment = {
      id: nextId(),
      referenceCode: `GSS-${new Date().getFullYear()}-${String(shipments.length + 1).padStart(4, '0')}`,
      createdAt: now,
      updatedAt: now,
      ...input,
    }
    shipments.push(shipment)
    return shipment
  },

  async updateShipment(id, input) {
    const user = requireUser()
    if (user.role !== 'staff') throw new AuthError('Only staff can update shipments.')
    const shipment = shipments.find((s) => s.id === id)
    if (!shipment) throw new Error('Shipment not found.')
    Object.assign(shipment, input, { updatedAt: new Date().toISOString() })
    return shipment
  },

  async listCompanies() {
    const user = requireUser()
    if (user.role !== 'staff') throw new AuthError('Only staff can list companies.')
    return [...companies]
  },

  async inviteStaff({ email, password }) {
    const user = requireUser()
    if (user.role !== 'staff') throw new AuthError('Only staff can invite other staff.')
    if (users.some((u) => u.email === email)) throw new AuthError('An account with that email already exists.')
    const staff: StoredUser = { id: nextId(), email, password, role: 'staff', companyId: null }
    users.push(staff)
    return { id: staff.id, email: staff.email, role: staff.role, companyId: staff.companyId }
  },
}
