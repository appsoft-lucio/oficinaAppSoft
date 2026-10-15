import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./oficinas.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source.replace("import { supabase } from '../lib/supabase'", 'const supabase = globalThis.oficinasTestClient'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText

async function load(responses, user = { app_metadata: {} }) {
  const tables = []
  globalThis.oficinasTestClient = {
    auth: { getUser: async () => ({ data: { user } }) },
    from: (table) => {
      tables.push(table)
      const response = responses.shift()
      assert.ok(response, 'Unexpected query (possibly a duplicate workshop creation)')
      const query = { select: () => query, eq: () => query, maybeSingle: async () => response, single: async () => response,
        insert: () => { throw new Error('Unexpected workshop creation') } }
      return query
    },
  }
  const module = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${Math.random()}`)
  return { ...module, tables }
}

test('owner keeps accessing the original workshop', async () => {
  const oficina = { id: 'oficina', dono_id: 'dono' }
  const api = await load([{ data: oficina }])
  assert.deepEqual(await api.ensureUserOficina({ userId: 'dono' }), oficina)
  assert.deepEqual(api.tables, ['oficinas'])
})

test('manager resolves the linked workshop instead of creating another one', async () => {
  const oficina = { id: 'oficina', dono_id: 'dono' }
  const api = await load([{ data: null }, { data: { oficina_id: 'oficina', ativo: true } }, { data: oficina }])
  assert.deepEqual(await api.ensureUserOficina({ userId: 'gerente' }), oficina)
  assert.deepEqual(api.tables, ['oficinas', 'oficina_usuarios', 'oficinas'])
})

test('revoked manager cannot fall back to a new workshop', async () => {
  const api = await load([{ data: null }, { data: { oficina_id: 'oficina', ativo: false } }])
  await assert.rejects(api.ensureUserOficina({ userId: 'gerente' }), /desativado/)
})

test('manager with an incomplete membership cannot create a workshop', async () => {
  const api = await load([{ data: null }, { data: null }], { app_metadata: { workshop_manager: true } })
  await assert.rejects(api.ensureUserOficina({ userId: 'gerente' }), /não está vinculado/)
})
