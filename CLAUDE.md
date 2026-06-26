# CLAUDE.md — Sistema de Gestão para Construtoras

Documentação técnica completa do sistema. Serve como contexto para IA e referência para desenvolvedores humanos.

---

## 1. Visão Geral

**Sistema ERP para gestão de construtoras**, desenvolvido para o mercado paraguaio (moeda: Guaraní ₲, locale `es-PY`). Gerencia projetos de obra, finanças, contratos, orçamentos comerciais, equipe, fornecedores, clientes e estoque — tudo em uma plataforma web única.

**Stack em uma linha:** NestJS 11 + Prisma + PostgreSQL no backend · React 19 + Vite + Tailwind CSS v4 no frontend · Docker + Nginx em produção.

**Modelo de negócio:** SaaS multi-tenant. Cada empresa cadastrada tem seus dados isolados via `tenantId` embutido no JWT — sem subdomínio, sem prefixo de URL.

---

## 2. Stack Tecnológica

### Backend
| Tecnologia | Versão | Papel |
|---|---|---|
| NestJS | 11.0.x | Framework HTTP (Node.js / TypeScript) |
| Prisma ORM | 5.22.x | Acesso ao banco de dados + migrações |
| PostgreSQL | — | Banco de dados relacional principal |
| Passport JWT | 4.x | Autenticação via Bearer token |
| Passport Local | 1.x | Login com email + senha |
| bcrypt | 6.x | Hash de senhas (salt rounds = 10) |
| @nestjs/throttler | 6.x | Rate limiting global + por endpoint |
| Multer | — | Upload de arquivos (contratos) |
| sanitize-filename | 1.6.x | Saneamento de nomes de arquivo no upload |
| class-validator | 0.14.x | Validação de DTOs |
| class-transformer | 0.5.x | Transformação de objetos |

### Frontend
| Tecnologia | Versão | Papel |
|---|---|---|
| React | 19.2.x | Framework de UI |
| TypeScript | 5.9.x | Tipagem estática |
| Vite | 7.2.x | Build tool + dev server |
| Tailwind CSS | 4.1.x | Utilitários CSS (via `@tailwindcss/vite`) |
| React Router DOM | 7.12.x | Roteamento client-side (SPA) |
| Recharts | 3.6.x | Gráficos de barras e área |
| jsPDF | 4.2.x | Geração de PDFs de proposta |
| html-to-image | 1.11.x | Captura de HTML para imagem (PDF) |
| lucide-react | 0.562.x | Biblioteca de ícones SVG |
| Sonner | 2.0.x | Notificações toast |

### Infraestrutura
| Tecnologia | Papel |
|---|---|
| Docker | Containerização multi-stage |
| Docker Compose | Orquestração dos serviços |
| Nginx | Reverse proxy + servidor SPA |
| Node 22 Debian bookworm-slim | Runtime backend (compatível ARM64/AWS Graviton) |
| Node 22 Alpine | Build frontend |
| Nginx Alpine | Servidor frontend em produção |

---

## 3. Arquitetura do Sistema

```
                         ┌─────────────────────────────┐
                         │   Usuário (Navegador)        │
                         └────────────┬────────────────┘
                                      │ HTTP :80
                         ┌────────────▼────────────────┐
                         │  Nginx (frontend:80)         │
                         │  • Serve arquivos estáticos  │
                         │  • SPA fallback → index.html │
                         │  • /api/* → proxy_pass       │
                         └────────────┬────────────────┘
                           /api/*     │ strip /api prefix
                         ┌────────────▼────────────────┐
                         │  NestJS Backend (:3000)      │
                         │  • REST API                  │
                         │  • JWT global guard          │
                         │  • Serve /uploads/* estático │
                         └────────────┬────────────────┘
                                      │ Prisma
                         ┌────────────▼────────────────┐
                         │  PostgreSQL                  │
                         └─────────────────────────────┘
```

### Proxy Reverso
- Em produção, o frontend é compilado com `VITE_API_URL=/api` (build arg no Docker Compose)
- O Nginx intercepta `location /api/` e faz `proxy_pass http://backend:3000/`
- Em desenvolvimento local, `VITE_API_URL` deve apontar para `http://localhost:3000`
- Uploads de arquivo são servidos pelo NestJS via `ServeStaticModule` em `/uploads/*`

---

## 4. Estrutura de Diretórios

```
construtora claude/
├── docker-compose.yml            # Orquestração dos containers
├── CLAUDE.md                     # Este arquivo
├── backend/
│   ├── Dockerfile                # Multi-stage: builder + produção (ARM64)
│   ├── .env                      # Variáveis de ambiente (não versionado)
│   ├── prisma/
│   │   ├── schema.prisma         # Schema do banco de dados
│   │   └── migrations/           # Migrações SQL versionadas
│   └── src/
│       ├── main.ts               # Bootstrap: CORS, pipes, filter, porta
│       ├── app.module.ts         # Raiz: importa módulos + APP_GUARD global
│       ├── prisma.service.ts     # Singleton do PrismaClient
│       ├── global-exception.filter.ts  # Log de erros em server.log
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts  # POST /auth/login (rate limited 5/min), GET /auth/profile
│       │   ├── auth.service.ts
│       │   ├── jwt.strategy.ts
│       │   ├── local.strategy.ts
│       │   ├── decorators/
│       │   │   ├── public.decorator.ts   # @Public() — bypass JWT
│       │   │   └── roles.decorator.ts    # @Roles(...) — exige role
│       │   └── guards/
│       │       ├── jwt-auth.guard.ts     # Guard global JWT
│       │       └── roles.guard.ts        # Guard global RBAC
│       ├── users/
│       ├── projects/
│       ├── project-stages/
│       ├── project-budgets/
│       ├── finance/
│       ├── suppliers/
│       ├── customers/
│       ├── workers/
│       ├── work-logs/
│       ├── contracts/
│       ├── quotes/
│       ├── cost-centers/
│       └── inventory/
└── frontend/
    ├── Dockerfile                # Multi-stage: build (Node) + serve (Nginx)
    ├── nginx.conf                # Proxy reverso + SPA routing
    ├── vite.config.ts            # Plugins: React + Tailwind CSS v4
    ├── index.html                # Entry point HTML
    └── src/
        ├── main.tsx              # Monta <App /> no #root
        ├── App.tsx               # Router com todas as rotas
        ├── index.css             # @tailwindcss + fonte Inter
        ├── pages/                # 14 páginas (ver seção 11)
        ├── components/           # 10 componentes reutilizáveis (ver seção 12)
        └── utils/
            ├── api.ts            # Cliente HTTP centralizado
            └── format.ts         # formatCurrency (₲ Guaraní)
```

