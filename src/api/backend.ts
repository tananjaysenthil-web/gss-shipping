import type { Company, NewShipmentInput, Shipment, ShipmentUpdateInput, User } from './types'

/**
 * Every backend (custom Express+Postgres, Supabase) implements this same
 * contract, so the React UI (login/signup/portal/team pages) never branches
 * on which backend is active — see src/api/index.ts for the switch.
 */
export interface BackendAdapter {
  /** Resolves the current session's user, or null if signed out. */
  getSession(): Promise<User | null>

  /** Creates a brand-new company + client account. Never joins an existing company. */
  signUp(input: { email: string; password: string; companyName: string }): Promise<User>

  login(input: { email: string; password: string }): Promise<User>

  logout(): Promise<void>

  /** Client role: only their own company's shipments. Staff role: all shipments. */
  listShipments(): Promise<Shipment[]>

  createShipment(input: NewShipmentInput): Promise<Shipment>

  updateShipment(id: string, input: ShipmentUpdateInput): Promise<Shipment>

  /** Staff only. */
  listCompanies(): Promise<Company[]>

  /** Staff only — creates another staff account. */
  inviteStaff(input: { email: string; password: string }): Promise<User>

  /**
   * Optional: notify the caller when the session changes for a reason other
   * than this tab's own login()/logout() calls — a background token refresh,
   * another tab signing out, or a redirect back from an email-confirmation
   * link. Only Supabase has such an event stream; mock/custom don't implement
   * this, and AuthContext falls back to its one-time getSession() on mount.
   * Returns an unsubscribe function.
   */
  onAuthStateChange?(callback: (user: User | null) => void): () => void
}
