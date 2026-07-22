# Painel do desenvolvedor

Depois de aplicar as migrations, autorize o primeiro desenvolvedor pelo SQL Editor:

```sql
insert into public.app_admins (user_id)
select id from auth.users where email = 'seu-email@dominio.com';
```

Publique a função e abra `/desenvolvedor` depois de entrar com essa conta:

```sh
supabase functions deploy developer-clients
```

A função usa `SUPABASE_SERVICE_ROLE_KEY`, disponibilizada automaticamente pelo Supabase. Nunca exponha essa chave no frontend.
