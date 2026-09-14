import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO, assinarSessao, opcoesCookie } from "@/lib/sessao";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const dados = await req.json().catch(() => ({}));
  const nome = String(dados.nome ?? "").trim();
  const email = String(dados.email ?? "").trim().toLowerCase();
  const senha = String(dados.senha ?? "");

  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Preencha nome, e-mail e senha." }, { status: 400 });
  }
  if (!EMAIL_VALIDO.test(email)) {
    return NextResponse.json({ erro: "Informe um e-mail válido." }, { status: 400 });
  }
  if (senha.length < 6) {
    return NextResponse.json({ erro: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ erro: "Já existe uma conta com este e-mail." }, { status: 409 });
  }

  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: await bcrypt.hash(senha, 10) },
  });

  const resposta = NextResponse.json(
    { usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } },
    { status: 201 }
  );
  resposta.cookies.set(COOKIE_SESSAO, await assinarSessao({ userId: usuario.id }), opcoesCookie);
  return resposta;
}
