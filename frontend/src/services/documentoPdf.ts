import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

type DocumentoPdf = {
  titulo: string
  referencia: string
  oficina: string
  cliente: string[]
  veiculo: string[]
  servico: { titulo: string; descricao: string; valor: number }
  pecas: { descricao: string; quantidade: number; valor: number }[]
  observacoes: string
}

const moeda = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function criarDocumentoPdf(data: DocumentoPdf) {
  const doc = new jsPDF()
  const margin = { left: 14, right: 14 }
  doc.setProperties({ title: `${data.titulo} - ${data.oficina}` })
  doc.setFontSize(20)
  doc.text(data.titulo, 14, 20)
  autoTable(doc, {
    startY: 27,
    margin,
    theme: 'plain',
    body: [[data.oficina], [`Documento: ${data.referencia}`], [`Gerado em ${new Date().toLocaleDateString('pt-BR')}`]],
    styles: { fontSize: 10, overflow: 'linebreak' },
  })
  const endY = () => (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  autoTable(doc, {
    startY: endY() + 5,
    margin,
    head: [['Cliente', 'Veículo']],
    body: [[data.cliente.join('\n'), data.veiculo.join('\n')]],
    styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [15, 23, 42] },
    columnStyles: { 0: { cellWidth: 91 }, 1: { cellWidth: 91 } },
  })
  const totalPecas = data.pecas.reduce((total, item) => total + item.quantidade * item.valor, 0)
  autoTable(doc, {
    startY: endY() + 7,
    margin,
    head: [['Item', 'Qtd.', 'Unitário', 'Valor']],
    body: [
      [`Serviço: ${data.servico.titulo}\n${data.servico.descricao}`, '1', moeda(data.servico.valor), moeda(data.servico.valor)],
      ...data.pecas.map((item) => [`Peça: ${item.descricao}`, item.quantidade.toLocaleString('pt-BR'), moeda(item.valor), moeda(item.quantidade * item.valor)]),
    ],
    foot: [['Peças', '', '', moeda(totalPecas)], ['Total', '', '', moeda(data.servico.valor + totalPecas)]],
    showFoot: 'lastPage',
    rowPageBreak: 'avoid',
    styles: { fontSize: 10, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [15, 23, 42] },
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 91 }, 1: { cellWidth: 17, halign: 'right' },
      2: { cellWidth: 37, halign: 'right' }, 3: { cellWidth: 37, halign: 'right' },
    },
  })
  autoTable(doc, {
    startY: endY() + 7,
    margin,
    theme: 'plain',
    body: [[`Observações\n${data.observacoes}`], ['\n\n________________________________________\nNome e assinatura do cliente']],
    styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
    rowPageBreak: 'avoid',
  })
  return doc
}
