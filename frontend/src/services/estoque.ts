import { supabase } from '../lib/supabase'
import type { AutoriaRegistro } from './equipe'

export type Produto=AutoriaRegistro & {
  id:string;nome:string;descricao:string|null;codigo_serie:string|null;preco:number;quantidade:number
  estoque_minimo:number;foto_path:string|null;created_at:string
}
export type ProdutoInput={ nome:string;descricao:string;codigo_serie:string;preco:number;estoque_minimo:number;foto_path:string|null }
export type MovimentoEstoque=Pick<AutoriaRegistro,'criado_por'> & {
  id:string;tipo:'saldo_inicial'|'entrada'|'saida'|'ajuste';quantidade:number;saldo_antes:number;saldo_depois:number;motivo:string;created_at:string
}
export const bucketEstoque='estoque-produtos'
const produtoSelect='id,nome,descricao,codigo_serie,preco,quantidade,estoque_minimo,foto_path,created_at,criado_por,alterado_por,alterado_em'

export function numeroEstoque(value:string,decimais=3) {
  const input=value.trim()
  if(!new RegExp(`^\\d+(?:[.,]\\d{1,${decimais}})?$`).test(input)) throw new Error(`Informe um número maior ou igual a zero, com até ${decimais} casas decimais.`)
  const result=Number(input.replace(',','.'))
  if(!Number.isFinite(result)||result>(decimais===2?9999999999.99:999999999.999)) throw new Error('O valor informado ultrapassa o limite permitido.')
  return result
}
export async function listProdutos(oficinaId:string) {
  const all:Produto[]=[]
  for(let offset=0;;offset+=1000){
    const {data,error}=await supabase.from('produtos').select(produtoSelect).eq('oficina_id',oficinaId).order('nome').order('id').range(offset,offset+999)
    if(error) throw error
    all.push(...data as Produto[])
    if(data.length<1000) return all
  }
}
export async function saveProduto(oficinaId:string,id:string,input:ProdutoInput,quantidadeInicial?:number) {
  if(!input.nome.trim()||!Number.isFinite(input.preco)||input.preco<0||!Number.isFinite(input.estoque_minimo)||input.estoque_minimo<0) throw new Error('Confira o nome, o preço e o estoque mínimo.')
  const payload={...input,nome:input.nome.trim(),descricao:input.descricao.trim()||null,codigo_serie:input.codigo_serie.trim().toUpperCase()||null}
  if(quantidadeInicial!==undefined){
    if(!Number.isFinite(quantidadeInicial)||quantidadeInicial<0) throw new Error('Informe uma quantidade inicial válida.')
    const {data,error}=await supabase.rpc('cadastrar_produto',{
      p_oficina_id:oficinaId,p_id:id,p_nome:payload.nome,p_descricao:payload.descricao,p_codigo_serie:payload.codigo_serie,
      p_preco:payload.preco,p_quantidade:quantidadeInicial,p_estoque_minimo:payload.estoque_minimo,p_foto_path:payload.foto_path,
    }).single()
    if(error) throw error
    return data as Produto
  }
  const {data,error}=await supabase.from('produtos').update(payload).eq('id',id).eq('oficina_id',oficinaId).select(produtoSelect).single()
  if(error) throw error
  return data as Produto
}
export async function movimentarEstoque(produtoId:string,tipo:'entrada'|'saida'|'ajuste',quantidade:number,motivo:string) {
  if(!Number.isFinite(quantidade)||quantidade<0||(tipo!=='ajuste'&&quantidade===0)||motivo.trim().length<3) throw new Error('Informe uma quantidade válida e um motivo com pelo menos 3 caracteres.')
  const {data,error}=await supabase.rpc('movimentar_estoque',{
    p_produto_id:produtoId,p_tipo:tipo,p_quantidade:quantidade,p_motivo:motivo.trim(),
  }).single()
  if(error) throw error
  return data as Produto
}
export async function listEstoqueMovimentos(produtoId:string,before?:Pick<MovimentoEstoque,'created_at'|'id'>) {
  let query=supabase.from('estoque_movimentos').select('id,tipo,quantidade,saldo_antes,saldo_depois,motivo,created_at,criado_por')
    .eq('produto_id',produtoId).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(50)
  if(before) query=query.or(`created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id})`)
  const {data,error}=await query
  if(error) throw error
  return data as MovimentoEstoque[]
}
export function validarFotoProduto(file:Pick<File,'type'|'size'>,verificarTamanho=true) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size<=0||(verificarTamanho&&file.size>200*1024)) throw new Error('Escolha uma foto JPG, PNG ou WebP. A versão preparada deve ter até 200 KB.')
}
export async function prepararFotoProduto(file:File):Promise<File> {
  validarFotoProduto(file,false)
  const url=URL.createObjectURL(file)
  try{
    const imagem=new Image()
    await new Promise<void>((resolve,reject)=>{
      imagem.onload=()=>resolve()
      imagem.onerror=()=>reject(new Error('Não foi possível ler a foto. Escolha outra imagem.'))
      imagem.src=url
    })
    const canvas=document.createElement('canvas')
    const contexto=canvas.getContext('2d')
    if(!contexto)throw new Error('Não foi possível ajustar a foto neste navegador.')
    const maiorLado=Math.max(imagem.naturalWidth,imagem.naturalHeight)
    if(!maiorLado)throw new Error('Não foi possível ler as dimensões da foto.')
    if(file.size<=200*1024&&maiorLado<=600)return file
    let escala=Math.min(1,600/maiorLado)
    for(let tentativa=0;tentativa<8;tentativa++){
      canvas.width=Math.max(1,Math.round(imagem.naturalWidth*escala))
      canvas.height=Math.max(1,Math.round(imagem.naturalHeight*escala))
      contexto.clearRect(0,0,canvas.width,canvas.height)
      contexto.drawImage(imagem,0,0,canvas.width,canvas.height)
      const qualidade=tentativa%2===0?0.8:0.7
      let blob=await new Promise<Blob|null>((resolve)=>canvas.toBlob(resolve,'image/webp',qualidade))
      if(blob&&blob.type!=='image/webp'){
        contexto.fillStyle='#ffffff'
        contexto.fillRect(0,0,canvas.width,canvas.height)
        contexto.drawImage(imagem,0,0,canvas.width,canvas.height)
        blob=await new Promise<Blob|null>((resolve)=>canvas.toBlob(resolve,'image/jpeg',qualidade))
      }
      if(!blob)throw new Error('Não foi possível ajustar a foto. Escolha outra imagem.')
      if(blob.size>0&&blob.size<=200*1024){
        const ext=blob.type==='image/webp'?'webp':'jpg'
        const ajustada=new File([blob],`${file.name.replace(/\.[^.]+$/,'')}.${ext}`,{type:blob.type,lastModified:file.lastModified})
        validarFotoProduto(ajustada)
        return ajustada
      }
      if(tentativa%2===1)escala*=0.8
    }
    throw new Error('Não foi possível reduzir a foto para até 200 KB. Escolha outra imagem.')
  }finally{URL.revokeObjectURL(url)}
}
export async function uploadFotoProduto(oficinaId:string,produtoId:string,file:File) {
  file=await prepararFotoProduto(file)
  validarFotoProduto(file)
  const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'} as Record<string,string>)[file.type]
  const path=`${oficinaId}/${produtoId}/${crypto.randomUUID()}.${ext}`
  const {error}=await supabase.storage.from(bucketEstoque).upload(path,file,{upsert:false,contentType:file.type})
  if(error) throw error
  return path
}
export async function getFotoProdutoUrl(path:string) {
  const {data,error}=await supabase.storage.from(bucketEstoque).createSignedUrl(path,3600)
  if(error) throw error
  return data.signedUrl
}
export async function removeFotoProduto(path:string) {
  return supabase.storage.from(bucketEstoque).remove([path])
}
export function erroEstoque(error:unknown) {
  if(error&&typeof error==='object'&&'code' in error&&error.code==='23505') return 'Já existe um produto com este código ou número de série nesta oficina.'
  if(error&&typeof error==='object'&&'message' in error&&typeof error.message==='string') return error.message
  return 'Não foi possível concluir a operação. Confira a conexão e tente novamente.'
}
