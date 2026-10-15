import assert from 'node:assert/strict'
import test from 'node:test'
import { criarDocumentoPdf } from './documentoPdf.ts'

const documento = {
  titulo: 'Orçamento', referencia: 'ordem-123', oficina: 'Oficina São José',
  cliente: ['João', 'Telefone: 123456789', 'E-mail: cliente@example.com'],
  veiculo: ['Civic', 'Placa: ABC1234', 'Ano: 2020'],
  servico: { titulo: 'Revisão', descricao: 'Troca de óleo', valor: 200 },
  pecas: [{ descricao: 'Filtro', quantidade: 2, valor: 35.5 }],
  observacoes: 'Sujeito a aprovação do cliente.',
}

test('gera PDF com dados do orçamento e total de mão de obra mais peças', () => {
  const pdf = criarDocumentoPdf(documento)
  const content = pdf.output()
  assert.ok(content.startsWith('%PDF-'))
  for (const text of ['Orçamento', 'Oficina São José', 'João', 'ABC1234', 'Filtro', '271,00']) {
    assert.ok(content.includes(text), `PDF deve conter ${text}`)
  }
  assert.equal(pdf.getNumberOfPages(), 1)
})

test('divide orçamento extenso em páginas sem perder peças ou assinatura', () => {
  const pdf = criarDocumentoPdf({
    ...documento,
    pecas: Array.from({ length: 100 }, (_, index) => ({
      descricao: `Item ${index + 1} - descrição detalhada para teste de quebra de linha e paginação`,
      quantidade: 1, valor: 10,
    })),
  })
  assert.ok(pdf.getNumberOfPages() > 1)
  const content = pdf.output()
  assert.ok(content.includes('Item 100'))
  assert.ok(content.includes('1.200,00'))
  assert.ok(content.includes('Nome e assinatura do cliente'))
})
