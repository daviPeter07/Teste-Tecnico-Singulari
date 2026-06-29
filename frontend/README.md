# Newsletter Inteligente - Frontend

SPA em Next.js para a interface da newsletter.

O frontend cobre o essencial do desafio:

- mostrar noticias em uma interface web
- filtrar por periodo
- paginar a listagem
- consumir o backend real
- funcionar bem no desktop e no mobile

Tambem cobre bonus relevantes:

- login e cadastro
- sessao autenticada com cookie `HttpOnly`
- tela protegida de preferencias
- edicao de preferencias do usuario
- organizacao modular por dominio e camada

## Stack

- Node.js 20+
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- TanStack Query
- nuqs
- Zod
- Biome

## Organizacao

Foi adotada uma estrutura modular por dominio.

- `auth`: login, cadastro, sessao e logout
- `news`: listagem, filtros, paginacao e leitura de noticias
- `preferences`: leitura e atualizacao das preferencias do usuario

Cada modulo concentra seus proprios `components`, `hooks`, `pages`, `queries`, `schemas`, `services` e `types`.

## Estrutura

```text
src/
|-- app/
|-- modules/
|   |-- auth/
|   |-- news/
|   `-- preferences/
`-- shared/
    |-- components/
    `-- lib/
```

## Ambiente

O frontend usa um caminho simples:

- `NEXT_PUBLIC_API_URL` recebe a URL publica se voce quiser informar manualmente
- se ela nao existir, o app usa `/api`

No modo com Docker, o `/api` e redirecionado pelo Next para o backend via `BACKEND_INTERNAL_URL`.

Exemplo:

```env
NEXT_PUBLIC_API_URL="/api"
BACKEND_INTERNAL_URL="http://localhost:3333"
```

Arquivos de exemplo:

- `frontend/.env.example`
- `.env.example`

## Como rodar

### Local

```bash
pnpm install
pnpm dev
```

### Docker so do frontend

Esse compose sobe apenas o frontend. O backend deve ja estar rodando fora dele.

```bash
docker compose -f frontend/docker-compose.yml up --build
```

Por padrao ele tenta acessar o backend em `http://host.docker.internal:3333`.

### Docker do projeto completo

```bash
docker compose up --build
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm format
```

## Rotas

Publicas:

- `/`
- `/login`
- `/register`

Protegidas:

- `/preferences`

## Integracoes

Publicas:

- `GET /news`
- `POST /users`
- `POST /login`

Autenticadas:

- `GET /me`
- `POST /logout`
- `GET /preferences`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`

## Observacoes

- a IA nao roda no frontend; ele apenas mostra os dados ja preparados no backend
- o compose da raiz sobe o projeto completo
- o compose em `frontend/` existe para rodar a interface isoladamente
