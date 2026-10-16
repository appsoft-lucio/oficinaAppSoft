import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Cliente } from './clientes'
import type { OrdemServico } from './ordens'
import type { Veiculo } from './veiculos'

const labels:Record<string,string>={aberta:'Aberta',em_andamento:'Em andamento',aguardando_peca:'Aguardando peça',concluida:'Concluída',cancelada:'Cancelada',em_aberto:'Em aberto',parcial:'Parcial',pago:'Pago'}
const moeda=(value:number)=>Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const dataHora=(value:string|null|undefined)=>value?new Date(value).toLocaleString('pt-BR'):'Não informada'
function recebido(ordem:OrdemServico){
  return ordem.pagamento_status==='pago'?Number(ordem.valor):ordem.pagamento_status==='parcial'?Math.max(0,Math.min(Number(ordem.valor_pago),Number(ordem.valor))):0
}

export function gerarRelatorioPdf(oficina:string,ordens:OrdemServico[],clientes:Cliente[],veiculos:Veiculo[]){
  const doc=new jsPDF({orientation:'landscape',format:'a4'})
  const margin={left:12,right:12,top:12,bottom:15}
  doc.setProperties({title:`Relatório da oficina - ${oficina}`})
  doc.setFontSize(19)
  doc.text('Relatório da oficina',12,20)
  autoTable(doc,{
    startY:26,margin,theme:'plain',
    body:[[oficina],[`Gerado em ${new Date().toLocaleString('pt-BR')} · ${ordens.length} ordem(ns) listada(s)`]],
    styles:{fontSize:10,overflow:'linebreak',cellPadding:1},
  })
  const endY=()=>(doc as jsPDF & {lastAutoTable:{finalY:number}}).lastAutoTable.finalY
  const validas=ordens.filter((ordem)=>ordem.status!=='cancelada')
  const previsto=validas.reduce((sum,ordem)=>sum+Math.round(Number(ordem.valor)*100),0)/100
  const pago=validas.reduce((sum,ordem)=>sum+Math.round(recebido(ordem)*100),0)/100
  autoTable(doc,{
    startY:endY()+4,margin,
    head:[['OS não canceladas','Valor dessas OS','Recebido nessas OS','A receber nessas OS']],
    body:[[String(validas.length),moeda(previsto),moeda(pago),moeda(Math.max(previsto-pago,0))]],
    headStyles:{fillColor:[15,23,42]},styles:{fontSize:10,cellPadding:3},
  })
  const clientesById=new Map(clientes.map((cliente)=>[cliente.id,cliente]))
  const veiculosById=new Map(veiculos.map((veiculo)=>[veiculo.id,veiculo]))
  autoTable(doc,{
    startY:endY()+7,margin,
    head:[['OS','Cadastro / entrada','Cliente','Veículo / placa','Serviço / descrição','Status / pagamento','Mão de obra','Peças','Total','Recebido','Comissão']],
    body:ordens.length?ordens.map((ordem)=>{
      const veiculo=veiculosById.get(ordem.veiculo_id??'')
      return [ordem.id,`Cadastro: ${dataHora(ordem.created_at)}\nEntrada: ${dataHora(ordem.entrada_em)}`,
        clientesById.get(ordem.cliente_id??'')?.nome??'Cliente não informado',
        `${veiculo?.modelo??'Veículo não informado'}\n${veiculo?.placa??'Placa não informada'}`,
        `${ordem.titulo}\n${ordem.descricao??''}`,`${labels[ordem.status]??ordem.status}\n${labels[ordem.pagamento_status]??ordem.pagamento_status}`,
        moeda(Number(ordem.valor_servico)),moeda(Number(ordem.valor)-Number(ordem.valor_servico)),moeda(Number(ordem.valor)),moeda(recebido(ordem)),`${ordem.comissao_percentual}%`]
    }):[[{content:'Nenhuma ordem de serviço cadastrada.',colSpan:11}]],
    styles:{fontSize:7,cellPadding:2,overflow:'linebreak',valign:'top'},
    headStyles:{fillColor:[15,23,42],fontSize:7},alternateRowStyles:{fillColor:[248,250,252]},
    rowPageBreak:'avoid',showHead:'everyPage',
    columnStyles:{0:{cellWidth:28},1:{cellWidth:34},2:{cellWidth:32},3:{cellWidth:28},4:{cellWidth:42},5:{cellWidth:26},6:{cellWidth:18,halign:'right'},7:{cellWidth:16,halign:'right'},8:{cellWidth:18,halign:'right'},9:{cellWidth:18,halign:'right'},10:{cellWidth:13,halign:'right'}},
  })
  for(let page=1;page<=doc.getNumberOfPages();page++){
    doc.setPage(page);doc.setFontSize(8);doc.setTextColor(100,116,139)
    doc.text('Relatório de ordens de serviço',12,doc.internal.pageSize.getHeight()-6)
    doc.text(`Página ${page} de ${doc.getNumberOfPages()}`,doc.internal.pageSize.getWidth()-12,doc.internal.pageSize.getHeight()-6,{align:'right'})
  }
  return doc
}
