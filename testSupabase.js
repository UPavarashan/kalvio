import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.')
  console.error('Run: node --env-file=.env.local testSupabase.js')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing connection to Supabase...')

  const { data, error } = await supabase.from('tasks').select('*').limit(5)

  if (error) {
    console.error('Connection failed.')
    console.error('Error details:', error.message)
    if (error.message.includes('Could not find the table')) {
      console.error('\nCreate the table first:')
      console.error('1. Open https://supabase.com/dashboard/project/bbarbvcoucrmxaztnsxz/sql/new')
      console.error('2. Paste the SQL from supabase/sql/create_tasks.sql')
      console.error('3. Click Run, then re-run this script')
    }
    process.exit(1)
  }

  console.log('Connection successful.')
  console.log(`Found ${data.length} task(s):`)
  for (const task of data) {
    console.log(`- [${task.completed ? 'x' : ' '}] ${task.title}`)
  }
}

testConnection()
