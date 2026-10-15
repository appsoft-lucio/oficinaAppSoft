import { useEffect, useState } from 'react'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import { supabase } from '../../lib/supabase'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'
import { createGerente, listGerentes, setGerenteAtivo, listAtividades, type Gerente, type Atividade } from '../../services/equipe'

const tabelas: Record<string, string> = { clientes: 'Cliente', veiculos: 'Veículo', mecanicos: 'Mecânico', ordens_servico: 'Ordem de serviço', ordem_pecas: 'Peça da ordem', veiculo_proprietarios: 'Histórico de proprietário' }
const acoes: Record<string, string> = { INSERT: 'Cadastro', UPDATE: 'Alteração', DELETE: 'Exclusão' }

export default function EquipePage() {
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [gerentes, setGerentes] = useState<Gerente[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [message, setMessage] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Entre na sua conta.')
      const shared = await ensureUserOficina({ userId: user.id })
      setOficina(shared)
      setIsOwner(shared.dono_id === user.id)
      const [members, events] = await Promise.all([listGerentes(shared.id), listAtividades(shared.id)])
      setGerentes(members)
      setAtividades(events)
      setHasMore(events.length === 100)
    }
    load().catch(() => setMessage('Não foi possível carregar a equipe. Confira se a atualização do banco foi aplicada e recarregue a página.')).finally(() => setLoading(false))
  }, [])

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!oficina || !isOwner || busy) return
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    setMessage('')
    try {
      await createGerente({ oficinaId: oficina.id, nome: String(data.get('nome')), email: String(data.get('email')), username: String(data.get('username')), password: String(data.get('password')) })
      form.reset()
      setMessage('Gerente cadastrado. Ele já pode entrar com o e-mail ou usuário e a senha cadastrada, na mesma tela de login.')
      setGerentes(await listGerentes(oficina.id))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível cadastrar o gerente.')
    } finally { setBusy(false) }
  }

  async function toggleGerente(gerente: Gerente) {
    if (!oficina || !isOwner || busy) return
    setBusy(true)
    try {
      await setGerenteAtivo(oficina.id, gerente.user_id, !gerente.ativo)
      setGerentes(await listGerentes(oficina.id))
      setMessage(gerente.ativo ? 'Acesso desativado. O histórico de autoria foi preservado.' : 'Acesso reativado.')
    } catch { setMessage('Não foi possível alterar o acesso do gerente.') }
    finally { setBusy(false) }
  }

  async function loadMore() {
    if (!oficina || busy) return
    setBusy(true)
    try {
      const events = await listAtividades(oficina.id, atividades.at(-1))
      setAtividades((current) => [...current, ...events])
      setHasMore(events.length === 100)
    } catch { setMessage('Não foi possível carregar mais atividades.') }
    finally { setBusy(false) }
  }

  const inputClass = 'mt-2 w-full rounded-lg border border-slate-300 px-4 py-3'
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block"><DashboardSidebar oficinaName={oficina?.nome ?? 'Minha Oficina'} /></div>
      {isMenuOpen ? <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Fechar menu" className="absolute inset-0 bg-slate-950/60" onClick={() => setIsMenuOpen(false)} /><div className="relative h-full w-[min(82vw,320px)] overflow-y-auto"><button type="button" className="absolute right-3 top-3 rounded bg-white/10 px-3 py-2 text-white" onClick={() => setIsMenuOpen(false)}>Fechar</button><DashboardSidebar oficinaName={oficina?.nome ?? 'Minha Oficina'} /></div></div> : null}
      <section className="min-w-0">
        <DashboardTopbar onOpenMenu={() => setIsMenuOpen(true)} title="Equipe e atividades" />
        <div className="space-y-6 p-5 sm:p-8">
          {message ? <p role="status" className="rounded-xl bg-orange-50 p-4 font-bold text-orange-800">{message}</p> : null}
          {loading ? <p>Carregando equipe...</p> : <>
            {isOwner ? <section className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">Cadastrar gerente</h2>
              <p className="mt-2 text-sm text-slate-600">O gerente usa uma conta própria e pode operar os cadastros, ordens, financeiro e documentos desta oficina. Somente você gerencia os acessos.</p>
              <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
                <label className="font-bold">Nome<input className={inputClass} name="nome" autoComplete="off" required maxLength={120} /></label>
                <label className="font-bold">E-mail<input className={inputClass} name="email" type="email" autoComplete="off" required /></label>
                <label className="font-bold">Usuário (opcional)<input className={inputClass} name="username" autoComplete="off" pattern="[a-z0-9_]{3,30}" placeholder="Ex.: gerente_lucas" /></label>
                <label className="font-bold">Senha inicial<input className={inputClass} name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label>
                <button disabled={busy} className="rounded-lg bg-orange-600 px-5 py-3 font-black text-white disabled:opacity-50" type="submit">{busy ? 'Aguarde...' : 'Cadastrar gerente'}</button>
              </form>
            </section> : <p className="rounded-xl bg-white p-5">Você está acessando como gerente. O dono é responsável pelo cadastro e pela desativação dos usuários.</p>}
            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">Gerentes da oficina</h2>
              <div className="mt-4 grid gap-3">{gerentes.length ? gerentes.map((gerente) => <article key={gerente.user_id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4"><div><strong>{gerente.nome} · Gerente</strong><p className="text-sm text-slate-600">{gerente.email} · {gerente.ativo ? 'Ativo' : 'Desativado'}</p></div>{isOwner ? <button type="button" disabled={busy} onClick={() => toggleGerente(gerente)} className="rounded-lg border border-slate-300 px-4 py-2 font-bold disabled:opacity-50">{gerente.ativo ? 'Desativar acesso' : 'Reativar acesso'}</button> : null}</article>) : <p>Nenhum gerente cadastrado.</p>}</div>
            </section>
            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">Histórico de atividades</h2>
              <p className="mt-2 text-sm text-slate-600">Cadastros, alterações e exclusões registrados a partir da ativação deste recurso.</p>
              <div className="mt-4 grid gap-3">{atividades.length ? atividades.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 p-4"><strong>{acoes[item.acao] ?? item.acao} · {tabelas[item.tabela] ?? item.tabela}</strong><p className="text-sm text-slate-600">{item.autor ? `${item.autor.nome} (${item.autor.perfil === 'dono' ? 'Dono' : 'Gerente'})` : 'Operação do sistema'} · {new Date(item.created_at).toLocaleString('pt-BR')}</p><p className="break-all text-xs text-slate-500">Registro: {item.registro_id}</p></article>) : <p>Nenhuma atividade registrada.</p>}</div>
              {hasMore ? <button disabled={busy} type="button" onClick={loadMore} className="mt-4 rounded-lg border border-slate-300 px-4 py-3 font-bold">Carregar mais atividades</button> : null}
            </section>
          </>}
        </div>
      </section>
    </main>
  )
}
