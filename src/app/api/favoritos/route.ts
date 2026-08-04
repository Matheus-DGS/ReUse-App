import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";

// GET /api/favoritos — lista os favoritos do usuário autenticado
export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "É necessário estar autenticado." }, { status: 401 });
  }

  const favoritos = await prisma.favorito.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { dataFavorito: "desc" },
    include: { item: { include: { fotos: true } } },
  });

  return NextResponse.json({ favoritos });
}

// POST /api/favoritos { itemId } — favorita um material
export async function POST(req: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "É necessário estar autenticado." }, { status: 401 });
  }

  const { itemId } = await req.json();
  if (!itemId) return NextResponse.json({ erro: "Informe o material a favoritar." }, { status: 400 });

  const favorito = await prisma.favorito.upsert({
    where: { usuarioId_itemId: { usuarioId: usuario.id, itemId } },
    update: {},
    create: { usuarioId: usuario.id, itemId },
  });

  return NextResponse.json({ favorito }, { status: 201 });
}

// DELETE /api/favoritos { itemId } — remove um favorito
export async function DELETE(req: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "É necessário estar autenticado." }, { status: 401 });
  }

  const { itemId } = await req.json();
  if (!itemId) return NextResponse.json({ erro: "Informe o material a remover." }, { status: 400 });

  await prisma.favorito
    .delete({ where: { usuarioId_itemId: { usuarioId: usuario.id, itemId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
