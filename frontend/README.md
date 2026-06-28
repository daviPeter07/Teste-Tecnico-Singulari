# Newsletter Inteligente - Frontend

SPA desenvolvida em Next.js para o desafio da Newsletter Inteligente.

O frontend cobre o núcleo essencial pedido no PDF:

- exibir notícias em uma interface web
- permitir filtro por período `day|week|month`
- consumir a API real do backend
- oferecer experiência responsiva para desktop e mobile

Além disso, também entrega bônus importantes:

- login e cadastro de usuários
- sessão autenticada com cookie `HttpOnly`
- tela protegida de preferências
- atualização de preferências do usuário
- prefetch no servidor para a listagem principal
- organização modular por domínio

## Stack

- Node.js 20+
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- TanStack React Query
- nuqs
- Zod
- Biome

## Decisões Técnicas

### Framework

Foi escolhido Next.js com App Router.

Motivos:

- permite combinar renderização no servidor com interatividade no cliente
- simplifica rotas públicas e protegidas no mesmo projeto
- encaixa bem com formulários, cookies e server actions

### Organização por módulos

Foi adotado um monolito modular no frontend.

Com isso:

- cada domínio mantém seus próprios `components`, `hooks`, `pages`, `queries`, `schemas`, `services` e `types`
- as regras de `auth`, `news` e `preferences` ficam desacopladas entre si
- os arquivos em `app/` permanecem finos, servindo apenas como pontos de entrada

### Comunicação com o backend

O frontend consome diretamente a API REST já exposta pelo backend.

Com isso:

- a home usa o endpoint público de notícias
- login, cadastro e preferências usam os endpoints autenticados reais
- o frontend apenas consome o `summary` já enriquecido pelo backend, sem duplicar a lógica de IA

### Sessão autenticada

Foi escolhido armazenar o token em cookie `HttpOnly`.

Com isso:

- o token não fica exposto em variáveis globais do navegador
- rotas protegidas podem ser validadas no servidor
- logout e recuperação de sessão ficam centralizados no módulo de autenticação

## Escopo Atual do Frontend

### Essencial entregue

- home com listagem de notícias
- cards com título, fonte, resumo e data
- filtro por período `Hoje`, `Semana` e `Mês`
- consumo do endpoint real `GET /news`

### Bônus já implementados

- tela de login
- tela de cadastro
- persistência de sessão autenticada em cookie
- redirecionamento de rotas públicas e protegidas
- tela de preferências do usuário
- atualização de preferências com feedback de loading, erro e sucesso

## Estrutura de Módulos

- `auth`: login, cadastro, sessão, logout e redirecionamentos
- `news`: listagem principal, filtros e consumo da consulta pública
- `preferences`: leitura e atualização das categorias do usuário autenticado

## Arquitetura de Diretórios

```text
src/
|-- app/
|   |-- (auth)/
|   |   |-- login/
|   |   `-- register/
|   |-- (main)/
|   |   `-- preferences/
|   |-- layout.tsx
|   `-- providers.tsx
|-- modules/
|   |-- auth/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- schemas/
|   |   |-- services/
|   |   `-- types/
|   |-- news/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- queries/
|   |   |-- services/
|   |   `-- types/
|   `-- preferences/
|       |-- components/
|       |-- hooks/
|       |-- pages/
|       |-- schemas/
|       |-- services/
|       `-- types/
`-- shared/
    |-- components/
    |   `-- ui/
    `-- lib/
        |-- http/
        `-- react-query/
```

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do frontend.

Variável principal:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Observações:

- apenas a URL pública da API deve ficar em `NEXT_PUBLIC_*`
- tokens e segredos não devem ser expostos no frontend

## Como Rodar Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o `.env.local`

Copie a variável acima apontando para a API do backend.

### 3. Rodar o frontend

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
```

## Fluxo Atual da Home

```text
Usuário acessa "/"
       |
       v
HomePage interpreta o período atual
       |
       v
Prefetch da consulta de notícias no servidor
       |
       v
NewsFeed assume interações no cliente
       |
       v
Usuário troca o período
       |
       v
Nova consulta é disparada para atualizar a lista
```

## Telas Atuais

### Públicas

- `/`
- `/login`
- `/register`

### Protegidas

- `/preferences`

## Integrações com o Backend

### Públicas

- `GET /news`
- `POST /users`
- `POST /login`

### Autenticadas

- `GET /me`
- `POST /logout`
- `GET /preferences`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`

## Observações Importantes

- o frontend está estruturado para consumir a autenticação e preferências já prontas no backend
- a IA não roda no frontend; ele apenas exibe os resumos gerados no backend
- a listagem principal já usa o filtro por período, mas a navegação explícita entre páginas ainda não foi implementada na interface
- a solução ainda não possui container próprio do frontend integrado ao compose principal do projeto
- o build de produção ainda depende do ajuste das fontes remotas usadas no layout global

## Observações Finais

- o frontend está funcional para home, autenticação e preferências
- a organização modular foi consolidada por camadas
- a próxima entrega mais evidente no frontend é paginação visível na home
- a próxima entrega mais evidente no projeto completo é containerizar também o frontend no fluxo principal
