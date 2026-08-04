"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CadastroForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);

    const resposta = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    setCarregando(false);

    if (!resposta.ok) {
      const dados = await resposta.json().catch(() => ({}));
      setErro(dados.erro || "Não foi possível criar sua conta.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={aoEnviar}>
      {erro && <div className="erro">{erro}</div>}

      <div className="campo">
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome completo"
        />
      </div>

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
          minLength={6}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <button type="submit" className="btn btn-primario" style={{ width: "100%" }} disabled={carregando}>
        {carregando ? "Criando conta..." : "Criar conta"}
      </button>

      <p style={{ fontSize: 14, color: "var(--tinta-suave)", marginTop: 18, textAlign: "center" }}>
        Já tem conta? <Link href="/login" style={{ color: "var(--acento)", fontWeight: 600 }}>Entrar</Link>
      </p>
    </form>
  );
}
