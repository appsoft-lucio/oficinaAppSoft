export function formatarReais(value:number) {
  return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumIntegerDigits:2,minimumFractionDigits:2,maximumFractionDigits:2})
}

export function reaisDigitados(value:string):number|null {
  if(value.includes('-'))return null
  const digits=value.replace(/\D/g,'').replace(/^0+/,'')
  if(digits.length>12)return null
  return Number(digits||'0')/100
}
