import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    await supabase.auth.signOut()
  }

  redirect('/admin/login')
}
