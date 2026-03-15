# ImobMatch - Guia de Instalação e Deploy

## Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose (opcional)
- npm ou yarn

---

## 1. INSTALAÇÃO LOCAL (Desenvolvimento)

### 1.1 Clonar e configurar

```bash
git clone <repo>
cd imobmatch

# Copiar variáveis de ambiente
cp .env.example .env
cp backend/.env.example backend/.env
```

### 1.2 Banco de Dados (Backend)

```bash
cd backend

# Instalar dependências
npm install

# Configurar DATABASE_URL no .env:
# DATABASE_URL="postgresql://postgres:senha@localhost:5432/imobmatch"

# Rodar migrações
npx prisma migrate dev --name init

# Popular banco com dados de teste
npm run prisma:seed

# Iniciar servidor de dev
npm run start:dev
```

A API estará disponível em: **http://localhost:3001**
Documentação Swagger: **http://localhost:3001/api/docs**

### 1.3 Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Iniciar servidor de dev
npm run dev
```

O frontend estará disponível em: **http://localhost:3000**

### Credenciais de Teste

| Conta | E-mail | Senha |
|-------|--------|-------|
| Admin | admin@imobmatch.com.br | Admin@123 |
| Corretor | corretor@imobmatch.com.br | Agent@123 |

---

## 2. DEPLOY COM DOCKER COMPOSE

### 2.1 Configurar variáveis

```bash
cp .env.example .env
# Edite o .env com suas configurações
```

### 2.2 Subir os serviços

```bash
# Desenvolvimento
docker-compose up -d

# Produção (com Nginx)
docker-compose --profile production up -d
```

### 2.3 Rodar migrações no container

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed
```

---

## 3. DEPLOY NA VERCEL (Frontend)

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Variáveis de ambiente na Vercel:
- `NEXT_PUBLIC_API_URL` = URL da sua API backend

---

## 4. DEPLOY NO RAILWAY (Backend)

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto
3. Adicione um PostgreSQL plugin
4. Conecte o repositório GitHub (pasta `/backend`)
5. Configure as variáveis de ambiente:
   - `DATABASE_URL` (automático pelo Railway)
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - Variáveis AWS S3

---

## 5. DEPLOY EM VPS

### Requisitos do servidor
- Ubuntu 22.04
- 2GB RAM mínimo
- Docker + Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Clonar o projeto
git clone <repo> /opt/imobmatch
cd /opt/imobmatch

# Configurar .env
cp .env.example .env
nano .env

# Subir com Docker
docker-compose --profile production up -d

# Configurar SSL (Certbot)
apt install certbot python3-certbot-nginx
certbot --nginx -d seudominio.com.br
```

---

## 6. ESTRUTURA DO PROJETO

```
/imobmatch
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── auth/               # Autenticação JWT
│   │   ├── users/              # Gestão de usuários
│   │   ├── properties/         # Gestão de imóveis
│   │   ├── buyers/             # Gestão de compradores
│   │   ├── matches/            # Sistema de matching
│   │   ├── partnerships/       # Parcerias entre corretores
│   │   ├── messages/           # Chat interno
│   │   ├── admin/              # Painel administrativo
│   │   ├── storage/            # Upload AWS S3
│   │   └── prisma/             # Serviço do banco de dados
│   └── prisma/
│       ├── schema.prisma       # Schema do banco
│       └── seed.ts             # Dados iniciais
│
├── frontend/                   # App Next.js
│   └── src/
│       ├── app/
│       │   ├── (auth)/         # Login, Cadastro, Senha
│       │   ├── (dashboard)/    # Área logada
│       │   └── imovel/[id]/    # Página pública do imóvel
│       ├── components/         # Componentes reutilizáveis
│       ├── hooks/              # Hooks customizados
│       ├── lib/                # Utilitários e API client
│       ├── services/           # Serviços de API
│       ├── store/              # Estado global (Zustand)
│       └── types/              # Tipos TypeScript
│
├── database/
│   └── schema.prisma           # Schema principal
│
├── nginx/
│   └── nginx.conf              # Configuração do proxy
│
└── docker-compose.yml          # Orquestração de containers
```

---

## 7. VARIÁVEIS DE AMBIENTE

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `DATABASE_URL` | URL de conexão PostgreSQL | ✅ |
| `JWT_SECRET` | Chave secreta JWT (mínimo 32 chars) | ✅ |
| `FRONTEND_URL` | URL do frontend (CORS) | ✅ |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | Para upload de fotos |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | Para upload de fotos |
| `AWS_S3_BUCKET` | Nome do bucket S3 | Para upload de fotos |
| `SMTP_*` | Configurações de e-mail | Para reset de senha |

---

## 8. ENDPOINTS PRINCIPAIS DA API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuário autenticado |
| GET | `/api/properties` | Listar imóveis públicos |
| POST | `/api/properties` | Criar imóvel |
| GET | `/api/buyers` | Listar compradores |
| POST | `/api/matches/generate` | Gerar matches |
| GET | `/api/matches/best` | Melhores matches |
| POST | `/api/partnerships` | Solicitar parceria |
| GET | `/api/messages/conversations` | Conversas |
| GET | `/api/admin/stats` | Estatísticas admin |
