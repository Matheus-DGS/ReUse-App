import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assinarSessao, nomeCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { nome, email, senha } = await req.json();

  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Preencha nome, e-mail e senha." }, { status: 400 });
  }

  if (String(senha).length < 6) {
    return NextResponse.json({ erro: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ erro: "Já existe uma conta com este e-mail." }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: senhaHash },
  });

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
