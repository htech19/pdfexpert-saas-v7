@echo off
setlocal EnableExtensions

title PDFExpert v7 - Local Manager
color 0A

cd /d "%~dp0"

if not exist ".env.local" (
    echo [ERRO] Arquivo .env.local nao encontrado.
    pause
    exit /b 1
)

echo ============================================================
echo PDFExpert Enterprise v7
echo ============================================================
echo.

call pnpm list dotenv >nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando dotenv...
    call pnpm add dotenv
)

call pnpm list tsx >nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando tsx...
    call pnpm add -D tsx
)

call pnpm list drizzle-kit >nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando drizzle-kit...
    call pnpm add -D drizzle-kit
)

call pnpm list mysql2 >nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando mysql2...
    call pnpm add mysql2
)

echo [OK] Dependencias verificadas.
echo.

set NODE_ENV=development

start "" "http://localhost:3000"

pnpm exec tsx watch server/_core/index.ts

pause
