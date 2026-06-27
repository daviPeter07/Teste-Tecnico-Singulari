# Resumo do PR `feature/backend-curation-queue-ai`

Este PR implementa as funcionalidades bônus do desafio: agente curador high-code em worker separado, message broker com BullMQ/Redis, consumidor com sumarização por IA plugável e rastreamento assíncrono de status.

## O que entrou neste PR

### Infraestrutura de filas com BullMQ + Redis

Foi criado um módulo de filas com duas filas separadas para desacoplar descoberta de persistência.

Arquivos principais:
- `backend/src/modules/queue/queue.module.ts`
- `backend/src/modules/queue/queue.service.ts`
- `backend/src/modules/queue/queue.constants.ts`

As filas são:
- `curation-run` — o agente descobre notícias
- `news-processing` — o consumidor enriquece com IA e salva

O `QueueService` oferece:
- `enqueueCurationRunJob` com exponential backoff e idempotência por `jobId`
- `prepareNewsProcessingJobs` com dedup por `runId` + URL/título
- `enqueueNewsProcessingJobs` via `addBulk` para eficiência

### Módulo de IA plugável (mock, OpenAI, Anthropic, OpenRouter)

Foi criado um módulo de IA com arquitetura strategy pattern usando classe abstrata.

Arquivos principais:
- `backend/src/modules/ai/ai.module.ts`
- `backend/src/modules/ai/ai.service.ts` — fachada que seleciona o provider
- `backend/src/modules/ai/providers/ai-provider.abstract.ts` — template method com fallback automático
- `backend/src/modules/ai/providers/mock-ai.provider.ts`
- `backend/src/modules/ai/providers/openai-ai.provider.ts`
- `backend/src/modules/ai/providers/anthropic-ai.provider.ts`
- `backend/src/modules/ai/providers/openrouter-ai.provider.ts`

Comportamento:
- `AI_PROVIDER=mock` — corta as 2 primeiras frases (sem custo, sem API)
- `AI_PROVIDER=openai` — usa Responses API da OpenAI
- `AI_PROVIDER=anthropic` — usa Messages API da Anthropic
- `AI_PROVIDER=openrouter` — usa chat completions do OpenRouter (modelos gratuitos)
- fallback automático para mock se a API externa falhar

### Agente curador high-code

Foi criado um serviço de agente que descobre notícias de forma determinística sem depender de IA.

Arquivos principais:
- `backend/src/modules/curation/curation-agent.service.ts` — orquestrador de descoberta por `sourceType`
- `backend/src/modules/curation/sources/template-news.source.ts` — fonte template com geração determinística via `runId` como seed

### Worker processors

Dois workers processam as filas em sequência:

Arquivos:
- `backend/src/modules/curation/processors/curation-run.processor.ts` — consome `curation-run`, descobre notícias, publica batch em `news-processing`
- `backend/src/modules/curation/processors/news-processing.processor.ts` — consome `news-processing`, enriquece com IA, salva, atualiza contadores

### Rastreamento de status com contadores

A modelagem do `CurationRun` foi expandida:

