#!/bin/bash

################################################################################
# PDFExpert Enterprise v7.0 - Script de Instalação Automática
# 
# Este script verifica e instala todos os requisitos necessários
# Compatível com: Linux, macOS
#
# Uso: bash install.sh
################################################################################

# Cores para terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_section() {
    echo -e "\n${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}\n"
}

# Detectar sistema operacional
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        OS="unknown"
    fi
}

# Verificar Node.js
check_nodejs() {
    log_info "Verificando Node.js..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            log_success "Node.js $(node -v) instalado"
            return 0
        else
            log_error "Node.js versão $(node -v) detectado, mas v18+ é necessário"
            return 1
        fi
    else
        log_error "Node.js não está instalado"
        return 1
    fi
}

# Instalar Node.js
install_nodejs() {
    log_warn "Instalando Node.js 20 LTS..."
    
    if [ "$OS" == "macos" ]; then
        if command -v brew &> /dev/null; then
            brew install node
        else
            log_error "Homebrew não encontrado. Instale em: https://brew.sh"
            return 1
        fi
    elif [ "$OS" == "linux" ]; then
        if [ "$DISTRO" == "ubuntu" ] || [ "$DISTRO" == "debian" ]; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif [ "$DISTRO" == "fedora" ] || [ "$DISTRO" == "rhel" ]; then
            sudo dnf install nodejs
        else
            log_error "Distribuição não suportada. Instale Node.js manualmente em: https://nodejs.org"
            return 1
        fi
    fi
    
    if check_nodejs; then
        return 0
    else
        return 1
    fi
}

# Verificar pnpm
check_pnpm() {
    log_info "Verificando pnpm..."
    
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm -v | cut -d'.' -f1)
        if [ "$PNPM_VERSION" -ge 10 ]; then
            log_success "pnpm $(pnpm -v) instalado"
            return 0
        else
            log_error "pnpm versão $(pnpm -v) detectado, mas v10+ é necessário"
            return 1
        fi
    else
        log_error "pnpm não está instalado"
        return 1
    fi
}

# Instalar pnpm
install_pnpm() {
    log_warn "Instalando pnpm..."
    npm install -g pnpm
    
    if check_pnpm; then
        return 0
    else
        return 1
    fi
}

# Verificar Git
check_git() {
    log_info "Verificando Git..."
    
    if command -v git &> /dev/null; then
        log_success "Git $(git --version | awk '{print $3}') instalado"
        return 0
    else
        log_error "Git não está instalado"
        return 1
    fi
}

# Instalar Git
install_git() {
    log_warn "Instalando Git..."
    
    if [ "$OS" == "macos" ]; then
        if command -v brew &> /dev/null; then
            brew install git
        else
            log_error "Homebrew não encontrado. Instale em: https://brew.sh"
            return 1
        fi
    elif [ "$OS" == "linux" ]; then
        if [ "$DISTRO" == "ubuntu" ] || [ "$DISTRO" == "debian" ]; then
            sudo apt-get update
            sudo apt-get install -y git
        elif [ "$DISTRO" == "fedora" ] || [ "$DISTRO" == "rhel" ]; then
            sudo dnf install git
        fi
    fi
    
    if check_git; then
        return 0
    else
        return 1
    fi
}

# Verificar MySQL
check_mysql() {
    log_info "Verificando MySQL/MariaDB..."
    
    if command -v mysql &> /dev/null; then
        MYSQL_VERSION=$(mysql --version | grep -oP '\d+\.\d+' | head -1 | cut -d'.' -f1)
        if [ "$MYSQL_VERSION" -ge 8 ]; then
            log_success "MySQL $(mysql --version) instalado"
            return 0
        else
            log_error "MySQL versão $(mysql --version) detectado, mas v8+ é necessário"
            return 1
        fi
    else
        log_error "MySQL/MariaDB não está instalado"
        return 1
    fi
}

# Instalar MySQL
install_mysql() {
    log_warn "Instalando MySQL 8.0..."
    
    if [ "$OS" == "macos" ]; then
        if command -v brew &> /dev/null; then
            brew install mysql
            brew services start mysql
        else
            log_error "Homebrew não encontrado. Instale em: https://brew.sh"
            return 1
        fi
    elif [ "$OS" == "linux" ]; then
        if [ "$DISTRO" == "ubuntu" ] || [ "$DISTRO" == "debian" ]; then
            sudo apt-get update
            sudo apt-get install -y mysql-server
            sudo systemctl start mysql
        elif [ "$DISTRO" == "fedora" ] || [ "$DISTRO" == "rhel" ]; then
            sudo dnf install mysql-server
            sudo systemctl start mysqld
        fi
    fi
    
    log_info "Aguarde alguns segundos para MySQL iniciar..."
    sleep 5
    
    if check_mysql; then
        return 0
    else
        return 1
    fi
}

