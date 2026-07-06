# Documentação da API

## Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Criar cliente
- `GET /api/customers/:id` - Detalhes do cliente
- `PUT /api/customers/:id` - Atualizar cliente
- `DELETE /api/customers/:id` - Deletar cliente

### Ordens de Serviço
- `GET /api/orders` - Listar ordens
- `POST /api/orders` - Criar ordem
- `GET /api/orders/:id` - Detalhes da ordem
- `PUT /api/orders/:id` - Atualizar ordem
- `DELETE /api/orders/:id` - Cancelar ordem

### Notas Fiscais
- `POST /api/invoices/emit` - Emitir nota fiscal
- `GET /api/invoices/:id` - Detalhes da nota
- `GET /api/invoices/:id/pdf` - Download PDF

### Relatórios
- `GET /api/reports/dashboard` - Dashboard
- `GET /api/reports/revenue` - Receita
- `GET /api/reports/services` - Serviços

A ser detalhado...
