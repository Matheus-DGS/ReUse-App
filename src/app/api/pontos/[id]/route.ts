import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ponto = await prisma.pontoColeta.findUnique({
    where: { id },
    omit: { criadoPorId: true },
    include: { _count: { select: { descartes: true } } },
  });

  if (!ponto) return NextResponse.json({ erro: "Ponto de coleta não encontrado." }, { status: 404 });
  return NextResponse.json({ ponto });
}
