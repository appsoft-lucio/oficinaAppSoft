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
  assert.deepEqual(calcularRepasses(1000, ['b', 'a'], { a: 70, b: 30 }, 50), [
    { mecanicoId: 'a', valor: 350 }, { mecanicoId: 'b', valor: 150 },
  ])
})

test('rounding preserves the total commission and does not depend on selection order', () => {
  const shares = { a: 34, b: 33, c: 33 }
  const result = calcularRepasses(0.07, ['c', 'a', 'b'], shares, 50)
  assert.equal(result.reduce((sum, item) => sum + Math.round(item.valor * 100), 0), 4)
  assert.deepEqual(result, calcularRepasses(0.07, ['a', 'b', 'c'], shares, 50))
})

test('rejects incomplete, invalid, and non-totaling divisions', () => {
  for (const shares of [{ a: 50 }, { a: 0, b: 100 }, { a: 60, b: 60 }, { a: 50.5, b: 49.5 }]) {
    assert.deepEqual(calcularRepasses(100, ['a', 'b'], shares, 50), [])
  }
  assert.deepEqual(calcularRepasses(100, [], {}, 50), [])
})

test('uses the manager percentage including both boundaries', () => {
  for (const percentual of [1, 30, 75, 100]) {
    assert.deepEqual(calcularRepasses(1000, ['a'], { a: 100 }, percentual), [
      { mecanicoId: 'a', valor: 10 * percentual },
    ])
  }
  assert.deepEqual(calcularRepasses(1000, ['a', 'b'], { a: 70, b: 30 }, 30), [
    { mecanicoId: 'a', valor: 210 }, { mecanicoId: 'b', valor: 90 },
  ])
})

test('rejects percentages outside the allowed integer range', () => {
  for (const percentual of [0, -1, 101, 1.5, NaN, Infinity, undefined]) {
    assert.deepEqual(calcularRepasses(100, ['a'], { a: 100 }, percentual), [])
  }
})
