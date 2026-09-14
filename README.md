# ReUse! — Descarte Consciente

Área da plataforma **ReUse!** desenvolvida em **Next.js 16 (App Router) + TypeScript**, com **Prisma ORM**
e **PostgreSQL**. Ela conecta quem quer descartar corretamente aos **pontos de coleta** da cidade e
transforma cada descarte em **EcoPontos, níveis, conquistas e ranking**. O catálogo de materiais, as
contas e os favoritos das fases anteriores continuam aqui, integrados à nova área.

> Conta de demonstração: `equipe@reuse.app` / `reuse123`

## Área desenvolvida: Descarte Consciente

Desde a primeira fase, o ReUse! prometia *"ajudar os usuários a encontrar centros de reciclagem
próximos"*. Essa promessa ficou de fora até agora. Nesta etapa ela virou uma área completa:

| Rota | O que faz |
| --- | --- |
| `/pontos` | Mapa interativo (Leaflet + OpenStreetMap) com lista sincronizada. Filtros por material, tipo e texto, **"Perto de mim"** (geolocalização do navegador) com ordenação por distância e destaque do ponto mais próximo. Os filtros ficam na URL, então o link pode ser compartilhado. |
| `/pontos/[id]` | Detalhe do ponto: materiais aceitos com dicas de preparo, horário, rota no Google Maps, atividade da comunidade e **registro de descarte** com celebração animada. |
| `/pontos/novo` | Sugestão colaborativa de ponto: o usuário marca a posição clicando no mapa (ou usa o GPS). O ponto entra com o selo "Comunidade". |
| `/perfil` | **Meu impacto**: nível com barra de progresso, EcoPontos, volumes por material, trilha de níveis, conquistas e histórico. |
| `/ranking` | Ranking geral e do mês, com pódio. |
| `/api/pontos` | API pública em JSON (filtros `material`, `tipo`, `lat`/`lng`), pronta para o app mobile consumir. |

### Gamificação (do "Plano de Animações e Gamificação")

- **EcoPontos** por volume descartado, com peso por material. Eletrônicos valem mais porque são os resíduos mais perigosos.
- **Missão do dia**: a cada dia uma categoria diferente vale +20 de bônus.
- **Bônus de exploração** (+10) no primeiro descarte em cada ponto.
- **5 níveis** (Semente → Broto → Muda → Árvore → Floresta) com barra animada.
- **9 conquistas** calculadas a partir do comportamento do usuário.
- **Anti-abuso**: no máximo 5 registros por dia, e o ponto precisa aceitar o material informado.
- Animações dos keyframes do plano: entrada com fade e deslocamento, cards em sequência, *press* nos botões, conquista com escala e rotação, e transição horizontal entre telas (`template.tsx`). Todas respeitam `prefers-reduced-motion`.

### Integração com as áreas anteriores

- A página de cada material mostra **"Onde descartar"** e aponta para o mapa já filtrado.
- O catálogo mostra a dica de preparo da categoria e leva aos pontos que a aceitam.
- Cadastrar material (`/materiais/novo`, nova tela que usa uma funcionalidade antes só disponível na API) também rende EcoPontos.

## Recursos do Next.js utilizados

- **App Router** com Server Components buscando dados direto pelo Prisma.
- **Server Actions** + `useActionState` (registrar descarte, sugerir ponto, cadastrar material) com `revalidatePath`.
- **Route Handlers** (`app/api/*`) para autenticação, favoritos, itens e pontos.
- **Proxy** (`src/proxy.ts`, antigo middleware) protegendo `/perfil`, `/favoritos`, `/pontos/novo` e `/materiais/novo`.
- **Route Group** `(auth)` para login e cadastro, sem afetar a URL.
- **Rotas dinâmicas** com `generateMetadata` para SEO por ponto e por material.
- `loading.tsx` (esqueleto), `error.tsx`, `not-found.tsx` e `template.tsx` (transição de tela).
- `next/dynamic` com `ssr: false` para o Leaflet, `next/font` e `next/image`.

## Estrutura de pastas

```
src/
  app/                 → rotas (App Router)
    (auth)/            → login e cadastro (route group)
    api/               → Route Handlers REST
    pontos/            → área Descarte Consciente (lista/mapa, [id], novo)
    perfil/ ranking/   → gamificação
    materiais/ favoritos/
  actions/             → Server Actions (descartes, pontos, materiais)
  services/            → consultas de impacto e ranking (Prisma)
  components/
    layout/            → Header, NavLinks (menu mobile), Footer
    pontos/            → mapa, explorador, seletor de localização
    gamificacao/       → missão do dia, barra de nível, registro de descarte
    materiais/         → ItemCard, FavoriteButton, formulário
  lib/                 → prisma, sessão (JWT/jose), auth, regras de gamificação, geo, categorias
  proxy.ts             → proteção de rotas
prisma/
  schema.prisma        → Usuario, Item, FotoItem, Favorito, PontoColeta, Descarte
  migrations/          → histórico de migrations
  seed.ts              → dados de demonstração (idempotente)
```

## Modelo de dados

Evolução do PBL de Modelagem de Dados. As entidades originais **Usuario**, **Item**, **FotoItem** e
**Favorito** continuam, e duas foram adicionadas:

- **PontoColeta**: nome, tipo (Ecoponto, PEV, Cooperativa, Parceiro), endereço, coordenadas, horário, lista de materiais aceitos (`Categoria[]`), selo de verificado e o usuário que sugeriu o ponto.
- **Descarte**: usuário, ponto, categoria, quantidade de volumes, EcoPontos ganhos e data. É a base da gamificação.

## Como rodar localmente

```bash
npm install
cp .env.example .env        # configure DATABASE_URL, DATABASE_URL_UNPOOLED e JWT_SECRET
npx prisma migrate deploy   # cria as tabelas
npx prisma db seed          # dados de demonstração
npm run dev                 # http://localhost:3000
```

## Deploy na Vercel + Neon (gratuito)

1. Publique este repositório no GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. Em **Storage**, crie um banco **Neon (Postgres)** e conecte ao projeto. A integração cria `DATABASE_URL` e `DATABASE_URL_UNPOOLED` automaticamente.
4. Em **Settings → Environment Variables**, adicione `JWT_SECRET` com uma string longa e aleatória.
5. Faça o deploy. O script `vercel-build` roda `prisma migrate deploy`, depois o seed (idempotente) e por fim `next build`, então o site já sobe com as tabelas e os dados de demonstração.

> Os pontos de coleta pré-cadastrados são **dados de demonstração** do projeto acadêmico.
