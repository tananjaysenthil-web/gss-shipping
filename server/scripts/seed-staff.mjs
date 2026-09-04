// Creates the first staff account. Run once after db:migrate:
//   node scripts/seed-staff.mjs someone@gss-shipping.com 'a-strong-password'
import bcrypt from 'bcryptjs'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const [, , email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node scripts/seed-staff.mjs <email> <password>')
  process.exit(1)
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

try {
  const hash = await bcrypt.hash(password, 10)
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, company_id)
     VALUES ($1, $2, 'staff', NULL)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email`,
    [email, hash],
  )
  if (rows.length === 0) {
    console.log(`A user with email ${email} already exists — no change made.`)
  } else {
    console.log(`Staff account created: ${rows[0].email} (${rows[0].id})`)
  }
} catch (err) {
  console.error('Seed failed:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
