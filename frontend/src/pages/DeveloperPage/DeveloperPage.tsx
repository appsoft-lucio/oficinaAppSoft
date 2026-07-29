import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'
import { supabase } from '../../lib/supabase'
import {
  createSystemClient,
  listSystemClients,
  updateSystemClient,
  updateSystemClientStatus,
  type SystemClient,
} from '../../services/developer'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function DeveloperPage() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<SystemClient[]>([])
  const [email, setEmail] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [password, setPassword] = useState('')
  const [workshopName, setWorkshopName] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingClientId, setUpdatingClientId] = useState('')
  const [editingClient, setEditingClient] = useState<SystemClient | null>(null)
  const [editEmail, setEditEmail] = useState('')
  const [editOwnerName, setEditOwnerName] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editWorkshopName, setEditWorkshopName] = useState('')

  useEffect(() => {
    listSystemClients()
      .then(setClients)
      .catch(() => setMessage('Não foi possível carregar os clientes do sistema.'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const client = await createSystemClient({ email, ownerName, password, workshopName })
      setClients((current) => [client, ...current])
      setEmail('')
      setOwnerName('')
      setPassword('')
      setWorkshopName('')
      setMessage('Cliente criado e pronto para acessar o sistema.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível criar o cliente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleStatusChange(client: SystemClient) {
    const nextStatus = client.status === 'ativo' ? 'suspenso' : 'ativo'
    setMessage('')
    setUpdatingClientId(client.id)

    try {
      const updatedClient = await updateSystemClientStatus(client.id, nextStatus)
      setClients((current) =>
        current.map((item) => (item.id === updatedClient.id ? updatedClient : item)),
      )
      setMessage(
        nextStatus === 'ativo'
          ? 'Cliente ativado e acesso liberado.'
          : 'Cliente inativado e acesso bloqueado.',
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível alterar o status.')
    } finally {
      setUpdatingClientId('')
    }
  }

  function startEditing(client: SystemClient) {
    setEditingClient(client)
    setEditEmail(client.ownerEmail)
    setEditOwnerName(client.ownerName)
    setEditPassword('')
    setEditWorkshopName(client.nome)
    setMessage('')
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingClient) return

    setMessage('')
    setUpdatingClientId(editingClient.id)

    try {
      const updatedClient = await updateSystemClient({
        clientId: editingClient.id,
        email: editEmail,
        ownerName: editOwnerName,
        password: editPassword || undefined,
        workshopName: editWorkshopName,
      })
      setClients((current) =>
        current.map((item) => (item.id === updatedClient.id ? updatedClient : item)),
      )
      setEditingClient(null)
      setEditPassword('')
      setMessage('Dados do cliente atualizados com sucesso.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível atualizar o cliente.')
    } finally {
      setUpdatingClientId('')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-800 bg-slate-950 px-5 py-4 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img alt="Oficina AppSoft" className="h-12 w-auto" src={logoAppSoft} />
            <div className="border-l border-slate-700 pl-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
                Administração
              </p>
              <h1 className="font-black">Painel do desenvolvedor</h1>
            </div>
          </div>
          <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-black" onClick={handleLogout} type="button">
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 xl:grid-cols-[420px_1fr]">
        <section className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Novo contrato</p>
          <h2 className="mt-2 text-2xl font-black">Adicionar cliente</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Cria o acesso do responsável e a oficina vinculada em uma única operação.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-black text-slate-700">
              Nome da oficina
              <input className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" onChange={(event) => setWorkshopName(event.target.value)} required value={workshopName} />
            </label>
            <label className="block text-sm font-black text-slate-700">
              Nome do responsável
              <input className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" onChange={(event) => setOwnerName(event.target.value)} required value={ownerName} />
            </label>
            <label className="block text-sm font-black text-slate-700">
              E-mail de acesso
              <input className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </label>
            <label className="block text-sm font-black text-slate-700">
              Senha temporária
              <input className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            </label>

            {message ? <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">{message}</p> : null}

            <button className="min-h-12 w-full rounded-lg bg-orange-600 px-6 font-black text-white hover:bg-orange-700 disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Criando cliente...' : 'Criar cliente'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Base ativa</p>
              <h2 className="mt-2 text-2xl font-black">Clientes do sistema</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black">{clients.length} cliente(s)</span>
          </div>

          <div className="mt-6 grid gap-3">
            {isLoading ? <p className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">Carregando clientes...</p> : null}
            {!isLoading && clients.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">Nenhum cliente provisionado.</p> : null}
            {clients.map((client) => (
              <article className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={client.id}>
                <div>
                  <strong className="block font-black">{client.nome}</strong>
                  <span className="mt-1 block text-sm text-slate-500">{client.ownerName} · {client.ownerEmail}</span>
                  {client.trialEndsAt ? (
                    <span className="mt-1 block text-xs font-bold text-orange-600">
                      Avaliação até {formatDate(client.trialEndsAt)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <div className="text-left sm:text-right">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${client.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{client.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                  <time className="mt-1 block text-xs text-slate-400">{formatDate(client.createdAt)}</time>
                  </div>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:border-orange-500 hover:text-orange-700 disabled:opacity-60"
                    disabled={updatingClientId === client.id}
                    onClick={() => startEditing(client)}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className={`rounded-lg px-3 py-2 text-xs font-black text-white disabled:opacity-60 ${client.status === 'ativo' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    disabled={updatingClientId === client.id}
                    onClick={() => handleStatusChange(client)}
                    type="button"
                  >
                    {updatingClientId === client.id ? 'Alterando...' : client.status === 'ativo' ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {editingClient ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
          role="dialog"
        >
          <section className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                  Dados de acesso
                </p>
                <h2 className="mt-2 text-2xl font-black">Editar cliente</h2>
              </div>
              <button
                aria-label="Fechar edição"
                className="rounded-lg px-3 py-2 font-black text-slate-500 hover:bg-slate-100"
                onClick={() => setEditingClient(null)}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleEditSubmit}>
              <label className="block text-sm font-black text-slate-700">
                Nome da oficina
                <input className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" onChange={(event) => setEditWorkshopName(event.target.value)} required value={editWorkshopName} />
              </label>
              <label className="block text-sm font-black text-slate-700">
                Nome do responsável
                <input className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" onChange={(event) => setEditOwnerName(event.target.value)} required value={editOwnerName} />
              </label>
              <label className="block text-sm font-black text-slate-700">
                E-mail de acesso
                <input className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" onChange={(event) => setEditEmail(event.target.value)} required type="email" value={editEmail} />
              </label>
              <label className="block text-sm font-black text-slate-700">
                Nova senha
                <input className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" minLength={8} onChange={(event) => setEditPassword(event.target.value)} placeholder="Deixe em branco para manter a senha atual" type="password" value={editPassword} />
              </label>

              {message ? <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">{message}</p> : null}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button className="min-h-12 rounded-lg border border-slate-300 px-6 font-black text-slate-700 hover:bg-slate-50" onClick={() => setEditingClient(null)} type="button">
                  Cancelar
                </button>
                <button className="min-h-12 rounded-lg bg-orange-600 px-6 font-black text-white hover:bg-orange-700 disabled:opacity-60" disabled={updatingClientId === editingClient.id} type="submit">
                  {updatingClientId === editingClient.id ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  )
}
