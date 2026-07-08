# Wireframe - App Oficina Mecânica

## 1. FLUXO DE NAVEGAÇÃO

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUXO GERAL DO APP                        │
└─────────────────────────────────────────────────────────────┘

LOGIN → DASHBOARD → [CLIENTES | ORDENS | RELATÓRIOS | PERFIL]
                        ↓
                    [DETALHES CLIENTE]
                        ↓
                    [CRIAR ORDEM SERVIÇO]
```

---

## 2. TELA 01 - LOGIN

```
┌──────────────────────────────────┐
│                                  │
│     OFICINA APP SOFT             │
│                                  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Email ou Usuário          │  │
│  │  [___________________]     │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Senha                     │  │
│  │  [___________________]     │  │
│  └────────────────────────────┘  │
│                                  │
│  [ ENTRAR ]  [ CADASTRO ]        │
│                                  │
│  ┌────────────────────────────┐  │
│  │ ☐ Lembrar-me               │  │
│  │ [ Esqueci minha senha ]    │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

### Elementos:
- Logo + Nome App
- Campo Email/Usuário
- Campo Senha
- Botão "Entrar"
- Link "Cadastro"
- Link "Esqueci minha senha"
- Checkbox "Lembrar-me"

---

## 3. TELA 02 - DASHBOARD (HOME)

```
┌──────────────────────────────────────────────┐
│  ☰  DASHBOARD              [⚙] [👤]          │
├──────────────────────────────────────────────┤
│                                              │
│  Bem-vindo, João!                            │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  📊 RESUMO DO DIA                    │   │
│  ├──────────────────────────────────────┤   │
│  │ Ordens Hoje:     5                   │   │
│  │ Concluídas:      3                   │   │
│  │ Pendentes:       2                   │   │
│  │ Receita Hoje:    R$ 1.450,00         │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌─────────────┬─────────────┬─────────────┐│
│  │ 👥 CLIENTES │ 📋 ORDENS   │ 📈 RELAT.  ││
│  │    152      │    45       │   GRÁFICO  ││
│  └─────────────┴─────────────┴─────────────┘│
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  ⚡ AÇÕES RÁPIDAS                     │   │
│  ├──────────────────────────────────────┤   │
│  │ [+ Nova Ordem]  [+ Novo Cliente]    │   │
│  │ [Buscar Ordem]  [Relatório]         │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  🔔 NOTIFICAÇÕES RECENTES            │   │
│  ├──────────────────────────────────────┤   │
│  │ • Ordem #2541 concluída              │   │
│  │ • Cliente novo registrado            │   │
│  │ • Relatório disponível               │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [HOME] [CLIENTES] [ORDENS] [PERFIL]        │
└──────────────────────────────────────────────┘
```

### Elementos:
- Menu (hambúrguer)
- Saudação personalizável
- Cards com resumo (Ordens, Receita, etc)
- 3 Botões de acesso rápido (Clientes, Ordens, Relatórios)
- Ações rápidas
- Notificações recentes
- Bottom navigation com 4 abas

---

## 4. TELA 03 - LISTA DE CLIENTES

```
┌──────────────────────────────────────────────┐
│  ☰  CLIENTES                [🔍] [+]         │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ 🔍 [Buscar cliente...]                │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Filtros: [Todos ▼] [Ativos ▼]             │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ João Silva                    Tel      │ │
│  │ joao@email.com                ⭐⭐⭐⭐   │ │
│  │ Última visita: 15/07/2026              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ Maria Santos                  Tel      │ │
│  │ maria@email.com               ⭐⭐⭐    │ │
│  │ Última visita: 10/07/2026              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ Pedro Costa                   Tel      │ │
│  │ pedro@email.com               ⭐⭐     │ │
│  │ Última visita: 05/07/2026              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [HOME] [CLIENTES] [ORDENS] [PERFIL]        │
└──────────────────────────────────────────────┘
```

### Elementos:
- Barra de busca
- Filtros (Status, Data, etc)
- Cada cliente em um card com:
  - Nome
  - Email
  - Avaliação (estrelas)
  - Data da última visita
  - Botão menu (...)
- Botão flutuante "+" para novo cliente

---

