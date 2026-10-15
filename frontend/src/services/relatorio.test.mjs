import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./relatorio.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { gerarRelatorioCsv } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const ordem = {
  id: 'ordem-1', created_at: '2026-10-15T12:00:00Z', cliente_id: 'antigo', veiculo_id: 'carro',
  titulo: 'Revisão', descricao: 'Óleo; filtro "novo"\nVerificar freios', status: 'em_andamento',
  pagamento_status: 'parcial', valor_servico: 200, valor: 350, valor_pago: 100, comissao_percentual: 30,
}

test('exports the original order customer, localized statuses and separate labor and parts', () => {
  const csv = gerarRelatorioCsv('Oficina', [ordem], [{ id: 'antigo', nome: 'José' }, { id: 'novo', nome: 'Maria' }],
    [{ id: 'carro', cliente_id: 'novo', placa: 'ABC1234', modelo: 'Onix' }])
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('"José";"Onix";"ABC1234"'))
  assert.ok(csv.includes('"Em andamento";"Parcial";"200,00";"150,00";"350,00";"100,00";"30"'))
  assert.ok(csv.includes('"Óleo; filtro ""novo""\nVerificar freios"'))
})

test('neutralizes spreadsheet formulas in user-entered text', () => {
  for (const titulo of ['=1+1', '+CMD', '-CMD', '@SUM(1)', '  =1+1', '\t=1']) {
    const csv = gerarRelatorioCsv('Oficina', [{ ...ordem, titulo }], [], [])
    assert.ok(csv.includes(`"'${titulo}"`))
  }
})

test('exports a header-only report for an empty workshop', () => {
  const csv = gerarRelatorioCsv('Oficina', [], [], [])
  assert.equal(csv.split('\r\n').length, 1)
  assert.ok(csv.includes('"Mão de obra (R$)"'))
})
