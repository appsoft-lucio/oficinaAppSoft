import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const compile=(source) => ts.transpileModule(source,{ compilerOptions:{ module:ts.ModuleKind.ESNext } }).outputText
const moduleUrl=(source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const repasses=await import(moduleUrl(compile(await readFile(new URL('./repasses.ts',import.meta.url),'utf8'))))
globalThis.mechanicTestRepasses=repasses.calcularRepasses
const source=await readFile(new URL('./mecanicoHistorico.ts',import.meta.url),'utf8')
const compiled=compile(source.replace("import { supabase } from '../lib/supabase'",'const supabase=globalThis.mechanicHistoryClient').replace("import { calcularRepasses } from './repasses'",'const calcularRepasses=globalThis.mechanicTestRepasses'))
const load=() => import(`${moduleUrl(compiled)}#${Math.random()}`)
const servico=(changes={}) => ({ mecanico_id:'a',ordem_id:'os',vinculado:true,status:'concluida',veiculo_id:'carro',valor_servico:200,comissao_percentual:50,mecanico_ids:['a','b'],mecanico_divisao:{ a:60,b:40 },...changes })

test('separates current commissions, past work and actual receipts without counting canceled payments',async () => {
  const { resumirHistoricoMecanico }=await load()
  assert.deepEqual(resumirHistoricoMecanico([
    servico(),servico({ ordem_id:'os-2',status:'aberta' }),
    servico({ ordem_id:'os-3',vinculado:false }),servico({ ordem_id:'os-4',status:'cancelada',veiculo_id:'carro2' }),
  ],[{ valor:60,cancelado:false },{ valor:20,cancelado:true },{ valor:10.25,cancelado:false }]),{
    servicos:4,concluidos:2,emAberto:1,anteriores:1,veiculos:2,comissaoPrevista:120,recebido:70.25,pagamentos:2,
  })
})

test('does not invent historical commissions and follows the shared cents allocation',async () => {
  const { comissaoServicoMecanico }=await load()
  assert.equal(comissaoServicoMecanico(servico({ valor_servico:null,mecanico_ids:null,mecanico_divisao:null })),null)
  const item=servico({ valor_servico:0.03,mecanico_divisao:{ a:50,b:50 },comissao_percentual:100 })
  assert.equal(comissaoServicoMecanico(item),0.02)
})

test('rejects another workshop mechanic before loading any work or payments',async () => {
  const tables=[]
  globalThis.mechanicHistoryClient={ from:(table) => {
    tables.push(table)
    const query={ select:()=>query,eq:()=>query,single:async()=>({ data:null,error:new Error('not found') }) }
    return query
  } }
  const { getMecanicoHistorico }=await load()
  await assert.rejects(getMecanicoHistorico('oficina','externo'),/não encontrado/)
  assert.deepEqual(tables,['mecanicos'])
})

test('loads more than 1000 services and payments with mechanic and workshop filters',async () => {
  const calls=[]
  globalThis.mechanicHistoryClient={ from:(table) => {
    const filters=[]
    const query={
      select:()=>query,eq:(column,value)=>{filters.push([column,value]);return query},order:()=>query,
      single:async()=>({ data:{ id:'a',nome:'Mecânico' },error:null }),
      range:async(start,end)=>{
        calls.push({ table,filters,start,end })
        const count=start===0?1000:1
        return { data:Array.from({ length:count },(_,index)=>({ id:`${table}-${start+index}` })),error:null }
      },
    }
    return query
  } }
  const { getMecanicoHistorico }=await load()
  const data=await getMecanicoHistorico('oficina','a')
  assert.equal(data.servicos.length,1001)
  assert.equal(data.pagamentos.length,1001)
  for(const call of calls){
    assert.ok(call.filters.some(([key,value])=>key==='oficina_id'&&value==='oficina'))
    assert.ok(call.filters.some(([key,value])=>key==='mecanico_id'&&value==='a'))
  }
  assert.equal(calls.filter((call)=>call.start===1000).length,2)
})
