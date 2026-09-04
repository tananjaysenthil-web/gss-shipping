import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { pool } from './db.js'
import { hashPassword, verifyPassword, signSession, SESSION_COOKIE } from './auth.js'
import { requireAuth, requireRole } from './middleware.js'

const app = express()
const PORT = Number(process.env.PORT ?? 4000)
const isProd = process.env.NODE_ENV === 'production'

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true }))

function setSessionCookie(res: express.Response, userId: string) {
  const token = signSession({ sub: userId })
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

function shipmentRowToApi(row: any) {
  return {
    id: row.id,
    companyId: row.company_id,
    referenceCode: row.reference_code,
    vesselName: row.vessel_name,
    port: row.port,
    operationType: row.operation_type,
    cargoDescription: row.cargo_description,
    status: row.status,
    operationDate: row.operation_date.toISOString?.().slice(0, 10) ?? row.operation_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// --- Auth ---

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, companyName } = req.body ?? {}
  if (!email || !password || !companyName) {
    return res.status(400).json({ error: 'Email, password and company name are required.' })
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'An account with that email already exists.' })
    }
    const company = await client.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [companyName])
    const passwordHash = await hashPassword(password)
    const user = await client.query(
      `INSERT INTO users (email, password_hash, role, company_id)
       VALUES ($1, $2, 'client', $3) RETURNING id, email, role, company_id`,
      [email, passwordHash, company.rows[0].id],
    )
    await client.query('COMMIT')
    const row = user.rows[0]
    setSessionCookie(res, row.id)
    res.json({ id: row.id, email: row.email, role: row.role, companyId: row.company_id })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Could not create account.' })
  } finally {
    client.release()
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

  const { rows } = await pool.query(
    'SELECT id, email, role, company_id, password_hash FROM users WHERE email = $1',
    [email],
  )
  const row = rows[0]
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }
  setSessionCookie(res, row.id)
  res.json({ id: row.id, email: row.email, role: row.role, companyId: row.company_id })
})

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE)
  res.json({ ok: true })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.user)
})

// --- Shipments ---

app.get('/api/shipments', requireAuth, async (req, res) => {
  const user = req.user!
  const query =
    user.role === 'staff'
      ? 'SELECT * FROM shipments ORDER BY created_at DESC'
      : 'SELECT * FROM shipments WHERE company_id = $1 ORDER BY created_at DESC'
  const { rows } = await pool.query(query, user.role === 'staff' ? [] : [user.companyId])
  res.json(rows.map(shipmentRowToApi))
})

app.post('/api/shipments', requireAuth, requireRole('staff'), async (req, res) => {
  const { companyId, vesselName, port, operationType, cargoDescription, status, operationDate, notes } =
    req.body ?? {}
  if (!companyId || !vesselName || !port || !operationType || !cargoDescription || !status || !operationDate) {
    return res.status(400).json({ error: 'Missing required shipment fields.' })
  }
  try {
    const seq = await pool.query("SELECT nextval('shipment_ref_seq') AS n")
    const referenceCode = `GSS-${new Date().getFullYear()}-${String(seq.rows[0].n).padStart(4, '0')}`
    const { rows } = await pool.query(
      `INSERT INTO shipments
         (company_id, reference_code, vessel_name, port, operation_type, cargo_description, status, operation_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        companyId,
        referenceCode,
        vesselName,
        port,
        operationType,
        cargoDescription,
        status,
        operationDate,
        notes ?? '',
        req.user!.id,
      ],
    )
    res.json(shipmentRowToApi(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not create shipment.' })
  }
})

app.patch('/api/shipments/:id', requireAuth, requireRole('staff'), async (req, res) => {
  const fields: Record<string, string> = {
    vesselName: 'vessel_name',
    port: 'port',
    operationType: 'operation_type',
    cargoDescription: 'cargo_description',
    status: 'status',
    operationDate: 'operation_date',
    notes: 'notes',
    companyId: 'company_id',
  }
  const updates: string[] = []
  const values: unknown[] = []
  for (const [apiKey, column] of Object.entries(fields)) {
    if (req.body?.[apiKey] !== undefined) {
      values.push(req.body[apiKey])
      updates.push(`${column} = $${values.length}`)
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' })
  values.push(req.params.id)
  const { rows } = await pool.query(
    `UPDATE shipments SET ${updates.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING *`,
    values,
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Shipment not found.' })
  res.json(shipmentRowToApi(rows[0]))
})

// --- Companies & staff ---

app.get('/api/companies', requireAuth, requireRole('staff'), async (_req, res) => {
  const { rows } = await pool.query('SELECT id, name FROM companies ORDER BY name')
  res.json(rows)
})

app.post('/api/staff/invite', requireAuth, requireRole('staff'), async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })
  if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rows.length > 0) return res.status(409).json({ error: 'An account with that email already exists.' })

  const passwordHash = await hashPassword(password)
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, company_id) VALUES ($1, $2, 'staff', NULL)
     RETURNING id, email, role, company_id`,
    [email, passwordHash],
  )
  res.json(rows[0])
})

app.listen(PORT, () => {
  console.log(`GSS custom backend listening on http://localhost:${PORT}`)
})
