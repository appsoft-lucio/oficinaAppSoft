import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers })
  if (request.method !== 'POST') return json({ error: 'Método inválido.' }, 405)
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authorization = request.headers.get('Authorization')
    if (!authorization) return json({ error: 'Entre na sua conta.' }, 401)
    const client = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } })
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user) return json({ error: 'Sessão inválida.' }, 401)
    const body = await request.json()
    const admin = createClient(url, serviceKey)
    const { data: oficina, error: oficinaError } = await admin.from('oficinas')
      .select('id, dono_id, status, trial_ends_at').eq('id', String(body.oficinaId ?? '')).eq('dono_id', user.id).maybeSingle()
    if (oficinaError || !oficina || oficina.status !== 'ativo' ||
      (oficina.trial_ends_at && new Date(oficina.trial_ends_at).getTime() <= Date.now())) {
      return json({ error: 'Somente o dono de uma oficina ativa pode cadastrar gerentes.' }, 403)
    }
    const nome = String(body.nome ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const username = String(body.username ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    if (!nome || nome.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128 ||
      (username && !/^[a-z0-9_]{3,30}$/.test(username))) {
      return json({ error: 'Informe nome, e-mail válido e senha de 8 a 128 caracteres. O usuário opcional deve ter de 3 a 30 letras sem acentos, números ou _.' }, 400)
    }
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: nome, ...(username ? { username } : {}) },
      app_metadata: { workshop_manager: true },
    })
    if (createError || !created.user) return json({ error: 'Não foi possível criar o acesso. Confira se o e-mail ou usuário já está cadastrado.' }, 409)
    const { error: linkError } = await admin.from('oficina_usuarios').insert({
      user_id: created.user.id, oficina_id: oficina.id, nome, email,
    })
    if (linkError) {
      await admin.auth.admin.deleteUser(created.user.id)
      return json({ error: 'Não foi possível vincular o gerente à oficina. Tente novamente.' }, 500)
    }
    return json({ success: true })
  } catch {
    return json({ error: 'Não foi possível cadastrar o gerente. Tente novamente.' }, 500)
  }
})
