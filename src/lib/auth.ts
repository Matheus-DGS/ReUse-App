import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { COOKIE_SESSAO, lerSessao } from "./sessao";

/**
 * Lê o usuário autenticado a partir do cookie de sessão.
 * Retorna null caso não exista sessão válida.
 * `cache` evita consultas repetidas quando Header e página pedem o usuário na mesma requisição.
 */
export const usuarioAtual = cache(async () => {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  const sessao = await lerSessao(token);
  if (!sessao) return null;

  return prisma.usuario.findUnique({
    where: { id: sessao.userId },
    select: { id: true, nome: true, email: true, dataCadastro: true },
  });
});

/** Igual a usuarioAtual, mas redireciona para o login quando não há sessão. */
export async function exigirUsuario(destino: string) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect(`/login?redirecionar=${encodeURIComponent(destino)}`);
  return usuario;
}

/** "Ana Souza" -> "Ana S." — usado em rankings e atividades públicas. */
export function nomePublico(nome: string) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0]}.`;
}