---

## 5. Variáveis de Ambiente

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
DIRECT_URL="postgresql://user:pass@host:5432/db?schema=public"
JWT_SECRET="chave-secreta-forte"   # obrigatório — mínimo 32 chars (openssl rand -hex 32)
PORT=3000
CORS_ORIGIN="http://localhost:80"
ADMIN_EMAIL="admin@construtora.com"   # opcional — padrão: admin@construtora.com
ADMIN_PASSWORD="senha-admin-forte"    # obrigatório para criar o seed de admin no boot
```

> `DIRECT_URL` é necessário para migrações Prisma em ambientes com connection pooling (ex: Supabase).
> `JWT_SECRET` ausente causa crash proposital no boot — variável é obrigatória.
> `ADMIN_PASSWORD` ausente apenas suprime o seed (aviso no log), sem travar o boot.

### Frontend (build-time)
```env
VITE_API_URL=/api          # Em produção (Docker)
VITE_API_URL=http://localhost:3000  # Em desenvolvimento local
```

---

## 6. Autenticação e Autorização

### Multi-tenancy
O `tenantId` é extraído do JWT em cada requisição pela `JwtStrategy`. Todos os services de domínio filtram queries com `where: { tenantId }` e injetam o campo no `create()`. O isolamento é transparente — nenhum middleware extra, nenhum prefixo de URL.

```
Signup → cria Tenant + User(ADMIN) → JWT com { userId, tenantId, role }
Login  → encontra User por email   → JWT com { userId, tenantId, role }
Requests→ JwtStrategy extrai tenantId → services filtram por ele
```

### Fluxo JWT
1. `POST /auth/signup` → **@Public()**, cria Tenant + User ADMIN, retorna JWT + user
2. `POST /auth/login` → **@Public()**, usa `LocalStrategy` com email + senha, retorna JWT + user
3. Resposta: `{ access_token: "eyJ...", user: { id, email, name, role, tenantId, tenantName } }`
4. Frontend armazena `token` e `user` no `localStorage`
5. Todas as requisições subsequentes incluem `Authorization: Bearer <token>`
6. `JwtAuthGuard` (APP_GUARD global) valida o token em todos os endpoints
7. `ProtectedRoute` no frontend verifica expiração do JWT via decode do payload (campo `exp`)

### Ordem dos Guards Globais (APP_GUARD)
```
ThrottlerGuard → JwtAuthGuard → RolesGuard
```
- `ThrottlerGuard` — rate limiting (30 req/min global). Login/Signup: 5 req/min.
- `JwtAuthGuard` — valida Bearer token. Popula `request.user` com `{ userId, email, role, tenantId }`.
- `RolesGuard` — lê `@Roles()` do handler. Se nenhum decorator, permite qualquer autenticado.

### RBAC — Roles por Controller
| Operação | Roles permitidas |
|---|---|
| GET (qualquer recurso) | Todos os autenticados (ADMIN, MANAGER, USER, VIEWER) |
| POST / PATCH (recursos gerais) | ADMIN, MANAGER, USER |
| DELETE (recursos gerais) | ADMIN, MANAGER |
| Todos os endpoints `/users` | ADMIN apenas |

### Roles de Usuário
| Role | Acesso |
|---|---|
| `ADMIN` | Acesso total + página de administração de usuários |
| `MANAGER` | Gestão de operações |
| `USER` | Operacional básico |
| `VIEWER` | Apenas leitura |

### Usuário Padrão (seed automático)
- **Email:** `admin@admin.com`
- **Senha:** `admin`
- Criado automaticamente no primeiro boot se não existir

### Decorators de Auth
```typescript
@Public()          // backend/src/auth/decorators/public.decorator.ts
// Marca uma rota para bypass do JwtAuthGuard e RolesGuard global
// Usado em: POST /auth/login

@Roles('ADMIN', 'MANAGER')   // backend/src/auth/decorators/roles.decorator.ts
// Restringe o endpoint às roles listadas
// RolesGuard verifica request.user.role (extraído do JWT pelo JwtStrategy)
```

---

## 7. Backend — Todos os Endpoints

### Auth (`/auth`)
| Método | Rota | Guard | Descrição |
|---|---|---|---|
| POST | `/auth/signup` | @Public | Cadastro: cria Tenant + User(ADMIN). Retorna JWT + user |
| POST | `/auth/login` | @Public | Login com email+senha. Retorna JWT + user |
| GET | `/auth/profile` | JWT | Perfil do usuário autenticado |

### Users (`/users`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/users` | Criar usuário (hash bcrypt da senha) |
| GET | `/users` | Listar todos os usuários |
| GET | `/users/:id` | Buscar usuário por ID |
| PATCH | `/users/:id` | Atualizar usuário (senha re-hashada se informada) |
| DELETE | `/users/:id` | Excluir usuário |

### Projects (`/projects`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/projects` | Criar obra |
| GET | `/projects` | Listar obras (com customer, ordenado por createdAt desc) |
| GET | `/projects/:id` | Detalhes da obra |
| PATCH | `/projects/:id` | Atualizar obra (inclui status: FINISHED) |
| DELETE | `/projects/:id` | Excluir obra |

### Project Stages (`/project-stages`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/project-stages` | Criar etapa |
| GET | `/project-stages?projectId=N` | Listar etapas de uma obra (**projectId obrigatório**) |
| GET | `/project-stages/:id` | Detalhe da etapa |
| PATCH | `/project-stages/:id` | Atualizar etapa |
| DELETE | `/project-stages/:id` | Excluir etapa (cascade com obra) |

### Project Budgets (`/project-budgets`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/project-budgets` | Criar linha de orçamento previsto |
| GET | `/project-budgets?projectId=N` | Listar orçamentos da obra |
| GET | `/project-budgets/:id` | Detalhe |
| PATCH | `/project-budgets/:id` | Atualizar |
| DELETE | `/project-budgets/:id` | Excluir (cascade) |

