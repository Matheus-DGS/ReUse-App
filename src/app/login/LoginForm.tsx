"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const resposta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    setCarregando(false);

    if (!resposta.ok) {
      const dados = await resposta.json().catch(() => ({}));
      setErro(dados.erro || "Não foi possível entrar. Verifique seus dados.");
      return;
    }

    const destino = searchParams.get("redirecionar") || "/";
    router.push(destino);
    router.refresh();
  }

  return (
    <form onSubmit={aoEnviar}>
      {erro && <div className="erro">{erro}</div>}

      <div className="campo">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
        />
      </div>

      <div className="campo">
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" className="btn btn-primario" style={{ width: "100%" }} disabled={carregando}>
        {carregando ? "Entrando..." : "Entrar"}
      </button>

      <p style={{ fontSize: 14, color: "var(--tinta-suave)", marginTop: 18, textAlign: "center" }}>
        Ainda não tem conta? <Link href="/cadastro" style={{ color: "var(--acento)", fontWeight: 600 }}>Criar conta</Link>
      </p>
    </form>
  );
}
