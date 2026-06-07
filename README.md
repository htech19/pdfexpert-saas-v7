# PDFExpert Enterprise SaaS V7

Sistema SaaS avançado para processamento inteligente de PDFs com IA, edição de metadados, automação documental e integração com serviços modernos.

## Recursos Principais

### Processamento Inteligente de PDFs
- Leitura e análise de PDFs
- Extração e edição de metadados
- Preview de documentos
- Validação automática de campos

### Inteligência Artificial
- Integração Gemini AI
- Resumos automáticos
- Assistente inteligente para PDFs

### Dashboard Enterprise
- Interface React
- Dark Mode HC TECH
- Dashboard administrativo
- Monitoramento de processamento

## Arquitetura

```text
client/
server/
drizzle/
scripts/
```

## Instalação Windows

### Método Automático

```bat
START_PDFEXPERT_V7.bat
```

### Método Manual

```bash
git clone https://github.com/htech19/pdfexpert-saas-v7.git
cd pdfexpert-saas-v7
pnpm install
pnpm db:push
pnpm dev
```

## Instalação Linux

```bash
chmod +x install.sh
./install.sh
```

## Variáveis de Ambiente

```env
DATABASE_URL=
GEMINI_API_KEY=
GITHUB_TOKEN=
SESSION_SECRET=
NODE_ENV=development
```

## Testes

```bash
node test-validation.mjs
node test-api.mjs
```

## Histórico Validado

### 05/06/2026
- Melhorias instalação local
- START_PDFEXPERT_V7.bat
- pdfexpert_v7_local_manager.py

### 12/05/2026
- Setup automático
- install.sh
- check-requirements

### 12/05/2026
- Metadata Editor
- Testes automatizados
- Backend tRPC

### 11/05/2026
- Dashboard HC TECH
- OAuth
- Serviços PDF

### 11/05/2026
- Bootstrap inicial React + tRPC + Drizzle

## Roadmap V8

- Docker Enterprise
- Docker Compose
- Redis Queue
- BullMQ
- OCR com Tesseract
- Sistema de Créditos SaaS
- Assinatura Digital
- Backup Automático
- Multi IA (Gemini, OpenAI, Claude, DeepSeek)
- Monitoramento Sentry
- Logs Corporativos

## Licença

Copyright © HC TECH.