### Finance (`/finance`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/finance` | Criar transação (INCOME ou EXPENSE) |
| GET | `/finance` | Listar todas ou filtrar por `?projectId=N` |
| GET | `/finance/:id` | Detalhe |
| PATCH | `/finance/:id` | Atualizar |
| DELETE | `/finance/:id` | Excluir |

### Suppliers (`/suppliers`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/suppliers` | Criar fornecedor |
| GET | `/suppliers` | Listar (ordenado por nome) |
| GET | `/suppliers/:id` | Detalhe |
| PATCH | `/suppliers/:id` | Atualizar |
| DELETE | `/suppliers/:id` | Excluir (verifica FK constraint) |

### Customers (`/customers`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/customers` | Criar cliente |
| GET | `/customers` | Listar |
| GET | `/customers/:id` | Detalhe |
| PATCH | `/customers/:id` | Atualizar |
| DELETE | `/customers/:id` | Excluir |

### Workers (`/workers`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/workers` | Criar colaborador |
| GET | `/workers` | Listar ativos (where active: true, por nome) |
| GET | `/workers/:id` | Detalhe |
| PATCH | `/workers/:id` | Atualizar |
| DELETE | `/workers/:id` | **Soft delete** (define active: false) |

### Work Logs (`/work-logs`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/work-logs` | Registrar dias trabalhados |
| GET | `/work-logs?projectId=N` | Listar lançamentos da obra (por data desc) |
| GET | `/work-logs/cost?projectId=N` | Custo total de mão de obra (`{ cost: number }`) |
| DELETE | `/work-logs/:id` | Excluir lançamento |

### Cost Centers (`/cost-centers`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/cost-centers` | Criar centro de custo |
| GET | `/cost-centers` | Listar (por nome) |
| GET | `/cost-centers/:id` | Detalhe |
| PATCH | `/cost-centers/:id` | Atualizar |
| DELETE | `/cost-centers/:id` | Excluir |

### Inventory (`/inventory`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/inventory` | Criar item de estoque |
| GET | `/inventory` | Listar todos os itens |
| GET | `/inventory/:id` | Detalhe |
| PATCH | `/inventory/:id` | Atualizar |
| DELETE | `/inventory/:id` | Excluir |

### Contracts (`/contracts`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/contracts` | Upload de contrato (multipart/form-data) |
| GET | `/contracts` | Listar (com project/customer, por data desc) |
| GET | `/contracts/:id` | Detalhe |
| PATCH | `/contracts/:id` | Atualizar metadados |
| DELETE | `/contracts/:id` | Excluir |

**Upload de contratos:**
- Campo multipart: `file`
- Formatos aceitos: `.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png`
- Armazenado em: `./uploads/{nome-sanitizado}-{timestamp}.{ext}`
- Servido via `ServeStaticModule` em `/uploads/*`
- Volume Docker `uploads_data` garante persistência entre restarts

### Quotes (`/quotes`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/quotes` | Criar orçamento com etapas e custos aninhados |
| GET | `/quotes` | Listar (com customer, stages, items, indirectCosts) |
| GET | `/quotes/:id` | Detalhe completo |
| PATCH | `/quotes/:id` | Atualizar (recria stages/costs aninhados) |
| DELETE | `/quotes/:id` | Excluir |
| POST | `/quotes/:id/duplicate` | Clonar orçamento (status: DRAFT) |
| POST | `/quotes/:id/convert` | **Converter em obra** (ver fluxo abaixo) |

**Fluxo de conversão (quote → project):**
1. Calcula total: `sum(itens.quantidade × custo) + sum(custosIndiretos)`
2. Aplica margem: `preçoFinal = subtotal × (1 + margem/100)`
3. Cria `Project` com as etapas do orçamento
4. Cria `ProjectBudget` com o valor final
5. Atualiza status do Quote para `APPROVED`
6. Retorna o novo `Project`

---

## 8. Banco de Dados — Schema Prisma

> **Multi-tenancy:** todos os modelos de domínio possuem `tenantId Int` + relação `tenant Tenant`. A `JwtStrategy` injeta o `tenantId` no `request.user` e cada service filtra por ele. Migration `20260618000000_add_multi_tenancy` criou o modelo `Tenant` e adicionou `tenantId` em todas as tabelas com backfill para o tenant padrão (id=1).

### Tenant
```prisma
id        Int      @id @default(autoincrement())
name      String   // Nome da empresa
active    Boolean  @default(true)
createdAt DateTime @default(now())
// Relações: users + todos os 13 modelos de domínio
```

