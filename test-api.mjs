#!/usr/bin/env node

/**
 * PDFExpert v7.0 - Script de Teste de API tRPC
 * 
 * Uso: node test-api.mjs
 * 
 * Este script testa os endpoints tRPC localmente
 * Certifique-se de que o servidor está rodando (pnpm dev)
 */

const API_URL = 'http://localhost:3000/api/trpc';

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${msg}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
};

// Função para fazer requisições
const makeRequest = async (endpoint, method = 'POST', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}/${endpoint}`, options);
    const data = await response.json();

    return {
      status: response.status,
      data,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      ok: false
    };
  }
};

// Testes
const runTests = async () => {
  log.section('PDFExpert v7.0 - Testes de API tRPC');

  // Verificar se o servidor está rodando
  log.test('Verificando se o servidor está rodando...');
  const healthCheck = await makeRequest('auth.me');
  
  if (!healthCheck.ok && healthCheck.status === 0) {
    log.error('Servidor não está respondendo em http://localhost:3000');
    log.info('Inicie o servidor com: pnpm dev');
    process.exit(1);
  }

  log.success('Servidor está rodando!');

  // Teste 1: Verificar autenticação
  log.test('Teste 1: Verificar status de autenticação');
  const authStatus = await makeRequest('auth.me');
  
  if (authStatus.ok) {
    log.success('Endpoint auth.me respondeu com sucesso');
    console.log(`  Status: ${authStatus.status}`);
    console.log(`  Resposta: ${JSON.stringify(authStatus.data, null, 2)}`);
  } else {
    log.warn('Endpoint auth.me retornou erro (esperado se não autenticado)');
    console.log(`  Status: ${authStatus.status}`);
  }

  // Teste 2: Testar upload de PDF
  log.test('Teste 2: Simular upload de PDF');
  const uploadTest = await makeRequest('processing.upload', 'POST', {
    fileName: 'catalogo-teste.pdf'
  });

  if (uploadTest.ok) {
    log.success('Endpoint processing.upload respondeu com sucesso');
    console.log(`  Resposta: ${JSON.stringify(uploadTest.data, null, 2)}`);
  } else {
    log.warn('Endpoint processing.upload retornou erro');
    console.log(`  Status: ${uploadTest.status}`);
    console.log(`  Erro: ${JSON.stringify(uploadTest.data, null, 2)}`);
  }

  // Teste 3: Testar histórico de processamentos
  log.test('Teste 3: Obter histórico de processamentos');
  const historyTest = await makeRequest('processing.getHistory', 'GET');

  if (historyTest.ok) {
    log.success('Endpoint processing.getHistory respondeu com sucesso');
    console.log(`  Total de registros: ${Array.isArray(historyTest.data) ? historyTest.data.length : 0}`);
  } else {
    log.warn('Endpoint processing.getHistory retornou erro');
    console.log(`  Status: ${historyTest.status}`);
  }

  // Teste 4: Testar confirmação de metadados
  log.test('Teste 4: Confirmar metadados de produtos');
  const confirmTest = await makeRequest('processing.confirmMetadata', 'POST', {
    processingId: 1,
    products: [
      {
        id: 1,
        nome: "Fone Bluetooth Kaidi",
        categoria: "Áudio",
        marca: "Kaidi",
        descricao: "Fone de ouvido sem fio com cancelamento de ruído",
        imagem: "fone-kaidi.webp"
      }
    ]
  });

  if (confirmTest.ok) {
    log.success('Endpoint processing.confirmMetadata respondeu com sucesso');
    console.log(`  Resposta: ${JSON.stringify(confirmTest.data, null, 2)}`);
  } else {
    log.warn('Endpoint processing.confirmMetadata retornou erro');
    console.log(`  Status: ${confirmTest.status}`);
    console.log(`  Erro: ${JSON.stringify(confirmTest.data, null, 2)}`);
  }

  // Resumo
  log.section('Resumo dos Testes');
  log.info('Todos os endpoints foram testados');
  log.info('Para mais informações, verifique os logs do servidor');
  log.success('Testes concluídos! 🎉');
};

// Executar testes
runTests().catch(error => {
  log.error(`Erro ao executar testes: ${error.message}`);
  process.exit(1);
});
