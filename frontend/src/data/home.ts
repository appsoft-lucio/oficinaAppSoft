export const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Planos', href: '#planos' },
  { label: 'Contato', href: '#contato' },
]

export const creatorLinks = [
  { label: 'Lucio Junior', href: 'https://appsoft-lucio.github.io/lucio-junior/' },
  { label: 'AppSoft Agency', href: 'https://appsoft-lucio.github.io/appsoft-agency/' },
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

export const painPoints = [
  {
    title: 'Ordens perdidas no papel',
    description:
      'Centralize serviços, peças, responsáveis e histórico do veículo em uma única tela.',
  },
  {
    title: 'Cliente sem retorno',
    description:
      'Acompanhe cada etapa do atendimento e saiba exatamente quem precisa ser avisado.',
  },
  {
    title: 'Gestão sem números',
    description:
      'Veja pendências, receita, produtividade e volume de serviços sem montar planilhas.',
  },
]

export const features = [
  {
    title: 'Clientes e veículos',
    description: 'Cadastro completo com histórico de serviços, placas, contatos e observações.',
  },
  {
    title: 'Ordens de serviço',
    description: 'Fluxo claro para abertura, acompanhamento, conclusão e cobrança.',
  },
  {
    title: 'Financeiro da oficina',
    description: 'Controle receitas, pendências, formas de pagamento e relatórios por período.',
  },
  {
    title: 'Relatórios gerenciais',
    description: 'Indicadores para entender movimento, serviços mais vendidos e faturamento.',
  },
]

export const pricingHighlights = [
  'Implantação simples',
  'Painel online',
  'Suporte para evolução do sistema',
]
