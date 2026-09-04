import pg from 'pg'

// DATE columns (OID 1082) default to being parsed into a JS Date at local
// midnight, which then rolls back a day when serialized via toISOString()
// in any timezone ahead of UTC. Keep the raw 'YYYY-MM-DD' string instead.
pg.types.setTypeParser(1082, (val) => val)

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
