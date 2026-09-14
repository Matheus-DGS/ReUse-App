"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { ehCategoria } from "@/lib/categorias";
import { ehTipoPonto } from "@/lib/pontos";

export type EstadoFormulario = {
  erro?: string;
  campos?: Record<string, string>;
};

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim();
}

export async function sugerirPonto(
  _anterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/login?redirecionar=/pontos/novo");

  const campos = {
    nome: texto(formData, "nome"),
    tipo: texto(formData, "tipo"),
    descricao: texto(formData, "descricao"),
    endereco: texto(formData, "endereco"),
    bairro: texto(formData, "bairro"),
    cidade: texto(formData, "cidade") || "São Paulo",
    horario: texto(formData, "horario"),
    telefone: texto(formData, "telefone"),
    latitude: texto(formData, "latitude"),
    longitude: texto(formData, "longitude"),
  };
  const materiais = formData.getAll("materiais").filter(ehCategoria);
  // Os campos voltam ao formulário em caso de erro (o React reinicia o <form> após a action)
  const falha = (erro: string): EstadoFormulario => ({
    erro,
    campos: { ...campos, materiais: materiais.join(",") },
  });

  if (campos.nome.length < 3) return falha("Dê um nome ao ponto (mínimo de 3 caracteres).");
  if (!ehTipoPonto(campos.tipo)) return falha("Escolha o tipo do ponto.");
  if (!campos.endereco || !campos.bairro) return falha("Informe endereço e bairro.");
  if (!campos.horario) return falha("Informe o horário de funcionamento.");
  if (materiais.length === 0) return falha("Marque ao menos um material aceito.");

  const latitude = Number(campos.latitude);
  const longitude = Number(campos.longitude);
  const coordenadasValidas =
    campos.latitude !== "" &&
    campos.longitude !== "" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;
  if (!coordenadasValidas) return falha("Marque a localização do ponto clicando no mapa.");

  const ponto = await prisma.pontoColeta.create({
    data: {
      nome: campos.nome,
      tipo: campos.tipo,
      descricao: campos.descricao || "Ponto sugerido pela comunidade ReUse!.",
      endereco: campos.endereco,
      bairro: campos.bairro,
      cidade: campos.cidade,
      horario: campos.horario,
      telefone: campos.telefone || null,
      latitude,
      longitude,
      materiais,
      verificado: false,
      criadoPorId: usuario.id,
    },
  });

  revalidatePath("/pontos");
  redirect(`/pontos/${ponto.id}?novo=1`);
}
