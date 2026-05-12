# PDFExpert Enterprise v7.0 - TODO List

## Fase 1: Landing Page Premium (HC TECH Design)
- [x] Configurar design tokens (cores, tipografia, espaçamento)
- [x] Criar Hero Section com CTA principal
- [x] Implementar seção de Features (4-5 features principais)
- [x] Criar seção "Como Funciona" (passo a passo visual)
- [ ] Implementar seção de Pricing/Planos
- [x] Adicionar Footer com links e informações
- [x] Otimizar responsividade (mobile, tablet, desktop)
- [ ] Implementar animações e micro-interações

## Fase 2: Dashboard com Autenticação
- [x] Criar layout do Dashboard (Sidebar + Main Content)
- [x] Implementar seção de Upload de PDF
- [ ] Criar visualização de histórico de processamentos
- [x] Implementar painel de progresso em tempo real
- [x] Adicionar exibição de estatísticas (total, processados, descartados)
- [ ] Criar modal/drawer de detalhes do processamento
- [ ] Implementar link direto para repositório GitHub

## Fase 3: Pipeline de Processamento (Backend)
- [x] Criar rota de upload de PDF (multipart/form-data) - tRPC
- [ ] Implementar extração de imagens do PDF (PyMuPDF)
- [x] Aplicar filtros de entropia (descartar ícones/cores sólidas)
- [ ] Converter imagens para WebP com compressão otimizada
- [ ] Armazenar imagens processadas em S3 (storagePut)
- [ ] Criar sistema de fila para processamento assíncrono
- [ ] Implementar WebSocket/SSE para progresso em tempo real

## Fase 4: Taxonomia com LLM (Gemini 1.5 Flash)
- [x] Integrar Gemini 1.5 Flash para análise de imagens
- [x] Implementar prompt de taxonomia (100% nomes reais)
- [x] Criar fallback para quando IA falha
- [x] Validar saídas para garantir nomes não-genéricos
- [ ] Implementar cache de resultados

## Fase 5: Integração com GitHub
- [x] Configurar variáveis de ambiente (GITHUB_TOKEN, GITHUB_REPO)
- [x] Implementar autenticação com GitHub API (estrutura básica)
- [ ] Criar função de commit em lote de imagens
- [ ] Implementar atualização automática do database.json
- [ ] Validar estrutura do database.json
- [ ] Implementar tratamento de erros e retry logic

## Fase 6: Sistema de Progresso em Tempo Real
- [ ] Implementar WebSocket ou Server-Sent Events (SSE)
- [ ] Criar eventos de progresso (inicio, item processado, conclusão)
- [ ] Atualizar UI em tempo real com contadores
- [ ] Implementar cancelamento de processamento
- [ ] Adicionar notificações de sucesso/erro

## Fase 7: Histórico de Processamentos
- [ ] Criar tabela no banco de dados para histórico
- [ ] Armazenar metadados de cada processamento
- [ ] Implementar listagem com paginação
- [ ] Adicionar filtros (data, status, repositório)
- [ ] Criar visualização de detalhes do processamento
- [ ] Implementar link direto para o commit no GitHub

## Fase 8: Segurança e Variáveis de Ambiente
- [ ] Documentar todas as variáveis de ambiente necessárias
- [ ] Implementar validação de credenciais no servidor
- [ ] Garantir que tokens não sejam expostos no frontend
- [ ] Implementar rate limiting para uploads
- [ ] Adicionar validação de tipos de arquivo

## Fase 9: Testes e Otimizações
- [ ] Escrever testes unitários para o backend
- [ ] Testar pipeline com PDFs de diferentes tamanhos
- [ ] Otimizar performance de processamento de imagens
- [ ] Implementar compressão e caching
- [ ] Realizar testes de segurança
- [ ] Documentar API e fluxos

## Fase 10: Deploy e Documentação
- [ ] Criar arquivo README.md com instruções de setup
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Criar guia de uso para o usuário
- [ ] Preparar para deploy em produção
- [ ] Implementar monitoramento e logging


## Fase 7: Visualização e Edição de Metadados
- [x] Criar modal/drawer de visualização de metadados extraídos
- [x] Implementar grid de imagens com preview
- [x] Criar formulário editável para cada produto
- [x] Adicionar botões de ação (editar, descartar, confirmar)
- [x] Integrar com backend para salvar alterações
- [x] Implementar validação de campos obrigatórios
- [ ] Adicionar busca/filtro na lista de produtos
