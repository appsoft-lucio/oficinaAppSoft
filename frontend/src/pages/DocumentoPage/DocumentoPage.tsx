import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'
import { supabase } from '../../lib/supabase'
import { listClientes, type Cliente } from '../../services/clientes'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'
import {
  getOrdem,
  listOrdemPecas,
  type OrdemPeca,
  type OrdemServico,
} from '../../services/ordens'
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

function formatQuantity(value: number) {
  return Number(value).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })
}

function getDocumentoTitle(tipo?: string) {
  if (tipo === 'nota-simples') {
    return 'Nota simples não fiscal'
  }

  return 'Orçamento'
}

export default function DocumentoPage() {
  const navigate = useNavigate()
  const { ordemId, tipo } = useParams()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [ordem, setOrdem] = useState<OrdemServico | null>(null)
  const [pecas, setPecas] = useState<OrdemPeca[]>([])
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
  const totalPecas = pecas.reduce((total, peca) => {
    return total + Number(peca.quantidade) * Number(peca.valor_unitario)
  }, 0)
  const valorServico = Number(ordem?.valor_servico ?? ordem?.valor ?? 0)
  const valorTotal = valorServico + totalPecas

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
        fallbackName: 'Oficina Demonstração',
        userId: data.user.id,
      })

      const [loadedClientes, loadedVeiculos, loadedOrdem, loadedPecas] = await Promise.all([
        listClientes(preparedOficina.id),
        listVeiculos(preparedOficina.id),
        getOrdem(ordemId),
        listOrdemPecas(ordemId),
      ])

      setOficina(preparedOficina)
      setClientes(loadedClientes)
      setVeiculos(loadedVeiculos)
      setOrdem(loadedOrdem)
      setPecas(loadedPecas)
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
          Documento não encontrado.
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
              {oficina?.nome ?? 'Oficina Demonstração'}
            </strong>
            {isNotaSimples ? (
              <p className="mt-3 max-w-64 text-xs font-bold leading-5 text-slate-300">
                Recibo simples sem valor fiscal. Não substitui NF-e, NFS-e ou documento fiscal
                autorizado.
              </p>
            ) : (
              <p className="mt-3 max-w-64 text-xs font-bold leading-5 text-slate-300">
                Orçamento sujeito a aprovação do cliente e disponibilidade de peças.
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
              {cliente?.nome ?? 'Cliente não informado'}
            </strong>
            <p className="mt-2 text-sm font-bold text-slate-600">
              Telefone: {cliente?.telefone ?? 'Não informado'}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-600">
              E-mail: {cliente?.email ?? 'Não informado'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Veículo
            </p>
            <strong className="mt-2 block text-lg font-black">
              {veiculo?.modelo ?? 'Veículo não informado'}
            </strong>
            <p className="mt-2 text-sm font-bold text-slate-600">
              Marca: {veiculo?.marca ?? 'Não informada'}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-600">
              Placa: {veiculo?.placa ?? 'Não informada'}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-600">
              Ano: {veiculo?.ano ?? 'Não informado'}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Item
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Qtd.
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Unitario
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
                      Serviço: {ordem.titulo}
                    </strong>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {ordem.descricao || 'Sem descrição adicional.'}
                    </p>
                  </td>
                  <td className="px-5 py-5 text-right align-top text-sm font-bold text-slate-600">
                    1
                  </td>
                  <td className="px-5 py-5 text-right align-top text-sm font-bold text-slate-600">
                    {formatCurrency(valorServico)}
                  </td>
                  <td className="px-5 py-5 text-right align-top text-base font-black text-slate-950">
                    {formatCurrency(valorServico)}
                  </td>
                </tr>
                {pecas.map((peca) => {
                  const subtotal = Number(peca.quantidade) * Number(peca.valor_unitario)

                  return (
                    <tr className="border-t border-slate-100" key={peca.id}>
                      <td className="px-5 py-4 align-top">
                        <strong className="block text-sm font-black text-slate-950">
                          Peça: {peca.descricao}
                        </strong>
                      </td>
                      <td className="px-5 py-4 text-right align-top text-sm font-bold text-slate-600">
                        {formatQuantity(Number(peca.quantidade))}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-sm font-bold text-slate-600">
                        {formatCurrency(Number(peca.valor_unitario))}
                      </td>
                      <td className="px-5 py-4 text-right align-top text-sm font-black text-slate-950">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td
                    className="px-5 py-3 text-right text-sm font-black text-slate-700"
                    colSpan={3}
                  >
                    Peças
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-black text-slate-950">
                    {formatCurrency(totalPecas)}
                  </td>
                </tr>
                <tr>
                  <td
                    className="px-5 py-4 text-right text-sm font-black text-slate-700"
                    colSpan={3}
                  >
                    Total
                  </td>
                  <td className="px-5 py-4 text-right text-xl font-black text-slate-950">
                    {formatCurrency(valorTotal)}
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
                ? 'Este documento registra o recebimento e o controle interno do serviço e não possui validade fiscal.'
                : 'Este orçamento pode sofrer alterações após desmontagem, diagnóstico completo ou mudança no valor de peças.'}
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
