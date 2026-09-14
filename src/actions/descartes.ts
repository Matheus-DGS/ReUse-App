"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { ehCategoria, infoCategoria } from "@/lib/categorias";
import {
  BONUS_MISSAO,
  BONUS_NOVO_PONTO_VISITADO,
  CONQUISTAS,
  LIMITE_DESCARTES_DIA,
  PONTOS_POR_CATEGORIA,
  QUANTIDADE_MAXIMA,
  conquistasAtingidas,
  inicioDoDiaSP,
  missaoDoDia,
} from "@/lib/gamificacao";
import { estatisticasDoUsuario } from "@/services/impacto";

export type ResultadoDescarte =
  | { status: "ocioso" }
  | { status: "erro"; mensagem: string }
  | {
      status: "sucesso";
      id: string;
      categoria: string;
      pontosGanhos: number;
      bonus: { rotulo: string; pontos: number }[];
      totalPontos: number;
      nivelAntes: string;
      nivelDepois: string;
      subiuDeNivel: boolean;
      progresso: number;
      faltam: number;
      proximoNivel: string | null;
      novasConquistas: { titulo: string; simbolo: string }[];
    };

export async function registrarDescarte(
  _anterior: ResultadoDescarte,
  formData: FormData
): Promise<ResultadoDescarte> {
  const usuario = await usuarioAtual();
  if (!usuario) return { status: "erro", mensagem: "Entre na sua conta para registrar descartes." };

  const pontoId = String(formData.get("pontoId") ?? "");
  const categoria = formData.get("categoria");
  const quantidade = Number(formData.get("quantidade") ?? 1);

  if (!ehCategoria(categoria)) return { status: "erro", mensagem: "Escolha o material descartado." };
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > QUANTIDADE_MAXIMA) {
    return { status: "erro", mensagem: `Informe entre 1 e ${QUANTIDADE_MAXIMA} volumes.` };
  }

  const ponto = await prisma.pontoColeta.findUnique({
    where: { id: pontoId },
    select: { id: true, materiais: true },
  });
  if (!ponto) return { status: "erro", mensagem: "Ponto de coleta não encontrado." };
  if (!ponto.materiais.includes(categoria)) {
    return {
      status: "erro",
      mensagem: `Este ponto não recebe ${infoCategoria(categoria).label.toLowerCase()}. Procure outro ponto no mapa.`,
    };
  }

  const hoje = inicioDoDiaSP();
  const [descartesHoje, jaVisitou] = await Promise.all([
    prisma.descarte.findMany({
      where: { usuarioId: usuario.id, data: { gte: hoje } },
      select: { categoria: true },
    }),
    prisma.descarte.findFirst({ where: { usuarioId: usuario.id, pontoId: ponto.id }, select: { id: true } }),
  ]);

  // Regra anti-abuso: limite diário de registros
  if (descartesHoje.length >= LIMITE_DESCARTES_DIA) {
    return {
      status: "erro",
      mensagem: `Você já registrou ${LIMITE_DESCARTES_DIA} descartes hoje. Volte amanhã para somar mais EcoPontos!`,
    };
  }

  const antes = await estatisticasDoUsuario(usuario.id);

  const bonus: { rotulo: string; pontos: number }[] = [];
  const missao = missaoDoDia();
  const missaoJaCumprida = descartesHoje.some((d) => d.categoria === missao.categoria);
  if (categoria === missao.categoria && !missaoJaCumprida) {
    bonus.push({ rotulo: "Missão do dia", pontos: BONUS_MISSAO });
  }
  if (!jaVisitou) bonus.push({ rotulo: "Novo ponto visitado", pontos: BONUS_NOVO_PONTO_VISITADO });

  const base = PONTOS_POR_CATEGORIA[categoria] * quantidade;
  const pontosGanhos = base + bonus.reduce((s, b) => s + b.pontos, 0);

  const descarte = await prisma.descarte.create({
    data: { usuarioId: usuario.id, pontoId: ponto.id, categoria, quantidade, pontos: pontosGanhos },
  });

  const depois = await estatisticasDoUsuario(usuario.id);
  const conquistasAntes = new Set(conquistasAtingidas(antes.estatisticas));
  const novasConquistas = CONQUISTAS.filter(
    (c) => c.atingiu(depois.estatisticas) && !conquistasAntes.has(c.id)
  ).map((c) => ({ titulo: c.titulo, simbolo: c.simbolo }));

  revalidatePath(`/pontos/${ponto.id}`);
  revalidatePath("/perfil");
  revalidatePath("/ranking");

  return {
    status: "sucesso",
    id: descarte.id,
    categoria,
    pontosGanhos,
    bonus,
    totalPontos: depois.estatisticas.totalPontos,
    nivelAntes: antes.nivel.nome,
    nivelDepois: depois.nivel.nome,
    subiuDeNivel: depois.nivel.numero > antes.nivel.numero,
    progresso: depois.nivel.progresso,
    faltam: depois.nivel.faltam,
    proximoNivel: depois.nivel.proximo?.nome ?? null,
    novasConquistas,
  };
}
