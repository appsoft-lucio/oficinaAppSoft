import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./ordens.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source.replace("import { supabase } from '../lib/supabase'", 'const supabase = globalThis.orderEditClient'), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText
async function load(client) {
  globalThis.orderEditClient = client
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${Math.random()}`)
}
const params = { ordemId: 'ordem', titulo: ' Revisão ', descricao: 'Freios', status: 'em_andamento', valor: '200,50',
  pecas: [{ descricao: ' Filtro ', quantidade: '2', valorUnitario: '50,25' }],
  mecanicoIds: ['b', 'a'], mecanicoDivisao: { a: 70, b: 30 }, comissaoPercentual: 30 }

test('edits the order and commission atomically without rewriting ownership or receipts', async () => {
  const expected = { id: 'ordem', valor: 301, valor_pago: 100, cliente_id: 'original', veiculo_id: 'original' }
  const { updateOrdem } = await load({ rpc: (name, payload) => {
    assert.equal(name, 'editar_ordem')
    assert.deepEqual(payload, { p_ordem_id: 'ordem', p_titulo: 'Revisão', p_descricao: 'Freios', p_status: 'em_andamento',
      p_valor_servico: 200.5, p_pecas: [{ descricao: 'Filtro', quantidade: 2, valor_unitario: 50.25 }],
      p_mecanico_ids: ['a', 'b'], p_mecanico_divisao: { a: 70, b: 30 }, p_comissao_percentual: 30 })
    return { single: async () => ({ data: expected, error: null }) }
  } })
  assert.deepEqual(await updateOrdem(params), expected)
})

test('rejects invalid amounts, parts and commission before sending changes', async () => {
  const { updateOrdem } = await load({ rpc: () => { throw new Error('Unexpected database write') } })
  for (const override of [{ valor: '-1' }, { valor: 'abc' }, { titulo: ' ' }, { comissaoPercentual: 0 },
    { comissaoPercentual: 101 }, { comissaoPercentual: 1.5 },
    { pecas: [{ descricao: 'Peça', quantidade: '0', valorUnitario: '1' }] },
    { pecas: [{ descricao: 'Peça', quantidade: '1', valorUnitario: '-1' }] }]) {
    await assert.rejects(updateOrdem({ ...params, ...override }), (error) => error.message !== 'Unexpected database write')
  }
})

test('returns the database rejection without attempting a partial update', async () => {
  const expected = { message: 'O novo total é menor que o valor já recebido.' }
  const { updateOrdem } = await load({ rpc: () => ({ single: async () => ({ data: null, error: expected }) }) })
  await assert.rejects(updateOrdem(params), (error) => error === expected)
})

test('saves arrival and other changes in a single transactional RPC', async () => {
  const entradaEm = '2026-10-16T11:30:00.000Z'
  const { updateOrdem } = await load({ rpc: (name,payload) => {
    assert.equal(name,'editar_ordem_com_entrada')
    assert.equal(payload.p_entrada_em,entradaEm)
    return { single: async () => ({ data: { id:'ordem',entrada_em:entradaEm }, error:null }) }
  } })
  assert.equal((await updateOrdem({ ...params,entradaEm })).entrada_em,entradaEm)
})

test('rejects an invalid arrival date before sending changes', async () => {
  const { updateOrdem } = await load({ rpc: () => { throw new Error('Unexpected database write') } })
  await assert.rejects(updateOrdem({ ...params,entradaEm:'invalid' }),/data e hora/)
})