## 5. TELA 04 - DETALHES DO CLIENTE

```
┌──────────────────────────────────────────────┐
│  ← JOÃO SILVA                   [⋯] [EDITAR] │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │         👤                             │ │
│  │    João Silva                          │ │
│  │    ⭐⭐⭐⭐ (152 avaliações)              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📋 INFORMAÇÕES BÁSICAS                      │
│  ┌────────────────────────────────────────┐ │
│  │ Email:    joao@email.com               │ │
│  │ Telefone: (11) 98765-4321              │ │
│  │ CPF:      123.456.789-00               │ │
│  │ Endereço: Rua A, 123 - SP              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  🚗 VEÍCULOS (3)                             │
│  ┌────────────────────────────────────────┐ │
│  │ Chevrolet Opala 1998 - DDD1111         │ │
│  │ KM: 125.000                            │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ Fiat Uno 2010 - ABS1234                │ │
│  │ KM: 85.000                             │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📝 ÚLTIMAS ORDENS                           │
│  ┌────────────────────────────────────────┐ │
│  │ #2541 - Revisão Geral     01/07/2026   │ │
│  │ #2535 - Troca Óleo        25/06/2026   │ │
│  │ #2520 - Freios            15/06/2026   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [NOVA ORDEM]  [HISTÓRICO]                  │
│                                              │
│  [HOME] [CLIENTES] [ORDENS] [PERFIL]        │
└──────────────────────────────────────────────┘
```

### Elementos:
- Foto/Avatar do cliente
- Nome e avaliação
- Informações de contato
- Lista de veículos
- Histórico de últimas ordens
- Botões de ação (Nova Ordem, Histórico)

---

## 6. TELA 05 - LISTA DE ORDENS

```
┌──────────────────────────────────────────────┐
│  ☰  ORDENS                    [🔍] [+]       │
├──────────────────────────────────────────────┤
│                                              │
│  Filtros: [Todas ▼] [Status ▼]              │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ #2541 - João Silva                     │ │
│  │ Revisão Geral - Chevrolet Opala        │ │
│  │ 01/07/2026 - 🟢 CONCLUÍDA   R$450,00  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ #2540 - Maria Santos                   │ │
│  │ Troca Óleo - Fiat Uno                  │ │
│  │ 30/06/2026 - 🔵 EM PROGRESSO R$180,00 │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ #2539 - Pedro Costa                    │ │
│  │ Alinhamento - Honda Civic               │ │
│  │ 28/06/2026 - 🟠 ORÇAMENTO  R$220,00   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ #2538 - Ana Silva                      │ │
│  │ Freios - VW Golf                        │ │
│  │ 25/06/2026 - 🟡 AGUARDANDO R$350,00   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [HOME] [CLIENTES] [ORDENS] [PERFIL]        │
└──────────────────────────────────────────────┘
```

### Elementos:
- Filtros por status
- Cada ordem em um card com:
  - Número da ordem
  - Nome do cliente
  - Tipo de serviço
  - Data
  - Status (com cor)
  - Valor
- Botão "+" para nova ordem

---

## 7. TELA 06 - CRIAR/EDITAR ORDEM

```
┌──────────────────────────────────────────────┐
│  ← NOVA ORDEM DE SERVIÇO                     │
├──────────────────────────────────────────────┤
│                                              │
│  👤 CLIENTE                                  │
│  ┌────────────────────────────────────────┐ │
│  │ [Selecionar Cliente...        ▼]       │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  🚗 VEÍCULO                                  │
│  ┌────────────────────────────────────────┐ │
│  │ [Selecionar Veículo...        ▼]       │ │
│  │ Placa: _____________                   │ │
│  │ KM Entrada: ________                   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  🔧 SERVIÇOS                                 │
│  ┌────────────────────────────────────────┐ │
│  │ [+ Adicionar Serviço]                  │ │
│  ├────────────────────────────────────────┤ │
│  │ ☑ Revisão Geral............R$ 150,00  │ │
│  │ ☐ Troca Óleo                          │ │
│  │ ☐ Alinhamento                         │ │
│  │ ☑ Freios...................R$ 300,00  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  💰 RESUMO                                   │
│  ┌────────────────────────────────────────┐ │
│  │ Subtotal:        R$ 450,00             │ │
│  │ Desconto:        R$ 0,00               │ │
│  │ TOTAL:           R$ 450,00             │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📌 OBSERVAÇÕES                              │
│  ┌────────────────────────────────────────┐ │
│  │ [_____________________________]         │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [SALVAR COMO RASCUNHO]  [CONFIRMAR ORDEM]  │
│                                              │
│  [HOME] [CLIENTES] [ORDENS] [PERFIL]        │
└──────────────────────────────────────────────┘
```

