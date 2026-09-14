import { SignJWT, jwtVerify } from "jose";

// Módulo sem dependência do Prisma: pode ser usado tanto no proxy (proteção de rotas)
// quanto em Server Components e Route Handlers.

export const COOKIE_SESSAO = "reuse_session";
export const DURACAO_SESSAO = 60 * 60 * 24 * 7; // 7 dias

export type SessionPayload = { userId: string };

function chave() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-nao-use-em-producao");
}

export async function assinarSessao(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SESSAO}s`)
    .sign(chave());
}

export async function lerSessao(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave());
    return typeof payload.userId === "string" ? { userId: payload.userId } : null;
  } catch {
    return null;
  }
}

export const opcoesCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: DURACAO_SESSAO,
};
