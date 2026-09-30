# Login por e-mail ou usuário

O login por e-mail continua funcionando diretamente pelo Supabase Auth. Para habilitar o login por usuário, aplique a migration e publique a função no projeto Supabase correspondente ao frontend:

```sh
supabase db push
supabase functions deploy username-login
```

A configuração `verify_jwt = false` permite o acesso antes do login. A função valida a senha pelo Supabase Auth antes de retornar tokens. As chaves de serviço permanecem somente no servidor; os vínculos entre usuário e conta não podem ser consultados por clientes anônimos ou autenticados. As tentativas por usuário são limitadas a dez por minuto.

Novos cadastros escolhem um usuário único com 3 a 30 letras sem acentos, números ou `_`, sem distinguir maiúsculas e minúsculas. A unicidade é garantida pelo banco, inclusive em cadastros simultâneos.

Contas antigas continuam usando o e-mail. Para atribuir um usuário a uma conta existente, execute no SQL Editor, substituindo os valores:

```sql
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('username', 'lucio_dev')
where email = 'seu-email@dominio.com';
```

Após publicar, verifique: cadastro com usuário novo, rejeição de usuário duplicado, login por e-mail e por usuário (também em maiúsculas), senha incorreta, usuário inexistente, conta não confirmada e conta bloqueada. Confirme também os redirecionamentos de administrador e oficina com avaliação expirada. Não registre senhas ou tokens em logs.

Referência: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