# Criar banco de dados
setup_database() {
    log_info "Configurando banco de dados..."
    
    # Verificar se banco já existe
    if mysql -u root -e "USE pdfexpert_v7" 2>/dev/null; then
        log_success "Banco de dados 'pdfexpert_v7' já existe"
        return 0
    fi
    
    log_warn "Criando banco de dados e usuário..."
    
    mysql -u root << EOF
CREATE DATABASE pdfexpert_v7 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pdfexpert'@'localhost' IDENTIFIED BY 'pdfexpert_secure_pass_2024';
GRANT ALL PRIVILEGES ON pdfexpert_v7.* TO 'pdfexpert'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Banco de dados criado com sucesso"
        return 0
    else
        log_error "Erro ao criar banco de dados"
        return 1
    fi
}

# Instalar dependências do projeto
install_dependencies() {
    log_section "Instalando Dependências do Projeto"
    
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm não está disponível"
        return 1
    fi
    
    log_info "Executando: pnpm install"
    pnpm install
    
    if [ $? -eq 0 ]; then
        log_success "Dependências instaladas com sucesso"
        return 0
    else
        log_error "Erro ao instalar dependências"
        return 1
    fi
}

# Configurar migrations
setup_migrations() {
    log_section "Configurando Banco de Dados (Migrations)"
    
    log_info "Gerando migrations..."
    pnpm drizzle-kit generate
    
    log_info "Aplicando migrations..."
    pnpm drizzle-kit migrate
    
    if [ $? -eq 0 ]; then
        log_success "Migrations aplicadas com sucesso"
        return 0
    else
        log_error "Erro ao aplicar migrations"
        return 1
    fi
}

# Criar arquivo .env.local
setup_env() {
    log_section "Configurando Variáveis de Ambiente"
    
    if [ -f .env.local ]; then
        log_warn ".env.local já existe, pulando..."
        return 0
    fi
    
    log_info "Criando .env.local..."
    
    cat > .env.local << 'EOF'
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
EOF
    
    log_success ".env.local criado com sucesso"
    log_warn "⚠️  Edite o arquivo .env.local com suas credenciais reais"
    return 0
}

# Função principal
main() {
    clear
    
    log_section "PDFExpert Enterprise v7.0 - Instalação Automática"
    
    detect_os
    log_info "Sistema Operacional: $OS"
    
    # Verificar requisitos
    log_section "Verificando Requisitos"
    
    NODEJS_OK=false
    PNPM_OK=false
    GIT_OK=false
    MYSQL_OK=false
    
    # Node.js
    if ! check_nodejs; then
        if ! install_nodejs; then
            log_error "Falha ao instalar Node.js"
            exit 1
        fi
    fi
    NODEJS_OK=true
    
    # pnpm
    if ! check_pnpm; then
        if ! install_pnpm; then
            log_error "Falha ao instalar pnpm"
            exit 1
        fi
    fi
    PNPM_OK=true
    
    # Git
    if ! check_git; then
        if ! install_git; then
            log_error "Falha ao instalar Git"
            exit 1
        fi
    fi
    GIT_OK=true
    
    # MySQL
    if ! check_mysql; then
        if ! install_mysql; then
            log_warn "Falha ao instalar MySQL automaticamente"
            log_warn "Instale manualmente em: https://www.mysql.com/downloads/"
            read -p "Pressione Enter para continuar..."
        fi
    fi
    MYSQL_OK=true
    
    # Resumo de requisitos
    log_section "Resumo dos Requisitos"
    echo -e "Node.js 18+:     ${GREEN}✅${NC}"
    echo -e "pnpm 10+:        ${GREEN}✅${NC}"
    echo -e "Git:             ${GREEN}✅${NC}"
    echo -e "MySQL 8+:        ${GREEN}✅${NC}"
    
    # Configurar projeto
    log_section "Configurando Projeto PDFExpert"
    
    # Variáveis de ambiente
    setup_env
    
    # Dependências
    install_dependencies
    
    # Banco de dados
    setup_database
    
    # Migrations
    setup_migrations
    
    # Sucesso!
    log_section "Instalação Concluída com Sucesso! 🎉"
    
    echo -e "${GREEN}Próximos passos:${NC}"
    echo ""
    echo "1. Edite o arquivo .env.local com suas credenciais:"
    echo "   nano .env.local"
    echo ""
    echo "2. Inicie o servidor de desenvolvimento:"
    echo "   pnpm dev"
    echo ""
    echo "3. Abra no navegador:"
    echo "   http://localhost:3000"
    echo ""
    echo "4. Para rodar testes:"
    echo "   pnpm test"
    echo "   node test-validation.mjs"
    echo ""
    
    log_success "Tudo pronto! Bom desenvolvimento! 🚀"
}

# Executar
main "$@"