### Elementos:
- Seletor de cliente
- Seletor de veículo
- KM de entrada
- Lista de serviços (checkbox)
- Preços dinâmicos
- Resumo com total
- Campo de observações
- Botões (Rascunho, Confirmar)

---

## 8. TELA 07 - DETALHES DA ORDEM

```
┌──────────────────────────────────────────────┐
│  ← ORDEM #2541                  [⋯] [EDITAR] │
├──────────────────────────────────────────────┤
│                                              │
│  Status: 🟢 CONCLUÍDA                        │
│                                              │
│  👤 CLIENTE: João Silva                      │
│  📱 (11) 98765-4321                          │
│                                              │
│  🚗 VEÍCULO: Chevrolet Opala 1998            │
│  📍 Placa: DDD1111                           │
│  ⏱️  KM Entrada: 125.000 → KM Saída: 125.150 │
│                                              │
│  📋 SERVIÇOS REALIZADOS                      │
│  ┌────────────────────────────────────────┐ │
│  │ ☑ Revisão Geral................150,00   │ │
│  │ ☑ Troca Óleo.....................80,00  │ │
│  │ ☑ Troca Filtro...................40,00  │
│  │ ☑ Freios........................150,00  │
│  └────────────────────────────────────────┘ │
│                                              │
│  💰 FINANCEIRO                               │
│  ┌────────────────────────────────────────┐ │
│  │ Subtotal:          R$ 420,00            │ │
│  │ Desconto:          R$ 0,00              │ │
│  │ TOTAL:             R$ 420,00            │ │
│  │ Pagamento: 💳 Cartão (01/07)            │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📅 HISTÓRICO                                │
│  ┌────────────────────────────────────────┐ │
│  │ 01/07 10:30 - Ordem criada             │ │
│  │ 01/07 11:00 - Iniciada                 │ │
│  │ 01/07 15:45 - Concluída                │ │
│  │ 01/07 16:00 - Paga                     │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [IMPRIMIR]  [ENVIAR CLIENTE]               │
│                                              │
│  [HOME] [CLIENTES] [ORDENS] [PERFIL]        │
└──────────────────────────────────────────────┘
```

### Elementos:
- Status visual
- Dados do cliente
- Dados do veículo
- Serviços realizados
- Resumo financeiro
- Histórico de status
- Botões (Imprimir, Enviar)

---

## 9. TELA 08 - RELATÓRIOS

```
┌──────────────────────────────────────────────┐
│  ☰  RELATÓRIOS                  [📥]         │
├──────────────────────────────────────────────┤
│                                              │
│  Período: [01/07 - 07/07 ▼]                 │
│                                              │
│  📊 RESUMO GERAL                             │
│  ┌────────────────────────────────────────┐ │
│  │ Total de Ordens:    45                 │ │
│  │ Receita:            R$ 18.540,00       │ │
│  │ Ticket Médio:       R$ 412,00          │ │
│  │ Taxa Conclusão:     94%                │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📈 GRÁFICO - RECEITA DIÁRIA                 │
│  ┌────────────────────────────────────────┐ │
│  │         █                              │ │
│  │     █   █   █                          │ │
│  │ █   █   █   █   █   █                  │ │
│  │ Seg Ter Qua Qui Sex Sab                │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  🏆 TOP SERVIÇOS                             │
│  ┌────────────────────────────────────────┐ │
│  │ 1. Troca Óleo................ 156 x    │ │
│  │ 2. Freios..................... 89 x    │ │
│  │ 3. Alinhamento................ 67 x    │ │
│  │ 4. Revisão Geral.............. 45 x    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  👥 TOP CLIENTES                             │
│  ┌────────────────────────────────────────┐ │
│  │ João Silva............R$ 2.100,00      │ │
│  │ Maria Santos...........R$ 1.850,00     │ │
│  │ Pedro Costa............R$ 1.540,00     │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [📊 DETALHADO]  [📥 EXPORTAR PDF]           │
│                                              │
│  [HOME] [CLIENTES] [ORDENS] [PERFIL]        │
└──────────────────────────────────────────────┘
```

