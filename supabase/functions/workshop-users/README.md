# Gerentes e autoria dos registros

Antes de publicar o frontend, aplique as migrations pendentes e publique esta função:

```powershell
supabase db push
supabase functions deploy workshop-users
```

O projeto deve estar vinculado ao Supabase correto (`supabase link`). A função usa
`SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente da
Edge Function. Nunca coloque a chave de serviço no frontend.

`verify_jwt = false` permite o mesmo fluxo da função de login existente. A função
valida a sessão com `auth.getUser()` e verifica no banco se o solicitante é o dono
de uma oficina ativa antes de usar qualquer operação administrativa.

No app, o dono acessa **Equipe e atividades**, informa nome, e-mail, usuário
opcional e senha inicial do gerente. A conta é criada e confirmada pelo dono; este
fluxo não envia convite por e-mail. O dono entrega as credenciais ao gerente,
que usa a tela normal de login. E-mails ou usuários existentes são rejeitados,
sem reassociar contas de outras oficinas. A criação não troca a sessão do dono.

Gerentes operam os dados da oficina vinculada. Apenas o dono pode cadastrar,
desativar e reativar gerentes. A desativação bloqueia o acesso aos dados mesmo
com uma sessão aberta. Os registros e a autoria anterior são preservados.

A migration `20261015190000_add_workshop_managers.sql` adiciona políticas de
acesso para a equipe, autoria automática e histórico de operações. A autoria de
cadastros anteriores fica vazia, pois não é possível determinar com segurança
quem os criou. Operações novas identificam nome e perfil no momento da ação.
O log é somente de leitura para os usuários e não armazena senhas.

Testes SQL: execute `supabase/tests/workshop_managers.sql` no banco de teste após
aplicar todas as migrations. O script usa uma transação e desfaz os dados de teste.
