# ReUse! — Plataforma Web

Versão web do projeto **ReUse!**, desenvolvida em **Next.js (App Router) + TypeScript**, com
persistência em **PostgreSQL** através do **Prisma ORM**. A proposta desta fase não é repetir o
aplicativo mobile, e sim oferecer uma segunda via de acesso pelo navegador, com o essencial da
plataforma: um catálogo de materiais recicláveis, cadastro/login de usuários e uma lista de
favoritos.

## Telas desenvolvidas

| Rota | Objetivo |
| --- | --- |
| `/` | Landing page — apresenta a proposta do ReUse! e destaca os materiais mais recentes do catálogo. |
| `/materiais` | Catálogo completo de materiais recicláveis, com filtro por categoria (Papel, Plástico, Vidro, Metal, Orgânico, Eletrônico). |
| `/materiais/[id]` | Detalhe de um material: foto, descrição, autor do cadastro e botão de favoritar. |
| `/login` | Autenticação do usuário (e-mail e senha). |
| `/cadastro` | Criação de conta. |
| `/favoritos` | Lista dos materiais favoritados pelo usuário autenticado (rota protegida). |

## Modelo de dados (Prisma)

O schema (`prisma/schema.prisma`) reaproveita e evolui as entidades definidas na Atividade 01
(PBL — Modelagem de Dados):

- **Usuario** — dados de conta (nome, e-mail, senha com hash, data de cadastro).
- **Item** — material reciclável cadastrado (nome, descrição, categoria, autor).
- **FotoItem** — fotos associadas a um item, com flag de foto principal.
- **Favorito** — relação N:N entre `Usuario` e `Item`, com restrição de unicidade
  (`@@unique([usuarioId, itemId])`) para impedir duplicidade de favoritos.

## Como rodar localmente

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Configure o banco de dados**
   Copie `.env.example` para `.env` e informe a `DATABASE_URL` de um banco Postgres (local ou em
   nuvem, ex: Neon, Supabase, Railway) e um `JWT_SECRET`.

3. **Rode as migrations do Prisma**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **(Opcional) Popule o banco com dados de exemplo**
   ```bash
   npm run prisma:seed
   ```

5. **Suba o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse http://localhost:3000

## Estrutura do projeto

```
src/
  app/            → rotas (páginas e API routes) no padrão App Router
  components/     → componentes reutilizáveis (Header, ItemCard, FavoriteButton...)
  lib/            → prisma.ts (client singleton) e auth.ts (sessão via JWT em cookie)
prisma/
  schema.prisma   → modelo de dados
  seed.ts         → dados de exemplo
```
