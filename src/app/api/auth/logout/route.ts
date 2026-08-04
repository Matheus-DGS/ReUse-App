import { NextResponse } from "next/server";
import { nomeCookie } from "@/lib/auth";

export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(nomeCookie(), "", { path: "/", maxAge: 0 });
  return resposta;
}