### User
```prisma
id        Int      @id @default(autoincrement())
email     String   @unique
password  String   // bcrypt hash
name      String?
role      String   @default("USER")  // ADMIN | MANAGER | USER | VIEWER
tenantId  Int      // FK → Tenant
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

### Project
```prisma
id          Int       @id @default(autoincrement())
name        String
status      String    @default("ACTIVE")  // ACTIVE | FINISHED
city        String?
location    String?   // URL do Google Maps ou endereço
totalArea   Decimal?  @db.Decimal(10,2)   // m²
salesValue  Decimal?  @db.Decimal(15,2)   // Valor de venda/contrato
startDate   DateTime?
endDate     DateTime?
customerId  Int?
// Relações: customer, budgets, transactions, stages, workLogs, contracts, InventoryItem
```

### ProjectStage
```prisma
id               Int      @id @default(autoincrement())
name             String
status           String   @default("PENDING")  // PENDING | IN_PROGRESS | COMPLETED
startDatePlanned DateTime?
endDatePlanned   DateTime?
startDateReal    DateTime?
endDateReal      DateTime?
projectId        Int      // FK → Project (onDelete: Cascade)
```

### ProjectBudget
```prisma
id          Int     @id @default(autoincrement())
category    String  // MÃO_DE_OBRA | MATERIAIS | SERVIÇOS | OUTROS
amount      Decimal @db.Decimal(15,2)
description String?
projectId   Int     // FK → Project (onDelete: Cascade)
```

### FinancialTransaction
```prisma
id          Int      @id @default(autoincrement())
description String
amount      Decimal  @db.Decimal(15,2)
type        String   // INCOME | EXPENSE
status      String   // PENDING | PAID
dueDate     DateTime
category    String?  // MÃO_DE_OBRA | MATERIAIS | SERVIÇOS | CHAVE_EM_MAO | OUTROS
quantity    Decimal? @db.Decimal(10,2)
unit        String?
supplierId  Int?     // FK → Supplier (onDelete: SetNull)
customerId  Int?     // FK → Customer (onDelete: SetNull)
projectId   Int?     // FK → Project  (onDelete: SetNull)
costCenterId Int?    // FK → CostCenter (onDelete: SetNull)
```

### Supplier
```prisma
id       Int    @id @default(autoincrement())
name     String
ruc      String?   // CNPJ paraguaio
phone    String?
email    String?
category String?
```

### Customer
```prisma
id    Int    @id @default(autoincrement())
name  String
ci    String?   // Cédula de Identidade
phone String?
email String?
city  String?
```

### Worker
```prisma
id        Int     @id @default(autoincrement())
name      String
role      String?
dailyRate Decimal @db.Decimal(15,2)
phone     String?
active    Boolean @default(true)   // Soft delete
```

### WorkLog
```prisma
id          Int      @id @default(autoincrement())
date        DateTime
days        Decimal  @db.Decimal(10,2)
description String?
workerId    Int      // FK → Worker
projectId   Int      // FK → Project (onDelete: Cascade)
```

### CostCenter
```prisma
id     Int     @id @default(autoincrement())
name   String
code   String?
active Boolean  @default(true)
budget Decimal? @db.Decimal(15,2)
```

### InventoryItem
```prisma
id          Int     @id @default(autoincrement())
name        String
description String?
quantity    Decimal @db.Decimal(10,2)
unit        String  // Un | Kg | L | Cx | M
minQuantity Decimal? @db.Decimal(10,2)  // Estoque mínimo
unitValue   Decimal @db.Decimal(15,2)   // Preço unitário
projectId   Int?    // FK → Project (onDelete: SetNull)
```

### Contract
```prisma
id          Int    @id @default(autoincrement())
title       String
description String?
fileUrl     String  // Caminho relativo: /uploads/{arquivo}
fileType    String? // MIME: application/pdf, image/jpeg, etc.
projectId   Int?    // FK → Project  (onDelete: SetNull)
customerId  Int?    // FK → Customer (onDelete: SetNull)
createdAt   DateTime @default(now())
```

### Quote
```prisma
id               Int      @id @default(autoincrement())
title            String
status           String   @default("DRAFT")  // DRAFT | SENT | APPROVED | REJECTED
address          String?
city             String?
type             String   // Residencial | Comercial | Industrial | Reforma
totalArea        Decimal? @db.Decimal(10,2)
responsible      String?
paymentTerms     String?
estimatedTime    String?
includedItems    String?  // Texto livre — o que está incluso
excludedItems    String?  // Texto livre — o que não está incluso
validityDays     Int?     @default(15)
marginPercentage Decimal? @db.Decimal(5,2)  // Margem de lucro %
customerId       Int?     // FK → Customer (onDelete: SetNull)
// Relações: stages (→ QuoteStage), indirectCosts (→ QuoteIndirectCost)
```

### QuoteStage
```prisma
id          Int    @id @default(autoincrement())
name        String
description String?
quoteId     Int    // FK → Quote (onDelete: Cascade)
// Relação: items (→ QuoteItem)
```

### QuoteItem
```prisma
id          Int     @id @default(autoincrement())
description String
unit        String
quantity    Decimal @db.Decimal(10,2)
unitCost    Decimal @db.Decimal(15,2)
stageId     Int     // FK → QuoteStage (onDelete: Cascade)
```

### QuoteIndirectCost
```prisma
id          Int     @id @default(autoincrement())
description String
amount      Decimal @db.Decimal(15,2)
quoteId     Int     // FK → Quote (onDelete: Cascade)
```

---

## 9. Configuração do Backend (main.ts)

```typescript
// CORS
origin: process.env.CORS_ORIGIN || 'http://localhost:80'
methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
credentials: true

// Pipes globais
ValidationPipe({ transform: true, whitelist: true })

// Filter global
GlobalExceptionFilter
// → Loga em server.log (timestamp, method, URL, status, mensagem, stack)
// → Retorna JSON: { statusCode, timestamp, path, message }

// Arquivos estáticos
ServeStaticModule → rootPath: './uploads', serveRoot: '/uploads'

// Porta
process.env.PORT ?? 3000
```

---

## 10. Frontend — Roteamento (App.tsx)

```
/login                  → LoginPage           (pública)
/signup                 → SignupPage           (pública)
/                       → ProtectedRoute
  /dashboard            → Dashboard           (padrão)
  /projects             → ProjectsPage
  /projects/:id         → ProjectDetailsPage
  /finance              → FinancePage
  /team                 → TeamPage
  /registers            → RegistersPage
  /supplies             → SuppliesPage
  /contracts            → ContractsPage
  /customers            → CustomersPage
  /quotes               → QuotesPage
  /quotes/new           → QuoteEditorPage
  /quotes/:id           → QuoteEditorPage
  /admin                → AdminPage
  /reports              → ReportsPage
  *                     → redirect /
