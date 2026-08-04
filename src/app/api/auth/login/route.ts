import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assinarSessao, nomeCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json();

  if (!email || !senha) {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    return NextResponse.json({ erro: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    return NextResponse.json({ erro: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const token = assinarSessao({ userId: usuario.id });

  const resposta = NextResponse.json({
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });

  resposta.cookies.set(nomeCookie(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return resposta;
}
