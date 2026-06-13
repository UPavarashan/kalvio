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
  console.error('Or paste supabase/sql/migrate_program_to_course.sql into the Supabase SQL Editor.')
  process.exit(1)
}

const connectionString =
  databaseUrl ??
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`

const sqlPath = join(__dirname, '..', 'supabase', 'sql', 'migrate_program_to_course.sql')
const sql = readFileSync(sqlPath, 'utf8')

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  console.log('Connecting to Supabase Postgres...')
  await client.connect()
  console.log('Running migrate_program_to_course.sql...')

  await client.query(sql)

  const { rows } = await client.query(`
    select column_name
    from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
    order by column_name
  `)

  console.log('Migration complete. profiles columns:')
  for (const row of rows) {
    console.log(`  - ${row.column_name}`)
  }

  await client.end()
}

main().catch((error) => {
  console.error('Migration failed:', error.message)
  process.exit(1)
})
