# Oficina App Soft 🚗

Aplicativo completo para gerenciamento de oficina mecânica com emissão de notas fiscais (NF-e e RPA).

## Funcionalidades

- ✅ Gestão de clientes e veículos
- ✅ Controle de ordens de serviço
- ✅ Emissão de notas fiscais (NF-e e RPA)
- ✅ Relatórios e dashboards
- ✅ Funciona em Mobile (iOS/Android) e Desktop (Web)
- ✅ Sistema de autenticação seguro
- ✅ Integração com SEFAZ (Governo)

## Stack Tecnológico

### Frontend
- React Native + React Native Web
- Expo
- TypeScript
- Redux / Context API
- React Navigation

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT Authentication
- Integração NF-e (SEFAZ)

## Estrutura do Projeto

```
oficina-app-soft/
├── backend/              # Servidor Node.js + Express
├── frontend/             # React Native + Expo
├── docs/                 # Documentação
├── .gitignore
├── README.md
└── package.json
```

## Instalação

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run start
```

## Documentação

- [Wireframe](./WIREFRAME.md) - Design das telas
- [API Documentation](./docs/API.md) - Endpoints da API
- [Database Schema](./docs/DATABASE.md) - Estrutura do banco

## Desenvolvido por

- GitHub Copilot
- Data: 2026-07-06

## Licença

MIT
