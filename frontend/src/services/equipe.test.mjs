import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../../../supabase/functions/workshop-users/index.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source.replace("import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'", 'const createClient = globalThis.managerCreateClient'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const payload = { oficinaId: 'oficina', nome: 'Lucas', email: 'lucas@example.com', username: 'lucas_gerente', password: 'Senha-inicial-123' }

async function setup({ owner = true, linkError = null, createError = null } = {}) {
  let handler
  const calls = { created: [], deleted: [], links: [] }
  globalThis.Deno = { env: { get: (key) => key }, serve: (fn) => { handler = fn } }
  globalThis.managerCreateClient = (_url, key) => key === 'SUPABASE_ANON_KEY'
    ? { auth: { getUser: async () => ({ data: { user: { id: 'dono' } } }) } }
    : {
      auth: { admin: {
        createUser: async (data) => { calls.created.push(data); return { data: { user: createError ? null : { id: 'novo-gerente' } }, error: createError } },
        deleteUser: async (id) => { calls.deleted.push(id); return {} },
      } },
      from: (table) => {
        if (table === 'oficina_usuarios') return { insert: async (data) => { calls.links.push(data); return { error: linkError } } }
        assert.equal(table, 'oficinas')
        const query = { select: () => query, eq: (column, value) => {
          if (column === 'dono_id') assert.equal(value, 'dono')
          return query
        }, maybeSingle: async () => ({ data: owner ? { id: 'oficina', status: 'ativo', trial_ends_at: null } : null }) }
        return query
      },
    }
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${Math.random()}`)
  return { calls, request: (body = payload) => handler(new Request('https://example.com/workshop-users', {
    method: 'POST', headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })) }
}

test('non-owner cannot create manager accounts', async () => {
  const api = await setup({ owner: false })
  assert.equal((await api.request()).status, 403)
  assert.equal(api.calls.created.length, 0)
})

test('owner creates a separate manager and links only to the validated workshop', async () => {
  const api = await setup()
  assert.equal((await api.request()).status, 200)
  assert.equal(api.calls.created[0].user_metadata.username, 'lucas_gerente')
  assert.equal(api.calls.created[0].app_metadata.workshop_manager, true)
  assert.deepEqual(api.calls.links, [{ user_id: 'novo-gerente', oficina_id: 'oficina', nome: 'Lucas', email: 'lucas@example.com' }])
})

test('invalid credentials and duplicate accounts do not create memberships', async () => {
  const invalid = await setup()
  assert.equal((await invalid.request({ ...payload, password: 'short' })).status, 400)
  assert.equal(invalid.calls.created.length, 0)
  const duplicate = await setup({ createError: new Error('duplicate') })
  assert.equal((await duplicate.request()).status, 409)
  assert.equal(duplicate.calls.links.length, 0)
})

test('failed membership rolls back the new auth account', async () => {
  const api = await setup({ linkError: new Error('database unavailable') })
  assert.equal((await api.request()).status, 500)
  assert.deepEqual(api.calls.deleted, ['novo-gerente'])
})
