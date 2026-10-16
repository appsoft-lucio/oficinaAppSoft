import { useEffect,useState } from 'react'
import { getFotoProdutoUrl } from '../../services/estoque'

export default function ProdutoFoto({path,nome}:{path:string|null;nome:string}) {
  const [url,setUrl]=useState('')
  const [failed,setFailed]=useState(false)
  const [retry,setRetry]=useState(0)
  useEffect(()=>{
    let active=true
    setUrl('');setFailed(false)
    if(path) getFotoProdutoUrl(path).then((value)=>{if(active)setUrl(value)}).catch(()=>{if(active)setFailed(true)})
    return ()=>{active=false}
  },[path,retry])
  return <div className="grid h-40 place-items-center overflow-hidden rounded-lg bg-slate-50 text-xs text-slate-500">
    {failed?<button type="button" onClick={()=>setRetry((current)=>current+1)} className="px-4 py-3 underline">Foto indisponível · tentar novamente</button>:url?<img src={url} alt={nome} loading="lazy" className="h-full w-full object-contain" onError={()=>setFailed(true)}/>:path?'Carregando foto...':'Sem foto'}
  </div>
}
