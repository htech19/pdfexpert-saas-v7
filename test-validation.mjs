#!/usr/bin/env node

/**
 * PDFExpert v7.0 - Script de Teste de Validação de Metadados
 * 
 * Uso: node test-validation.mjs
 * 
 * Este script testa a lógica de validação de produtos extraídos
 * Você pode rodá-lo localmente para verificar se a validação está funcionando
 */

// Função de validação (mesma do componente)
const validateProduct = (product) => {
  const errors = {};
  if (!product.nome?.trim()) errors.nome = "Nome é obrigatório";
  if (!product.categoria?.trim()) errors.categoria = "Categoria é obrigatória";
  if (!product.marca?.trim()) errors.marca = "Marca é obrigatória";
  if (!product.descricao?.trim()) errors.descricao = "Descrição é obrigatória";
  return errors;
};

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

// Testes
let totalTests = 0;
let passedTests = 0;

const runTest = (name, product, expectedErrors) => {
  totalTests++;
  const errors = validateProduct(product);
  const errorCount = Object.keys(errors).length;
  const expectedCount = Object.keys(expectedErrors).length;
  
  if (errorCount === expectedCount && JSON.stringify(errors) === JSON.stringify(expectedErrors)) {
    log.success(`${name}`);
    passedTests++;
  } else {
    log.error(`${name}`);
    console.log(`  Esperado: ${JSON.stringify(expectedErrors)}`);
    console.log(`  Obtido:   ${JSON.stringify(errors)}`);
  }
};

// Executar testes
log.section('PDFExpert v7.0 - Testes de Validação de Metadados');

// Teste 1: Produto válido
log.test('Teste 1: Produto com todos os campos válidos');
runTest(
  'Produto válido deve passar',
  {
    id: 1,
    nome: "Fone Bluetooth Kaidi",
    categoria: "Áudio",
    marca: "Kaidi",
    descricao: "Fone de ouvido sem fio com cancelamento de ruído",
    imagem: "fone-kaidi.webp"
  },
  {}
);

// Teste 2: Nome vazio
log.test('Teste 2: Produto com nome vazio');
runTest(
  'Nome vazio deve gerar erro',
  {
    id: 2,
    nome: "",
    categoria: "Áudio",
    marca: "Kaidi",
    descricao: "Descrição",
    imagem: "image.webp"
  },
  { nome: "Nome é obrigatório" }
);

// Teste 3: Categoria vazia
log.test('Teste 3: Produto com categoria vazia');
runTest(
  'Categoria vazia deve gerar erro',
  {
    id: 3,
    nome: "Fone",
    categoria: "",
    marca: "Kaidi",
    descricao: "Descrição",
    imagem: "image.webp"
  },
  { categoria: "Categoria é obrigatória" }
);

// Teste 4: Marca vazia
log.test('Teste 4: Produto com marca vazia');
runTest(
  'Marca vazia deve gerar erro',
  {
    id: 4,
    nome: "Fone",
    categoria: "Áudio",
    marca: "",
    descricao: "Descrição",
    imagem: "image.webp"
  },
  { marca: "Marca é obrigatória" }
);

// Teste 5: Descrição vazia
log.test('Teste 5: Produto com descrição vazia');
runTest(
  'Descrição vazia deve gerar erro',
  {
    id: 5,
    nome: "Fone",
    categoria: "Áudio",
    marca: "Kaidi",
    descricao: "",
    imagem: "image.webp"
  },
  { descricao: "Descrição é obrigatória" }
);

// Teste 6: Múltiplos campos vazios
log.test('Teste 6: Produto com múltiplos campos vazios');
runTest(
  'Múltiplos campos vazios devem gerar múltiplos erros',
  {
    id: 6,
    nome: "",
    categoria: "",
    marca: "Kaidi",
    descricao: "",
    imagem: "image.webp"
  },
  {
    nome: "Nome é obrigatório",
    categoria: "Categoria é obrigatória",
    descricao: "Descrição é obrigatória"
  }
);

// Teste 7: Espaços em branco
log.test('Teste 7: Produto com apenas espaços em branco');
runTest(
  'Espaços em branco devem ser tratados como vazio',
  {
    id: 7,
    nome: "   ",
    categoria: "Áudio",
    marca: "Kaidi",
    descricao: "Descrição",
    imagem: "image.webp"
  },
  { nome: "Nome é obrigatório" }
);

// Teste 8: Campos com espaços válidos
log.test('Teste 8: Produto com espaços válidos');
runTest(
  'Espaços válidos devem ser aceitos',
  {
    id: 8,
    nome: "  Fone Bluetooth  ",
    categoria: "Áudio",
    marca: "Kaidi",
    descricao: "Descrição",
    imagem: "image.webp"
  },
  {}
);

// Teste 9: Todos os campos vazios
log.test('Teste 9: Produto com todos os campos vazios');
runTest(
  'Todos os campos vazios devem gerar 4 erros',
  {
    id: 9,
    nome: "",
    categoria: "",
    marca: "",
    descricao: "",
    imagem: "image.webp"
  },
  {
    nome: "Nome é obrigatório",
    categoria: "Categoria é obrigatória",
    marca: "Marca é obrigatória",
    descricao: "Descrição é obrigatória"
  }
);

// Teste 10: Produto com caracteres especiais
log.test('Teste 10: Produto com caracteres especiais');
runTest(
  'Caracteres especiais devem ser aceitos',
  {
    id: 10,
    nome: "Fone Bluetooth 5.0 (Kaidi KD-771)",
    categoria: "Áudio & Vídeo",
    marca: "Kaidi™",
    descricao: "Fone com suporte a Bluetooth 5.0, 30h de bateria e cancelamento de ruído ativo (ANC)",
    imagem: "image.webp"
  },
  {}
);

// Resumo
log.section(`Resumo dos Testes`);
log.info(`Total de testes: ${totalTests}`);
log.success(`Testes passados: ${passedTests}`);
if (passedTests < totalTests) {
  log.error(`Testes falhados: ${totalTests - passedTests}`);
}

// Status final
console.log();
if (passedTests === totalTests) {
  log.success(`Todos os ${totalTests} testes passaram! 🎉`);
  process.exit(0);
} else {
  log.error(`${totalTests - passedTests} teste(s) falharam`);
  process.exit(1);
}
