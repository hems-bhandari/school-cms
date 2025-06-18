import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error: error.message }
    }

    console.log('Supabase connection test successful:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return { success: false, error: 'Connection failed' }
  }
}
