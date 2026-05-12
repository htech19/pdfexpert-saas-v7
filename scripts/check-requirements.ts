#!/usr/bin/env node

/**
 * PDFExpert Enterprise v7.0 - Verificação Automática de Requisitos
 * 
 * Este script roda automaticamente após `pnpm install`
 * Verifica e instala todos os requisitos necessários
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg: string) => {
    console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}${msg}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  }
};

// Detectar sistema operacional
const getOS = (): 'windows' | 'macos' | 'linux' => {
  const platform = os.platform();
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'macos';
  return 'linux';
};

// Executar comando silenciosamente
const execSilent = (cmd: string): boolean => {
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

// Obter versão de um comando
const getVersion = (cmd: string): string | null => {
  try {
    const output = execSync(`${cmd} --version`, { encoding: 'utf-8' });
    return output.trim();
  } catch {
    return null;
  }
};

// Verificar Node.js
const checkNodejs = (): boolean => {
  log.info('Verificando Node.js...');
  
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    
    if (major >= 18) {
      log.success(`Node.js ${version} instalado`);
      return true;
    } else {
      log.error(`Node.js ${version} detectado, mas v18+ é necessário`);
      return false;
    }
  } catch {
    log.error('Node.js não está instalado');
    return false;
  }
};

// Verificar pnpm
const checkPnpm = (): boolean => {
  log.info('Verificando pnpm...');
  
  try {
    const version = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    const major = parseInt(version.split('.')[0]);
    
    if (major >= 10) {
      log.success(`pnpm ${version} instalado`);
      return true;
    } else {
      log.error(`pnpm ${version} detectado, mas v10+ é necessário`);
      return false;
    }
  } catch {
    log.error('pnpm não está instalado');
    log.warn('Instalando pnpm globalmente...');
    
    try {
      execSync('npm install -g pnpm', { stdio: 'inherit' });
      log.success('pnpm instalado com sucesso');
      return true;
    } catch {
      log.error('Falha ao instalar pnpm');
      return false;
    }
  }
};

// Verificar Git
const checkGit = (): boolean => {
  log.info('Verificando Git...');
  
  try {
    const version = execSync('git --version', { encoding: 'utf-8' }).trim();
    log.success(`${version} instalado`);
    return true;
  } catch {
    log.error('Git não está instalado');
    log.warn('Visite: https://git-scm.com/download');
    return false;
  }
};

// Verificar MySQL
const checkMysql = (): boolean => {
  log.info('Verificando MySQL/MariaDB...');
  
  try {
    const version = execSync('mysql --version', { encoding: 'utf-8' }).trim();
    const major = parseInt(version.match(/\d+/)?.[0] || '0');
    
    if (major >= 8) {
      log.success(`${version} instalado`);
      return true;
    } else {
      log.error(`MySQL ${version} detectado, mas v8+ é necessário`);
      return false;
    }
  } catch {
    log.error('MySQL/MariaDB não está instalado');
    log.warn('Visite: https://www.mysql.com/downloads/');
    return false;
  }
};

// Criar arquivo .env.local
const createEnvFile = (): boolean => {
  log.info('Configurando variáveis de ambiente...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    log.warn('.env.local já existe, pulando...');
    return true;
  }
  
  const envContent = `# ============================================
# PDFExpert Enterprise v7.0 - Variáveis de Ambiente
# ============================================

# Database
DATABASE_URL=mysql://pdfexpert:pdfexpert_secure_pass_2024@localhost:3306/pdfexpert_v7

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_minimo_32_caracteres

# GitHub (opcional)
GITHUB_TOKEN=seu_token_github_aqui
GITHUB_REPO=seu-usuario/seu-repositorio
GITHUB_BRANCH=main

# Gemini AI (opcional)
GEMINI_API_KEY=sua_chave_gemini_aqui

# Manus OAuth (opcional)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# App Branding
VITE_APP_TITLE=PDFExpert Enterprise v7.0
VITE_APP_LOGO=https://seu-dominio.com/logo.png

# Ambiente
NODE_ENV=development
`;
  
  try {
    fs.writeFileSync(envPath, envContent);
    log.success('.env.local criado com sucesso');
    log.warn('⚠️  Edite o arquivo .env.local com suas credenciais reais');
    return true;
  } catch (error) {
    log.error(`Erro ao criar .env.local: ${error}`);
    return false;
  }
};

// Configurar banco de dados
const setupDatabase = (): boolean => {
  log.info('Configurando banco de dados...');
  
  try {
    // Verificar se banco já existe
    execSilent('mysql -u root -e "USE pdfexpert_v7"');
    log.success('Banco de dados "pdfexpert_v7" já existe');
    return true;
  } catch {
    log.warn('Criando banco de dados...');
    
    try {
      const sql = `
        CREATE DATABASE pdfexpert_v7 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE USER 'pdfexpert'@'localhost' IDENTIFIED BY 'pdfexpert_secure_pass_2024';
        GRANT ALL PRIVILEGES ON pdfexpert_v7.* TO 'pdfexpert'@'localhost';
        FLUSH PRIVILEGES;
      `;
      
      execSync(`mysql -u root -e "${sql.replace(/\n/g, ' ')}"`, { stdio: 'pipe' });
      log.success('Banco de dados criado com sucesso');
      return true;
    } catch (error) {
      log.warn('Não foi possível criar o banco de dados automaticamente');
      log.warn('Execute manualmente ou use Docker');
      return false;
    }
  }
};

// Aplicar migrations
const applyMigrations = (): boolean => {
  log.info('Aplicando migrations do banco de dados...');
  
  try {
    execSync('pnpm drizzle-kit migrate', { stdio: 'inherit' });
    log.success('Migrations aplicadas com sucesso');
    return true;
  } catch (error) {
    log.warn('Falha ao aplicar migrations');
    log.warn('Execute manualmente: pnpm drizzle-kit migrate');
    return false;
  }
};

// Função principal
const main = async () => {
  console.clear();
  
  log.section('PDFExpert Enterprise v7.0 - Verificação de Requisitos');
  
  const osType = getOS();
  log.info(`Sistema Operacional: ${osType}`);
  
  log.section('Verificando Requisitos');
  
  const checks = {
    nodejs: checkNodejs(),
    pnpm: checkPnpm(),
    git: checkGit(),
    mysql: checkMysql()
  };
  
  log.section('Resumo dos Requisitos');
  console.log(`Node.js 18+:     ${checks.nodejs ? colors.green + '✅' + colors.reset : colors.red + '❌' + colors.reset}`);
  console.log(`pnpm 10+:        ${checks.pnpm ? colors.green + '✅' + colors.reset : colors.red + '❌' + colors.reset}`);
  console.log(`Git:             ${checks.git ? colors.green + '✅' + colors.reset : colors.red + '❌' + colors.reset}`);
  console.log(`MySQL 8+:        ${checks.mysql ? colors.green + '✅' + colors.reset : colors.yellow + '⚠️ ' + colors.reset}`);
  
  // Se Node.js ou pnpm falharem, parar
  if (!checks.nodejs || !checks.pnpm) {
    log.error('Requisitos críticos não atendidos. Abortando...');
    process.exit(1);
  }
  
  log.section('Configurando Projeto PDFExpert');
  
  // Criar .env.local
  createEnvFile();
  
  // Configurar banco de dados (opcional)
  if (checks.mysql) {
    setupDatabase();
    applyMigrations();
  } else {
    log.warn('MySQL não detectado. Configure manualmente ou use Docker.');
    log.info('Instruções: https://github.com/htech19/pdfexpert-saas-v7#database-setup');
  }
  
  log.section('Instalação Concluída! 🎉');
  
  console.log(`${colors.green}Próximos passos:${colors.reset}`);
  console.log('');
  console.log('1. Edite o arquivo .env.local com suas credenciais:');
  console.log('   nano .env.local');
  console.log('');
  console.log('2. Se usar MySQL, aplique as migrations:');
  console.log('   pnpm drizzle-kit migrate');
  console.log('');
  console.log('3. Inicie o servidor de desenvolvimento:');
  console.log('   pnpm dev');
  console.log('');
  console.log('4. Abra no navegador:');
  console.log('   http://localhost:3000');
  console.log('');
  console.log('5. Para rodar testes:');
  console.log('   pnpm test');
  console.log('   node test-validation.mjs');
  console.log('');
  
  log.success('Tudo pronto! Bom desenvolvimento! 🚀');
};

// Executar
main().catch(error => {
  log.error(`Erro: ${error.message}`);
  process.exit(1);
});
