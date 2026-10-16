# Histórico do mecânico

Acesse **Mecânicos → Ver histórico**. A tela reúne cadastro, contatos, data e
autoria do cadastro, serviços e veículos associados, histórico das OS, comissão
prevista atual e repasses registrados como pagos no financeiro. Há filtro de
período e totais de repasse por mês; pagamentos cancelados não somam no recebido.

Os serviços usam a data de entrada do veículo e, quando desconhecida, a data de
criação da OS. Repasses usam a data do pagamento. Comissão prevista e pagamento
são conceitos separados: um repasse pode abranger várias OS, e o sistema não
deduz uma quitação por OS nem um saldo devido a partir da diferença desses totais.

A tabela `mecanico_servicos`, mantida por trigger, preserva o último retrato da
participação de cada mecânico em uma OS. Quando ele é retirado, o título,
descrição, veículo, cliente, status e regras de comissão da última participação
ficam preservados. Alterações posteriores da OS não são atribuídas a ele. Uma
reinclusão reativa a mesma associação, sem duplicar a contagem de OS; mudanças
anteriores continuam disponíveis na linha do tempo da própria OS.

Na ativação, vínculos atuais são importados sem inventar a data original de
inclusão. Vínculos anteriores são recuperados quando a retirada já consta em
`ordem_eventos`; nesses casos, os dados anteriores do serviço e da comissão que
não puderem ser determinados são mostrados como indisponíveis. Participações
removidas antes de existir um registro no sistema não podem ser reconstruídas.

Os pagamentos exibidos são os lançamentos da categoria `repasse_mecanico` com o
ID do profissional, inclusive participações antigas. A data do pagamento e a do
lançamento são mostradas separadamente, com autoria e cancelamentos. Não são
presumidos repasses feitos fora do sistema.

Consultas são limitadas à oficina e ao mecânico selecionados e carregam todas
as páginas de dados. A interface mostra serviços/pagamentos em lotes de 20. Dono
e gerente ativo podem consultar; os snapshots não podem ser alterados diretamente
pelos usuários. As políticas respeitam suspensão da oficina e revogação do gerente.

Ativação: `supabase db push`, aplicando
`migrations/20261016110000_add_mechanic_service_history.sql`, seguido da publicação
do frontend. Teste SQL: `tests/mechanic_history.sql`, em banco de teste, com rollback.
