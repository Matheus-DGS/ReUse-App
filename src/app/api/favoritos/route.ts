import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";

const naoAutenticado = () =>
  NextResponse.json({ erro: "É necessário estar autenticado." }, { status: 401 });

// GET /api/favoritos — lista os favoritos do usuário autenticado
export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario) return naoAutenticado();

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
  if (!usuario) return naoAutenticado();

  const { itemId } = await req.json().catch(() => ({}));
  if (!itemId) return NextResponse.json({ erro: "Informe o material a favoritar." }, { status: 400 });

  const item = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true } });
  if (!item) return NextResponse.json({ erro: "Material não encontrado." }, { status: 404 });

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
  if (!usuario) return naoAutenticado();

  const { itemId } = await req.json().catch(() => ({}));
  if (!itemId) return NextResponse.json({ erro: "Informe o material a remover." }, { status: 400 });

  await prisma.favorito.deleteMany({ where: { usuarioId: usuario.id, itemId } });
  return NextResponse.json({ ok: true });
}
