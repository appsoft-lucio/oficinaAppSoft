import { supabase } from '../lib/supabase'
import { calcularRepasses } from './repasses'
import type { Mecanico } from './mecanicos'
import type { OrdemServico } from './ordens'
import type { AutorRegistro } from './equipe'
import type { Lancamento } from './caixa'

export type MecanicoServico = {
  mecanico_id: string; ordem_id: string; vinculado: boolean; vinculado_em: string | null; desvinculado_em: string | null
  atualizado_em: string; autor: AutorRegistro | null; titulo: string | null; descricao: string | null; status: string | null
  cliente_nome: string | null; veiculo_id: string | null; veiculo_nome: string | null; placa: string | null
  entrada_em: string | null; ordem_created_at: string; valor_servico: number | null; comissao_percentual: number | null
  mecanico_ids: string[] | null; mecanico_divisao: Record<string,number> | null
  ordem: Pick<OrdemServico,'id'|'created_at'|'entrada_em'|'alterado_em'|'status'> | null
}
export type MecanicoPagamento = Lancamento & { created_at: string }
export type MecanicoHistoricoData = { mecanico: Mecanico; servicos: MecanicoServico[]; pagamentos: MecanicoPagamento[] }

export async function getMecanicoHistorico(oficinaId: string, mecanicoId: string): Promise<MecanicoHistoricoData> {
  const { data:mecanico,error } = await supabase.from('mecanicos')
    .select('id,nome,telefone,email,created_at,criado_por,alterado_por,alterado_em')
    .eq('oficina_id',oficinaId).eq('id',mecanicoId).single()
  if (error || !mecanico) throw new Error('Mecânico não encontrado nesta oficina.')
  const servicos: MecanicoServico[] = []
  const pagamentos: MecanicoPagamento[] = []
  await Promise.all([
    (async () => {
      for(let offset=0;;offset+=1000) {
        const { data,error:queryError } = await supabase.from('mecanico_servicos')
          .select('mecanico_id,ordem_id,vinculado,vinculado_em,desvinculado_em,atualizado_em,autor,titulo,descricao,status,cliente_nome,veiculo_id,veiculo_nome,placa,entrada_em,ordem_created_at,valor_servico,comissao_percentual,mecanico_ids,mecanico_divisao,ordem:ordens_servico(id,created_at,entrada_em,alterado_em,status)')
          .eq('oficina_id',oficinaId).eq('mecanico_id',mecanicoId)
          .order('ordem_created_at',{ ascending:false }).order('ordem_id').range(offset,offset+999)
        if(queryError) throw queryError
        servicos.push(...data as unknown as MecanicoServico[])
        if(data.length<1000) break
      }
    })(),
    (async () => {
      for(let offset=0;;offset+=1000) {
        const { data,error:queryError } = await supabase.from('lancamentos_financeiros')
          .select('id,tipo,categoria,descricao,valor,data,origem,ordem_id,mecanico_id,cancelado,data_estimada,created_at,criado_por,alterado_por,alterado_em')
          .eq('oficina_id',oficinaId).eq('mecanico_id',mecanicoId).eq('categoria','repasse_mecanico').eq('tipo','despesa')
          .order('data',{ ascending:false }).order('id').range(offset,offset+999)
        if(queryError) throw queryError
        pagamentos.push(...data as MecanicoPagamento[])
        if(data.length<1000) break
      }
    })(),
  ])
  return { mecanico,servicos,pagamentos }
}

export function comissaoServicoMecanico(item: MecanicoServico) {
  if(item.valor_servico===null || item.comissao_percentual===null || !item.mecanico_ids || !item.mecanico_divisao) return null
  return calcularRepasses(Number(item.valor_servico),item.mecanico_ids,item.mecanico_divisao,item.comissao_percentual)
    .find((repasse) => repasse.mecanicoId===item.mecanico_id)?.valor ?? null
}

export function resumirHistoricoMecanico(servicos: MecanicoServico[],pagamentos: MecanicoPagamento[]) {
  const atuais=servicos.filter((item) => item.vinculado && item.status!=='cancelada')
  const ativos=pagamentos.filter((item) => !item.cancelado)
  const comissao=atuais.reduce((total,item) => total+Math.round((comissaoServicoMecanico(item)??0)*100),0)
  const elegiveis=servicos.filter((item) => item.status!=='cancelada')
  const comissaoTotal=elegiveis.reduce((total,item) => total+Math.round((comissaoServicoMecanico(item)??0)*100),0)
  const recebido=ativos.reduce((total,item) => total+Math.round(Number(item.valor)*100),0)
  return {
    servicos:servicos.length,
    concluidos:servicos.filter((item) => item.status==='concluida').length,
    emAberto:atuais.filter((item) => item.status!=='concluida').length,
    anteriores:servicos.filter((item) => !item.vinculado).length,
    veiculos:new Set(servicos.filter((item) => item.veiculo_id).map((item) => item.veiculo_id)).size,
    comissaoPrevista:comissao/100,
    comissaoTotal:comissaoTotal/100,
    recebido:recebido/100,
    aReceber:Math.max(comissaoTotal-recebido,0)/100,
    adiantamento:Math.max(recebido-comissaoTotal,0)/100,
    semComissao:elegiveis.filter((item) => comissaoServicoMecanico(item)===null).length,
    pagamentos:ativos.length,
  }
}