### Elementos:
- Seletor de período
- Resumo com KPIs
- Gráfico de receita
- Top serviços
- Top clientes
- Botões (Detalhado, Exportar)

---

## 10. TELA 09 - EMISSÃO DE NOTA FISCAL (DONO DA OFICINA ESCOLHE)

```
┌──────────────────────────────────────────────┐
│  ← EMITIR NOTA FISCAL #2541                  │
├──────────────────────────────────────────────┤
│                                              │
│  Ordem: #2541 - João Silva                   │
│  Valor Total da Ordem: R$ 570,00             │
│                                              │
│  ⚙️  ESCOLHA O MODELO DE NOTA                 │
│  ┌────────────────────────────────────────┐ │
│  │                                        │ │
│  │ (○) MODELO 1: SÓ PARA CLIENTE         │ │
│  │     📄 RPA - Recibo Provisório        │ │
│  │     ✓ Cliente recebe a nota           │ │
│  │     ✓ Não vai para o governo          │ │
│  │     ✓ Gerado na hora (sem burocr.)    │ │
│  │     ✓ Ótimo para serviços simples     │ │
│  │                                        │ │
│  │ (○) MODELO 2: CLIENTE + GOVERNO       │ │
│  │     🏛️ NF-e - Nota Fiscal Eletrônica  │ │
│  │     ✓ Cliente recebe a nota           │ │
│  │     ✓ Governo recebe também (SEFAZ)   │ │
│  │     ✓ Validade legal total            │ │
│  │     ✓ Com QR Code de rastreabilidade  │ │
│  │                                        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  🔧 SELECIONAR ITENS DA NOTA                 │
│  ┌────────────────────────────────────────┐ │
│  │ Atalhos:                               │ │
│  │ [Completa] [Só Peças] [Customizado]    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📦 ITENS PARA INCLUIR                       │
│  ┌────────────────────────────────────────┐ │
│  │ PEÇAS/MATERIAIS:                       │ │
│  │ ☑ Filtro de Óleo.......R$ 80,00        │ │
│  │ ☑ Fluido Freio.........R$ 40,00        │ │
│  │ Subtotal: R$ 120,00                    │ │
│  │                                        │ │
│  │ MÃO DE OBRA:                           │ │
│  │ ☑ Revisão Geral.......R$ 150,00        │ │
│  │ ☑ Freios..............R$ 300,00        │ │
│  │ Subtotal: R$ 450,00                    │ │
│  │                                        │ │
│  │ [Limpar Tudo] [Selecionar Tudo]        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  💰 RESUMO - SERÁ EMITIDO                    │
│  ┌────────────────────────────────────────┐ │
│  │ Peças/Materiais:    R$ 120,00          │ │
│  │ Mão de Obra:        R$ 450,00          │ │
│  │ ────────────────────────────           │ │
│  │ TOTAL NA NOTA:      R$ 570,00          │ │
│  │                                        │ │
│  │ Para: Cliente + Governo (se NF-e)      │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  💾 DESTINO DA NOTA                          │
│  ┌────────────────────────────────────────┐ │
│  │ ☑ Salvar no Sistema                    │ │
│  │ ☑ Gerar PDF                            │ │
│  │ ☑ Enviar por Email para Cliente        │ │
│  │ ☑ Imprimir                             │ │
│  │ ☑ Enviar para Governo (se NF-e)        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [CANCELAR]  [EMITIR NOTA]                  │
│                                              │
│  [HOME] [CLIENTES] [ORDENS] [PERFIL]        │
└──────────────────────────────────────────────┘
```

### Elementos:
- **DONO DA OFICINA escolhe o modelo:**
  - **Modelo 1 (RPA):** Só cliente vê
  - **Modelo 2 (NF-e):** Cliente E governo recebem