```

---

## 11. Frontend — Páginas

### `LoginPage.tsx`
Tela de autenticação com design de construção (arte vetorial de prédios e guindaste no background).
- Form: email + senha
- POST `/auth/login` → salva `token` e `user` no localStorage
- Redireciona para `/` no sucesso
- Link "Criar conta gratuita" → `/signup`

---

### `SignupPage.tsx`
Cadastro de nova empresa (cria Tenant + User ADMIN em uma operação).
- Form: nome da empresa, nome do usuário, email, senha (mín. 6 chars)
- POST `/auth/signup` → salva `token` e `user` no localStorage
- Redireciona para `/` no sucesso
- Link "Já tem conta? Entrar" → `/login`
- Design idêntico ao `LoginPage` (arte vetorial de construção + header laranja)

---

### `Dashboard.tsx`
Painel principal com resumo executivo.
- **Cards:** Obras ativas, Obras finalizadas, Total de colaboradores, Receita do mês (PAID), Despesas do mês (PAID)
- Carrega em paralelo: GET `/projects`, GET `/workers`, GET `/finance`
- Filtra transações do mês corrente pelo campo `dueDate`

---

### `ProjectsPage.tsx`
Lista e gerencia obras (projetos de construção).
- **Tabela:** nome, cliente, cidade, área, valor do contrato, status, datas
- **Modal de criação/edição:** name, city, location (URL Maps), customerId, totalArea, salesValue, startDate, endDate
- Obras FINALIZADAS exibem badge verde "Finalizada"
- GET `/projects`, GET `/customers` (para o select do modal)
- POST / PATCH / DELETE `/projects`

---

### `ProjectDetailsPage.tsx`
Página mais complexa do sistema. Detalhes completos de uma obra com 4 abas.

**Header:** Nome da obra, localização, cliente, botão "Finalizar Obra" (PATCH status: FINISHED)

**Cards financeiros:**
- Valor do Contrato + Lucro Previsto + Margem Prevista
- Saldo Restante Atual (margem real: contrato − custos reais)
- % Executado (etapas concluídas / total)
- Desvio Orçamentário (custo real − orçado)
- Custo por m²

**Curva ABC de Materiais** (gráfico de barras Recharts) — visível quando há materiais lançados.

**Aba Cronograma:**
- CRUD de etapas (name, startDatePlanned, endDatePlanned, status)
- Status visual: ⚪ PENDING / 🔵 IN_PROGRESS / ✅ COMPLETED
- Gráfico de avanço físico (BarChart horizontal — % concluído)

**Aba Materiais:**
- Tabela de lançamentos com categoria MATERIAIS
- Campos: data, item/descrição, quantidade, unidade, fornecedor, valor unitário, total
- Modal de registro/edição

**Aba Serviços:**
- Tabela de lançamentos com categorias SERVIÇOS e MÃO_DE_OBRA
- Campos: data, descrição, fornecedor/prestador, status (pago/pendente), total

**Aba Equipe:**
- Registro de dias trabalhados por colaborador
- Cards resumo: total de dias, custo total de mão de obra
- Tabela: data, colaborador, dias, custo/dia, total, descrição

**Seção Orçamento Previsto vs. Realizado:**
- Painel esquerdo: orçamento planejado por categoria (com edição/exclusão)
- Painel direito: gastos reais com barra de progresso por categoria
- Inclui custo de mão de obra interna (work logs) na categoria MÃO_DE_OBRA

**Cálculo financeiro:**
```javascript
totalExpenses = expenses.filter(type=EXPENSE).sum(amount)
totalLabor    = workLogs.sum(days × worker.dailyRate)
totalCost     = totalExpenses + totalLabor
profit        = salesValue - totalCost
margin        = (profit / salesValue) × 100
```

---

### `FinancePage.tsx`
Gestão de contas a pagar e receber + fluxo de caixa.

**4 abas:**

**Despesas (Contas a Pagar):**
- Lista transações type=EXPENSE
- Toggle pagar/estornar (PAID ↔ PENDING) direto na linha
- TransactionModal para criar/editar

**Receitas (Contas a Receber):**
- Lista transações type=INCOME
- Toggle receber/estornar

**Fluxo de Caixa:**
- Tabela cronológica com saldo acumulado (running balance)
- Linha por dia, com entradas, saídas e saldo do dia

**Centros de Custo:**
- Componente `CostCentersManager` embutido

**Cards de resumo:**
- Saldo atual (recebidos − pagos)
- Entradas pendentes
- Saídas pendentes
- Saldo projetado (atual + pendentes)
- Capital em estoque (sum(quantity × unitValue) do inventário)

---

### `RegistersPage.tsx`
Gerencia fornecedores e clientes com abas.

**Aba Fornecedores:** name, RUC, email, phone, categoria
**Aba Clientes:** name, CI (Cédula), email, phone, city

Componente reutilizável: aceita prop `type: 'ALL' | 'SUPPLIERS' | 'CUSTOMERS'`.

---

### `TeamPage.tsx`
Gerencia colaboradores (mão de obra).
- **Tabela:** nome, função, custo/dia (₲), telefone, status ativo/inativo
- **Modal:** name, role, dailyRate (CurrencyInput), phone
- DELETE faz soft delete (active: false) via backend

---

### `SuppliesPage.tsx`
Wrapper com 2 abas:
- **Fornecedores:** `<RegistersPage type="SUPPLIERS" />`
- **Estoque:** `<InventoryManager />`

---

### `CustomersPage.tsx`
Wrapper simples: `<RegistersPage type="CUSTOMERS" />`

---

### `ContractsPage.tsx`
Upload e gerenciamento de contratos/documentos.
- **Upload:** title, description, file (PDF/DOC/imagem), projectId (opcional), customerId (opcional)
- **Preview modal:** PDF em `<iframe>`, imagens em `<img>`
- **Download:** link direto para o arquivo em `/uploads/{nome}`
- **Tabela:** título, tipo, projeto, cliente, data, ações

---

### `QuotesPage.tsx`
Lista de orçamentos comerciais.
- **Tabela:** título, cliente, valor estimado, status, data
- **Ações por linha:** converter em obra ✅, duplicar 📋, editar ✏️, excluir 🗑️
- Calcula valor: `sum(itens) + sum(custosIndiretos)` com margem aplicada
- Status badges: DRAFT (cinza), SENT (azul), APPROVED (verde), REJECTED (vermelho)

---

### `QuoteEditorPage.tsx`
Editor de orçamentos com 3 abas + sidebar de cálculo.

**Aba Dados Gerais:** título, cliente, tipo de obra, área total, endereço, cidade

**Aba Etapas & Custos:**
- Etapas colapsáveis com tabela de itens
- Item: descrição, unidade, quantidade, valor unitário → subtotal automático
- Custos indiretos na sidebar (descrição + valor)

**Aba Dados da Proposta:** itens inclusos, exclusos, forma de pagamento, prazo estimado, validade

**Sidebar (calculadora):**
- Custos diretos + custos indiretos + margem % → **Preço Final**
- Campo de margem editável inline
- Custo por m² (se área informada)

**Geração de PDF (3 refs independentes):**
- Toggle de idioma **PT 🇧🇷 / ES 🇵🇾** na sidebar — strings via objeto `translations`
- `coverRef` → Página 1: capa (design SVG com ondas laranjas + faixa slate escura)
- `contentHeaderRef` → cabeçalho fixo (logo, dados do cliente, barra de colunas em flexbox)
- `stageRefs[]` → um `<div>` por etapa, capturado individualmente com `toCanvas()`
- Quebra de página inteligente: antes de posicionar cada etapa, verifica `currentY + hMM > pageHeight` — se não couber, `pdf.addPage()` automático
- `summaryRef` → Última página A4 fixa (1130px): valor total do projeto, prazos/condições, inclusões/exclusões, assinaturas, faixa decorativa SVG no rodapé
- Empresa nas assinaturas: **Construtora Buen Futuro**

---

### `AdminPage.tsx`
Exclusivo para usuários com `role === 'ADMIN'`.
- **Tabela:** nome, email, cargo/nível, data de cadastro, ações
- **Modal:** name, email, senha (opcional na edição), role
- Não permite excluir o próprio usuário logado
- Roles disponíveis: ADMIN, MANAGER, USER, VIEWER

---

### `ReportsPage.tsx`
Relatórios financeiros com filtros temporais.
- **Filtros:** 1M, 3M, 6M, 9M, 12M, Personalizado (date picker)
- **Cards:** Total Receitas, Total Despesas, Resultado Líquido, Capital em Estoque
- **Gráfico 1:** BarChart — Receitas vs. Despesas por mês
- **Gráfico 2:** AreaChart — Lucro/Resultado por mês
- **DRE (Tabela):** Mês, Receitas, Despesas, Resultado, Margem %
- Considera apenas transações com status `PAID`

---

## 12. Frontend — Componentes Reutilizáveis

### `Layout.tsx`
Estrutura principal da aplicação.
- **Sidebar** (slate-900, 256px): logo, navegação, botão logout, info do usuário
- **Rodapé da sidebar:** exibe `user.name` (usuário) + `user.tenantName` (nome da empresa)
- **Header** (branco): título da página atual, ícone do usuário
- **Hamburger menu** (mobile): overlay com backdrop-blur-sm
- Navegação condicional: item "Admin" visível apenas para `role === 'ADMIN'`
- Itens de nav: Dashboard, Obras, Orçamentos, Finanças, Suprimentos, Equipe, Contratos, Clientes, Relatórios

---

### `ProtectedRoute.tsx`
Guard de rota para o React Router.
```typescript
function isTokenExpired(token: string): boolean {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
}
// Redireciona para /login se sem token ou com token expirado
// Limpa localStorage (token + user) ao detectar expiração
```

---

### `Button.tsx`
Botão reutilizável com variantes e estados.
- **Variantes:** `primary` (laranja), `secondary` (slate), `danger` (vermelho), `ghost`, `outline`
- **Tamanhos:** `sm`, `md`, `lg`, `icon`
- Props: `isLoading` (spinner), `leftIcon`, `rightIcon`, `disabled`

---

### `Input.tsx`
Input com label, ícone e mensagem de erro.
- Props: `label`, `error`, `icon` (lado esquerdo)
- Estilo de erro: borda vermelha + texto de erro abaixo

---

### `Badge.tsx`
Indicador de status colorido.
- **Variantes:** `success` (verde), `warning` (amarelo), `error` (vermelho), `info` (azul), `default` (slate)
- **Tamanhos:** `sm`, `md`

---

### `CurrencyInput.tsx`
Input formatado para Guaraní paraguaio.
- Formata enquanto o usuário digita (locale `es-PY`)
- Aceita apenas dígitos no input
- Emite valor numérico limpo via `onValueChange`
- Exibe símbolo ₲ formatado

---

### `TransactionModal.tsx`
Modal completo para criar/editar transações financeiras.
- Props: `isOpen`, `onClose`, `onSave`, `type: 'INCOME' | 'EXPENSE'`, `initialData`
- Campos: descrição, valor (CurrencyInput), vencimento, status, fornecedor/cliente, projeto, categoria, centro de custo
- Para EXPENSE: select de Fornecedores
- Para INCOME: select de Clientes
- Categoria disponível apenas quando projeto é selecionado

---

### `CostCentersManager.tsx`
CRUD de centros de custo inline (sem modal separado).
- **Tabela:** nome, código, orçamento, status (ativo/inativo)
- **Modal inline:** name, code, budget (CurrencyInput), active
- Busca por nome

---

### `InventoryManager.tsx`
Gerenciamento de estoque de materiais.
- **Tabela:** item, descrição, quantidade, unidade, estoque mínimo, valor unitário, total, projeto
- **Alerta visual** quando `quantity <= minQuantity`
- **Modal:** name, description, quantity, unit, minQuantity, unitValue, projectId (opcional)
- Calcula capital total em estoque

---

### `Skeletons.tsx`
Placeholders animados de carregamento.
- `CardSkeleton`: grade de cards cinza pulsante
- `TableRowSkeleton`: linhas de tabela cinza pulsante
- Animação: `animate-pulse` do Tailwind

---

## 13. Utilitários Frontend

### `src/utils/api.ts`
Cliente HTTP centralizado. **Todos os fetch calls do app devem usar este módulo.**

```typescript
// Base URL via variável de ambiente
const BASE_URL = import.meta.env.VITE_API_URL;

