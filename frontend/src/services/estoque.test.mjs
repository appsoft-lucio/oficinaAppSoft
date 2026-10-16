import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source=await readFile(new URL('./estoque.ts',import.meta.url),'utf8')
const compiled=ts.transpileModule(source.replace("import { supabase } from '../lib/supabase'",'const supabase=globalThis.inventoryTestClient'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText
async function load(client={}){
  globalThis.inventoryTestClient=client
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${Math.random()}`)
}

test('accepts Brazilian quantities and prices and rejects negative or overly precise inputs',async()=>{
  const {numeroEstoque}=await load()
  assert.equal(numeroEstoque('1,125'),1.125)
  assert.equal(numeroEstoque('25.90',2),25.9)
  assert.equal(numeroEstoque('0'),0)
  for(const value of ['','-1','NaN','1e3','1,1234','1.2.3','9999999999999'])assert.throws(()=>numeroEstoque(value))
  assert.throws(()=>numeroEstoque('1,125',2))
})

test('creates a product and initial balance in one RPC and normalizes its serial code',async()=>{
  const {saveProduto}=await load({rpc:(name,args)=>{
    assert.equal(name,'cadastrar_produto');assert.equal(args.p_quantidade,5);assert.equal(args.p_codigo_serie,'ABC123')
    assert.equal(args.p_oficina_id,'oficina');assert.equal(args.p_id,'produto')
    return {single:async()=>({data:{id:'produto',quantidade:5},error:null})}
  }})
  const result=await saveProduto('oficina','produto',{nome:' Filtro ',descricao:'',codigo_serie:' abc123 ',preco:25,estoque_minimo:1,foto_path:null},5)
  assert.equal(result.quantidade,5)
})

test('movement uses the atomic server operation and preserves insufficient stock errors',async()=>{
  const expected={message:'Estoque insuficiente para esta saída'}
  const {movimentarEstoque}=await load({rpc:(name,args)=>{
    assert.equal(name,'movimentar_estoque');assert.equal(args.p_tipo,'saida');assert.equal(args.p_quantidade,2)
    return {single:async()=>({data:null,error:expected})}
  }})
  await assert.rejects(movimentarEstoque('produto','saida',2,' Uso na OS '),(error)=>error===expected)
})

test('allows adjustment to zero, but rejects zero exits and invalid photos',async()=>{
  const {movimentarEstoque,validarFotoProduto}=await load({rpc:()=>({single:async()=>({data:{quantidade:0},error:null})})})
  assert.equal((await movimentarEstoque('produto','ajuste',0,'Contagem')).quantidade,0)
  await assert.rejects(movimentarEstoque('produto','saida',0,'Saída'),/quantidade/)
  validarFotoProduto({type:'image/png',size:1024})
  for(const file of [{type:'image/svg+xml',size:1024},{type:'image/jpeg',size:201*1024},{type:'image/webp',size:0}])assert.throws(()=>validarFotoProduto(file),/200 KB/)
})

test('inventory reads all product pages and filters by workshop',async()=>{
  const offsets=[]
  const {listProdutos}=await load({from:(table)=>{
    assert.equal(table,'produtos')
    const query={select:()=>query,eq:(column,value)=>{assert.equal(column,'oficina_id');assert.equal(value,'oficina');return query},order:()=>query,
      range:async(start)=>{offsets.push(start);return {data:Array.from({length:start?1:1000},(_,index)=>({id:String(start+index)})),error:null}}}
    return query
  }})
  assert.equal((await listProdutos('oficina')).length,1001)
  assert.deepEqual(offsets,[0,1000])
})

async function withPhotoBrowser(options,run){
  const previousImage=globalThis.Image,previousDocument=globalThis.document
  const calls=[]
  const context={clearRect(){},fillRect(){},drawImage(){},fillStyle:''}
  const canvas={width:0,height:0,getContext:()=>context,toBlob(callback,type,quality){
    calls.push({type,quality,width:this.width,height:this.height})
    const bytes=options.sizes?.[calls.length-1]??(100*1024)
    callback(new Blob([new Uint8Array(bytes)],{type:options.noWebp&&type==='image/webp'?'image/png':type}))
  }}
  globalThis.Image=class{
    naturalWidth=options.width??3000;naturalHeight=options.height??2000
    set src(_value){queueMicrotask(()=>this.onload())}
  }
  globalThis.document={createElement:()=>canvas}
  try{await run(calls)}finally{
    if(previousImage===undefined)delete globalThis.Image;else globalThis.Image=previousImage
    if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument
  }
}

test('reduces a photo below 200 KB while preserving its aspect ratio',async()=>{
  const {prepararFotoProduto}=await load()
  await withPhotoBrowser({sizes:[220*1024,190*1024]},async(calls)=>{
    const result=await prepararFotoProduto(new File([new Uint8Array(300*1024)],'foto.png',{type:'image/png'}))
    assert.equal(result.type,'image/webp')
    assert.equal(result.name,'foto.webp')
    assert.equal(result.size,190*1024)
    assert.deepEqual(calls.map(({width,height})=>[width,height]),[[600,400],[600,400]])
    assert.deepEqual(calls.map(({quality})=>quality),[0.8,0.7])
  })
})

test('keeps an already small photo and falls back to JPEG when WebP is unsupported',async()=>{
  const {prepararFotoProduto}=await load()
  await withPhotoBrowser({width:400,height:300},async(calls)=>{
    const file=new File([new Uint8Array(50*1024)],'pequena.png',{type:'image/png'})
    assert.equal(await prepararFotoProduto(file),file)
    assert.equal(calls.length,0)
  })
  await withPhotoBrowser({noWebp:true},async(calls)=>{
    const file=new File([new Uint8Array(300*1024)],'grande.png',{type:'image/png'})
    const result=await prepararFotoProduto(file)
    assert.equal(result.type,'image/jpeg')
    assert.equal(result.name,'grande.jpg')
    assert.deepEqual(calls.map(({type})=>type),['image/webp','image/jpeg'])
  })
})
