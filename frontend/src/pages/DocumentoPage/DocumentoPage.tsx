import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'
import { supabase } from '../../lib/supabase'
import { listClientes, type Cliente } from '../../services/clientes'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'
import { getOrdem, type OrdemServico } from '../../services/ordens'
import { listVeiculos, type Veiculo } from '../../services/veiculos'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  })
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(value))
}

function getDocumentoTitle(tipo?: string) {
  if (tipo === 'nota-simples') {
    return 'Nota simples nao fiscal'
  }

  return 'Orcamento'
}

export default function DocumentoPage() {
  const navigate = useNavigate()
  const { ordemId, tipo } = useParams()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [ordem, setOrdem] = useState<OrdemServico | null>(null)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const documentoTitle = getDocumentoTitle(tipo)
  const isNotaSimples = tipo === 'nota-simples'

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

  const cliente = ordem ? clientesById[ordem.cliente_id ?? ''] : null
  const veiculo = ordem ? veiculosById[ordem.veiculo_id ?? ''] : null

  useEffect(() => {
    async function loadDocumento() {
      if (!ordemId) {
        navigate('/ordens')
        return
      }

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        navigate('/login')
        return
      }

      const preparedOficina = await ensureUserOficina({
        fallbackName: 'Oficina Demonstracao',
        userId: data.user.id,
      })

      const [loadedClientes, loadedVeiculos, loadedOrdem] = await Promise.all([
        listClientes(preparedOficina.id),
        listVeiculos(preparedOficina.id),
        getOrdem(ordemId),
      ])

      setOficina(preparedOficina)
      setClientes(loadedClientes)
      setVeiculos(loadedVeiculos)
      setOrdem(loadedOrdem)
      setIsLoading(false)
    }

    loadDocumento()
  }, [navigate, ordemId])

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 text-slate-950">
        <p className="rounded-xl bg-white p-5 text-sm font-black shadow-sm ring-1 ring-slate-200">
          Carregando documento...
        </p>
      </main>
    )
  }

  if (!ordem) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 text-slate-950">
        <p className="rounded-xl bg-white p-5 text-sm font-black shadow-sm ring-1 ring-slate-200">
          Documento nao encontrado.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-6 text-slate-950 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-4xl flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          to="/ordens"
        >
          Voltar para ordens
        </Link>
        <button
          className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
          onClick={() => window.print()}
          type="button"
        >
          Imprimir ou salvar PDF
        </button>
      </div>

      <article className="mx-auto max-w-4xl bg-white p-8 shadow-sm ring-1 ring-slate-200 print:max-w-none print:p-8 print:shadow-none print:ring-0">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <img className="h-14 w-auto" src={logoAppSoft} alt="Oficina AppSoft" />
            <h1 className="mt-5 text-3xl font-black text-slate-950">{documentoTitle}</h1>
            <p className="mt-2 text-sm font-bold text-slate-500">
              Documento gerado em {formatDate(new Date().toISOString())}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
              Oficina
            </p>
            <strong className="mt-2 block text-xl font-black">
              {oficina?.nome ?? 'Oficina Demonstracao'}
            </strong>
            {isNotaSimples ? (
              <p className="mt-3 max-w-64 text-xs font-bold leading-5 text-slate-300">
                Recibo simples sem valor fiscal. Nao substitui NF-e, NFS-e ou documento fiscal
                autorizado.
              </p>
            ) : (
              <p className="mt-3 max-w-64 text-xs font-bold leading-5 text-slate-300">
                Orcamento sujeito a aprovacao do cliente e disponibilidade de pecas.
              </p>
            )}
          </div>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Cliente
            </p>
            <strong className="mt-2 block text-lg font-black">
              {cliente?.nome ?? 'Cliente nao informado'}
            </strong>
            <p className="mt-2 text-sm font-bold text-slate-600">
              Telefone: {cliente?.telefone ?? 'Nao informado'}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-600">
              E-mail: {cliente?.email ?? 'Nao informado'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Veiculo
            </p>
            <strong className="mt-2 block text-lg font-black">
              {veiculo?.modelo ?? 'Veiculo nao informado'}
            </strong>
            <p className="mt-2 text-sm font-bold text-slate-600">
              Marca: {veiculo?.marca ?? 'Nao informada'}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-600">
              Placa: {veiculo?.placa ?? 'Nao informada'}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-600">
              Ano: {veiculo?.ano ?? 'Nao informado'}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Servico
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-5 py-5 align-top">
                    <strong className="block text-base font-black text-slate-950">
                      {ordem.titulo}
                    </strong>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {ordem.descricao || 'Sem descricao adicional.'}
                    </p>
                  </td>
                  <td className="px-5 py-5 text-right align-top text-base font-black text-slate-950">
                    {formatCurrency(Number(ordem.valor))}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="px-5 py-4 text-right text-sm font-black text-slate-700">
                    Total
                  </td>
                  <td className="px-5 py-4 text-right text-xl font-black text-slate-950">
                    {formatCurrency(Number(ordem.valor))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Observacoes
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {isNotaSimples
                ? 'Este documento registra o recebimento/controle interno do servico e nao possui validade fiscal.'
                : 'Este orcamento pode sofrer alteracoes apos desmontagem, diagnostico completo ou mudanca no valor de pecas.'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Assinatura do cliente
            </p>
            <div className="mt-12 border-t border-slate-300 pt-3 text-sm font-bold text-slate-500">
              Nome e assinatura
            </div>
          </div>
        </section>
      </article>
    </main>
  )
}
