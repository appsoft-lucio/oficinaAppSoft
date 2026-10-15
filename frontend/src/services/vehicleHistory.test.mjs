import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./vehicleHistory.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source
  .replace("import { supabase } from '../lib/supabase'", 'const supabase = globalThis.historyClient')
  .replace(/import .* from '\.\/ordens'/, 'const listOrdens = globalThis.historyListOrdens')
  .replace(/import .* from '\.\/veiculos'/, 'const listVeiculos = globalThis.historyListVeiculos'), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText

async function load({ client, veiculos = [], ordens = [] } = {}) {
  globalThis.historyClient = client
  globalThis.historyListVeiculos = async () => veiculos
  globalThis.historyListOrdens = async () => ordens
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${Math.random()}`)
}

test('detects the same plate across formatting and never matches blank plates', async () => {
  const veiculo = { id: 'v1', placa: 'abc-1234', cliente_id: 'anterior' }
  const api = await load({ veiculos: [veiculo] })
  assert.equal(api.normalizarPlaca(' abC-1234 '), 'ABC1234')
  assert.deepEqual(await api.buscarVeiculoDuplicado('oficina', 'ABC 1234'), veiculo)
  assert.equal(await api.buscarVeiculoDuplicado('oficina', ''), null)
  assert.equal(await api.buscarVeiculoDuplicado('oficina', 'XYZ9876'), null)
})

test('rejects ambiguous existing duplicates instead of choosing an arbitrary history', async () => {
  const api = await load({ veiculos: [{ placa: 'ABC1234' }, { placa: 'abc-1234' }] })
  await assert.rejects(api.buscarVeiculoDuplicado('oficina', 'ABC1234'), /vários cadastros/)
})

test('warns for open services and unpaid completed services but not canceled orders', async () => {
  const api = await load()
  const ordem = { veiculo_id: 'v1', status: 'concluida', pagamento_status: 'pago' }
  const abertas = [
    { ...ordem, id: 'aberta', status: 'aberta' },
    { ...ordem, id: 'aguardando', status: 'aguardando_peca' },
    { ...ordem, id: 'parcial', pagamento_status: 'parcial' },
  ]
  assert.deepEqual(api.ordensPendentes([...abertas,
    { ...ordem, id: 'paga' }, { ...ordem, id: 'cancelada', status: 'cancelada', pagamento_status: 'em_aberto' },
    { ...ordem, id: 'outro', veiculo_id: 'v2', status: 'aberta' },
  ], 'v1'), abertas)
})

test('confirmation sends the original owner and exact pending order set to the transaction', async () => {
  const veiculo = { id: 'v1', cliente_id: 'anterior' }
  const api = await load({ client: { rpc: (name, params) => ({ single: async () => {
    assert.equal(name, 'transferir_veiculo')
    assert.deepEqual(params, { p_veiculo_id: 'v1', p_cliente_id: 'novo', p_cliente_anterior_id: 'anterior', p_ordens_pendentes: ['a', 'b'], p_confirmado: true })
    return { data: { ...veiculo, cliente_id: 'novo' }, error: null }
  } }) } })
  assert.equal((await api.transferirVeiculo(veiculo, 'novo', [{ id: 'b' }, { id: 'a' }])).cliente_id, 'novo')
})
