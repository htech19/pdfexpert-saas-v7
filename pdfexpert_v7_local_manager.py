#!/usr/bin/env python3
"""
PDFExpert v7 local setup manager for Windows.

This script keeps the .bat small and moves the fragile setup logic to Python:
- requirement checks
- optional installer calls
- .env.local creation/completion
- MySQL/MariaDB setup
- pnpm install
- Drizzle migrations
- test panel
- dev server launch and browser open after health check
"""

from __future__ import annotations

import argparse
import datetime as _dt
import getpass
import os
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple
from urllib.parse import unquote, urlparse


DEFAULT_PROJECT = Path(
    r"C:\Users\hunlock\Documents\LOJA\Agente_Sistemas\SIstemas\PDFExpert\Em Andamento\pdfexpert-saas-v7"
)
APP_URL = "http://localhost:3000"
DB_NAME = "pdfexpert_v7"
DB_USER = "pdfexpert"
DB_PASSWORD = "pdfexpert_dev_2026"
MYSQL_HOST = "127.0.0.1"
MYSQL_PORT = "3306"


class TeeLogger:
    def __init__(self, log_file: Path) -> None:
        self.log_file = log_file
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
        self._fh = self.log_file.open("a", encoding="utf-8", errors="replace")
        self._lock = threading.Lock()

    def close(self) -> None:
        self._fh.close()

    def write(self, message: str = "") -> None:
        with self._lock:
            try:
                print(message, flush=True)
            except UnicodeEncodeError:
                encoding = sys.stdout.encoding or "utf-8"
                safe_message = message.encode(encoding, errors="replace").decode(encoding, errors="replace")
                print(safe_message, flush=True)
            self._fh.write(message + "\n")
            self._fh.flush()

    def section(self, title: str) -> None:
        line = "=" * 72
        self.write("")
        self.write(line)
        self.write(title)
        self.write(line)

    def info(self, message: str) -> None:
        self.write(f"[INFO] {message}")

    def ok(self, message: str) -> None:
        self.write(f"[OK] {message}")

    def warn(self, message: str) -> None:
        self.write(f"[WARN] {message}")

    def error(self, message: str) -> None:
        self.write(f"[ERRO] {message}")


