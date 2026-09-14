import { NextResponse } from "next/server";
import { usuarioAtual } from "@/lib/auth";

export async function GET() {
  const usuario = await usuarioAtual();
  return NextResponse.json({ usuario });
}
