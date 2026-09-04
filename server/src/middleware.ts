import type { NextFunction, Request, Response } from 'express'
import { pool } from './db.js'
import { SESSION_COOKIE, verifySession } from './auth.js'

export type AuthedUser = {
  id: string
  email: string
  role: 'client' | 'staff'
  companyId: string | null
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) return res.status(401).json({ error: 'Not signed in.' })

  try {
    const { sub } = verifySession(token)
    const { rows } = await pool.query(
      'SELECT id, email, role, company_id FROM users WHERE id = $1',
      [sub],
    )
    const row = rows[0]
    if (!row) return res.status(401).json({ error: 'Not signed in.' })
    req.user = { id: row.id, email: row.email, role: row.role, companyId: row.company_id }
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired — please log in again.' })
  }
}

export function requireRole(role: AuthedUser['role']) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) return res.status(403).json({ error: 'Not authorized.' })
    next()
  }
}
