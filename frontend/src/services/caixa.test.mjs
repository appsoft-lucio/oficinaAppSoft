import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./caixa.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source.replace("import { supabase } from '../lib/supabase'", 'const supabase = {}'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { resumirCaixa } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const item = (tipo, categoria, valor, cancelado = false) => ({ tipo, categoria, valor, cancelado })

test('cash result deducts paid expenses and repasses once, and treats refunds as negative revenue', () => {
  assert.deepEqual(resumirCaixa([
    item('receita','recebimento_ordem',1000), item('receita','outras_receitas',50),
    item('despesa','estorno_recebimento',200), item('despesa','aluguel',100),
    item('despesa','repasse_mecanico',300), item('despesa','pecas',500,true),
  ]), { receitas: 850, despesas: 100, repasses: 300, saldo: 450 })
})

test('uses cents and preserves negative balances and empty periods', () => {
  assert.deepEqual(resumirCaixa([]), { receitas: 0, despesas: 0, repasses: 0, saldo: 0 })
  assert.equal(resumirCaixa([item('receita','outras_receitas',0.1), item('receita','outras_receitas',0.2)]).saldo, 0.3)
  assert.equal(resumirCaixa([item('despesa','repasse_mecanico',500)]).saldo, -500)
})