- **Escolher itens:** Com ou sem mão de obra
- **Atalhos:** Completa, Só Peças, Customizado
- **Resumo dinâmico:** Mostra exatamente o que será emitido
- **Destino:** Email, PDF, Impressão, Governo
- **Validações:** Sistema valida tipo de nota e certificado digital

---

## 11. TELA 10 - PERFIL DO USUÁRIO

```
┌──────────────────────────────────────────────┐
│  ☰  PERFIL                      [EDITAR]     │
├──────────────────────────────────────────────┤
│                                              │
│         👤                                   │
│      João Silva                              │
│      Admin - Oficina XYZ                     │
│                                              │
│  ⚙️  CONFIGURAÇÕES                            │
│  ┌────────────────────────────────────────┐ │
│  │ 📝 Editar Perfil                       │ │
│  │ 🔐 Alterar Senha                       │ │
│  │ 🔔 Notificações                        │ │
│  │ 🌐 Idioma              [Português ▼]   │ │
│  │ 🎨 Tema                [Claro ▼]       │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📋 INFORMAÇÕES DA EMPRESA                   │
│  ┌────────────────────────────────────────┐ │
│  │ Oficina XYZ                            │ │
│  │ CNPJ: 12.345.678/0001-90               │ │
│  │ Telefone: (11) 3456-7890               │ │
│  │ Email: contato@oficinaxyz.com          │ │
│  │ Endereço: Rua A, 123 - SP              │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  💼 CONFIGURAÇÕES FISCAIS                    │
│  ┌────────────────────────────────────────┐ │
│  │ 🔐 Certificado Digital A1/A3           │ │
│  │    Válido até: 15/12/2027              │ │
│  │ 📜 Série NF-e: [001 ▼]                 │ │
│  │ 🏢 Regime Tributário: Simples Nacional │ │
│  │ 🔑 Senha Certificado: ••••••••         │ │
│  │ 🌐 Ambiente: [Produção ▼]              │ │
│  │ 📡 Integração SEFAZ: ✅ Ativa          │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  👥 GERENCIAMENTO DE USUÁRIOS                │
│  ┌────────────────────────────────────────┐ │
│  │ [👤 Usuários]  [👥 Equipe]             │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ℹ️  SOBRE O APP                              │
│  ┌────────────────────────────────────────┐ │
│  │ Versão: 1.0.0                          │ │
│  │ Última Atualização: 01/07/2026         │ │
│  │ [Verificar Atualizações]                │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  [SAIR]  [SUPORTE]                          │
│                                              │
│  [HOME] [CLIENTES] [ORDENS] [PERFIL]        │
└──────────────────────────────────────────────┘
```

### Elementos:
- Avatar do usuário
- Dados do usuário
- Configurações gerais
- Informações da empresa
- Gerenciamento de usuários
- Info do app
- Botões (Sair, Suporte)

---

## RESUMO DE CORES E STATUS

| Status | Cor | Significado |
|--------|-----|-------------|
| 🟢 Concluída | Verde | Ordem finalizada |
| 🔵 Em Progresso | Azul | Ordem em andamento |
| 🟠 Orçamento | Laranja | Aguardando aprovação |
| 🟡 Aguardando | Amarelo | Aguardando cliente/parte |
| 🔴 Cancelada | Vermelho | Ordem cancelada |

---

## TECNOLOGIAS POR TELA

| Tela | Componentes | Estado | API |
|------|------------|--------|-----|
| Login | Form, Auth | Local | POST /auth/login |
| Dashboard | Cards, Charts | Redux | GET /dashboard |
| Clientes | List, Search, Filter | Redux | GET /customers |
| Det. Cliente | Details, Tabs | Redux | GET /customers/:id |
| Ordens | List, Filter | Redux | GET /orders |
| Criar Ordem | Form, Multi-select | Local + Redux | POST /orders |
| Det. Ordem | Details, Timeline | Redux | GET /orders/:id |
| Emitir NF | Form, PDF, QR | Redux + API Externa | POST /nfe/emit |
| Relatórios | Charts, Tables | Redux | GET /reports |
| Perfil | Form, Settings | Redux | GET /profile, Certificado |

