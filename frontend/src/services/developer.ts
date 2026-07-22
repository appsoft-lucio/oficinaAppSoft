import { supabase } from '../lib/supabase'

export type SystemClient = {
  id: string
  nome: string
  ownerEmail: string
  ownerName: string
  status: string
  createdAt: string
}

export type CreateSystemClientParams = {
  email: string
  ownerName: string
  password: string
  workshopName: string
}

type ClientsResponse = {
  clients?: SystemClient[]
  client?: SystemClient
  error?: string
}

async function invokeClients(body?: CreateSystemClientParams) {
  const { data, error } = await supabase.functions.invoke<ClientsResponse>(
    'developer-clients',
    body ? { body, method: 'POST' } : { method: 'GET' },
  )

  if (error) {
    throw new Error(error.message)
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
