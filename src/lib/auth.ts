import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-nao-use-em-producao";
const COOKIE_NAME = "reuse_session";

export type SessionPayload = {
  userId: string;
};

export function assinarSessao(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function lerSessao(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function nomeCookie() {
  return COOKIE_NAME;
}

/**
 * Lê o usuário autenticado a partir do cookie de sessão.
 * Retorna null caso não exista sessão válida.
 * Uso: em Server Components e Route Handlers (App Router).
 */
export async function usuarioAtual() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const sessao = lerSessao(token);
  if (!sessao) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.userId },
    select: { id: true, nome: true, email: true, dataCadastro: true },
  });

  return usuario;
}
