import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: { fotos: true, usuario: { select: { nome: true } } },
  });

  if (!item) return NextResponse.json({ erro: "Material não encontrado." }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "É necessário estar autenticado." }, { status: 401 });
  }

  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ erro: "Material não encontrado." }, { status: 404 });
  if (item.usuarioId !== usuario.id) {
    return NextResponse.json({ erro: "Você não tem permissão para remover este material." }, { status: 403 });
  }

  await prisma.item.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
