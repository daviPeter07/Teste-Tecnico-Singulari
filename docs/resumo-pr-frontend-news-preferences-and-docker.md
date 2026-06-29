# Resumo do PR `Feature/frontend-implement-news-and-preferences`

Este PR evolui a entrega full stack da Newsletter Inteligente com foco em organização do frontend, nova experiência da home de notícias, edição de preferências do usuário, dockerização do fluxo principal e ajustes de integração entre frontend e backend.

O objetivo principal foi aproximar a aplicação do fluxo esperado no desafio: frontend consumindo notícias reais, tela de preferências usando os endpoints já existentes, e ambiente completo rodando de forma mais previsível com Docker.

## O que entrou neste PR

### Reorganização do frontend por módulos e camadas

O frontend foi reorganizado para seguir uma estrutura modular mais clara, separando responsabilidades em:

- `pages`
- `components`
- `hooks`
- `queries`
- `services`
- `schemas`
- `types`

Arquivos principais:

- `frontend/src/modules/news/pages/home-page.tsx`
- `frontend/src/modules/news/queries/news-list.query.ts`
- `frontend/src/modules/news/hooks/use-news-list-query.ts`
- `frontend/src/modules/preferences/pages/preferences-page.tsx`
- `frontend/src/modules/preferences/hooks/use-preferences-form.ts`
- `frontend/src/modules/auth/hooks/use-login-form.ts`
- `frontend/src/modules/auth/hooks/use-register-form.ts`

Com isso:

- os arquivos de `app/` ficaram mais finos
- a lógica saiu das páginas e foi para os módulos
- `news`, `auth` e `preferences` passaram a seguir a mesma organização

### Nova home de notícias com filtros e paginação

A home pública foi redesenhada para refletir melhor o escopo pedido no desafio.

Arquivos principais:

- `frontend/src/modules/news/components/news-feed.tsx`
- `frontend/src/modules/news/components/news-card.tsx`
- `frontend/src/modules/news/components/news-filters.tsx`
- `frontend/src/modules/news/components/news-grid.tsx`
- `frontend/src/modules/news/components/news-pagination.tsx`
- `frontend/src/modules/news/services/news.service.ts`
- `frontend/src/app/(main)/page.tsx`

O fluxo implementado passou a oferecer:

- listagem de notícias em grid
- filtros por período
- paginação visível no frontend
- consumo da consulta paginada do backend
- layout responsivo para desktop e mobile

### Edição de preferências do usuário

O módulo de preferências foi componentizado e passou a usar de forma mais clara os endpoints protegidos do backend.

Arquivos principais:

- `frontend/src/modules/preferences/components/preferences-panel.tsx`
- `frontend/src/modules/preferences/components/preferences-feedback.tsx`
- `frontend/src/modules/preferences/components/preferences-selection-form.tsx`
- `frontend/src/modules/preferences/components/preferences-session-card.tsx`
- `frontend/src/modules/preferences/services/preferences.service.ts`
- `frontend/src/modules/preferences/pages/preferences-page.tsx`
- `frontend/src/app/(main)/preferences/page.tsx`

Com isso:

- a tela de preferências passou a exibir as categorias disponíveis
- o usuário autenticado consegue ver suas preferências atuais
- a atualização das preferências passou a acontecer pela interface
- o frontend passou a aproveitar melhor os endpoints já existentes no backend

### Refinos no módulo de autenticação

O frontend também recebeu ajustes na base de autenticação para manter a sessão e a integração com o backend mais consistentes.

Arquivos principais:

- `frontend/src/modules/auth/services/auth.service.ts`
- `frontend/src/modules/auth/services/auth.actions.ts`
- `frontend/src/modules/auth/components/login-form.tsx`
- `frontend/src/modules/auth/components/register-form.tsx`
- `frontend/src/proxy.ts`

Com isso:

- login e cadastro ficaram mais desacoplados dos componentes
- as páginas protegidas continuam validando a sessão no servidor
- a integração com `GET /me` e com o cookie de sessão foi mantida no fluxo principal

### Dockerização do frontend e do projeto completo

Foi adicionada a estrutura para subir tanto o frontend isolado quanto o projeto completo com Docker Compose.

Arquivos principais:

- `docker-compose.yml`
- `frontend/docker-compose.yml`
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `.env.example`
- `frontend/.env.example`

Com isso:

- o projeto ganhou um compose na raiz para frontend, backend, worker, banco e Redis
- o frontend ganhou um compose próprio para rodar separado
- foram adicionados arquivos de ambiente de exemplo para o fluxo local

### Ajustes de bootstrap e startup no Docker

Durante a subida do ambiente completo foram corrigidos problemas reais de inicialização do backend e sincronização entre os serviços.

Arquivos principais:

- `backend/Dockerfile`
- `backend/docker/start-service.sh`
- `docker-compose.yml`
- `backend/docker-compose.yaml`

Mudanças aplicadas:

- remoção da dependência de um serviço `migrate` como fluxo principal
- execução de migration e seed no startup do container da API
- health check da API para coordenar a subida de frontend e worker
- ajuste das variáveis carregadas pelos serviços no compose

### Correções de integração entre frontend e backend

Foram corrigidos problemas de runtime na comunicação entre Next.js e a API.

Arquivos principais:

- `frontend/src/shared/lib/http/api-client.ts`
- `frontend/next.config.ts`
- `docker-compose.yml`

Com isso:

- o frontend passou a montar URLs corretas no server-side
- o proxy do Next ficou alinhado ao backend em `localhost:3333`
- a tela de preferências deixou de quebrar por URL relativa inválida

### Documentação consolidada

Este PR também atualizou a documentação para refletir a organização atual do repositório.

Arquivos:

