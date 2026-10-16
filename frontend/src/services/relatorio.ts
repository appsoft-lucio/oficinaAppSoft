import type { Cliente } from './clientes'
import type { OrdemServico } from './ordens'
import type { Veiculo } from './veiculos'

const labels: Record<string, string> = {
  aberta: 'Aberta', em_andamento: 'Em andamento', aguardando_peca: 'Aguardando peça',
  concluida: 'Concluída', cancelada: 'Cancelada', em_aberto: 'Em aberto', parcial: 'Parcial', pago: 'Pago',
}

function cell(value: string | number) {
  let text = String(value)
  // Prevent customer-entered text from being interpreted as a spreadsheet formula.
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function gerarRelatorioCsv(oficina: string, ordens: OrdemServico[], clientes: Cliente[], veiculos: Veiculo[]) {
  const clientesById = new Map(clientes.map((cliente) => [cliente.id, cliente.nome]))
  const veiculosById = new Map(veiculos.map((veiculo) => [veiculo.id, veiculo]))
  const money = (value: number) => Number(value).toFixed(2).replace('.', ',')
  const rows: (string | number)[][] = [
    ['Oficina', 'Ordem', 'Abertura', 'Entrada do veículo', 'Cliente', 'Veículo', 'Placa', 'Serviço', 'Descrição', 'Status', 'Pagamento', 'Mão de obra (R$)', 'Peças (R$)', 'Total (R$)', 'Recebido (R$)', 'Comissão (%)'],
    ...ordens.map((ordem) => {
      const veiculo = veiculosById.get(ordem.veiculo_id ?? '')
      return [oficina, ordem.id, new Date(ordem.created_at).toLocaleString('pt-BR'), ordem.entrada_em ? new Date(ordem.entrada_em).toLocaleString('pt-BR') : 'Não informada',
        clientesById.get(ordem.cliente_id ?? '') ?? 'Cliente não informado',
        veiculo?.modelo ?? 'Veículo não informado', veiculo?.placa ?? '', ordem.titulo, ordem.descricao ?? '',
        labels[ordem.status] ?? ordem.status, labels[ordem.pagamento_status] ?? ordem.pagamento_status,
        money(ordem.valor_servico), money(Number(ordem.valor) - Number(ordem.valor_servico)),
        money(ordem.valor), money(ordem.valor_pago), ordem.comissao_percentual]
    }),
  ]
  return '\uFEFF' + rows.map((row) => row.map(cell).join(';')).join('\r\n')
}
