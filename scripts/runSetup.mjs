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
  process.exit(1)
}

const connectionString =
  databaseUrl ??
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`

const sqlPath = join(__dirname, '..', 'supabase', 'sql', 'setup.sql')
const sql = readFileSync(sqlPath, 'utf8')

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  console.log('Connecting to Supabase Postgres...')
  await client.connect()
  console.log('Running setup.sql...')

  await client.query(sql)

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('profiles', 'user_attendance', 'user_gpa', 'tasks')
    order by table_name
  `)

  console.log('Setup complete. Public tables found:')
  for (const row of tables.rows) {
    console.log(`  - ${row.table_name}`)
  }

  await client.end()
}

main().catch((error) => {
  console.error('Setup failed:', error.message)
  process.exit(1)
})