// Métodos disponíveis
api.get<T>(endpoint, options?)          // GET
api.post<T>(endpoint, body, options?)   // POST application/json
api.patch<T>(endpoint, body, options?)  // PATCH application/json
api.delete<T>(endpoint, options?)       // DELETE
api.upload<T>(endpoint, formData, options?)  // POST multipart/form-data
```

**Comportamentos automáticos:**
- Injeta `Authorization: Bearer <token>` em todas as requisições
- Para `FormData` (upload): omite `Content-Type` (deixa o browser definir o boundary)
- Em resposta `401 Unauthorized`: limpa localStorage e redireciona para `/login`
- Em erro de rede: exibe toast via Sonner com a mensagem de erro
- Opção `skipGlobalErrorToast: true` para suprimir o toast em casos específicos

**Exceção:** `LoginPage.tsx` usa `fetch` diretamente pois ainda não há token.

---

### `src/utils/format.ts`
```typescript
formatCurrency(value: number | string): string
// Formata para Guaraní paraguaio
// Exemplo: 1500000 → "₲ 1.500.000"
// Locale: es-PY, sem casas decimais
```

---

## 14. Design System

### Paleta de Cores (Tailwind)

| Cor | Classe base | Uso |
|---|---|---|
| **Laranja** | `orange-500/600` | CTAs, botões primários, sidebar accent, border active |
| **Slate escuro** | `slate-900/800` | Sidebar, textos principais, cabeçalhos |
| **Slate médio** | `slate-500/600` | Textos secundários, ícones, placeholders |
| **Slate claro** | `slate-50/100/200` | Backgrounds, bordas, separadores |
| **Verde** | `green-100/600/700` | Status COMPLETED, PAID, lucro positivo |
| **Vermelho** | `red-100/500/600` | Erros, delete, despesas, prejuízo |
| **Azul** | `blue-100/500/600/700` | Edição, status IN_PROGRESS, info |
| **Amarelo** | `yellow-100/700` | Status PENDING, avisos |
| **Roxo** | `purple-100/700` | Role ADMIN |

### Tipografia
- **Família:** `Inter` — declarada em `src/index.css` via `@import` do Google Fonts
- **Pesos usados:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Tamanhos predominantes:** `text-sm` (tabelas), `text-base` (corpo), `text-lg`/`text-xl` (títulos de seção), `text-2xl` (títulos de página)

### Border Radius
- Cards e containers: `rounded-xl` (12px)
- Modais: `rounded-2xl` (16px)
- Botões e inputs: `rounded-lg` (8px)
- Badges/pills: `rounded-full` ou `rounded-md`

### Shadows
- Cards: `shadow-sm` com `border border-slate-200`
- Botões primários: `shadow-sm shadow-orange-500/20`
- Modais: `shadow-xl` ou `shadow-2xl`

### Padrões de Layout
```
Página = space-y-6
  Header = flex justify-between items-center
  Tabela = bg-white rounded-xl shadow-sm border border-slate-200
    overflow-x-auto w-full pb-4 (scrollável no mobile)
  Modal = fixed inset-0 bg-black/50 backdrop-blur-sm z-50
    → bg-white rounded-2xl max-w-md w-full
