export type Role = 'client' | 'staff'

export type User = {
  id: string
  email: string
  role: Role
  companyId: string | null
}

export type Company = {
  id: string
  name: string
}

export type OperationType = 'port_captain' | 'survey_inspection' | 'logistics'
export type ShipmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'on_hold'

export type Shipment = {
  id: string
  companyId: string
  referenceCode: string
  vesselName: string
  port: string
  operationType: OperationType
  cargoDescription: string
  status: ShipmentStatus
  operationDate: string // ISO date
  notes: string
  createdAt: string
  updatedAt: string
}

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  port_captain: 'Port Captain Services',
  survey_inspection: 'Survey & Inspection Services',
  logistics: 'Logistics Services',
}

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  on_hold: 'On Hold',
}

export type NewShipmentInput = {
  companyId: string
  vesselName: string
  port: string
  operationType: OperationType
  cargoDescription: string
  status: ShipmentStatus
  operationDate: string
  notes: string
}

export type ShipmentUpdateInput = Partial<NewShipmentInput>

export class AuthError extends Error {}
