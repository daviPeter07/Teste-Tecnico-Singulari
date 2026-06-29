# Resumo do PR `hotfix/frontend-backend-auth-hydration-darkmode-and-docs`

Este PR traz um conjunto de melhorias focadas na estabilidade do frontend, correções de bugs de hidratação, refinamento de segurança na sessão, reforço da tipagem no backend e aprimoramentos de interface e infraestrutura.

O objetivo principal foi corrigir comportamentos indesejados no Next.js (como erros de Server Component ao manipular cookies e falhas de hidratação de datas) além de adicionar suporte nativo ao modo escuro e limpar o histórico de configurações antigas no Docker.

## O que entrou neste PR

### Correção de Hidratação no Next.js

Foram corrigidos erros de incompatibilidade entre o servidor e o cliente no momento da renderização (hydration mismatches).

- O `Intl.DateTimeFormat` no `NewsCard` passou a utilizar o `timeZone` fixado em `America/Sao_Paulo`.
- O método de ordenação no `NewsFeed` substituiu `localeCompare` por operadores lógicos simples, evitando discrepâncias entre os ambientes Node.js e Browser.

### Gerenciamento Seguro de Sessão via Middleware

O fluxo de encerramento de sessão, que anteriormente tentava alterar cookies diretamente de um Server Component gerando erros, foi refatorado.

- A limpeza do cookie `HttpOnly` de autenticação agora acontece de forma robusta e interceptada no Edge, através do arquivo `middleware.ts` (ou `proxy.ts`).
- Se uma chamada do backend retornar 401, o servidor redireciona o usuário para a página de login com a flag de expiração, e o middleware cuida do resto, prevenindo loops de redirecionamento.

### Correção no Export de Server Actions

- O arquivo `preferences.actions.ts`, que estava sendo bloqueado pelo build do Next.js por exportar um objeto de configuração, foi ajustado. Constantes foram movidas para os hooks e tipos correspondentes para respeitar a regra que exige que `"use server"` exporte apenas funções assíncronas.

### Tipagem Estrita e Linting

O backend e frontend passaram por uma revisão de formatação e tipagem.

- O módulo de autenticação no NestJS (`JwtAuthGuard` e `AuthModule`) não utiliza mais tipos `any` e os generics foram corretamente implementados.
- Todas as inconsistências de sintaxe, formatação de aspas e espaçamentos foram limpas nas duas aplicações através da aplicação do formatador padrão.

### Implementação do Dark Mode

- Adição do componente `ThemeToggle` integrado na navbar superior (`MainLayout`), dando suporte transparente aos temas "Light", "Dark" e "System" configurados pelo SO.

### Limpeza da Infraestrutura

- A pasta `docker/` do backend e arquivos desnecessários de ambiente foram removidos do histórico de versionamento de forma limpa e adicionados ao `.gitignore` protegendo chaves de API.
- O `docker-compose.yml` foi atualizado com checks aprimorados, acionando rotinas de migration e seed no ciclo de subida direto da imagem Node.

### Atualização da Documentação

- Os três arquivos `README.md` (frontend, backend e root) foram alinhados para refletir a nova estabilidade do projeto, as características do frontend (Middleware, Next.js Actions) e os padrões restritos de tipagem no backend.

## Commits deste PR

- `74c4c56` `style: apply automatic linting and formatting across frontend and backend`
- `72c24cf` `chore: remove unused backend docker configurations from git history and improve compose setup`
- `04248d2` `docs(root): update READMEs with recent fixes and architectural improvements`
- `18e7e01` `refactor(backend): enforce strict typing in authentication guards and modules`
- `bac9ee5` `fix(frontend): resolve invalid server action export in preferences`
- `789685f` `fix(frontend): handle secure cookie deletion via edge middleware`
- `79cc2a2` `feat(frontend): add dark mode support and theme toggle component`
- `35d9077` `fix(frontend): resolve Next.js hydration mismatches in news components`

## Arquivos alterados no PR

- Extensas modificações de formatação (linting) em `backend/src/` e `frontend/src/`
- `frontend/src/modules/news/components/news-card.tsx`
- `frontend/src/modules/news/components/news-feed.tsx`
- `frontend/src/app/(main)/layout.tsx`
- `frontend/src/shared/components/ui/theme-toggle.tsx`
- `frontend/src/modules/auth/services/auth.service.ts`
- `frontend/src/proxy.ts`
- `frontend/src/modules/preferences/services/preferences.actions.ts`
- `frontend/src/modules/preferences/hooks/use-preferences-form.ts`
- `backend/src/modules/auth/guards/jwt-auth.guard.ts`
- `backend/src/modules/auth/auth.module.ts`
- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `.gitignore`
- `README.md`
- `frontend/README.md`
- `backend/README.md`

## Resultado final deste PR

Ao final deste PR, o projeto passa a oferecer:

- Interface web estável sem falhas de hidratação na tela
- Autenticação e limpeza de sessão blindadas contra bugs de Server Components
- Tema dinâmico (Light/Dark mode)
- Backend e Frontend subindo de maneira limpa com Docker e `prisma:seed`
- Repositório livre de warnings de formatação e com tipagem adequadamente restrita
