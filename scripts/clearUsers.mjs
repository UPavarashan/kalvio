import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

const { Client } = pg
const projectRef = 'bbarbvcoucrmxaztnsxz'

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim()
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const password = process.env.SUPABASE_DB_PASSWORD?.trim()
const databaseUrl = process.env.SUPABASE_DB_URL?.trim()

async function clearViaAdminApi() {
  if (!supabaseUrl || !serviceRoleKey) {
    return false
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let page = 1
  let deleted = 0

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error

    const users = data.users ?? []
    if (users.length === 0) break

    for (const user of users) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
      if (deleteError) throw deleteError
      deleted += 1
      console.log(`Deleted ${user.email ?? user.id}`)
    }

    if (users.length < 1000) break
    page += 1
  }

  console.log(`Cleared ${deleted} auth user(s) via Admin API.`)
  return true
}

async function clearViaDatabase() {
  if (!password && !databaseUrl) {
    return false
  }

  const connectionString =
    databaseUrl ??
    `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  const before = await client.query('select count(*)::int as count from auth.users')
  const count = before.rows[0]?.count ?? 0

  await client.query('delete from auth.users')

  console.log(`Cleared ${count} auth user(s) from the database.`)
  console.log('Related profiles, attendance, and GPA rows were removed automatically.')

  await client.end()
  return true
}

async function main() {
  if (await clearViaAdminApi()) return
  if (await clearViaDatabase()) return

  console.error('Missing admin credentials.')
  console.error('')
  console.error('Add one of these to .env.local:')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.error('  SUPABASE_DB_PASSWORD=your-database-password')
  console.error('')
  console.error('Find them in Supabase Dashboard → Settings → API / Database.')
  console.error('Or run supabase/sql/clear_users.sql manually in the SQL Editor.')
  process.exit(1)
}

main().catch((error) => {
  console.error('Clear users failed:', error.message)
  process.exit(1)
})
