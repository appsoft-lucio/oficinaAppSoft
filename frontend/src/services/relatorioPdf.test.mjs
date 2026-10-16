import assert from 'node:assert/strict'
import test from 'node:test'
import {gerarRelatorioPdf} from './relatorioPdf.ts'

const ordem={id:'ordem-1',titulo:'Revisão',descricao:'Troca de óleo',cliente_id:'cliente',veiculo_id:'veiculo',created_at:'2026-10-16T12:00:00Z',entrada_em:'2026-10-16T11:00:00Z',status:'concluida',pagamento_status:'parcial',valor:350,valor_servico:200,valor_pago:100,comissao_percentual:50}
test('exports a real PDF with customer, vehicle and financial data',()=>{
  const doc=gerarRelatorioPdf('Oficina São José',[ordem],[{id:'cliente',nome:'João'}],[{id:'veiculo',modelo:'Civic',placa:'ABC1234'}])
  const content=doc.output()
  assert.ok(content.startsWith('%PDF-'))
  for(const value of ['Oficina São José','João','Civic','ABC1234','Revisão','350,00','100,00','250,00'])assert.ok(content.includes(value),value)
  assert.equal(doc.getNumberOfPages(),1)
})
test('supports an empty workshop and paginates long reports',()=>{
  assert.ok(gerarRelatorioPdf('Oficina',[],[],[]).output().includes('Nenhuma ordem'))
  const doc=gerarRelatorioPdf('Oficina',Array.from({length:60},(_,index)=>({...ordem,id:`ordem-${index}`})),[],[])
  assert.ok(doc.getNumberOfPages()>1)
  assert.ok(doc.output().includes('ordem-59'))
})
