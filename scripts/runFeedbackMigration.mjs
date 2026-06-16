import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRef = 'bbarbvcoucrmxaztnsxz'

const password = process.env.SUPABASE_DB_PASSWORD?.trim()
const databaseUrl = process.env.SUPABASE_DB_URL?.trim()

if (!password && !databaseUrl) {
  console.error('Missing database credentials.')
  console.error('')
  console.error('Add one of these to .env.local:')
  console.error('  SUPABASE_DB_PASSWORD=your-database-password')
  console.error('  SUPABASE_DB_URL=postgresql://postgres:password@db....supabase.co:5432/postgres')
  console.error('')
  console.error('Find the password in Supabase Dashboard → Settings → Database.')
  console.error('Or paste supabase/sql/create_feedback.sql into the Supabase SQL Editor.')
  process.exit(1)
}

const connectionString =
  databaseUrl ??
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`

const sqlPath = join(__dirname, '..', 'supabase', 'sql', 'create_feedback.sql')
const sql = readFileSync(sqlPath, 'utf8')

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  console.log('Connecting to Supabase Postgres...')
  await client.connect()
  console.log('Running create_feedback.sql...')

  await client.query(sql)

  const exists = await client.query(`
    select exists (
      select 1
      from information_schema.tables
      where table_schema = 'public' and table_name = 'feedback'
    ) as ok
  `)

  const policy = await client.query(`
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'feedback'
  `)

  console.log('Feedback migration complete.')
  console.log(`  feedback table: ${exists.rows[0]?.ok ? 'yes' : 'missing'}`)
  if (policy.rows.length > 0) {
    console.log(`  policies: ${policy.rows.map((r) => r.policyname).join(', ')}`)
  }

  await client.end()
}

main().catch((error) => {
  console.error('Migration failed:', error.message)
  process.exit(1)
})
