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
  const [documentMessage, setDocumentMessage] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
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
  const observacoes = isNotaSimples
    ? 'Este documento registra o recebimento e o controle interno do serviço e não possui validade fiscal.'
    : 'Orçamento sujeito a aprovação do cliente e disponibilidade de peças. Alterações após diagnóstico devem ser aprovadas pelo cliente.'

  const pdfData = useMemo(() => ordem ? ({
        titulo: documentoTitle,
        referencia: ordem.id,
        oficina: oficina?.nome ?? 'Minha Oficina',
        cliente: [cliente?.nome ?? 'Cliente não informado', `Telefone: ${cliente?.telefone ?? 'Não informado'}`, `E-mail: ${cliente?.email ?? 'Não informado'}`],
        veiculo: [veiculo?.modelo ?? 'Veículo não informado', `Marca: ${veiculo?.marca ?? 'Não informada'}`, `Placa: ${veiculo?.placa ?? 'Não informada'}`, `Ano: ${veiculo?.ano ?? 'Não informado'}`],
        servico: { titulo: ordem.titulo, descricao: ordem.descricao || 'Sem descrição adicional.', valor: valorServico },
        pecas: pecas.map((peca) => ({ descricao: peca.descricao, quantidade: Number(peca.quantidade), valor: Number(peca.valor_unitario) })),
        observacoes,
      }) : null, [ordem, documentoTitle, oficina, cliente, veiculo, valorServico, pecas, observacoes])

  // Prepare before the click so the system share dialog keeps user activation.
  useEffect(() => {
    let cancelled = false
    setPdfFile(null)
    if (pdfData) {
      import('../../services/documentoPdf').then(({ criarDocumentoPdf }) => {
        const doc = criarDocumentoPdf(pdfData)
        const file = new File([doc.output('blob')], `${isNotaSimples ? 'nota-simples' : 'orcamento'}-${pdfData.referencia}.pdf`, { type: 'application/pdf' })
        if (!cancelled) setPdfFile(file)
      }).catch(() => {
        if (!cancelled) setDocumentMessage('Não foi possível preparar o PDF. Atualize a página para tentar novamente.')
      })
    }
    return () => { cancelled = true }
  }, [pdfData, isNotaSimples])

  async function handleDownloadPdf() {
    if (!pdfData || isDownloading) return
    setIsDownloading(true)
    setDocumentMessage('')
    try {
      const { criarDocumentoPdf } = await import('../../services/documentoPdf')
      const doc = criarDocumentoPdf(pdfData)
      await doc.save(`${isNotaSimples ? 'nota-simples' : 'orcamento'}-${pdfData.referencia}.pdf`, { returnPromise: true })
      setDocumentMessage('PDF gerado. Confira os downloads do navegador para abrir ou imprimir o arquivo.')
    } catch {
      setDocumentMessage('Não foi possível baixar o PDF. Tente novamente ou abra este endereço no Chrome ou Edge para imprimir.')
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleSharePdf() {
    if (!pdfFile || isSharing) return
    setShowShareOptions(true)
    setDocumentMessage('')
    try {
      if (!navigator.share || !navigator.canShare?.({ files: [pdfFile] })) {
        setDocumentMessage('Neste navegador, baixe o PDF e anexe o arquivo no WhatsApp ou no e-mail usando as opções abaixo.')
        return
      }
      setIsSharing(true)
      await navigator.share({ files: [pdfFile], title: `${documentoTitle} - ${oficina?.nome ?? 'Minha Oficina'}` })
      setDocumentMessage('Compartilhamento aberto. Conclua o envio no aplicativo escolhido.')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setDocumentMessage('Não foi possível compartilhar diretamente. Baixe o PDF e anexe o arquivo no WhatsApp ou no e-mail.')
    } finally {
      setIsSharing(false)
    }
  }

  const shareText = `Olá${cliente?.nome ? `, ${cliente.nome}` : ''}! Segue o ${documentoTitle.toLocaleLowerCase('pt-BR')} da ${oficina?.nome ?? 'oficina'} referente ao veículo ${veiculo?.modelo ?? ''}${veiculo?.placa ? ` (${veiculo.placa})` : ''}. Total: ${formatCurrency(valorTotal)}.`
  const phoneDigits = (cliente?.telefone ?? '').replace(/\D/g, '')
  const whatsappPhone = phoneDigits.length === 10 || phoneDigits.length === 11 ? `55${phoneDigits}` : phoneDigits
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(shareText)}`
  const emailUrl = `mailto:${encodeURIComponent((cliente?.email ?? '').replace(/[\r\n]/g, ''))}?subject=${encodeURIComponent(`${documentoTitle} - ${oficina?.nome ?? 'Oficina'}`)}&body=${encodeURIComponent(shareText)}`

  function handlePrint() {
    setDocumentMessage('Se a janela de impressão não abrir, use Baixar PDF ou abra este endereço no Chrome ou Edge.')
    try {
      window.print()
    } catch {
      setDocumentMessage('A impressão não está disponível neste navegador. Use Baixar PDF e imprima o arquivo pelo seu leitor de PDF.')
    }
  }

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
        fallbackName: 'Minha Oficina',
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
        <div className="flex flex-wrap gap-3">
        <button
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          onClick={handlePrint}
          type="button"
        >
          Imprimir
        </button>
        <button
          className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          type="button"
        >
          {isDownloading ? 'Gerando PDF...' : 'Baixar PDF'}
        </button>
        <button
          className="rounded-lg bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-50"
          onClick={handleSharePdf}
          disabled={!pdfFile || isSharing}
          type="button"
        >
          {isSharing ? 'Compartilhando...' : 'Compartilhar PDF'}
        </button>
        </div>
      </div>
      {documentMessage ? <p role="status" className="mx-auto mb-5 max-w-4xl rounded-lg bg-orange-50 p-4 text-sm font-bold text-orange-800 print:hidden">{documentMessage}</p> : null}
      {showShareOptions ? (
        <section aria-label="Compartilhar por WhatsApp ou e-mail" className="mx-auto mb-5 max-w-4xl rounded-xl border border-slate-200 bg-white p-5 print:hidden">
          <h2 className="font-black">Enviar por WhatsApp ou e-mail</h2>
          <p className="mt-2 text-sm text-slate-600">Se o aplicativo não aparecer nas opções de compartilhamento, baixe o PDF, abra a conversa ou o e-mail e anexe o arquivo baixado antes de enviar.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={handleDownloadPdf} disabled={isDownloading} className="rounded-lg bg-orange-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50">{isDownloading ? 'Gerando PDF...' : '1. Baixar PDF para anexar'}</button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-emerald-700 px-4 py-3 text-sm font-black text-emerald-800">Abrir WhatsApp</a>
            <a href={emailUrl} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-black text-slate-700">Abrir e-mail</a>
          </div>
          <p className="mt-3 text-xs text-slate-500">Os atalhos abrem uma mensagem pronta para o cliente. O PDF precisa ser anexado manualmente nesses atalhos.</p>
        </section>
      ) : null}

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
              {oficina?.nome ?? 'Minha Oficina'}
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
              {observacoes}
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
