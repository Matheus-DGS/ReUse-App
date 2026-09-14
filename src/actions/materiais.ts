"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { ehCategoria } from "@/lib/categorias";
import type { EstadoFormulario } from "./pontos";

export async function cadastrarMaterial(
  _anterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/login?redirecionar=/materiais/novo");

  const campos = {
    nomeItem: String(formData.get("nomeItem") ?? "").trim(),
    descricao: String(formData.get("descricao") ?? "").trim(),
    categoria: String(formData.get("categoria") ?? ""),
    urlFoto: String(formData.get("urlFoto") ?? "").trim(),
  };
  const falha = (erro: string): EstadoFormulario => ({ erro, campos });

  if (campos.nomeItem.length < 3) return falha("O nome do material precisa ter ao menos 3 caracteres.");
  if (campos.descricao.length < 10) return falha("Descreva o material e como descartá-lo (mínimo de 10 caracteres).");
  if (!ehCategoria(campos.categoria)) return falha("Escolha uma categoria.");
  if (campos.urlFoto && !/^https:\/\/\S+$/i.test(campos.urlFoto)) {
    return falha("A foto deve ser um link começando com https://");
  }

  const item = await prisma.item.create({
    data: {
      nomeItem: campos.nomeItem,
      descricao: campos.descricao,
      categoria: campos.categoria,
      usuarioId: usuario.id,
      fotos: campos.urlFoto ? { create: [{ urlFoto: campos.urlFoto, principal: true }] } : undefined,
    },
  });

  revalidatePath("/materiais");
  redirect(`/materiais/${item.id}`);
}
