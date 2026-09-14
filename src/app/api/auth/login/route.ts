import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO, assinarSessao, opcoesCookie } from "@/lib/sessao";

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json().catch(() => ({}));

  if (!email || !senha) {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });
  const senhaValida = usuario ? await bcrypt.compare(String(senha), usuario.senha) : false;

  if (!usuario || !senhaValida) {
    return NextResponse.json({ erro: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const resposta = NextResponse.json({
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
  resposta.cookies.set(COOKIE_SESSAO, await assinarSessao({ userId: usuario.id }), opcoesCookie);
  return resposta;
}