```

### Responsividade
- **Sidebar:** `hidden lg:flex` (desktop) / hamburger `lg:hidden` (mobile)
- **Grids:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- **Tabelas:** `overflow-x-auto w-full pb-4` — scroll horizontal no mobile
- **Modais:** `p-4` no container + `w-full max-w-md`

---

## 15. Padrões de Código

### Chamadas de API (frontend)
```typescript
// ✅ Correto — usar api utility
const data = await api.get<Tipo[]>('/endpoint');
await api.post('/endpoint', payload);
await api.patch(`/endpoint/${id}`, payload);
await api.delete(`/endpoint/${id}`);
await api.upload('/endpoint', formData);

// ❌ Errado — não usar fetch diretamente (exceto LoginPage)
const res = await fetch(`${import.meta.env.VITE_API_URL}/endpoint`, {...});
```

### Padrão de Modais (frontend)
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [formData, setFormData] = useState({ campo: '' });
const [editingId, setEditingId] = useState<number | null>(null);

const openEdit = (item) => {
  setFormData(item);
  setEditingId(item.id);
  setIsModalOpen(true);
};
const openNew = () => {
  setFormData({ campo: '' });
  setEditingId(null);
  setIsModalOpen(true);
};
```

### Formatação de Moeda
```typescript
// Sempre usar formatCurrency para exibição
import { formatCurrency } from '../utils/format';
formatCurrency(item.amount) // → "₲ 1.500.000"

// Para input de valores monetários, usar CurrencyInput component
<CurrencyInput value={formData.amount} onValueChange={val => setFormData({...formData, amount: val})} />
```

### Dados Monetários no Backend
- Todos os campos de dinheiro: `Decimal @db.Decimal(15,2)` no Prisma
- Evita imprecisão de ponto flutuante para valores em Guaraní (que podem ser muito grandes)

### Soft Delete (Workers)
```typescript
// DELETE /workers/:id → service sets active: false (não remove do banco)
// GET /workers → where: { active: true }
// Motivo: preservar histórico em work logs
```

### Cache-busting em GET críticos
```typescript
// Usado em endpoints onde dados de uma obra não devem vir do cache
await api.get(`/project-stages?projectId=${id}&t=${new Date().getTime()}`);
```

---

## 16. Docker e Deploy

### docker-compose.yml
```yaml
services:
  backend:
    build: ./backend
    container_name: constructora-backend
    ports: ["3000:3000"]
    env_file: ./backend/.env
    volumes:
      - uploads_data:/usr/src/app/uploads
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      args:
        - VITE_API_URL=/api   # Aponta para o proxy Nginx
    container_name: constructora-frontend
    ports: ["80:80"]
    depends_on: [backend]
    restart: unless-stopped

volumes:
  uploads_data:  # Persiste uploads entre restarts
```

