import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const testEmail = process.env.TEST_EMAIL?.trim()
const testPassword = process.env.TEST_PASSWORD?.trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { flowType: 'pkce', detectSessionInUrl: false },
})

async function checkTable(name) {
  const { error } = await supabase.from(name).select('*').limit(1)
  if (error) {
    console.log(`  ${name}: ERROR — ${error.message}`)
    return false
  }
  console.log(`  ${name}: OK`)
  return true
}

async function main() {
  console.log('Checking public tables (anon, no auth)...')
  await checkTable('profiles')
  await checkTable('user_attendance')
  await checkTable('user_gpa')

  if (!testEmail || !testPassword) {
    console.log('\nSkipping sign-in test (set TEST_EMAIL and TEST_PASSWORD in .env.local to test login).')
    return
  }

  console.log(`\nTesting sign-in for ${testEmail}...`)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (error) {
    console.error('Sign-in failed:', error.message)
    process.exit(1)
  }

  console.log('Sign-in OK, user id:', data.user?.id)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, name, course')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Profile load failed:', profileError.message)
  } else if (!profile) {
    console.log('Profile row: missing')
  } else {
    console.log('Profile row:', profile)
  }

  await supabase.auth.signOut()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
