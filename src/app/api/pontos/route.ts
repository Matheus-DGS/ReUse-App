import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ehCategoria } from "@/lib/categorias";
import { ehTipoPonto } from "@/lib/pontos";
import { distanciaKm } from "@/lib/geo";

// GET /api/pontos?material=VIDRO&tipo=ECOPONTO&lat=-23.56&lng=-46.65
// API pública de pontos de coleta — pode ser consumida pelo app mobile do ReUse!.
// Quando lat/lng são enviados, a lista volta ordenada pela distância (em km).
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const material = params.get("material");
  const tipo = params.get("tipo");
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const temLocalizacao =
    params.has("lat") && params.has("lng") && Number.isFinite(lat) && Number.isFinite(lng);

  const pontos = await prisma.pontoColeta.findMany({
    where: {
      ...(ehCategoria(material) ? { materiais: { has: material } } : {}),
      ...(ehTipoPonto(tipo) ? { tipo } : {}),
    },
    orderBy: { nome: "asc" },
    omit: { criadoPorId: true },
  });

  const resultado = pontos.map((p) => ({
    ...p,
    distanciaKm: temLocalizacao
      ? Number(distanciaKm({ latitude: lat, longitude: lng }, p).toFixed(2))
      : null,
  }));

  if (temLocalizacao) resultado.sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0));

  return NextResponse.json({ total: resultado.length, pontos: resultado });
}
