import { listClientes } from './clientes'
import { listOrdens } from './ordens'
import { listVeiculos } from './veiculos'

export async function getDashboardData(oficinaId: string) {
  const [clientes, veiculos, ordens] = await Promise.all([
    listClientes(oficinaId),
    listVeiculos(oficinaId),
    listOrdens(oficinaId),
  ])

  const receitaTotal = ordens.reduce((total, ordem) => total + Number(ordem.valor), 0)
  const ordensAbertas = ordens.filter((ordem) => ordem.status !== 'concluida').length

  return {
    clientes,
    ordens,
    summary: [
      {
        detail: `${ordensAbertas} em aberto`,
        label: 'Ordens',
        value: String(ordens.length),
      },
      {
        detail: 'Total cadastrado',
        label: 'Receita prevista',
        value: receitaTotal.toLocaleString('pt-BR', {
          currency: 'BRL',
          style: 'currency',
        }),
      },
      {
        detail: 'Base ativa',
        label: 'Clientes',
        value: String(clientes.length),
      },
      {
        detail: 'Veículos cadastrados',
        label: 'Veículos',
        value: String(veiculos.length),
      },
    ],
    veiculos,
  }
}
