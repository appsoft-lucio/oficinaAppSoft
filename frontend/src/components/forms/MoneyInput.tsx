import type { ComponentProps } from 'react'
import { formatarReais,reaisDigitados } from '../../services/moeda'

type Props=Omit<ComponentProps<'input'>,'value'|'onChange'|'type'|'inputMode'> & {
  value:number
  onValueChange:(value:number)=>void
}

export default function MoneyInput({value,onValueChange,...props}:Props) {
  return <input {...props} type="text" inputMode="numeric" value={formatarReais(value)} onChange={(event)=>{
    const parsed=reaisDigitados(event.target.value)
    if(parsed===null)return
    onValueChange(parsed)
    const target=event.target
    requestAnimationFrame(()=>target.setSelectionRange(target.value.length,target.value.length))
  }}/>
}
