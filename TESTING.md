# PDFExpert Enterprise v7.0 - Guia de Testes

## 📋 Tipos de Testes Disponíveis

Este projeto inclui três tipos de testes que você pode rodar localmente:

### 1. **Testes Unitários (Vitest)**
Testam funções isoladas e lógica de negócio

### 2. **Testes de Validação (Node.js)**
Testam a validação de metadados de produtos

### 3. **Testes de API (Node.js)**
Testam os endpoints tRPC do servidor

---

## 🧪 Executar Testes Unitários

### Pré-requisito
Certifique-se de ter as dependências instaladas:
```bash
pnpm install
```

### Rodar Todos os Testes

```bash
pnpm test
```

**Saída esperada:**
```
 RUN  v2.1.9 /home/ubuntu/pdfexpert_saas_v7
 ✓ server/auth.logout.test.ts (1 test) 6ms
 ✓ server/routers/processingRouter.test.ts (7 tests) 522ms
 
 Test Files  2 passed (2)
      Tests  8 passed (8)
```

### Rodar Testes de um Arquivo Específico

```bash
pnpm test server/routers/processingRouter.test.ts
```

### Rodar Testes com Interface Visual

```bash
pnpm test --ui
```

Isso abrirá uma interface web em `http://localhost:51204` onde você pode:
- Ver todos os testes
- Filtrar por nome
- Executar testes individuais
- Ver cobertura de código

### Rodar Testes em Modo Watch

```bash
pnpm test --watch
```

Os testes serão executados novamente toda vez que você salvar um arquivo.

---

## ✅ Testes de Validação de Metadados

Este script testa a lógica de validação de produtos extraídos do PDF.

### Executar

```bash
node test-validation.mjs
```

### Saída Esperada

```
============================================================
PDFExpert v7.0 - Testes de Validação de Metadados
============================================================
🧪 Teste 1: Produto com todos os campos válidos
✅ Produto válido deve passar
🧪 Teste 2: Produto com nome vazio
✅ Nome vazio deve gerar erro
🧪 Teste 3: Produto com categoria vazia
✅ Categoria vazia deve gerar erro
...
============================================================
Resumo dos Testes
============================================================
ℹ️  Total de testes: 10
✅ Testes passados: 10
✅ Todos os 10 testes passaram! 🎉
```

### O que é Testado

| Teste | Descrição | Esperado |
|-------|-----------|----------|
| Produto válido | Todos os campos preenchidos | Sem erros |
| Nome vazio | Campo nome em branco | Erro: "Nome é obrigatório" |
| Categoria vazia | Campo categoria em branco | Erro: "Categoria é obrigatória" |
| Marca vazia | Campo marca em branco | Erro: "Marca é obrigatória" |
| Descrição vazia | Campo descrição em branco | Erro: "Descrição é obrigatória" |
| Múltiplos vazios | 3 campos vazios | 3 erros |
| Espaços em branco | Apenas espaços | Tratado como vazio |
| Espaços válidos | Espaços nas laterais | Aceito (trim) |
| Todos vazios | Todos os campos vazios | 4 erros |
| Caracteres especiais | Símbolos e acentos | Aceito |

---

## 🔌 Testes de API tRPC

Este script testa os endpoints tRPC do servidor.

### Pré-requisitos

O servidor deve estar rodando:
```bash
pnpm dev
```

### Executar

```bash
node test-api.mjs
```

### Saída Esperada

```
============================================================
PDFExpert v7.0 - Testes de API tRPC
============================================================
🧪 Verificando se o servidor está rodando...
✅ Servidor está rodando!
🧪 Teste 1: Verificar status de autenticação
✅ Endpoint auth.me respondeu com sucesso
  Status: 200
  Resposta: null (não autenticado)
🧪 Teste 2: Simular upload de PDF
✅ Endpoint processing.upload respondeu com sucesso
🧪 Teste 3: Obter histórico de processamentos
✅ Endpoint processing.getHistory respondeu com sucesso
  Total de registros: 0
🧪 Teste 4: Confirmar metadados de produtos
✅ Endpoint processing.confirmMetadata respondeu com sucesso
...
✅ Testes concluídos! 🎉
```

### Endpoints Testados

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `auth.me` | GET | Obter usuário autenticado |
| `processing.upload` | POST | Iniciar upload de PDF |
| `processing.getHistory` | GET | Obter histórico de processamentos |
| `processing.confirmMetadata` | POST | Confirmar metadados de produtos |

---

## 🚀 Fluxo Completo de Testes

Para testar a aplicação completa localmente:

### 1. Setup Inicial

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm drizzle-kit migrate

# Iniciar servidor
pnpm dev
```

### 2. Testes Unitários

```bash
# Em outro terminal
pnpm test
```

### 3. Testes de Validação

```bash
node test-validation.mjs
```

### 4. Testes de API

```bash
node test-api.mjs
```

### 5. Testes Manuais no Navegador

1. Abra `http://localhost:3000`
2. Clique em "Começar Agora"
3. Faça login
4. Teste o upload de PDF
5. Teste a edição de metadados
6. Confirme o envio

---

## 📊 Cobertura de Testes

### Backend

- ✅ Autenticação (logout)
- ✅ Validação de metadados
- ✅ Upload de PDF
- ✅ Histórico de processamentos
- ✅ Confirmação de metadados

### Frontend

- ✅ Modal de edição de metadados
- ✅ Validação de campos
- ✅ Upload de arquivo
- ✅ Progresso em tempo real
- ✅ Navegação

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'vitest'"

```bash
pnpm install
```

### Erro: "Port 3000 already in use"

```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9
```

### Erro: "Database connection failed"

```bash
# Verificar se MySQL está rodando
mysql -u root -p -e "SELECT 1"

# Ou verificar string de conexão no .env.local
cat .env.local | grep DATABASE_URL
```

### Erro: "Cannot GET /api/trpc/..."

O servidor não está rodando. Execute:
```bash
pnpm dev
```

---

## 📝 Adicionar Novos Testes

### Teste Unitário

Crie um arquivo `.test.ts` ao lado do arquivo que deseja testar:

```typescript
// server/services/myService.test.ts
import { describe, it, expect } from "vitest";
import { myFunction } from "./myService";

describe("myFunction", () => {
  it("deve fazer algo", () => {
    const result = myFunction();
    expect(result).toBe(true);
  });
});
```

### Teste de Validação

Adicione um novo teste ao `test-validation.mjs`:

```javascript
log.test('Teste 11: Novo caso de teste');
runTest(
  'Descrição do teste',
  {
    id: 11,
    nome: "Produto",
    categoria: "Categoria",
    marca: "Marca",
    descricao: "Descrição",
    imagem: "image.webp"
  },
  {} // Erros esperados
);
```

---

## 🔄 CI/CD Integration

Se você usar GitHub Actions, adicione este workflow:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: node test-validation.mjs
```

---

## 📚 Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [tRPC Testing Guide](https://trpc.io/docs/server/testing)
- [Testing Library](https://testing-library.com/)

---

**Última atualização**: Maio 2026
**Versão**: 7.0.0
