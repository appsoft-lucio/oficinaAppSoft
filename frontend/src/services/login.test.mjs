import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./login.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source.replace("import { supabase } from '../lib/supabase'", 'const supabase = globalThis.loginTestClient'), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText

async function load(client) {
  globalThis.loginTestClient = client
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${Math.random()}`)
}

test('email login trims the address and preserves the password', async () => {
  const expected = { data: { user: { id: '1' } }, error: null }
  const { loginWithIdentifier } = await load({ auth: {
    signInWithPassword: async (credentials) => {
      assert.deepEqual(credentials, { email: 'user@example.com', password: ' pass ' })
      return expected
    },
  } })
  assert.equal(await loginWithIdentifier(' user@example.com ', ' pass '), expected)
})

test('username login normalizes the identifier and installs the returned session', async () => {
  const expected = { data: { user: { id: '1' } }, error: null }
  const tokens = { access_token: 'access', refresh_token: 'refresh' }
  const { loginWithIdentifier } = await load({
    functions: { invoke: async (name, options) => {
      assert.equal(name, 'username-login')
      assert.deepEqual(options.body, { username: 'lucio_dev', password: ' pass ' })
      return { data: tokens, error: null }
    } },
    auth: { setSession: async (session) => { assert.deepEqual(session, tokens); return expected } },
  })
  assert.equal(await loginWithIdentifier(' LUCIO_DEV ', ' pass '), expected)
})

test('failed or malformed responses never create a session', async () => {
  for (const response of [{ data: null, error: new Error('unauthorized') }, { data: {}, error: null }]) {
    const { loginWithIdentifier } = await load({ functions: { invoke: async () => response } })
    const result = await loginWithIdentifier('unknown', 'wrong')
    assert.equal(result.data.user, null)
    assert.equal(result.error.code, 'invalid_credentials')
  }
})
