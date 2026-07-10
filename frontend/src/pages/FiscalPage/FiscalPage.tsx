import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import SummaryCard from '../../components/dashboard/SummaryCard'
import { supabase } from '../../lib/supabase'
import { listClientes, type Cliente } from '../../services/clientes'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'
import { listOrdens, type OrdemServico, updateOrdemNota } from '../../services/ordens'
import { listVeiculos, type Veiculo } from '../../services/veiculos'

const notaStatusOptions = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Registrada', value: 'emitida' },
  { label: 'Cancelada', value: 'cancelada' },
]

const notaStatusLabels: Record<string, string> = {
  cancelada: 'Cancelada',
  emitida: 'Registrada',
  pendente: 'Pendente',
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Sem emissao'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function FiscalPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [notaNumeros, setNotaNumeros] = useState<Record<string, string>>({})
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [requiresRealLogin, setRequiresRealLogin] = useState(false)
  const [statusFilter, setStatusFilter] = useState('todos')
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const oficinaName = oficina?.nome ?? 'Oficina Demonstracao'

  const clientesById = useMemo(() => {
    return clientes.reduce<Record<string, Cliente>>((acc, cliente) => {
      acc[cliente.id] = cliente
      return acc
    }, {})
  }, [clientes])

  const veiculosById = useMemo(() => {
    return veiculos.reduce<Record<string, Veiculo>>((acc, veiculo) => {
      acc[veiculo.id] = veiculo
      return acc
    }, {})
  }, [veiculos])

  const filteredOrdens = useMemo(() => {
    return ordens.filter((ordem) => {
      const matchesStatus = statusFilter === 'todos' || ordem.nota_status === statusFilter
      const canIssue = ordem.status === 'concluida' || ordem.pagamento_status === 'pago'

      return matchesStatus && canIssue
    })
  }, [ordens, statusFilter])

  const totalPendentes = ordens.filter((ordem) => ordem.nota_status === 'pendente').length
  const totalEmitidas = ordens.filter((ordem) => ordem.nota_status === 'emitida').length
  const totalCanceladas = ordens.filter((ordem) => ordem.nota_status === 'cancelada').length

  useEffect(() => {
    async function loadFiscal() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setRequiresRealLogin(true)
        return
      }

      const preparedOficina = await ensureUserOficina({
        fallbackName: 'Oficina Demonstracao',
        userId: data.user.id,
      })

      setOficina(preparedOficina)

      const [loadedClientes, loadedOrdens, loadedVeiculos] = await Promise.all([
        listClientes(preparedOficina.id),
        listOrdens(preparedOficina.id),
        listVeiculos(preparedOficina.id),
      ])

      setClientes(loadedClientes)
      setOrdens(loadedOrdens)
      setNotaNumeros(
        loadedOrdens.reduce<Record<string, string>>((acc, ordem) => {
          acc[ordem.id] = ordem.nota_numero ?? ''
          return acc
        }, {}),
      )
      setVeiculos(loadedVeiculos)
    }

    loadFiscal()
  }, [])

  async function handleNotaStatusChange(ordem: OrdemServico, notaStatus: string) {
    setMessage('')

    try {
      const updatedOrdem = await updateOrdemNota({
        notaNumero: notaNumeros[ordem.id],
        notaStatus,
        ordemId: ordem.id,
      })

      setOrdens((currentOrdens) =>
        currentOrdens.map((currentOrdem) =>
          currentOrdem.id === ordem.id ? updatedOrdem : currentOrdem,
        ),
      )
      setNotaNumeros((currentValues) => ({
        ...currentValues,
        [ordem.id]: updatedOrdem.nota_numero ?? '',
      }))
      setMessage('Status fiscal atualizado.')
    } catch {
      setMessage('Nao foi possivel atualizar a nota.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <div className="relative h-full w-[min(82vw,320px)] shadow-2xl">
            <DashboardSidebar oficinaName={oficinaName} />
          </div>
        </div>
      ) : null}

      <div className="hidden lg:block">
        <DashboardSidebar oficinaName={oficinaName} />
      </div>

      <section className="min-w-0">
        <DashboardTopbar
          eyebrow="Fiscal"
          onOpenMenu={() => setIsMenuOpen(true)}
          title="Controle fiscal interno"
        >
          <select
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="todos">Todas as notas</option>
            {notaStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </DashboardTopbar>

        <div className="px-5 py-6 sm:px-8">
          {requiresRealLogin ? (
            <div className="rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
              Entre com sua conta real para visualizar o modulo fiscal.
            </div>
          ) : null}

          <section className="mb-6 rounded-2xl bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
              Emissao oficial ainda nao conectada
            </p>
            <h2 className="mt-2 text-2xl font-black">Controle interno antes da integracao fiscal</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Esta tela registra o status fiscal da ordem dentro do sistema. A emissao oficial de
              NF-e ou NFS-e depende de uma integracao segura com um emissor fiscal, usando backend,
              certificado, CNPJ e regras da prefeitura ou SEFAZ.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard detail="Aguardando controle" label="Pendentes" value={totalPendentes} />
            <SummaryCard detail="Marcadas no sistema" label="Registradas" value={totalEmitidas} />
            <SummaryCard detail="Marcadas como anuladas" label="Canceladas" value={totalCanceladas} />
          </section>

          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Ordens para controle fiscal</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Use para organizar o numero e o status da nota quando ela for emitida fora do app.
                </p>
              </div>
              <strong className="text-sm font-black text-slate-700">
                {filteredOrdens.length} ordem(ns)
              </strong>
            </div>

            {message ? (
              <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                {message}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3">
              {filteredOrdens.length > 0 ? (
                filteredOrdens.map((ordem) => (
                  <article
                    className="grid gap-4 rounded-xl border border-slate-200 p-4 xl:grid-cols-[1fr_220px_180px] xl:items-center"
                    key={ordem.id}
                  >
                    <div>
                      <strong className="block text-base font-black text-slate-950">
                        {ordem.titulo}
                      </strong>
                      <span className="mt-1 block text-sm text-slate-500">
                        {clientesById[ordem.cliente_id ?? '']?.nome ?? 'Cliente nao informado'}
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {veiculosById[ordem.veiculo_id ?? '']?.modelo ?? 'Veiculo nao informado'}
                      </span>
                      <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600">
                        {notaStatusLabels[ordem.nota_status] ?? ordem.nota_status}
                      </span>
                    </div>

                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                        Numero da nota
                      </span>
                      <input
                        className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        onChange={(event) =>
                          setNotaNumeros((currentValues) => ({
                            ...currentValues,
                            [ordem.id]: event.target.value,
                          }))
                        }
                        placeholder="Ex: NF-0001"
                        value={notaNumeros[ordem.id] ?? ''}
                      />
                      <span className="mt-2 block text-xs font-bold text-slate-500">
                        {formatDate(ordem.nota_emitida_em)}
                      </span>
                    </label>

                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                        Status fiscal
                      </span>
                      <select
                        className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        onChange={(event) => handleNotaStatusChange(ordem, event.target.value)}
                        value={ordem.nota_status}
                      >
                        {notaStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Nenhuma ordem concluida ou paga para controle fiscal.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