### Nginx (`frontend/nginx.conf`)
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Proxy reverso: /api/* → backend NestJS
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # SPA routing: tudo vai para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Dockerfile Backend (multi-stage, ARM64)
```dockerfile
# Stage 1: Builder
FROM node:22-bookworm-slim AS builder
RUN apt-get install -y openssl  # Necessário para Prisma ARM64
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Produção
FROM node:22-bookworm-slim
RUN apt-get install -y openssl
COPY --from=builder node_modules, package.json, dist, prisma
CMD ["npm", "run", "start:prod"]  # node dist/src/main
```

### Dockerfile Frontend (multi-stage)
```dockerfile
# Stage 1: Build React/Vite
FROM node:22-alpine AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm install && npm run build

# Stage 2: Servir com Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

### Comandos úteis de deploy
```bash
# Build e start completo
docker compose up --build -d

# Rodar migrações do Prisma (necessário após mudanças no schema)
docker exec constructora-backend npx prisma migrate deploy

# Ver logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend

# Restartar apenas o backend
docker compose restart backend
```

---

## 17. Fluxos de Negócio Principais

### 1. Orçamento → Aprovação → Obra
```
QuotesPage → "Novo Orçamento" → QuoteEditorPage
  ↓ Preenche etapas + itens + custos indiretos + margem %
  ↓ Salva → status: DRAFT
  ↓ "Converter em Obra" → POST /quotes/:id/convert
      ↓ Backend calcula: preço = (soma itens + custos indiretos) × (1 + margem%)
      ↓ Cria Project + ProjectBudget
      ↓ Quote → status: APPROVED
  ↓ Redireciona → ProjectDetailsPage (nova obra)
```

### 2. Controle Financeiro de Obra
```
ProjectDetailsPage → Aba Materiais
  → Registrar Material: descrição, qtd, unidade, valor total
  → Cria FinancialTransaction { type: EXPENSE, category: MATERIAIS, projectId }

ProjectDetailsPage → Aba Serviços
  → Registrar Serviço: descrição, valor, status (pago/pendente)
  → Cria FinancialTransaction { type: EXPENSE, category: SERVIÇOS | MÃO_DE_OBRA }

ProjectDetailsPage → Aba Equipe
  → Registrar Dias: colaborador, data, dias trabalhados
  → Cria WorkLog { workerId, projectId, date, days }
  → Custo calculado: days × worker.dailyRate

Resultado exibido na tela:
  totalCost = expenses + (workLogs.days × dailyRate)
  profit = salesValue - totalCost
  margin = (profit / salesValue) × 100
```

### 3. Curva ABC de Materiais
```
expenses (category === 'MATERIAIS')
  → Agrupa por description → soma amounts
  → Ordena por valor decrescente
  → Calcula % cumulativo
  → Exibe em BarChart (Recharts ComposedChart)
  → Identifica itens de maior impacto no custo
```

### 4. Relatório Financeiro (DRE)
```
ReportsPage → filtro de período
  → GET /finance?t={timestamp}
  → Filtra status === 'PAID' + dueDate no período
  → Agrupa por mês
  → Para cada mês: receitas, despesas, resultado, margem %
  → BarChart: receitas vs despesas por mês
  → AreaChart: lucro/resultado por mês
```

### 5. Upload e Acesso a Contratos
```
ContractsPage → "Novo Contrato"
  → POST /contracts (multipart/form-data)
  → Backend: salva em /uploads/{nome-sanitizado}-{timestamp}.ext
  → fileUrl = "/uploads/{arquivo}"
  
Visualização:
  → PDF: <iframe src="/uploads/{arquivo}">
  → Imagem: <img src="/uploads/{arquivo}">
  → Download: <a href="/uploads/{arquivo}" download>
  → Em produção: Nginx proxy → NestJS ServeStaticModule
```

---

## 18. Pontos de Atenção para Manutenção

1. **JWT_SECRET** deve ser gerado com pelo menos 32 chars aleatórios (`openssl rand -hex 32`). Nunca commitar no git. O backend crasha propositalmente se ausente.

2. **Prisma migrations** precisam ser executadas manualmente após mudanças no schema:
   ```bash
   npx prisma migrate dev --name nome_da_migracao  # desenvolvimento
   npx prisma migrate deploy                         # produção
   ```

3. **Tailwind CSS v4** não usa `tailwind.config.js`. A configuração é feita via plugin no `vite.config.ts`. Não criar arquivo de config separado.

4. **Decimal vs Float**: Campos monetários usam `Decimal` no Prisma e `Decimal(15,2)` no PostgreSQL. Ao manipular no JavaScript, usar `Number(value)` para converter, mas nunca armazenar como float no banco.

5. **Volume de uploads**: Em produção, o volume `uploads_data` deve ter backup. Arquivos não são armazenados no banco, apenas o caminho.

6. **Soft delete de Workers**: Nunca excluir workers diretamente do banco — quebra histórico de work logs. O DELETE via API já faz soft delete (active: false).

7. **CORS_ORIGIN**: Em produção com domínio próprio, configurar `CORS_ORIGIN` no `.env` com o domínio real (ex: `https://meusite.com.py`).

8. **ARM64 / AWS Graviton**: O Dockerfile do backend instala `openssl` explicitamente e usa `node:22-bookworm-slim` (não Alpine) para compatibilidade total com o Prisma engine em ARM64.

9. **ADMIN_PASSWORD**: Nunca usar senha padrão (ex: `admin`) em produção. O seed não executa se a variável não estiver definida — proteção contra boot com credenciais fracas.

10. **Upload de contratos**: Multer valida MIME type (não apenas extensão) contra allowlist: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/jpeg`, `image/png`. Limite: 10 MB.

---

## 19. Segurança — Hardening Aplicado

### Backend

| Camada | Medida | Detalhe |
|---|---|---|
| Autenticação | JWT obrigatório via APP_GUARD global | Todos os endpoints protegidos por padrão |
| Autorização | RBAC com `@Roles()` + `RolesGuard` | Role extraída do JWT payload, verificada em cada request |
| Rate limiting | `ThrottlerModule` global | 30 req/min padrão; 5 req/min no endpoint de login |
| Upload | MIME type validation + 10 MB limit | Multer `fileFilter` verifica `mimetype` contra allowlist |
| Erros | `GlobalExceptionFilter` sanitiza 500 | Mensagem genérica ao cliente; stack trace apenas no console |
| Segredos | JWT_SECRET obrigatório + ADMIN_PASSWORD env | Crash no boot se JWT_SECRET ausente; seed ignorado sem ADMIN_PASSWORD |
| Container | Docker non-root user `appuser` | `useradd -r -g appuser appuser` + `USER appuser` no Dockerfile |
| Banco | Indexes em todos os FKs e campos filtrados | `@@index` no schema Prisma (migração: `add_indexes`) |
| Banco | RLS habilitado em todas as tabelas públicas | Bloqueia acesso direto via Supabase PostgREST/REST API |

### Frontend / Nginx

| Camada | Medida | Detalhe |
|---|---|---|
| HTTP headers | 5 security headers no Nginx | X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy |
| iframe | `sandbox` attribute | PDF preview: `sandbox="allow-same-origin allow-scripts allow-forms"` |
| API client | Erro 401 → logout automático | `api.ts` limpa localStorage e redireciona para /login |
| API client | Mensagens de erro por status | 403 → "sem permissão"; 404 → "não encontrado"; 500 → "erro no servidor" |
| Builds | `VITE_API_URL` obrigatório | `api.ts` lança erro em load-time se variável ausente |

### Supabase — RLS
O NestJS conecta via **URL direta** (porta 5432, usuário `postgres` superuser) — RLS é ignorado para o backend.
O RLS foi habilitado em todas as 15 tabelas para bloquear acesso via API REST/PostgREST do Supabase.
Nenhuma policy foi criada — acesso direto externo está completamente bloqueado.
