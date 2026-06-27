# Resumo do PR `refactor/backend-curation-architecture-and-infra`

Este PR refatora partes da arquitetura do backend da Newsletter Inteligente para melhorar consistência entre módulos, reduzir acoplamento entre camadas e deixar a base mais preparada para manutenção e testes.

O foco principal ficou em organização interna do fluxo de curadoria, padronização de infraestrutura compartilhada, correções de bootstrap e atualização da documentação.

## O que entrou neste PR

### Correção no bootstrap do Prisma

Foi corrigido um problema no `PrismaService` em que o adapter do Prisma era criado antes da validação da `DATABASE_URL`.

Arquivo principal:

- `backend/src/database/prisma.service.ts`

Com isso:

- a validação da variável de ambiente acontece antes da inicialização do adapter
- o bootstrap falha de forma mais segura e previsível quando a configuração do banco não existe

### Configuração compartilhada entre API e worker

Foi extraída a configuração repetida do `ConfigModule.forRoot()` para uma factory compartilhada.

Arquivos principais:

- `backend/src/config/config-module.factory.ts`
- `backend/src/app.module.ts`
- `backend/src/worker.module.ts`

Com isso:

- API HTTP e worker passam a reutilizar a mesma configuração global
- a manutenção das validações de ambiente fica centralizada
- reduzimos duplicação entre `AppModule` e `WorkerModule`

### Alinhamento do health check com o repository pattern

O módulo de health passou a seguir o mesmo padrão de repository adotado no restante do backend.

Arquivos principais:

- `backend/src/modules/health/health.repository.ts`
- `backend/src/modules/health/health.service.ts`
- `backend/src/modules/health/health.module.ts`

Com isso:

- o `HealthService` deixa de acessar `PrismaService` diretamente
- a verificação de banco fica encapsulada em `HealthRepository`
- o módulo ganha mais consistência arquitetural

### Remoção do endpoint raiz redundante

Foi removido o endpoint raiz que retornava `"Hello World!"`, junto com o service e o teste e2e que dependiam dele.

Arquivos removidos:

- `backend/src/app.controller.ts`
- `backend/src/app.service.ts`
- `backend/test/app.e2e-spec.ts`

Com isso:

- o `GET /health` permanece como endpoint público principal de verificação
- a codebase fica com menos ruído estrutural

### Refatoração da seleção de provider de IA

O `AiService` deixou de montar a lista de providers dinamicamente dentro do método de resumo e passou a receber o provider ativo via injeção de dependência.

Arquivos principais:

- `backend/src/modules/ai/ai.module.ts`
- `backend/src/modules/ai/ai.service.ts`

Com isso:

- a seleção do provider fica concentrada no módulo
- o `AiService` fica mais simples
- o comportamento fica mais fácil de mockar e testar

### Refatoração do fluxo de curadoria

A parte mais relevante deste PR foi a reorganização interna do fluxo de curadoria.

Arquivos principais:

- `backend/src/common/contracts/curation-job.contract.ts`
- `backend/src/common/contracts/curation-run-job.contract.ts`
- `backend/src/modules/curation/curation-run.domain.ts`
- `backend/src/modules/curation/curation.repository.ts`
- `backend/src/modules/curation/curation.module.ts`
- `backend/src/modules/curation/curation-agent.service.ts`
- `backend/src/modules/curation/processors/curation-run.processor.ts`
- `backend/src/modules/curation/processors/news-processing.processor.ts`
- `backend/src/modules/preferences/preferences.repository.ts`
- `backend/src/modules/queue/queue.service.ts`

Mudanças aplicadas:

- os contratos de job saíram do módulo de `curation/dto` e foram movidos para `common/contracts`
- foi criado `CurationRunDomain` para concentrar a regra de finalização da run
- `CurationRepository` ficou mais focado em persistência
- a resolução de categoria deixou de ficar em `CurationRepository` e passou para `PreferencesRepository`
- os processors e o `QueueService` passaram a usar os contratos novos

Com isso:

- o fluxo de curadoria fica menos acoplado
- a regra de negócio da run fica separada da camada de banco
- fica mais fácil testar transições e contratos da mensageria

### Ajuste de dependências

O pacote `prisma` CLI foi movido de `dependencies` para `devDependencies`.

Arquivo:

- `backend/package.json`

Com isso:

- a dependência de CLI fica classificada de forma mais correta
- a runtime dependency tree do backend fica mais limpa

### Atualização do README

O README do backend foi reescrito e reorganizado para refletir melhor a estrutura atual do projeto.

Arquivo:

- `backend/README.md`

Foram adicionados ou ajustados:

- visão geral mais objetiva do backend
- estrutura de módulos
- arquitetura de diretórios
- organização do fluxo de teste manual
- seção de testes esperados para próximas iterações
- documentação mais clara da arquitetura de curadoria

## Commits deste PR

- `ad89eb5` `fix(backend): validate database url before prisma adapter init`
- `db37cd0` `refactor(backend): centralize shared app and worker config`
- `e7d154a` `refactor(backend): align health checks with repository pattern`
- `0238852` `refactor(backend): remove redundant root app endpoint`
- `38a3ebe` `refactor(backend): inject active AI provider through module DI`
- `1e3f005` `refactor(backend): decouple curation workflow contracts and run state`
- `2622b2a` `chore(backend): move prisma cli to devDependencies`
- `acdf9fd` `docs(backend): refresh architecture and testing guidance`

## Arquivos alterados no PR

- `backend/README.md`
- `backend/package.json`
- `backend/src/app.module.ts`
- `backend/src/config/config-module.factory.ts`
- `backend/src/database/prisma.service.ts`
- `backend/src/modules/ai/ai.module.ts`
- `backend/src/modules/ai/ai.service.ts`
- `backend/src/modules/curation/curation-agent.service.ts`
- `backend/src/modules/curation/curation.module.ts`
- `backend/src/modules/curation/curation.repository.ts`
- `backend/src/modules/curation/curation-run.domain.ts`
- `backend/src/modules/curation/processors/curation-run.processor.ts`
- `backend/src/modules/curation/processors/news-processing.processor.ts`
- `backend/src/modules/health/health.module.ts`
- `backend/src/modules/health/health.repository.ts`
- `backend/src/modules/health/health.service.ts`
- `backend/src/modules/preferences/preferences.repository.ts`
- `backend/src/modules/queue/queue.service.ts`
- `backend/src/common/contracts/curation-job.contract.ts`
- `backend/src/common/contracts/curation-run-job.contract.ts`

Arquivos removidos:

- `backend/src/app.controller.ts`
- `backend/src/app.service.ts`
- `backend/src/modules/curation/dto/curation-job.dto.ts`
- `backend/src/modules/curation/dto/curation-run-job.dto.ts`
- `backend/test/app.e2e-spec.ts`

## Resultado final deste PR

Ao final deste PR, o backend passa a ter:

- bootstrap de banco mais seguro
- configuração compartilhada entre API e worker
- health check alinhado com o padrao de repositories
- menos ruído estrutural no app raiz
- seleção de provider de IA mais desacoplada
- fluxo de curadoria mais modular, com contratos e regras de negócio melhor separados
- documentação mais consistente com o estado atual do projeto

## Observações rápidas

- não foi adicionado rate limiting neste PR
- `GET /health` continua sendo o endpoint publico principal
- os ajustes foram focados em arquitetura, manutenção e testabilidade
- a validação principal executada durante o trabalho foi `pnpm exec tsc -p tsconfig.build.json --noEmit`
