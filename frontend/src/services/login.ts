import { supabase } from '../lib/supabase'

export async function loginWithIdentifier(identifier: string, password: string) {
  const value = identifier.trim()
  if (value.includes('@')) {
    return supabase.auth.signInWithPassword({ email: value, password })
  }

  const { data, error } = await supabase.functions.invoke('username-login', {
    body: { username: value.toLowerCase(), password },
  })
  if (error || !data?.access_token || !data?.refresh_token) {
    return { data: { user: null, session: null }, error: { code: 'invalid_credentials' } }
  }
  return supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token })
}
