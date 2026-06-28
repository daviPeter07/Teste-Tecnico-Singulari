# Newsletter Inteligente - Frontend

Frontend da plataforma de curadoria de notícias, desenvolvido com Next.js e organizado como um monolito modular.

O projeto consome a API REST responsável por autenticação, notícias, categorias e preferências do usuário. A aplicação combina renderização no servidor com interatividade no cliente para entregar um carregamento inicial rápido e uma navegação fluida.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- TanStack React Query
- nuqs
- Zod
- Lucide React
- Biome

## Arquitetura

O frontend segue uma arquitetura de monolito modular. Cada módulo concentra as regras, componentes e integrações pertencentes ao seu domínio.

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   └── preferences/
│   ├── layout.tsx
│   └── providers.tsx
├── modules/
│   ├── auth/
│   │   ├── actions/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── types/
│   ├── news/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── queries/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── types/
│   └── preferences/
│       ├── components/
│       ├── pages/
│       ├── queries/
│       ├── schemas/
│       ├── services/
│       └── types/
└── shared/
    ├── components/
    │   ├── layout/
    │   └── ui/
    ├── hooks/
    ├── lib/
    │   ├── http/
    │   └── react-query/
    └── types/
```

### `app`

Contém as rotas, layouts e pontos de entrada do App Router. Os arquivos `page.tsx` permanecem pequenos e delegam a construção das telas para os respectivos módulos.

### `modules`

Contém os domínios da aplicação:

- `auth`: login, cadastro, sessão e logout.
- `news`: listagem, filtros por período e paginação de notícias.
- `preferences`: consulta e atualização das categorias preferidas pelo usuário.

### `shared`

Contém apenas recursos reutilizáveis entre diferentes módulos:

- Componentes do shadcn/ui.
- Layouts compartilhados.
- Cliente HTTP.
- Configuração do React Query.
- Hooks, tipos e utilitários genéricos.

Services que conhecem regras ou endpoints de um domínio permanecem dentro do próprio módulo.

## Gerenciamento de dados

Cada tipo de estado possui uma responsabilidade definida:

- React Query gerencia dados remotos, cache, paginação e mutations.
- nuqs mantém filtros e paginação sincronizados com a URL.
- Zod valida formulários, parâmetros e contratos recebidos da API.
- Estado local do React controla interações específicas de componentes.
- A sessão de autenticação deve ser armazenada em cookie `HttpOnly`.

Zustand não faz parte da configuração inicial. Ele somente deverá ser adicionado caso apareça um estado global de cliente que não pertença à API, à URL ou a um componente específico.

## SSR e hidratação

As rotas são Server Components por padrão. Nas páginas que utilizam React Query, o fluxo planejado é:

1. O `page.tsx` interpreta os parâmetros da URL.
2. O servidor executa o prefetch da query.
3. O HTML é renderizado com os dados iniciais.
4. O cache é enviado ao cliente com `HydrationBoundary`.
5. O React Query assume as atualizações posteriores no navegador.

Essa estratégia evita uma nova requisição imediata após a hidratação e preserva a interatividade no cliente.

## Configuração

Crie um arquivo `.env.local` na raiz do frontend:

```env
NEXT_PUBLIC_API_URL=<URL_DA_API>
```

Não adicione tokens, senhas ou chaves privadas em variáveis iniciadas com `NEXT_PUBLIC_`, pois elas ficam disponíveis no navegador.

## Executando o projeto

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

O endereço utilizado pelo Next.js será exibido no terminal.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
```

| Script | Descrição |
| --- | --- |
| `dev` | Inicia o servidor de desenvolvimento |
| `build` | Gera o build de produção |
| `start` | Executa o build de produção |
| `lint` | Analisa o código com Biome |
| `format` | Formata os arquivos com Biome |

## Padrões do projeto

- Componentes reutilizáveis utilizam funções nomeadas.
- Componentes que representam páginas utilizam exportação padrão.
- Chamadas HTTP são centralizadas nos services dos módulos.
- Componentes do shadcn/ui ficam em `src/shared/components/ui`.
- Tipos derivados de schemas devem utilizar `z.infer` para evitar duplicação.
- Server Components são mantidos como padrão.
- A diretiva `"use client"` é adicionada somente quando há estado, eventos ou APIs do navegador.

## Status

A estrutura-base e as ferramentas do frontend estão configuradas. As telas e integrações com a API serão implementadas de forma incremental por domínio.
