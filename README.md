# PDFExpert Enterprise v7.0 🚀

Uma plataforma SaaS automatizada para processamento inteligente de catálogos em PDF com deploy imediato no GitHub.

## ✨ Características

- 🎨 **Landing Page Premium** - Design HC TECH (Dark Mode, Verde Neon)
- 📊 **Dashboard Autenticado** - Upload e processamento de PDFs
- 🤖 **IA Inteligente** - Gemini 1.5 Flash para taxonomia 100% real
- 🖼️ **Processamento UHD** - Filtros de entropia, conversão WebP automática
- 📤 **GitHub Integration** - Deploy automático de imagens e metadados
- ⚡ **Progresso em Tempo Real** - Visualização do processamento ao vivo
- ✏️ **Edição de Metadados** - Revisar e editar produtos antes de confirmar

## 🚀 Quick Start (Automático)

### 1. Clone o Repositório

```bash
git clone https://github.com/htech19/pdfexpert-saas-v7.git
cd pdfexpert-saas-v7
```

### 2. Instale as Dependências

```bash
pnpm install
```

**Isso vai automaticamente:**
- ✅ Verificar Node.js 18+, pnpm 10+, MySQL 8+, Git
- ✅ Instalar o que falta
- ✅ Criar arquivo `.env.local`
- ✅ Configurar banco de dados
- ✅ Aplicar migrations

### 3. Configure Variáveis de Ambiente

Edite o arquivo `.env.local` com suas credenciais:

```bash
nano .env.local
```

**Variáveis Essenciais:**

```env
# Database
DATABASE_URL=mysql://pdfexpert:pdfexpert_secure_pass_2024@localhost:3306/pdfexpert_v7

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_minimo_32_caracteres

# GitHub (opcional)
GITHUB_TOKEN=seu_token_github
GITHUB_REPO=seu-usuario/seu-repositorio

# Gemini AI (opcional)
GEMINI_API_KEY=sua_chave_gemini
```

### 4. Inicie o Servidor

```bash
pnpm dev
```

Acesse: **http://localhost:3000**

## 📋 Requisitos Automáticos

O script `postinstall` verifica automaticamente:

| Requisito | Versão | Status |
|-----------|--------|--------|
| Node.js | 18+ | ✅ Automático |
| pnpm | 10+ | ✅ Automático |
| MySQL | 8+ | ⚠️ Manual se não encontrado |
| Git | Qualquer | ✅ Automático |

Se MySQL não for encontrado, o script fornecerá instruções de instalação.

## 🧪 Testes

### Testes Unitários

```bash
pnpm test
```

### Teste de Validação (10 casos)

```bash
node test-validation.mjs
```

### Teste de API

```bash
# Terminal 1
pnpm dev

# Terminal 2
node test-api.mjs
```

## 📁 Estrutura do Projeto

```
pdfexpert-saas-v7/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Landing Page, Dashboard
│   │   ├── components/       # MetadataEditorModal, etc
│   │   └── App.tsx           # Roteamento
├── server/                    # Backend Express + tRPC
│   ├── routers/              # Procedimentos tRPC
│   ├── services/             # PDF, LLM, GitHub
│   └── db.ts                 # Query helpers
├── drizzle/                   # Schema e migrations
├── scripts/
│   └── check-requirements.ts  # Verificação automática
├── package.json              # Scripts (postinstall)
└── SETUP_LOCAL.md            # Guia detalhado
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor

# Build
pnpm build            # Compilar para produção
pnpm start            # Rodar versão de produção

# Testes
pnpm test             # Rodar testes
pnpm test --ui        # Interface visual

# Banco de Dados
pnpm db:push          # Gerar e aplicar migrations
pnpm setup            # Rodar verificação de requisitos novamente

# Linting
pnpm format           # Formatar código
pnpm check            # Verificar tipos TypeScript
```

## 🌐 Variáveis de Ambiente

Veja `.env.local` para a lista completa de variáveis disponíveis.

## 📚 Documentação

- **[SETUP_LOCAL.md](./SETUP_LOCAL.md)** - Guia detalhado de instalação
- **[TESTING.md](./TESTING.md)** - Guia completo de testes
- **[SETUP_LOCAL.md#troubleshooting](./SETUP_LOCAL.md#troubleshooting)** - Solução de problemas

## 🚀 Deploy

### Opção 1: Manus Platform (Recomendado)

Clique em "Publish" na interface do Manus

### Opção 2: Vercel

```bash
npm i -g vercel
vercel
```

### Opção 3: Railway

```bash
npm i -g @railway/cli
railway login
railway up
```

## 🐛 Troubleshooting

### Erro: "Port 3000 already in use"

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "Cannot connect to database"

```bash
# Verificar se MySQL está rodando
mysql -u root -p -e "SELECT 1"

# Ou usar Docker
docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0
```

### Erro: "JWT_SECRET not found"

```bash
# Gerar nova chave
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Adicionar ao .env.local
JWT_SECRET=<chave_gerada>
```

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/htech19/pdfexpert-saas-v7/issues)
- **Documentação**: [SETUP_LOCAL.md](./SETUP_LOCAL.md)

## 📄 Licença

MIT License - Veja [LICENSE](./LICENSE) para detalhes

---

**Versão**: 7.0.0  
**Última atualização**: Maio 2026  
**Mantido por**: htech19

## 🎯 Roadmap

- [ ] Processamento em lote de múltiplos PDFs
- [ ] Integração com mais LLMs (Claude, OpenAI)
- [ ] Dashboard de analytics
- [ ] API pública para integrações
- [ ] Suporte a mais formatos (DOCX, XLSX)

---

**Pronto para começar?** Clone o repositório e execute `pnpm install`! 🚀
