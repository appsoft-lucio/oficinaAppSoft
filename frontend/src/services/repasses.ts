// Work in cents so the shares add up to the commission chosen for this order.
export function calcularRepasses(valorServico: number, mecanicoIds: string[], divisao: Record<string, number>, comissaoPercentual: number) {
  const ids = [...new Set(mecanicoIds)].sort()
  if (!ids.length || !Number.isFinite(valorServico) || valorServico < 0) return []
  if (!Number.isInteger(comissaoPercentual) || comissaoPercentual < 1 || comissaoPercentual > 100) return []
  const totalCentavos = Math.round(Math.round(valorServico * 100) * comissaoPercentual / 100)
  if (ids.some((id) => !Number.isInteger(divisao[id]) || divisao[id] <= 0 || divisao[id] > 100)
    || ids.reduce((sum, id) => sum + divisao[id], 0) !== 100) return []
  const cotas = ids.map((id) => totalCentavos * divisao[id] / 100)
  const centavos = cotas.map(Math.floor)
  const resto = totalCentavos - centavos.reduce((sum, value) => sum + value, 0)
  const prioridades = ids.map((_, index) => index).sort((a, b) =>
    (cotas[b] - centavos[b]) - (cotas[a] - centavos[a]) || a - b)
  for (const index of prioridades.slice(0, resto)) centavos[index] += 1
  return ids.map((mecanicoId, index) => ({
    mecanicoId,
    valor: centavos[index] / 100,
  }))
}
