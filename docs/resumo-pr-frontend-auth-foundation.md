# Resumo do PR `feature/frontend-auth-foundation`

Este PR implementa a base funcional do frontend da Newsletter Inteligente com autenticação, layouts principais, proteção de rotas, uma home pública inicial e infraestrutura compartilhada para integração com o backend NestJS.

## O que entrou neste PR

### Infraestrutura compartilhada

Foi criada a base de comunicação HTTP, React Query e providers globais da aplicação.

Arquivos principais:

- `frontend/src/shared/lib/http/api-client.ts`
- `frontend/src/shared/lib/http/api-error.ts`
- `frontend/src/shared/lib/react-query/query-client.ts`
- `frontend/src/shared/lib/react-query/query-provider.tsx`
- `frontend/src/app/providers.tsx`

O `providers.tsx` passou a configurar:

- `QueryClientProvider`
- `NuqsAdapter`
- `Toaster` do Sonner
- `ThemeProvider` com tema dark como padrão

O cliente HTTP usa `fetch` e trata os erros no formato real do backend (`statusCode`, `message`, `errorCode`, `details`, `path`).

### Estrutura de layouts com App Router

Foi criada a base dos layouts do App Router separando claramente a experiência pública/autenticada da experiência de autenticação.

Arquivos:

- `frontend/src/app/layout.tsx`
- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/app/(main)/layout.tsx`

Com isso:

- a rota raiz `/` passou a ser a base pública da home de notícias
- a rota `/login` passou a servir a autenticação
- o layout de autenticação virou um card centralizado reutilizável para login e cadastro
- o layout principal autenticado ficou preparado para crescer com notícias e preferências

### Módulo de autenticação

Foi criado o módulo `auth` seguindo a organização modular do projeto.

Arquivos principais:

- `frontend/src/modules/auth/actions/auth.actions.ts`
- `frontend/src/modules/auth/services/auth.service.ts`
- `frontend/src/modules/auth/schemas/auth.schema.ts`
- `frontend/src/modules/auth/types/auth.types.ts`
- `frontend/src/modules/auth/pages/login-page.tsx`
- `frontend/src/modules/auth/pages/register-page.tsx`
- `frontend/src/modules/auth/components/login-form.tsx`
- `frontend/src/modules/auth/components/register-form.tsx`
- `frontend/src/modules/auth/components/logout-button.tsx`
- `frontend/src/modules/auth/components/password-input.tsx`

Rotas criadas:

- `/` — home pública com base de filtros e listagem
- `/login` — login
- `/register` — cadastro
- `/preferences` — área protegida inicial

### Formulários com validação em tempo real

Os formulários de login e cadastro foram implementados com validação client-side e integração com Server Actions.

Tecnologias usadas:

- `react-hook-form`
- `@hookform/resolvers`
- `zod`
- `useActionState`

Também foi adicionado o componente do shadcn/ui para formulários:

- `frontend/src/shared/components/ui/form.tsx`

Com isso, os formulários passaram a oferecer:

- validação local com Zod
- exibição de erros por campo com `FormMessage`
- aproveitamento dos erros retornados pelas Server Actions no mesmo formulário
- estados de submissão com loading

### Sessão com cookie HttpOnly

O fluxo de autenticação foi implementado usando cookies seguros no servidor, sem armazenamento em `localStorage`, `sessionStorage` ou store global.

Comportamento:

- login e cadastro chamam o backend NestJS
- o token é salvo em cookie `HttpOnly` como cookie de sessão
- o logout remove o cookie e revoga a sessão no backend
- a leitura da sessão autenticada acontece no servidor

Arquivo central:

- `frontend/src/modules/auth/services/auth.service.ts`

### Proteção de rotas com Proxy

Foi criado o arquivo:

- `frontend/src/proxy.ts`

O Proxy realiza a checagem otimista pedida no escopo:

- usuário sem cookie acessando `/preferences` é redirecionado para `/login`
- usuário autenticado acessando rotas de auth é redirecionado para `/preferences`
- assets e arquivos internos do Next são ignorados pelo matcher

### Home pública inicial

Foi criada a primeira base da página principal pública, alinhada ao requisito essencial do PDF para o frontend.

Arquivo principal:

- `frontend/src/app/(main)/page.tsx`

Essa home ainda não consome `GET /news`, mas já entrega a estrutura inicial para:

- área principal da listagem pública
- filtros por período (`day`, `week`, `month`)
- navegação pública consistente

O objetivo deste PR foi preparar a base visual e de roteamento antes da integração com a API de notícias.

### Validação real da sessão no servidor

Além do Proxy, a validação real da sessão foi mantida próxima da página protegida.

Exemplo:

- `frontend/src/app/(main)/preferences/page.tsx`

Essa página consulta o backend via `GET /me` antes de renderizar a área autenticada. Se a sessão não for válida, o usuário é redirecionado.

### Ajustes visuais e experiência base

Este PR também refinou a base visual do frontend:

- tema dark como padrão
- paleta global laranja, preto e branco
- layout de autenticação com card centralizado
- componente `PasswordInput` com ação de mostrar/ocultar senha
- remoção de ruído visual e textos excessivamente técnicos nas telas de auth
- troca dos formulários para `react-hook-form` com componente `form` do shadcn/ui

Arquivos relevantes:

- `frontend/src/app/globals.css`
- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/modules/auth/components/password-input.tsx`

