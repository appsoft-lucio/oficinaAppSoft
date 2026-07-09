import { useEffect, useState } from 'react'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import { supabase } from '../../lib/supabase'
import { createCliente, listClientes, type Cliente } from '../../services/clientes'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [email, setEmail] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [nome, setNome] = useState('')
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [requiresRealLogin, setRequiresRealLogin] = useState(false)
  const [telefone, setTelefone] = useState('')
  const oficinaName = oficina?.nome ?? 'Oficina Demonstracao'

  useEffect(() => {
    async function loadClientes() {
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

      const loadedClientes = await listClientes(preparedOficina.id)
      setClientes(loadedClientes)
    }

    loadClientes()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!oficina) {
      setMessage('Entre com uma conta real para cadastrar clientes. O acesso demo nao salva dados.')
      return
    }

    setIsSubmitting(true)

    try {
      const createdCliente = await createCliente({
        email,
        nome,
        oficinaId: oficina.id,
        telefone,
      })

      setClientes((currentClientes) => [createdCliente, ...currentClientes])
      setEmail('')
      setNome('')
      setTelefone('')
      setMessage('Cliente cadastrado com sucesso.')
    } catch {
      setMessage('Nao foi possivel cadastrar o cliente.')
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
          title="Clientes"
        >
          <span className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700">
            {clientes.length} cliente(s)
          </span>
        </DashboardTopbar>

        <div className="grid gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[420px_1fr]">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">Novo cliente</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cadastre os dados basicos para vincular veiculos e ordens depois.
            </p>

            {requiresRealLogin ? (
              <div className="mt-6 rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
                Entre com sua conta real para salvar clientes no Supabase. O acesso demo e apenas
                para apresentacao visual.
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-black text-slate-700">Nome</span>
                <input
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Nome do cliente"
                  required
                  value={nome}
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Telefone</span>
                <input
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  onChange={(event) => setTelefone(event.target.value)}
                  placeholder="(31) 99999-9999"
                  value={telefone}
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">E-mail</span>
                <input
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="cliente@email.com"
                  type="email"
                  value={email}
                />
              </label>

              {message ? (
                <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                  {message}
                </p>
              ) : null}

              <button
                className="min-h-12 w-full rounded-lg bg-orange-600 px-6 font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting || requiresRealLogin}
                type="submit"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar cliente'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Clientes cadastrados</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Dados carregados direto do Supabase.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {clientes.length > 0 ? (
                clientes.map((cliente) => (
                  <article
                    className="rounded-xl border border-slate-200 p-4"
                    key={cliente.id}
                  >
                    <strong className="block text-base font-black text-slate-950">
                      {cliente.nome}
                    </strong>
                    <div className="mt-2 grid gap-1 text-sm text-slate-500">
                      <span>{cliente.telefone || 'Telefone nao informado'}</span>
                      <span>{cliente.email || 'E-mail nao informado'}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Nenhum cliente cadastrado ainda.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
