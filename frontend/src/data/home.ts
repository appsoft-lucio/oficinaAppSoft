export const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Implantação', href: '#planos' },
  { label: 'Contato', href: '#contato' },
]

export const creatorLinks = [
  { label: 'Lucio Junior', href: 'https://appsoft-lucio.github.io/lucio-junior/' },
  { label: 'AppSoft Agency', href: 'https://appsoft-lucio.github.io/appsoft-agency/' },
]

export const trustIndicators = [
  { label: 'Atendimento organizado', value: 'Clientes, veículos e ordens' },
  { label: 'Operação integrada', value: 'Serviços, peças e documentos' },
  { label: 'Gestão financeira', value: 'Recebimentos e pendências' },
]

export const dashboardMetrics = [
  { label: 'Ordens abertas', value: 'Em dia' },
  { label: 'Atendimentos', value: 'Organizados' },
  { label: 'Financeiro', value: 'Sob controle' },
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
    description: 'Centralize dados de contato, veículos e histórico de atendimento de cada cliente.',
  },
  {
    title: 'Ordens de serviço',
    description: 'Abra e acompanhe serviços, registre peças e utilize o comando de voz no atendimento.',
  },
  {
    title: 'Financeiro da oficina',
    description: 'Acompanhe valores recebidos, pagamentos parciais e pendências por período.',
  },
  {
    title: 'Documentos e controle fiscal',
    description: 'Gere orçamentos e notas simples e organize o controle interno de emissão fiscal.',
  },
]

export const pricingHighlights = [
  'Acesso online e responsivo',
  'Dados centralizados com segurança',
  'Suporte à implantação e evolução',
]
