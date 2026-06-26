# Resumo do PR `feature/backend-auth-preferences`

Este PR evolui o backend da Newsletter Inteligente com autenticação completa, proteção de rotas privadas, preferências por usuário autenticado e documentação prática para teste manual da API.

## O que entrou neste PR

### Tratamento compartilhado de exceptions

Foi criada uma base comum para exceptions da aplicação e um filter global para padronizar as respostas de erro.

Arquivos principais:

- `backend/src/common/exceptions/app.exception.ts`
- `backend/src/common/exceptions/app-exception.filter.ts`
- `backend/src/common/exceptions/email-already-in-use.exception.ts`
- `backend/src/common/exceptions/invalid-credentials.exception.ts`
- `backend/src/common/exceptions/invalid-user-preferences.exception.ts`
- `backend/src/common/exceptions/user-not-found.exception.ts`
- `backend/src/core/core.module.ts`

Com isso, erros de domínio como credenciais inválidas, email duplicado e preferências inválidas passaram a ter resposta consistente.

### Autenticação completa com JWT

Foi criado um módulo de autenticação com cadastro, login, logout e proteção de rotas privadas.

Arquivos principais:

- `backend/src/modules/auth/auth.module.ts`
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/auth.repository.ts`
- `backend/src/modules/auth/guards/jwt-auth.guard.ts`
- `backend/src/modules/auth/strategies/jwt.strategy.ts`

DTOs criados:

- `backend/src/modules/auth/dto/register.dto.ts`
- `backend/src/modules/auth/dto/login.dto.ts`
- `backend/src/modules/auth/dto/auth-response.dto.ts`
- `backend/src/modules/auth/dto/logout-response.dto.ts`

O fluxo implementado ficou assim:

- `POST /users` para cadastro
- `POST /login` para autenticação
- `POST /logout` para encerrar a sessão atual

Regras incluídas:

- cadastro com `name`, `email`, `password` e `confirmPassword`
- hash de senha com `bcrypt`
- validação de confirmação de senha com decorator customizado `Match`
- JWT como mecanismo de autenticação
- `Guard` global protegendo rotas privadas
- decorator `@Public()` para rotas abertas
- decorator `@CurrentUser()` para acessar o usuário autenticado no controller

### Sessão persistida para logout real

Além do JWT, este PR adiciona persistência de sessão para permitir logout real no servidor.

Mudanças de modelagem:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260626120000_add_user_sessions/migration.sql`

Nova tabela:

- `user_sessions`

Campos principais:

- `id`
- `user_id`
- `expires_at`
- `revoked_at`
- `created_at`
- `updated_at`

Com isso:

- cada login/cadastro cria uma sessão
- o token passa a carregar `sid`
- a `JwtStrategy` valida se a sessão ainda está ativa
- o logout revoga a sessão atual
- um token revogado deixa de funcionar mesmo antes da expiração

### Proteção das rotas da API

As rotas privadas passaram a exigir autenticação.

Rotas públicas:

- `GET /`
- `GET /health`
- `POST /users`
- `POST /login`

Rotas protegidas:

- `POST /logout`
- `GET /news`
- `GET /preferences`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`

Arquivos com ajustes:

- `backend/src/app.controller.ts`
- `backend/src/modules/health/health.controller.ts`
- `backend/src/modules/news/news.controller.ts`
- `backend/src/modules/preferences/preferences.controller.ts`

### Preferências do usuário autenticado

Foi criado um módulo de usuários focado nas preferências do usuário logado.

Arquivos principais:

- `backend/src/modules/users/users.module.ts`
- `backend/src/modules/users/users.controller.ts`
- `backend/src/modules/users/users.service.ts`
- `backend/src/modules/users/users.repository.ts`
- `backend/src/modules/users/dto/update-user-preferences.dto.ts`
- `backend/src/modules/users/dto/user-response.dto.ts`

Endpoints adicionados:

- `GET /users/me/preferences`
- `PUT /users/me/preferences`

Comportamento:

- consulta das preferências atuais do usuário autenticado
- substituição completa das preferências
- validação dos `categoryIds` enviados antes de salvar
- retorno das categorias associadas ao usuário após atualização

### Ajustes no módulo de preferências

O repositório de preferências recebeu suporte para validação de categorias por id.

Arquivo alterado:

- `backend/src/modules/preferences/preferences.repository.ts`

Método adicionado:

- `countByIds`

### Documentação e teste manual da API

Este PR também substitui o README padrão do Nest por documentação real do backend e adiciona um arquivo `.http` para validar o fluxo completo manualmente.

Arquivos:

- `backend/README.md`
- `backend/http/auth-complete-flow.http`

O arquivo `.http` cobre:

- acesso público
- tentativa sem token
- cadastro
- login
- listagem de preferências disponíveis
- atualização das preferências do usuário
- consulta de notícias autenticada
- consulta de notícias com filtro por categoria
- logout
- tentativa de acesso com token revogado

## Commits deste PR

- `0afa45e` `refactor(backend): add shared application exception handling`
- `66748a6` `feat(backend): add jwt auth and protected routes`
- `cee3093` `feat(backend): add authenticated user preferences endpoints`
- `c443ffe` `chore(backend): fix dto property initialization hints`
- `e21a028` `docs(backend): add README and http auth flow`

## Arquivos alterados no PR

- `backend/README.md`
- `backend/http/auth-complete-flow.http`
- `backend/prisma/migrations/20260626120000_add_user_sessions/migration.sql`
- `backend/prisma/schema.prisma`
- `backend/src/app.controller.ts`
- `backend/src/app.module.ts`
- `backend/src/common/auth/authenticated-user.type.ts`
- `backend/src/common/auth/current-user.decorator.ts`
- `backend/src/common/auth/public.decorator.ts`
- `backend/src/common/exceptions/app-exception.filter.ts`
- `backend/src/common/exceptions/app.exception.ts`
- `backend/src/common/exceptions/email-already-in-use.exception.ts`
- `backend/src/common/exceptions/invalid-credentials.exception.ts`
- `backend/src/common/exceptions/invalid-user-preferences.exception.ts`
- `backend/src/common/exceptions/user-not-found.exception.ts`
- `backend/src/common/validation/match.decorator.ts`
- `backend/src/core/core.module.ts`
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.module.ts`
- `backend/src/modules/auth/auth.repository.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/dto/auth-response.dto.ts`
- `backend/src/modules/auth/dto/login.dto.ts`
- `backend/src/modules/auth/dto/logout-response.dto.ts`
- `backend/src/modules/auth/dto/register.dto.ts`
- `backend/src/modules/auth/guards/jwt-auth.guard.ts`
- `backend/src/modules/auth/strategies/jwt.strategy.ts`
- `backend/src/modules/health/health.controller.ts`
- `backend/src/modules/news/news.controller.ts`
- `backend/src/modules/preferences/preferences.controller.ts`
- `backend/src/modules/preferences/preferences.repository.ts`
- `backend/src/modules/users/dto/update-user-preferences.dto.ts`
- `backend/src/modules/users/dto/user-response.dto.ts`
- `backend/src/modules/users/users.controller.ts`
- `backend/src/modules/users/users.module.ts`
- `backend/src/modules/users/users.repository.ts`
- `backend/src/modules/users/users.service.ts`

## Resultado final deste PR

Ao final deste PR, o backend passa a oferecer:

- autenticação completa com cadastro, login e logout
- proteção real das rotas privadas com JWT e sessão persistida
- preferências por usuário autenticado
- respostas de erro mais consistentes
- documentação real do backend
- fluxo manual pronto para teste via arquivo `.http`