class LocalManager:
    def __init__(self, project: Path, action: str = "menu", mysql_admin_user: str = "root", mysql_admin_password: Optional[str] = None) -> None:
        self.project = project.resolve()
        self.action = action
        self.mysql_admin_user = mysql_admin_user
        self.mysql_admin_password = mysql_admin_password
        stamp = _dt.datetime.now().strftime("%Y%m%d-%H%M%S")
        self.log = TeeLogger(self.project / "logs" / f"local-setup-{stamp}.log")

    def run(self) -> int:
        try:
            self.validate_project()
            self.dispatch_action()
            return 0
        except KeyboardInterrupt:
            self.log.warn("Operacao cancelada pelo usuario.")
            return 130
        except Exception as exc:
            self.log.error(str(exc))
            return 1
        finally:
            self.log.close()

    def dispatch_action(self) -> None:
        if self.action == "menu":
            self.menu()
        elif self.action == "check":
            self.check_requirements(show_summary=True)
        elif self.action == "install":
            self.install_missing_requirements()
        elif self.action == "env":
            self.ensure_env_file()
        elif self.action == "database":
            self.setup_database()
        elif self.action == "deps":
            self.install_dependencies()
        elif self.action == "migrations":
            self.apply_migrations()
        elif self.action == "tests":
            self.test_panel()
        elif self.action == "server":
            self.start_dev_server(open_browser=True)
        elif self.action == "full":
            self.full_setup()
        else:
            raise RuntimeError(f"Acao desconhecida: {self.action}")

    def validate_project(self) -> None:
        self.log.section("PDFExpert v7 - Gerenciador local")
        self.log.info(f"Projeto: {self.project}")
        self.log.info(f"Log: {self.log.log_file}")

        if not self.project.exists():
            raise RuntimeError(f"Pasta do projeto nao encontrada: {self.project}")
        if not (self.project / "package.json").exists():
            raise RuntimeError("package.json nao encontrado. Confirme a pasta do projeto.")

    def menu(self) -> None:
        while True:
            self.log.write("")
            print_menu()
            choice = input("Escolha uma opcao: ").strip().lower()

            if choice == "1":
                self.full_setup()
            elif choice == "2":
                self.check_requirements(show_summary=True)
            elif choice == "3":
                self.install_missing_requirements()
            elif choice == "4":
                self.ensure_env_file()
            elif choice == "5":
                self.setup_database()
            elif choice == "6":
                self.install_dependencies()
            elif choice == "7":
                self.apply_migrations()
            elif choice == "8":
                self.test_panel()
            elif choice == "9":
                self.start_dev_server(open_browser=True)
            elif choice == "0" or choice == "q":
                self.log.info("Saindo.")
                return
            else:
                self.log.warn("Opcao invalida.")

    def full_setup(self) -> None:
        self.log.section("Setup completo")
        status = self.check_requirements(show_summary=True)
        if not all(status.values()):
            self.install_missing_requirements()
            status = self.check_requirements(show_summary=True)

        required_ok = status.get("node", False) and status.get("pnpm", False) and status.get("git", False)
        if not required_ok:
            self.log.error("Node.js, pnpm e Git sao obrigatorios. Corrija os itens acima e rode novamente.")
            return

        self.ensure_env_file()
        self.install_dependencies()

        if status.get("mysql", False):
            self.setup_database()
            self.apply_migrations()
        else:
            self.log.warn("MySQL/MariaDB nao esta pronto. O servidor pode falhar ao acessar o banco.")
            self.log.warn("Use a opcao 3 para instalar ou a opcao 5 depois de configurar o MySQL.")

        self.start_dev_server(open_browser=True)

    def check_requirements(self, show_summary: bool = False) -> Dict[str, bool]:
        self.log.section("Verificando requisitos")
        status = {
            "node": self.check_node(),
            "pnpm": self.check_pnpm(),
            "mysql": self.check_mysql(),
            "git": self.check_git(),
        }
        if show_summary:
            self.log.section("Resumo")
            for name, ok in status.items():
                self.log.write(f"{name.upper():8} {'OK' if ok else 'FALHOU'}")
        return status

    def check_node(self) -> bool:
        node = shutil.which("node")
        if not node:
            self.log.error("Node.js nao encontrado.")
            return False
        code, out = capture(["node", "--version"])
        version = parse_version(out)
        ok = bool(version and version[0] >= 18)
        self.log.ok(f"Node.js {out.strip()}") if ok else self.log.error(f"Node.js 18+ necessario. Atual: {out.strip()}")
        return ok

    def check_pnpm(self) -> bool:
        pnpm = shutil.which("pnpm")
        if not pnpm:
            self.log.error("pnpm nao encontrado.")
            return False
        code, out = capture(["pnpm", "--version"])
        version = parse_version(out)
        ok = bool(version and version[0] >= 10)
        self.log.ok(f"pnpm {out.strip()}") if ok else self.log.error(f"pnpm 10+ necessario. Atual: {out.strip()}")
        return ok

    def check_mysql(self) -> bool:
        mysql = find_mysql_executable()
        if not mysql:
            self.log.error("Cliente mysql nao encontrado.")
            return False
        prepend_executable_dir(mysql)
        code, out = capture(["mysql", "--version"])
        text = out.strip()
        mysql_version = parse_mysql_version(text)
        mariadb_version = parse_mariadb_version(text)
        ok = False
        if "mariadb" in text.lower():
            ok = bool(mariadb_version and (mariadb_version[0], mariadb_version[1]) >= (10, 5))
        else:
            ok = bool(mysql_version and mysql_version[0] >= 8)
        self.log.ok(text) if ok else self.log.error(f"MySQL 8+ ou MariaDB 10.5+ necessario. Atual: {text}")
        return ok

    def check_git(self) -> bool:
        if not shutil.which("git"):
            self.log.error("Git nao encontrado.")
            return False
        code, out = capture(["git", "--version"])
        self.log.ok(out.strip())
        return code == 0

    def install_missing_requirements(self) -> None:
        self.log.section("Instalando requisitos ausentes")
        status = self.check_requirements(show_summary=False)

        if not shutil.which("winget"):
            self.log.warn("winget nao encontrado. Instale manualmente Node.js, Git e MySQL quando necessario.")
        else:
            if not status["node"]:
                self.run_command(
                    ["winget", "install", "-e", "--id", "OpenJS.NodeJS.LTS", "--accept-package-agreements", "--accept-source-agreements"],
                    "Instalar Node.js LTS",
                )
            if not status["git"]:
                self.run_command(
                    ["winget", "install", "-e", "--id", "Git.Git", "--accept-package-agreements", "--accept-source-agreements"],
                    "Instalar Git",
                )
            if not status["mysql"]:
                self.log.warn("A instalacao do MySQL pode pedir permissao de administrador.")
                self.run_command(
                    ["winget", "install", "-e", "--id", "Oracle.MySQL", "--accept-package-agreements", "--accept-source-agreements"],
                    "Instalar MySQL",
                )

        if not self.check_pnpm():
            if shutil.which("corepack"):
                self.run_command(["corepack", "enable"], "Ativar corepack")
                self.run_command(["corepack", "prepare", "pnpm@10.15.1", "--activate"], "Instalar pnpm 10 via corepack")
            elif shutil.which("npm"):
                self.run_command(["npm", "install", "-g", "pnpm@10"], "Instalar pnpm 10 via npm")
            else:
                self.log.error("npm/corepack nao encontrados. Instale Node.js e abra o terminal novamente.")

        self.log.warn("Se alguma ferramenta foi instalada agora, feche e abra este .bat para atualizar o PATH.")

    def ensure_env_file(self) -> None:
        self.log.section("Configurando .env.local")
        env_path = self.project / ".env.local"
        existing = read_env(env_path)
        created = not env_path.exists()

        defaults = {
            "DATABASE_URL": f"mysql://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_NAME}",
            "JWT_SECRET": secrets.token_hex(32),
            "GITHUB_TOKEN": "seu_token_github_opcional",
            "GITHUB_REPO": "seu-usuario/seu-repositorio",
            "GITHUB_BRANCH": "main",
            "GEMINI_API_KEY": "sua_chave_gemini_opcional",
            "VITE_APP_ID": "seu_app_id_opcional",
            "OAUTH_SERVER_URL": "https://api.manus.im",
            "VITE_OAUTH_PORTAL_URL": "https://portal.manus.im",
            "NODE_ENV": "development",
        }

        lines: List[str] = []
        if created:
            lines.extend(
                [
                    "# PDFExpert Enterprise v7.0 - ambiente local",
                    "# Criado pelo gerenciador local. Ajuste tokens reais quando necessario.",
                    "",
                ]
            )
        else:
            lines.append("")
            lines.append("# Chaves adicionadas pelo gerenciador local")

        added = 0
        for key, value in defaults.items():
            if key not in existing:
                lines.append(f"{key}={value}")
                added += 1

        if created:
            env_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
            self.log.ok(".env.local criado.")
        elif added:
            with env_path.open("a", encoding="utf-8") as fh:
                fh.write("\n".join(lines).rstrip() + "\n")
            self.log.ok(f".env.local completado com {added} chave(s) ausente(s).")
        else:
            self.log.ok(".env.local ja contem as chaves principais. Nada sobrescrito.")

        self.log.warn("Revise tokens opcionais no .env.local antes de usar integracoes externas.")

    def setup_database(self) -> None:
        self.log.section("Configurando banco MySQL/MariaDB")
        if not self.check_mysql():
            self.log.error("mysql nao esta disponivel no PATH.")
            return

        self.log.info("Sera criado/atualizado banco pdfexpert_v7 e usuario pdfexpert.")
        db = database_settings(self.project)
        self.log.info(f"Banco alvo: {db['database']} | usuario app: {db['user']} | host: {db['host']}:{db['port']}")
        if self.action == "menu" and sys.stdin.isatty():
            root_user = input(f"Usuario admin MySQL [{self.mysql_admin_user}]: ").strip() or self.mysql_admin_user
            root_password = getpass.getpass("Senha do admin MySQL (deixe vazio se nao houver): ")
        else:
            root_user = self.mysql_admin_user
            root_password = self.mysql_admin_password or ""
            self.log.info("Modo nao interativo: usando usuario admin MySQL informado/default.")

        sql = f"""
CREATE DATABASE IF NOT EXISTS {quote_identifier(db['database'])} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '{escape_sql(db['user'])}'@'localhost' IDENTIFIED BY '{escape_sql(db['password'])}';
CREATE USER IF NOT EXISTS '{escape_sql(db['user'])}'@'127.0.0.1' IDENTIFIED BY '{escape_sql(db['password'])}';
ALTER USER '{escape_sql(db['user'])}'@'localhost' IDENTIFIED BY '{escape_sql(db['password'])}';
ALTER USER '{escape_sql(db['user'])}'@'127.0.0.1' IDENTIFIED BY '{escape_sql(db['password'])}';
GRANT ALL PRIVILEGES ON {quote_identifier(db['database'])}.* TO '{escape_sql(db['user'])}'@'localhost';
GRANT ALL PRIVILEGES ON {quote_identifier(db['database'])}.* TO '{escape_sql(db['user'])}'@'127.0.0.1';
FLUSH PRIVILEGES;
"""
        ok = self.mysql_exec(sql, root_user, root_password, "Criar banco e usuario")
        if not ok:
            self.log.error("Nao foi possivel configurar o banco automaticamente.")
            self.log.warn("Verifique se o servico MySQL esta rodando e se a senha admin esta correta.")
            return

        verify_sql = "SELECT 1;"
        if self.mysql_exec(
            verify_sql,
            db["user"],
            db["password"],
            "Testar usuario da aplicacao",
            database=db["database"],
            host=db["host"],
            port=db["port"],
        ):
            self.log.ok("Banco configurado e usuario validado.")
            self.ensure_env_file()
        else:
            self.log.warn("Banco criado, mas a validacao do usuario falhou.")

    def mysql_exec(
        self,
        sql: str,
        user: str,
        password: str,
        label: str,
        database: Optional[str] = None,
        host: str = MYSQL_HOST,
        port: str = MYSQL_PORT,
    ) -> bool:
        with tempfile.TemporaryDirectory(prefix="pdfexpert-mysql-") as tmp:
            tmp_path = Path(tmp)
            sql_file = tmp_path / "cmd.sql"
            cnf_file = tmp_path / "client.cnf"
            sql_file.write_text(sql, encoding="utf-8")
            cnf_file.write_text(
                "[client]\n"
                f"user={user}\n"
                f"password={password}\n"
                f"host={host}\n"
                f"port={port}\n",
                encoding="utf-8",
            )
            args = ["mysql", f"--defaults-extra-file={cnf_file}"]
            if database:
                args.append(database)
            return self.run_command(args, label, stdin_file=sql_file, redact=True) == 0

    def install_dependencies(self) -> None:
        self.log.section("Instalando dependencias")
        if not self.check_pnpm():
            self.log.error("pnpm nao esta pronto.")
            return
        mysql = find_mysql_executable()
        if mysql:
            prepend_executable_dir(mysql)
        self.run_command(["pnpm", "install"], "pnpm install", cwd=self.project)

    def apply_migrations(self) -> None:
        self.log.section("Gerando e aplicando migrations")
        env = load_env_for_process(self.project / ".env.local")
        if "DATABASE_URL" not in env:
            self.log.warn("DATABASE_URL nao encontrado. Criando/completando .env.local.")
            self.ensure_env_file()
            env = load_env_for_process(self.project / ".env.local")

        merged_env = os.environ.copy()
        merged_env.update(env)
        self.run_command(["pnpm", "drizzle-kit", "generate"], "drizzle generate", cwd=self.project, env=merged_env)
        self.run_command(["pnpm", "drizzle-kit", "migrate"], "drizzle migrate", cwd=self.project, env=merged_env)

    def test_panel(self) -> None:
        while True:
            self.log.write("")
            print_test_menu()
            choice = input("Escolha um teste: ").strip().lower()
            if choice == "1":
                self.run_command(["pnpm", "test"], "Testes unitarios", cwd=self.project)
            elif choice == "2":
                self.run_command(["pnpm", "test", "--ui"], "Vitest UI", cwd=self.project)
            elif choice == "3":
                self.run_command(["node", "test-validation.mjs"], "Teste de validacao", cwd=self.project)
            elif choice == "4":
                self.run_command(["node", "test-api.mjs"], "Teste de API tRPC", cwd=self.project)
            elif choice == "5":
                self.run_command(["pnpm", "exec", "tsc", "--noEmit"], "Checagem TypeScript", cwd=self.project)
            elif choice == "6":
                self.run_command(["pnpm", "build"], "Build", cwd=self.project, env=dev_env(self.project))
            elif choice == "7":
                self.run_command(["pnpm", "format"], "Formatar codigo", cwd=self.project)
            elif choice == "0" or choice == "q":
                return
            else:
                self.log.warn("Opcao invalida.")

    def start_dev_server(self, open_browser: bool = True) -> None:
        self.log.section("Iniciando servidor local")
        if not self.check_node() or not self.check_pnpm():
            self.log.error("Node.js/pnpm nao estao prontos.")
            return

        command = ["pnpm", "exec", "tsx", "watch", "server/_core/index.ts"]
        self.log.info("Comando: " + " ".join(command))
        self.log.info("Pressione Ctrl+C para parar o servidor.")

        env = dev_env(self.project)
        process = subprocess.Popen(
            prepare_command(command),
            cwd=str(self.project),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            stdin=None,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
        )

        opened = False
        output_thread = threading.Thread(target=self._pipe_process_output, args=(process,), daemon=True)
        output_thread.start()

        if open_browser:
            opened = self.wait_and_open_browser()

        if opened:
            self.log.ok(f"Navegador aberto em {APP_URL}")
        else:
            self.log.warn("Servidor ainda nao respondeu dentro do tempo esperado. Logs continuam visiveis.")

        code = process.wait()
        output_thread.join(timeout=2)
        self.log.warn(f"Servidor finalizado com codigo {code}.")

    def wait_and_open_browser(self, timeout_seconds: int = 90) -> bool:
        self.log.info(f"Aguardando resposta em {APP_URL} por ate {timeout_seconds}s...")
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            try:
                with urllib.request.urlopen(APP_URL, timeout=3) as response:
                    if 200 <= response.status < 500:
                        webbrowser.open(APP_URL)
                        return True
            except (urllib.error.URLError, TimeoutError, OSError):
                time.sleep(2)
        return False

    def _pipe_process_output(self, process: subprocess.Popen[str]) -> None:
        assert process.stdout is not None
        for line in process.stdout:
            self.log.write(line.rstrip("\n"))

    def run_command(
        self,
        command: List[str],
        label: str,
        cwd: Optional[Path] = None,
        env: Optional[Dict[str, str]] = None,
        stdin_file: Optional[Path] = None,
        redact: bool = False,
    ) -> int:
        self.log.section(label)
        display = " ".join(command)
        self.log.info("Comando: " + ("[redigido]" if redact else display))
        start = time.time()

        stdin_handle = stdin_file.open("r", encoding="utf-8") if stdin_file else None
        try:
            proc = subprocess.Popen(
                prepare_command(command),
                cwd=str(cwd or self.project),
                stdin=stdin_handle,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                env=env,
            )
            assert proc.stdout is not None
            for line in proc.stdout:
                self.log.write(line.rstrip("\n"))
            code = proc.wait()
        except FileNotFoundError:
            self.log.error(f"Comando nao encontrado: {command[0]}")
            return 127
        finally:
            if stdin_handle:
                stdin_handle.close()

        elapsed = time.time() - start
        if code == 0:
            self.log.ok(f"{label} concluido em {elapsed:.1f}s")
        else:
            self.log.error(f"{label} falhou com codigo {code} apos {elapsed:.1f}s")
        return code


