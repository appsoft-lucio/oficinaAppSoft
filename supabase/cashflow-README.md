# Receitas e despesas

O financeiro passa a usar dois conceitos distintos:

- **Caixa:** movimentos pela data de recebimento/pagamento, independentemente da
  abertura da ordem. Receita líquida de estornos menos despesas e repasses pagos.
- **Ordens:** recebidos, pendências e comissões previstas das ordens, filtradas
  pela data de abertura. Previsão de comissão não confirma pagamento ao mecânico.

Os recebimentos de uma ordem geram automaticamente movimentos de caixa no banco.
Um pagamento parcial seguido do pagamento total registra somente a diferença.
Reduzir um recebimento gera um estorno, preservando o histórico. Recebimentos
automáticos são somente de leitura no caixa e são corrigidos no pagamento da
ordem. Cancelar uma ordem, por si só, não devolve dinheiro: a atualização do
recebimento é que produz o estorno.

Receitas extras e despesas são manuais. Para pagar comissão, escolha despesa,
categoria **Repasse ao mecânico**, mecânico, valor e data. O repasse será deduzido
uma única vez, separado das demais despesas. Custos de peças precisam ser
lançados como despesas: o preço cobrado na ordem não determina o custo de compra.

Lançamentos manuais podem ser editados, cancelados e reativados. Cancelados
permanecem no histórico, mas saem do cálculo. A autoria e as alterações são
registradas para dono e gerente. As políticas do banco isolam as oficinas.

Recebimentos anteriores à migration não têm histórico de datas de pagamento.
Eles são importados uma vez, usando a data de abertura da ordem e a marca
`data_estimada = true`, mostrada na tela. Portanto, a distribuição histórica por
período é estimada; novos recebimentos usam a data real da atualização do
pagamento. Datas automáticas usam America/Sao_Paulo.

O resultado apresentado é a diferença entre as entradas e saídas registradas;
não consulta saldo bancário e não inclui despesas ou saldos iniciais não lançados.

Ativação, no projeto Supabase vinculado:

```powershell
supabase db push
```

A migration é `migrations/20261015200000_add_cashflow.sql`. Não é necessária
uma nova Edge Function. Publique o frontend após atualizar o banco.

Verificação: `tests/cashflow.sql` usa uma transação com rollback e deve rodar
somente no banco de teste, com todas as migrations aplicadas.
