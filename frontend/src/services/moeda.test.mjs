import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source=await readFile(new URL('./moeda.ts',import.meta.url),'utf8')
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText
const {formatarReais,reaisDigitados}=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('digits represent cents and formatted or pasted values preserve the saved price',()=>{
  for(const [digits,value] of [['1',0.01],['12',0.12],['123',1.23],['2590',25.9],['123456',1234.56],['',0]]){
    assert.equal(reaisDigitados(digits),value)
    assert.equal(reaisDigitados(formatarReais(value)),value)
  }
  assert.equal(reaisDigitados('R$ 1.234,56'),1234.56)
  assert.equal(reaisDigitados('00002590'),25.9)
})

test('rejects negative or excessive prices without truncating them',()=>{
  assert.equal(reaisDigitados('-100'),null)
  assert.equal(reaisDigitados('9999999999999'),null)
  assert.equal(reaisDigitados('999999999999'),9999999999.99)
})

test('typing 123 shifts cents automatically from 00,00 to 01,23',()=>{
  const display=(value)=>formatarReais(value).replace(/\s/g,' ')
  let formatted=display(0)
  assert.equal(formatted,'R$ 00,00')
  for(const [key,expected] of [['1','R$ 00,01'],['2','R$ 00,12'],['3','R$ 01,23'],['4','R$ 12,34']]){
    formatted=display(reaisDigitados(formatted+key))
    assert.equal(formatted,expected)
  }
  formatted=display(reaisDigitados(formatted.slice(0,-1)))
  assert.equal(formatted,'R$ 01,23')
})