def print_menu() -> None:
    print(
        """
==================== PAINEL PDFEXPERT V7 ====================
1 - Setup completo: requisitos + env + deps + banco + migrations + abrir app
2 - Verificar requisitos
3 - Instalar requisitos ausentes
4 - Criar/completar .env.local
5 - Configurar banco MySQL/MariaDB
6 - Instalar dependencias pnpm
7 - Gerar/aplicar migrations Drizzle
8 - Painel de testes
9 - Iniciar servidor e abrir navegador
0 - Sair
==============================================================
""".strip()
    )


def print_test_menu() -> None:
    print(
        """
====================== TESTES PDFEXPERT V7 ===================
1 - Testes unitarios Vitest
2 - Vitest UI
3 - Teste de validacao de metadados
4 - Teste de API tRPC
5 - Checagem TypeScript
6 - Build
7 - Formatar codigo com Prettier
0 - Voltar
==============================================================
""".strip()
    )


def capture(command: List[str]) -> Tuple[int, str]:
    try:
        proc = subprocess.run(prepare_command(command), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8", errors="replace")
        return proc.returncode, proc.stdout
    except FileNotFoundError:
        return 127, ""


def prepare_command(command: List[str]) -> List[str]:
    if not command:
        return command

    executable = shutil.which(command[0])
    if not executable and command[0].lower() == "mysql":
        executable = find_mysql_executable()
    if not executable:
        return command

    suffix = Path(executable).suffix.lower()
    if os.name == "nt" and suffix in {".bat", ".cmd"}:
        return ["cmd.exe", "/d", "/s", "/c", executable, *command[1:]]

    return [executable, *command[1:]]


def find_mysql_executable() -> Optional[str]:
    direct = shutil.which("mysql")
    if direct:
        return direct

    candidates: List[Path] = []
    roots = [
        os.environ.get("ProgramFiles"),
        os.environ.get("ProgramFiles(x86)"),
        r"C:\Program Files",
        r"C:\Program Files (x86)",
    ]

    for root_text in roots:
        if not root_text:
            continue
        root = Path(root_text)
        candidates.extend(root.glob(r"MySQL\MySQL Server *\bin\mysql.exe"))
        candidates.extend(root.glob(r"MySQL\*\bin\mysql.exe"))
        candidates.extend(root.glob(r"MariaDB *\bin\mysql.exe"))

    candidates.extend(Path(r"C:\xampp").glob(r"mysql\bin\mysql.exe"))
    candidates.extend(Path(r"C:\laragon").glob(r"bin\mysql\mysql-*\bin\mysql.exe"))

    existing = sorted({path.resolve() for path in candidates if path.exists()}, reverse=True)
    return str(existing[0]) if existing else None


def prepend_executable_dir(executable: str) -> None:
    exe_dir = str(Path(executable).resolve().parent)
    current_path = os.environ.get("PATH", "")
    parts = [part.rstrip("\\/") for part in current_path.split(os.pathsep) if part]
    if exe_dir.rstrip("\\/") not in parts:
        os.environ["PATH"] = exe_dir + os.pathsep + current_path


def parse_version(text: str) -> Optional[Tuple[int, int, int]]:
    match = re.search(r"v?(\d+)(?:\.(\d+))?(?:\.(\d+))?", text)
    if not match:
        return None
    return tuple(int(part or 0) for part in match.groups())  # type: ignore[return-value]


def parse_mysql_version(text: str) -> Optional[Tuple[int, int, int]]:
    match = re.search(r"Ver\s+(\d+)\.(\d+)\.(\d+)", text, flags=re.IGNORECASE)
    if not match:
        match = re.search(r"(\d+)\.(\d+)\.(\d+)", text)
    if not match:
        return None
    return tuple(int(part) for part in match.groups())  # type: ignore[return-value]


def parse_mariadb_version(text: str) -> Optional[Tuple[int, int, int]]:
    match = re.search(r"(\d+)\.(\d+)\.(\d+)-MariaDB", text, flags=re.IGNORECASE)
    if not match:
        return parse_mysql_version(text)
    return tuple(int(part) for part in match.groups())  # type: ignore[return-value]


def read_env(path: Path) -> Dict[str, str]:
    result: Dict[str, str] = {}
    if not path.exists():
        return result
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        result[key.strip()] = value.strip()
    return result


def load_env_for_process(path: Path) -> Dict[str, str]:
    return read_env(path)


def database_settings(project: Path) -> Dict[str, str]:
    env = read_env(project / ".env.local")
    raw_url = env.get("DATABASE_URL", "")
    if raw_url:
        parsed = urlparse(raw_url)
        if parsed.scheme.startswith("mysql"):
            return {
                "user": unquote(parsed.username or DB_USER),
                "password": unquote(parsed.password or DB_PASSWORD),
                "host": parsed.hostname or "localhost",
                "port": str(parsed.port or 3306),
                "database": (parsed.path or f"/{DB_NAME}").lstrip("/") or DB_NAME,
            }

    return {
        "user": DB_USER,
        "password": DB_PASSWORD,
        "host": "localhost",
        "port": "3306",
        "database": DB_NAME,
    }


def escape_sql(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def quote_identifier(value: str) -> str:
    return "`" + value.replace("`", "``") + "`"


def dev_env(project: Path) -> Dict[str, str]:
    env = os.environ.copy()
    env.update(load_env_for_process(project / ".env.local"))
    env["NODE_ENV"] = "development"
    return env


def parse_args(argv: Iterable[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="PDFExpert v7 local setup manager")
    parser.add_argument("--project", default=os.environ.get("PDFEXPERT_ROOT") or str(DEFAULT_PROJECT), help="Pasta raiz do projeto PDFExpert v7")
    parser.add_argument(
        "--action",
        default="menu",
        choices=["menu", "check", "install", "env", "database", "deps", "migrations", "tests", "server", "full"],
        help="Acao direta. Use menu para abrir o painel interativo.",
    )
    parser.add_argument("--mysql-admin-user", default="root", help="Usuario admin MySQL para modo nao interativo.")
    parser.add_argument("--mysql-admin-password", default=None, help="Senha admin MySQL para modo nao interativo. Omitir usa senha vazia.")
    return parser.parse_args(list(argv))


def main(argv: Iterable[str]) -> int:
    args = parse_args(argv)
    manager = LocalManager(
        Path(args.project),
        action=args.action,
        mysql_admin_user=args.mysql_admin_user,
        mysql_admin_password=args.mysql_admin_password,
    )
    return manager.run()


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
