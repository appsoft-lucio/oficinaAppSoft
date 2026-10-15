import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./repasses.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText
const { calcularRepasses } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('allocates half of labor using the individual percentages', () => {
  assert.deepEqual(calcularRepasses(1000, ['b', 'a'], { a: 70, b: 30 }), [
    { mecanicoId: 'a', valor: 350 }, { mecanicoId: 'b', valor: 150 },
  ])
})

test('rounding preserves the total commission and does not depend on selection order', () => {
  const shares = { a: 34, b: 33, c: 33 }
  const result = calcularRepasses(0.07, ['c', 'a', 'b'], shares)
  assert.equal(result.reduce((sum, item) => sum + Math.round(item.valor * 100), 0), 4)
  assert.deepEqual(result, calcularRepasses(0.07, ['a', 'b', 'c'], shares))
})

test('rejects incomplete, invalid, and non-totaling divisions', () => {
  for (const shares of [{ a: 50 }, { a: 0, b: 100 }, { a: 60, b: 60 }, { a: 50.5, b: 49.5 }]) {
    assert.deepEqual(calcularRepasses(100, ['a', 'b'], shares), [])
  }
  assert.deepEqual(calcularRepasses(100, [], {}), [])
})
