import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { ehCategoria } from "@/lib/categorias";

// GET /api/items?categoria=PLASTICO — lista materiais, com filtro opcional de categoria
export async function GET(req: NextRequest) {
  const categoria = req.nextUrl.searchParams.get("categoria");

  const itens = await prisma.item.findMany({
    where: ehCategoria(categoria) ? { categoria } : undefined,
    orderBy: { dataPublicacao: "desc" },
    include: { fotos: true },
  });

  return NextResponse.json({ itens });
}

// POST /api/items — cadastra um novo material (requer usuário autenticado)
export async function POST(req: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "É necessário estar autenticado." }, { status: 401 });
  }

  const { nomeItem, descricao, categoria, urlFoto } = await req.json().catch(() => ({}));

  if (!nomeItem || !descricao || !ehCategoria(categoria)) {
    return NextResponse.json({ erro: "Preencha nome, descrição e categoria." }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      nomeItem,
      descricao,
      categoria,
      usuarioId: usuario.id,
      fotos: urlFoto ? { create: [{ urlFoto, principal: true }] } : undefined,
    },
    include: { fotos: true },
  });

  return NextResponse.json({ item }, { status: 201 });
}
