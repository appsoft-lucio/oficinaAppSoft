import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type SystemClient = {
  id: string
  nome: string
  ownerEmail: string
  username: string
  ownerName: string
  status: string
  trialEndsAt: string | null
  createdAt: string
}

export type CreateSystemClientParams = {
  email: string
  username: string
  ownerName: string
  password: string
  workshopName: string
}

export type UpdateSystemClientParams = {
  clientId: string
  email: string
  username: string
  ownerName: string
  password?: string
  workshopName: string
}

type ClientsResponse = {
  clients?: SystemClient[]
  client?: SystemClient
  error?: string
}

async function clientError(error: Error) {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json()
      if (typeof body?.error === 'string') return new Error(body.error)
    } catch { /* Use the transport error if the response has no JSON body. */ }
  }
  return new Error(error.message)
}

async function invokeClients(body?: CreateSystemClientParams) {
  const { data, error } = await supabase.functions.invoke<ClientsResponse>(
    'developer-clients',
    body ? { body, method: 'POST' } : { method: 'GET' },
  )

  if (error) {
    throw await clientError(error)
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
}

export async function listSystemClients() {
  const data = await invokeClients()
  return data?.clients ?? []
}

export async function createSystemClient(params: CreateSystemClientParams) {
  const data = await invokeClients(params)

  if (!data?.client) {
    throw new Error('A função não retornou o cliente criado.')
  }

  return data.client
}

export async function updateSystemClientStatus(clientId: string, status: 'ativo' | 'suspenso') {
  const { data, error } = await supabase.functions.invoke<ClientsResponse>('developer-clients', {
    body: { clientId, status },
    method: 'PATCH',
  })

  if (error) throw await clientError(error)
  if (data?.error) throw new Error(data.error)
  if (!data?.client) throw new Error('A função não retornou o cliente atualizado.')

  return data.client
}

export async function updateSystemClient(params: UpdateSystemClientParams) {
  const { data, error } = await supabase.functions.invoke<ClientsResponse>('developer-clients', {
    body: params,
    method: 'PATCH',
  })

  if (error) throw await clientError(error)
  if (data?.error) throw new Error(data.error)
  if (!data?.client) throw new Error('A função não retornou o cliente atualizado.')

  return data.client
}
