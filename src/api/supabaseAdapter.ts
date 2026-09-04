// Talks to Supabase directly (Auth + Postgres w/ RLS) — see supabase/schema.sql.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { BackendAdapter } from './backend'
import { AuthError, type Company, type NewShipmentInput, type Role, type Shipment, type ShipmentUpdateInput, type User } from './types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function getClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new AuthError(
      'VITE_BACKEND=supabase but VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are not set. See supabase/README.md.',
    )
  }
  return createClient(url, anonKey)
}

// Lazy so importing this module never throws when a different backend is active.
let _client: SupabaseClient | null = null
const client = () => (_client ??= getClient())

type ProfileRow = { id: string; email: string; role: Role; company_id: string | null }

async function profileToUser(profileId: string): Promise<User> {
  const { data, error } = await client().from('profiles').select('*').eq('id', profileId).single()
  if (error || !data) throw new AuthError('Could not load account profile.')
  const row = data as ProfileRow
  return { id: row.id, email: row.email, role: row.role, companyId: row.company_id }
}

function shipmentRowToApi(row: any): Shipment {
  return {
    id: row.id,
    companyId: row.company_id,
    referenceCode: row.reference_code,
    vesselName: row.vessel_name,
    port: row.port,
    operationType: row.operation_type,
    cargoDescription: row.cargo_description,
    status: row.status,
    operationDate: row.operation_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const columnByField: Record<string, string> = {
  companyId: 'company_id',
  vesselName: 'vessel_name',
  port: 'port',
  operationType: 'operation_type',
  cargoDescription: 'cargo_description',
  status: 'status',
  operationDate: 'operation_date',
  notes: 'notes',
}

function toColumns(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue
    out[columnByField[key] ?? key] = value
  }
  return out
}

export const supabaseAdapter: BackendAdapter = {
  async getSession() {
    const { data } = await client().auth.getSession()
    const userId = data.session?.user.id
    if (!userId) return null
    try {
      return await profileToUser(userId)
    } catch {
      return null
    }
  },

  async signUp({ email, password, companyName }) {
    const { data, error } = await client().auth.signUp({
      email,
      password,
      options: { data: { company_name: companyName } },
    })
    if (error) throw new AuthError(error.message)
    // When email confirmation is on, Supabase still returns a populated
    // `data.user` — it's `data.session` that's null until the link is
    // clicked. Checking `data.user` here always passed, so this branch never
    // fired and every unconfirmed signup instead failed inside
    // profileToUser() with the unrelated "Could not load account profile."
    // (an unauthenticated read blocked by RLS). Checking `data.session` is
    // the actual signal for "no session yet."
    if (!data.session) {
      throw new AuthError('Check your inbox to confirm your email before logging in.')
    }
    return profileToUser(data.user!.id)
  },

  async login({ email, password }) {
    const { data, error } = await client().auth.signInWithPassword({ email, password })
    if (error || !data.user) throw new AuthError(error?.message ?? 'Incorrect email or password.')
    return profileToUser(data.user.id)
  },

  async logout() {
    await client().auth.signOut()
  },

  async listShipments() {
    const { data, error } = await client().from('shipments').select('*').order('created_at', { ascending: false })
    if (error) throw new AuthError(error.message)
    return (data ?? []).map(shipmentRowToApi)
  },

  async createShipment(input: NewShipmentInput) {
    const { data, error } = await client()
      .from('shipments')
      .insert(toColumns(input))
      .select()
      .single()
    if (error) throw new AuthError(error.message)
    return shipmentRowToApi(data)
  },

  async updateShipment(id: string, input: ShipmentUpdateInput) {
    const { data, error } = await client()
      .from('shipments')
      .update(toColumns(input))
      .eq('id', id)
      .select()
      .single()
    if (error) throw new AuthError(error.message)
    return shipmentRowToApi(data)
  },

  async listCompanies(): Promise<Company[]> {
    const { data, error } = await client().from('companies').select('id, name').order('name')
    if (error) throw new AuthError(error.message)
    return data ?? []
  },

  async inviteStaff({ email, password }) {
    // A fresh, isolated client so this signUp doesn't replace the calling
    // staff member's own session (supabase-js sets the session on whichever
    // client instance performs the signUp).
    if (!url || !anonKey) throw new AuthError('Supabase is not configured.')
    const scratchClient = createClient(url, anonKey)
    const { data, error } = await scratchClient.auth.signUp({ email, password })
    if (error || !data.user) throw new AuthError(error?.message ?? 'Could not create staff account.')

    // Promote the trigger-created 'client' profile to 'staff' using the
    // CALLING (staff) session, which is what RLS checks against.
    const { error: updateError } = await client()
      .from('profiles')
      .update({ role: 'staff', company_id: null })
      .eq('id', data.user.id)
    if (updateError) throw new AuthError(updateError.message)

    return { id: data.user.id, email, role: 'staff', companyId: null }
  },

  onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = client().auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        callback(null)
        return
      }
      profileToUser(session.user.id)
        .then(callback)
        .catch(() => callback(null))
    })
    return () => subscription.unsubscribe()
  },
}