- `README.md`
- `frontend/README.md`
- `backend/README.md`

Foram adicionados ou ajustados:

- README global do projeto
- instruções para rodar com Docker
- arquivos `.env.example`
- referências do repositório sem caminhos específicos da máquina local

## Commits deste PR

- `c42879f` `fix(backend): stabilize docker startup for api and worker`
- `da33793` `refactor(frontend): organize modules by layer`
- `645c828` `docs(frontend): rewrite readme and add challenge extract`
- `f852713` `feat(frontend): redesign news feed with filters and pagination`
- `531671f` `refactor(frontend): split preferences panel into focused components`
- `e6a58f5` `feat(infra): add docker setup for frontend and backend`
- `bd32cc5` `feat(frontend): add standalone docker compose`
- `aebdb80` `refactor(infra): load service env files in compose`
- `9659b35` `refactor(infra): run prisma bootstrap from api container`
- `6debbec` `fix(infra): wait for api health before starting dependents`
- `1321376` `fix(frontend): resolve server-side api base url`
- `6ef4cf9` `fix(frontend): build absolute api urls on server`
- `1d20a9a` `docs(repo): add root readme and env examples`
- `baca09a` `docs(readme): replace machine-specific paths`
- `35917de` `docs(readme): fix text encoding and accents`

## Arquivos alterados no PR

- `.env.example`
- `README.md`
- `backend/Dockerfile`
- `backend/README.md`
- `backend/docker-compose.yaml`
- `backend/docker/start-service.sh`
- `docker-compose.yml`
- `docs/teste_singu-desenvolvedor-pleno.extracted.txt`
- `frontend/.dockerignore`
- `frontend/.env.example`
- `frontend/.gitignore`
- `frontend/Dockerfile`
- `frontend/README.md`
- `frontend/docker-compose.yml`
- `frontend/next.config.ts`
- `frontend/package.json`
- `frontend/src/app/(main)/layout.tsx`
- `frontend/src/app/(main)/page.tsx`
- `frontend/src/app/(main)/preferences/page.tsx`
- `frontend/src/modules/auth/components/login-form.tsx`
- `frontend/src/modules/auth/components/logout-button.tsx`
- `frontend/src/modules/auth/components/register-form.tsx`
- `frontend/src/modules/auth/hooks/use-login-form.ts`
- `frontend/src/modules/auth/hooks/use-register-form.ts`
- `frontend/src/modules/auth/services/auth.actions.ts`
- `frontend/src/modules/auth/services/auth.service.ts`
- `frontend/src/modules/auth/types/auth.constants.ts`
- `frontend/src/modules/news/components/news-card.tsx`
- `frontend/src/modules/news/components/news-feed.tsx`
- `frontend/src/modules/news/components/news-filters.tsx`
- `frontend/src/modules/news/components/news-grid.tsx`
- `frontend/src/modules/news/components/news-list.tsx`
- `frontend/src/modules/news/components/news-pagination.tsx`
- `frontend/src/modules/news/hooks/use-news-list-query.ts`
- `frontend/src/modules/news/pages/home-page.tsx`
- `frontend/src/modules/news/queries/news-list.query.ts`
- `frontend/src/modules/news/services/news.service.ts`
- `frontend/src/modules/news/types/news.types.ts`
- `frontend/src/modules/preferences/components/preferences-feedback.tsx`
- `frontend/src/modules/preferences/components/preferences-panel.tsx`
- `frontend/src/modules/preferences/components/preferences-selection-form.tsx`
- `frontend/src/modules/preferences/components/preferences-session-card.tsx`
- `frontend/src/modules/preferences/hooks/use-preferences-form.ts`
- `frontend/src/modules/preferences/pages/preferences-page.tsx`
- `frontend/src/modules/preferences/schemas/preferences.schema.ts`
- `frontend/src/modules/preferences/services/preferences.actions.ts`
- `frontend/src/modules/preferences/services/preferences.service.ts`
- `frontend/src/proxy.ts`
- `frontend/src/shared/lib/http/api-client.ts`

Arquivos removidos:

- `frontend/src/modules/news/.gitkeep`
- `frontend/src/modules/news/components/.gitkeep`
- `frontend/src/modules/news/hooks/use-news-query.ts`
- `frontend/src/modules/news/news.constants.ts`
- `frontend/src/modules/news/news.query-state.ts`
- `frontend/src/modules/news/pages/.gitkeep`
- `frontend/src/modules/news/queries/.gitkeep`
- `frontend/src/modules/news/schemas/.gitkeep`
- `frontend/src/modules/news/services/.gitkeep`
- `frontend/src/modules/news/types/.gitkeep`
- `frontend/src/modules/preferences/.gitkeep`
- `frontend/src/modules/preferences/components/.gitkeep`
- `frontend/src/modules/preferences/pages/.gitkeep`
- `frontend/src/modules/preferences/queries/.gitkeep`
- `frontend/src/modules/preferences/schemas/.gitkeep`
- `frontend/src/modules/preferences/services/.gitkeep`
- `frontend/src/modules/preferences/types/.gitkeep`

## Resultado final deste PR

Ao final deste PR, o projeto passa a oferecer:

- frontend organizado por módulos e camadas
- home de notícias com filtros e paginação
- edição de preferências do usuário pela interface
- integração mais consistente entre frontend e backend
- compose completo para subir frontend, backend, worker, banco e Redis
- compose isolado para o frontend
- bootstrap do backend mais previsível no Docker
- documentação consolidada para o repositório

## Observações rápidas

- este PR consolida boa parte dos bônus do desafio no frontend e na infraestrutura
- o backend real continua exposto em `localhost:3333`
- o resumo automático por IA e a mensageria continuam do lado do backend e worker, não do frontend
