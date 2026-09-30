import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../../../supabase/functions/developer-clients/index.ts', import.meta.url), 'utf8')
const code = ts.transpileModule(source.replace(/^import [^\n]*\n/, ''), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None, moduleDetection: ts.ModuleDetectionKind.Legacy },
}).outputText

function handlerFor(admin) {
  let handler
  const userClient = { auth: { getUser: async () => ({ data: { user: { id: 'admin' } } }) } }
  new Function('createClient', 'Deno', code)(
    (_url, key) => key === 'SUPABASE_SERVICE_ROLE_KEY' ? admin : userClient,
    { env: { get: (key) => key }, serve: (callback) => { handler = callback } },
  )
  return handler
}

function adminMock(existing) {
  const created = []
  return {
    created,
    auth: { admin: { createUser: async (input) => {
      created.push(input)
      return { data: { user: { id: 'new-owner' } } }
    } } },
    from: (table) => {
      const query = {
        select: () => query, eq: () => query, insert: () => query,
        maybeSingle: async () => ({ data: table === 'app_admins' ? { user_id: 'admin' } : existing }),
        single: async () => ({ data: { id: 'workshop', nome: 'Oficina', status: 'ativo' } }),
      }
      return query
    },
  }
}

function request(username) {
  return new Request('https://example.test', {
    method: 'POST', headers: { Authorization: 'Bearer test', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email: 'client@example.com', ownerName: 'Cliente', workshopName: 'Oficina', password: 'password123' }),
  })
}

test('invalid username is rejected before creating an account', async () => {
  const admin = adminMock(null)
  const response = await handlerFor(admin)(request('invalid name'))
  assert.equal(response.status, 400)
  assert.equal(admin.created.length, 0)
})

test('duplicate username is rejected before creating an account', async () => {
  const admin = adminMock({ user_id: 'another-owner' })
  assert.equal((await handlerFor(admin)(request('client'))).status, 409)
  assert.equal(admin.created.length, 0)
})

test('new username is normalized and saved in auth metadata', async () => {
  const admin = adminMock(null)
  const response = await handlerFor(admin)(request(' CLIENT_1 '))
  assert.equal(response.status, 201)
  assert.equal(admin.created[0].user_metadata.username, 'client_1')
  assert.equal((await response.json()).client.username, 'client_1')
})
