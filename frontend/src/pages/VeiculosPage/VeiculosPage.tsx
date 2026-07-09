import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import { supabase } from '../../lib/supabase'
import { listClientes, type Cliente } from '../../services/clientes'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'
import { createVeiculo, listVeiculos, type Veiculo } from '../../services/veiculos'

export default function VeiculosPage() {
  const [ano, setAno] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [marca, setMarca] = useState('')
  const [message, setMessage] = useState('')
  const [modelo, setModelo] = useState('')
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [placa, setPlaca] = useState('')
  const [requiresRealLogin, setRequiresRealLogin] = useState(false)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const oficinaName = oficina?.nome ?? 'Oficina Demonstracao'

  const clientesById = useMemo(() => {
    return clientes.reduce<Record<string, Cliente>>((acc, cliente) => {
      acc[cliente.id] = cliente
      return acc
    }, {})
  }, [clientes])

  useEffect(() => {
    async function loadData() {
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

      const [loadedClientes, loadedVeiculos] = await Promise.all([
        listClientes(preparedOficina.id),
        listVeiculos(preparedOficina.id),
      ])

      setClientes(loadedClientes)
      setVeiculos(loadedVeiculos)
      setClienteId(loadedClientes[0]?.id ?? '')
    }

    loadData()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!oficina) {
      setMessage('Entre com uma conta real para cadastrar veiculos. O acesso demo nao salva dados.')
      return
    }

    if (!clienteId) {
      setMessage('Cadastre um cliente antes de cadastrar veiculo.')
      return
    }

    setIsSubmitting(true)

    try {
      const createdVeiculo = await createVeiculo({
        ano,
        clienteId,
        marca,
        modelo,
        oficinaId: oficina.id,
        placa,
      })

      setVeiculos((currentVeiculos) => [createdVeiculo, ...currentVeiculos])
      setAno('')
      setMarca('')
      setModelo('')
      setPlaca('')
      setMessage('Veiculo cadastrado com sucesso.')
    } catch {
      setMessage('Nao foi possivel cadastrar o veiculo.')
    } finally {
      setIsSubmitting(false)
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
          eyebrow="Cadastros"
          onOpenMenu={() => setIsMenuOpen(true)}
          title="Veiculos"
        >
          <span className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700">
            {veiculos.length} veiculo(s)
          </span>
        </DashboardTopbar>

        <div className="grid gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[420px_1fr]">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">Novo veiculo</h2>
            <p className="mt-1 text-sm text-slate-500">
              Vincule o veiculo a um cliente para abrir ordens depois.
            </p>

            {requiresRealLogin ? (
              <div className="mt-6 rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
                Entre com sua conta real para salvar veiculos no Supabase. O acesso demo e apenas
                para apresentacao visual.
              </div>
            ) : clientes.length === 0 ? (
              <div className="mt-6 rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
                Cadastre um cliente antes.{' '}
                <Link className="underline" to="/clientes">
                  Ir para clientes
                </Link>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-black text-slate-700">Cliente</span>
                  <select
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    onChange={(event) => setClienteId(event.target.value)}
                    required
                    value={clienteId}
                  >
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-slate-700">Modelo</span>
                  <input
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    onChange={(event) => setModelo(event.target.value)}
                    placeholder="Civic, Onix, Corolla..."
                    required
                    value={modelo}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-black text-slate-700">Marca</span>
                    <input
                      className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      onChange={(event) => setMarca(event.target.value)}
                      placeholder="Honda"
                      value={marca}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-slate-700">Ano</span>
                    <input
                      className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      inputMode="numeric"
                      onChange={(event) => setAno(event.target.value)}
                      placeholder="2020"
                      value={ano}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-black text-slate-700">Placa</span>
                  <input
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 uppercase outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    onChange={(event) => setPlaca(event.target.value.toUpperCase())}
                    placeholder="ABC1D23"
                    value={placa}
                  />
                </label>

                {message ? (
                  <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                    {message}
                  </p>
                ) : null}

                <button
                  className="min-h-12 w-full rounded-lg bg-orange-600 px-6 font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar veiculo'}
                </button>
              </form>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div>
              <h2 className="text-xl font-black">Veiculos cadastrados</h2>
              <p className="mt-1 text-sm text-slate-500">
                Cada veiculo ja fica vinculado a um cliente.
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {veiculos.length > 0 ? (
                veiculos.map((veiculo) => (
                  <article
                    className="rounded-xl border border-slate-200 p-4"
                    key={veiculo.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <strong className="block text-base font-black text-slate-950">
                          {veiculo.modelo}
                        </strong>
                        <span className="mt-1 block text-sm text-slate-500">
                          {clientesById[veiculo.cliente_id ?? '']?.nome ?? 'Cliente nao informado'}
                        </span>
                      </div>
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                        {veiculo.placa || 'Sem placa'}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-slate-500">
                      <span>{veiculo.marca || 'Marca nao informada'}</span>
                      <span>{veiculo.ano || 'Ano nao informado'}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Nenhum veiculo cadastrado ainda.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