## Commits deste PR

Até o momento, os commits relacionados a este PR são:

- `6fc9aa8` `feat(auth): add auth pages and integrate forms`
- `b794a54` `refactor(auth): improve form components error handling and state sync`
- `57f1218` `feat(auth): add nextjs middleware proxy for protected routes`
- `38e64b8` `refactor(frontend): cleanup unused app files and organize layouts`
- `1616511` `style(auth): adjust password input layout and interactions`

## Arquivos alterados no PR

Principais arquivos do frontend envolvidos:

- `frontend/src/app/layout.tsx`
- `frontend/src/app/providers.tsx`
- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/register/page.tsx`
- `frontend/src/app/(main)/layout.tsx`
- `frontend/src/app/(main)/page.tsx`
- `frontend/src/app/(main)/preferences/page.tsx`
- `frontend/src/proxy.ts`
- `frontend/src/modules/auth/actions/auth.actions.ts`
- `frontend/src/modules/auth/services/auth.service.ts`
- `frontend/src/modules/auth/schemas/auth.schema.ts`
- `frontend/src/modules/auth/types/auth.types.ts`
- `frontend/src/modules/auth/components/login-form.tsx`
- `frontend/src/modules/auth/components/register-form.tsx`
- `frontend/src/modules/auth/components/logout-button.tsx`
- `frontend/src/modules/auth/components/password-input.tsx`
- `frontend/src/shared/components/ui/form.tsx`
- `frontend/src/shared/lib/http/api-client.ts`
- `frontend/src/shared/lib/http/api-error.ts`
- `frontend/src/shared/lib/react-query/query-client.ts`
- `frontend/src/shared/lib/react-query/query-provider.tsx`
- `frontend/src/app/globals.css`

## Resultado final deste PR

Ao final deste PR, o frontend passa a oferecer:

- base de autenticação funcional integrada ao backend NestJS
- sessão persistida em cookie `HttpOnly`
- layouts separados para auth e área principal
- home pública inicial em `/`
- rota `/login` para autenticação
- rota `/register` para cadastro
- rota `/preferences` protegida
- proteção otimista por Proxy e validação real de sessão no servidor
- formulários com `react-hook-form`, `zod` e componentes do shadcn/ui
- componente de senha com mostrar/ocultar
- infraestrutura inicial de React Query, Nuqs e Sonner pronta para os próximos PRs
