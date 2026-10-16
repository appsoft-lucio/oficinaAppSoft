import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('./ordemHistorico.ts',import.meta.url),'utf8')
const compiled = ts.transpileModule(source.replace("import { supabase } from '../lib/supabase'",'const supabase = {}'),{ compilerOptions:{ module:ts.ModuleKind.ESNext } }).outputText
const { toDateTimeInput,formatOrdemDate } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('arrival input preserves local calendar time including seconds', () => {
  const date = new Date(2026,9,16,8,35,42)
  assert.equal(toDateTimeInput(date),'2026-10-16T08:35:42')
  assert.equal(new Date(toDateTimeInput(date)).getTime(),date.getTime())
  assert.equal(toDateTimeInput('invalid'),'')
})

test('unknown old arrivals remain unknown', () => {
  assert.equal(formatOrdemDate(null),'Não informada')
  assert.equal(formatOrdemDate(undefined),'Não informada')
})
