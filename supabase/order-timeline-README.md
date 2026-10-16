# Entrada e histórico das ordens de serviço

Cada nova OS tem `entrada_em` (data/hora de entrada do veículo), independente de
`created_at` (cadastro da OS). O formulário permite informar e corrigir a entrada.
O banco armazena os instantes com fuso (`timestamptz`); a interface usa o fuso
do dispositivo para entrada e exibição, incluindo os segundos.

A tabela `ordem_eventos` é somente de leitura para dono e gerente e respeita o
acesso à oficina. Um trigger registra criação e alterações efetivas nos dados
da OS, inclusive status, entrada, valores, pagamento e comissão. Cada evento
guarda o status anterior/novo, campos alterados com valores anteriores/novos,
nome e perfil do autor no momento da ação e o horário gerado no banco.
Salvar o mesmo status sem mudança nos dados não duplica eventos.

A edição com entrada usa `editar_ordem_com_entrada`, que reaproveita a validação
da edição existente e salva todas as mudanças na mesma transação. Se a entrada
for corrigida juntamente com outros dados, o histórico registra ambas as etapas
da transação. Falhas desfazem toda a edição e os eventos correspondentes.

OS antigas mantêm a entrada desconhecida até alguém informar o horário real.
O histórico começa com um marco do status existente no momento da migration,
sem inventar autor ou transições anteriores. O horário desse marco é a ativação
do histórico, e não a data em que aquele status foi escolhido.

A entrada aparece na lista de ordens, histórico de cliente/veículo, documento
e PDF e no CSV exportado. Cada OS permite abrir a linha do tempo e carregar
alterações anteriores, 50 por vez. Os eventos são atualizados ao abrir o
histórico ou salvar uma alteração pela página; mudanças feitas em outro
dispositivo aparecem após recarregar a OS.

Ativação: aplique `migrations/20261016100000_add_order_timeline.sql` com
`supabase db push` antes de publicar o frontend. Testes SQL em
`tests/order_timeline.sql` usam rollback e devem rodar em banco de teste.
