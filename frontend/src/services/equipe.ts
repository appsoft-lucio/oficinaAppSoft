import { supabase } from '../lib/supabase'

export type AutorRegistro = { id: string; nome: string; perfil: 'dono' | 'gerente' }
export type AutoriaRegistro = {
  criado_por?: AutorRegistro | null
  alterado_por?: AutorRegistro | null
  alterado_em?: string | null
}
export type Gerente = { user_id: string; nome: string; email: string; ativo: boolean }
export type Atividade = {
  id: string; tabela: string; registro_id: string; acao: string
  autor: AutorRegistro | null; created_at: string
}

export async function listGerentes(oficinaId: string) {
  const { data, error } = await supabase.from('oficina_usuarios')
    .select('user_id, nome, email, ativo').eq('oficina_id', oficinaId).order('created_at')
  if (error) throw error
  return data as Gerente[]
}

export async function createGerente(params: { oficinaId: string; nome: string; email: string; username: string; password: string }) {
  const { data, error } = await supabase.functions.invoke('workshop-users', { body: params })
  if (error) {
    const response = error.context
    if (response instanceof Response) {
      const body = await response.json().catch(() => null)
      if (body?.error) throw new Error(body.error)
    }
    throw new Error('Não foi possível cadastrar o gerente. Verifique a conexão e a configuração do servidor.')
  }
  if (data?.error) throw new Error(data.error)
}

export async function setGerenteAtivo(oficinaId: string, userId: string, ativo: boolean) {
  const { error } = await supabase.from('oficina_usuarios').update({ ativo })
    .eq('oficina_id', oficinaId).eq('user_id', userId).select('user_id').single()
  if (error) throw error
}

export async function listAtividades(oficinaId: string, before?: Pick<Atividade, 'id' | 'created_at'>) {
  let query = supabase.from('registro_atividades').select('id, tabela, registro_id, acao, autor, created_at')
    .eq('oficina_id', oficinaId).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(100)
  if (before) query = query.or(`created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id})`)
  const { data, error } = await query
  if (error) throw error
  return data as Atividade[]
}
