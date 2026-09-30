import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers })
const denied = () => json({ error: 'Não foi possível entrar. Confira o usuário e a senha.' }, 401)

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers })
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405)
  try {
    const body = await request.json()
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!/^[a-z0-9_]{3,30}$/.test(username) || !password || password.length > 4096) return denied()

    const url = Deno.env.get('SUPABASE_URL')!
    const options = { auth: { persistSession: false, autoRefreshToken: false } }
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, options)
    const { data: allowed, error: limitError } = await admin.rpc('allow_username_login', { login_name: username })
    if (limitError) return json({ error: 'Login indisponível. Tente novamente.' }, 503)
    if (!allowed) return json({ error: 'Muitas tentativas. Aguarde um minuto.' }, 429)

    const { data: mapping, error } = await admin.from('login_usernames').select('user_id').eq('username', username).maybeSingle()
    if (error) return json({ error: 'Login indisponível. Tente novamente.' }, 503)
    if (!mapping) return denied()
    const { data: account, error: accountError } = await admin.auth.admin.getUserById(mapping.user_id)
    if (accountError || !account.user?.email) return denied()

    const auth = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, options)
    const { data, error: loginError } = await auth.auth.signInWithPassword({ email: account.user.email, password })
    if (loginError || !data.session) return denied()
    return json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token })
  } catch {
    return json({ error: 'Não foi possível entrar. Tente novamente.' }, 400)
  }
})
