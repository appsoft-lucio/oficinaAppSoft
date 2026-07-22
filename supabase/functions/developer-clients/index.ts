import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const authorization = request.headers.get('Authorization')

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) {
      return json({ error: 'Configuração ou autenticação ausente.' }, 401)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()

    if (userError || !userData.user) {
      return json({ error: 'Sessão inválida.' }, 401)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: admin } = await adminClient
      .from('app_admins')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (!admin) {
      return json({ error: 'Acesso restrito ao desenvolvedor.' }, 403)
    }

    if (request.method === 'GET') {
      const { data: workshops, error } = await adminClient
        .from('oficinas')
        .select('id, nome, dono_id, status, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      const clients = await Promise.all((workshops ?? []).map(async (workshop) => {
        const { data } = await adminClient.auth.admin.getUserById(workshop.dono_id)
        return {
          id: workshop.id,
          nome: workshop.nome,
          ownerEmail: data.user?.email ?? 'E-mail indisponível',
          ownerName: String(data.user?.user_metadata?.full_name ?? 'Responsável'),
          status: workshop.status,
          createdAt: workshop.created_at,
        }
      }))

      return json({ clients })
    }

    if (request.method !== 'POST') {
      return json({ error: 'Método não permitido.' }, 405)
    }

    const body = await request.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const ownerName = String(body.ownerName ?? '').trim()
    const password = String(body.password ?? '')
    const workshopName = String(body.workshopName ?? '').trim()

    if (!email || !ownerName || !workshopName || password.length < 8) {
      return json({ error: 'Preencha os campos; a senha deve ter no mínimo 8 caracteres.' }, 400)
    }

    const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: { full_name: ownerName },
    })

    if (createUserError || !createdUser.user) {
      return json({ error: createUserError?.message ?? 'Não foi possível criar o acesso.' }, 400)
    }

    const { data: workshop, error: workshopError } = await adminClient
      .from('oficinas')
      .insert({ dono_id: createdUser.user.id, nome: workshopName })
      .select('id, nome, status, created_at')
      .single()

    if (workshopError) {
      await adminClient.auth.admin.deleteUser(createdUser.user.id)
      throw workshopError
    }

    return json({
      client: {
        id: workshop.id,
        nome: workshop.nome,
        ownerEmail: email,
        ownerName,
        status: workshop.status,
        createdAt: workshop.created_at,
      },
    }, 201)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Erro interno.' }, 500)
  }
})