Mudanças de schema:
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260626153000_improve_curation_run_tracking/migration.sql`

Novos campos e valores:
- `status: QUEUED | RUNNING | COMPLETED | PARTIAL | FAILED`
- `itemsProcessed`, `itemsFailed` — contadores atômicos
- `registerSavedItem` / `registerFailedItem` com incrementos atômicos
- `finalizeRunIfNeeded` — transiciona para `COMPLETED`, `PARTIAL` ou `FAILED`

### Endpoints da API

Arquivos:
- `backend/src/modules/auth/auth.controller.ts` — adicionado `GET /me`
- `backend/src/modules/curation/curation.controller.ts` — `POST /curation/run`, `GET /curation/runs/:id`
- `backend/src/modules/curation/curation.service.ts` — delega para worker
- `backend/src/modules/curation/curation.repository.ts` — transições condicionais (não sobrescreve estado terminal)

### Serviço de enriquecimento de notícias

Arquivo:
- `backend/src/modules/curation/news-enrichment.service.ts`

Funcionalidades:
- resumo via IA (sumarização em português)
- detecção de sentimento por palavras-chave (positivo, negativo, neutro)
- extração de entidades por regex

### Documentação e teste manual

Arquivos:
- `backend/README.md` — documentação completa com diagrama de arquitetura, configuração de IA, setup Docker
- `backend/http/curation-flow.http` — fluxo único de teste (health, cadastro, login, `/me`, preferências, curadoria, status, notícias, logout)
- `backend/.env.example` — com novas variáveis de modelo de IA

### Ajustes de infraestrutura

Arquivos:
- `backend/Dockerfile`, `backend/docker-compose.yaml` — Worker + API como serviços separados
- `backend/src/worker.ts`, `backend/src/worker.module.ts` — entrypoint do worker
- `backend/.dockerignore` — exclui arquivos locais do build

### Correções ao longo do desenvolvimento

- Alinhamento de nomes de variáveis de ambiente (`AI_API_KEY` → `OPENAI_API_KEY`)
- Correção de `:` em `jobId` do BullMQ (não permite dois-pontos)
- Movido processors para `CurationModule` para resolver DI no worker container
- Removido `onModuleInit` do `AiService` (resolução lazy do provider)
- `REDIS_HOST` ajustado para `localhost` em execução local
- Consolidado testes HTTP em único arquivo

## Commits deste PR

- `829c040` `feat(backend): add bullmq queue module`
- `3ae0483` `feat(backend): add curation producer flow`
- `827054a` `feat(backend): add curation worker consumer`
- `b6aafcb` `hotfix(backend): ignore local files from docker build context`
- `eae2012` `fix(backend): align docker environment and pnpm version`
- `39b7ca9` `docs(backend): clarify docker and environment setup`
- `c01496a` `feat(backend): add processing counters and QUEUED/PARTIAL statuses`
- `b67d2bf` `fix(backend): align AI environment variable names and add model configuration`
- `6dcf6d3` `feat(backend): split curation queue into agent discovery and news processing queues`
- `06551b8` `feat(backend): add pluggable AI summarization module`
- `037c727` `feat(backend): add high-code curation agent and news enrichment services`
- `6e83082` `feat(backend): replace monolithic processor with separate agent and consumer workers`
- `6e4b6e4` `feat(backend): add curation run status endpoint and update test flow documentation`
- `66f0a34` `chore(backend): update module wiring for new processors and services`
- `d11f042` `style(backend): auto-format code with eslint`
- `3bc9544` `docs(backend): update README with curation worker, AI summary, and architecture details`
- `48c4f79` `refactor(backend): extract AI providers into strategy pattern with abstract class`
- `37aab7d` `feat(backend): add GET /me endpoint for authenticated user profile`
- `4a54dd4` `lint: remove no used imports`
- `9a260cc` `docs(backend): consolidate test docs into single curation-flow.http`
- `cef3e98` `chore(backend): merge all HTTP tests into single curation-flow.http`
- `e135238` `fix(backend): resolve AiService provider lazily to avoid onModuleInit DI issue`
- `09bd8fc` `fix(backend): move BullMQ processors into CurationModule to fix worker DI`

## Arquivos alterados (47 arquivos, +1596 linhas)

`backend/.dockerignore`, `backend/.env.example`, `backend/Dockerfile`, `backend/README.md`, `backend/docker-compose.yaml`, `backend/http/curation-flow.http`, `backend/package.json`, `backend/prisma/migrations/20260626153000_improve_curation_run_tracking/migration.sql`, `backend/prisma/schema.prisma`, `backend/src/app.module.ts`, `backend/src/common/auth/current-user.decorator.ts`, `backend/src/common/validation/match.decorator.ts`, `backend/src/config/app.config.ts`, `backend/src/config/env.validation.ts`, `backend/src/modules/ai/ai.module.ts`, `backend/src/modules/ai/ai.service.ts`, `backend/src/modules/ai/providers/ai-provider.abstract.ts`, `backend/src/modules/ai/providers/anthropic-ai.provider.ts`, `backend/src/modules/ai/providers/mock-ai.provider.ts`, `backend/src/modules/ai/providers/openai-ai.provider.ts`, `backend/src/modules/ai/providers/openrouter-ai.provider.ts`, `backend/src/modules/auth/auth.controller.ts`, `backend/src/modules/auth/auth.module.ts`, `backend/src/modules/auth/auth.repository.ts`, `backend/src/modules/auth/auth.service.ts`, `backend/src/modules/auth/strategies/jwt.strategy.ts`, `backend/src/modules/curation/curation-agent.service.ts`, `backend/src/modules/curation/curation.controller.ts`, `backend/src/modules/curation/curation.module.ts`, `backend/src/modules/curation/curation.repository.ts`, `backend/src/modules/curation/curation.service.ts`, `backend/src/modules/curation/dto/curation-job.dto.ts`, `backend/src/modules/curation/dto/curation-run-job.dto.ts`, `backend/src/modules/curation/dto/run-curation.dto.ts`, `backend/src/modules/curation/news-enrichment.service.ts`, `backend/src/modules/curation/processors/curation-run.processor.ts`, `backend/src/modules/curation/processors/news-processing.processor.ts`, `backend/src/modules/curation/sources/template-news.source.ts`, `backend/src/modules/curation/types/curated-news-item.type.ts`, `backend/src/modules/news/news.repository.ts`, `backend/src/modules/news/news.service.ts`, `backend/src/modules/queue/queue.constants.ts`, `backend/src/modules/queue/queue.module.ts`, `backend/src/modules/queue/queue.service.ts`, `backend/src/modules/users/users.service.ts`, `backend/src/worker.module.ts`, `backend/src/worker.ts`

## Resultado final deste PR

Ao final deste PR, o backend passa a oferecer:

- mensageria assíncrona com BullMQ + Redis (2 filas: descoberta e processamento)
- agente curador high-code rodando em worker separado (sem dependência de IA)
- sumarização de notícias plugável (mock, OpenAI, Anthropic, OpenRouter) com fallback
- rastreamento completo de execuções de curadoria (QUEUED → RUNNING → COMPLETED/PARTIAL/FAILED)
- contagem de itens encontrados, enfileirados, processados, salvos e com falha
- `GET /me` para perfil do usuário autenticado
- `GET /curation/runs/:id` para acompanhamento de progresso
- idempotência entre retries (tanto do parent quanto dos child jobs)
- diagrama de arquitetura e documentação no README
- fluxo único de teste manual via `curation-flow.http`
