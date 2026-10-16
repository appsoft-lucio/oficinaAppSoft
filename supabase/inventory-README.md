# Controle de estoque

Acesse **Estoque** no menu. Cada produto tem nome, descrição, preço de venda,
foto opcional, código/número de série, quantidade e estoque mínimo. O código é
único por oficina, sem diferenciar maiúsculas, minúsculas ou espaços externos.
Para unidades com números de série diferentes, use um cadastro por unidade.
Itens vendidos por quantidade podem compartilhar o código do produto em um só
cadastro. Quantidades aceitam até 3 casas decimais; preços, até 2.

O cadastro usa `cadastrar_produto`: cria o produto e registra um saldo inicial
positivo na mesma transação. Saldo zero não gera movimentação fictícia. A edição
altera os dados e a foto, mas não altera diretamente a quantidade.

Em **Movimentar / histórico**:

- **Entrada:** soma a quantidade recebida.
- **Saída:** subtrai a quantidade utilizada. O banco rejeita estoque insuficiente.
- **Ajuste:** informa o saldo final após contagem. Pode zerar o estoque.

Cada operação requer um motivo e registra quantidade, saldo anterior e posterior,
data/hora gerada no banco e autor (dono/gerente). O histórico é somente de leitura.
Correções são feitas com uma nova movimentação, preservando os registros anteriores.
`movimentar_estoque` bloqueia a linha do produto durante a transação para impedir
que duas saídas usem o mesmo saldo. Os usuários não têm permissão de atualizar a
coluna de quantidade diretamente.

As fotos ficam no bucket privado `estoque-produtos`, separadas por
`oficina_id/produto_id/arquivo`. São permitidos JPG, PNG e WebP de até 5 MB, com
limites no cliente e no Storage. A exibição usa URLs assinadas por uma hora,
renováveis pelo botão de tentar novamente quando expirarem. A troca/remoção de
foto só exclui a foto anterior após salvar o produto com sucesso. Uma falha de
rede durante o salvamento pode deixar um upload privado sem vínculo; ele não é
apagado automaticamente, pois a transação pode ter sido confirmada no servidor.

Dono e gerente ativo podem operar o estoque da sua oficina. Produtos,
movimentações e fotos respeitam as políticas de acesso, inclusive suspensão da
oficina e revogação do gerente. O bucket não deve ser tornado público.

O uso das peças deve ser registrado como saída no estoque. Neste cadastro, os
itens de peça em uma OS ainda são textos/valores independentes; a emissão de uma
OS não faz baixa automática nem lança compras no financeiro.

Ativação: `supabase db push` aplica
`migrations/20261016120000_add_inventory.sql`, incluindo tabelas, funções, bucket
e políticas do Storage. Publique o frontend após atualizar o banco.

Testes SQL: `tests/inventory.sql`, em banco de teste com esquema Storage disponível,
usa rollback. Verifica criação, duplicidade de código, quantidade fracionada,
saldo insuficiente, autoria, bloqueio de alteração direta, isolamento das fotos e
estoque entre oficinas e acesso revogado de gerente.
