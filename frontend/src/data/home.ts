export const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Contato', href: '#contato' },
]

export const dashboardMetrics = [
  { label: 'Ordens abertas', value: '24' },
  { label: 'Clientes ativos', value: '128' },
  { label: 'Receita mensal', value: 'R$ 42k' },
]

export type ServiceStatusTone = 'orange' | 'slate'

export type ActiveService = {
  title: string
  status: string
  statusTone: ServiceStatusTone
}

export const activeServices: ActiveService[] = [
  { title: 'Troca de óleo - Civic', status: 'Em andamento', statusTone: 'orange' },
  { title: 'Revisão completa - Onix', status: 'Aguardando', statusTone: 'slate' },
]
