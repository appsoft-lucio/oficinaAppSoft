# Estrutura do Banco de Dados

## Tabelas

### users
- id (UUID)
- name (string)
- email (string)
- password_hash (string)
- company_id (UUID FK)
- role (enum: admin, mechanic, manager)
- created_at
- updated_at

### companies
- id (UUID)
- name (string)
- cnpj (string)
- email (string)
- phone (string)
- address (string)
- certificate_path (string)
- certificate_password (encrypted)
- nfe_series (int)
- created_at
- updated_at

### customers
- id (UUID)
- company_id (UUID FK)
- name (string)
- cpf_cnpj (string)
- email (string)
- phone (string)
- address (string)
- rating (int)
- created_at
- updated_at

### vehicles
- id (UUID)
- customer_id (UUID FK)
- brand (string)
- model (string)
- year (int)
- plate (string)
- km (int)
- created_at
- updated_at

### orders
- id (UUID)
- company_id (UUID FK)
- customer_id (UUID FK)
- vehicle_id (UUID FK)
- status (enum: draft, progress, completed, cancelled)
- km_in (int)
- km_out (int)
- total_amount (decimal)
- notes (text)
- created_at
- updated_at

### order_items
- id (UUID)
- order_id (UUID FK)
- description (string)
- type (enum: material, labor)
- quantity (decimal)
- unit_price (decimal)
- total_price (decimal)

### invoices
- id (UUID)
- company_id (UUID FK)
- order_id (UUID FK)
- number (string)
- series (string)
- type (enum: nfe, rpa)
- status (enum: draft, sent, completed, cancelled)
- issued_at
- total_amount (decimal)
- xml_content (text)
- pdf_url (string)
- created_at
- updated_at

A ser detalhado...
