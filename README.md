# 🏦 MedPix — Sistema de Resolução de Fraudes em Transferências PIX

> MVP acadêmico desenvolvido como solução ao **Desafio Bradesco** (Projeto A3)  
> Curso de Ciência da Computação — Universidade Anhembi Morumbi — 2026

---

## 📋 Sobre o Projeto

O **MedPix** é um sistema web que simula o ecossistema PIX com suporte completo ao fluxo de contestação e auditoria previsto no **Mecanismo Especial de Devolução (MED)**, regulamentado pelo Banco Central do Brasil.

O sistema cobre o ciclo integral: da transferência instantânea até a resolução da contestação, com rastreabilidade total das operações.

### 🎯 Funcionalidades principais

- 💸 **Transferência PIX** com controle de idempotência, geração de E2E ID (padrão BACEN) e transações ACID
- 🚨 **Registro de contestações** por tipo de fraude com SLA automático de 7 dias (conforme o MED)
- 🔍 **Painel de auditoria** com controle de acesso por perfis (RBAC) para aprovação ou recusa de contestações
- 💰 **Devolução automatizada** de valores (total ou parcial conforme saldo disponível)
- ⚠️ **Alertas preventivos** — exibe aviso ao usuário antes de transferir para contas com denúncias ativas
- 📊 **Trilha de auditoria** completa com log de todas as decisões

---

## 🛠️ Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 20+ | Runtime JavaScript |
| Express | 4.22 | Framework da API REST |
| Sequelize | 6.37 | ORM |
| MySQL | 8.0+ | Banco de dados relacional |

### Frontend
| Tecnologia | Versão | Função |
|---|---|---|
| React | 19.1 | Biblioteca de UI |
| TypeScript | 5.8 | Tipagem estática |
| Vite | 6.3 | Bundler |
| Tailwind CSS | 4.1 | Estilização |
| React Router | 7.6 | Roteamento SPA |
| Axios | 1.9 | Cliente HTTP |
| Recharts | 2.15 | Gráficos |
| Zod | 3.25 | Validação |

---

## 🏗️ Arquitetura

```
medpix/
├── backend/              # API REST (Node.js + Express)
│   ├── config/           # Conexão com o banco de dados
│   ├── models/           # Modelos Sequelize (Usuario, Transacao, Denuncia, LogAuditoria)
│   └── routes/           # Endpoints (usuarios, pix, denuncias, auditoria)
├── frontend/             # SPA (React + TypeScript)
│   └── src/
│       ├── pages/        # 8 páginas da aplicação
│       ├── components/   # Componentes reutilizáveis
│       ├── context/      # Estado global (UserContext)
│       └── services/     # Camada de acesso à API (Axios)
└── uml/                  # Diagramas UML do projeto
```

A comunicação entre frontend e backend ocorre via **HTTP/REST em JSON**, com o proxy do Vite redirecionando chamadas de `/api` para `localhost:3001`.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20 ou superior
- [MySQL](https://www.mysql.com/) 8.0 ou superior
- npm v10 ou superior

### 1. Banco de dados

```sql
mysql -u root -p
CREATE DATABASE bradesco;
```

> As tabelas são criadas automaticamente pelo Sequelize na inicialização.

### 2. Backend

```bash
cd backend
npm install
# Configure o arquivo config/database.js com suas credenciais MySQL
npm start
# Servidor rodando em http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Aplicação rodando em http://localhost:5173
```

> **Nota:** O usuário com ID 1 é automaticamente promovido ao perfil de **auditor** na inicialização.

---

## 📱 Telas do Sistema

| Rota | Página | Descrição |
|---|---|---|
| `/home` | Dashboard | Saldo, ações rápidas e gráfico mensal |
| `/bankstatement` | Extrato | Histórico de transações por data |
| `/complaints` | Denúncias | Lista de denúncias do usuário |
| `/pay` | Pagamento | Seleção de destinatário PIX |
| `/pay/new/:id` | Novo Pagamento | Formulário e confirmação |
| `/pay/new/:id/receipt` | Comprovante | Recibo digital |
| `/profile` | Perfil | Dados e saldo do usuário |
| `/auditoria` | Auditoria | Painel do auditor (acesso restrito) |

---

## 🔒 Mecanismos de Segurança

- **Idempotência:** chave única por transferência previne cobranças duplicadas
- **Transações ACID:** operações financeiras com bloqueio de linha garantem consistência
- **RBAC:** controle de acesso por perfil (`usuario` / `auditor`)
- **E2E ID:** rastreabilidade completa no padrão BACEN
- **Trilha de auditoria:** log completo de todas as decisões (data, hora, motivo, valor devolvido)
- **Metadados forenses:** `ip_origem`, `user_agent` e `dispositivo` registrados em cada operação

---

## 👥 Autores

| Nome |
|---|
| Alice Inês dos Santos Catino |
| Henrique Araújo Vitoriano |
| Kennedy de Souza Aragão |
| Kwang Soo Vinicius Alves Vieira |

**Orientadores:** Prof. Raul Bastos · Prof. Edquel Bueno Prado Farias

---

## 📄 Licença

Projeto acadêmico desenvolvido para fins educacionais — Universidade Anhembi Morumbi, 2026.
