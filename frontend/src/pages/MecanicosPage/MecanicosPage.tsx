import { useEffect, useState } from 'react'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import { supabase } from '../../lib/supabase'
import { createMecanico, listMecanicos, type Mecanico } from '../../services/mecanicos'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'
import { databaseErrorMessage } from '../../services/databaseErrors'

export default function MecanicosPage() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [email, setEmail] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [nome, setNome] = useState('')
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [requiresRealLogin, setRequiresRealLogin] = useState(false)
  const [telefone, setTelefone] = useState('')
  const oficinaName = oficina?.nome ?? 'Minha Oficina'

  useEffect(() => {
    async function loadMecanicos() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setRequiresRealLogin(true)
        return
      }

      const preparedOficina = await ensureUserOficina({
        fallbackName: 'Minha Oficina',
        userId: data.user.id,
      })

      setOficina(preparedOficina)

      const loadedMecanicos = await listMecanicos(preparedOficina.id)
      setMecanicos(loadedMecanicos)
    }

    loadMecanicos()
      .catch((error) => setLoadError(databaseErrorMessage(error, 'Não foi possível carregar os mecânicos. Recarregue a página para tentar novamente.')))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!oficina) {
      setMessage('Entre na sua conta para cadastrar mecânicos.')
      return
    }

    setIsSubmitting(true)

    try {
      const createdMecanico = await createMecanico({
        email,
        nome,
        oficinaId: oficina.id,
        telefone,
      })

      setMecanicos((currentMecanicos) => [createdMecanico, ...currentMecanicos])
      setEmail('')
      setNome('')
      setTelefone('')
      setMessage('Mecânico cadastrado com sucesso.')
    } catch (error) {
      setMessage(databaseErrorMessage(error, 'Não foi possível cadastrar o mecânico.'))
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
          title="Mecânicos"
        >
          <span className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700">
            {mecanicos.length} mecânico(s)
          </span>
        </DashboardTopbar>

        <div className="grid gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[420px_1fr]">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">Novo mecânico</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cadastre os profissionais que executarão os serviços.
            </p>

            {isLoading ? (
              <p className="mt-6 text-sm text-slate-500">Carregando mecânicos...</p>
            ) : loadError ? (
              <p role="alert" className="mt-6 rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">{loadError}</p>
            ) : requiresRealLogin ? (
              <div className="mt-6 rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
                Entre na sua conta para cadastrar e consultar mecânicos da oficina.
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-black text-slate-700">Nome</span>
                <input
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Nome do mecânico"
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
                  placeholder="mecanico@email.com"
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
                {isSubmitting ? 'Salvando...' : 'Salvar mecânico'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Mecânicos cadastrados</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Profissionais cadastrados para executar os serviços da oficina.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {isLoading || loadError ? (
                <p className="text-sm text-slate-500">{isLoading ? 'Carregando mecânicos...' : 'A listagem está indisponível até resolver o erro de carregamento.'}</p>
              ) : mecanicos.length > 0 ? (
                mecanicos.map((mecanico) => (
                  <article
                    className="rounded-xl border border-slate-200 p-4"
                    key={mecanico.id}
                  >
                    <strong className="block text-base font-black text-slate-950">
                      {mecanico.nome}
                    </strong>
                    <div className="mt-2 grid gap-1 text-sm text-slate-500">
                      <span>{mecanico.telefone || 'Telefone não informado'}</span>
                      <span>{mecanico.email || 'E-mail não informado'}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Nenhum mecânico cadastrado ainda.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
