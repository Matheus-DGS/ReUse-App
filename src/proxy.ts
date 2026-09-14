import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";

// Proxy (antigo middleware) do Next.js: barra o acesso a rotas privadas antes mesmo de
// renderizar a página, redirecionando para o login com o destino original.
export async function proxy(request: NextRequest) {
  const sessao = await lerSessao(request.cookies.get(COOKIE_SESSAO)?.value);
  if (sessao) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?redirecionar=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/perfil", "/favoritos", "/pontos/novo", "/materiais/novo"],
};
