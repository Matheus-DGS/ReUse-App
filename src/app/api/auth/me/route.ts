import { NextResponse } from "next/server";
import { usuarioAtual } from "@/lib/auth";

export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ usuario: null }, { status: 200 });
  return NextResponse.json({ usuario });
}
