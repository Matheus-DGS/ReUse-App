import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
    include: { fotos: true, usuario: { select: { nome: true } } },
  });

  if (!item) return NextResponse.json({ erro: "Material não encontrado." }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "É necessário estar autenticado." }, { status: 401 });
  }

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ erro: "Material não encontrado." }, { status: 404 });
  if (item.usuarioId !== usuario.id) {
    return NextResponse.json({ erro: "Você não tem permissão para remover este material." }, { status: 403 });
  }

  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
