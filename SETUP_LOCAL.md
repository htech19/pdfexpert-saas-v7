# PDFExpert Enterprise v7.0 - Guia de Setup Local

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 10+ ([Instalação](https://pnpm.io/installation))
- **MySQL** 8+ ou **MariaDB** 10.5+ ([Download](https://www.mysql.com/downloads/))
- **Git** ([Download](https://git-scm.com/))

## 🚀 Instalação Passo a Passo

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/pdfexpert-saas-v7.git
cd pdfexpert-saas-v7
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Banco de Dados

#### Opção A: MySQL Local

```bash
# Criar banco de dados
mysql -u root -p << EOF
CREATE DATABASE pdfexpert_v7 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pdfexpert'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON pdfexpert_v7.* TO 'pdfexpert'@'localhost';
FLUSH PRIVILEGES;
EOF
```

#### Opção B: Usar Docker

```bash
docker run --name pdfexpert-mysql \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=pdfexpert_v7 \
  -e MYSQL_USER=pdfexpert \
  -e MYSQL_PASSWORD=sua_senha_segura \
  -p 3306:3306 \
  -d mysql:8.0
```

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Copiar do template
cp .env.example .env.local

# Editar o arquivo com seus valores
nano .env.local
```

**Variáveis Essenciais:**

```env
# Database
DATABASE_URL=mysql://pdfexpert:sua_senha_segura@localhost:3306/pdfexpert_v7

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_minimo_32_caracteres

# GitHub (opcional para testes locais)
GITHUB_TOKEN=seu_token_github
GITHUB_REPO=seu-usuario/seu-repositorio
GITHUB_BRANCH=main

# Gemini AI (opcional)
GEMINI_API_KEY=sua_chave_gemini

# Manus OAuth (opcional para testes)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

### 5. Executar Migrations do Banco de Dados

```bash
# Gerar migrations
pnpm drizzle-kit generate

# Aplicar migrations
pnpm drizzle-kit migrate
```

### 6. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em: **http://localhost:3000**

## 🧪 Testando Localmente

### Via Console/Terminal

#### Executar Testes Unitários

```bash
# Rodar todos os testes
pnpm test

# Rodar testes com interface visual
pnpm test --ui

# Rodar testes de um arquivo específico
pnpm test server/routers/processingRouter.test.ts
```

#### Testar Validação de Metadados

```bash
# Criar arquivo de teste
cat > test-validation.mjs << 'EOF'
// Teste de validação de produto
const validateProduct = (product) => {
  const errors = {};
  if (!product.nome?.trim()) errors.nome = "Nome é obrigatório";
  if (!product.categoria?.trim()) errors.categoria = "Categoria é obrigatória";
  if (!product.marca?.trim()) errors.marca = "Marca é obrigatória";
  if (!product.descricao?.trim()) errors.descricao = "Descrição é obrigatória";
  return errors;
};

// Teste 1: Produto válido
const validProduct = {
  id: 1,
  nome: "Fone Bluetooth Kaidi",
  categoria: "Áudio",
  marca: "Kaidi",
  descricao: "Fone de ouvido sem fio com cancelamento de ruído",
  imagem: "fone-kaidi.webp"
};

console.log("✅ Teste 1: Produto Válido");
console.log("Erros:", validateProduct(validProduct));
console.log("Esperado: {} (sem erros)\n");

// Teste 2: Produto com nome vazio
const invalidProduct = { ...validProduct, nome: "" };
console.log("❌ Teste 2: Nome Vazio");
console.log("Erros:", validateProduct(invalidProduct));
console.log("Esperado: { nome: 'Nome é obrigatório' }\n");

// Teste 3: Múltiplos campos vazios
const multipleErrors = {
  ...validProduct,
  nome: "",
  categoria: "",
  descricao: ""
};
console.log("❌ Teste 3: Múltiplos Campos Vazios");
console.log("Erros:", validateProduct(multipleErrors));
console.log("Esperado: 3 erros\n");
EOF

# Executar teste
node test-validation.mjs
```

### Via Navegador

1. Abra **http://localhost:3000**
2. Você verá a **Landing Page Premium**
3. Clique em **"Começar Agora"** para acessar o Dashboard
4. Faça login com suas credenciais Manus (ou crie uma conta)
5. Teste o upload de PDF e edição de metadados

### Testar API tRPC Diretamente

```bash
# Instalar cliente tRPC CLI (opcional)
pnpm add -D trpc-cli

# Ou usar curl para testar endpoints
curl -X POST http://localhost:3000/api/trpc/auth.me \
  -H "Content-Type: application/json"
```

## 📁 Estrutura do Projeto

```
pdfexpert-saas-v7/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── pages/              # Páginas (Home, Dashboard)
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── lib/                # Utilitários (tRPC client)
│   │   ├── App.tsx             # Roteamento principal
│   │   └── index.css           # Estilos globais (Tailwind)
│   └── index.html
├── server/                      # Backend Express + tRPC
│   ├── routers/                # Procedimentos tRPC
│   ├── services/               # Serviços (PDF, LLM, GitHub)
│   ├── db.ts                   # Query helpers
│   └── _core/                  # Framework interno
├── drizzle/                     # Schema e migrations
│   ├── schema.ts               # Definição de tabelas
│   └── migrations/             # Arquivos SQL
├── shared/                      # Código compartilhado
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔧 Troubleshooting

### Erro: "Cannot find module 'mysql2'"

```bash
# Reinstalar dependências
pnpm install

# Ou instalar especificamente
pnpm add mysql2
```

### Erro: "ECONNREFUSED" ao conectar no banco

```bash
# Verificar se MySQL está rodando
# macOS
brew services list

# Linux
sudo systemctl status mysql

# Windows
Get-Service MySQL80
```

### Erro: "Port 3000 already in use"

```bash
# Matar processo na porta 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "JWT_SECRET not found"

```bash
# Verificar arquivo .env.local
cat .env.local

# Gerar nova chave JWT
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Adicionar ao .env.local
JWT_SECRET=<chave_gerada>
```

## 📚 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor de desenvolvimento

# Build
pnpm build            # Compilar para produção
pnpm start            # Rodar versão de produção

# Testes
pnpm test             # Rodar testes
pnpm test --ui        # Rodar testes com interface

# Banco de Dados
pnpm drizzle-kit generate   # Gerar migrations
pnpm drizzle-kit migrate    # Aplicar migrations
pnpm drizzle-kit studio    # Abrir Drizzle Studio (GUI)

# Linting
pnpm format           # Formatar código com Prettier
pnpm check            # Verificar tipos TypeScript
```

## 🌐 Variáveis de Ambiente Completas

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão MySQL | `mysql://user:pass@localhost/db` |
| `JWT_SECRET` | Chave para assinar tokens | `sua_chave_secreta_32_caracteres` |
| `GITHUB_TOKEN` | Token de acesso GitHub | `ghp_xxxxx` |
| `GITHUB_REPO` | Repositório alvo | `usuario/repositorio` |
| `GEMINI_API_KEY` | Chave API Google Gemini | `AIzaSy...` |
| `NODE_ENV` | Ambiente | `development` ou `production` |

## 🚀 Deploy em Produção

### Opção 1: Manus Platform (Recomendado)

1. Clique em **"Publish"** na interface do Manus
2. Escolha seu domínio personalizado
3. Pronto! Seu site está online

### Opção 2: Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard
```

### Opção 3: Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login e deploy
railway login
railway up
```

## 📞 Suporte

- **Documentação**: [Manus Docs](https://docs.manus.im)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/pdfexpert-saas-v7/issues)
- **Email**: suporte@seu-dominio.com

## 📄 Licença

MIT License - Veja arquivo LICENSE para detalhes

---

**Última atualização**: Maio 2026
**Versão**: 7.0.0
